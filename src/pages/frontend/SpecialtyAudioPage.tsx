import { Navigate, useParams } from "react-router-dom";

import {
  SPECIALTY_AUDIO_HREF,
  SPECIALTY_DISPLAY_LABELS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

/** Legacy protected route /:specialty/audio — redirects to public /audio/{specialty} when configured. */
export default function SpecialtyAudioPage() {
  const { specialty } = useParams<{ specialty: string }>();

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  const slug = specialty as SpecialtySlug;
  const publicPath = SPECIALTY_AUDIO_HREF[slug];

  if (publicPath) {
    return <Navigate to={publicPath} replace />;
  }

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
