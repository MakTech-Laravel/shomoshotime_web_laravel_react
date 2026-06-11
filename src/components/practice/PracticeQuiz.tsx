import { useState } from "react";
import { Check, X } from "lucide-react";
import { ResourceContentCard } from "@/components/ui/ResourceContentCard";
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
};

const ANSWER_KEY_INDEX: Record<string, number> = {
  option_a: 0,
  option_b: 1,
  option_c: 2,
  option_d: 3,
};

export function PracticeQuiz({ questions, className, onSubmitAnswer }: PracticeQuizProps) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
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

  const isCorrect = submitted
    ? (answerResult?.isCorrect ?? picked === item.correctIndex)
    : picked === item.correctIndex;
  const correctLabel = submitted
    ? (answerResult?.correctLabel ?? item.options[item.correctIndex])
    : item.options[item.correctIndex];

  async function submit() {
    if (picked === null || submitted) return;

    const fallback = {
      isCorrect: picked === item.correctIndex,
      correctLabel: item.options[item.correctIndex] ?? "",
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

      <h2 className="mt-5 text-center font-sans text-lg font-bold leading-snug text-pretty text-black break-words sm:text-xl">
        {item.prompt}
      </h2>

      <div className="mx-auto mt-8 max-w-xl space-y-4">
        {item.options.map((opt, i) => (
          <label
            key={`${idx}-${opt}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md py-1 transition-colors",
              submitted && "cursor-default",
              !submitted && "hover:bg-[#fafafa]",
              picked === i && !submitted && "bg-[#fafafa]",
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
              }}
              className="sr-only"
            />
            <span
              className={cn(
                "mt-1 size-4 shrink-0 rounded-full border-2 border-[#e53935]",
                picked === i ? "bg-[#e53935]" : "bg-white",
              )}
              aria-hidden
            />
            <span className="text-left font-sans text-base font-normal leading-snug text-pretty text-black break-words">
              {opt}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={picked === null || submitted}
          className={cn(
            "rounded-lg border-2 border-[#b8860b] bg-white px-8 py-2.5 font-sans text-sm font-medium transition-colors sm:text-base",
            picked !== null && !submitted
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

      {submitted ? (
        <div className="mt-8 space-y-5">
          {!isCorrect ? (
            <>
              <div className="flex items-center justify-center gap-2 font-sans text-base font-semibold text-[#F06292]">
                <X className="size-6 shrink-0 stroke-[2.5]" strokeLinecap="round" aria-hidden />
                Incorrect!
              </div>
              <div className="flex items-start justify-center gap-3 text-left font-sans text-base text-black">
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#2E7D32] text-white"
                  aria-hidden
                >
                  <Check className="size-4 stroke-3" />
                </span>
                <span>
                  <span className="font-medium">Correct Answer: </span>
                  {correctLabel}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 font-sans text-base font-semibold text-[#2E7D32]">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#2E7D32] text-white"
                aria-hidden
              >
                <Check className="size-4 stroke-3" />
              </span>
              Correct!
            </div>
          )}
          {item.feedbackCorrect && isCorrect ? (
            <p className="text-center font-sans text-base text-black">{item.feedbackCorrect}</p>
          ) : null}
        </div>
      ) : null}

      {submitted && idx < total - 1 ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => goTo(idx + 1)}
            className="min-h-11 rounded-lg bg-[#FFC107] px-10 font-sans text-sm font-semibold text-black transition-opacity hover:bg-[#e6ac00] sm:text-base"
          >
            Next Question
          </button>
        </div>
      ) : null}
    </ResourceContentCard>
  );
}
