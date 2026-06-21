import { api } from "@/api/client";
import { unwrapLaravelData, unwrapLaravelPaginatedData } from "@/api/laravelResponse";
import { categoryMatchesSpecialty } from "@/lib/specialtyCategory";
import type { SpecialtySlug } from "@/data/specialtyResources";

import { normalizeApiQuestion, toPracticeQuestion, type ApiPracticeQuestion } from "@/features/practice/mapQuestion";
import { sortPracticeQuestions } from "@/features/practice/practiceApi";
import type { PracticeQuestion } from "@/components/practice/PracticeQuiz";

export type MockExamSet = {
  id: number;
  sort_order: number;
  title: string;
  subtitle: string;
  category: string;
  status: number;
  status_label: string;
  total_questions: number;
  attempts_used: number;
  attempts_remaining: number;
  can_start: boolean;
  best_score_percentage: number;
};

export type MockTestAttemptSummary = {
  id: number;
  attempt_number: number;
  total_questions: number;
  questions_answered: number;
  correct_answers: number;
  wrong_answers: number;
  score_percentage: number | null;
  status: string;
};

function normalizeMockSet(raw: unknown): MockExamSet | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  if (!Number.isFinite(id)) return null;

  const analyticsList = Array.isArray(o.analytics) ? o.analytics : [];
  const analytics =
    analyticsList.length > 0 && typeof analyticsList[0] === "object"
      ? (analyticsList[0] as Record<string, unknown>)
      : null;
  const mockTest =
    analytics?.mock_test && typeof analytics.mock_test === "object"
      ? (analytics.mock_test as Record<string, unknown>)
      : null;

  const attemptsUsed = Number(mockTest?.total_attempts ?? 0);
  const attemptsRemaining = Number(mockTest?.remaining_attempts ?? 999);
  const canStart = mockTest?.can_start !== false;

  return {
    id,
    sort_order: Number(o.sort_order ?? 0),
    title: String(o.title ?? ""),
    subtitle: String(o.subtitle ?? ""),
    category: String(o.category ?? ""),
    status: Number(o.status ?? 0),
    status_label: String(o.status_label ?? ""),
    total_questions: Number(o.total_questions ?? 0),
    attempts_used: Number.isFinite(attemptsUsed) ? attemptsUsed : 0,
    attempts_remaining: Number.isFinite(attemptsRemaining) ? attemptsRemaining : 999,
    can_start: canStart,
    best_score_percentage: Number(mockTest?.best_percentage ?? 0),
  };
}

export async function fetchMockExamSets(specialty?: SpecialtySlug): Promise<MockExamSet[]> {
  const res = await api.post("/user/question/sets", { type: 1, per_page: 100 });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return rows
    .map(normalizeMockSet)
    .filter((r): r is MockExamSet => r !== null)
    .filter((s) => (specialty ? categoryMatchesSpecialty(s.category, specialty) : true))
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

export async function fetchMockExamQuestions(questionSetId: number): Promise<PracticeQuestion[]> {
  const res = await api.post("/user/question/sets/questions", {
    question_set_id: questionSetId,
    per_page: 200,
  });
  const { rows } = unwrapLaravelPaginatedData(res.data);
  return sortPracticeQuestions(
    rows.map(normalizeApiQuestion).filter((r): r is ApiPracticeQuestion => r !== null),
  ).map(toPracticeQuestion);
}

export type StartMockTestResult = {
  mock_attempt: {
    id: number;
    attempt_number: number;
    total_questions: number;
    status: string;
  };
  analytics?: {
    remaining_attempts?: number;
  };
};

export async function startMockTest(questionSetId: number): Promise<StartMockTestResult> {
  const res = await api.post("/user/question/start-mock-test", { question_set_id: questionSetId });
  const data = unwrapLaravelData<Record<string, unknown>>(res.data) ?? {};
  const attempt = data.mock_attempt as Record<string, unknown> | undefined;
  return {
    mock_attempt: {
      id: Number(attempt?.id ?? 0),
      attempt_number: Number(attempt?.attempt_number ?? 0),
      total_questions: Number(attempt?.total_questions ?? 0),
      status: String(attempt?.status ?? ""),
    },
    analytics: data.analytics as StartMockTestResult["analytics"],
  };
}

export async function fetchMockExamResults(questionSetId: number): Promise<MockTestAttemptSummary[]> {
  const res = await api.post("/user/question/mock-tests/all-results", {
    question_set_id: questionSetId,
  });
  const data = unwrapLaravelData<Record<string, unknown>>(res.data) ?? {};
  const attempts = Array.isArray(data.attempts) ? data.attempts : [];
  return attempts.map((raw) => {
    const o = raw as Record<string, unknown>;
    return {
      id: Number(o.id ?? 0),
      attempt_number: Number(o.attempt_number ?? 0),
      total_questions: Number(o.total_questions ?? 0),
      questions_answered: Number(o.questions_answered ?? 0),
      correct_answers: Number(o.correct_answers ?? 0),
      wrong_answers: Number(o.wrong_answers ?? 0),
      score_percentage:
        o.score_percentage != null ? Number(o.score_percentage) : null,
      status: String(o.status ?? ""),
    };
  });
}

export async function submitMockAnswer(
  questionSetId: number,
  questionId: number,
  answer: string,
): Promise<{ is_correct: boolean; correct_answer: string }> {
  const res = await api.post("/user/question/submit-answer", {
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
