import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import type { SpecialtySlug } from "@/data/specialtyResources";
import { specialtyForContentCategory } from "@/features/studyGuides/specialtyCategory";
import type { PublicStudyGuide } from "@/features/studyGuides/types";
import {
  studyGuidesToNavChildren,
  useAllPublishedStudyGuides,
} from "@/features/studyGuides/usePublicStudyGuides";

type NavChild = { label: string; slug: string };

type StudyGuideNavContextValue = {
  guidesBySpecialty: Partial<Record<SpecialtySlug, PublicStudyGuide[]>>;
  getNavChildren: (specialty: SpecialtySlug) => NavChild[];
  isLoading: boolean;
  isReady: boolean;
};

const StudyGuideNavContext = createContext<StudyGuideNavContextValue | null>(null);

export function StudyGuideNavProvider({ children }: { children: ReactNode }) {
  const { data: guides = [], isLoading, isFetched } = useAllPublishedStudyGuides();

  const guidesBySpecialty = useMemo(() => {
    const grouped: Partial<Record<SpecialtySlug, PublicStudyGuide[]>> = {};

    for (const guide of guides) {
      const specialty = specialtyForContentCategory(guide.category);
      if (!specialty) continue;
      grouped[specialty] = [...(grouped[specialty] ?? []), guide];
    }

    for (const key of Object.keys(grouped) as SpecialtySlug[]) {
      grouped[key]?.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }

    return grouped;
  }, [guides]);

  const getNavChildren = useCallback(
    (specialty: SpecialtySlug) => {
      const list = guidesBySpecialty[specialty] ?? [];
      return studyGuidesToNavChildren(list);
    },
    [guidesBySpecialty],
  );

  const value = useMemo(
    () => ({
      guidesBySpecialty,
      getNavChildren,
      isLoading,
      isReady: isFetched,
    }),
    [guidesBySpecialty, getNavChildren, isLoading, isFetched],
  );

  return (
    <StudyGuideNavContext.Provider value={value}>{children}</StudyGuideNavContext.Provider>
  );
}

export function useStudyGuideNav() {
  const ctx = useContext(StudyGuideNavContext);
  if (!ctx) {
    throw new Error("useStudyGuideNav must be used within StudyGuideNavProvider");
  }
  return ctx;
}

export function findStudyGuideInNav(
  guidesBySpecialty: Partial<Record<SpecialtySlug, PublicStudyGuide[]>>,
  specialty: string,
  slug: string,
): PublicStudyGuide | undefined {
  return guidesBySpecialty[specialty as SpecialtySlug]?.find((g) => g.slug === slug);
}
