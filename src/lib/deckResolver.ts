import { DEFAULT_DECK_SLUG, type SpecialtySlug } from "@/data/specialtyResources";

type DeckSortable = { id: number; sort_order?: number };

const SPI_DECK_SLUGS = [
  "fundamentals",
  "transducers",
  "image-optimization",
  "doppler",
  "bioeffects",
  "basic-metrics",
] as const;

export type DeckSlug = (typeof SPI_DECK_SLUGS)[number];

export function isDeckSlug(slug: string): slug is DeckSlug {
  return (SPI_DECK_SLUGS as readonly string[]).includes(slug);
}

function sortByOrder<T extends DeckSortable>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
}

function resolveIdFromDynamicSlug<T extends DeckSortable>(
  items: T[],
  deckSlug: string,
): number | undefined {
  if (deckSlug.startsWith("deck-")) {
    const suffix = deckSlug.slice(5);
    if (suffix.startsWith("index-")) {
      const index = Number(suffix.slice(6));
      if (Number.isFinite(index) && index >= 0) {
        return sortByOrder(items)[index]?.id;
      }
    }
    const id = Number(suffix);
    if (Number.isFinite(id)) {
      const match = items.find((item) => item.id === id);
      if (match) return match.id;
    }
  }
  return undefined;
}

export function resolveIdForDeckSlug<T extends DeckSortable>(
  items: T[],
  deckSlug: string | undefined,
  specialty?: SpecialtySlug,
): number | undefined {
  const sorted = sortByOrder(items);
  if (sorted.length === 0) return undefined;

  if (deckSlug) {
    const dynamicId = resolveIdFromDynamicSlug(sorted, deckSlug);
    if (dynamicId != null) return dynamicId;
  }

  if (specialty === "spi" || specialty == null) {
    const slug = deckSlug && isDeckSlug(deckSlug) ? deckSlug : DEFAULT_DECK_SLUG;
    const index = SPI_DECK_SLUGS.indexOf(slug);
    if (index < 0) return sorted[0]?.id;
    return sorted[index]?.id ?? sorted[0]?.id;
  }

  return sorted[0]?.id;
}
