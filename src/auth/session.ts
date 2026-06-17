import { api } from '@/api/client'
import { extractUserFromAuthPayload } from '@/api/laravelResponse'
import { resolveAuthEndpoints } from '@/config/authEndpoints'
import { type AuthUser } from '@/auth/types'

const endpoints = resolveAuthEndpoints()

/** Load current user — Shomoshotime: POST `/user/profile` (Bearer). */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const path = endpoints.userProfile || '/user/profile';

  try {
    const res = await api.post<unknown>(path, {}, { skipAuthRedirect: true });
    return extractUserFromAuthPayload(res.data);
  } catch {
    return null;
  }
}
