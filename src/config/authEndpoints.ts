/**
 * Shomoshotime Laravel API v1 auth routes (`routes/api.php` + `routes/api/v1/user.php`).
 * Paths are relative to `VITE_API_BASE_URL` (e.g. http://localhost:8000/api/v1).
 */
export const authEndpoints = {
  register: '/auth/register',
  login: '/auth/login',
  googleLogin: '/auth/google-login',
  claimSendOtp: '/auth/claim-account/send-otp',
  claimSetPassword: '/auth/claim-account/set-password',
  logout: '/auth/logout',
  verifyOtp: '/auth/verify-otp',
  resendOtp: '/auth/resend-otp',
  changePassword: '/auth/change-password',
  forgotPassword: '/auth/forgot-password',
  forgotVerifyOtp: '/auth/forgot-verify-otp',
  forgotResendOtp: '/auth/forgot-resend-otp',
  resetPassword: '/auth/reset-password',
  /** POST — authenticated user profile (UserResource). */
  userProfile: '/user/profile',
} as const

export type AuthEndpointKey = keyof typeof authEndpoints

function pathFromEnv(name: string, fallback: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[name]?.trim()
  return v || fallback
}

/** Env overrides for a single endpoint without duplicating the full map. */
export function resolveAuthEndpoints() {
  return {
    register: pathFromEnv('VITE_AUTH_REGISTER_PATH', authEndpoints.register),
    login: pathFromEnv('VITE_AUTH_LOGIN_PATH', authEndpoints.login),
    googleLogin: pathFromEnv('VITE_AUTH_GOOGLE_LOGIN_PATH', authEndpoints.googleLogin),
    claimSendOtp: pathFromEnv('VITE_AUTH_CLAIM_SEND_OTP_PATH', authEndpoints.claimSendOtp),
    claimSetPassword: pathFromEnv('VITE_AUTH_CLAIM_SET_PASSWORD_PATH', authEndpoints.claimSetPassword),
    logout: pathFromEnv('VITE_AUTH_LOGOUT_PATH', authEndpoints.logout),
    verifyOtp: pathFromEnv('VITE_AUTH_VERIFY_OTP_PATH', authEndpoints.verifyOtp),
    resendOtp: pathFromEnv('VITE_AUTH_RESEND_OTP_PATH', authEndpoints.resendOtp),
    changePassword: pathFromEnv('VITE_AUTH_CHANGE_PASSWORD_PATH', authEndpoints.changePassword),
    forgotPassword: pathFromEnv('VITE_AUTH_FORGOT_PASSWORD_PATH', authEndpoints.forgotPassword),
    forgotVerifyOtp: pathFromEnv(
      'VITE_AUTH_FORGOT_VERIFY_OTP_PATH',
      authEndpoints.forgotVerifyOtp,
    ),
    forgotResendOtp: pathFromEnv(
      'VITE_AUTH_FORGOT_RESEND_OTP_PATH',
      authEndpoints.forgotResendOtp,
    ),
    resetPassword: pathFromEnv('VITE_AUTH_RESET_PASSWORD_PATH', authEndpoints.resetPassword),
    userProfile: pathFromEnv('VITE_AUTH_ME_PATH', authEndpoints.userProfile),
  }
}
