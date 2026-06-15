import { api } from "@/api/client";
import { unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";
import type { SpecialtySlug } from "@/data/specialtyResources";
import { specialtyToCategory } from "@/lib/specialtyCategory";

export type FlashcardContent = {
  id: number;
  sort_order: number;
  title: string;
  subtitle: string;
  category: string;
};

export type ApiFlashcard = {
  id: number;
  content_id: number;
  question: string;
  answer: string;
};

function normalizeContent(raw: unknown): FlashcardContent | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    sort_order: Number(o.sort_order ?? 0),
    title: String(o.title ?? ""),
    subtitle: String(o.subtitle ?? ""),
    category: String(o.category ?? ""),
  };
}

function normalizeFlashcard(raw: unknown): ApiFlashcard | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  const contentId = Number(o.content_id);
  if (!Number.isFinite(id) || !Number.isFinite(contentId)) return null;
  return {
    id,
    content_id: contentId,
    question: String(o.question ?? ""),
    answer: String(o.answer ?? ""),
  };
}

export async function fetchFlashcardContents(
  specialty: SpecialtySlug,
): Promise<FlashcardContent[]> {
  const res = await api.post(userEndpoints.contentFlashCards, {
    category: specialtyToCategory(specialty),
    per_page: 50,
  });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows
    .map(normalizeContent)
    .filter((r): r is FlashcardContent => r !== null)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

export async function fetchFlashcardsForContent(contentId: number): Promise<ApiFlashcard[]> {
  const res = await api.post(userEndpoints.contentFlashCardSets, {
    content_id: contentId,
    per_page: 200,
  });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows.map(normalizeFlashcard).filter((r): r is ApiFlashcard => r !== null);
}

export async function recordFlashcardProgress(contentId: number, cardId: number): Promise<void> {
  await api.post(userEndpoints.contentFlashCardNextQuestion, {
    content_id: contentId,
    card_id: cardId,
  });
}
