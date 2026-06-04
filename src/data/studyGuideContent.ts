const VALID_SPECIALTIES = new Set(["spi", "vascular", "ob-gyn", "abdominal"]);

export function isValidSpecialty(slug: string) {
  return VALID_SPECIALTIES.has(slug);
}
