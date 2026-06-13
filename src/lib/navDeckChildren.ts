import { DEFAULT_DECK_SLUG } from "@/data/specialtyResources";

const DECK_SLUGS = [
  "fundamentals",
  "transducers",
  "image-optimization",
  "doppler",
  "bioeffects",
  "basic-metrics",
] as const;

type SortableTitle = { title: string; sort_order?: number; id?: number };

function sortByOrder<T extends SortableTitle>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function slugForIndex(item: SortableTitle, index: number): string {
  if (index < DECK_SLUGS.length) {
    return DECK_SLUGS[index] ?? DEFAULT_DECK_SLUG;
  }
  if (item.id != null) {
    return `deck-${item.id}`;
  }
  return `deck-index-${index}`;
}

/** Map API content/question sets to nav children using deck slug order. */
export function apiItemsToNavChildren(items: SortableTitle[]): { label: string; slug: string }[] {
  const sorted = sortByOrder(items);
  if (sorted.length === 0) return [];

  const usedSlugs = new Set<string>();

  return sorted.map((item, index) => {
    let slug = slugForIndex(item, index);
    if (usedSlugs.has(slug)) {
      slug = item.id != null ? `deck-${item.id}` : `deck-index-${index}`;
    }
    usedSlugs.add(slug);

    return {
      label: item.title.trim() || `Topic ${index + 1}`,
      slug,
    };
  });
}
