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

export type GuestLearningNavMetadata = {
  flashcards: PublicDeckMetadata[];
  practice: PublicDeckMetadata[];
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

function normalizeDeckRows(rows: unknown): PublicDeckMetadata[] {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .map(normalizeDeck)
    .filter((r): r is PublicDeckMetadata => r !== null)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

function normalizeDeckList(body: unknown): PublicDeckMetadata[] {
  const data = unwrapLaravelData<unknown>(body);
  if (Array.isArray(data)) {
    return normalizeDeckRows(data);
  }
  return [];
}

function emptyOnPublicListError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403 || status === 404 || status === 500;
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

async function fetchBundledLearningNav(): Promise<GuestLearningNavMetadata> {
  try {
    const res = await api.get("/content/study-guides", {
      params: { include_learning_nav: 1 },
      skipAuthRedirect: true,
    });
    const data = unwrapLaravelData<unknown>(res.data);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { flashcards: [], practice: [] };
    }

    const payload = data as Record<string, unknown>;
    const flashcards = normalizeDeckRows(payload.flashcard_decks);
    const practice = normalizeDeckRows(payload.practice_sets);

    return { flashcards, practice };
  } catch (error) {
    if (emptyOnPublicListError(error)) {
      return { flashcards: [], practice: [] };
    }
    throw error;
  }
}

/** Guest nav metadata: dedicated endpoints, then bundled study-guides fallback. */
export async function fetchGuestLearningNavMetadata(): Promise<GuestLearningNavMetadata> {
  const [flashcards, practice] = await Promise.all([
    fetchPublicDeckList("/content/flashcard-decks"),
    fetchPublicDeckList("/content/practice-sets"),
  ]);

  if (flashcards.length > 0 || practice.length > 0) {
    return { flashcards, practice };
  }

  return fetchBundledLearningNav();
}

export async function fetchPublicPracticeSets(
  specialty: SpecialtySlug,
): Promise<PublicDeckMetadata[]> {
  const { practice } = await fetchGuestLearningNavMetadata();
  return practice.filter((item) => categoryMatchesSpecialty(item.category, specialty));
}

export async function fetchPublicFlashcardDecks(
  specialty: SpecialtySlug,
): Promise<PublicDeckMetadata[]> {
  const { flashcards } = await fetchGuestLearningNavMetadata();
  return flashcards.filter((item) => categoryMatchesSpecialty(item.category, specialty));
}

export async function fetchAllPublicPracticeSets(): Promise<PublicDeckMetadata[]> {
  const { practice } = await fetchGuestLearningNavMetadata();
  return practice;
}

export async function fetchAllPublicFlashcardDecks(): Promise<PublicDeckMetadata[]> {
  const { flashcards } = await fetchGuestLearningNavMetadata();
  return flashcards;
}
