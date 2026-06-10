/**
 * Google OAuth 2.0 Web client IDs from Cloud Console look like:
 * `108358373780-xxxxxx.apps.googleusercontent.com`
 * (numeric prefix — not a Firebase project slug).
 */
export function isValidGoogleWebClientId(clientId: string | undefined): boolean {
  if (!clientId?.trim()) return false
  return /^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(clientId.trim())
}

export type GoogleClientIdIssue = 'missing' | 'invalid_format'

export function getGoogleClientIdIssue(clientId: string | undefined): GoogleClientIdIssue | null {
  if (!clientId?.trim()) return 'missing'
  if (!isValidGoogleWebClientId(clientId)) return 'invalid_format'
  return null
}

export function isGoogleOAuthConfigured(clientId: string | undefined): boolean {
  return getGoogleClientIdIssue(clientId) === null
}

export function googleClientIdHelpMessage(issue: GoogleClientIdIssue): string {
  if (issue === 'missing') {
    return 'Set VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID in your .env files.'
  }
  return (
    'Invalid Google Client ID. In Google Cloud Console → APIs & Services → Credentials, ' +
    'create an OAuth 2.0 Client ID (Web application) and paste the full value ' +
    '(e.g. 123456789-abc.apps.googleusercontent.com). A Firebase project name is not a Client ID.'
  )
}
