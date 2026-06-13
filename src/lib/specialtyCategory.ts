import type { SpecialtySlug } from "@/data/specialtyResources";

const SPECIALTY_TO_CATEGORY: Record<SpecialtySlug, string> = {
  spi: "SPI",
  vascular: "Vascular",
  "ob-gyn": "OB/GYN",
  abdominal: "Abdomen",
};

export function specialtyToCategory(specialty: SpecialtySlug): string {
  return SPECIALTY_TO_CATEGORY[specialty];
}

export function categoryMatchesSpecialty(
  category: string | undefined,
  specialty: SpecialtySlug,
): boolean {
  if (!category) return false;
  return category.toLowerCase() === specialtyToCategory(specialty).toLowerCase();
}
