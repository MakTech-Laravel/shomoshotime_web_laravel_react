import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import {
  SPECIALTY_DISPLAY_LABELS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { useStudyGuideNav } from "@/features/studyGuides/StudyGuideNavContext";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function SpecialtyLandingPage() {
  const location = useLocation();
  const specialty = location.pathname.replace(/^\//, "").split("/")[0];
  const { getNavChildren, isReady } = useStudyGuideNav();

  useEffect(() => {
    if (specialty && isValidSpecialty(specialty)) {
      document.title = `${SPECIALTY_DISPLAY_LABELS[specialty as SpecialtySlug]} | Sonographer Pal`;
    }
  }, [specialty]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  const slug = specialty as SpecialtySlug;
  const firstGuide = getNavChildren(slug)[0];

  if (isReady && firstGuide) {
    return <Navigate to={`/${specialty}/study-guides/${firstGuide.slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "flex flex-col items-center py-16 text-center")}>
        <h1 className="font-heading text-3xl font-bold text-black">
          {SPECIALTY_DISPLAY_LABELS[slug]} Sonography
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base text-[#444444]">
          {isReady
            ? "Study materials for this specialty are coming soon."
            : "Loading study materials…"}
        </p>
      </div>
    </div>
  );
}
