import { DEFAULT_DECK_SLUG, type SpecialtySlug } from "@/data/specialtyResources";

const SPI_DECK_SLUGS = [
  "fundamentals",
  "transducers",
  "image-optimization",
  "doppler",
  "bioeffects",
  "basic-metrics",
] as const;

type SortableTitle = { title: string; sort_order?: number; id?: number };

export type NavChild = { label: string; slug: string };

/** Reverse nav dropdown order for web display (slug/label pairs stay intact). */
export function reverseNavChildren(children: NavChild[]): NavChild[] {
  return [...children].reverse();
}

function sortByOrder<T extends SortableTitle>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
}

function slugForItem(
  item: SortableTitle,
  index: number,
  specialty: SpecialtySlug | undefined,
): string {
  if (specialty === "spi" && index < SPI_DECK_SLUGS.length) {
    return SPI_DECK_SLUGS[index] ?? DEFAULT_DECK_SLUG;
  }
  if (item.id != null) {
    return `deck-${item.id}`;
  }
  return `deck-index-${index}`;
}

/** Map API content/question sets to nav children. SPI keeps legacy slugs; other specialties use deck-{id}. */
export function apiItemsToNavChildren(
  items: SortableTitle[],
  options?: { specialty?: SpecialtySlug; reverse?: boolean },
): { label: string; slug: string }[] {
  const sorted = sortByOrder(items);
  if (sorted.length === 0) return [];

  const specialty = options?.specialty;
  const usedSlugs = new Set<string>();
  const seenIds = new Set<number>();

  const result: { label: string; slug: string }[] = [];

  for (const [index, item] of sorted.entries()) {
    if (item.id != null) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
    }

    let slug = slugForItem(item, index, specialty);
    if (usedSlugs.has(slug)) {
      slug = item.id != null ? `deck-${item.id}` : `deck-index-${index}`;
    }
    usedSlugs.add(slug);

    result.push({
      label: item.title.trim() || `Topic ${index + 1}`,
      slug,
    });
  }

  return options?.reverse === false ? result : reverseNavChildren(result);
}

export function firstDeckSlugForSets(
  items: SortableTitle[],
  specialty: SpecialtySlug,
): string | undefined {
  const children = apiItemsToNavChildren(items, { specialty });
  return children[0]?.slug;
}
