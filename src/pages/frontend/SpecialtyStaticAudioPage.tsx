import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";

import { AudioPlayer } from "@/components/ui/AudioPlayer";
import {
  SPECIALTY_DISPLAY_LABELS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import { SPI_AUDIO_TRACKS } from "@/data/audioGuides";
import { useAudioGuidesForSpecialty } from "@/features/audioGuides/usePublicAudioGuides";
import { audioGuidesToPlayerTracks } from "@/features/audioGuides/audioGuidesApi";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export function SpecialtyStaticAudioPage() {
  const { specialty } = useParams<{ specialty: string }>();

  const slug = specialty && isValidSpecialty(specialty) ? (specialty as SpecialtySlug) : null;
  const { data: apiGuides, isLoading } = useAudioGuidesForSpecialty(slug ?? undefined);

  const apiTracks = useMemo(
    () => (slug ? audioGuidesToPlayerTracks(apiGuides ?? [], slug) : []),
    [apiGuides, slug],
  );

  const tracks = useMemo(() => {
    if (apiTracks.length > 0) {
      return apiTracks;
    }
    if (slug === "spi") {
      return SPI_AUDIO_TRACKS;
    }
    return [];
  }, [apiTracks, slug]);

  useEffect(() => {
    if (slug) {
      document.title = `${SPECIALTY_DISPLAY_LABELS[slug]} Audio | Sonographer Pal`;
    }
  }, [slug]);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const title = `${SPECIALTY_DISPLAY_LABELS[slug]} Audio Study Guides`;

  if (isLoading && tracks.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdf5ee]">
        <div className={cn(container, "flex flex-col items-center py-16 text-center")}>
          <h1 className="font-heading text-3xl font-bold text-black">{title}</h1>
          <p className="mt-4 font-sans text-base text-[#666666]">Loading audio guides…</p>
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdf5ee]">
        <div className={cn(container, "flex flex-col items-center py-16 text-center")}>
          <h1 className="font-heading text-3xl font-bold text-black">{title}</h1>
          <p className="mt-4 max-w-xl font-sans text-base text-[#444444]">
            Audio guides for this specialty are coming soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>
        <h1 className="mb-6 text-center font-heading text-2xl font-bold text-black sm:text-3xl lg:text-[36px]">
          {title}
        </h1>
        <AudioPlayer tracks={tracks} className="mx-auto w-full max-w-4xl" />
      </div>
    </div>
  );
}

export default SpecialtyStaticAudioPage;
