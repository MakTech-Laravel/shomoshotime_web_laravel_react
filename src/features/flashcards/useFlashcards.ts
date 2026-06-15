import { useQuery } from "@tanstack/react-query";

import type { SpecialtySlug } from "@/data/specialtyResources";
import { resolveIdForDeckSlug } from "@/lib/deckResolver";

import {
  fetchFlashcardContents,
  fetchFlashcardsForContent,
  type ApiFlashcard,
  type FlashcardContent,
} from "./flashcardsApi";

export const flashcardsQueryKeys = {
  contents: (specialty: SpecialtySlug) => ["flashcards", "contents", specialty] as const,
  cards: (contentId: number) => ["flashcards", "cards", contentId] as const,
};

export function useFlashcardContents(specialty: SpecialtySlug) {
  return useQuery({
    queryKey: flashcardsQueryKeys.contents(specialty),
    queryFn: () => fetchFlashcardContents(specialty),
  });
}

export function useFlashcardsForDeck(
  specialty: SpecialtySlug,
  deckSlug: string | undefined,
) {
  const contentsQuery = useFlashcardContents(specialty);
  const contentId = resolveIdForDeckSlug(contentsQuery.data ?? [], deckSlug, specialty);
  const cardsQuery = useQuery({
    queryKey: flashcardsQueryKeys.cards(contentId ?? 0),
    queryFn: () => fetchFlashcardsForContent(contentId!),
    enabled: Boolean(contentId),
  });

  const content = (contentsQuery.data ?? []).find((c) => c.id === contentId);

  return {
    contentsQuery,
    cardsQuery,
    contentId,
    content,
    cards: (cardsQuery.data ?? []) as ApiFlashcard[],
    isLoading: contentsQuery.isLoading || cardsQuery.isLoading,
    isError: contentsQuery.isError || cardsQuery.isError,
  };
}

export type { FlashcardContent };
