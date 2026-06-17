import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import { AudioPlayer } from "@/components/ui/AudioPlayer";
import {
  SPECIALTY_DISPLAY_LABELS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import { getAudioTracksForSpecialty, hasAudioTracksForSpecialty } from "@/data/audioGuides";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function SpecialtyStaticAudioPage() {
  const { specialty } = useParams<{ specialty: string }>();

  const slug = specialty && isValidSpecialty(specialty) ? (specialty as SpecialtySlug) : null;

  useEffect(() => {
    if (slug) {
      document.title = `${SPECIALTY_DISPLAY_LABELS[slug]} Audio | Sonographer Pal`;
    }
  }, [slug]);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const tracks = getAudioTracksForSpecialty(slug);
  const title = `${SPECIALTY_DISPLAY_LABELS[slug]} Audio Study Guides`;

  if (!hasAudioTracksForSpecialty(slug)) {
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
