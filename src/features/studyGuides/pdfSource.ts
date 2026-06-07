import { buildPdfLoadSources } from "@/lib/loadPdfDocument";
import type { PublicStudyGuide } from "@/features/studyGuides/types";

/**
 * Same-origin path — Vite dev proxy and nginx prod proxy forward to Laravel stream endpoint.
 * Direct /storage/ URLs return 403 on production; never use them for PDF viewing.
 */
export function studyGuidePdfStreamPath(guideId: number) {
  return `/api/v1/content/study-guides/${guideId}/file`;
}

export function resolveStudyGuidePdfSources(guide: PublicStudyGuide) {
  const version = guide.updated_at ?? guide.id;
  return buildPdfLoadSources(studyGuidePdfStreamPath(guide.id), undefined, version);
}
