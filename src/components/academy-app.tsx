"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
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

function ProjectWorkspace({ project, code, setCode, output, runnerState, hintLevel, setHintLevel, completed, onBack, execute, reset }: {
  project: NonNullable<ReturnType<typeof findProject>>;
  code: string;
  setCode: (value: string) => void;
  output: ExecutionResult | null;
  runnerState: RunnerState;
  hintLevel: number;
  setHintLevel: (value: number) => void;
  completed: boolean;
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
        <section><div className="section-title-row"><h2>Hints</h2><span>{hintLevel} of 3 used</span></div>
          {project.hints.slice(0, hintLevel).map((hint, index) => <div className="hint" key={hint}><span>{index + 1}</span><p>{hint}</p></div>)}
          {hintLevel < 3 && <button className="text-button" onClick={() => setHintLevel(hintLevel + 1)}><Lightbulb size={17} />Reveal hint {hintLevel + 1}</button>}
        </section>
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

function Overview({ activeNav, progress, onContinue, onExport, onImport, onOpenProject }: {
  activeNav: NavItem;
  progress: Progress;
  onContinue: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenProject: (id: string) => void;
}) {
  const lessons = allLessons();
  const percent = Math.round((progress.completedLessonIds.length / lessons.length) * 100);
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
          <section className="metric-panel"><span>Bookmarks</span><strong>{progress.bookmarks.length}</strong><p>Lessons saved for review</p></section>
          <section className="review-panel">
            <h2>Review queue</h2>
            {progress.attempts.some((attempt) => !attempt.passed) ? <p>Revisit lessons with a failed attempt and try again without revealing the solution.</p> : <p>Your review queue is clear. Failed attempts will appear here automatically.</p>}
          </section>
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
