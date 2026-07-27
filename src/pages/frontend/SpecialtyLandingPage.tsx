import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { SpecialtyOverviewView } from "@/components/specialty-overview/SpecialtyOverviewView";
import { SPECIALTY_OVERVIEW } from "@/data/specialtyOverviewContent";
import { type SpecialtySlug } from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";

export default function SpecialtyLandingPage() {
  const location = useLocation();
  const specialty = location.pathname.replace(/^\//, "").split("/")[0];

  useEffect(() => {
    if (specialty && isValidSpecialty(specialty)) {
      const content = SPECIALTY_OVERVIEW[specialty as SpecialtySlug];
      document.title = `${content.metaTitle} | Sonographer Pal`;
    }
  }, [specialty]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  const slug = specialty as SpecialtySlug;
  const content = SPECIALTY_OVERVIEW[slug];

  return <SpecialtyOverviewView content={content} />;
}
