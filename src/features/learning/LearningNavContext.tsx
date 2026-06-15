import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/useAuth";
import type { SpecialtySlug } from "@/data/specialtyResources";
import { SPECIALTY_SLUGS } from "@/data/specialtyResources";
import {
  fetchAllPublicFlashcardDecks,
  fetchAllPublicPracticeSets,
  type PublicDeckMetadata,
} from "@/features/content/publicContentApi";
import { fetchFlashcardContents } from "@/features/flashcards/flashcardsApi";
import { fetchPracticeQuestionSets } from "@/features/practice/practiceApi";
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

export function LearningNavProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const publicFlashcardsQuery = useQuery({
    queryKey: ["nav", "flashcards", "public-all"],
    queryFn: fetchAllPublicFlashcardDecks,
    enabled: !isAuthenticated,
    staleTime: NAV_STALE_MS,
    retry: 1,
  });

  const publicPracticeQuery = useQuery({
    queryKey: ["nav", "practice", "public-all"],
    queryFn: fetchAllPublicPracticeSets,
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
      return groupDeckMetadataBySpecialty(publicFlashcardsQuery.data ?? []);
    }

    const map: Partial<Record<SpecialtySlug, NavChild[]>> = {};
    SPECIALTY_SLUGS.forEach((specialty, i) => {
      const data = flashcardQueries[i]?.data ?? [];
      const children = apiItemsToNavChildren(data, { specialty });
      if (children.length > 0) map[specialty] = children;
    });
    return map;
  }, [flashcardQueries, isAuthenticated, publicFlashcardsQuery.data]);

  const practiceBySpecialty = useMemo(() => {
    if (!isAuthenticated) {
      return groupDeckMetadataBySpecialty(publicPracticeQuery.data ?? []);
    }

    const map: Partial<Record<SpecialtySlug, NavChild[]>> = {};
    SPECIALTY_SLUGS.forEach((specialty, i) => {
      const data = practiceQueries[i]?.data ?? [];
      const children = apiItemsToNavChildren(data, { specialty });
      if (children.length > 0) map[specialty] = children;
    });
    return map;
  }, [isAuthenticated, practiceQueries, publicPracticeQuery.data]);

  const isLoading = isAuthenticated
    ? flashcardQueries.some((q) => q.isLoading) || practiceQueries.some((q) => q.isLoading)
    : publicFlashcardsQuery.isLoading || publicPracticeQuery.isLoading;

  const isReady = isAuthenticated
    ? flashcardQueries.every((q) => q.isFetched) && practiceQueries.every((q) => q.isFetched)
    : publicFlashcardsQuery.isFetched && publicPracticeQuery.isFetched;

  const getFlashcardNavChildren = useCallback(
    (specialty: SpecialtySlug) => flashcardsBySpecialty[specialty] ?? [],
    [flashcardsBySpecialty],
  );

  const getPracticeNavChildren = useCallback(
    (specialty: SpecialtySlug) => practiceBySpecialty[specialty] ?? [],
    [practiceBySpecialty],
  );

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
