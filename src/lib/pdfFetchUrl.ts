import { env } from "@/config/env";

/** Strip API origin so dev can load PDFs through the Vite proxy (same-origin). */
export function toProxiedAssetUrl(url: string): string {
  if (!url || typeof window === "undefined") return url;

  if (url.startsWith("/")) {
    return url;
  }

  try {
    const target = new URL(url);
    const apiOrigin = new URL(env.apiBaseUrl).origin;

    if (target.origin === apiOrigin) {
      return `${target.pathname}${target.search}`;
    }
  } catch {
    return url;
  }

  return url;
}

/** Absolute URL for fetch (dev: Vite proxy on :5173; prod: API/storage origin). */
export function resolveAbsolutePdfUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const proxied = toProxiedAssetUrl(url);

  if (typeof window !== "undefined" && proxied.startsWith("/")) {
    return new URL(proxied, window.location.origin).href;
  }

  const base = env.apiBaseUrl.replace(/\/$/, "");
  if (proxied.startsWith("/api/v1")) {
    return `${base}${proxied.replace(/^\/api\/v1/, "")}`;
  }

  try {
    const origin = new URL(env.apiBaseUrl).origin;
    const path = proxied.startsWith("/") ? proxied : `/${proxied}`;
    return `${origin}${path}`;
  } catch {
    return url;
  }
}

export function isStudyGuideStreamUrl(url: string): boolean {
  return parseStudyGuideStreamRequest(url) !== null;
}

export function isProxiedStorageUrl(url: string): boolean {
  return toProxiedAssetUrl(url).startsWith("/storage/");
}

/** CMS / API PDFs (absolute, proxied API path, or public storage). */
export function isRemotePdfSource(source: string): boolean {
  if (/^https?:\/\//i.test(source)) return true;
  if (isStudyGuideStreamUrl(source)) return true;
  if (isProxiedStorageUrl(source)) return true;
  return false;
}

export function parseStudyGuideStreamRequest(url: string): {
  path: string;
  params?: Record<string, string>;
} | null {
  const proxied = toProxiedAssetUrl(url);
  const pathOnly = proxied.split("?")[0] ?? proxied;
  const match = pathOnly.match(/\/api\/v1\/content\/study-guides\/(\d+)\/file$/);

  if (!match) {
    return null;
  }

  const params: Record<string, string> = {};
  try {
    const query = proxied.includes("?") ? proxied.slice(proxied.indexOf("?") + 1) : "";
    if (query) {
      new URLSearchParams(query).forEach((value, key) => {
        params[key] = value;
      });
    }
  } catch {
    // ignore malformed query
  }

  return {
    path: `/content/study-guides/${match[1]}/file`,
    params: Object.keys(params).length > 0 ? params : undefined,
  };
}
