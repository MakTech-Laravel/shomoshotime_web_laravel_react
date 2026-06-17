import { api } from '@/api/client'
import { extractUserFromAuthPayload } from '@/api/laravelResponse'
import { resolveAuthEndpoints } from '@/config/authEndpoints'
import { env } from '@/config/env'
import { type AuthUser } from '@/auth/types'

const endpoints = resolveAuthEndpoints()

/** Load current user — Shomoshotime: POST `/user/profile` (Bearer). */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const pathCandidates = Array.from(
    new Set([endpoints.userProfile, env.authMePath, '/user/profile'].filter(Boolean)),
  )
  for (const path of pathCandidates) {
    try {
      const res = await api.post<unknown>(path, {}, { skipAuthRedirect: true })
      const user = extractUserFromAuthPayload(res.data)
      if (user) return user
    } catch {
      try {
        const res = await api.get<unknown>(path, { skipAuthRedirect: true })
        const user = extractUserFromAuthPayload(res.data)
        if (user) return user
      } catch {
        // try next candidate path
      }
    }
  }
  return null
}
