import { useQuery } from "@tanstack/react-query";

import type { SpecialtySlug } from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import {
  fetchAllPublishedStudyGuides,
  fetchStudyGuideBySlug,
  fetchStudyGuidesBySpecialty,
} from "@/features/studyGuides/studyGuidesApi";
import type { PublicStudyGuide } from "@/features/studyGuides/types";

export const studyGuidesQueryKeys = {
  all: ["public-study-guides"] as const,
  specialty: (specialty: SpecialtySlug) => ["public-study-guides", specialty] as const,
  slug: (slug: string) => ["public-study-guide", slug] as const,
};

export function useAllPublishedStudyGuides() {
  return useQuery({
    queryKey: studyGuidesQueryKeys.all,
    queryFn: fetchAllPublishedStudyGuides,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useStudyGuidesForSpecialty(specialty: string | undefined) {
  const slug = specialty && isValidSpecialty(specialty) ? (specialty as SpecialtySlug) : null;

  return useQuery({
    queryKey: slug ? studyGuidesQueryKeys.specialty(slug) : studyGuidesQueryKeys.all,
    queryFn: () => (slug ? fetchStudyGuidesBySpecialty(slug) : Promise.resolve([])),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useStudyGuideBySlug(slug: string | undefined, enabled = true) {
  return useQuery({
    queryKey: slug ? studyGuidesQueryKeys.slug(slug) : ["public-study-guide", "empty"],
    queryFn: () => (slug ? fetchStudyGuideBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug) && enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function studyGuidesToNavChildren(guides: PublicStudyGuide[]) {
  return guides.map((guide) => ({
    label: guide.has_file === false ? guide.title : guide.title,
    slug: guide.slug,
  }));
}
