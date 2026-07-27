import type { SpecialtySlug } from "@/data/specialtyResources";
import { categoryMatchesSpecialty } from "@/lib/specialtyCategory";

import type { MockExamSet } from "./mockExamsApi";

export type MockExamFilterKey = "arrt" | SpecialtySlug;

export function isArrtMockExam(exam: { title: string; category?: string }): boolean {
  const category = (exam.category ?? "").trim().toLowerCase();
  if (category === "arrt") return true;
  return /\barrt\b/i.test(exam.title);
}

export function filterMockExamsByTab(
  exams: MockExamSet[],
  tab: MockExamFilterKey,
): MockExamSet[] {
  if (tab === "arrt") {
    return exams.filter(isArrtMockExam);
  }
  return exams.filter(
    (e) => categoryMatchesSpecialty(e.category, tab) && !isArrtMockExam(e),
  );
}
