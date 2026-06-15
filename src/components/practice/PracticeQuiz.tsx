import { useState } from "react";
import { Check, X } from "lucide-react";
import { QuestionMediaBlock } from "@/components/practice/QuestionMediaBlock";
import {
  getOptionState,
  optionCardClasses,
  optionRadioClasses,
} from "@/components/practice/practiceOptionState";
import { ResourceContentCard } from "@/components/ui/ResourceContentCard";
import type { QuestionMedia } from "@/features/practice/questionMedia";
import { indexToAnswerKey } from "@/features/practice/mapQuestion";
import { cn } from "@/lib/utils";

export const PRACTICE_COMING_SOON_MESSAGE =
  "Practice questions for this topic are coming soon.";

export type PracticeQuestion = {
  id?: number;
  questionSetId?: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect?: string;
  media?: QuestionMedia;
};

type SubmitAnswerHandler = (
  questionSetId: number,
  questionId: number,
  answer: string,
) => Promise<{ is_correct: boolean; correct_answer: string }>;

type PracticeQuizProps = {
  questions: PracticeQuestion[];
  className?: string;
  onSubmitAnswer?: SubmitAnswerHandler;
  showRationale?: boolean;
};

const ANSWER_KEY_INDEX: Record<string, number> = {
  option_a: 0,
  option_b: 1,
  option_c: 2,
  option_d: 3,
};

export function PracticeQuiz({
  questions,
  className,
  onSubmitAnswer,
  showRationale = true,
}: PracticeQuizProps) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctIndex: number;
    correctLabel: string;
  } | null>(null);

  const item = questions[idx];
  const total = questions.length;

  if (!item || total === 0) {
    return (
      <ResourceContentCard className={className}>
        <p className="text-center font-sans text-base text-[#333333]">
          {PRACTICE_COMING_SOON_MESSAGE}
        </p>
      </ResourceContentCard>
    );
  }

  const resolvedCorrectIndex = submitted
    ? (answerResult?.correctIndex ?? item.correctIndex)
    : item.correctIndex;

  const isCorrect = submitted
    ? (answerResult?.isCorrect ?? picked === resolvedCorrectIndex)
    : false;

  const rationale = item.feedbackCorrect?.trim() ?? "";

  async function submit() {
    if (picked === null || submitted) return;

    const fallbackCorrectIndex = item.correctIndex;
    const fallback = {
      isCorrect: picked === fallbackCorrectIndex,
      correctIndex: fallbackCorrectIndex,
      correctLabel: item.options[fallbackCorrectIndex] ?? "",
    };

    if (onSubmitAnswer && item.id != null && item.questionSetId != null) {
      try {
        const result = await onSubmitAnswer(
          item.questionSetId,
          item.id,
          indexToAnswerKey(picked),
        );
        const correctIdx = ANSWER_KEY_INDEX[result.correct_answer] ?? item.correctIndex;
        setAnswerResult({
          isCorrect: result.is_correct,
          correctIndex: correctIdx,
          correctLabel: item.options[correctIdx] ?? fallback.correctLabel,
        });
      } catch {
        setAnswerResult(fallback);
      }
    } else {
      setAnswerResult(fallback);
    }

    setSubmitted(true);
  }

  function goTo(next: number) {
    setIdx(next);
    setPicked(null);
    setSubmitted(false);
    setAnswerResult(null);
  }

  return (
    <ResourceContentCard className={className}>
      <p className="text-center font-sans text-base font-bold text-[#b8860b] sm:text-lg">
        Question {idx + 1} of {total}
      </p>

      <QuestionMediaBlock media={item.media} prompt={item.prompt} />

      <h2 className="mt-5 text-center font-sans text-lg font-bold leading-snug text-pretty text-black break-words sm:text-xl">
        {item.prompt}
      </h2>

      <div className="mx-auto mt-8 max-w-xl space-y-3">
        {item.options.map((opt, i) => {
          const state = getOptionState(i, picked, resolvedCorrectIndex, submitted);

          return (
            <label
              key={`${idx}-${opt}`}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 transition-colors",
                optionCardClasses[state],
                submitted && "cursor-default",
                !submitted && state === "default" && "hover:bg-[#fafafa]",
              )}
            >
              <input
                type="radio"
                name={`practice-${idx}`}
                disabled={submitted}
                checked={picked === i}
                onChange={() => {
                  setPicked(i);
                  setSubmitted(false);
                  setAnswerResult(null);
                }}
                className="sr-only"
              />
              <span className="flex-1 text-left font-sans text-base font-normal leading-snug text-pretty text-black break-words">
                {opt}
              </span>
              <span
                className={cn(
                  "size-5 shrink-0 rounded-full border-2",
                  optionRadioClasses[state],
                )}
                aria-hidden
              />
            </label>
          );
        })}
      </div>

      {!submitted ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={picked === null}
            className={cn(
              "rounded-lg border-2 border-[#b8860b] bg-white px-8 py-2.5 font-sans text-sm font-medium transition-colors sm:text-base",
              picked !== null
                ? "text-[#b8860b] hover:bg-[#FFC107]/10"
                : "cursor-not-allowed border-[#e5e5e5] text-[#999999]",
            )}
          >
            Submit Answer{" "}
            <span aria-hidden className="font-normal">
              &gt;
            </span>
          </button>
        </div>
      ) : null}

      {submitted ? (
        <div className="mx-auto mt-8 max-w-xl space-y-4">
          {isCorrect ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[#2E7D32]/30 bg-[#E8F5E9] px-4 py-3 font-sans text-base font-semibold text-[#2E7D32]">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2E7D32] text-white"
                aria-hidden
              >
                <Check className="size-4 stroke-3" />
              </span>
              Correct Answer
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[#F06292]/40 bg-[#FFEBEE] px-4 py-3 font-sans text-base font-semibold text-[#F06292]">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F06292] text-white"
                aria-hidden
              >
                <X className="size-5 stroke-[2.5]" strokeLinecap="round" />
              </span>
              Incorrect Answer
            </div>
          )}

          {showRationale && rationale ? (
            <div
              className={cn(
                "rounded-lg border-2 p-4",
                isCorrect
                  ? "border-[#2E7D32] bg-[#E8F5E9]"
                  : "border-[#F06292] bg-[#FFEBEE]",
              )}
            >
              <p
                className={cn(
                  "font-sans text-base font-semibold",
                  isCorrect ? "text-[#2E7D32]" : "text-[#F06292]",
                )}
              >
                Rationale
              </p>
              <p className="mt-2 text-left font-sans text-base leading-relaxed text-black">
                {rationale}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mx-auto mt-10 flex w-full max-w-md justify-center gap-3 sm:gap-4">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => goTo(Math.max(0, idx - 1))}
          className="min-h-11 flex-1 rounded-lg bg-[#FFC107] px-6 font-sans text-sm font-semibold text-black transition-opacity hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!submitted || idx >= total - 1}
          onClick={() => goTo(idx + 1)}
          className="min-h-11 flex-1 rounded-lg bg-[#FFC107] px-6 font-sans text-sm font-semibold text-black transition-opacity hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
        >
          Next
        </button>
      </div>
    </ResourceContentCard>
  );
}
