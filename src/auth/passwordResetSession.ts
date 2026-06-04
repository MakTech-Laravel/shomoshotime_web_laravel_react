const RESET_TOKEN_KEY = 'auth:passwordResetToken'
const RESET_EMAIL_KEY = 'auth:passwordResetEmail'

export function setPasswordResetSession(email: string, token: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(RESET_EMAIL_KEY, email.toLowerCase())
    sessionStorage.setItem(RESET_TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export function getPasswordResetToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(RESET_TOKEN_KEY)
  } catch {
    return null
  }
}

export function getPasswordResetEmail(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(RESET_EMAIL_KEY)
  } catch {
    return null
  }
}

export function clearPasswordResetSession() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(RESET_TOKEN_KEY)
    sessionStorage.removeItem(RESET_EMAIL_KEY)
  } catch {
    // ignore
  }
}
