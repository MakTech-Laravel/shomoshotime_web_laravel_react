import { useCallback, useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";
import { getFlashcardDeck, type SpecialtySlug } from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { recordFlashcardProgress } from "@/features/flashcards/flashcardsApi";
import { useFlashcardContents, useFlashcardsForDeck } from "@/features/flashcards/useFlashcards";
import { container } from "@/lib/container";
import { firstDeckSlugForSets } from "@/lib/navDeckChildren";
import { cn } from "@/lib/utils";

export default function SpecialtyFlashcardsPage() {
  const { specialty, deck: deckSlug } = useParams<{ specialty: string; deck?: string }>();
  const specialtySlug = specialty as SpecialtySlug;
  const deck = getFlashcardDeck(specialty, deckSlug);
  const { cards: apiCards, contentId, content } = useFlashcardsForDeck(
    specialtySlug,
    deckSlug,
  );
  const { data: contents, isFetched: contentsFetched } = useFlashcardContents(specialtySlug);

  const defaultDeckSlug = useMemo(
    () => firstDeckSlugForSets(contents ?? [], specialtySlug),
    [contents, specialtySlug],
  );
  const pageTitle =
    content?.title ?? (specialty === "spi" ? deck?.title : undefined) ?? "Flashcards";

  const cards = useMemo(
    () =>
      apiCards.map((c) => ({
        id: c.id,
        question: c.question,
        answer: c.answer,
      })),
    [apiCards],
  );

  const handleCardProgress = useCallback(
    (cardId: number) => {
      if (!contentId) return;
      void recordFlashcardProgress(contentId, cardId).catch(() => {});
    },
    [contentId],
  );

  useEffect(() => {
    document.title = `${pageTitle} | Sonographer Pal`;
  }, [pageTitle]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  if (!deckSlug && contentsFetched && defaultDeckSlug) {
    return <Navigate to={`/${specialty}/flashcards/${defaultDeckSlug}`} replace />;
  }

  if (deckSlug && contentsFetched && contentId == null && defaultDeckSlug) {
    return <Navigate to={`/${specialty}/flashcards/${defaultDeckSlug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>
        <h1 className="mb-6 px-2 text-center font-heading text-2xl font-bold text-pretty text-black break-words sm:text-3xl lg:text-[36px]">
          {pageTitle}
        </h1>

        <FlashcardDeck
          key={`${specialty}-${deckSlug}`}
          cards={cards}
          onCardProgress={handleCardProgress}
          className="w-full"
        />
      </div>
    </div>
  );
}
