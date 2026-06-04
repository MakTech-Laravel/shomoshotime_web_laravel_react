import axios from 'axios'

import {
  extractValidationErrors,
  firstValidationMessage,
  type ApiValidationErrorBody,
} from '@/api/validationErrors'

export type FieldErrorMap = Record<string, string>

function isAxiosStatusMessage(message: string): boolean {
  return /^Request failed with status code \d+$/i.test(message)
}

export function getAuthFieldErrors(error: unknown): FieldErrorMap {
  if (!axios.isAxiosError(error)) return {}
  const data = error.response?.data as ApiValidationErrorBody | undefined
  const validation = extractValidationErrors(data)
  const out: FieldErrorMap = {}

  for (const [field, messages] of Object.entries(validation)) {
    const first = messages?.find(Boolean)
    if (first) {
      out[field] =
        field === 'email' && first.toLowerCase().includes('selected email is invalid')
          ? 'No account found with this email.'
          : first
    }
  }

  const msg = data?.message?.toLowerCase() ?? ''
  const isGenericCredentialError =
    msg.includes('invalid credentials') ||
    msg.includes('invalid login') ||
    msg.includes('wrong credentials') ||
    msg.includes('incorrect credentials') ||
    msg.includes('email or password is incorrect')

  if (isGenericCredentialError) {
    if (!out.email) out.email = 'Invalid email'
    if (!out.password) out.password = 'Incorrect password'
  }

  return out
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiValidationErrorBody | undefined

    if (data?.message && data.success !== true) return data.message

    const fromValidation = firstValidationMessage(data)
    if (fromValidation) return fromValidation

    if (error.response?.status === 422) {
      return 'Please check your entries and try again.'
    }
  }

  if (error instanceof Error && error.message && !isAxiosStatusMessage(error.message)) {
    return error.message
  }

  return fallback
}
