import * as pdfjs from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

function assetUrl(relativePath: string) {
  const normalized = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  if (typeof window !== "undefined") {
    return new URL(normalized, window.location.origin).href;
  }
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${normalized.replace(/^\//, "")}`;
}

let workerReady: Promise<void> | null = null;

/**
 * Hosts like nginx often serve `.mjs` as `application/octet-stream`, which breaks
 * Worker construction. Fetch the script and boot via a JS blob URL instead.
 */
async function bootstrapPdfWorker() {
  if (typeof window === "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    return;
  }

  const response = await fetch(pdfWorkerSrc, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(`PDF worker failed to load (${response.status}).`);
  }

  const script = await response.text();
  const blob = new Blob([script], { type: "application/javascript" });
  pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
}

export function ensurePdfWorker(): Promise<void> {
  if (!workerReady) {
    workerReady = bootstrapPdfWorker().catch((error) => {
      workerReady = null;
      throw error;
    });
  }
  return workerReady;
}

if (typeof window !== "undefined") {
  void ensurePdfWorker();
}

export const PDF_DOCUMENT_OPTIONS = {
  cMapUrl: assetUrl("/pdfjs/cmaps/"),
  cMapPacked: true,
  standardFontDataUrl: assetUrl("/pdfjs/standard_fonts/"),
} as const;

export { pdfjs };
