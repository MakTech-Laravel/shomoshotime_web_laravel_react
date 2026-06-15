import "@/lib/configurePdfWorker";
import { useEffect, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PracticeQuiz } from "@/components/practice/PracticeQuiz";
import {
  getPracticeDeck,
  SPECIALTY_DISPLAY_LABELS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import { isValidSpecialty } from "@/data/studyGuideContent";
import { submitPracticeAnswer } from "@/features/practice/practiceApi";
import { usePracticeForDeck } from "@/features/practice/usePractice";
import { container } from "@/lib/container";
import { firstDeckSlugForSets } from "@/lib/navDeckChildren";
import { cn } from "@/lib/utils";

export default function SpecialtyPracticePage() {
  const { specialty, deck: deckSlug } = useParams<{ specialty: string; deck?: string }>();
  const specialtySlug = specialty as SpecialtySlug;
  const deck = getPracticeDeck(specialty, deckSlug);
  const { questions: apiQuestions, setId, questionSet, setsQuery } = usePracticeForDeck(
    specialtySlug,
    deckSlug,
  );

  const pageTitle =
    questionSet?.title ??
    (specialty === "spi" ? deck?.title : undefined) ??
    "Practice Questions";

  const defaultDeckSlug = useMemo(
    () => firstDeckSlugForSets(setsQuery.data ?? [], specialtySlug),
    [setsQuery.data, specialtySlug],
  );

  const questions = useMemo(() => apiQuestions, [apiQuestions]);

  useEffect(() => {
    document.title = `${pageTitle} | Sonographer Pal`;
  }, [pageTitle]);

  if (!specialty || !isValidSpecialty(specialty)) {
    return <Navigate to="/" replace />;
  }

  if (!deckSlug && setsQuery.isFetched && defaultDeckSlug) {
    return <Navigate to={`/${specialty}/practice-questions/${defaultDeckSlug}`} replace />;
  }

  if (deckSlug && setsQuery.isFetched && setId == null && defaultDeckSlug) {
    return <Navigate to={`/${specialty}/practice-questions/${defaultDeckSlug}`} replace />;
  }

  const specialtyLabel = SPECIALTY_DISPLAY_LABELS[specialtySlug];

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>
        <Link
          to={`/${specialty}/practice-questions/${deckSlug ?? defaultDeckSlug ?? ""}`}
          className="mb-4 inline-flex items-center gap-1 self-start font-sans text-sm font-medium text-[#666666] hover:text-black"
          onClick={(e) => {
            if (!deckSlug && !defaultDeckSlug) e.preventDefault();
          }}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to Practice
        </Link>

        <div className="mb-6 flex w-full flex-col items-center gap-2 px-2">
          <h1 className="text-center font-heading text-2xl font-bold text-pretty text-black break-words sm:text-3xl lg:text-[36px]">
            {pageTitle}
          </h1>
          {specialtyLabel ? (
            <span className="rounded border border-[#d0d0d0] bg-white px-2.5 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-[#666666]">
              {specialtyLabel}
            </span>
          ) : null}
        </div>

        <PracticeQuiz
          key={`${specialty}-${deckSlug}-${setId}`}
          questions={questions}
          onSubmitAnswer={submitPracticeAnswer}
          className="w-full"
        />
      </div>
    </div>
  );
}
