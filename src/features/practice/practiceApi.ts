import { isAxiosError } from "axios";

import { api } from "@/api/client";
import { unwrapLaravelData, unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { userEndpoints } from "@/config/userEndpoints";
import { categoryMatchesSpecialty } from "@/lib/specialtyCategory";
import type { SpecialtySlug } from "@/data/specialtyResources";

import { normalizeApiQuestion, type ApiPracticeQuestion } from "./mapQuestion";

function emptyListOnNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

export type QuestionSetSummary = {
  id: number;
  sort_order: number;
  title: string;
  category: string;
};

function normalizeSet(raw: unknown): QuestionSetSummary | null {
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

export async function fetchPracticeQuestionSets(
  specialty: SpecialtySlug,
): Promise<QuestionSetSummary[]> {
  try {
    const res = await api.post(userEndpoints.questionSets, { type: 0, per_page: 50 });
    const { rows } = unwrapLaravelPaginatedData(res.data);
    return rows
      .map(normalizeSet)
      .filter((r): r is QuestionSetSummary => r !== null)
      .filter((s) => categoryMatchesSpecialty(s.category, specialty))
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  } catch (error) {
    if (emptyListOnNotFound(error)) return [];
    throw error;
  }
}

export function sortPracticeQuestions(questions: ApiPracticeQuestion[]): ApiPracticeQuestion[] {
  return [...questions].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
  );
}

export async function fetchQuestionsForSet(
  questionSetId: number,
): Promise<ApiPracticeQuestion[]> {
  try {
    const res = await api.post(userEndpoints.questionSetQuestions, {
      question_set_id: questionSetId,
      per_page: 200,
    });
    const { rows } = unwrapLaravelPaginatedData(res.data);
    return sortPracticeQuestions(
      rows.map(normalizeApiQuestion).filter((r): r is ApiPracticeQuestion => r !== null),
    );
  } catch (error) {
    if (emptyListOnNotFound(error)) return [];
    throw error;
  }
}

export type SubmitAnswerResult = {
  is_correct: boolean;
  correct_answer: string;
};

export async function submitPracticeAnswer(
  questionSetId: number,
  questionId: number,
  answer: string,
): Promise<SubmitAnswerResult> {
  const res = await api.post(userEndpoints.questionSubmitAnswer, {
    question_set_id: questionSetId,
    question_id: questionId,
    answer,
  });
  const data = unwrapLaravelData<Record<string, unknown>>(res.data) ?? {};
  return {
    is_correct: Boolean(data.is_correct),
    correct_answer: String(data.correct_answer ?? ""),
  };
}
