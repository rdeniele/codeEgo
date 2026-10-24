export type Attempt = {
  lessonId: string;
  passed: boolean;
  usedHints: number;
  revealedSolution: boolean;
  createdAt: string;
};

export type Progress = {
  completedLessonIds: string[];
  completedProjectIds: string[];
  completedAssessmentIds: string[];
  assessmentAttempts: Array<{ assessmentId: string; score: number; total: number; createdAt: string }>;
  projectRetrospectives: Record<string, string>;
  attempts: Attempt[];
  notes: Record<string, string>;
  bookmarks: string[];
  activeLessonId: string;
};

export const emptyProgress: Progress = {
  completedLessonIds: [],
  completedProjectIds: [],
  completedAssessmentIds: [],
  assessmentAttempts: [],
  projectRetrospectives: {},
  attempts: [],
  notes: {},
  bookmarks: [],
  activeLessonId: "hello-python",
};

export const STORAGE_KEY = "codeego-progress-v1";
export const LEGACY_STORAGE_KEY = "codequest-progress-v1";

export function normaliseProgress(value: unknown): Progress {
  if (!value || typeof value !== "object") return emptyProgress;
  const raw = value as Partial<Progress>;
  return {
    completedLessonIds: Array.isArray(raw.completedLessonIds)
      ? raw.completedLessonIds.filter((item): item is string => typeof item === "string")
      : [],
    completedProjectIds: Array.isArray(raw.completedProjectIds)
      ? raw.completedProjectIds.filter((item): item is string => typeof item === "string")
      : [],
    completedAssessmentIds: Array.isArray(raw.completedAssessmentIds)
      ? raw.completedAssessmentIds.filter((item): item is string => typeof item === "string")
      : [],
    assessmentAttempts: Array.isArray(raw.assessmentAttempts) ? raw.assessmentAttempts : [],
    projectRetrospectives: raw.projectRetrospectives && typeof raw.projectRetrospectives === "object"
      ? raw.projectRetrospectives
      : {},
    attempts: Array.isArray(raw.attempts) ? raw.attempts : [],
    notes: raw.notes && typeof raw.notes === "object" ? raw.notes : {},
    bookmarks: Array.isArray(raw.bookmarks)
      ? raw.bookmarks.filter((item): item is string => typeof item === "string")
      : [],
    activeLessonId: typeof raw.activeLessonId === "string" ? raw.activeLessonId : "hello-python",
  };
}

export function exportProgress(progress: Progress) {
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), progress }, null, 2);
}

export function importProgress(serialised: string): Progress {
  const parsed = JSON.parse(serialised) as { schemaVersion?: number; progress?: unknown };
  if (parsed.schemaVersion !== 1) throw new Error("Unsupported progress file version.");
  return normaliseProgress(parsed.progress);
}
