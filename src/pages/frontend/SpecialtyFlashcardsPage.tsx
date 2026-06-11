import { useCallback, useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";
import { DEFAULT_DECK_SLUG, getFlashcardDeck, type SpecialtySlug } from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { recordFlashcardProgress } from "@/features/flashcards/flashcardsApi";
import { useFlashcardsForDeck } from "@/features/flashcards/useFlashcards";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function SpecialtyFlashcardsPage() {
  const { specialty, deck: deckSlug } = useParams<{ specialty: string; deck?: string }>();
  const deck = getFlashcardDeck(specialty, deckSlug);
  const { cards: apiCards, contentId } = useFlashcardsForDeck(
    specialty as SpecialtySlug,
    deckSlug,
  );

  const cards = useMemo(() => {
    if (apiCards.length > 0) {
      return apiCards.map((c) => ({
        id: c.id,
        question: c.question,
        answer: c.answer,
      }));
    }
    return deck?.cards ?? [];
  }, [apiCards, deck?.cards]);

  const handleCardProgress = useCallback(
    (cardId: number) => {
      if (!contentId) return;
      void recordFlashcardProgress(contentId, cardId).catch(() => {});
    },
    [contentId],
  );

  useEffect(() => {
    if (deck) {
      document.title = `${deck.title} | Sonographer Pal`;
    }
  }, [deck]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  if (!deckSlug) {
    return <Navigate to={`/${specialty}/flashcards/${DEFAULT_DECK_SLUG}`} replace />;
  }

  if (!deck) {
    return <Navigate to={`/${specialty}/flashcards/${DEFAULT_DECK_SLUG}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>
        <h1 className="mb-6 px-2 text-center font-heading text-2xl font-bold text-pretty text-black break-words sm:text-3xl lg:text-[36px]">
          {deck.title}
        </h1>

        <FlashcardDeck
          key={`${specialty}-${deck.slug}`}
          cards={cards}
          onCardProgress={handleCardProgress}
          className="w-full"
        />
      </div>
    </div>
  );
}
