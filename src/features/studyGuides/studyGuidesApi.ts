import { api } from "@/api/client";
import { normalizeApiAssetUrl } from "@/lib/pdfFetchUrl";
import { unwrapLaravelData } from "@/api/laravelResponse";
import type { PublicStudyGuide } from "@/features/studyGuides/types";
import type { SpecialtySlug } from "@/data/specialtyResources";

const STUDY_GUIDES_PATH = "/content/study-guides";

function normalizeGuide(raw: unknown): PublicStudyGuide | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : Number(o.id);
  if (!Number.isFinite(id)) return null;

  const fileUrl =
    typeof o.file_url === "string" ? normalizeApiAssetUrl(o.file_url) : "";
  const fileSrc =
    typeof o.file_src === "string" ? normalizeApiAssetUrl(o.file_src) : undefined;
  const slug = typeof o.slug === "string" ? o.slug : "";
  const title = typeof o.title === "string" ? o.title : "";
  const hasFile = o.has_file === true;

  if (!fileUrl || !slug || !title) return null;

  return {
    id,
    sort_order: typeof o.sort_order === "number" ? o.sort_order : 0,
    title,
    subtitle: typeof o.subtitle === "string" ? o.subtitle : "",
    category: typeof o.category === "string" ? o.category : "",
    slug,
    total_pages: typeof o.total_pages === "number" ? o.total_pages : 0,
    file_url: fileUrl,
    file_src: fileSrc,
    has_file: hasFile,
    updated_at:
      typeof o.updated_at === "string"
        ? o.updated_at
        : typeof o.updated_at === "number"
          ? String(o.updated_at)
          : undefined,
  };
}

function normalizeGuideList(body: unknown): PublicStudyGuide[] {
  const data = unwrapLaravelData<unknown>(body);
  const rows = Array.isArray(data) ? data : [];
  return rows.map(normalizeGuide).filter((g): g is PublicStudyGuide => g !== null);
}

function normalizeGuideSingle(body: unknown): PublicStudyGuide | null {
  const data = unwrapLaravelData<unknown>(body);
  return normalizeGuide(data);
}

export async function fetchStudyGuidesBySpecialty(
  specialty: SpecialtySlug,
): Promise<PublicStudyGuide[]> {
  const res = await api.get(STUDY_GUIDES_PATH, {
    params: { specialty },
    skipAuthRedirect: true,
  });
  return normalizeGuideList(res.data);
}

export async function fetchAllPublishedStudyGuides(): Promise<PublicStudyGuide[]> {
  const res = await api.get(STUDY_GUIDES_PATH, { skipAuthRedirect: true });
  return normalizeGuideList(res.data);
}

export async function fetchStudyGuideBySlug(slug: string): Promise<PublicStudyGuide | null> {
  const res = await api.get(`${STUDY_GUIDES_PATH}/${encodeURIComponent(slug)}`, {
    skipAuthRedirect: true,
  });
  return normalizeGuideSingle(res.data);
}
