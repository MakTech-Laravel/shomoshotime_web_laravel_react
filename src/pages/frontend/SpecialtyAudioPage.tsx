import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import { AudioPlayer } from "@/components/ui/AudioPlayer";
import {
  SPECIALTY_AUDIO_HREF,
  SPECIALTY_DISPLAY_LABELS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import { SPI_AUDIO_TRACKS } from "@/data/audioGuides";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function SpecialtyAudioPage() {
  const { specialty } = useParams<{ specialty: string }>();

  useEffect(() => {
    if (specialty && isValidSpecialty(specialty)) {
      document.title = `${SPECIALTY_DISPLAY_LABELS[specialty as SpecialtySlug]} Audio | Sonographer Pal`;
    }
  }, [specialty]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  const slug = specialty as SpecialtySlug;

  if (slug === "spi" || specialty === "spi") {
    return <Navigate to="/audio/spi" replace />;
  }

  if (!SPECIALTY_AUDIO_HREF[slug]) {
    return (
      <div className="min-h-screen bg-[#fdf5ee]">
        <div className={cn(container, "flex flex-col items-center py-16 text-center")}>
          <h1 className="font-heading text-3xl font-bold text-black">
            {SPECIALTY_DISPLAY_LABELS[slug]} Audio Study Guides
          </h1>
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
          {SPECIALTY_DISPLAY_LABELS[slug]} Audio Study Guides
        </h1>
        <AudioPlayer tracks={SPI_AUDIO_TRACKS} className="mx-auto w-full max-w-4xl" />
      </div>
    </div>
  );
}
