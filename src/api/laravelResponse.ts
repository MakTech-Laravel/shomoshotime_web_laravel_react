import { type AuthUser } from '@/auth/types'

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function avatarFromRecord(o: Record<string, unknown>): string | undefined {
  const image = o.image ?? o.avatar ?? o.avatar_url ?? o.profile_photo_url
  return typeof image === 'string' && image.length > 0 ? image : undefined
}

/** Map Laravel login/profile payloads (UserResource or auth `data` blob) to AuthUser. */
export function mapApiUserRecord(raw: Record<string, unknown>): AuthUser {
  const isAdmin = isTruthyFlag(raw.is_admin)
  const id = raw.id ?? raw.user_id ?? raw.email
  const routeRole =
    typeof raw.role === 'string' && raw.role
      ? raw.role
      : isAdmin
        ? 'admin'
        : 'user'
  const roles = Array.isArray(raw.roles)
    ? (raw.roles as unknown[]).map(String).filter(Boolean)
    : isAdmin
      ? ['admin']
      : [routeRole]

  if (isAdminResourceShape(raw) || (isAdmin && !roles.includes('admin'))) {
    return normalizeAdminAuthUser({
      ...raw,
      id,
      role: 'admin',
      roles: Array.from(new Set(['admin', ...roles])),
    })
  }

  return {
    ...(raw as unknown as AuthUser),
    id: id as string | number,
    name: typeof raw.name === 'string' ? raw.name : undefined,
    email: typeof raw.email === 'string' ? raw.email : undefined,
    avatar: avatarFromRecord(raw),
    role: routeRole,
    roles: Array.from(new Set(roles)),
    is_premium: raw.is_premium as AuthUser['is_premium'],
  }
}

function permissionNamesFromRaw(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const x of raw) {
    if (typeof x === 'string' && x) {
      out.push(x)
      continue
    }
    if (x && typeof x === 'object' && 'name' in x && typeof (x as { name: unknown }).name === 'string') {
      const n = (x as { name: string }).name
      if (n) out.push(n)
    }
  }
  return out
}

/** Map AdminResource / admin login payload into AuthUser with route role `admin` + Spatie fields. */
export function normalizeAdminAuthUser(raw: Record<string, unknown>): AuthUser {
  const spatieRoles = Array.isArray(raw.roles) ? permissionNamesFromRaw(raw.roles) : []
  const perms = permissionNamesFromRaw(raw.permissions)
  const { roles: _dropRoles, permissions: _dropPerms, ...rest } = raw
  const routeRoles = Array.from(new Set(['admin', ...spatieRoles]))
  const isSuper =
    raw.is_super_admin === true ||
    raw.is_super_admin === 1 ||
    raw.is_super_admin === '1' ||
    raw.is_super_admin === 'true'
  return {
    ...(rest as unknown as AuthUser),
    role: 'admin',
    roles: routeRoles,
    adminSpatieRoles: spatieRoles,
    permissions: perms,
    is_super_admin: isSuper ? true : raw.is_super_admin === false ? false : undefined,
  }
}

function rolesLookLikeSpatieAdmin(raw: unknown): boolean {
  if (!Array.isArray(raw)) return false
  return raw.some((x) => {
    const s = String(x)
    return s === 'admin' || s === 'super-admin' || s.endsWith('-admin')
  })
}

function isAdminResourceShape(o: Record<string, unknown>): boolean {
  if (typeof o.email !== 'string') return false
  // UserResource (user/vendor) always includes `role` and never sends Spatie `permissions`.
  const routeRole = o.role
  if (routeRole === 'user' || routeRole === 'vendor') return false
  if (rolesLookLikeSpatieAdmin(o.roles)) return true
  if (Array.isArray(o.permissions)) return true
  if (o.is_super_admin === true || o.is_super_admin === 1 || o.is_super_admin === '1') return true
  return false
}

/**
 * Typical Laravel `sendResponse($success, $message, $payload)` JSON:
 * `{ success?: boolean, message?: string, data?: T }`
 */
export function unwrapLaravelData<T = unknown>(body: unknown): T | null {
  if (body === null || body === undefined) return null
  if (typeof body !== 'object') return null
  const o = body as Record<string, unknown>
  if ('data' in o && o.data !== undefined) {
    return o.data as T
  }
  return body as T
}

function unwrapLaravelDataDeep(body: unknown): unknown {
  let cur: unknown = body
  for (let i = 0; i < 4; i++) {
    if (!cur || typeof cur !== 'object') return cur
    const o = cur as Record<string, unknown>
    if (!('data' in o)) return cur
    cur = o.data
  }
  return cur
}

/** Passport / your login payload: `token` or `access_token` at root or under `data`. */
export function extractBearerTokenFromLoginBody(body: unknown): string | null {
  if (body === null || body === undefined) return null
  if (typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const direct =
    (typeof root.token === 'string' && root.token) ||
    (typeof root.access_token === 'string' && root.access_token) ||
    null
  if (direct) return direct
  const inner = root.data
  if (inner && typeof inner === 'object') {
    const d = inner as Record<string, unknown>
    return (
      (typeof d.token === 'string' && d.token) ||
      (typeof d.access_token === 'string' && d.access_token) ||
      null
    )
  }
  return null
}

/** OAuth / Passport: `refresh_token` at root or under `data`. */
export function extractRefreshTokenFromLoginBody(body: unknown): string | null {
  if (body === null || body === undefined) return null
  if (typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const direct =
    (typeof root.refresh_token === 'string' && root.refresh_token) || null
  if (direct) return direct
  const inner = root.data
  if (inner && typeof inner === 'object') {
    const d = inner as Record<string, unknown>
    return (typeof d.refresh_token === 'string' && d.refresh_token) || null
  }
  return null
}

/** Map Laravel `UserResource` / user object from login or `/me`. */
export function extractUserFromAuthPayload(body: unknown): AuthUser | null {
  const data = unwrapLaravelDataDeep(body)
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>

  // Common: { data: { user: {...} } }
  if ('user' in o && o.user && typeof o.user === 'object') {
    const u = o.user as Record<string, unknown>
    if ('id' in u || 'email' in u) {
      if (isAdminResourceShape(u)) return normalizeAdminAuthUser(u)
      return u as unknown as AuthUser
    }
  }

  // Admin login often returns: { data: { admin: {...} } }
  if ('admin' in o && o.admin && typeof o.admin === 'object') {
    const a = o.admin as Record<string, unknown>
    if ('id' in a || 'email' in a) return normalizeAdminAuthUser(a)
  }

  // Sometimes: { data: {...user fields...} } or login payload with user_id
  if ('id' in o || 'user_id' in o || 'email' in o) {
    return mapApiUserRecord(o)
  }
  return null
}
