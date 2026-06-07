import { env } from "@/config/env";

function apiOrigin(): string {
  try {
    return new URL(env.apiBaseUrl).origin;
  } catch {
    return "";
  }
}

function isLocalhostHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function pathnameAndSearch(url: string): string {
  try {
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // fall through
  }

  return url.split("?")[0] + (url.includes("?") ? url.slice(url.indexOf("?")) : "");
}

/** Rewrite localhost URLs from the API to the configured live API origin. */
export function normalizeApiAssetUrl(url: string): string {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (isLocalhostHostname(parsed.hostname)) {
      const origin = apiOrigin();
      if (origin) {
        return `${origin}${parsed.pathname}${parsed.search}`;
      }
    }
  } catch {
    // not an absolute URL
  }

  return url;
}

function stripApiOriginToRelative(url: string): string | null {
  const normalized = normalizeApiAssetUrl(url);

  try {
    const target = new URL(normalized);
    const origin = apiOrigin();
    if (origin && target.origin === origin) {
      return `${target.pathname}${target.search}`;
    }
  } catch {
    return null;
  }

  return null;
}

/** Strip API origin so PDFs load through same-origin proxy (Vite dev / nginx prod). */
export function toProxiedAssetUrl(url: string): string {
  if (!url || typeof window === "undefined") return url;

  if (url.startsWith("/")) {
    return url;
  }

  const relative = stripApiOriginToRelative(url);
  return relative ?? url;
}

/** Absolute URL for fetch (browser: same-origin proxy; SSR/build: direct API origin). */
export function resolveAbsolutePdfUrl(url: string): string {
  const normalized = normalizeApiAssetUrl(url);
  const proxied = toProxiedAssetUrl(normalized);

  if (typeof window !== "undefined" && proxied.startsWith("/")) {
    return new URL(proxied, window.location.origin).href;
  }

  if (/^https?:\/\//i.test(proxied)) {
    return proxied;
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
    return normalized;
  }
}

export function isStudyGuideStreamUrl(url: string): boolean {
  return parseStudyGuideStreamRequest(url) !== null;
}

export function isProxiedStorageUrl(url: string): boolean {
  const resolved = toProxiedAssetUrl(url);
  if (resolved.startsWith("/storage/")) return true;

  try {
    if (/^https?:\/\//i.test(resolved)) {
      return new URL(resolved).pathname.startsWith("/storage/");
    }
  } catch {
    // ignore
  }

  return false;
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
  const pathOnly = pathnameAndSearch(proxied).split("?")[0] ?? proxied;
  const match = pathOnly.match(/\/content\/study-guides\/(\d+)\/file$/);

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
