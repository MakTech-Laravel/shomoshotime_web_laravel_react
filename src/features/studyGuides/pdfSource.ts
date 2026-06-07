import { env } from "@/config/env";
import { buildPdfLoadSources } from "@/lib/loadPdfDocument";
import { toProxiedAssetUrl } from "@/lib/pdfFetchUrl";
import type { PublicStudyGuide } from "@/features/studyGuides/types";

/** Stream endpoint from configured API base (Postman-verified source of truth). */
export function studyGuidePdfStreamUrl(guideId: number) {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  return `${base}/content/study-guides/${guideId}/file`;
}

export function resolveStudyGuidePdfSources(guide: PublicStudyGuide) {
  const version = guide.updated_at ?? guide.id;
  const apiPath = studyGuidePdfStreamUrl(guide.id);
  const storageSrc =
    guide.file_src && !guide.file_src.includes("no_img.jpg") ? guide.file_src : undefined;
  const storagePath = storageSrc
    ? toProxiedAssetUrl(storageSrc)
    : guide.file_url
      ? toProxiedAssetUrl(guide.file_url)
      : undefined;

  // Prefer API stream (server-resolved PDF); storage URL is fallback only.
  if (storagePath && storagePath !== apiPath) {
    return buildPdfLoadSources(apiPath, storagePath, version);
  }

  return buildPdfLoadSources(apiPath, undefined, version);
}
