import { isAxiosError } from "axios";

import { api } from "@/api/client";
import { unwrapLaravelData } from "@/api/laravelResponse";
import type { SpecialtySlug } from "@/data/specialtyResources";
import { categoryMatchesSpecialty } from "@/lib/specialtyCategory";

export type PublicDeckMetadata = {
  id: number;
  sort_order: number;
  title: string;
  category: string;
};

function normalizeDeck(raw: unknown): PublicDeckMetadata | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    sort_order: Number(o.sort_order ?? 0),
    title: String(o.title ?? ""),
    category: String(o.category ?? ""),
  };
}

function normalizeDeckList(body: unknown): PublicDeckMetadata[] {
  const data = unwrapLaravelData<unknown[]>(body) ?? [];
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map(normalizeDeck)
    .filter((r): r is PublicDeckMetadata => r !== null)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

function emptyOnPublicListError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403 || status === 404;
}

async function fetchPublicDeckList(path: string): Promise<PublicDeckMetadata[]> {
  try {
    const res = await api.get(path, { skipAuthRedirect: true });
    return normalizeDeckList(res.data);
  } catch (error) {
    if (emptyOnPublicListError(error)) return [];
    throw error;
  }
}

export async function fetchPublicPracticeSets(
  specialty: SpecialtySlug,
): Promise<PublicDeckMetadata[]> {
  const all = await fetchAllPublicPracticeSets();
  return all.filter((item) => categoryMatchesSpecialty(item.category, specialty));
}

export async function fetchPublicFlashcardDecks(
  specialty: SpecialtySlug,
): Promise<PublicDeckMetadata[]> {
  const all = await fetchAllPublicFlashcardDecks();
  return all.filter((item) => categoryMatchesSpecialty(item.category, specialty));
}

export async function fetchAllPublicPracticeSets(): Promise<PublicDeckMetadata[]> {
  return fetchPublicDeckList("/content/practice-sets");
}

export async function fetchAllPublicFlashcardDecks(): Promise<PublicDeckMetadata[]> {
  return fetchPublicDeckList("/content/flashcard-decks");
}
