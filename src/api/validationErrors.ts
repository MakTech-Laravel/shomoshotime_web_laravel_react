/** Shomoshotime `BaseRequest` 422: `{ success: false, data: { field: ["msg"] } }` */
export type ApiValidationErrorBody = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
  data?: Record<string, string[] | string> | unknown
}

export function extractValidationErrors(
  body: ApiValidationErrorBody | undefined,
): Record<string, string[]> {
  if (!body) return {}

  if (body.errors && typeof body.errors === 'object') {
    return body.errors
  }

  const payload = body.data
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }

  const out: Record<string, string[]> = {}
  for (const [field, messages] of Object.entries(payload as Record<string, unknown>)) {
    if (Array.isArray(messages)) {
      const list = messages.map(String).filter(Boolean)
      if (list.length) out[field] = list
    } else if (typeof messages === 'string' && messages) {
      out[field] = [messages]
    }
  }
  return out
}

export function firstValidationMessage(body: ApiValidationErrorBody | undefined): string | null {
  const errors = extractValidationErrors(body)
  for (const messages of Object.values(errors)) {
    const first = messages.find(Boolean)
    if (first) return humanizeValidationMessage(first)
  }
  return null
}

function humanizeValidationMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('selected email is invalid') || lower.includes('email does not exist')) {
    return 'No account found with this email. Check the address or sign up.'
  }
  if (lower.includes('email field is required')) {
    return 'Email is required.'
  }
  if (lower.includes('password field is required')) {
    return 'Password is required.'
  }
  return message
}
