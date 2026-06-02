import { Navigate, useLocation, useSearchParams } from "react-router-dom";

import { parseUserAccountView, userAccountHref } from "@/lib/userAccountNav";

/** Sends old `/user/dashboard` and `?view=` URLs to `/account/my-*` paths. */
export function LegacyUserDashboardRedirect() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  if (pathname === "/user/dashboard" || pathname === "/dashboard") {
    const view = parseUserAccountView(searchParams.get("view"));
    return <Navigate to={userAccountHref(view)} replace />;
  }

  return <Navigate to="/account/my-subscriptions" replace />;
}
