import { memo, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { isAbortError } from "@/lib/loadPdfBytes";
import { cn } from "@/lib/utils";

type PdfThumbnailProps = {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  isActive: boolean;
  onSelect: (page: number) => void;
};

const THUMB_WIDTH = 96;

export const PdfThumbnail = memo(function PdfThumbnail({
  pdf,
  pageNumber,
  isActive,
  onSelect,
}: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setHeight] = useState(Math.round(THUMB_WIDTH * 1.294));

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = THUMB_WIDTH / viewport.width;
        const scaled = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const cssHeight = Math.floor(scaled.height);
        setHeight(cssHeight);

        canvas.width = THUMB_WIDTH * 2;
        canvas.height = cssHeight * 2;
        canvas.style.width = `${THUMB_WIDTH}px`;
        canvas.style.height = `${cssHeight}px`;

        context.setTransform(2, 0, 0, 2, 0, 0);
        await page.render({ canvasContext: context, viewport: scaled, canvas }).promise;
      } catch (error) {
        if (!cancelled && !isAbortError(error)) {
          console.error(`Thumbnail page ${pageNumber}:`, error);
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  return (
    <button
      type="button"
      onClick={() => onSelect(pageNumber)}
      className={cn(
        "block w-full rounded border bg-white p-1 shadow-sm transition-colors",
        isActive ? "border-[#2b6cb0] ring-2 ring-[#2b6cb0]/30" : "border-[#dcdcdc] hover:border-[#aaa]",
      )}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={isActive ? "page" : undefined}
    >
      <canvas ref={canvasRef} className="mx-auto block" />
      <span className="mt-1 block text-center font-montserrat text-[10px] text-[#666]">
        {pageNumber}
      </span>
    </button>
  );
});
