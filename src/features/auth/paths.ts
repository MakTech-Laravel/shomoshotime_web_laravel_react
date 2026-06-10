import type { Location } from "react-router-dom";

/** Default landing route after user sign-in or registration. */
export const USER_HOME_PATH = "/account/my-subscriptions";

export function isUnsafePostLoginPath(pathname: string | undefined): boolean {
  if (!pathname) return true;
  return (
    pathname === "/unauthorized" ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/otp-verification")
  );
}

function pathFromRouterState(state: unknown): string | undefined {
  const from = (state as { from?: { pathname?: string; search?: string } } | null)?.from;
  if (!from?.pathname || isUnsafePostLoginPath(from.pathname)) return undefined;
  return `${from.pathname}${from.search ?? ""}`;
}

function pathFromNextQuery(search: string): string | undefined {
  const next = new URLSearchParams(search).get("next");
  if (!next) return undefined;

  try {
    const decoded = decodeURIComponent(next);
    const pathname = decoded.split("?")[0];
    if (!pathname.startsWith("/") || isUnsafePostLoginPath(pathname)) return undefined;
    return decoded;
  } catch {
    return undefined;
  }
}

/** Path to open after login when the user was redirected from a protected route. */
export function resolveIntendedPath(location: Pick<Location, "state" | "search">): string | undefined {
  return pathFromRouterState(location.state) ?? pathFromNextQuery(location.search);
}
