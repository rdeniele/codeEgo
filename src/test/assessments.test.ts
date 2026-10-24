import { describe, expect, it } from "vitest";
import { chapterAssessments, initialAnswers, scoreAssessment } from "@/data/assessments";

describe("chapter assessments", () => {
  it("provides four complete chapter checks", () => {
    expect(chapterAssessments).toHaveLength(4);
    for (const assessment of chapterAssessments) {
      expect(assessment.questions).toHaveLength(4);
      expect(assessment.questions.some((question) => question.kind === "ordering")).toBe(true);
      expect(assessment.questions.some((question) => question.kind === "prediction")).toBe(true);
    }
  });

  it("scores correct and incomplete answers from real responses", () => {
    const assessment = chapterAssessments[0];
    const answers = initialAnswers(assessment);
    for (const question of assessment.questions) {
      answers[question.id] = question.kind === "ordering" ? [...(question.correctOrder ?? [])] : question.correctAnswer ?? "";
    }
    expect(scoreAssessment(assessment, answers)).toMatchObject({ score: 4, total: 4, passed: true });
    expect(scoreAssessment(assessment, initialAnswers(assessment)).passed).toBe(false);
  });
});
