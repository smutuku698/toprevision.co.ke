import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TERMS = [
  { id: "variable", label: "Variable", definition: "A named storage location that holds a value which can change while the program runs" },
  { id: "sequence", label: "Sequence statement", definition: "A set of instructions that run one after another, in the exact order they are placed" },
  { id: "repeating", label: "Repeating statement (loop)", definition: "A block of instructions that runs over and over, a set number of times or until a condition changes" },
  { id: "selection", label: "Selection statement (conditional)", definition: "A block of instructions that only runs if a certain condition is true" },
  { id: "syntax", label: "Syntax", definition: "The set of rules that define how instructions and blocks must be arranged to work correctly" },
  { id: "io", label: "Input/output statement", definition: "An instruction that takes in data from the user, or displays a result to the user" },
] as const;

const APPS = ["Scratch", "Microsoft MakeCode", "Sprite box"] as const;

const APP_TYPE_ITEMS = [
  { text: "Scratch", bucket: "application" },
  { text: "Microsoft MakeCode", bucket: "application" },
  { text: "Sprite box", bucket: "application" },
  { text: "Variable", bucket: "concept" },
  { text: "Loop (repeating statement)", bucket: "concept" },
  { text: "Conditional (selection statement)", bucket: "concept" },
  { text: "Syntax", bucket: "concept" },
] as const;

const APP_TYPE_LABEL: Record<string, string> = { application: "A visual programming application", concept: "A programming concept, not an application" };

const SCENARIOS = [
  { text: "A sprite is programmed to move forward, then turn, then move forward again, one instruction after another", answer: "sequence" },
  { text: "A sprite repeats 'move 10 steps' twenty times to travel across the stage", answer: "repeating" },
  { text: "A sprite only says 'Game over' when its score variable reaches zero", answer: "selection" },
  { text: "A program asks the user to type their name, then displays a greeting using that name", answer: "io" },
] as const;

const SQUARE_STEPS = [
  { id: "move1", label: "Move forward 10 steps" },
  { id: "turn1", label: "Turn 90 degrees" },
  { id: "move2", label: "Move forward 10 steps" },
  { id: "turn2", label: "Turn 90 degrees" },
];

export const visualProgramming: Skill = {
  id: "g8-pt-c-visual-programming",
  code: "C.4",
  subjectId: "pre-technical",
  strandId: "g8-pt-communication",
  grade: 8,
  title: "Visual Programming",
  description: "Types of visual programming applications, their key features and terminology, and creating instructions to solve problems using blocks.",
  generate(rng) {
    const branch = randChoice(rng, ["term-match", "app-type-sort", "scenario", "term-recall", "square-order"] as const);

    if (branch === "term-match") {
      const chosen = shuffle(rng, [...TERMS]).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each visual programming term to its correct meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each block or concept actually controls in a program.",
        explanation: chosen.map((t) => `${t.label}: ${t.definition}.`).join(" "),
      };
    }

    if (branch === "app-type-sort") {
      const chosen = shuffle(rng, APP_TYPE_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: APP_TYPE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each item into whether it is a visual programming application, or a programming concept used inside one.",
        items,
        buckets,
        correctBucket,
        hint: "Applications are the software you open; concepts are the building blocks you use inside it.",
        explanation: chosen.map((c) => `"${c.text}" is ${APP_TYPE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const s = randChoice(rng, SCENARIOS);
      const term = TERMS.find((t) => t.id === s.answer)!;
      const others = TERMS.filter((t) => t.id !== s.answer).map((t) => t.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, term.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. Which programming concept is being used here?`,
        choices,
        correctIndex,
        hint: "Ask what is actually controlling the program's behaviour in this description.",
        explanation: `${term.label}: ${term.definition}.`,
      };
    }

    if (branch === "term-recall") {
      const useApp = randChoice(rng, [true, false] as const);
      if (useApp) {
        const app = randChoice(rng, APPS);
        return {
          kind: "fill-blank",
          prompt: `"${app}" is an example of a visual programming application used to create instructions with blocks.`,
          before: "This application is called",
          after: ".",
          correctAnswer: app,
          inputMode: "text",
          hint: "Recall the exact name of the application described.",
          explanation: `${app} is a visual programming application where instructions are built from blocks instead of typed code.`,
        };
      }
      const t = randChoice(rng, TERMS);
      return {
        kind: "fill-blank",
        prompt: `A visual programming term is defined as: "${t.definition}."`,
        before: "This term is called",
        after: ".",
        correctAnswer: t.label.replace(" (loop)", "").replace(" (conditional)", ""),
        acceptedAnswers: [t.id, t.label],
        inputMode: "text",
        hint: "Think about which part of a program this description is controlling.",
        explanation: `${t.label}: ${t.definition}.`,
      };
    }

    // square-order
    const items = shuffle(rng, SQUARE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange these blocks in the correct sequence so a sprite draws a square by moving and turning repeatedly.",
      instruction: "Click them in order.",
      items,
      correctOrder: SQUARE_STEPS.map((s) => s.id),
      hint: "To draw each side of a square, the sprite must move forward, then turn a quarter-turn, and repeat.",
      explanation: SQUARE_STEPS.map((s) => s.label).join(" → ") + ". Repeating this whole sequence four times completes a square.",
    };
  },
};
