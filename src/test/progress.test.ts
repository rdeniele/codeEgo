import { describe, expect, it } from "vitest";
import { emptyProgress, exportProgress, importProgress, normaliseProgress } from "@/lib/progress";

describe("progress persistence", () => {
  it("falls back safely for malformed stored data", () => {
    expect(normaliseProgress(null)).toEqual(emptyProgress);
    expect(normaliseProgress({ completedLessonIds: ["ok", 3] }).completedLessonIds).toEqual(["ok"]);
  });

  it("round-trips an export", () => {
    const progress = { ...emptyProgress, completedLessonIds: ["hello-python"], completedProjectIds: ["calculator-project"], completedAssessmentIds: ["first-programs-check"] };
    expect(importProgress(exportProgress(progress)).completedLessonIds).toEqual(["hello-python"]);
    expect(importProgress(exportProgress(progress)).completedProjectIds).toEqual(["calculator-project"]);
    expect(importProgress(exportProgress(progress)).completedAssessmentIds).toEqual(["first-programs-check"]);
  });

  it("rejects unsupported files", () => {
    expect(() => importProgress('{"schemaVersion":2,"progress":{}}')).toThrow("Unsupported");
  });
});
