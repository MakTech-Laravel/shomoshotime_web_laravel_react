/** Audio routes stay public; register new audio paths under these prefixes. */
export const PUBLIC_AUDIO_PATH_PREFIXES = ["/audio/"] as const;

/**
 * Specialty resource segments protected at the router level (login required).
 * Study guide slugs are CMS-driven; flashcard/practice deck slugs are static.
 */
export const PROTECTED_SPECIALTY_RESOURCE_SEGMENTS = [
  "study-guides",
  "flashcards",
  "practice-questions",
] as const;

export function isPublicAudioPath(pathname: string): boolean {
  return PUBLIC_AUDIO_PATH_PREFIXES.some(
    (prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix),
  );
}
