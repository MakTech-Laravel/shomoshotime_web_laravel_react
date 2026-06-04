import {
  extractBearerTokenFromLoginBody,
  extractRefreshTokenFromLoginBody,
  extractUserFromAuthPayload,
  mapApiUserRecord,
  unwrapLaravelData,
} from '@/api/laravelResponse'
import { request } from '@/api/request'
import { type AuthContextValue } from '@/auth/context'
import { getFcmToken } from '@/auth/deviceContext'
import {
  clearPasswordResetSession,
  getPasswordResetEmail,
  getPasswordResetToken,
  setPasswordResetSession,
} from '@/auth/passwordResetSession'
import { setAccessToken, setRefreshToken, setStoredAuthUser } from '@/auth/token'
import { type AuthUser } from '@/auth/types'
import { resolveAuthEndpoints } from '@/config/authEndpoints'
import { USER_HOME_PATH } from '@/features/auth/paths'
import {
  type LoginPayload,
  type PasswordResetOtpPayload,
  type RegisterPayload,
  type VerifyOtpPayload,
} from '@/features/auth/types'

const endpoints = resolveAuthEndpoints()

type AuthHandlers = Pick<
  AuthContextValue,
  'authStrategy' | 'setToken' | 'setUser' | 'refreshSession' | 'resetAuthState'
>

function pickOtpValue(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const direct = [record.otp, record.code, record.verification_code].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )
  if (direct) return direct

  const nestedData = record.data
  if (nestedData && typeof nestedData === 'object') {
    const nestedRecord = nestedData as Record<string, unknown>
    const nested = [nestedRecord.otp, nestedRecord.code, nestedRecord.verification_code].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    )
    if (nested) return nested
  }

  return null
}

function logOtpFromResponse(data: unknown, context: string) {
  if (import.meta.env.DEV) {
    console.log(`[auth] ${context} raw response:`, data)
  }
  const otp = pickOtpValue(data)
  if (!otp) return
  console.log(`[auth] ${context} OTP:`, otp)
}

function isEmailVerifiedFromLoginBody(body: unknown): boolean {
  const data = unwrapLaravelData<Record<string, unknown>>(body)
  if (!data) return false
  const otp = data.otp
  return otp === 'Verified' || otp === 'verified'
}

function isAdminAccount(user: AuthUser | null): boolean {
  if (!user) return false
  return user.is_admin === true || user.is_admin === 1
}

async function hydrateSessionFromLoginBody(
  body: unknown,
  handlers: AuthHandlers,
  missingCookieMessage: string,
  missingTokenMessage: string,
) {
  const loggedInUser = extractUserFromAuthPayload(body)

  if (handlers.authStrategy === 'http_only_cookie') {
    const currentUser = await handlers.refreshSession()
    if (!currentUser) {
      throw new Error(missingCookieMessage)
    }
    return currentUser
  }

  const token = extractBearerTokenFromLoginBody(body)
  if (!token) {
    throw new Error(missingTokenMessage)
  }

  handlers.setToken(token)

  const refresh = extractRefreshTokenFromLoginBody(body)
  if (refresh) {
    setRefreshToken(refresh)
  }

  if (loggedInUser) {
    handlers.setUser(loggedInUser)
  }
  const refreshedUser = await handlers.refreshSession()
  return refreshedUser ?? loggedInUser
}

export function buildRegisterBody(payload: RegisterPayload) {
  const name = `${payload.first_name} ${payload.last_name}`.trim()
  return {
    name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    fcm_token: getFcmToken(),
  }
}

export function buildLoginBody(email: string, password: string) {
  return {
    email,
    password,
    fcm_token: getFcmToken(),
  }
}

export async function loginUser(payload: LoginPayload, handlers: AuthHandlers) {
  try {
    const res = await request.post<unknown>(
      endpoints.login,
      buildLoginBody(payload.email, payload.password),
    )
    const user = await hydrateSessionFromLoginBody(
      res.data,
      handlers,
      'Unable to restore your session after login.',
      'Login response is missing access token.',
    )
    if (isAdminAccount(user)) {
      throw new Error('This sign-in page is for customer accounts only.')
    }
    return { user, needsEmailVerification: !isEmailVerifiedFromLoginBody(res.data) }
  } catch (error) {
    handlers.resetAuthState()
    throw error
  }
}

export async function registerUser(payload: RegisterPayload) {
  const res = await request.post<unknown>(endpoints.register, buildRegisterBody(payload))
  logOtpFromResponse(res.data, 'register')
}

export async function registerAndLoginUser(payload: RegisterPayload) {
  const res = await request.post<unknown>(endpoints.register, buildRegisterBody(payload))
  logOtpFromResponse(res.data, 'register')

  const token = extractBearerTokenFromLoginBody(res.data)
  const data = unwrapLaravelData<Record<string, unknown>>(res.data)
  const responseUser = data ? mapApiUserRecord(data) : null
  const userId =
    typeof data?.user_id === 'string' || typeof data?.user_id === 'number'
      ? data.user_id
      : payload.email
  const storedUser: AuthUser =
    responseUser ??
    ({
      id: userId,
      email: payload.email,
      name: `${payload.first_name} ${payload.last_name}`.trim(),
      role: 'user',
      roles: ['user'],
    } satisfies AuthUser)

  if (token) {
    setAccessToken(token)
    const refresh = extractRefreshTokenFromLoginBody(res.data)
    if (refresh) setRefreshToken(refresh)
  }
  setStoredAuthUser(storedUser)

  return storedUser
}

export async function requestPasswordResetOtp(payload: PasswordResetOtpPayload) {
  const res = await request.post<unknown>(endpoints.forgotPassword, { email: payload.email })
  logOtpFromResponse(res.data, 'password reset')
  const data = unwrapLaravelData<{ token?: string }>(res.data)
  const token = data?.token
  if (token) {
    setPasswordResetSession(payload.email.toLowerCase(), token)
  }
}

export async function resendRegistrationOtp() {
  const res = await request.post<unknown>(endpoints.resendOtp, {})
  logOtpFromResponse(res.data, 'register resend')
}

export async function resendForgotPasswordOtp(email: string) {
  const token = getPasswordResetToken()
  if (!token) {
    throw new Error('Reset session expired. Please request a new code.')
  }
  const res = await request.post<unknown>(endpoints.forgotResendOtp, {
    email: email.toLowerCase(),
    token,
  })
  logOtpFromResponse(res.data, 'forgot resend')
  const data = unwrapLaravelData<{ token?: string }>(res.data)
  if (data?.token) {
    setPasswordResetSession(email.toLowerCase(), data.token)
  }
}

export async function verifyForgotPasswordOtp(payload: VerifyOtpPayload) {
  const token = getPasswordResetToken()
  if (!token) {
    throw new Error('Reset session expired. Please request a new code.')
  }
  const res = await request.post<unknown>(endpoints.forgotVerifyOtp, {
    email: payload.email.toLowerCase(),
    otp: payload.otp,
    token,
  })
  logOtpFromResponse(res.data, 'forgot verify')
  const data = unwrapLaravelData<{ token?: string }>(res.data)
  if (data?.token) {
    setPasswordResetSession(payload.email.toLowerCase(), data.token)
  }
}

export async function resetPasswordWithToken(payload: {
  email: string
  password: string
  password_confirmation: string
}) {
  const token = getPasswordResetToken()
  const email = getPasswordResetEmail() ?? payload.email.toLowerCase()
  if (!token) {
    throw new Error('Reset session expired. Please start again from forgot password.')
  }
  await request.post<unknown>(endpoints.resetPassword, {
    email,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    token,
  })
  clearPasswordResetSession()
}

export async function verifyRegistrationOtp(
  payload: VerifyOtpPayload,
  handlers: AuthHandlers,
) {
  const res = await request.post<unknown>(endpoints.verifyOtp, {
    otp: payload.otp,
  })
  logOtpFromResponse(res.data, 'verify-otp')

  if (handlers.authStrategy === 'http_only_cookie') {
    const currentUser = await handlers.refreshSession()
    if (!currentUser) {
      throw new Error('OTP verified, but we could not restore your session.')
    }
    return currentUser
  }

  const responseUser = extractUserFromAuthPayload(res.data)
  if (responseUser) {
    handlers.setUser(responseUser)
  }

  const refreshedUser = await handlers.refreshSession()
  const resolvedUser = refreshedUser ?? responseUser
  if (!resolvedUser) {
    const fallbackUser: AuthUser = {
      id: payload.email,
      email: payload.email,
      role: 'user',
      roles: ['user'],
    }
    handlers.setUser(fallbackUser)
    return fallbackUser
  }
  return resolvedUser
}

export function resolvePostLoginPath() {
  return USER_HOME_PATH
}
