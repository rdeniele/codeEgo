import type { ExerciseTest } from "@/data/curriculum";

export type AcademyProject = {
  id: string;
  title: string;
  description: string;
  difficulty: "Guided" | "Independent";
  estimatedMinutes: number;
  skills: string[];
  requirements: string[];
  milestones: string[];
  starterCode: string;
  solution: string;
  hints: [string, string, string];
  tests: ExerciseTest[];
};

export const pythonProjects: AcademyProject[] = [
  {
    id: "calculator-project",
    title: "Pocket calculator",
    description: "Build a reusable calculator function that handles four operations and rejects unsupported choices.",
    difficulty: "Guided",
    estimatedMinutes: 35,
    skills: ["Functions", "Conditionals", "Operators"],
    requirements: ["Create calculate(a, b, operation)", "Support +, -, *, and /", "Raise ValueError for an unknown operation"],
    milestones: ["Implement addition and subtraction", "Add multiplication and division", "Handle invalid operations"],
    starterCode: 'def calculate(a, b, operation):\n    # Return the result for +, -, *, or /\n    pass\n\nprint(calculate(8, 2, "+"))\n',
    solution: 'def calculate(a, b, operation):\n    if operation == "+":\n        return a + b\n    if operation == "-":\n        return a - b\n    if operation == "*":\n        return a * b\n    if operation == "/":\n        return a / b\n    raise ValueError("Unsupported operation")\n\nprint(calculate(8, 2, "+"))',
    hints: ["Branch on the operation string.", "Return from each matching branch, then handle the unmatched case.", "Use four if statements and finish with raise ValueError(...)."],
    tests: [
      { name: "supports all four operations", code: 'assert [calculate(8, 2, op) for op in ["+", "-", "*", "/"]] == [10, 6, 16, 4]' },
      { name: "rejects an unsupported operation", code: 'try:\n    calculate(2, 2, "%")\n    assert False, "Expected ValueError"\nexcept ValueError:\n    pass', hidden: true },
    ],
  },
  {
    id: "guessing-game-project",
    title: "Number guessing game",
    description: "Write the decision engine for a guessing game with clear high, low, and correct feedback.",
    difficulty: "Guided",
    estimatedMinutes: 40,
    skills: ["Functions", "Conditionals", "Testing"],
    requirements: ["Create check_guess(guess, secret)", "Return Too low or Too high", "Return Correct for an exact match"],
    milestones: ["Handle a low guess", "Handle a high guess", "Confirm the winning guess"],
    starterCode: 'def check_guess(guess, secret):\n    pass\n\nprint(check_guess(5, 7))\n',
    solution: 'def check_guess(guess, secret):\n    if guess < secret:\n        return "Too low"\n    if guess > secret:\n        return "Too high"\n    return "Correct"\n\nprint(check_guess(5, 7))',
    hints: ["Compare guess with secret.", "Check the lower and higher cases before the remaining equal case.", "Return Too low, Too high, or Correct from three branches."],
    tests: [
      { name: "reports every outcome", code: 'assert check_guess(3, 7) == "Too low" and check_guess(9, 7) == "Too high" and check_guess(7, 7) == "Correct"' },
      { name: "works with negative numbers", code: 'assert check_guess(-3, -2) == "Too low"', hidden: true },
    ],
  },
  {
    id: "adventure-project",
    title: "Text adventure",
    description: "Create a small branching story function whose ending depends on the player's choice.",
    difficulty: "Guided",
    estimatedMinutes: 50,
    skills: ["Strings", "Branching", "Functions"],
    requirements: ["Create choose_path(choice)", "Accept forest and cave regardless of case", "Return Unknown path for anything else"],
    milestones: ["Normalize the choice", "Write two story branches", "Add a fallback ending"],
    starterCode: 'def choose_path(choice):\n    # Return Forest ending, Cave ending, or Unknown path\n    pass\n\nprint(choose_path("forest"))\n',
    solution: 'def choose_path(choice):\n    path = choice.strip().lower()\n    if path == "forest":\n        return "Forest ending"\n    if path == "cave":\n        return "Cave ending"\n    return "Unknown path"\n\nprint(choose_path("forest"))',
    hints: ["Normalize the input before comparing it.", "Use strip().lower(), then branch on forest and cave.", "Return a fallback string after the two recognized branches."],
    tests: [
      { name: "returns both story endings", code: 'assert choose_path("forest") == "Forest ending" and choose_path("cave") == "Cave ending"' },
      { name: "normalizes and rejects choices", code: 'assert choose_path(" CAVE ") == "Cave ending" and choose_path("river") == "Unknown path"', hidden: true },
    ],
  },
  {
    id: "converter-project",
    title: "Unit converter",
    description: "Convert temperatures in both directions with a small, precise API.",
    difficulty: "Guided",
    estimatedMinutes: 40,
    skills: ["Arithmetic", "Functions", "Floating point"],
    requirements: ["Create convert_temperature(value, unit)", "Convert C to Fahrenheit and F to Celsius", "Raise ValueError for other units"],
    milestones: ["Implement Celsius conversion", "Implement Fahrenheit conversion", "Validate the unit"],
    starterCode: 'def convert_temperature(value, unit):\n    pass\n\nprint(convert_temperature(0, "C"))\n',
    solution: 'def convert_temperature(value, unit):\n    unit = unit.upper()\n    if unit == "C":\n        return value * 9 / 5 + 32\n    if unit == "F":\n        return (value - 32) * 5 / 9\n    raise ValueError("Unit must be C or F")\n\nprint(convert_temperature(0, "C"))',
    hints: ["Normalize the unit with upper().", "C to F is value × 9/5 + 32; reverse that formula for F.", "Use two branches and raise ValueError after them."],
    tests: [
      { name: "converts in both directions", code: 'assert convert_temperature(0, "C") == 32 and abs(convert_temperature(212, "F") - 100) < 1e-9' },
      { name: "accepts lowercase units", code: 'assert convert_temperature(100, "c") == 212', hidden: true },
    ],
  },
  {
    id: "quiz-project",
    title: "Quiz scorer",
    description: "Compare answer lists and calculate a score without relying on fixed question counts.",
    difficulty: "Independent",
    estimatedMinutes: 55,
    skills: ["Lists", "Loops", "Functions"],
    requirements: ["Create score_quiz(answers, key)", "Compare matching positions", "Return the number of correct answers"],
    milestones: ["Pair answers with the key", "Count matches", "Test different quiz lengths"],
    starterCode: 'def score_quiz(answers, key):\n    pass\n\nprint(score_quiz(["A", "C", "B"], ["A", "B", "B"]))\n',
    solution: 'def score_quiz(answers, key):\n    score = 0\n    for answer, expected in zip(answers, key):\n        if answer == expected:\n            score += 1\n    return score\n\nprint(score_quiz(["A", "C", "B"], ["A", "B", "B"]))',
    hints: ["Visit each answer together with its expected value.", "zip(answers, key) creates matching pairs.", "Start score at zero and add one when answer == expected."],
    tests: [
      { name: "scores the sample quiz", code: 'assert score_quiz(["A", "C", "B"], ["A", "B", "B"]) == 2' },
      { name: "handles other lengths", code: 'assert score_quiz([], []) == 0 and score_quiz([1, 2, 3, 4], [1, 0, 3, 0]) == 2', hidden: true },
    ],
  },
  {
    id: "expense-tracker-project",
    title: "Expense tracker",
    description: "Summarize transaction dictionaries into category totals for a practical spending report.",
    difficulty: "Independent",
    estimatedMinutes: 70,
    skills: ["Dictionaries", "Loops", "Data modeling"],
    requirements: ["Create totals_by_category(expenses)", "Sum amounts sharing a category", "Return a new dictionary"],
    milestones: ["Loop through expense records", "Initialize unseen categories", "Accumulate each amount"],
    starterCode: 'def totals_by_category(expenses):\n    pass\n\nexpenses = [\n    {"category": "food", "amount": 12},\n    {"category": "travel", "amount": 8},\n    {"category": "food", "amount": 5},\n]\nprint(totals_by_category(expenses))\n',
    solution: 'def totals_by_category(expenses):\n    totals = {}\n    for expense in expenses:\n        category = expense["category"]\n        totals[category] = totals.get(category, 0) + expense["amount"]\n    return totals\n\nexpenses = [\n    {"category": "food", "amount": 12},\n    {"category": "travel", "amount": 8},\n    {"category": "food", "amount": 5},\n]\nprint(totals_by_category(expenses))',
    hints: ["Create an empty totals dictionary before the loop.", "Use totals.get(category, 0) for a category that may not exist yet.", "Assign totals[category] to its previous total plus expense['amount']."],
    tests: [
      { name: "groups and totals expenses", code: 'assert totals_by_category(expenses) == {"food": 17, "travel": 8}' },
      { name: "handles empty and decimal data", code: 'assert totals_by_category([]) == {} and totals_by_category([{"category": "books", "amount": 4.5}, {"category": "books", "amount": 2.5}]) == {"books": 7.0}', hidden: true },
    ],
  },
];

export function findProject(id: string) {
  return pythonProjects.find((project) => project.id === id);
}
