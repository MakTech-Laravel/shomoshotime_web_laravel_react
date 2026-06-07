import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eraser,
  LayoutGrid,
  MessageSquarePlus,
  MoreVertical,
  MousePointer2,
  Paperclip,
  Pencil,
  Printer,
  RotateCcw,
  Search,
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
  type SearchMatch,
  type ToolId,
} from "@/components/study-guide/pdf-viewer-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { loadPdfBytes } from "@/lib/loadPdfBytes";
import { isPdfDocumentCached, loadPdfDocument, type PdfLoadSources } from "@/lib/loadPdfDocument";
import { searchPdfText } from "@/lib/pdfTextSearch";
import { cn } from "@/lib/utils";

import "./pdf-study-viewer.css";

type PdfStudyViewerProps = {
  pdfSources: PdfLoadSources;
  fileName: string;
  className?: string;
};

const TOOLS: { id: ToolId; label: string; Icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select", Icon: MousePointer2 },
  { id: "comment", label: "Add comment", Icon: MessageSquarePlus },
  { id: "draw", label: "Draw", Icon: Pencil },
  { id: "attach", label: "Attach file", Icon: Paperclip },
];

const MIN_SCALE = 0.6;
const MAX_SCALE = 2;
const SCALE_STEP = 0.15;
const MAX_RENDER_DPR = 2;
const PAGE_GAP_PX = 16;

function truncateFileName(name: string, max = 28) {
  if (name.length <= max) return name;
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const base = name.slice(0, max - ext.length - 3);
  return `${base}...${ext}`;
}

function getRenderDpr() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, MAX_RENDER_DPR);
}

export function PdfStudyViewer({ pdfSources, fileName, className }: PdfStudyViewerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollSyncLock = useRef(false);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [pageWidth, setPageWidth] = useState(720);
  const [activeTool, setActiveTool] = useState<ToolId>("select");
  const [annotations, setAnnotations] = useState<PageAnnotationsMap>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [renderDpr, setRenderDpr] = useState(getRenderDpr);
  const [scrollThumb, setScrollThumb] = useState({ top: 0, height: 40 });

  const [showThumbnails, setShowThumbnails] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const renderWidth = Math.round(pageWidth * scale);
  const activeMatch = searchMatches[matchIndex] ?? null;

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
    setSearchMatches([]);
    setSearchQuery("");

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

  useEffect(() => {
    if (!pdfDoc || !searchQuery.trim()) {
      setSearchMatches([]);
      setMatchIndex(0);
      return;
    }

    const handle = window.setTimeout(() => {
      setIsSearching(true);
      searchPdfText(pdfDoc, searchQuery)
        .then((matches) => {
          setSearchMatches(matches);
          setMatchIndex(0);
          if (matches[0]) scrollToPage(matches[0].page);
        })
        .finally(() => setIsSearching(false));
    }, 280);

    return () => window.clearTimeout(handle);
  }, [pdfDoc, searchQuery, scrollToPage]);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [searchOpen]);

  const goToPreviousPage = useCallback(() => {
    scrollToPage(Math.max(1, pageNumber - 1));
  }, [pageNumber, scrollToPage]);

  const goToNextPage = useCallback(() => {
    scrollToPage(numPages ? Math.min(numPages, pageNumber + 1) : pageNumber);
  }, [numPages, pageNumber, scrollToPage]);

  const goToMatch = useCallback(
    (direction: 1 | -1) => {
      if (!searchMatches.length) return;
      const next = (matchIndex + direction + searchMatches.length) % searchMatches.length;
      setMatchIndex(next);
      scrollToPage(searchMatches[next].page);
    },
    [matchIndex, searchMatches, scrollToPage],
  );

  const zoomIn = useCallback(() => {
    setScale((current) => Math.min(MAX_SCALE, Number((current + SCALE_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((current) => Math.max(MIN_SCALE, Number((current - SCALE_STEP).toFixed(2))));
  }, []);

  const resetZoom = useCallback(() => setScale(1), []);

  const downloadPdf = useCallback(async () => {
    const bytes = await loadPdfBytes(pdfSources.primary);
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [pdfSources.primary, fileName]);

  const printPdf = useCallback(async () => {
    const bytes = await loadPdfBytes(pdfSources.primary);
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    );
    const win = window.open(url, "_blank");
    win?.addEventListener("load", () => win.print(), { once: true });
    URL.revokeObjectURL(url);
  }, [pdfSources.primary]);

  const clearPageAnnotations = useCallback(() => {
    setAnnotations((current) => ({
      ...current,
      [pageNumber]: emptyAnnotations(),
    }));
  }, [pageNumber]);

  const clearAllAnnotations = useCallback(() => {
    setAnnotations({});
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setActiveTool("select");
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchMatches([]);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        if (event.key === "Escape" && searchOpen) {
          closeSearch();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        openSearch();
        return;
      }

      if (searchOpen && searchMatches.length) {
        if (event.key === "Enter" && event.shiftKey) {
          event.preventDefault();
          goToMatch(-1);
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          goToMatch(1);
          return;
        }
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
  }, [
    closeSearch,
    goToMatch,
    goToNextPage,
    goToPreviousPage,
    openSearch,
    searchMatches.length,
    searchOpen,
  ]);

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
        "flex min-h-0 flex-col overflow-hidden rounded-[2px] border border-[#d6d6d6] bg-white shadow-[0_4px_28px_rgba(0,0,0,0.09)]",
        className,
      )}
    >
      <div className="shrink-0 border-b border-[#e0e0e0] bg-[#f5f5f5]">
        <div className="flex h-10 items-center gap-3 px-4 sm:h-11">
          <span
            className="flex size-[22px] shrink-0 items-center justify-center rounded-[2px] bg-[#eb0000] text-[9px] font-bold leading-none text-white"
            aria-hidden
          >
            PDF
          </span>
          <p className="min-w-0 flex-1 truncate text-center font-montserrat text-[13px] text-[#5c5c5c] sm:text-sm">
            {truncateFileName(fileName, 32)}
          </p>
          <div className="flex shrink-0 items-center gap-1 text-[#4a4a4a]">
            <button
              type="button"
              className={cn("rounded p-1.5 hover:bg-black/5", searchOpen && "bg-black/10")}
              aria-label="Search in document"
              aria-pressed={searchOpen}
              onClick={() => (searchOpen ? closeSearch() : openSearch())}
            >
              <Search className="size-4" strokeWidth={2} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded p-1.5 hover:bg-black/5"
                  aria-label="More options"
                >
                  <MoreVertical className="size-4" strokeWidth={2} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-montserrat">
                <DropdownMenuItem onClick={() => void downloadPdf()}>
                  <Download className="size-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void printPdf()}>
                  <Printer className="size-4" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={resetZoom}>
                  <RotateCcw className="size-4" />
                  Reset zoom
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearPageAnnotations}>
                  <Eraser className="size-4" />
                  Clear marks on this page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearAllAnnotations}>
                  <Eraser className="size-4" />
                  Clear all marks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {searchOpen && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#e8e8e8] px-4 py-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#888]" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Find in document..."
                className="h-8 pl-8 font-montserrat text-sm"
                aria-label="Search text in PDF"
              />
            </div>
            <span className="font-montserrat text-xs text-[#666]">
              {isSearching
                ? "Searching..."
                : searchQuery
                  ? `${searchMatches.length} match${searchMatches.length === 1 ? "" : "es"}`
                  : "Type to search"}
            </span>
            <button
              type="button"
              disabled={!searchMatches.length}
              onClick={() => goToMatch(-1)}
              className="rounded px-2 py-1 font-montserrat text-xs text-[#333] hover:bg-black/5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!searchMatches.length}
              onClick={() => goToMatch(1)}
              className="rounded px-2 py-1 font-montserrat text-xs text-[#333] hover:bg-black/5 disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              onClick={closeSearch}
              className="rounded p-1 hover:bg-black/5"
              aria-label="Close search"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div ref={viewportRef} className="relative min-h-0 flex-1 bg-[#ebebeb]">
        <div className="absolute left-4 top-4 z-20 hidden flex-col overflow-hidden rounded-[2px] border border-[#c4c4c4] bg-[#ececec] shadow-[0_1px_4px_rgba(0,0,0,0.12)] md:flex">
          {TOOLS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={activeTool === id}
              onClick={() => setActiveTool(id)}
              className={cn(
                "flex size-10 items-center justify-center border-b border-[#d8d8d8] transition-colors last:border-b-0",
                activeTool === id
                  ? "bg-[#2b6cb0] text-white"
                  : "text-[#5a5a5a] hover:bg-[#e0e0e0]",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={2} />
            </button>
          ))}
        </div>

        {showThumbnails && pdfDoc && !showPlaceholder && (
          <div className="pdf-study-thumbnails absolute bottom-20 left-2 top-14 z-20 flex w-[5.5rem] flex-col gap-2 overflow-y-auto rounded-[2px] border border-[#c4c4c4] bg-white p-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.12)] sm:left-4 sm:w-[7.5rem] sm:p-2 md:bottom-4 md:left-4 md:top-[4.75rem]">
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
        )}

        <div className="absolute right-4 top-4 z-20 hidden w-11 flex-col items-center gap-1 rounded-[2px] border border-[#c4c4c4] bg-white px-1.5 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.12)] md:flex">
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="rounded p-0.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronUp className="size-4" strokeWidth={2.5} />
            </button>
            <p className="whitespace-nowrap px-0.5 text-center font-montserrat text-[11px] leading-none text-[#333]">
              <span className="font-semibold">{pageNumber}</span>
              <span className="text-[#999]"> / </span>
              <span className="text-[#666]">{numPages || "—"}</span>
            </p>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={!numPages || pageNumber >= numPages}
              className="rounded p-0.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronDown className="size-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="my-0.5 h-px w-full bg-[#ececec]" aria-hidden />

          <button
            type="button"
            className={cn(
              "rounded p-1.5 text-[#5a5a5a] hover:bg-[#f0f0f0]",
              showThumbnails && "bg-[#2b6cb0] text-white hover:bg-[#255fa0]",
            )}
            aria-label="Page thumbnails"
            aria-pressed={showThumbnails}
            onClick={() => setShowThumbnails((open) => !open)}
          >
            <LayoutGrid className="size-[18px]" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              className="rounded p-1.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
              aria-label="Zoom in"
            >
              <ZoomIn className="size-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              className="rounded p-1.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
              aria-label="Zoom out"
            >
              <ZoomOut className="size-[18px]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {!showPlaceholder && !loadError && (
          <div
            className="pdf-study-scrollbar-track absolute right-1 top-4 bottom-20 z-10 hidden w-2 cursor-pointer rounded-full bg-[#d4d4d4] md:bottom-4 md:block"
            onClick={onTrackClick}
            aria-hidden
          >
            <div
              className="absolute left-0 w-full rounded-full bg-[#3d3d3d] transition-[top,height] duration-75"
              style={{ top: scrollThumb.top, height: scrollThumb.height }}
            />
          </div>
        )}

        {/* Mobile bottom toolbar */}
        {!showPlaceholder && !loadError && (
          <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-1 border-t border-[#d0d0d0] bg-white/95 px-2 py-1.5 backdrop-blur-sm md:hidden">
            <div className="flex items-center gap-0.5">
              {TOOLS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  aria-pressed={activeTool === id}
                  onClick={() => setActiveTool(id)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-[2px] transition-colors",
                    activeTool === id
                      ? "bg-[#2b6cb0] text-white"
                      : "text-[#5a5a5a] hover:bg-[#f0f0f0]",
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={pageNumber <= 1}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronUp className="size-4" strokeWidth={2.5} />
              </button>
              <span className="min-w-[3rem] text-center font-montserrat text-[11px] text-[#333]">
                <span className="font-semibold">{pageNumber}</span>
                <span className="text-[#999]">/{numPages || "—"}</span>
              </span>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={!numPages || pageNumber >= numPages}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronDown className="size-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className={cn(
                  "rounded p-1.5 text-[#5a5a5a] hover:bg-[#f0f0f0]",
                  showThumbnails && "bg-[#2b6cb0] text-white hover:bg-[#255fa0]",
                )}
                aria-label="Page thumbnails"
                aria-pressed={showThumbnails}
                onClick={() => setShowThumbnails((open) => !open)}
              >
                <LayoutGrid className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                className="rounded p-1.5 text-[#5a5a5a] hover:bg-[#f3f3f3] disabled:opacity-30"
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        <div
          ref={scrollRef}
          className={cn(
            "pdf-study-scroll-area absolute inset-0 overflow-x-hidden overflow-y-auto px-2 py-6 pb-[4.25rem] md:px-0 md:py-10 md:pb-10 md:pr-16 md:pl-16",
            showThumbnails && "md:pl-40",
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
                    tool={activeTool}
                    annotations={annotations[page] ?? emptyAnnotations()}
                    onAnnotationsChange={(next) => updatePageAnnotations(page, next)}
                    highlightSearch={activeMatch?.page === page}
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
