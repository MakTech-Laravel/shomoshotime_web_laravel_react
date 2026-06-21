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

function AudioPlayerSkeleton({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>
        <h1 className="mb-6 text-center font-heading text-2xl font-bold text-black sm:text-3xl lg:text-[36px]">
          {title}
        </h1>
        <div
          className="mx-auto w-full max-w-4xl animate-pulse overflow-hidden rounded-sm border border-[#c8c8c8] bg-white"
          aria-hidden
        >
          <div className="flex flex-col md:flex-row">
            <div className="h-32 bg-[#d0e6f2] md:h-48 md:w-52" />
            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="h-4 w-1/3 rounded bg-[#e5e7eb]" />
              <div className="h-6 w-2/3 rounded bg-[#e5e7eb]" />
              <div className="mt-4 h-2 w-full rounded bg-[#f0f0f0]" />
            </div>
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 font-sans text-sm text-[#666666]">
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-[#b8860b] border-t-transparent" />
          Loading audio guides…
        </p>
      </div>
    </div>
  );
}

export function SpecialtyStaticAudioPage() {
  const { specialty } = useParams<{ specialty: string }>();

  const slug = specialty && isValidSpecialty(specialty) ? (specialty as SpecialtySlug) : null;
  const { data: apiGuides, isLoading, isError, refetch, isFetching } = useAudioGuidesForSpecialty(
    slug ?? undefined,
  );

  const apiTracks = useMemo(
    () => (slug ? audioGuidesToPlayerTracks(apiGuides ?? [], slug) : []),
    [apiGuides, slug],
  );

  const tracks = useMemo(() => {
    if (apiTracks.length > 0) {
      return apiTracks;
    }
    if (slug === "spi") {
      return [...SPI_AUDIO_TRACKS].reverse();
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

  if (isError) {
    return (
      <div className="min-h-screen bg-[#fdf5ee]">
        <div className={cn(container, "flex flex-col items-center py-16 text-center")}>
          <h1 className="font-heading text-3xl font-bold text-black">{title}</h1>
          <p className="mt-4 max-w-xl font-sans text-base text-[#c62828]">
            Could not load audio guides. Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-6 rounded-lg border border-[#d0d0d0] bg-white px-4 py-2 font-sans text-sm font-medium text-[#333333] hover:bg-[#f5f5f5]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && tracks.length === 0) {
    return <AudioPlayerSkeleton title={title} />;
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
        {isFetching && apiTracks.length === 0 && slug === "spi" ? (
          <p className="mb-4 font-sans text-xs text-[#888888]">Refreshing playlist…</p>
        ) : null}
        <AudioPlayer tracks={tracks} className="mx-auto w-full max-w-4xl" />
      </div>
    </div>
  );
}

export default SpecialtyStaticAudioPage;
