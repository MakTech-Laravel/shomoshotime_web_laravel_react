import { env } from "@/config/env";
import { buildPdfLoadSources } from "@/lib/loadPdfDocument";
import { toProxiedAssetUrl } from "@/lib/pdfFetchUrl";
import type { PublicStudyGuide } from "@/features/studyGuides/types";

/** Dev: same-origin path (Vite proxy). Prod: full API URL. */
export function studyGuidePdfStreamUrl(guideId: number) {
  if (import.meta.env.DEV) {
    return `/api/v1/content/study-guides/${guideId}/file`;
  }

  const base = env.apiBaseUrl.replace(/\/$/, "");
  return `${base}/content/study-guides/${guideId}/file`;
}

export function resolveStudyGuidePdfSources(guide: PublicStudyGuide) {
  const version = guide.updated_at ?? guide.id;
  const storageSrc =
    guide.file_src && !guide.file_src.includes("no_img.jpg") ? guide.file_src : undefined;
  const storagePath = storageSrc
    ? toProxiedAssetUrl(storageSrc)
    : toProxiedAssetUrl(guide.file_url);
  const apiPath = studyGuidePdfStreamUrl(guide.id);

  return buildPdfLoadSources(storagePath, apiPath, version);
}
