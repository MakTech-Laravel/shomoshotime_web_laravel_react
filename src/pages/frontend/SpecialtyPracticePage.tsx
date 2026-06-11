import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PracticeQuiz } from "@/components/practice/PracticeQuiz";
import { DEFAULT_DECK_SLUG, getPracticeDeck, type SpecialtySlug } from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { submitPracticeAnswer } from "@/features/practice/practiceApi";
import { usePracticeForDeck } from "@/features/practice/usePractice";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function SpecialtyPracticePage() {
  const { specialty, deck: deckSlug } = useParams<{ specialty: string; deck?: string }>();
  const deck = getPracticeDeck(specialty, deckSlug);
  const { questions: apiQuestions } = usePracticeForDeck(specialty as SpecialtySlug, deckSlug);

  const questions = useMemo(() => apiQuestions, [apiQuestions]);

  useEffect(() => {
    if (deck) {
      document.title = `${deck.title} | Sonographer Pal`;
    }
  }, [deck]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  if (!deckSlug) {
    return <Navigate to={`/${specialty}/practice-questions/${DEFAULT_DECK_SLUG}`} replace />;
  }

  if (!deck) {
    return <Navigate to={`/${specialty}/practice-questions/${DEFAULT_DECK_SLUG}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>
        <h1 className="mb-6 px-2 text-center font-heading text-2xl font-bold text-pretty text-black break-words sm:text-3xl lg:text-[36px]">
          {deck.title}
        </h1>

        <PracticeQuiz
          key={`${specialty}-${deck.slug}`}
          questions={questions}
          onSubmitAnswer={submitPracticeAnswer}
          className="w-full"
        />
      </div>
    </div>
  );
}
