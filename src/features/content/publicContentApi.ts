import { api } from "@/api/client";
import { unwrapLaravelData } from "@/api/laravelResponse";
import type { SpecialtySlug } from "@/data/specialtyResources";

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

export async function fetchPublicPracticeSets(
  specialty: SpecialtySlug,
): Promise<PublicDeckMetadata[]> {
  const res = await api.get(`/content/practice-sets?specialty=${specialty}`, {
    skipAuthRedirect: true,
  });
  const data = unwrapLaravelData<unknown[]>(res.data) ?? [];
  return data
    .map(normalizeDeck)
    .filter((r): r is PublicDeckMetadata => r !== null)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

export async function fetchPublicFlashcardDecks(
  specialty: SpecialtySlug,
): Promise<PublicDeckMetadata[]> {
  const res = await api.get(`/content/flashcard-decks?specialty=${specialty}`, {
    skipAuthRedirect: true,
  });
  const data = unwrapLaravelData<unknown[]>(res.data) ?? [];
  return data
    .map(normalizeDeck)
    .filter((r): r is PublicDeckMetadata => r !== null)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}
