import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronRight, X } from "lucide-react";

import { container } from "@/lib/container";
import { cn } from "@/lib/utils";

type TestQuestion = {
  prompt: string;
  image?: { src: string; alt: string; width: number; height: number };
  options: string[];
  correctIndex: number;
};

const QUESTIONS: TestQuestion[] = [
  {
    prompt:
      "This artifact displays multiple evenly spaced echoes diminishing in strength with depth. It is caused by repeated reflection between two strong interfaces.",
    image: {
      src: "/images/test/reverberation-artifact.png",
      alt: "Reverberation artifact example image",
      width: 443,
      height: 256,
    },
    options: ["Mirror Image", "Reverberation", "Comet Tail", "Side Lobe"],
    correctIndex: 1,
  },
  {
    prompt:
      "Which artifact is characterized by a bright echogenic line with a series of parallel echoes equidistant from the reflector, often seen with pleural lines or pericardium?",
    options: ["Mirror Image", "Reverberation", "Comet Tail", "Side Lobe"],
    correctIndex: 1,
  },
  {
    prompt:
      "A duplicate image of a structure appears on the opposite side of a strong reflector. This artifact is known as:",
    options: ["Mirror Image", "Reverberation", "Comet Tail", "Side Lobe"],
    correctIndex: 0,
  },
  {
    prompt:
      "Ring-down artifact trailing distally from a gas bubble or metallic object, creating a V-shaped or comet-like appearance, is called:",
    options: ["Mirror Image", "Reverberation", "Comet Tail", "Side Lobe"],
    correctIndex: 2,
  },
  {
    prompt:
      "Extraneous echoes displayed within the image due to energy emitted from the transducer edge rather than the main beam are referred to as:",
    options: ["Mirror Image", "Reverberation", "Comet Tail", "Side Lobe"],
    correctIndex: 3,
  },
];

function NavButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 min-w-[142px] items-center justify-center rounded px-4 font-sans text-base font-normal tracking-wide text-black transition-colors",
        "bg-[#FFBF23] hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-[#E2E2E2] disabled:text-[#8F8F8F] disabled:hover:bg-[#E2E2E2] disabled:hover:text-[#8F8F8F]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function Test() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const item = QUESTIONS[idx];
  const isCorrect = picked === item.correctIndex;
  const correctLabel = item.options[item.correctIndex];

  useEffect(() => {
    document.title = "Test | Sonographer Pal";
  }, []);

  function goToQuestion(nextIdx: number) {
    setIdx(nextIdx);
    setPicked(null);
    setSubmitted(false);
  }

  function submit() {
    if (picked === null) return;
    setSubmitted(true);
  }

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className={cn(container)}>
        <h1 className="text-center font-heading text-[34px] font-bold leading-tight text-black">Test</h1>

        <div className="mx-auto mt-10 max-w-[980px] rounded-md border border-black/15 bg-[#fafafa] px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-center font-sans text-[22px] font-normal leading-snug text-black">
            Question {idx + 1} of {QUESTIONS.length}
          </p>

          {item.image ? (
            <div className="mt-8 flex justify-center">
              <img
                src={item.image.src}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                className="max-w-full object-cover"
                style={{ width: item.image.width, height: item.image.height }}
                draggable={false}
              />
            </div>
          ) : null}

          <h2
            className={cn(
              "text-center font-sans text-[22px] font-normal leading-snug text-black",
              item.image ? "mt-8" : "mt-8",
            )}
          >
            {item.prompt}
          </h2>

          <fieldset className="mx-auto mt-8 max-w-md">
            <legend className="sr-only">Answer options</legend>
            <div className="flex flex-col items-start gap-4">
              {item.options.map((opt, i) => (
                <label
                  key={`${idx}-${opt}`}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-4 font-heading text-base leading-tight text-black",
                    submitted && "cursor-default",
                  )}
                >
                  <input
                    type="radio"
                    name={`test-opt-${idx}`}
                    disabled={submitted}
                    checked={picked === i}
                    onChange={() => {
                      setPicked(i);
                      setSubmitted(false);
                    }}
                    className="size-[17px] shrink-0 accent-black"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={submit}
              disabled={picked === null || submitted}
              className={cn(
                "inline-flex h-[49px] min-w-[227px] items-center justify-center gap-1 border border-[#996E00] bg-white px-6 font-sans text-sm tracking-wide transition-colors",
                picked !== null && !submitted
                  ? "text-[#996E00] hover:bg-[#996E00] hover:text-white"
                  : "cursor-not-allowed text-[#996E00]/50",
              )}
            >
              Submit Answer
              <ChevronRight className="size-3 shrink-0" aria-hidden strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-8 min-h-[60px]">
            {submitted ? (
              <div className="space-y-5">
                {!isCorrect ? (
                  <>
                    <div className="flex items-center justify-center gap-2 font-sans text-[22px] leading-snug text-[#F06292]">
                      <X className="size-6 shrink-0 stroke-[2.5]" strokeLinecap="round" aria-hidden />
                      Incorrect!
                    </div>
                    <div className="flex items-start justify-center gap-3 text-center font-sans text-[22px] leading-snug text-black">
                      <span
                        className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#2E7D32] text-white"
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
                  <div className="flex items-center justify-center gap-2 font-sans text-[22px] leading-snug text-[#2E7D32]">
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-[#2E7D32] text-white"
                      aria-hidden
                    >
                      <Check className="size-4 stroke-3" />
                    </span>
                    Correct!
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center font-sans text-[22px] leading-snug text-black">
                Feedback will appear here...
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <NavButton onClick={() => goToQuestion(idx - 1)} disabled={idx === 0}>
              Back
            </NavButton>
            <NavButton onClick={() => goToQuestion(idx + 1)} disabled={idx >= QUESTIONS.length - 1}>
              Next
            </NavButton>
          </div>
        </div>
      </div>
    </section>
  );
}
