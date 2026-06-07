import type { PDFDocumentProxy } from "pdfjs-dist";

import { ensurePdfWorker, PDF_DOCUMENT_OPTIONS, pdfjs } from "@/lib/configurePdfWorker";
import { isRemotePdfSource } from "@/lib/pdfFetchUrl";
import { loadPdfBytes, resolvePdfAssetId } from "@/lib/loadPdfBytes";

export { isRemotePdfSource };

export type PdfLoadSources = {
  primary: string;
  fallback?: string;
};

const documentCache = new Map<string, PDFDocumentProxy>();
const inflightDocuments = new Map<string, Promise<PDFDocumentProxy>>();

function cacheKeyForSources(sources: PdfLoadSources) {
  return [sources.primary, sources.fallback].filter(Boolean).join("|");
}

export function isPdfDocumentCached(source: string | PdfLoadSources) {
  const key =
    typeof source === "string" ? resolvePdfAssetId(source) : cacheKeyForSources(source);
  return documentCache.has(key);
}

function isRetriablePdfError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /404|unexpected server response|failed to fetch|network|worker was destroyed|worker failed to load/i.test(
    error.message,
  );
}

function appendCacheBuster(url: string, version?: string | number) {
  if (!version) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(String(version))}`;
}

/**
 * Always open PDFs from in-memory bytes. Passing a `url` to pdf.js triggers
 * range requests that Chrome / download managers treat as file downloads.
 */
async function openPdfFromSource(source: string, attempt = 0): Promise<PDFDocumentProxy> {
  try {
    await ensurePdfWorker();
    const bytes = await loadPdfBytes(source);
    const loadingTask = pdfjs.getDocument({
      data: bytes.slice(),
      ...PDF_DOCUMENT_OPTIONS,
      disableAutoFetch: true,
      disableStream: true,
    });

    return await loadingTask.promise;
  } catch (error) {
    if (
      attempt < 1 &&
      error instanceof Error &&
      /worker was destroyed/i.test(error.message)
    ) {
      await new Promise((resolve) => window.setTimeout(resolve, 80));
      return openPdfFromSource(source, attempt + 1);
    }
    throw error;
  }
}

export async function loadPdfDocument(source: string | PdfLoadSources): Promise<PDFDocumentProxy> {
  const sources: PdfLoadSources =
    typeof source === "string" ? { primary: source } : source;
  const key = cacheKeyForSources(sources);
  const cachedDoc = documentCache.get(key);
  if (cachedDoc) return cachedDoc;

  const pending = inflightDocuments.get(key);
  if (pending) return pending;

  const loadPromise = (async () => {
    const attempts = [sources.primary, sources.fallback].filter(
      (url, index, list): url is string => Boolean(url) && list.indexOf(url) === index,
    );

    let primaryError: unknown;
    let lastError: unknown;
    for (const [index, url] of attempts.entries()) {
      try {
        const pdf = await openPdfFromSource(url);
        documentCache.set(key, pdf);
        return pdf;
      } catch (error) {
        if (index === 0) primaryError = error;
        lastError = error;
        if (!isRetriablePdfError(error)) {
          throw error;
        }
      }
    }

    const bestError = primaryError ?? lastError;
    throw bestError instanceof Error
      ? bestError
      : new Error("Unable to load this PDF. The file may be missing on the server.");
  })();

  inflightDocuments.set(key, loadPromise);

  try {
    return await loadPromise;
  } catch (error) {
    documentCache.delete(key);
    throw error;
  } finally {
    inflightDocuments.delete(key);
  }
}

/** Build load sources with cache-busting after admin re-uploads. */
export function buildPdfLoadSources(
  fileUrl: string,
  fileSrc?: string,
  version?: string | number,
): PdfLoadSources {
  const primary = appendCacheBuster(fileUrl, version);
  const fallback =
    fileSrc && fileSrc !== fileUrl && !fileSrc.includes("no_img.jpg")
      ? appendCacheBuster(fileSrc, version)
      : undefined;

  return { primary, fallback };
}

export function clearPdfDocumentCache() {
  for (const doc of documentCache.values()) {
    void doc.destroy();
  }
  documentCache.clear();
  inflightDocuments.clear();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearPdfDocumentCache();
  });
}
