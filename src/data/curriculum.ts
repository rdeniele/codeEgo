export type ExerciseTest = {
  name: string;
  code: string;
  hidden?: boolean;
};

export type Lesson = {
  id: string;
  title: string;
  objective: string;
  concept: string;
  analogy: string;
  example: string;
  starterCode: string;
  solution: string;
  hints: [string, string, string];
  tests: ExerciseTest[];
  estimatedMinutes: number;
};

export type Chapter = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  chapters: Chapter[];
};

export const pythonFundamentals: Course = {
  id: "python-fundamentals",
  title: "Python Foundations",
  description: "Build a dependable foundation by writing and testing small Python programs.",
  difficulty: "Beginner",
  skills: ["Python", "Debugging", "Problem solving"],
  chapters: [
    {
      id: "first-programs",
      title: "First programs",
      lessons: [
        {
          id: "hello-python",
          title: "Print your first message",
          objective: "Use print() to send text to the output panel.",
          concept:
            "A program is a sequence of instructions. Python reads this line and asks the print function to display the value inside its parentheses.",
          analogy:
            "Think of print() as a small label maker. You give it a message, and it places that message in the output tray.",
          example: 'print("Learning by doing")',
          starterCode: '# Print the exact message below\n# Hello, CodeEgo!\n\n',
          solution: 'print("Hello, CodeEgo!")',
          hints: [
            "Use Python's print function.",
            "Place the message inside parentheses and quotation marks.",
            'Write: print("Hello, CodeEgo!")',
          ],
          tests: [
            {
              name: "prints the required greeting",
              code: 'assert __user_output__.strip() == "Hello, CodeEgo!", "Print the exact greeting, including punctuation."',
            },
            {
              name: "prints only one line",
              code: 'assert len(__user_output__.strip().splitlines()) == 1, "Your program should print one line."',
              hidden: true,
            },
          ],
          estimatedMinutes: 4,
        },
        {
          id: "variables",
          title: "Store a value",
          objective: "Create a variable and use it in a sentence.",
          concept:
            "A variable gives a value a reusable name. Assign with =, then refer to the name wherever the value is needed.",
          analogy:
            "A variable is a labelled drawer. The label stays in your code while the value inside can change.",
          example: 'language = "Python"\nprint(language)',
          starterCode: '# Store "Ada" in a variable named learner\n# Then print: Welcome, Ada!\n\nlearner = ""\n',
          solution: 'learner = "Ada"\nprint(f"Welcome, {learner}!")',
          hints: [
            "Assign the name Ada to the learner variable.",
            "An f-string can insert a variable inside braces.",
            'Use learner = "Ada" and print(f"Welcome, {learner}!")',
          ],
          tests: [
            {
              name: "stores the learner name",
              code: 'assert learner == "Ada", "Set learner to the string Ada."',
            },
            {
              name: "prints the welcome message",
              code: 'assert __user_output__.strip() == "Welcome, Ada!", "Check the exact output and punctuation."',
              hidden: true,
            },
          ],
          estimatedMinutes: 6,
        },
        {
          id: "data-types",
          title: "Recognize data types",
          objective: "Create number, text, and boolean values and inspect their types.",
          concept:
            "A data type describes what a value represents and which operations make sense. Python's core beginner types include integers, floating-point numbers, strings, and booleans.",
          analogy:
            "Types are like labels on storage boxes: a box marked 'books' is handled differently from one marked 'glassware'.",
          example: 'age = 24\nprice = 9.5\nmember = True\nprint(type(age).__name__)',
          starterCode: '# Create the requested values\nitems = 0\nprice = 0\nis_available = False\n\n# Print their type names, separated by commas\n',
          solution: 'items = 3\nprice = 4.5\nis_available = True\n\nprint(type(items).__name__, type(price).__name__, type(is_available).__name__, sep=",")',
          hints: [
            "Use an integer, a decimal number, and one of Python's boolean literals.",
            "The values should be 3, 4.5, and True. type(value).__name__ gives a readable type name.",
            'Set the values, then print type(items).__name__, type(price).__name__, and type(is_available).__name__ with sep=",".',
          ],
          tests: [
            { name: "creates the requested values", code: 'assert items == 3 and price == 4.5 and is_available is True, "Use the exact requested values."' },
            { name: "prints the three type names", code: 'assert __user_output__.strip() == "int,float,bool", "Print int,float,bool with commas and no spaces."', hidden: true },
          ],
          estimatedMinutes: 8,
        },
        {
          id: "operators",
          title: "Calculate with operators",
          objective: "Combine arithmetic operators to calculate a final total.",
          concept:
            "Operators combine values. Python follows an order of operations, while parentheses make your intended order explicit.",
          analogy:
            "An expression is a tiny recipe: values are the ingredients and operators describe what to do with them.",
          example: 'subtotal = 12 * 3\ntotal = subtotal + 5\nprint(total)',
          starterCode: 'price = 12\nquantity = 3\ndiscount = 5\n\n# Calculate price times quantity, then subtract discount\ntotal = 0\nprint(total)\n',
          solution: 'price = 12\nquantity = 3\ndiscount = 5\n\ntotal = price * quantity - discount\nprint(total)',
          hints: [
            "Multiply the price by the quantity before applying the discount.",
            "Use * for multiplication and - for subtraction.",
            "Set total to price * quantity - discount.",
          ],
          tests: [
            { name: "calculates the discounted total", code: 'assert total == 31, "The final total should be 31."' },
            { name: "prints the result", code: 'assert __user_output__.strip() == "31", "Print only the final total."', hidden: true },
          ],
          estimatedMinutes: 7,
        },
        {
          id: "clean-input",
          title: "Clean user input",
          objective: "Normalize a piece of text before displaying it.",
          concept:
            "Programs often receive messy text from forms or input prompts. String methods can remove surrounding spaces and standardize capitalization before the value is used.",
          analogy:
            "Cleaning input is like wiping a label before filing it so every copy is easy to compare.",
          example: 'raw = "  ada  "\nname = raw.strip().title()\nprint(name)',
          starterCode: 'raw_name = "  maya  "\n\n# Remove extra spaces, capitalize the name, and print: Hello, Maya!\nname = raw_name\n',
          solution: 'raw_name = "  maya  "\nname = raw_name.strip().title()\nprint(f"Hello, {name}!")',
          hints: [
            "First remove the spaces around raw_name.",
            "Chain .strip() and .title(), then use the cleaned value in an f-string.",
            'Use name = raw_name.strip().title() and print(f"Hello, {name}!").',
          ],
          tests: [
            { name: "normalizes the name", code: 'assert name == "Maya", "name should contain Maya without extra spaces."' },
            { name: "prints the greeting", code: 'assert __user_output__.strip() == "Hello, Maya!", "Print the exact greeting."', hidden: true },
          ],
          estimatedMinutes: 7,
        },
      ],
    },
    {
      id: "decisions",
      title: "Make decisions",
      lessons: [
        {
          id: "conditionals",
          title: "Choose with if",
          objective: "Use a condition to choose which message to print.",
          concept:
            "An if statement runs an indented block only when its condition is true. An else block handles the remaining case.",
          analogy:
            "A condition works like a fork in a trail: the answer determines which path the program follows.",
          example: 'score = 8\nif score >= 7:\n    print("Passed")\nelse:\n    print("Try again")',
          starterCode: 'temperature = 24\n\n# Print "Warm" when temperature is 20 or higher.\n# Otherwise print "Cool".\n',
          solution: 'temperature = 24\n\nif temperature >= 20:\n    print("Warm")\nelse:\n    print("Cool")',
          hints: [
            "Compare temperature with 20.",
            "Use if temperature >= 20, followed by an else block.",
            'if temperature >= 20:\n    print("Warm")\nelse:\n    print("Cool")',
          ],
          tests: [
            {
              name: "prints the matching category",
              code: 'assert __user_output__.strip() == "Warm", "24 should be classified as Warm."',
            },
            {
              name: "uses a boolean comparison",
              code: 'assert isinstance(temperature >= 20, bool)',
              hidden: true,
            },
          ],
          estimatedMinutes: 8,
        },
        {
          id: "boolean-logic",
          title: "Combine conditions",
          objective: "Use boolean operators to check more than one rule.",
          concept:
            "The and, or, and not operators combine or invert conditions. They let a decision describe the real rule instead of checking one fact at a time.",
          analogy:
            "A venue may require both a ticket and an age check; boolean logic combines those gates into one decision.",
          example: 'has_ticket = True\nage = 20\nprint(has_ticket and age >= 18)',
          starterCode: 'age = 19\nhas_ticket = True\n\n# Print "Enter" only when both requirements are met\n',
          solution: 'age = 19\nhas_ticket = True\n\nif age >= 18 and has_ticket:\n    print("Enter")\nelse:\n    print("Wait")',
          hints: [
            "Both the age check and ticket check must be true.",
            "Join age >= 18 and has_ticket with the and operator.",
            'Use if age >= 18 and has_ticket: then print("Enter").',
          ],
          tests: [
            { name: "allows a valid visitor", code: 'assert __user_output__.strip() == "Enter", "This visitor meets both requirements."' },
            { name: "keeps boolean inputs intact", code: 'assert isinstance(has_ticket, bool) and age == 19', hidden: true },
          ],
          estimatedMinutes: 8,
        },
      ],
    },
    {
      id: "loops",
      title: "Repeat work",
      lessons: [
        {
          id: "for-loops",
          title: "Repeat with for",
          objective: "Use a for loop to add a sequence of numbers.",
          concept:
            "A for loop visits each value in a sequence. An accumulator variable can remember a growing result across iterations.",
          analogy:
            "It is like scanning each item in a basket and adding its price to a running receipt.",
          example: 'total = 0\nfor number in [2, 4, 6]:\n    total += number\nprint(total)',
          starterCode: '# Add the numbers from 1 through 5 with a loop\ntotal = 0\n\nprint(total)\n',
          solution: 'total = 0\nfor number in range(1, 6):\n    total += number\n\nprint(total)',
          hints: [
            "Use range to generate the numbers 1 through 5.",
            "range stops before its second argument, so use range(1, 6).",
            "Inside the loop, update total with total += number.",
          ],
          tests: [
            { name: "adds the full range", code: 'assert total == 15, "The numbers 1 through 5 add up to 15."' },
            { name: "prints the total", code: 'assert __user_output__.strip() == "15", "Print only the final total."', hidden: true },
          ],
          estimatedMinutes: 9,
        },
        {
          id: "while-loops",
          title: "Loop until a condition changes",
          objective: "Use a while loop to build a countdown.",
          concept:
            "A while loop repeats as long as its condition remains true. The loop body must change something involved in that condition so the loop can finish.",
          analogy:
            "A countdown clock keeps ticking while time remains, then stops exactly when it reaches zero.",
          example: 'steps = 3\nwhile steps > 0:\n    print(steps)\n    steps -= 1',
          starterCode: 'count = 3\n\n# Print 3, 2, 1 on separate lines using while\n',
          solution: 'count = 3\nwhile count > 0:\n    print(count)\n    count -= 1',
          hints: [
            "Continue while count is greater than zero.",
            "Print count inside the loop and reduce it after printing.",
            "Use while count > 0, then count -= 1 inside the indented block.",
          ],
          tests: [
            { name: "prints the countdown", code: 'assert __user_output__.strip().splitlines() == ["3", "2", "1"], "Print 3, 2, and 1 on separate lines."' },
            { name: "stops at zero", code: 'assert count == 0, "The loop should finish with count equal to zero."', hidden: true },
          ],
          estimatedMinutes: 9,
        },
      ],
    },
    {
      id: "functions",
      title: "Build reusable functions",
      lessons: [
        {
          id: "functions-return",
          title: "Return a result",
          objective: "Define a function that returns a calculated value.",
          concept:
            "A function packages a reusable operation. Parameters carry values in, and return sends a result back to the caller.",
          analogy:
            "A function is a small machine: feed it inputs, let it work, and collect its output.",
          example: 'def double(number):\n    return number * 2\n\nprint(double(4))',
          starterCode: '# Complete the function so it returns width times height\ndef rectangle_area(width, height):\n    pass\n\nprint(rectangle_area(4, 3))\n',
          solution: 'def rectangle_area(width, height):\n    return width * height\n\nprint(rectangle_area(4, 3))',
          hints: [
            "Replace pass with a return statement.",
            "Multiply the two parameters inside the function.",
            "Write return width * height.",
          ],
          tests: [
            { name: "calculates the sample area", code: 'assert rectangle_area(4, 3) == 12, "A 4 by 3 rectangle has area 12."' },
            { name: "works for another rectangle", code: 'assert rectangle_area(7, 5) == 35, "The function should work for other inputs."', hidden: true },
          ],
          estimatedMinutes: 10,
        },
        {
          id: "parameters-defaults",
          title: "Use flexible parameters",
          objective: "Add a default parameter to make a function flexible.",
          concept:
            "A default parameter supplies a value when the caller omits that argument, while still allowing an explicit value to replace it.",
          analogy:
            "It is like a form with a sensible preselected option that you can still change.",
          example: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"',
          starterCode: 'def price_with_tax(price, tax_rate):\n    return price\n\nprint(price_with_tax(100))\n',
          solution: 'def price_with_tax(price, tax_rate=0.08):\n    return price * (1 + tax_rate)\n\nprint(price_with_tax(100))',
          hints: [
            "Give tax_rate a default value in the function definition.",
            "Use 0.08 as the default and multiply price by 1 + tax_rate.",
            "Define price_with_tax(price, tax_rate=0.08) and return price * (1 + tax_rate).",
          ],
          tests: [
            { name: "uses the default tax rate", code: 'assert price_with_tax(100) == 108, "The default tax should produce 108."' },
            { name: "accepts a custom tax rate", code: 'assert abs(price_with_tax(50, 0.1) - 55) < 1e-9, "A caller should be able to replace the default."', hidden: true },
          ],
          estimatedMinutes: 9,
        },
        {
          id: "scope",
          title: "Understand variable scope",
          objective: "Keep temporary values local to a function.",
          concept:
            "Variables created inside a function are local to that call. Local scope prevents temporary names from unexpectedly changing unrelated parts of a program.",
          analogy:
            "A local variable is a note on your desk, not a poster placed in the building lobby.",
          example: 'rate = 2\ndef convert(value):\n    result = value * rate\n    return result',
          starterCode: 'multiplier = 3\n\ndef scale(value):\n    # Create a local result and return it\n    pass\n\nprint(scale(4))\n',
          solution: 'multiplier = 3\n\ndef scale(value):\n    result = value * multiplier\n    return result\n\nprint(scale(4))',
          hints: [
            "Create result inside the function body.",
            "The function can read multiplier without replacing it.",
            "Set result = value * multiplier and return result.",
          ],
          tests: [
            { name: "returns the scaled value", code: 'assert scale(4) == 12, "Four scaled by three should be 12."' },
            { name: "preserves the outer multiplier", code: 'assert multiplier == 3 and "result" not in globals(), "Keep result local to the function."', hidden: true },
          ],
          estimatedMinutes: 9,
        },
      ],
    },
    {
      id: "collections",
      title: "Organize collections",
      lessons: [
        {
          id: "lists",
          title: "Work with lists",
          objective: "Update a list and calculate a value from its items.",
          concept:
            "A list keeps an ordered, changeable collection. You can append items, access them by index, loop over them, and pass them to functions such as sum.",
          analogy:
            "A list is a numbered shopping list that can grow and change as you work.",
          example: 'scores = [7, 9]\nscores.append(8)\nprint(sum(scores))',
          starterCode: 'scores = [8, 9, 7]\n# Add 10, then store and print the average\naverage = 0\n',
          solution: 'scores = [8, 9, 7]\nscores.append(10)\naverage = sum(scores) / len(scores)\nprint(average)',
          hints: [
            "Use the list's append method to add the new score.",
            "Average means the sum divided by the number of items.",
            "Call scores.append(10), then use sum(scores) / len(scores).",
          ],
          tests: [
            { name: "adds the new score", code: 'assert scores == [8, 9, 7, 10], "Append 10 to the existing list."' },
            { name: "calculates the average", code: 'assert average == 8.5, "The average should be 8.5."', hidden: true },
          ],
          estimatedMinutes: 10,
        },
        {
          id: "dictionaries",
          title: "Look up values with dictionaries",
          objective: "Read and update values stored by key.",
          concept:
            "A dictionary maps unique keys to values. It is ideal when a meaningful label is more useful than a numeric position.",
          analogy:
            "A dictionary works like a contact list: find a person's name to retrieve the matching number.",
          example: 'stock = {"pens": 4}\nstock["pens"] += 2\nprint(stock["pens"])',
          starterCode: 'inventory = {"apples": 4, "pears": 2}\n# Add 3 apples and print the new apple count\n',
          solution: 'inventory = {"apples": 4, "pears": 2}\ninventory["apples"] += 3\nprint(inventory["apples"])',
          hints: [
            "Use the key 'apples' inside square brackets.",
            "Read, add, and assign in one step with +=.",
            'Write inventory["apples"] += 3, then print that value.',
          ],
          tests: [
            { name: "updates the apple count", code: 'assert inventory["apples"] == 7, "The inventory should contain seven apples."' },
            { name: "preserves the other item", code: 'assert inventory["pears"] == 2, "Do not change the pear count."', hidden: true },
          ],
          estimatedMinutes: 9,
        },
        {
          id: "tuples-sets",
          title: "Choose tuples and sets",
          objective: "Use a tuple for fixed coordinates and a set for unique tags.",
          concept:
            "Tuples are ordered and fixed after creation. Sets are unordered collections that automatically keep only unique values.",
          analogy:
            "A coordinate pair is a sealed label, while a guest list removes duplicate names.",
          example: 'point = (3, 5)\ntags = {"python", "python", "web"}\nprint(len(tags))',
          starterCode: 'point = ()\ntags = ["python", "beginner", "python"]\n\n# Create point (4, 7), convert tags to unique values, and print the tag count\n',
          solution: 'point = (4, 7)\ntags = set(["python", "beginner", "python"])\nprint(len(tags))',
          hints: [
            "Parentheses create the coordinate tuple.",
            "Pass the tag list to set() to remove duplicates.",
            'Use point = (4, 7), tags = set([...]), then print(len(tags)).',
          ],
          tests: [
            { name: "creates fixed coordinates", code: 'assert point == (4, 7) and isinstance(point, tuple), "Use a tuple containing 4 and 7."' },
            { name: "keeps unique tags", code: 'assert tags == {"python", "beginner"} and __user_output__.strip() == "2"', hidden: true },
          ],
          estimatedMinutes: 9,
        },
      ],
    },
    {
      id: "strings",
      title: "Transform text",
      lessons: [
        {
          id: "string-methods",
          title: "Build a URL slug",
          objective: "Chain string methods to create a clean identifier.",
          concept:
            "Strings provide methods for common transformations. Chaining methods lets each small step feed the next without changing the original string.",
          analogy:
            "A text-cleaning pipeline is an assembly line: trim, normalize, then replace one step at a time.",
          example: 'title = "  Learn Python  "\nslug = title.strip().lower().replace(" ", "-")',
          starterCode: 'title = "  My First Project  "\n# Create and print: my-first-project\nslug = title\n',
          solution: 'title = "  My First Project  "\nslug = title.strip().lower().replace(" ", "-")\nprint(slug)',
          hints: [
            "Remove outer spaces before changing the remaining text.",
            "Chain strip(), lower(), and replace().",
            'Use title.strip().lower().replace(" ", "-").',
          ],
          tests: [
            { name: "creates the expected slug", code: 'assert slug == "my-first-project", "Normalize the title into a hyphenated slug."' },
            { name: "prints only the slug", code: 'assert __user_output__.strip() == "my-first-project"', hidden: true },
          ],
          estimatedMinutes: 8,
        },
      ],
    },
    {
      id: "reliability",
      title: "Debug reliable programs",
      lessons: [
        {
          id: "exceptions",
          title: "Handle expected errors",
          objective: "Catch a specific exception and return a safe result.",
          concept:
            "Exceptions report that normal execution could not continue. Catch only errors you expect and handle them in a way the caller can understand.",
          analogy:
            "A circuit breaker handles a known overload without pretending that every possible fault is the same.",
          example: 'try:\n    number = int("ten")\nexcept ValueError:\n    number = 0',
          starterCode: 'def safe_divide(a, b):\n    # Return a / b, but print "Cannot divide by zero" and return None for zero\n    return a / b\n\nresult = safe_divide(8, 0)\n',
          solution: 'def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        print("Cannot divide by zero")\n        return None\n\nresult = safe_divide(8, 0)',
          hints: [
            "Wrap the division in a try block.",
            "Catch ZeroDivisionError specifically.",
            "In the except block, print the message and return None.",
          ],
          tests: [
            { name: "handles division by zero", code: 'assert result is None and "Cannot divide by zero" in __user_output__, "Handle zero without crashing."' },
            { name: "still divides valid numbers", code: 'assert safe_divide(9, 3) == 3, "Valid division should still work."', hidden: true },
          ],
          estimatedMinutes: 11,
        },
        {
          id: "debugging",
          title: "Debug a failing function",
          objective: "Read the expected behavior and fix an incorrect calculation.",
          concept:
            "Debugging starts by reproducing a failure, comparing actual and expected behavior, and changing the smallest relevant part of the program.",
          analogy:
            "A failing test is a trail marker: it narrows the search instead of merely saying the whole route is wrong.",
          example: 'def square(number):\n    return number * number\n\nassert square(3) == 9',
          starterCode: '# This function should convert minutes to seconds\ndef to_seconds(minutes):\n    return minutes + 60\n\nprint(to_seconds(3))\n',
          solution: 'def to_seconds(minutes):\n    return minutes * 60\n\nprint(to_seconds(3))',
          hints: [
            "Compare what the function does with the unit conversion it promises.",
            "Each minute contains 60 seconds, so addition is the wrong operation.",
            "Change the return expression to minutes * 60.",
          ],
          tests: [
            { name: "converts three minutes", code: 'assert to_seconds(3) == 180, "Three minutes is 180 seconds."' },
            { name: "handles edge cases", code: 'assert to_seconds(0) == 0 and to_seconds(2.5) == 150, "The function should work for zero and decimal minutes."', hidden: true },
          ],
          estimatedMinutes: 8,
        },
        {
          id: "clean-code",
          title: "Write clear, focused code",
          objective: "Refactor repeated text cleanup into a well-named function.",
          concept:
            "Clean code uses specific names, small functions, and one clear responsibility. It should communicate intent before a reader studies every operator.",
          analogy:
            "A labelled drawer is faster to use than a mystery box, even when both contain the same tools.",
          example: 'def format_name(name):\n    return name.strip().title()',
          starterCode: '# Create format_name so both examples are cleaned consistently\ndef format_name(name):\n    pass\n\nprint(format_name("  ada lovelace "))\n',
          solution: 'def format_name(name):\n    return name.strip().title()\n\nprint(format_name("  ada lovelace "))',
          hints: [
            "Give the function one job: return a cleaned name.",
            "Remove outer whitespace, then use title-style capitalization.",
            "Return name.strip().title().",
          ],
          tests: [
            { name: "formats the sample name", code: 'assert format_name("  ada lovelace ") == "Ada Lovelace"' },
            { name: "reuses the same rule", code: 'assert format_name("GRACE hopper") == "Grace Hopper", "The function should work for other names."', hidden: true },
          ],
          estimatedMinutes: 8,
        },
      ],
    },
  ],
};

export const plannedCourses = [
  "Python Intermediate",
  "Computer Science",
  "SQL and Databases",
  "Web Development",
  "Backend Engineering",
  "Data Analysis",
  "Machine Learning and AI",
  "Game Development",
  "Software Engineering",
];

export function allLessons(course = pythonFundamentals) {
  return course.chapters.flatMap((chapter) => chapter.lessons);
}

export function findLesson(id: string) {
  return allLessons().find((lesson) => lesson.id === id);
}
