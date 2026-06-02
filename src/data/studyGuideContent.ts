export type StudyGuideSection = "outlines";

export type StudyGuideContent = {
  title: string;
  fileName: string;
  /** Bundled asset id — loaded in-memory, no /pdfs/*.pdf HTTP request */
  pdfAssetId: string;
};

const OUTLINES_GUIDE: StudyGuideContent = {
  title: "Pathology, Perfusion, and Function",
  fileName: "2-Pathology-Perfusion-and-Function.pdf",
  pdfAssetId: "pathology-perfusion-and-function",
};

const STUDY_GUIDE_SECTIONS: Record<StudyGuideSection, StudyGuideContent> = {
  outlines: OUTLINES_GUIDE,
};

const VALID_SPECIALTIES = new Set(["spi", "vascular", "ob-gyn", "abdominal"]);

export function isValidSpecialty(slug: string) {
  return VALID_SPECIALTIES.has(slug);
}

export function getStudyGuideContent(
  specialty: string,
  section: string,
): StudyGuideContent | null {
  if (!isValidSpecialty(specialty)) return null;
  return STUDY_GUIDE_SECTIONS[section as StudyGuideSection] ?? null;
}
