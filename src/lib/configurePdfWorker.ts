import * as pdfjs from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

function assetUrl(relativePath: string) {
  const normalized = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  if (typeof window !== "undefined") {
    return new URL(normalized, window.location.origin).href;
  }
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}${normalized.replace(/^\//, "")}`;
}

let workerReady: Promise<void> | null = null;
let workerInstance: InstanceType<typeof PdfWorker> | null = null;

/** Vite ?worker bundles a module worker — works in dev and production without MIME issues. */
function bootstrapPdfWorker() {
  if (typeof window === "undefined") return;

  if (!workerInstance) {
    workerInstance = new PdfWorker();
    pdfjs.GlobalWorkerOptions.workerPort = workerInstance;
  }
}

export function ensurePdfWorker(): Promise<void> {
  if (!workerReady) {
    workerReady = Promise.resolve().then(() => {
      bootstrapPdfWorker();
    }).catch((error) => {
      workerReady = null;
      workerInstance = null;
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
