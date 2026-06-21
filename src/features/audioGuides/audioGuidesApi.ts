import type { AudioPlayerTrack } from "@/components/ui/AudioPlayer";
import { api } from "@/api/client";
import { normalizeApiAssetUrl } from "@/lib/pdfFetchUrl";
import { unwrapLaravelData } from "@/api/laravelResponse";
import type { PublicAudioGuide } from "@/features/audioGuides/types";
import {
  SPECIALTY_DISPLAY_LABELS,
  type SpecialtySlug,
} from "@/data/specialtyResources";

const AUDIO_GUIDES_PATH = "/content/audio-guides";

function normalizeAudioGuide(raw: unknown): PublicAudioGuide | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : Number(o.id);
  if (!Number.isFinite(id)) return null;

  const fileUrl =
    typeof o.file_url === "string" ? normalizeApiAssetUrl(o.file_url) : "";
  const title = typeof o.title === "string" ? o.title : "";
  if (!fileUrl || !title || o.has_file !== true) return null;

  const displayDuration =
    typeof o.display_duration === "string"
      ? o.display_duration
      : typeof o.subtitle === "string"
        ? o.subtitle
        : "";

  return {
    id,
    sort_order: typeof o.sort_order === "number" ? o.sort_order : 0,
    title,
    subtitle: typeof o.subtitle === "string" ? o.subtitle : "",
    display_duration: displayDuration,
    category: typeof o.category === "string" ? o.category : "",
    specialty: typeof o.specialty === "string" ? o.specialty : null,
    slug: typeof o.slug === "string" ? o.slug : "",
    file_url: fileUrl,
    has_file: true,
    updated_at:
      typeof o.updated_at === "string"
        ? o.updated_at
        : typeof o.updated_at === "number"
          ? String(o.updated_at)
          : undefined,
  };
}

function normalizeAudioGuideList(body: unknown): PublicAudioGuide[] {
  const data = unwrapLaravelData<unknown>(body);
  const rows = Array.isArray(data) ? data : [];
  return rows.map(normalizeAudioGuide).filter((g): g is PublicAudioGuide => g !== null);
}

export async function fetchAudioGuidesBySpecialty(
  specialty: SpecialtySlug,
): Promise<PublicAudioGuide[]> {
  const res = await api.get(AUDIO_GUIDES_PATH, {
    params: { specialty },
    skipAuthRedirect: true,
  });
  return normalizeAudioGuideList(res.data);
}

export function audioGuidesToPlayerTracks(
  guides: PublicAudioGuide[],
  specialty: SpecialtySlug,
): AudioPlayerTrack[] {
  const album = `Audio (${SPECIALTY_DISPLAY_LABELS[specialty]})`;

  return [...guides]
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .map((guide) => ({
      src: guide.file_url,
      title: guide.title,
      artist: "sonographerpal",
      album,
      displayDuration: guide.display_duration || undefined,
    }));
}
