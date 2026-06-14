import { useState } from "react";

import { PracticeMediaLightbox } from "@/components/practice/PracticeMediaLightbox";
import { QuestionPdfPreview } from "@/components/practice/QuestionPdfPreview";
import { env } from "@/config/env";
import type { QuestionMedia } from "@/features/practice/questionMedia";
import { cn } from "@/lib/utils";

type QuestionMediaBlockProps = {
  media?: QuestionMedia;
  prompt: string;
};

export function QuestionMediaBlock({ media, prompt }: QuestionMediaBlockProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!media) return null;

  const lightboxEnabled = env.practiceMediaLightbox;
  const altText =
    media.caption?.trim() ||
    (prompt.length > 120 ? `${prompt.slice(0, 117)}…` : prompt);

  const content =
    media.kind === "image" ? (
      <img
        src={media.url}
        alt={altText}
        className="max-h-[320px] w-auto max-w-full object-contain"
        draggable={false}
      />
    ) : (
      <QuestionPdfPreview url={media.url} />
    );

  return (
    <>
      <div className="mt-5 flex flex-col items-center gap-2">
        {lightboxEnabled ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className={cn(
              "flex w-full cursor-pointer flex-col items-center gap-2 rounded-md border-0 bg-transparent p-0",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8860b]",
            )}
            aria-label="Expand question media"
          >
            {content}
          </button>
        ) : (
          content
        )}

        {media.caption ? (
          <p className="max-w-full px-2 text-center font-sans text-sm text-[#666666] text-pretty break-words">
            {media.caption}
          </p>
        ) : null}
      </div>

      {lightboxEnabled && lightboxOpen ? (
        <PracticeMediaLightbox
          media={media}
          prompt={prompt}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  );
}
