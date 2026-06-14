import type { PracticeQuestion } from "@/components/practice/PracticeQuiz";
import { resolveQuestionMedia } from "@/features/practice/questionMedia";

export type ApiPracticeQuestion = {
  id: number;
  question_set_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  rationale?: string;
  file?: string;
  file_attributes?: string;
};

const OPTION_KEYS = ["option_a", "option_b", "option_c", "option_d"] as const;

export type AnswerKey = (typeof OPTION_KEYS)[number];

export function normalizeApiQuestion(raw: unknown): ApiPracticeQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  const setId = Number(o.question_set_id);
  if (!Number.isFinite(id) || !Number.isFinite(setId)) return null;
  return {
    id,
    question_set_id: setId,
    question: String(o.question ?? ""),
    option_a: String(o.option_a ?? ""),
    option_b: String(o.option_b ?? ""),
    option_c: String(o.option_c ?? ""),
    option_d: String(o.option_d ?? ""),
    answer: String(o.answer ?? "option_a"),
    rationale: typeof o.rationale === "string" ? o.rationale : undefined,
    file: typeof o.file === "string" ? o.file : undefined,
    file_attributes:
      typeof o.file_attributes === "string" ? o.file_attributes : undefined,
  };
}

export function toPracticeQuestion(q: ApiPracticeQuestion): PracticeQuestion {
  const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
  const correctIndex = Math.max(0, OPTION_KEYS.indexOf(q.answer as AnswerKey));
  const media = resolveQuestionMedia(q.file, q.file_attributes);

  return {
    id: q.id,
    questionSetId: q.question_set_id,
    prompt: q.question,
    options,
    correctIndex,
    feedbackCorrect: q.rationale,
    ...(media ? { media } : {}),
  };
}

export function indexToAnswerKey(index: number): AnswerKey {
  return OPTION_KEYS[index] ?? "option_a";
}

export function answerKeyToLabel(key: AnswerKey, q: ApiPracticeQuestion): string {
  return q[key] ?? "";
}
