import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[]; visual?: VisualSpec }[] = [
  {
    q: "What are analogous colours on a colour wheel?",
    correct: "Colours that sit next to each other on the colour wheel",
    distractors: ["Colours directly opposite each other", "Colours that are all primary colours", "Colours mixed with white only"],
    visual: { type: "color-wheel" },
  },
  {
    q: "Which set of colours is analogous?",
    correct: "Yellow, yellow-green, and green",
    distractors: ["Red, green, and blue", "Orange, blue, and purple", "Black, white, and grey"],
    visual: { type: "color-wheel" },
  },
  {
    q: "Why is colour harmony important in a painting?",
    correct: "It creates a pleasing, unified visual effect that feels balanced to the eye",
    distractors: ["It makes the painting take less time to complete", "It ensures only one colour is ever used", "It removes the need for a colour wheel"],
  },
  {
    q: "Which colours are generally considered 'warm' colours?",
    correct: "Red, orange, and yellow",
    distractors: ["Blue, green, and purple", "Black, white, and grey", "Blue, indigo, and violet"],
  },
  {
    q: "How does using cool colours typically affect the mood of a painting?",
    correct: "It creates a calm, relaxed, or distant feeling",
    distractors: ["It creates an energetic, hot feeling", "It always makes a painting look unfinished", "It has no effect on mood"],
  },
  {
    q: "In painting, what does the 'dabbing' technique produce?",
    correct: "A textured effect made by lightly tapping paint onto the surface",
    distractors: ["A perfectly smooth, flat surface", "A single continuous brush line", "An effect only possible with a palette knife"],
  },
  {
    q: "What does a colour gradation strip show?",
    correct: "A gradual transition from one colour to another",
    distractors: ["A list of primary colours only", "A single flat colour with no change", "The names of painting tools"],
  },
  {
    q: "'Unity' in a picture refers to what?",
    correct: "How well the different parts of the picture work together as a whole",
    distractors: ["Using only one single colour", "Painting only one object", "The size of the canvas"],
  },
];

const COLOURS: { label: string; bucket: "warm" | "cool"; reason: string }[] = [
  { label: "Red", bucket: "warm", reason: "Red is a warm colour — it energises a painting." },
  { label: "Orange", bucket: "warm", reason: "Orange is a warm colour — it energises a painting." },
  { label: "Yellow", bucket: "warm", reason: "Yellow is a warm colour — it energises a painting." },
  { label: "Blue", bucket: "cool", reason: "Blue is a cool colour — it creates a calm, relaxed mood." },
  { label: "Green", bucket: "cool", reason: "Green is a cool colour — it creates a calm, relaxed mood." },
  { label: "Purple", bucket: "cool", reason: "Purple is a cool colour — it creates a calm, relaxed mood." },
];

const CATEGORIZE_PROMPTS = [
  "Sort each colour into Warm colour or Cool colour.",
  "Decide whether each colour below is warm or cool, and sort it.",
  "Classify each colour as Warm or Cool.",
  "Which of these colours are warm, and which are cool? Sort them.",
  "Sort each colour by its warm/cool category.",
] as const;

export const drawingPainting: Skill = {
  id: "cas-drawing-painting",
  code: "C.1",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Drawing and Painting",
  description: "Colour harmony, analogous colours, warm/cool mood, and texture concepts in painting.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "categorize"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, COLOURS);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: [
          { id: "warm", label: "Warm colour" },
          { id: "cool", label: "Cool colour" },
        ],
        correctBucket,
        visual: { type: "color-wheel" },
        hint: "Warm colours (red, orange, yellow) energise a picture; cool colours (blue, green, purple) calm it.",
        explanation: COLOURS.map((c) => c.reason).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      ...(entry.visual ? { visual: entry.visual } : {}),
      hint: "Warm colours (red, orange, yellow) energise a picture; cool colours (blue, green, purple) calm it.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
