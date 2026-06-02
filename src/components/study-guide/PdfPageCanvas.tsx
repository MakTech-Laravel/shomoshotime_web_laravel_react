import { memo, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { PdfAnnotationLayer } from "@/components/study-guide/PdfAnnotationLayer";
import type { PageAnnotations, ToolId } from "@/components/study-guide/pdf-viewer-types";
import { isAbortError } from "@/lib/loadPdfBytes";
import { cn } from "@/lib/utils";

type PdfPageCanvasProps = {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  devicePixelRatio: number;
  tool: ToolId;
  annotations: PageAnnotations;
  onAnnotationsChange: (next: PageAnnotations) => void;
  highlightSearch?: boolean;
};

export const PdfPageCanvas = memo(function PdfPageCanvas({
  pdf,
  pageNumber,
  width,
  devicePixelRatio,
  tool,
  annotations,
  onAnnotationsChange,
  highlightSearch = false,
}: PdfPageCanvasProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<
    Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]
  > | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pageHeight, setPageHeight] = useState(Math.round(width * 1.294));

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "240px 0px", threshold: 0 },
    );

    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;

    const render = async () => {
      renderTaskRef.current?.cancel();

      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const unscaled = page.getViewport({ scale: 1 });
        const fitScale = width / unscaled.width;
        const viewport = page.getViewport({ scale: fitScale });
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const cssWidth = Math.floor(viewport.width);
        const cssHeight = Math.floor(viewport.height);
        setPageHeight(cssHeight);

        canvas.width = Math.floor(cssWidth * devicePixelRatio);
        canvas.height = Math.floor(cssHeight * devicePixelRatio);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        context.clearRect(0, 0, cssWidth, cssHeight);

        const task = page.render({
          canvasContext: context,
          viewport,
          canvas,
        });
        renderTaskRef.current = task;
        await task.promise;
      } catch (error) {
        if (!cancelled && !isAbortError(error)) {
          console.error(`PDF page ${pageNumber} render error:`, error);
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [isVisible, pageNumber, pdf, width, devicePixelRatio]);

  return (
    <div
      ref={slotRef}
      data-page={pageNumber}
      className={cn(
        "relative flex scroll-mt-6 justify-center",
        highlightSearch && "ring-2 ring-[#f5c542] ring-offset-2",
      )}
      style={{ minHeight: pageHeight }}
    >
      <canvas
        ref={canvasRef}
        className="relative z-0 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
        style={{ width, minHeight: pageHeight }}
        aria-label={`Page ${pageNumber}`}
      />
      <PdfAnnotationLayer
        width={width}
        height={pageHeight}
        tool={tool}
        annotations={annotations}
        onChange={onAnnotationsChange}
      />
    </div>
  );
});
