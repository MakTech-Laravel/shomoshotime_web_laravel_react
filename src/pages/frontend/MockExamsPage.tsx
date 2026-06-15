import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  SPECIALTY_DISPLAY_LABELS,
  SPECIALTY_SLUGS,
  type SpecialtySlug,
} from "@/data/specialtyResources";
import {
  fetchMockExamResults,
  fetchMockExamSets,
  startMockTest,
  type MockExamSet,
} from "@/features/mockExams/mockExamsApi";
import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

function MockExamCard({ exam, onStart }: { exam: MockExamSet; onStart: (id: number) => void }) {
  const { data: results = [] } = useQuery({
    queryKey: ["mock-exam", "results", exam.id],
    queryFn: () => fetchMockExamResults(exam.id),
  });

  const completedAttempts = results.filter((r) => r.status === "completed").length;
  const bestScore = results.reduce(
    (best, r) => Math.max(best, r.score_percentage ?? 0),
    0,
  );

  return (
    <article className="flex flex-col rounded-md border border-[#e5e7eb] bg-white p-6 shadow-sm">
      <h3 className="font-heading text-lg font-bold text-black">{exam.title}</h3>
      {exam.subtitle ? (
        <p className="mt-1 font-sans text-sm text-[#666666]">{exam.subtitle}</p>
      ) : null}
      <p className="mt-3 font-sans text-sm text-[#333333]">
        {exam.total_questions} questions · {exam.status_label || "Mock exam"}
      </p>
      <p className="mt-1 font-sans text-xs text-[#888888]">
        Attempts used: {completedAttempts} / 3
        {bestScore > 0 ? ` · Best score: ${bestScore.toFixed(0)}%` : ""}
      </p>
      <button
        type="button"
        disabled={completedAttempts >= 3}
        onClick={() => onStart(exam.id)}
        className="mt-5 rounded-lg bg-[#FFC107] px-4 py-2.5 font-sans text-sm font-semibold text-black transition hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {completedAttempts >= 3 ? "All attempts used" : "Start mock exam"}
      </button>
    </article>
  );
}

export default function MockExamsPage() {
  const navigate = useNavigate();
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtySlug | "all">("all");
  const [startError, setStartError] = useState<string | null>(null);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["mock-exams", "sets"],
    queryFn: () => fetchMockExamSets(),
  });

  const startMutation = useMutation({
    mutationFn: (questionSetId: number) => startMockTest(questionSetId),
    onSuccess: (_data, questionSetId) => {
      navigate(`/mock-exams/${questionSetId}`);
    },
    onError: (error: Error) => {
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
          e.category.toLowerCase().includes(
            SPECIALTY_DISPLAY_LABELS[activeSpecialty].toLowerCase().split("/")[0] ?? "",
          ),
        );

  const grouped = SPECIALTY_SLUGS.reduce<Record<string, MockExamSet[]>>((acc, slug) => {
    const label = SPECIALTY_DISPLAY_LABELS[slug];
    acc[slug] = exams.filter((e) =>
      e.category.toLowerCase().includes(label.toLowerCase().split("/")[0] ?? ""),
    );
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#fdf5ee]">
      <div className={cn(container, "py-12 lg:py-16")}>
        <h1 className="text-center font-heading text-3xl font-bold text-black sm:text-4xl">
          Mock Exams
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-base text-[#444444]">
          Timed practice exams to simulate board-style testing. Up to three attempts per exam.
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
            All
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
          <p className="mt-6 text-center font-sans text-sm text-[#c62828]">{startError}</p>
        ) : null}

        {isLoading ? (
          <p className="mt-12 text-center font-sans text-base text-[#666666]">Loading mock exams…</p>
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
                      <MockExamCard
                        key={exam.id}
                        exam={exam}
                        onStart={(id) => {
                          setStartError(null);
                          startMutation.mutate(id);
                        }}
                      />
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
              <MockExamCard
                key={exam.id}
                exam={exam}
                onStart={(id) => {
                  setStartError(null);
                  startMutation.mutate(id);
                }}
              />
            ))}
            {filtered.length === 0 ? (
              <p className="col-span-full text-center font-sans text-base text-[#666666]">
                No mock exams for this specialty yet.
              </p>
            ) : null}
          </div>
        )}

        <p className="mt-12 text-center font-sans text-sm text-[#666666]">
          <Link to="/exploreresources" className="text-[#b8860b] hover:underline">
            Explore all study resources
          </Link>
        </p>
      </div>
    </div>
  );
}
