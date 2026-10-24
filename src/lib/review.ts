import type { Attempt } from "@/lib/progress";

export type ReviewItem = {
  lessonId: string;
  reason: string;
  dueAt: string;
  priority: number;
};

export function buildReviewQueue(attempts: Attempt[], now = new Date()): ReviewItem[] {
  const latest = new Map<string, Attempt>();
  for (const attempt of attempts) {
    const previous = latest.get(attempt.lessonId);
    if (!previous || new Date(attempt.createdAt) >= new Date(previous.createdAt)) latest.set(attempt.lessonId, attempt);
  }

  return [...latest.values()]
    .map((attempt) => {
      const createdAt = new Date(attempt.createdAt);
      const delayDays = !attempt.passed ? 0 : attempt.revealedSolution ? 1 : attempt.usedHints > 0 ? 3 : 7;
      const dueAt = new Date(createdAt.getTime() + delayDays * 86_400_000);
      return {
        lessonId: attempt.lessonId,
        reason: !attempt.passed
          ? "A previous submission failed"
          : attempt.revealedSolution
            ? "Solved after revealing the solution"
            : attempt.usedHints > 0
              ? `Solved with ${attempt.usedHints} hint${attempt.usedHints === 1 ? "" : "s"}`
              : "Independent recall check",
        dueAt: dueAt.toISOString(),
        priority: !attempt.passed ? 3 : attempt.revealedSolution ? 2 : attempt.usedHints > 0 ? 1 : 0,
      };
    })
    .filter((item) => new Date(item.dueAt) <= now)
    .sort((a, b) => b.priority - a.priority || a.dueAt.localeCompare(b.dueAt));
}
