import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  SPECIALTY_DISPLAY_LABELS,
  SPECIALTY_SLUGS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import {
  fetchMockExamSets,
  startMockTest,
  type MockExamSet,
} from "@/features/mockExams/mockExamsApi";
import { container } from "@/lib/container";
import { categoryMatchesSpecialty } from "@/lib/specialtyCategory";
import { cn } from "@/lib/utils";

function MockExamCardSkeleton() {
  return (
    <article className="flex animate-pulse flex-col rounded-md border border-[#e5e7eb] bg-white p-6 shadow-sm">
      <div className="h-6 w-3/4 rounded bg-[#e5e7eb]" />
      <div className="mt-3 h-4 w-1/2 rounded bg-[#f0f0f0]" />
      <div className="mt-3 h-4 w-2/3 rounded bg-[#f0f0f0]" />
      <div className="mt-5 h-10 rounded-lg bg-[#f0f0f0]" />
    </article>
  );
}

function MockExamCard({
  exam,
  onStart,
  onResume,
  isStarting,
  startingId,
}: {
  exam: MockExamSet;
  onStart: (id: number) => void;
  onResume: (id: number) => void;
  isStarting: boolean;
  startingId: number | null;
}) {
  const completedAttempts = exam.attempts_used;
  const bestScore = exam.best_score_percentage;
  const inProgress = !exam.can_start && exam.attempts_remaining > 0;
  const isPending = isStarting && startingId === exam.id;

  return (
    <article className="flex flex-col rounded-md border border-[#e5e7eb] bg-white p-6 shadow-sm">
      <h3 className="font-heading text-lg font-bold text-black">
        {exam.title}
      </h3>
      {/* {exam.subtitle ? (
        <p className="mt-1 font-sans text-sm text-[#666666]">{exam.subtitle}</p>
      ) : null} */}
      <p className="mt-3 font-sans text-sm text-[#333333]">
        {exam.total_questions} questions {/* · {exam.status_label || "Mock exam"} */}
      </p>
      <p className="mt-1 font-sans text-xs text-[#888888]">
        Attempts completed: {completedAttempts}
        {bestScore > 0 ? ` · Best score: ${bestScore.toFixed(0)}%` : ""}
      </p>
      <button
        type="button"
        disabled={isPending || (!exam.can_start && !inProgress)}
        onClick={() => (inProgress ? onResume(exam.id) : onStart(exam.id))}
        className="mt-5 rounded-lg bg-[#FFC107] px-4 py-2.5 font-sans text-sm font-semibold text-black transition hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isPending
          ? "Starting…"
          : inProgress
            ? "Resume mock exam"
            : "Start mock exam"}
      </button>
    </article>
  );
}

export default function MockExamsPage() {
  const navigate = useNavigate();
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtySlug | "all">(
    "all",
  );
  const [startError, setStartError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);

  const {
    data: exams = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["mock-exams", "sets"],
    queryFn: () => fetchMockExamSets(),
    retry: false,
  });

  const startMutation = useMutation({
    mutationFn: (questionSetId: number) => startMockTest(questionSetId),
    onSuccess: (_data, questionSetId) => {
      setStartingId(null);
      navigate(`/mock-exams/${questionSetId}`);
    },
    onError: (error: Error) => {
      setStartingId(null);
      setStartError(error.message || "Could not start mock exam.");
    },
  });

  useEffect(() => {
    document.title = "Mock Exams | Sonographer Pal";
  }, []);

  const filtered =
    activeSpecialty === "all"
      ? exams
      : exams.filter((e) =>
          categoryMatchesSpecialty(e.category, activeSpecialty),
        );

  const grouped = SPECIALTY_SLUGS.reduce<Record<string, MockExamSet[]>>(
    (acc, slug) => {
      acc[slug] = exams.filter((e) =>
        categoryMatchesSpecialty(e.category, slug),
      );
      return acc;
    },
    {},
  );

  function handleStart(id: number) {
    setStartError(null);
    setStartingId(id);
    startMutation.mutate(id);
  }

  function handleResume(id: number) {
    setStartError(null);
    navigate(`/mock-exams/${id}`);
  }

  const cardProps = {
    onStart: handleStart,
    onResume: handleResume,
    isStarting: startMutation.isPending,
    startingId,
  };

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "py-12 lg:py-16")}>
        <h1 className="text-center font-heading text-3xl font-bold text-black sm:text-4xl">
          Mock Exams
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-base text-[#444444]">
          Graded mock exams for each specialty
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSpecialty("all")}
            className={cn(
              "rounded-full border px-4 py-1.5 font-sans text-sm font-medium",
              activeSpecialty === "all"
                ? "border-[#b8860b] bg-[#FFC107] text-black"
                : "border-[#d0d0d0] bg-white text-[#333333]",
            )}
          >
            ARRT
          </button>
          {SPECIALTY_SLUGS.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveSpecialty(slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 font-sans text-sm font-medium",
                activeSpecialty === slug
                  ? "border-[#b8860b] bg-[#FFC107] text-black"
                  : "border-[#d0d0d0] bg-white text-[#333333]",
              )}
            >
              {SPECIALTY_DISPLAY_LABELS[slug]}
            </button>
          ))}
        </div>

        {startError ? (
          <p className="mt-6 text-center font-sans text-sm text-[#c62828]">
            {startError}
          </p>
        ) : null}

        {isError ? (
          <div className="mt-12 text-center">
            <p className="font-sans text-base text-[#c62828]">
              Could not load mock exams. Please try again.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg border border-[#d0d0d0] bg-white px-4 py-2 font-sans text-sm font-medium text-[#333333] hover:bg-[#f5f5f5]"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <MockExamCardSkeleton key={i} />
            ))}
          </div>
        ) : activeSpecialty === "all" ? (
          <div className="mt-10 space-y-12">
            {SPECIALTY_SLUGS.map((slug) =>
              grouped[slug]?.length ? (
                <section key={slug}>
                  <h2 className="mb-4 font-heading text-xl font-bold text-black">
                    {SPECIALTY_DISPLAY_LABELS[slug]}
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped[slug].map((exam) => (
                      <MockExamCard key={exam.id} exam={exam} {...cardProps} />
                    ))}
                  </div>
                </section>
              ) : null,
            )}
            {exams.length === 0 ? (
              <p className="text-center font-sans text-base text-[#666666]">
                No mock exams are available yet.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exam) => (
              <MockExamCard key={exam.id} exam={exam} {...cardProps} />
            ))}
            {filtered.length === 0 ? (
              <p className="col-span-full text-center font-sans text-base text-[#666666]">
                No mock exams for this specialty yet.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
