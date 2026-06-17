import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

type QuillOp = { insert?: unknown };

function isQuillOp(value: unknown): value is QuillOp {
  return typeof value === "object" && value !== null && "insert" in value;
}

function isQuillOpsArray(value: unknown): value is QuillOp[] {
  return Array.isArray(value) && value.length > 0 && value.every(isQuillOp);
}

function extractQuillOps(parsed: unknown): QuillOp[] | null {
  if (isQuillOpsArray(parsed)) {
    return parsed;
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "ops" in parsed &&
    isQuillOpsArray((parsed as { ops: unknown }).ops)
  ) {
    return (parsed as { ops: QuillOp[] }).ops;
  }

  return null;
}

function quillOpsToHtml(ops: QuillOp[]): string {
  const converter = new QuillDeltaToHtmlConverter(ops, {
    multiLineParagraph: true,
    multiLineHeader: true,
  });

  return converter.convert();
}

/** True when rendered CMS HTML has no visible text. */
export function isCmsContentEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length === 0;
}

/**
 * CMS pages may store Quill delta JSON (from admin) or legacy HTML/plain text.
 * Returns HTML suitable for dangerouslySetInnerHTML.
 */
export function renderCmsContent(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const ops = extractQuillOps(parsed);
      if (ops) {
        return quillOpsToHtml(ops);
      }
    } catch {
      // Not JSON — fall through to raw content.
    }
  }

  return trimmed;
}
