import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";

import { useAuth } from "@/auth/useAuth";
import type { SpecialtySlug } from "@/data/specialtyResources";
import { SPECIALTY_SLUGS } from "@/data/specialtyResources";
import { fetchFlashcardContents } from "@/features/flashcards/flashcardsApi";
import { fetchPracticeQuestionSets } from "@/features/practice/practiceApi";
import { apiItemsToNavChildren } from "@/lib/navDeckChildren";

type NavChild = { label: string; slug: string };

type LearningNavContextValue = {
  getFlashcardNavChildren: (specialty: SpecialtySlug) => NavChild[];
  getPracticeNavChildren: (specialty: SpecialtySlug) => NavChild[];
  isLoading: boolean;
  isReady: boolean;
};

const LearningNavContext = createContext<LearningNavContextValue | null>(null);

export function LearningNavProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const flashcardQueries = useQueries({
    queries: SPECIALTY_SLUGS.map((specialty) => ({
      queryKey: ["nav", "flashcards", specialty],
      queryFn: () => fetchFlashcardContents(specialty),
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const practiceQueries = useQueries({
    queries: SPECIALTY_SLUGS.map((specialty) => ({
      queryKey: ["nav", "practice", specialty],
      queryFn: () => fetchPracticeQuestionSets(specialty),
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const flashcardsBySpecialty = useMemo(() => {
    const map: Partial<Record<SpecialtySlug, NavChild[]>> = {};
    SPECIALTY_SLUGS.forEach((specialty, i) => {
      const data = flashcardQueries[i]?.data ?? [];
      const children = apiItemsToNavChildren(data);
      if (children.length > 0) map[specialty] = children;
    });
    return map;
  }, [flashcardQueries]);

  const practiceBySpecialty = useMemo(() => {
    const map: Partial<Record<SpecialtySlug, NavChild[]>> = {};
    SPECIALTY_SLUGS.forEach((specialty, i) => {
      const data = practiceQueries[i]?.data ?? [];
      const children = apiItemsToNavChildren(data);
      if (children.length > 0) map[specialty] = children;
    });
    return map;
  }, [practiceQueries]);

  const isLoading =
    flashcardQueries.some((q) => q.isLoading) || practiceQueries.some((q) => q.isLoading);
  const isReady =
    !isAuthenticated ||
    (flashcardQueries.every((q) => q.isFetched) && practiceQueries.every((q) => q.isFetched));

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
