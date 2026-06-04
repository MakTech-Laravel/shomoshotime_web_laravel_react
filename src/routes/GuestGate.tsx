import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { env } from '@/config/env'
import { USER_HOME_PATH } from '@/features/auth/paths'

/**
 * Guest-only pages (login, register). Authenticated users go to account home.
 */
export function GuestGate({
  redirectTo,
  children,
}: {
  redirectTo?: string
  children: React.ReactNode
}) {
  const { isAuthenticated, isSessionLoading, isUserLoading } = useAuth()
  const location = useLocation()

  if (!env.requireAuth) {
    return children
  }

  if (isSessionLoading || isUserLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) return children

  const isRegisterOtpPage =
    location.pathname === '/otp-verification' &&
    new URLSearchParams(location.search).get('purpose') === 'register'
  if (isRegisterOtpPage) return children

  return <Navigate to={redirectTo ?? USER_HOME_PATH} replace />
}
