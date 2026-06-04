import { Navigate, Outlet, useLocation } from "react-router-dom";

import { hasAnyRole, type Role } from "@/auth/roles";
import { useAuth } from "@/auth/useAuth";
import { env } from "@/config/env";
import { USER_HOME_PATH } from "@/features/auth/paths";

type ProtectedRouteProps = {
  /** Required role(s) for this route. Pass nothing to only require authentication. */
  roles?: Role | Role[];
  /** Where unauthenticated users land. Defaults to `/login`. */
  loginPath?: string;
  /** Where wrong-role users land. Defaults to their own dashboard via rolePolicy. */
  fallbackPath?: string;
  /**
   * When true, authentication is required even if `VITE_REQUIRE_AUTH=false`
   * (e.g. `/account/*` must never be public).
   */
  forceAuth?: boolean;
  children?: React.ReactNode;
};

function pickDashboardForUserRoles(): string {
  return USER_HOME_PATH;
}

/**
 * Gate that requires the visitor to be authenticated and (optionally) to have
 * one of the given roles. Mirrors the previous role/permission gates but is
 * compact enough to live alongside the rest of the routing code.
 */
export function ProtectedRoute({
  roles,
  loginPath = "/login",
  fallbackPath,
  forceAuth = false,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isSessionLoading, isUserLoading, user } = useAuth();
  const location = useLocation();
  const mustAuthenticate = forceAuth || env.requireAuth;

  if (!mustAuthenticate) {
    return <>{children ?? <Outlet />}</>;
  }

  if (isSessionLoading || isUserLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading&hellip;
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginPath}?next=${next}`} replace state={{ from: location }} />;
  }

  if (roles && !hasAnyRole(user, roles)) {
    const target = fallbackPath ?? pickDashboardForUserRoles();
    return <Navigate to={target} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
