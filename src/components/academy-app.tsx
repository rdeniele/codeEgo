"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookBookmark,
  BookOpenText,
  BookmarkSimple,
  BracketsCurly,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  Circle,
  Clock,
  Code,
  DownloadSimple,
  Flask,
  FolderOpen,
  Gauge,
  Lightbulb,
  ListChecks,
  Moon,
  NotePencil,
  Play,
  SidebarSimple,
  Sparkle,
  Sun,
  Target,
  UploadSimple,
  XCircle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { allLessons, findLesson, plannedCourses, pythonFundamentals } from "@/data/curriculum";
import { findProject, pythonProjects } from "@/data/projects";
import { chapterAssessments, findAssessment, initialAnswers, scoreAssessment, type AssessmentAnswers } from "@/data/assessments";
import {
  emptyProgress,
  exportProgress,
  importProgress,
  LEGACY_STORAGE_KEY,
  normaliseProgress,
  STORAGE_KEY,
  type Progress,
} from "@/lib/progress";
import type { ExecutionResult } from "@/lib/execution";
import { buildReviewQueue } from "@/lib/review";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">Preparing the editor...</div>,
});

type NavItem = "Dashboard" | "Learn" | "Practice" | "Projects" | "Career Paths" | "Progress";
type RunnerState = "idle" | "running" | "passed" | "failed";

const navItems: Array<{ label: NavItem; icon: typeof Gauge }> = [
  { label: "Dashboard", icon: Gauge },
  { label: "Learn", icon: BookOpenText },
  { label: "Practice", icon: ListChecks },
  { label: "Projects", icon: FolderOpen },
  { label: "Career Paths", icon: Target },
  { label: "Progress", icon: Sparkle },
];

function readProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? normaliseProgress(JSON.parse(raw)) : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

export function AcademyApp() {
  const lessons = useMemo(() => allLessons(), []);
  const [activeNav, setActiveNav] = useState<NavItem>("Learn");
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [lessonId, setLessonId] = useState("hello-python");
  const lesson = findLesson(lessonId) ?? lessons[0];
  const [code, setCode] = useState(lesson.starterCode);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [runnerState, setRunnerState] = useState<RunnerState>("idle");
  const [hintLevel, setHintLevel] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [mobileOutline, setMobileOutline] = useState(false);
  const [dark, setDark] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const project = projectId ? findProject(projectId) : undefined;
  const [projectCode, setProjectCode] = useState("");
  const [projectOutput, setProjectOutput] = useState<ExecutionResult | null>(null);
  const [projectRunnerState, setProjectRunnerState] = useState<RunnerState>("idle");
  const [projectHintLevel, setProjectHintLevel] = useState(0);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const assessment = assessmentId ? findAssessment(assessmentId) : undefined;
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswers>({});
  const [assessmentResult, setAssessmentResult] = useState<ReturnType<typeof scoreAssessment> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = readProgress();
    // Browser storage is the external source for this local-first app.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(saved);
    setLessonId(saved.activeLessonId);
    setHydrated(true);
    setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const switchLesson = useCallback(
    (nextId: string) => {
      const next = findLesson(nextId);
      if (!next) return;
      const index = lessons.findIndex((item) => item.id === nextId);
      const previousComplete = index === 0 || progress.completedLessonIds.includes(lessons[index - 1].id);
      if (!previousComplete) return;
      setLessonId(nextId);
      setCode(next.starterCode);
      setOutput(null);
      setRunnerState("idle");
      setHintLevel(0);
      setSolutionVisible(false);
      setProgress((current) => ({ ...current, activeLessonId: nextId }));
      setMobileOutline(false);
      setActiveNav("Learn");
    },
    [lessons, progress.completedLessonIds],
  );

  async function execute(validate: boolean) {
    setRunnerState("running");
    setOutput(null);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: code, lessonId, validate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The runner could not start.");
      setOutput(result);
      const passed = validate && result.tests.length > 0 && result.tests.every((test: { passed: boolean }) => test.passed);
      setRunnerState(validate ? (passed ? "passed" : "failed") : "idle");
      if (validate) {
        setProgress((current) => ({
          ...current,
          completedLessonIds: passed
            ? Array.from(new Set([...current.completedLessonIds, lessonId]))
            : current.completedLessonIds,
          attempts: [
            ...current.attempts,
            {
              lessonId,
              passed,
              usedHints: hintLevel,
              revealedSolution: solutionVisible,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      }
    } catch (error) {
      setRunnerState("failed");
      setOutput({
        stdout: "",
        stderr: error instanceof Error ? error.message : "The runner could not start.",
        durationMs: 0,
        timedOut: false,
        truncated: false,
        tests: [],
      });
    }
  }

  function nextLesson() {
    const index = lessons.findIndex((item) => item.id === lessonId);
    if (index >= 0 && index < lessons.length - 1) switchLesson(lessons[index + 1].id);
  }

  function openProject(id: string) {
    const next = findProject(id);
    if (!next) return;
    setProjectId(id);
    setProjectCode(next.starterCode);
    setProjectOutput(null);
    setProjectRunnerState("idle");
    setProjectHintLevel(0);
    setActiveNav("Projects");
  }

  async function executeProject(validate: boolean) {
    if (!project) return;
    setProjectRunnerState("running");
    setProjectOutput(null);
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: projectCode, lessonId: project.id, validate }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The runner could not start.");
      setProjectOutput(result);
      const passed = validate && result.tests.length > 0 && result.tests.every((test: { passed: boolean }) => test.passed);
      setProjectRunnerState(validate ? (passed ? "passed" : "failed") : "idle");
      if (validate) {
        setProgress((current) => ({
          ...current,
          completedProjectIds: passed
            ? Array.from(new Set([...current.completedProjectIds, project.id]))
            : current.completedProjectIds,
          attempts: [...current.attempts, {
            lessonId: project.id,
            passed,
            usedHints: projectHintLevel,
            revealedSolution: false,
            createdAt: new Date().toISOString(),
          }],
        }));
      }
    } catch (error) {
      setProjectRunnerState("failed");
      setProjectOutput({
        stdout: "",
        stderr: error instanceof Error ? error.message : "The runner could not start.",
        durationMs: 0,
        timedOut: false,
        truncated: false,
        tests: [],
      });
    }
  }

  function openAssessment(id: string) {
    const next = findAssessment(id);
    if (!next) return;
    setAssessmentId(id);
    setAssessmentAnswers(initialAnswers(next));
    setAssessmentResult(null);
    setActiveNav("Practice");
  }

  function submitAssessment() {
    if (!assessment) return;
    const result = scoreAssessment(assessment, assessmentAnswers);
    setAssessmentResult(result);
    setProgress((current) => ({
      ...current,
      completedAssessmentIds: result.passed
        ? Array.from(new Set([...current.completedAssessmentIds, assessment.id]))
        : current.completedAssessmentIds,
      assessmentAttempts: [...current.assessmentAttempts, {
        assessmentId: assessment.id,
        score: result.score,
        total: result.total,
        createdAt: new Date().toISOString(),
      }],
    }));
  }

  function downloadProgress() {
    const blob = new Blob([exportProgress(progress)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codeego-progress.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function uploadProgress(file: File | undefined) {
    if (!file) return;
    try {
      const next = importProgress(await file.text());
      setProgress(next);
      switchLesson(next.activeLessonId);
    } catch (error) {
      setOutput({
        stdout: "",
        stderr: error instanceof Error ? error.message : "That progress file could not be imported.",
        durationMs: 0,
        timedOut: false,
        truncated: false,
        tests: [],
      });
    }
  }

  if (!hydrated) return <div className="app-skeleton" aria-label="Loading CodeEgo Academy" />;

  return (
    <main className="app-shell">
      <aside className="rail" aria-label="Main navigation">
        <button className="brand-mark" aria-label="CodeEgo Academy" onClick={() => setActiveNav("Learn")}>
          <BracketsCurly size={25} weight="bold" />
        </button>
        <nav className="rail-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={activeNav === label ? "rail-link active" : "rail-link"}
              onClick={() => setActiveNav(label)}
              title={label}
            >
              <Icon size={21} weight={activeNav === label ? "fill" : "regular"} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-actions">
          <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label="Toggle color theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="avatar" aria-label="Local learner profile">CE</button>
        </div>
      </aside>

      {activeNav === "Learn" ? (
        <LessonWorkspace
          lesson={lesson}
          lessonId={lessonId}
          code={code}
          setCode={setCode}
          output={output}
          runnerState={runnerState}
          hintLevel={hintLevel}
          setHintLevel={setHintLevel}
          solutionVisible={solutionVisible}
          setSolutionVisible={setSolutionVisible}
          outlineOpen={outlineOpen}
          setOutlineOpen={setOutlineOpen}
          mobileOutline={mobileOutline}
          setMobileOutline={setMobileOutline}
          progress={progress}
          setProgress={setProgress}
          switchLesson={switchLesson}
          execute={execute}
          nextLesson={nextLesson}
          reset={() => {
            setCode(lesson.starterCode);
            setOutput(null);
            setRunnerState("idle");
          }}
        />
      ) : activeNav === "Practice" && assessment ? (
        <AssessmentWorkspace
          assessment={assessment}
          answers={assessmentAnswers}
          setAnswers={setAssessmentAnswers}
          result={assessmentResult}
          onBack={() => setAssessmentId(null)}
          onSubmit={submitAssessment}
          onRetry={() => {
            setAssessmentAnswers(initialAnswers(assessment));
            setAssessmentResult(null);
          }}
        />
      ) : activeNav === "Projects" && project ? (
        <ProjectWorkspace
          project={project}
          code={projectCode}
          setCode={setProjectCode}
          output={projectOutput}
          runnerState={projectRunnerState}
          hintLevel={projectHintLevel}
          setHintLevel={setProjectHintLevel}
          completed={progress.completedProjectIds.includes(project.id)}
          retrospective={progress.projectRetrospectives[project.id] ?? ""}
          setRetrospective={(value) => setProgress((current) => ({
            ...current,
            projectRetrospectives: { ...current.projectRetrospectives, [project.id]: value },
          }))}
          onBack={() => setProjectId(null)}
          execute={executeProject}
          reset={() => {
            setProjectCode(project.starterCode);
            setProjectOutput(null);
            setProjectRunnerState("idle");
          }}
        />
      ) : (
        <Overview
          activeNav={activeNav}
          progress={progress}
          onContinue={() => setActiveNav("Learn")}
          onExport={downloadProgress}
          onImport={() => fileInput.current?.click()}
          onOpenProject={openProject}
          onOpenAssessment={openAssessment}
          onReviewLesson={switchLesson}
        />
      )}

      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        hidden
        onChange={(event) => uploadProgress(event.target.files?.[0])}
      />
    </main>
  );
}

function AssessmentWorkspace({ assessment, answers, setAnswers, result, onBack, onSubmit, onRetry }: {
  assessment: NonNullable<ReturnType<typeof findAssessment>>;
  answers: AssessmentAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<AssessmentAnswers>>;
  result: ReturnType<typeof scoreAssessment> | null;
  onBack: () => void;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  function moveLine(questionId: string, index: number, direction: -1 | 1) {
    setAnswers((current) => {
      const order = [...(current[questionId] as string[])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= order.length) return current;
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { ...current, [questionId]: order };
    });
  }

  return (
    <section className="assessment-workspace">
      <header className="assessment-topbar">
        <button className="toolbar-button" onClick={onBack}><ArrowLeft size={17} />All practice</button>
        <div><strong>{assessment.title}</strong><span>{assessment.chapterLabel} · {assessment.estimatedMinutes} min</span></div>
        <span className="assessment-pass">Pass: {assessment.passScore}/{assessment.questions.length}</span>
      </header>
      <div className="assessment-content">
        <div className="assessment-intro"><span className="status-label">Chapter assessment</span><h1>{assessment.title}</h1><p>{assessment.description}</p></div>
        {assessment.questions.map((question, questionIndex) => {
          const questionResult = result?.results.find((item) => item.questionId === question.id);
          return <section className={questionResult ? `question-card ${questionResult.passed ? "correct" : "incorrect"}` : "question-card"} key={question.id}>
            <div className="question-number">{questionIndex + 1}</div>
            <div className="question-body"><span className="question-kind">{question.kind === "prediction" ? "Predict output" : question.kind === "ordering" ? "Arrange code" : "Knowledge check"}</span><h2>{question.prompt}</h2>
              {question.code && <pre className="inline-code"><code>{question.code}</code></pre>}
              {question.kind === "ordering" ? <div className="ordering-list">{(answers[question.id] as string[]).map((line, index) => <div key={`${line}-${index}`}><code>{line}</code><span><button onClick={() => moveLine(question.id, index, -1)} disabled={index === 0} aria-label="Move line up"><ArrowUp size={15} /></button><button onClick={() => moveLine(question.id, index, 1)} disabled={index === (answers[question.id] as string[]).length - 1} aria-label="Move line down"><ArrowDown size={15} /></button></span></div>)}</div>
                : <div className="answer-options">{question.options?.map((option) => <label key={option}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} /><span>{option}</span></label>)}</div>}
              {questionResult && <p className="answer-explanation"><strong>{questionResult.passed ? "Correct." : "Review this one."}</strong> {question.explanation}</p>}
            </div>
          </section>;
        })}
        <footer className="assessment-submit">
          {result ? <div className={result.passed ? "assessment-result passed" : "assessment-result failed"}><strong>{result.score}/{result.total}</strong><span>{result.passed ? "Assessment passed and saved" : "Review the explanations and try again"}</span></div> : <p>Your score and attempt will be saved locally.</p>}
          {result ? <button className="primary-action" onClick={onRetry}><ArrowCounterClockwise size={17} />Try again</button> : <button className="primary-action" onClick={onSubmit}><CheckCircle size={17} />Submit assessment</button>}
        </footer>
      </div>
    </section>
  );
}

function ProjectWorkspace({ project, code, setCode, output, runnerState, hintLevel, setHintLevel, completed, retrospective, setRetrospective, onBack, execute, reset }: {
  project: NonNullable<ReturnType<typeof findProject>>;
  code: string;
  setCode: (value: string) => void;
  output: ExecutionResult | null;
  runnerState: RunnerState;
  hintLevel: number;
  setHintLevel: (value: number) => void;
  completed: boolean;
  retrospective: string;
  setRetrospective: (value: string) => void;
  onBack: () => void;
  execute: (validate: boolean) => void;
  reset: () => void;
}) {
  return (
    <section className="project-lab">
      <header className="project-topbar">
        <button className="toolbar-button" onClick={onBack}><ArrowLeft size={17} />All projects</button>
        <div><strong>{project.title}</strong><span>{project.difficulty} · {project.estimatedMinutes} min</span></div>
        <div className={completed ? "completion-note complete" : "completion-note"}>
          {completed ? <CheckCircle size={19} weight="fill" /> : <Circle size={19} />}
          <span>{completed ? "Project complete" : "Pass all checks to complete"}</span>
        </div>
      </header>
      <article className="project-brief">
        <span className="status-label">Python Foundations project</span>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div className="project-skills">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        <section><h2>Requirements</h2><ul>{project.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h2>Milestones</h2><ol>{project.milestones.map((item) => <li key={item}>{item}</li>)}</ol></section>
        <section><h2>100-point rubric</h2><div className="rubric-list">{project.rubric.map((item) => <div key={item.criterion}><strong>{item.criterion}</strong><p>{item.evidence}</p><span>{item.points} pts</span></div>)}</div></section>
        <section><div className="section-title-row"><h2>Hints</h2><span>{hintLevel} of 3 used</span></div>
          {project.hints.slice(0, hintLevel).map((hint, index) => <div className="hint" key={hint}><span>{index + 1}</span><p>{hint}</p></div>)}
          {hintLevel < 3 && <button className="text-button" onClick={() => setHintLevel(hintLevel + 1)}><Lightbulb size={17} />Reveal hint {hintLevel + 1}</button>}
        </section>
        <section><h2>Project retrospective</h2><p className="muted">Record what worked, what was difficult, and what you would improve next.</p><textarea className="notes" value={retrospective} onChange={(event) => setRetrospective(event.target.value)} placeholder="I learned… Next time I would…" /></section>
      </article>
      <section className="coding-pane" aria-label="Project coding workspace">
        <div className="pane-toolbar"><div className="file-tab"><BracketsCurly size={17} /> project.py</div><div className="toolbar-actions">
          <button className="toolbar-button" onClick={reset}><ArrowCounterClockwise size={17} />Reset</button>
          <button className="toolbar-button run" onClick={() => execute(false)} disabled={runnerState === "running"}><Play size={17} weight="fill" />Run</button>
          <button className="toolbar-button submit" onClick={() => execute(true)} disabled={runnerState === "running"}><Flask size={17} weight="fill" />Check project</button>
        </div></div>
        <div className="editor-wrap"><Monaco height="100%" language="python" value={code} onChange={(value) => setCode(value ?? "")} theme={typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "vs-dark" : "light"} options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "var(--font-mono)", lineHeight: 22, padding: { top: 18 }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 4 }} /></div>
        <OutputPanel output={output} state={runnerState} />
        <footer className="lesson-actions"><div className={completed ? "completion-note complete" : "completion-note"}>{completed ? <CheckCircle size={19} weight="fill" /> : <Circle size={19} />}<span>{completed ? "Saved as completed" : "Your result is saved after submission"}</span></div></footer>
      </section>
    </section>
  );
}

type LessonWorkspaceProps = {
  lesson: NonNullable<ReturnType<typeof findLesson>>;
  lessonId: string;
  code: string;
  setCode: (value: string) => void;
  output: ExecutionResult | null;
  runnerState: RunnerState;
  hintLevel: number;
  setHintLevel: (value: number) => void;
  solutionVisible: boolean;
  setSolutionVisible: (value: boolean) => void;
  outlineOpen: boolean;
  setOutlineOpen: (value: boolean) => void;
  mobileOutline: boolean;
  setMobileOutline: (value: boolean) => void;
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  switchLesson: (id: string) => void;
  execute: (validate: boolean) => void;
  nextLesson: () => void;
  reset: () => void;
};

function LessonWorkspace(props: LessonWorkspaceProps) {
  const {
    lesson,
    lessonId,
    code,
    setCode,
    output,
    runnerState,
    hintLevel,
    setHintLevel,
    solutionVisible,
    setSolutionVisible,
    outlineOpen,
    setOutlineOpen,
    mobileOutline,
    setMobileOutline,
    progress,
    setProgress,
    switchLesson,
    execute,
    nextLesson,
    reset,
  } = props;
  const lessons = allLessons();
  const completed = progress.completedLessonIds.includes(lessonId);
  const currentIndex = lessons.findIndex((item) => item.id === lessonId);
  const progressPercent = Math.round((progress.completedLessonIds.length / lessons.length) * 100);
  const bookmarked = progress.bookmarks.includes(lessonId);

  return (
    <section className={outlineOpen ? "workspace" : "workspace outline-collapsed"}>
      <header className="topbar">
        <div className="topbar-title">
          <button className="icon-button mobile-only" onClick={() => setMobileOutline(!mobileOutline)} aria-label="Open course outline">
            <SidebarSimple size={19} />
          </button>
          <div>
            <p>Python Foundations</p>
            <span>{progress.completedLessonIds.length} of {lessons.length} lessons complete</span>
          </div>
        </div>
        <div className="course-progress" aria-label={`${progressPercent}% course progress`}>
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="topbar-meta">
          <Clock size={17} />
          <span>{lesson.estimatedMinutes} min</span>
        </div>
      </header>

      <CourseOutline
        open={outlineOpen}
        mobileOpen={mobileOutline}
        currentLessonId={lessonId}
        progress={progress}
        onToggle={() => setOutlineOpen(!outlineOpen)}
        onSelect={switchLesson}
      />

      <article className="lesson-copy">
        <div className="lesson-copy-inner">
          <div className="lesson-kicker">Lesson {currentIndex + 1}</div>
          <div className="lesson-heading-row">
            <h1>{lesson.title}</h1>
            <button
              className={bookmarked ? "icon-button selected" : "icon-button"}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark lesson"}
              onClick={() =>
                setProgress((current) => ({
                  ...current,
                  bookmarks: bookmarked
                    ? current.bookmarks.filter((id) => id !== lessonId)
                    : [...current.bookmarks, lessonId],
                }))
              }
            >
              <BookmarkSimple size={19} weight={bookmarked ? "fill" : "regular"} />
            </button>
          </div>
          <p className="objective"><Target size={19} weight="duotone" />{lesson.objective}</p>

          <section className="copy-section">
            <h2>How it works</h2>
            <p>{lesson.concept}</p>
            <div className="analogy"><Lightbulb size={20} weight="duotone" /><p>{lesson.analogy}</p></div>
          </section>

          <section className="copy-section">
            <h2>Example</h2>
            <pre className="inline-code"><code>{lesson.example}</code></pre>
          </section>

          <section className="copy-section task-block">
            <h2>Your task</h2>
            <p>{lesson.objective}</p>
            <div className="requirements">
              <Check size={17} weight="bold" />
              <span>Write the solution in the editor, run it, then submit it against the checks.</span>
            </div>
          </section>

          <section className="copy-section">
            <div className="section-title-row"><h2>Hints</h2><span>{hintLevel} of 3 used</span></div>
            {hintLevel > 0 ? (
              <div className="hint-list">
                {lesson.hints.slice(0, hintLevel).map((hint, index) => (
                  <div className="hint" key={hint}><span>{index + 1}</span><p>{hint}</p></div>
                ))}
              </div>
            ) : <p className="muted">Start with your own idea. Reveal a hint when you need a nudge.</p>}
            {hintLevel < 3 && <button className="text-button" onClick={() => setHintLevel(hintLevel + 1)}><Lightbulb size={17} />Reveal hint {hintLevel + 1}</button>}
          </section>

          <section className="copy-section">
            <button className="solution-toggle" onClick={() => setSolutionVisible(!solutionVisible)}>
              <span><Code size={18} />Reference solution</span>
              {solutionVisible ? <CaretDown size={17} /> : <CaretRight size={17} />}
            </button>
            {solutionVisible && <pre className="inline-code solution"><code>{lesson.solution}</code></pre>}
          </section>

          <label className="notes-label" htmlFor="lesson-notes"><NotePencil size={18} />Private notes</label>
          <textarea
            id="lesson-notes"
            className="notes"
            value={progress.notes[lessonId] ?? ""}
            placeholder="Write a useful reminder for future you."
            onChange={(event) => setProgress((current) => ({ ...current, notes: { ...current.notes, [lessonId]: event.target.value } }))}
          />
        </div>
      </article>

      <section className="coding-pane" aria-label="Coding workspace">
        <div className="pane-toolbar">
          <div className="file-tab"><BracketsCurly size={17} /> main.py</div>
          <div className="toolbar-actions">
            <button className="toolbar-button" onClick={reset}><ArrowCounterClockwise size={17} />Reset</button>
            <button className="toolbar-button run" onClick={() => execute(false)} disabled={runnerState === "running"}><Play size={17} weight="fill" />Run</button>
            <button className="toolbar-button submit" onClick={() => execute(true)} disabled={runnerState === "running"}><Flask size={17} weight="fill" />Submit</button>
          </div>
        </div>
        <div className="editor-wrap">
          <Monaco
            height="100%"
            language="python"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            theme={typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "var(--font-mono)",
              lineHeight: 22,
              padding: { top: 18 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
            }}
          />
        </div>
        <OutputPanel output={output} state={runnerState} />
        <footer className="lesson-actions">
          <div className={completed ? "completion-note complete" : "completion-note"}>
            {completed ? <CheckCircle size={19} weight="fill" /> : <Circle size={19} />}
            <span>{completed ? "Lesson complete" : "Pass the checks to unlock the next lesson"}</span>
          </div>
          <button className="next-button" disabled={!completed || currentIndex === lessons.length - 1} onClick={nextLesson}>
            Next lesson <ArrowRight size={18} weight="bold" />
          </button>
        </footer>
      </section>
    </section>
  );
}

function OutputPanel({ output, state }: { output: ExecutionResult | null; state: RunnerState }) {
  return (
    <section className="output-panel" aria-live="polite">
      <div className="output-header">
        <span>Output and checks</span>
        {state === "running" && <span className="running-label">Running safely...</span>}
        {output && <span>{output.durationMs} ms</span>}
      </div>
      <div className="output-body">
        {!output && state !== "running" && <p className="output-empty">Run your code to see output here.</p>}
        {state === "running" && <div className="runner-skeleton"><span /><span /><span /></div>}
        {output?.stdout && <pre className="stdout">{output.stdout}</pre>}
        {output?.stderr && <pre className="stderr">{output.stderr}</pre>}
        {output?.truncated && <p className="notice">Output was shortened to keep the runner responsive.</p>}
        {output?.tests.length ? (
          <div className="test-results">
            {output.tests.map((test) => (
              <div className={test.passed ? "test passed" : "test failed"} key={test.name}>
                {test.passed ? <CheckCircle size={18} weight="fill" /> : <XCircle size={18} weight="fill" />}
                <div><strong>{test.name}</strong>{test.message && <p>{test.message}</p>}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CourseOutline({ open, mobileOpen, currentLessonId, progress, onToggle, onSelect }: {
  open: boolean;
  mobileOpen: boolean;
  currentLessonId: string;
  progress: Progress;
  onToggle: () => void;
  onSelect: (id: string) => void;
}) {
  const lessons = allLessons();
  return (
    <aside className={`${open ? "course-outline" : "course-outline collapsed"} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="outline-heading">
        <div><span>Course outline</span><small>{pythonFundamentals.difficulty}</small></div>
        <button className="icon-button desktop-only" onClick={onToggle} aria-label="Toggle course outline"><SidebarSimple size={18} /></button>
      </div>
      {open && (
        <div className="outline-content">
          {pythonFundamentals.chapters.map((chapter) => (
            <section className="chapter" key={chapter.id}>
              <h2>{chapter.title}</h2>
              {chapter.lessons.map((lesson) => {
                const index = lessons.findIndex((item) => item.id === lesson.id);
                const complete = progress.completedLessonIds.includes(lesson.id);
                const unlocked = index === 0 || progress.completedLessonIds.includes(lessons[index - 1].id);
                return (
                  <button
                    key={lesson.id}
                    className={currentLessonId === lesson.id ? "lesson-link active" : "lesson-link"}
                    onClick={() => onSelect(lesson.id)}
                    disabled={!unlocked}
                  >
                    <span className="lesson-state">{complete ? <CheckCircle size={18} weight="fill" /> : <span>{index + 1}</span>}</span>
                    <span><strong>{lesson.title}</strong><small>{lesson.estimatedMinutes} min</small></span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </aside>
  );
}

function Overview({ activeNav, progress, onContinue, onExport, onImport, onOpenProject, onOpenAssessment, onReviewLesson }: {
  activeNav: NavItem;
  progress: Progress;
  onContinue: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenProject: (id: string) => void;
  onOpenAssessment: (id: string) => void;
  onReviewLesson: (id: string) => void;
}) {
  const lessons = allLessons();
  const percent = Math.round((progress.completedLessonIds.length / lessons.length) * 100);
  const reviewQueue = buildReviewQueue(progress.attempts).filter((item) => Boolean(findLesson(item.lessonId)));
  return (
    <section className="overview">
      <header className="overview-header">
        <div><p>CodeEgo Academy</p><h1>{activeNav}</h1></div>
        <div className="overview-actions"><button onClick={onImport}><UploadSimple size={17} />Import</button><button onClick={onExport}><DownloadSimple size={17} />Export</button></div>
      </header>
      {activeNav === "Dashboard" || activeNav === "Progress" ? (
        <div className="dashboard-grid">
          <section className="continue-panel">
            <div className="overview-visual" aria-hidden="true">
              <Image src="/images/codeego-hero.png" alt="" fill priority sizes="(max-width: 920px) 100vw, 55vw" />
            </div>
            <div className="overview-copy">
              <span className="status-label">Continue learning</span>
              <h2>{findLesson(progress.activeLessonId)?.title ?? lessons[0].title}</h2>
              <p>Pick up exactly where you stopped. Your code attempts, notes, and completed lessons stay on this computer.</p>
              <button className="primary-action" onClick={onContinue}>Open lesson <ArrowRight size={18} /></button>
            </div>
          </section>
          <section className="metric-panel"><span>Course completion</span><strong>{percent}%</strong><p>{progress.completedLessonIds.length} of {lessons.length} lessons</p></section>
          <section className="metric-panel"><span>Attempts saved</span><strong>{progress.attempts.length}</strong><p>Based on your real submissions</p></section>
          <section className="metric-panel"><span>Assessments passed</span><strong>{progress.completedAssessmentIds.length}</strong><p>{progress.assessmentAttempts.length} scored attempts</p></section>
          <section className="review-panel">
            <h2>Review queue</h2>
            {reviewQueue.length ? <div className="review-items">{reviewQueue.slice(0, 3).map((item) => <button key={item.lessonId} onClick={() => onReviewLesson(item.lessonId)}><span><strong>{findLesson(item.lessonId)?.title}</strong><small>{item.reason}</small></span><ArrowRight size={16} /></button>)}</div> : <p>Your review queue is clear. Attempts return when they are due for recall.</p>}
          </section>
        </div>
      ) : activeNav === "Practice" ? (
        <div className="practice-catalog">
          <div className="project-intro"><span className="status-label">Check real understanding</span><h2>Practice, get feedback, retry.</h2><p>Chapter assessments mix knowledge checks, output prediction, and hands-on code ordering. Every result is based on your answers and saved locally.</p></div>
          <div className="assessment-grid">{chapterAssessments.map((assessment, index) => {
            const complete = progress.completedAssessmentIds.includes(assessment.id);
            const latest = [...progress.assessmentAttempts].reverse().find((attempt) => attempt.assessmentId === assessment.id);
            return <article className="assessment-card" key={assessment.id}>
              <div className="assessment-card-top"><span>CHECK {index + 1}</span>{complete ? <CheckCircle size={21} weight="fill" /> : <ListChecks size={21} />}</div>
              <small>{assessment.chapterLabel}</small><h2>{assessment.title}</h2><p>{assessment.description}</p>
              <div className="assessment-meta"><span>{assessment.questions.length} questions</span><span>{assessment.estimatedMinutes} min</span>{latest && <span>Last: {latest.score}/{latest.total}</span>}</div>
              <button className="primary-action" onClick={() => onOpenAssessment(assessment.id)}>{complete ? "Practice again" : "Start assessment"}<ArrowRight size={16} /></button>
            </article>;
          })}</div>
          <section className="mixed-review"><div><span className="status-label">Adaptive review</span><h2>{reviewQueue.length ? `${reviewQueue.length} lesson${reviewQueue.length === 1 ? "" : "s"} due now` : "Your queue is clear"}</h2><p>{reviewQueue.length ? "Failed work returns immediately; hinted and independent solutions return later for recall." : "Complete lessons and projects to build a schedule from your real attempts."}</p>{reviewQueue[0] && <button className="text-button" onClick={() => onReviewLesson(reviewQueue[0].lessonId)}>Review {findLesson(reviewQueue[0].lessonId)?.title}<ArrowRight size={16} /></button>}</div><div><strong>{progress.assessmentAttempts.length}</strong><span>assessment attempts</span></div></section>
        </div>
      ) : activeNav === "Projects" ? (
        <div className="project-catalog">
          <div className="project-intro"><span className="status-label">Build portfolio evidence</span><h2>Six projects. Real checks.</h2><p>Each lab turns the lessons into a working program and saves completion locally.</p></div>
          <div className="project-grid">{pythonProjects.map((project, index) => {
            const complete = progress.completedProjectIds.includes(project.id);
            return <article className="project-card" key={project.id}>
              <div className="project-card-top"><span>0{index + 1}</span>{complete && <CheckCircle size={21} weight="fill" />}</div>
              <h2>{project.title}</h2><p>{project.description}</p>
              <div className="project-skills">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              <div className="project-card-footer"><small>{project.estimatedMinutes} min · {project.difficulty}</small><button onClick={() => onOpenProject(project.id)}>Open project <ArrowRight size={16} /></button></div>
            </article>;
          })}</div>
        </div>
      ) : (
        <div className="catalog">
          <section className="catalog-feature">
            <div className="overview-visual" aria-hidden="true">
              <Image src="/images/codeego-hero.png" alt="" fill sizes="(max-width: 920px) 100vw, 70vw" />
            </div>
            <div className="overview-copy"><span className="status-label">Fully authored</span><h2>Python Foundations</h2><p>Nineteen working lessons from first output through functions, collections, exceptions, and debugging—with real Python checks throughout.</p></div>
            <button className="primary-action feature-action" onClick={onContinue}>Start learning <ArrowRight size={18} /></button>
          </section>
          <section className="roadmap">
            <h2>{activeNav === "Career Paths" ? "Career paths in the roadmap" : "Structured expansion roadmap"}</h2>
            <div className="roadmap-grid">
              {plannedCourses.map((course) => <div key={course}><BookBookmark size={20} /><span>{course}</span><small>Planned</small></div>)}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
