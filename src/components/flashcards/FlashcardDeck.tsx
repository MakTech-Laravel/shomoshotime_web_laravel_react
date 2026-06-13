import { useState } from "react";
import { ResourceContentCard } from "@/components/ui/ResourceContentCard";

export const FLASHCARDS_COMING_SOON_MESSAGE =
  "Flashcards for this topic are coming soon.";

export type FlashcardItem = {
  id?: number;
  question: string;
  answer: string;
};

type FlashcardDeckProps = {
  cards: FlashcardItem[];
  className?: string;
  onCardProgress?: (cardId: number) => void;
};

export function FlashcardDeck({ cards, className, onCardProgress }: FlashcardDeckProps) {
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const card = cards[idx];
  const total = cards.length;

  if (!card || total === 0) {
    return (
      <ResourceContentCard className={className}>
        <p className="text-center font-sans text-base text-[#333333]">
          {FLASHCARDS_COMING_SOON_MESSAGE}
        </p>
      </ResourceContentCard>
    );
  }

  function goTo(next: number) {
    if (next > idx && card.id != null) {
      onCardProgress?.(card.id);
    }
    setIdx(next);
    setShowAnswer(false);
  }

  return (
    <ResourceContentCard className={className}>
      <p className="text-center font-sans text-base font-bold text-black">
        Question {idx + 1} of {total}
      </p>

      <h2 className="mt-5 text-center font-sans text-lg font-bold leading-snug text-pretty text-black break-words sm:text-xl">
        {card.question}
      </h2>

      {showAnswer ? (
        <p className="mx-auto mt-8 max-w-xl text-center font-sans text-base font-normal leading-relaxed text-pretty text-black break-words">
          {card.answer}
        </p>
      ) : null}

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() =>
            setShowAnswer((s) => {
              const next = !s;
              if (next && card.id != null) onCardProgress?.(card.id);
              return next;
            })
          }
          className="rounded-lg border-2 border-[#FFC107] bg-white px-8 py-2.5 font-sans text-sm font-medium text-[#b8860b] transition-colors hover:bg-[#FFC107]/10 sm:text-base"
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}{" "}
          <span aria-hidden className="font-normal">
            &gt;
          </span>
        </button>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-md justify-center gap-3 sm:gap-4">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => goTo(Math.max(0, idx - 1))}
          className="min-h-11 flex-1 rounded-lg bg-[#FFC107] px-6 font-sans text-sm font-semibold text-black shadow-none transition-opacity hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
        >
          Back
        </button>
        <button
          type="button"
          disabled={idx >= total - 1}
          onClick={() => goTo(Math.min(total - 1, idx + 1))}
          className="min-h-11 flex-1 rounded-lg bg-[#FFC107] px-6 font-sans text-sm font-semibold text-black shadow-none transition-opacity hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
        >
          Next
        </button>
      </div>
    </ResourceContentCard>
  );
}
