import { useCallback, useEffect, type MouseEvent } from "react";
import { X } from "lucide-react";

import { PdfStudyViewer } from "@/components/study-guide/PdfStudyViewer";
import type { QuestionMedia } from "@/features/practice/questionMedia";
import { cn } from "@/lib/utils";

type PracticeMediaLightboxProps = {
  media: QuestionMedia;
  prompt: string;
  onClose: () => void;
};

function fileNameFromUrl(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    return parts[parts.length - 1] || "document.pdf";
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1]?.split("?")[0] || "document.pdf";
  }
}

export function PracticeMediaLightbox({ media, prompt, onClose }: PracticeMediaLightboxProps) {
  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const altText =
    media.caption?.trim() ||
    (prompt.length > 120 ? `${prompt.slice(0, 117)}…` : prompt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Question media preview"
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
        aria-label="Close preview"
      >
        <X className="size-5" aria-hidden />
      </button>

      {media.kind === "image" ? (
        <img
          src={media.url}
          alt={altText}
          className="max-h-[90vh] max-w-[95vw] object-contain"
          draggable={false}
        />
      ) : (
        <div
          className={cn(
            "flex h-[min(90vh,900px)] w-[min(95vw,1100px)] flex-col overflow-hidden rounded-lg bg-white shadow-xl",
          )}
        >
          <PdfStudyViewer
            pdfSources={{ primary: media.url }}
            fileName={fileNameFromUrl(media.url)}
            className="min-h-0 flex-1"
          />
        </div>
      )}

      {media.caption ? (
        <p className="absolute bottom-4 left-1/2 max-w-[90vw] -translate-x-1/2 text-center font-sans text-sm text-white/90">
          {media.caption}
        </p>
      ) : null}
    </div>
  );
}
