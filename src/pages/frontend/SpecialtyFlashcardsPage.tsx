import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FlashcardDeck } from "@/components/flashcards/FlashcardDeck";
import { DEFAULT_DECK_SLUG, getFlashcardDeck } from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function SpecialtyFlashcardsPage() {
  const { specialty, deck: deckSlug } = useParams<{ specialty: string; deck?: string }>();
  const deck = getFlashcardDeck(specialty, deckSlug);

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

        <FlashcardDeck key={`${specialty}-${deck.slug}`} cards={deck.cards} className="w-full" />
      </div>
    </div>
  );
}
