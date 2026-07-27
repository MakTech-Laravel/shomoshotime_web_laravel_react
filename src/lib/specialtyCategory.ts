import type { SpecialtySlug } from "@/data/specialtyResources";
import { specialtyForContentCategory } from "@/features/studyGuides/specialtyCategory";

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
  return specialtyForContentCategory(category) === specialty;
}
