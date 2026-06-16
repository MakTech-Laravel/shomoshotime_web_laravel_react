import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/useAuth";
import type { SpecialtySlug } from "@/data/specialtyResources";
import { SPECIALTY_SLUGS } from "@/data/specialtyResources";
import {
  fetchGuestLearningNavMetadata,
  type PublicDeckMetadata,
} from "@/features/content/publicContentApi";
import { fetchFlashcardContents } from "@/features/flashcards/flashcardsApi";
import { fetchPracticeQuestionSets } from "@/features/practice/practiceApi";
import { useStudyGuideNav } from "@/features/studyGuides/StudyGuideNavContext";
import type { PublicStudyGuide } from "@/features/studyGuides/types";
import { specialtyForContentCategory } from "@/features/studyGuides/specialtyCategory";
import { apiItemsToNavChildren } from "@/lib/navDeckChildren";

type NavChild = { label: string; slug: string };

type LearningNavContextValue = {
  getFlashcardNavChildren: (specialty: SpecialtySlug) => NavChild[];
  getPracticeNavChildren: (specialty: SpecialtySlug) => NavChild[];
  isLoading: boolean;
  isReady: boolean;
};

const LearningNavContext = createContext<LearningNavContextValue | null>(null);

const NAV_STALE_MS = 5 * 60 * 1000;

function groupDeckMetadataBySpecialty(
  items: PublicDeckMetadata[],
): Partial<Record<SpecialtySlug, NavChild[]>> {
  const rawBySpecialty: Partial<Record<SpecialtySlug, PublicDeckMetadata[]>> = {};

  for (const item of items) {
    const specialty = specialtyForContentCategory(item.category);
    if (!specialty) continue;
    rawBySpecialty[specialty] = [...(rawBySpecialty[specialty] ?? []), item];
  }

  const map: Partial<Record<SpecialtySlug, NavChild[]>> = {};
  for (const specialty of SPECIALTY_SLUGS) {
    const list = rawBySpecialty[specialty] ?? [];
    const children = apiItemsToNavChildren(list, { specialty });
    if (children.length > 0) map[specialty] = children;
  }

  return map;
}

function navChildrenFromStudyGuides(
  guidesBySpecialty: Partial<Record<SpecialtySlug, PublicStudyGuide[]>>,
  specialty: SpecialtySlug,
): NavChild[] {
  const guides = guidesBySpecialty[specialty] ?? [];
  if (guides.length === 0) return [];

  return apiItemsToNavChildren(
    guides.map((guide) => ({
      id: guide.id,
      sort_order: guide.sort_order,
      title: guide.title,
    })),
    { specialty },
  );
}

export function LearningNavProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { guidesBySpecialty, isReady: studyGuidesReady } = useStudyGuideNav();

  const guestNavQuery = useQuery({
    queryKey: ["nav", "guest-learning-metadata"],
    queryFn: fetchGuestLearningNavMetadata,
    enabled: !isAuthenticated,
    staleTime: NAV_STALE_MS,
    retry: 1,
  });

  const flashcardQueries = useQueries({
    queries: SPECIALTY_SLUGS.map((specialty) => ({
      queryKey: ["nav", "flashcards", specialty, "auth"],
      queryFn: () => fetchFlashcardContents(specialty),
      enabled: isAuthenticated,
      staleTime: NAV_STALE_MS,
    })),
  });

  const practiceQueries = useQueries({
    queries: SPECIALTY_SLUGS.map((specialty) => ({
      queryKey: ["nav", "practice", specialty, "auth"],
      queryFn: () => fetchPracticeQuestionSets(specialty),
      enabled: isAuthenticated,
      staleTime: NAV_STALE_MS,
    })),
  });

  const flashcardsBySpecialty = useMemo(() => {
    if (!isAuthenticated) {
      return groupDeckMetadataBySpecialty(guestNavQuery.data?.flashcards ?? []);
    }

    const map: Partial<Record<SpecialtySlug, NavChild[]>> = {};
    SPECIALTY_SLUGS.forEach((specialty, i) => {
      const data = flashcardQueries[i]?.data ?? [];
      const children = apiItemsToNavChildren(data, { specialty });
      if (children.length > 0) map[specialty] = children;
    });
    return map;
  }, [flashcardQueries, guestNavQuery.data?.flashcards, isAuthenticated]);

  const practiceBySpecialty = useMemo(() => {
    if (!isAuthenticated) {
      return groupDeckMetadataBySpecialty(guestNavQuery.data?.practice ?? []);
    }

    const map: Partial<Record<SpecialtySlug, NavChild[]>> = {};
    SPECIALTY_SLUGS.forEach((specialty, i) => {
      const data = practiceQueries[i]?.data ?? [];
      const children = apiItemsToNavChildren(data, { specialty });
      if (children.length > 0) map[specialty] = children;
    });
    return map;
  }, [guestNavQuery.data?.practice, isAuthenticated, practiceQueries]);

  const guestNavLoaded = guestNavQuery.isFetched;
  const guestNavHasDeckData =
    (guestNavQuery.data?.flashcards.length ?? 0) > 0 ||
    (guestNavQuery.data?.practice.length ?? 0) > 0;

  const getFlashcardNavChildren = useCallback(
    (specialty: SpecialtySlug) => {
      const fromDecks = flashcardsBySpecialty[specialty] ?? [];
      if (fromDecks.length > 0 || isAuthenticated) return fromDecks;
      if (!guestNavLoaded || guestNavHasDeckData || !studyGuidesReady) return [];
      return navChildrenFromStudyGuides(guidesBySpecialty, specialty);
    },
    [
      flashcardsBySpecialty,
      guestNavHasDeckData,
      guestNavLoaded,
      guidesBySpecialty,
      isAuthenticated,
      studyGuidesReady,
    ],
  );

  const getPracticeNavChildren = useCallback(
    (specialty: SpecialtySlug) => {
      const fromSets = practiceBySpecialty[specialty] ?? [];
      if (fromSets.length > 0 || isAuthenticated) return fromSets;
      if (!guestNavLoaded || guestNavHasDeckData || !studyGuidesReady) return [];
      return navChildrenFromStudyGuides(guidesBySpecialty, specialty);
    },
    [
      guestNavHasDeckData,
      guestNavLoaded,
      guidesBySpecialty,
      isAuthenticated,
      practiceBySpecialty,
      studyGuidesReady,
    ],
  );

  const isLoading = isAuthenticated
    ? flashcardQueries.some((q) => q.isLoading) || practiceQueries.some((q) => q.isLoading)
    : guestNavQuery.isLoading;

  const isReady = isAuthenticated
    ? flashcardQueries.every((q) => q.isFetched) && practiceQueries.every((q) => q.isFetched)
    : guestNavQuery.isFetched;

  const value = useMemo(
    () => ({
      getFlashcardNavChildren,
      getPracticeNavChildren,
      isLoading,
      isReady,
    }),
    [getFlashcardNavChildren, getPracticeNavChildren, isLoading, isReady],
  );

  return <LearningNavContext.Provider value={value}>{children}</LearningNavContext.Provider>;
}

export function useLearningNav() {
  const ctx = useContext(LearningNavContext);
  if (!ctx) {
    throw new Error("useLearningNav must be used within LearningNavProvider");
  }
  return ctx;
}
