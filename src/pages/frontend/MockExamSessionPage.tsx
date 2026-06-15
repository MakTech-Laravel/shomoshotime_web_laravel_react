import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { PracticeQuiz } from "@/components/practice/PracticeQuiz";
import {
  fetchMockExamQuestions,
  fetchMockExamResults,
  submitMockAnswer,
} from "@/features/mockExams/mockExamsApi";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

export default function MockExamSessionPage() {
  const { setId: setIdParam } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const setId = Number(setIdParam);
  const [showResults, setShowResults] = useState(false);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["mock-exam", "questions", setId],
    queryFn: () => fetchMockExamQuestions(setId),
    enabled: Number.isFinite(setId),
  });

  const { data: results = [], refetch: refetchResults } = useQuery({
    queryKey: ["mock-exam", "results", setId],
    queryFn: () => fetchMockExamResults(setId),
    enabled: Number.isFinite(setId) && showResults,
  });

  const latestResult = useMemo(
    () => results[results.length - 1],
    [results],
  );

  useEffect(() => {
    document.title = "Mock Exam | Sonographer Pal";
  }, []);

  if (!Number.isFinite(setId)) {
    return <Navigate to="/mock-exams" replace />;
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#fdf5ee]">
        <div className={cn(container, "flex flex-col items-center py-12 lg:py-16")}>
          <h1 className="text-center font-heading text-2xl font-bold text-black sm:text-3xl">
            Mock Exam Complete
          </h1>
          {latestResult ? (
            <div className="mt-8 w-full max-w-md rounded-md border border-[#e5e7eb] bg-white p-8 text-center shadow-sm">
              <p className="font-sans text-base text-[#333333]">
                Attempt {latestResult.attempt_number} of 3
              </p>
              <p className="mt-4 font-heading text-4xl font-bold text-[#2E7D32]">
                {latestResult.score_percentage != null
                  ? `${latestResult.score_percentage.toFixed(0)}%`
                  : "—"}
              </p>
              <p className="mt-2 font-sans text-sm text-[#666666]">
                {latestResult.correct_answers} correct · {latestResult.wrong_answers} incorrect
              </p>
            </div>
          ) : (
            <p className="mt-8 font-sans text-base text-[#666666]">Loading results…</p>
          )}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/mock-exams"
              className="rounded-lg bg-[#FFC107] px-6 py-2.5 font-sans text-sm font-semibold text-black hover:bg-[#e6ac00]"
            >
              Back to Mock Exams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "flex w-full flex-col items-center py-12 lg:py-16")}>
        <Link
          to="/mock-exams"
          className="mb-4 inline-flex items-center gap-1 self-start font-sans text-sm font-medium text-[#666666] hover:text-black"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to Mock Exams
        </Link>

        <h1 className="mb-6 text-center font-heading text-2xl font-bold text-black sm:text-3xl">
          Mock Exam
        </h1>

        {isLoading ? (
          <p className="font-sans text-base text-[#666666]">Loading questions…</p>
        ) : (
          <PracticeQuiz
            key={setId}
            questions={questions}
            onSubmitAnswer={async (questionSetId, questionId, answer) => {
              const result = await submitMockAnswer(questionSetId, questionId, answer);
              return result;
            }}
            className="w-full"
          />
        )}

        {questions.length > 0 ? (
          <button
            type="button"
            className="mt-8 font-sans text-sm text-[#666666] underline hover:text-black"
            onClick={() => {
              void refetchResults().then(() => setShowResults(true));
              navigate(`/mock-exams/${setId}?done=1`, { replace: true });
              setShowResults(true);
            }}
          >
            Finish and view results
          </button>
        ) : null}
      </div>
    </div>
  );
}
