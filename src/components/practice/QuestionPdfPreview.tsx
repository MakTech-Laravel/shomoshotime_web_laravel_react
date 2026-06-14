import { useEffect, useRef, useState } from "react";

import { isAbortError } from "@/lib/loadPdfBytes";
import { loadPdfDocument } from "@/lib/loadPdfDocument";
import { cn } from "@/lib/utils";

const MAX_PREVIEW_WIDTH = 640;
const MAX_CONTAINER_HEIGHT = 320;

type QuestionPdfPreviewProps = {
  url: string;
  className?: string;
};

export function QuestionPdfPreview({ url, className }: QuestionPdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setStatus("loading");
      try {
        const pdf = await loadPdfDocument(url);
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1 });
        const widthScale = MAX_PREVIEW_WIDTH / viewport.width;
        const heightScale = MAX_CONTAINER_HEIGHT / viewport.height;
        const scale = Math.min(widthScale, heightScale, 1.5);
        const scaled = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(scaled.width * dpr);
        canvas.height = Math.floor(scaled.height * dpr);
        canvas.style.width = `${Math.floor(scaled.width)}px`;
        canvas.style.height = `${Math.floor(scaled.height)}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        await page.render({ canvasContext: context, viewport: scaled, canvas }).promise;

        if (!cancelled) setStatus("ready");
      } catch (error) {
        if (!cancelled && !isAbortError(error)) {
          console.error("Question PDF preview:", error);
          setStatus("error");
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === "error") {
    return (
      <p className="text-center font-sans text-sm text-[#666666]">Preview unavailable</p>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex max-h-[320px] w-full max-w-[640px] items-center justify-center overflow-hidden",
        className,
      )}
    >
      {status === "loading" ? (
        <div
          className="h-[200px] w-full max-w-[640px] animate-pulse rounded-md bg-[#e8e8e8]"
          aria-hidden
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className={cn("mx-auto block max-h-[320px] max-w-full", status !== "ready" && "hidden")}
      />
    </div>
  );
}
