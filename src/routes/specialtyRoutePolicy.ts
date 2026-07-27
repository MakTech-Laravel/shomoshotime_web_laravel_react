/** Audio routes now require authentication; no audio path prefixes remain public. */
export const PUBLIC_AUDIO_PATH_PREFIXES: readonly string[] = [];

/**
 * Specialty resource segments protected at the router level (login required).
 * Study guide slugs are CMS-driven; flashcard/practice deck slugs are static.
 * The static audio page (`/audio/:specialty`) is also login-gated.
 */
export const PROTECTED_SPECIALTY_RESOURCE_SEGMENTS = [
  "study-guides",
  "flashcards",
  "practice-questions",
  "audio",
] as const;

export function isPublicAudioPath(pathname: string): boolean {
  return PUBLIC_AUDIO_PATH_PREFIXES.some(
    (prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix),
  );
}
