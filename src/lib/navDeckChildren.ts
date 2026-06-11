import { DEFAULT_DECK_SLUG } from "@/data/specialtyResources";

const DECK_SLUGS = [
  "fundamentals",
  "transducers",
  "image-optimization",
  "doppler",
  "bioeffects",
  "basic-metrics",
] as const;

type SortableTitle = { title: string; sort_order?: number };

function sortByOrder<T extends SortableTitle>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

/** Map API content/question sets to nav children using deck slug order. */
export function apiItemsToNavChildren(items: SortableTitle[]): { label: string; slug: string }[] {
  const sorted = sortByOrder(items);
  if (sorted.length === 0) return [];

  return sorted.map((item, index) => ({
    label: item.title.trim() || `Topic ${index + 1}`,
    slug: DECK_SLUGS[index] ?? DECK_SLUGS[DECK_SLUGS.length - 1] ?? DEFAULT_DECK_SLUG,
  }));
}
