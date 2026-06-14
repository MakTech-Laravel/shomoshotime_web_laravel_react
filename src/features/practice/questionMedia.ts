export type QuestionMedia = {
  kind: "image" | "pdf";
  url: string;
  caption?: string;
};

const PLACEHOLDER_FRAGMENTS = ["no_img.jpg", "default_img/no_img"];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export function isPlaceholderMediaUrl(url: string): boolean {
  const normalized = url.trim().toLowerCase();
  if (!normalized) return true;
  return PLACEHOLDER_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function pathnameFromUrl(url: string): string {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return url.toLowerCase().split("?")[0]?.split("#")[0] ?? "";
  }
}

function mediaKindFromUrl(url: string): QuestionMedia["kind"] | null {
  const pathname = pathnameFromUrl(url);
  if (pathname.endsWith(".pdf")) return "pdf";
  if (IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) return "image";
  return null;
}

export function resolveQuestionMedia(
  file?: string | null,
  fileAttributes?: string | null,
): QuestionMedia | null {
  const url = typeof file === "string" ? file.trim() : "";
  if (!url || isPlaceholderMediaUrl(url)) return null;

  const kind = mediaKindFromUrl(url);
  if (!kind) return null;

  const caption =
    typeof fileAttributes === "string" && fileAttributes.trim()
      ? fileAttributes.trim()
      : undefined;

  return caption ? { kind, url, caption } : { kind, url };
}
