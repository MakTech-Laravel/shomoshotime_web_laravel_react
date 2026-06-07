/**
 * Study PDFs are bundled as base64 data URLs (see vite inline-study-pdf-bin plugin).
 * CMS study-guide PDFs load via the shared axios API client (same transport as guide metadata).
 */

import axios from "axios";

import { api } from "@/api/client";
import pathologyDataUrl from "@/assets/study-pdfs/pathology-perfusion-and-function.bin";
import {
  isRemotePdfSource,
  parseStudyGuideStreamRequest,
  resolveAbsolutePdfUrl,
} from "@/lib/pdfFetchUrl";

const BUNDLED_PDF_DATA_URLS: Record<string, string> = {
  "pathology-perfusion-and-function": pathologyDataUrl,
};

const PDF_LOAD_TIMEOUT_MS = 120_000;

const cache = new Map<string, Uint8Array>();
const inflight = new Map<string, Promise<Uint8Array>>();

export { isRemotePdfSource } from "@/lib/pdfFetchUrl";

function isAbortError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (axios.isCancel(error)) return true;
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

function axiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status) return `Unable to load PDF (${status}).`;
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Network error while loading PDF.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Unable to load this PDF. Please try again later.";
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  if (!dataUrl.includes(",")) {
    throw new Error("Invalid embedded PDF data.");
  }

  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

/** Accepts pdfAssetId (preferred) or legacy path containing the slug. */
export function resolvePdfAssetId(pathOrId: string) {
  if (isRemotePdfSource(pathOrId) || parseStudyGuideStreamRequest(pathOrId)) {
    return pathOrId;
  }

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

function validatePdfBytes(bytes: Uint8Array) {
  if (bytes.byteLength === 0) {
    throw new Error("PDF file is empty.");
  }
  if (!isPdfHeader(bytes)) {
    throw new Error("Invalid PDF file.");
  }
}

/** Study guides: axios hits the same API base that already serves guide metadata on live. */
async function fetchStudyGuidePdfBytes(
  url: string,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const request = parseStudyGuideStreamRequest(url);
  if (!request) {
    throw new Error("Invalid study guide PDF path.");
  }

  try {
    const res = await api.get<ArrayBuffer>(request.path, {
      params: request.params,
      responseType: "arraybuffer",
      headers: { Accept: "application/pdf" },
      signal,
      timeout: PDF_LOAD_TIMEOUT_MS,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      skipAuthRedirect: true,
    });

    const bytes = new Uint8Array(res.data);
    validatePdfBytes(bytes);
    return bytes;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(axiosErrorMessage(error));
  }
}

async function fetchRemotePdfBytes(url: string, signal?: AbortSignal): Promise<Uint8Array> {
  const absoluteUrl = resolveAbsolutePdfUrl(url);

  const res = await fetch(absoluteUrl, {
    method: "GET",
    credentials: "omit",
    signal,
    headers: { Accept: "application/pdf" },
  });

  if (!res.ok) {
    throw new Error(`Unable to load PDF (${res.status}).`);
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  validatePdfBytes(bytes);
  return bytes;
}

function storeCachedPdf(cacheKey: string, bytes: Uint8Array) {
  const copy = bytes.slice();
  cache.set(cacheKey, copy);
  return copy.slice();
}

export function loadPdfBytes(pathOrId: string, signal?: AbortSignal): Promise<Uint8Array> {
  const assetId = resolvePdfAssetId(pathOrId);
  const cached = cache.get(assetId);
  if (cached) return Promise.resolve(cached.slice());

  const pending = inflight.get(assetId);
  if (pending) return pending.then((bytes) => bytes.slice());

  const loadPromise = (async () => {
    if (parseStudyGuideStreamRequest(pathOrId)) {
      const bytes = await fetchStudyGuidePdfBytes(pathOrId, signal);
      return storeCachedPdf(assetId, bytes);
    }

    if (isRemotePdfSource(pathOrId)) {
      const bytes = await fetchRemotePdfBytes(pathOrId, signal);
      return storeCachedPdf(assetId, bytes);
    }

    const dataUrl = BUNDLED_PDF_DATA_URLS[assetId];
    if (!dataUrl) {
      throw new Error(`Unknown study guide PDF: ${assetId}`);
    }

    const bytes = await dataUrlToBytes(dataUrl);
    validatePdfBytes(bytes);
    return storeCachedPdf(assetId, bytes);
  })();

  inflight.set(assetId, loadPromise);

  return loadPromise.finally(() => {
    inflight.delete(assetId);
  });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearPdfCache();
  });
}

export { isAbortError };
