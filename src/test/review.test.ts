import { describe, expect, it } from "vitest";
import { buildReviewQueue } from "@/lib/review";

describe("review scheduling", () => {
  it("prioritizes failed work and schedules successful recall", () => {
    const now = new Date("2026-10-25T12:00:00.000Z");
    const queue = buildReviewQueue([
      { lessonId: "failed", passed: false, usedHints: 0, revealedSolution: false, createdAt: "2026-10-25T10:00:00.000Z" },
      { lessonId: "hinted", passed: true, usedHints: 2, revealedSolution: false, createdAt: "2026-10-20T10:00:00.000Z" },
      { lessonId: "fresh", passed: true, usedHints: 0, revealedSolution: false, createdAt: "2026-10-24T10:00:00.000Z" },
    ], now);
    expect(queue.map((item) => item.lessonId)).toEqual(["failed", "hinted"]);
  });

  it("keeps only the latest attempt for each lesson", () => {
    const queue = buildReviewQueue([
      { lessonId: "loops", passed: false, usedHints: 0, revealedSolution: false, createdAt: "2026-10-20T10:00:00.000Z" },
      { lessonId: "loops", passed: true, usedHints: 0, revealedSolution: false, createdAt: "2026-10-25T10:00:00.000Z" },
    ], new Date("2026-10-25T12:00:00.000Z"));
    expect(queue).toEqual([]);
  });
});
