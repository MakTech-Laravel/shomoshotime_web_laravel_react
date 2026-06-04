import type { SpecialtySlug } from "@/data/specialtyResources";

/**
 * CMS `contents.category` values (as stored in admin).
 * Must stay in sync with backend `ContentController::specialtyCategoryMap()`.
 */
export const SPECIALTY_TO_CONTENT_CATEGORY: Record<SpecialtySlug, string> = {
  spi: "SPI",
  vascular: "Vascular",
  "ob-gyn": "OB/GYN",
  abdominal: "Abdomen",
};

const NORMALIZED_CATEGORY_LOOKUP: Record<string, SpecialtySlug> = {
  spi: "spi",
  vascular: "vascular",
  "ob-gyn": "ob-gyn",
  obgyn: "ob-gyn",
  "ob/gyn": "ob-gyn",
  abdominal: "abdominal",
  abdomen: "abdominal",
};

export function contentCategoryForSpecialty(specialty: string): string | null {
  if (specialty in SPECIALTY_TO_CONTENT_CATEGORY) {
    return SPECIALTY_TO_CONTENT_CATEGORY[specialty as SpecialtySlug];
  }
  return null;
}

/** Map a CMS category label (any casing) to a frontend specialty slug. */
export function specialtyForContentCategory(category: string): SpecialtySlug | null {
  const key = category.trim().toLowerCase();
  if (key in NORMALIZED_CATEGORY_LOOKUP) {
    return NORMALIZED_CATEGORY_LOOKUP[key];
  }
  return null;
}
