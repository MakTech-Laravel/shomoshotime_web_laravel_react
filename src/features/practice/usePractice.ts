import { useQuery } from "@tanstack/react-query";

import type { SpecialtySlug } from "@/data/specialtyResources";
import { resolveIdForDeckSlug } from "@/lib/deckResolver";

import { toPracticeQuestion } from "./mapQuestion";
import { fetchPracticeQuestionSets, fetchQuestionsForSet, sortPracticeQuestions } from "./practiceApi";

export const practiceQueryKeys = {
  sets: (specialty: SpecialtySlug) => ["practice", "sets", specialty] as const,
  questions: (setId: number) => ["practice", "questions", setId] as const,
};

export function usePracticeForDeck(specialty: SpecialtySlug, deckSlug: string | undefined) {
  const setsQuery = useQuery({
    queryKey: practiceQueryKeys.sets(specialty),
    queryFn: () => fetchPracticeQuestionSets(specialty),
  });

  const setId = resolveIdForDeckSlug(setsQuery.data ?? [], deckSlug, specialty);
  const questionsQuery = useQuery({
    queryKey: practiceQueryKeys.questions(setId ?? 0),
    queryFn: () => fetchQuestionsForSet(setId!),
    enabled: Boolean(setId),
  });

  const questionSet = (setsQuery.data ?? []).find((s) => s.id === setId);
  const questions = sortPracticeQuestions(questionsQuery.data ?? []).map(toPracticeQuestion);

  return {
    setsQuery,
    questionsQuery,
    setId,
    questionSet,
    questions,
    isLoading: setsQuery.isLoading || questionsQuery.isLoading,
    isError: setsQuery.isError || questionsQuery.isError,
  };
}
