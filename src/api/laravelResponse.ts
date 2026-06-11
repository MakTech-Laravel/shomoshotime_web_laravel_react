import { type AuthUser } from '@/auth/types'

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function avatarFromRecord(o: Record<string, unknown>): string | undefined {
  const image = o.image ?? o.avatar ?? o.avatar_url ?? o.profile_photo_url
  return typeof image === 'string' && image.length > 0 ? image : undefined
}

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
  const routeRole = o.role
  if (routeRole === 'user' || routeRole === 'vendor') return false
  if (rolesLookLikeSpatieAdmin(o.roles)) return true
  if (Array.isArray(o.permissions)) return true
  if (o.is_super_admin === true || o.is_super_admin === 1 || o.is_super_admin === '1') return true
  return false
}

export type LaravelPaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function unwrapLaravelData<T = unknown>(body: unknown): T | null {
  if (body === null || body === undefined) return null
  if (typeof body !== 'object') return null
  const o = body as Record<string, unknown>
  if ('data' in o && o.data !== undefined) {
    return o.data as T
  }
  return body as T
}

export function unwrapLaravelPaginatedData<T = unknown>(
  body: unknown,
): { rows: T[]; meta: LaravelPaginationMeta | null } {
  if (!body || typeof body !== 'object') {
    return { rows: [], meta: null }
  }
  const o = body as Record<string, unknown>
  const rows = Array.isArray(o.data) ? (o.data as T[]) : []
  const metaRaw = o.meta
  if (!metaRaw || typeof metaRaw !== 'object') {
    return { rows, meta: null }
  }
  const m = metaRaw as Record<string, unknown>
  return {
    rows,
    meta: {
      current_page: Number(m.current_page ?? 1),
      last_page: Number(m.last_page ?? 1),
      per_page: Number(m.per_page ?? rows.length),
      total: Number(m.total ?? rows.length),
    },
  }
}

export function isLaravelSuccess(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const o = body as Record<string, unknown>
  return o.success === true
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

export function extractUserFromAuthPayload(body: unknown): AuthUser | null {
  const data = unwrapLaravelDataDeep(body)
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>

  if ('user' in o && o.user && typeof o.user === 'object') {
    const u = o.user as Record<string, unknown>
    if ('id' in u || 'email' in u) {
      if (isAdminResourceShape(u)) return normalizeAdminAuthUser(u)
      return u as unknown as AuthUser
    }
  }

  if ('admin' in o && o.admin && typeof o.admin === 'object') {
    const a = o.admin as Record<string, unknown>
    if ('id' in a || 'email' in a) return normalizeAdminAuthUser(a)
  }

  if ('id' in o || 'user_id' in o || 'email' in o) {
    return mapApiUserRecord(o)
  }
  return null
}
