import { buildPdfLoadSources } from "@/lib/loadPdfDocument";
import type { PublicStudyGuide } from "@/features/studyGuides/types";

/** API-relative stream path (axios baseURL already includes /api/v1). */
export function studyGuidePdfStreamPath(guideId: number) {
  return `/content/study-guides/${guideId}/file`;
}

export function resolveStudyGuidePdfSources(guide: PublicStudyGuide) {
  const version = guide.updated_at ?? guide.id;
  return buildPdfLoadSources(studyGuidePdfStreamPath(guide.id), undefined, version);
}
