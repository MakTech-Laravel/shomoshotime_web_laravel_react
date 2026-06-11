import { DEFAULT_DECK_SLUG } from "@/data/specialtyResources";

type DeckSortable = { id: number; sort_order?: number };

const DECK_SLUGS = [
  "fundamentals",
  "transducers",
  "image-optimization",
  "doppler",
  "bioeffects",
  "basic-metrics",
] as const;

export type DeckSlug = (typeof DECK_SLUGS)[number];

export function isDeckSlug(slug: string): slug is DeckSlug {
  return (DECK_SLUGS as readonly string[]).includes(slug);
}

function sortByOrder<T extends DeckSortable>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function resolveIdForDeckSlug<T extends DeckSortable>(
  items: T[],
  deckSlug: string | undefined,
): number | undefined {
  const sorted = sortByOrder(items);
  if (sorted.length === 0) return undefined;
  const slug = deckSlug && isDeckSlug(deckSlug) ? deckSlug : DEFAULT_DECK_SLUG;
  const index = DECK_SLUGS.indexOf(slug);
  if (index < 0) return sorted[0]?.id;
  return sorted[index]?.id ?? sorted[0]?.id;
}
