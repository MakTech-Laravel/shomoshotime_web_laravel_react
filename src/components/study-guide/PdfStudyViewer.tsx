import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { PdfPageCanvas } from "@/components/study-guide/PdfPageCanvas";
import { PdfThumbnail } from "@/components/study-guide/PdfThumbnail";
import {
  emptyAnnotations,
  type PageAnnotations,
  type PageAnnotationsMap,
} from "@/components/study-guide/pdf-viewer-types";
import { useAuth } from "@/auth/useAuth";
import { saveStudyGuidePageProgress } from "@/features/studyGuides/studyGuideProgressApi";
import { isPdfDocumentCached, loadPdfDocument, type PdfLoadSources } from "@/lib/loadPdfDocument";
import { cn } from "@/lib/utils";

import "./pdf-study-viewer.css";

type PdfStudyViewerProps = {
  pdfSources: PdfLoadSources;
  fileName: string;
  className?: string;
  contentId?: number;
};

const MIN_SCALE = 0.6;
const MAX_SCALE = 2;
const SCALE_STEP = 0.15;
const MAX_RENDER_DPR = 2;
const PAGE_GAP_PX = 16;

function getRenderDpr() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, MAX_RENDER_DPR);
}

const PROGRESS_DEBOUNCE_MS = 800;

export function PdfStudyViewer({ pdfSources, className, contentId }: PdfStudyViewerProps) {
  const { isAuthenticated } = useAuth();
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollSyncLock = useRef(false);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [pageWidth, setPageWidth] = useState(720);
  const [annotations, setAnnotations] = useState<PageAnnotationsMap>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [renderDpr, setRenderDpr] = useState(getRenderDpr);
  const [scrollThumb, setScrollThumb] = useState({ top: 0, height: 40 });

  const [showThumbnails, setShowThumbnails] = useState(false);

  const renderWidth = Math.round(pageWidth * scale);
  const zoomPercent = Math.round(scale * 100);

  useEffect(() => {
    if (!contentId || !isAuthenticated) return;

    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
    }

    progressTimerRef.current = setTimeout(() => {
      void saveStudyGuidePageProgress(contentId, pageNumber).catch(() => {});
    }, PROGRESS_DEBOUNCE_MS);

    return () => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
    };
  }, [contentId, pageNumber, isAuthenticated]);

  const scrollToPage = useCallback((target: number, behavior: ScrollBehavior = "smooth") => {
    const root = scrollRef.current;
    if (!root) return;

    const pageEl = root.querySelector<HTMLElement>(`[data-page="${target}"]`);
    if (!pageEl) return;

    scrollSyncLock.current = true;
    pageEl.scrollIntoView({ behavior, block: "start" });
    setPageNumber(target);

    window.setTimeout(() => {
      scrollSyncLock.current = false;
    }, behavior === "smooth" ? 400 : 0);
  }, []);

  const updateScrollThumb = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;

    const { scrollHeight, clientHeight, scrollTop } = root;
    if (scrollHeight <= clientHeight) {
      setScrollThumb({ top: 0, height: 100 });
      return;
    }

    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 36);
    const maxTop = clientHeight - thumbHeight;
    const top = (scrollTop / (scrollHeight - clientHeight)) * maxTop;

    setScrollThumb({ top, height: thumbHeight });
  }, []);

  const updatePageAnnotations = useCallback((page: number, next: PageAnnotations) => {
    setAnnotations((current) => ({ ...current, [page]: next }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoadError(null);
    setPageNumber(1);
    setNumPages(0);
    setPdfDoc(null);
    setAnnotations({});

    if (!isPdfDocumentCached(pdfSources)) {
      setIsLoadingPdf(true);
    }

    loadPdfDocument(pdfSources)
      .then((loaded) => {
        if (cancelled) return;

        setPdfDoc(loaded);
        setLoadError(null);
        setNumPages(loaded.numPages);
        setIsLoadingPdf(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setIsLoadingPdf(false);

        const message =
          error instanceof Error ? error.message : "Unable to load this PDF. Please try again later.";

        if (/worker was destroyed/i.test(message)) {
          setLoadError("PDF viewer was interrupted. Please refresh the page.");
          return;
        }

        if (/worker failed to load|fake worker|dynamically imported/i.test(message)) {
          setLoadError("PDF viewer could not start. Please refresh the page.");
          return;
        }

        if (/failed to fetch|network error/i.test(message)) {
          setLoadError("Could not load this PDF. Check your connection and refresh the page.");
          return;
        }

        if (/403|forbidden/i.test(message)) {
          setLoadError(
            "Access to this study guide PDF was denied. Refresh the page or contact support if the problem continues.",
          );
          return;
        }

        setLoadError(
          /404|not found/i.test(message)
            ? "This study guide PDF is missing on the server. Please re-upload the file from the admin panel."
            : message,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [pdfSources.primary, pdfSources.fallback]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    let frame = 0;
    const updateWidth = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const compact = node.clientWidth < 768;
        const thumbOffset = showThumbnails && !compact ? 132 : 0;
        const sideOffset = compact ? 16 : 112;
        const next = Math.min(node.clientWidth - sideOffset - thumbOffset, 860);
        setPageWidth(Math.max(next, 240));
      });
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [showThumbnails]);

  useEffect(() => {
    const onDprChange = () => setRenderDpr(getRenderDpr());
    window.addEventListener("resize", onDprChange);
    return () => window.removeEventListener("resize", onDprChange);
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || numPages === 0) return;

    const onScroll = () => {
      updateScrollThumb();
      if (scrollSyncLock.current) return;

      const pages = root.querySelectorAll<HTMLElement>("[data-page]");
      if (!pages.length) return;

      const rootRect = root.getBoundingClientRect();
      const anchor = rootRect.top + 72;

      let closest = 1;
      let minDistance = Number.POSITIVE_INFINITY;

      pages.forEach((pageEl) => {
        const rect = pageEl.getBoundingClientRect();
        const distance = Math.abs(rect.top - anchor);
        const page = Number(pageEl.dataset.page);
        if (distance < minDistance) {
          minDistance = distance;
          closest = page;
        }
      });

      setPageNumber(closest);
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [numPages, updateScrollThumb]);

  useEffect(() => {
    updateScrollThumb();
  }, [numPages, renderWidth, updateScrollThumb]);

  const goToPreviousPage = useCallback(() => {
    scrollToPage(Math.max(1, pageNumber - 1));
  }, [pageNumber, scrollToPage]);

  const goToNextPage = useCallback(() => {
    scrollToPage(numPages ? Math.min(numPages, pageNumber + 1) : pageNumber);
  }, [numPages, pageNumber, scrollToPage]);

  const zoomIn = useCallback(() => {
    setScale((current) => Math.min(MAX_SCALE, Number((current + SCALE_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((current) => Math.max(MIN_SCALE, Number((current - SCALE_STEP).toFixed(2))));
  }, []);

  const resetZoom = useCallback(() => setScale(1), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goToPreviousPage();
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        goToNextPage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToNextPage, goToPreviousPage]);

  const showPlaceholder = isLoadingPdf || numPages === 0;

  const onTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const root = scrollRef.current;
    const track = event.currentTarget;
    if (!root) return;

    const rect = track.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    root.scrollTop = ratio * (root.scrollHeight - root.clientHeight);
  };

  const pageItems = useMemo(
    () => Array.from({ length: numPages }, (_, index) => index + 1),
    [numPages],
  );

  return (
    <div
      className={cn(
        "pdf-study-viewer-root flex min-h-0 flex-col overflow-hidden rounded-md border border-[#d6d6d6] bg-white shadow-[0_4px_28px_rgba(0,0,0,0.09)]",
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div ref={viewportRef} className="relative min-h-0 flex-1 bg-[#ebebeb]">
        {showThumbnails && pdfDoc && !showPlaceholder && (
          <aside className="pdf-study-thumbnails absolute bottom-16 left-0 top-0 z-20 flex w-36 flex-col border-r border-[#c4c4c4] bg-white sm:w-44">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-3 py-2">
              <span className="font-montserrat text-xs font-semibold text-[#333]">Thumbnails</span>
              <button
                type="button"
                onClick={() => setShowThumbnails(false)}
                className="rounded p-1 text-[#666] hover:bg-[#f3f3f3]"
                aria-label="Close thumbnails"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
              {pageItems.map((page) => (
                <PdfThumbnail
                  key={page}
                  pdf={pdfDoc}
                  pageNumber={page}
                  isActive={page === pageNumber}
                  onSelect={(target) => scrollToPage(target)}
                />
              ))}
            </div>
          </aside>
        )}

        {!showPlaceholder && !loadError && (
          <div
            className="pdf-study-scrollbar-track absolute right-1 top-4 bottom-16 z-10 hidden w-2 cursor-pointer rounded-full bg-[#d4d4d4] md:block"
            onClick={onTrackClick}
            aria-hidden
          >
            <div
              className="absolute left-0 w-full rounded-full bg-[#3d3d3d] transition-[top,height] duration-75"
              style={{ top: scrollThumb.top, height: scrollThumb.height }}
            />
          </div>
        )}

        {!showPlaceholder && !loadError && (
          <div className="pdf-study-bottom-toolbar absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
            <div className="flex items-center gap-1 rounded-md border border-[#c4c4c4] bg-[#e8eef3]/95 px-2 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:gap-2 sm:px-3">
              <button
                type="button"
                className={cn(
                  "rounded p-1.5 text-[#5a5a5a] hover:bg-white/70",
                  showThumbnails && "bg-white text-[#333]",
                )}
                aria-label="Page thumbnails"
                aria-pressed={showThumbnails}
                onClick={() => setShowThumbnails((open) => !open)}
              >
                <LayoutGrid className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={pageNumber <= 1}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-white/70 disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" strokeWidth={2.5} />
              </button>
              <span className="min-w-[4.5rem] text-center font-montserrat text-xs text-[#333] sm:text-sm">
                <span className="font-semibold">{pageNumber}</span>
                <span className="text-[#999]"> / </span>
                <span className="text-[#666]">{numPages || "—"}</span>
              </span>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={!numPages || pageNumber >= numPages}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-white/70 disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-white/70 disabled:opacity-30"
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" strokeWidth={2} />
              </button>
              <span className="min-w-[3rem] text-center font-montserrat text-xs tabular-nums text-[#333] sm:text-sm">
                {zoomPercent}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-white/70 disabled:opacity-30"
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-white/70"
                aria-label="Reset zoom"
              >
                <RotateCcw className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        <div
          ref={scrollRef}
          className={cn(
            "pdf-study-scroll-area absolute inset-0 overflow-x-hidden overflow-y-auto px-2 py-6 pb-20 sm:px-4 sm:py-8",
            showThumbnails && "pl-36 sm:pl-44",
          )}
        >
          {loadError ? (
            <p className="max-w-md py-20 text-center font-montserrat text-sm text-[#666]">{loadError}</p>
          ) : showPlaceholder ? (
            <div className="flex justify-center">
              <div
                className="animate-pulse bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                style={{ width: renderWidth, height: renderWidth * 1.294 }}
                aria-label="Loading document"
              />
            </div>
          ) : (
            pdfDoc && (
              <div
                className="mx-auto flex flex-col"
                style={{ width: renderWidth, gap: PAGE_GAP_PX }}
              >
                {pageItems.map((page) => (
                  <PdfPageCanvas
                    key={`${renderWidth}-${page}`}
                    pdf={pdfDoc}
                    pageNumber={page}
                    width={renderWidth}
                    devicePixelRatio={renderDpr}
                    tool="select"
                    annotations={annotations[page] ?? emptyAnnotations()}
                    onAnnotationsChange={(next) => updatePageAnnotations(page, next)}
                    highlightSearch={false}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
