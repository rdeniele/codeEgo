import { describe, expect, it } from "vitest";
import { findProject, pythonProjects } from "@/data/projects";

describe("Python projects", () => {
  it("provides six complete beginner projects", () => {
    expect(pythonProjects).toHaveLength(6);
    for (const project of pythonProjects) {
      expect(project.requirements.length).toBeGreaterThanOrEqual(3);
      expect(project.milestones.length).toBeGreaterThanOrEqual(3);
      expect(project.hints).toHaveLength(3);
      expect(project.tests.length).toBeGreaterThanOrEqual(2);
      expect(project.rubric.reduce((total, item) => total + item.points, 0)).toBe(100);
      expect(project.solution.trim()).not.toBe("");
    }
  });

  it("finds projects by stable id", () => {
    expect(findProject("expense-tracker-project")?.title).toBe("Expense tracker");
  });
});
