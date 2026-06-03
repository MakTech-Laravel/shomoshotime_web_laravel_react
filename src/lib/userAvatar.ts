import { type AuthUser } from '@/auth/types'
import { env } from '@/config/env'

export const DEFAULT_HEADER_AVATAR = '/images/avatar/default-header-avatar.png'

const AVATAR_FIELD_KEYS = [
  'avatar_url',
  'avatar',
  'profile_photo_url',
  'profile_photo',
  'photo_url',
  'photo',
  'image_url',
  'image',
  'profile_image',
  'profile_picture',
  'picture',
] as const

function apiAssetOrigin(): string {
  try {
    return new URL(env.apiBaseUrl).origin
  } catch {
    return ''
  }
}

/** Turn API-relative storage paths into absolute URLs. */
export function resolveUserAvatarUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  if (/^(https?:\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed
  }

  const origin = apiAssetOrigin()
  if (!origin) return trimmed

  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`
  }

  return `${origin}/${trimmed}`
}

/** First non-empty avatar field on the auth user, if any. */
export function getUserAvatarSrc(user: AuthUser | null | undefined): string | null {
  if (!user) return null

  const record = user as Record<string, unknown>
  for (const key of AVATAR_FIELD_KEYS) {
    const value = record[key]
    if (typeof value === 'string') {
      const resolved = resolveUserAvatarUrl(value)
      if (resolved) return resolved
    }
  }

  return null
}
