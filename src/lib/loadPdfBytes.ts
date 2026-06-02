/**
 * Study PDFs are bundled as base64 data URLs (see vite inline-study-pdf-bin plugin).
 * No network fetch to /pdfs/*.pdf — prevents IDM / Chrome auto-download on page load.
 */
import pathologyDataUrl from "@/assets/study-pdfs/pathology-perfusion-and-function.bin";

const BUNDLED_PDF_DATA_URLS: Record<string, string> = {
  "pathology-perfusion-and-function": pathologyDataUrl,
};

const cache = new Map<string, Uint8Array>();

function isAbortError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error && /aborted/i.test(error.message)) return true;
  return false;
}

function isPdfHeader(bytes: Uint8Array) {
  return (
    bytes.byteLength >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) {
    throw new Error("Invalid embedded PDF data.");
  }

  const base64 = dataUrl.slice(comma + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Accepts pdfAssetId (preferred) or legacy path containing the slug. */
export function resolvePdfAssetId(pathOrId: string) {
  const normalized = pathOrId.replace(/^\/+/, "");
  if (BUNDLED_PDF_DATA_URLS[pathOrId]) return pathOrId;

  const apiMatch = normalized.match(/^api\/study-pdf\/([^/?]+)/);
  if (apiMatch?.[1]) return apiMatch[1];

  const pdfMatch = normalized.match(/([^/]+?)(?:\.pdf)?$/);
  if (pdfMatch?.[1] && BUNDLED_PDF_DATA_URLS[pdfMatch[1]]) return pdfMatch[1];

  return pathOrId;
}

export function isPdfCached(pathOrId: string) {
  return cache.has(resolvePdfAssetId(pathOrId));
}

export function clearPdfCache() {
  cache.clear();
}

export function loadPdfBytes(pathOrId: string): Promise<Uint8Array> {
  const assetId = resolvePdfAssetId(pathOrId);
  const cached = cache.get(assetId);
  if (cached) return Promise.resolve(cached.slice());

  const dataUrl = BUNDLED_PDF_DATA_URLS[assetId];
  if (!dataUrl) {
    return Promise.reject(new Error(`Unknown study guide PDF: ${assetId}`));
  }

  return Promise.resolve().then(() => {
    const bytes = dataUrlToBytes(dataUrl);
    if (bytes.byteLength === 0) {
      throw new Error("PDF file is empty.");
    }
    if (!isPdfHeader(bytes)) {
      throw new Error("Invalid PDF file.");
    }
    const copy = bytes.slice();
    cache.set(assetId, copy);
    return copy.slice();
  });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearPdfCache();
  });
}

export { isAbortError };
