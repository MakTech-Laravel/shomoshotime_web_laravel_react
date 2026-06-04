const FCM_STORAGE_KEY = 'auth:fcm_token'

/** Stable device id for API `fcm_token` (required on register). */
export function getFcmToken(): string {
  if (typeof window === 'undefined') return 'web-ssr'
  try {
    let token = sessionStorage.getItem(FCM_STORAGE_KEY)
    if (!token) {
      token = `web-${crypto.randomUUID()}`
      sessionStorage.setItem(FCM_STORAGE_KEY, token)
    }
    return token
  } catch {
    return 'web-anonymous'
  }
}
