export type AssessmentQuestion = {
  id: string;
  kind: "choice" | "prediction" | "ordering";
  prompt: string;
  code?: string;
  options?: string[];
  correctAnswer?: string;
  lines?: string[];
  correctOrder?: string[];
  explanation: string;
};

export type ChapterAssessment = {
  id: string;
  title: string;
  description: string;
  chapterLabel: string;
  estimatedMinutes: number;
  passScore: number;
  questions: AssessmentQuestion[];
};

export const chapterAssessments: ChapterAssessment[] = [
  {
    id: "first-programs-check",
    title: "First programs check",
    description: "Confirm your understanding of values, output, types, and expressions.",
    chapterLabel: "Lessons 1–5",
    estimatedMinutes: 8,
    passScore: 3,
    questions: [
      { id: "fp-type", kind: "choice", prompt: "Which value is a boolean?", options: ["\"True\"", "True", "1.0", "true"], correctAnswer: "True", explanation: "True without quotation marks is Python's boolean literal." },
      { id: "fp-output", kind: "prediction", prompt: "What does this program print?", code: 'price = 6\nquantity = 4\nprint(price * quantity - 2)', options: ["18", "22", "24", "26"], correctAnswer: "22", explanation: "Multiplication happens first: 6 × 4 is 24, then 2 is subtracted." },
      { id: "fp-order", kind: "ordering", prompt: "Arrange the statements to clean and print the name.", lines: ['print(name)', 'raw = "  ada "', 'name = raw.strip().title()'], correctOrder: ['raw = "  ada "', 'name = raw.strip().title()', 'print(name)'], explanation: "Create the raw value first, derive the cleaned value, then print it." },
      { id: "fp-operator", kind: "choice", prompt: "Which operator performs exponentiation?", options: ["^", "**", "//", "%"], correctAnswer: "**", explanation: "Python uses ** for exponentiation." },
    ],
  },
  {
    id: "decisions-loops-check",
    title: "Decisions and loops check",
    description: "Test conditions, boolean logic, ranges, and loop control.",
    chapterLabel: "Lessons 6–9",
    estimatedMinutes: 9,
    passScore: 3,
    questions: [
      { id: "dl-boolean", kind: "choice", prompt: "When is A and B true?", options: ["When either value is true", "Only when both are true", "Only when both are false", "Whenever A is true"], correctAnswer: "Only when both are true", explanation: "and requires every combined condition to be true." },
      { id: "dl-output", kind: "prediction", prompt: "What is printed?", code: 'total = 0\nfor n in range(1, 4):\n    total += n\nprint(total)', options: ["3", "6", "7", "10"], correctAnswer: "6", explanation: "range(1, 4) produces 1, 2, and 3; their sum is 6." },
      { id: "dl-order", kind: "ordering", prompt: "Arrange a countdown loop.", lines: ['    count -= 1', 'count = 3', 'while count > 0:', '    print(count)'], correctOrder: ['count = 3', 'while count > 0:', '    print(count)', '    count -= 1'], explanation: "Initialize before the loop, then print and decrease inside the indented body." },
      { id: "dl-range", kind: "choice", prompt: "Which range produces 2, 3, and 4?", options: ["range(2, 4)", "range(2, 5)", "range(1, 4)", "range(3, 5)"], correctAnswer: "range(2, 5)", explanation: "The stop value is excluded, so the range must stop at 5." },
    ],
  },
  {
    id: "functions-collections-check",
    title: "Functions and collections check",
    description: "Review reusable functions, scope, lists, dictionaries, tuples, and sets.",
    chapterLabel: "Lessons 10–15",
    estimatedMinutes: 10,
    passScore: 3,
    questions: [
      { id: "fc-return", kind: "choice", prompt: "What does return do?", options: ["Prints a value", "Stops Python", "Sends a result to the caller", "Creates a global variable"], correctAnswer: "Sends a result to the caller", explanation: "return ends that function call and passes a result back to its caller." },
      { id: "fc-output", kind: "prediction", prompt: "What is printed?", code: 'scores = [4, 6]\nscores.append(8)\nprint(sum(scores))', options: ["10", "14", "18", "468"], correctAnswer: "18", explanation: "append adds 8, and 4 + 6 + 8 equals 18." },
      { id: "fc-order", kind: "ordering", prompt: "Arrange a function definition and call.", lines: ['    return name.strip().title()', 'print(clean_name(" ada "))', 'def clean_name(name):'], correctOrder: ['def clean_name(name):', '    return name.strip().title()', 'print(clean_name(" ada "))'], explanation: "Define the function before calling it, with the return statement indented." },
      { id: "fc-dict", kind: "choice", prompt: "Which expression safely returns zero for a missing key?", options: ['totals["food"]', 'totals.get("food", 0)', 'totals.find("food")', 'totals.food'], correctAnswer: 'totals.get("food", 0)', explanation: "dict.get accepts a fallback value for a missing key." },
    ],
  },
  {
    id: "reliability-check",
    title: "Reliable code check",
    description: "Check string transformations, exception handling, debugging, and clear code.",
    chapterLabel: "Lessons 16–19",
    estimatedMinutes: 9,
    passScore: 3,
    questions: [
      { id: "rc-exception", kind: "choice", prompt: "Which exception should division by zero catch?", options: ["ValueError", "TypeError", "ZeroDivisionError", "MathError"], correctAnswer: "ZeroDivisionError", explanation: "Python raises ZeroDivisionError when a numeric value is divided by zero." },
      { id: "rc-output", kind: "prediction", prompt: "What is printed?", code: 'title = "  Hello World  "\nprint(title.strip().lower().replace(" ", "-"))', options: ["Hello World", "hello-world", "hello world", "-hello-world-"], correctAnswer: "hello-world", explanation: "The chain trims outer spaces, lowercases the text, then replaces the remaining space." },
      { id: "rc-order", kind: "ordering", prompt: "Arrange a specific error handler.", lines: ['except ValueError:', 'try:', '    number = 0', '    number = int(text)'], correctOrder: ['try:', '    number = int(text)', 'except ValueError:', '    number = 0'], explanation: "The risky statement belongs in try; the matching recovery belongs under except." },
      { id: "rc-clean", kind: "choice", prompt: "Which function name communicates intent most clearly?", options: ["do_it", "x", "format_customer_name", "stuff"], correctAnswer: "format_customer_name", explanation: "Specific names reveal purpose without requiring the reader to inspect the function body." },
    ],
  },
];

export type AssessmentAnswers = Record<string, string | string[]>;

export function initialAnswers(assessment: ChapterAssessment): AssessmentAnswers {
  return Object.fromEntries(assessment.questions.map((question) => [question.id, question.kind === "ordering" ? [...(question.lines ?? [])] : ""]));
}

export function scoreAssessment(assessment: ChapterAssessment, answers: AssessmentAnswers) {
  const results = assessment.questions.map((question) => {
    const answer = answers[question.id];
    const passed = question.kind === "ordering"
      ? JSON.stringify(answer) === JSON.stringify(question.correctOrder)
      : answer === question.correctAnswer;
    return { questionId: question.id, passed };
  });
  const score = results.filter((result) => result.passed).length;
  return { score, total: assessment.questions.length, passed: score >= assessment.passScore, results };
}

export function findAssessment(id: string) {
  return chapterAssessments.find((assessment) => assessment.id === id);
}
