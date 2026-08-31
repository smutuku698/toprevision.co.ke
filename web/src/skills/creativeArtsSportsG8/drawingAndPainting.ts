import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COMPLEMENTARY_PAIRS = [
  { a: "Red", b: "Green" },
  { a: "Blue", b: "Orange" },
  { a: "Yellow", b: "Purple" },
];

const WARM_COOL: { label: string; bucket: "warm" | "cool"; reason: string }[] = [
  { label: "Red", bucket: "warm", reason: "Red is a warm colour — it energises a picture and pulls the eye forward." },
  { label: "Orange", bucket: "warm", reason: "Orange is a warm colour — it energises a picture and pulls the eye forward." },
  { label: "Yellow", bucket: "warm", reason: "Yellow is a warm colour — it energises a picture and pulls the eye forward." },
  { label: "Blue", bucket: "cool", reason: "Blue is a cool colour — it creates a calm, distant feeling." },
  { label: "Green", bucket: "cool", reason: "Green is a cool colour — it creates a calm, distant feeling." },
  { label: "Purple", bucket: "cool", reason: "Purple is a cool colour — it creates a calm, distant feeling." },
];

const GRADATION_STEPS = [
  { id: "white", label: "White" },
  { id: "pale", label: "Pale blue (mostly white, a little blue)" },
  { id: "light", label: "Light blue" },
  { id: "medium", label: "Medium blue" },
  { id: "navy", label: "Navy blue (almost no white)" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "What are complementary colours on a colour wheel?", correct: "Colours that sit directly opposite each other on the colour wheel", distractors: ["Colours that sit next to each other on the colour wheel", "Colours that are all primary colours", "Colours mixed with white only"] },
  { q: "What happens visually when complementary colours are placed next to each other?", correct: "Each colour appears more vivid and intense by contrast", distractors: ["Both colours appear duller", "They blend into a single grey shape", "There is no visible effect"] },
  { q: "What does 'dominance' mean in a picture?", correct: "Making one element stand out as the main focus, often through size, colour, or placement", distractors: ["Using only one colour in the whole picture", "Making every object exactly the same size", "Painting only in black and white"] },
  { q: "Which of these is a common way to create dominance in a still life composition?", correct: "Making the main object noticeably larger than the surrounding objects", distractors: ["Making every object identical in size", "Removing all colour from the picture", "Placing every object in a straight row"] },
  { q: "What does a colour gradation strip show?", correct: "A gradual transition from one shade or colour to another", distractors: ["A list of primary colours only", "A single flat colour with no change", "The names of painting tools"] },
  { q: "Why might an artist create a colour gradation strip before painting?", correct: "To plan and see how a colour will smoothly change in value across the picture", distractors: ["To measure the size of the canvas", "To decide which brush to use", "To count how many colours are available"] },
  { q: "'Unity' in a picture refers to what?", correct: "How well the different parts of the picture work together as a whole", distractors: ["Using only one single colour", "Painting only one object", "The size of the canvas"] },
  { q: "In a still life painting, what is the subject typically made up of?", correct: "Arranged everyday objects, such as fruit, pots, or fabric", distractors: ["Only imaginary creatures", "Only moving people or animals", "Only landscapes and skies"] },
];

const COMPLEMENTARY_PROMPTS = [
  "Match each colour to its complementary colour on the colour wheel.",
  "Pair each colour with its complementary colour.",
  "Match each colour to the colour directly opposite it on the wheel.",
  "Connect each colour to its complementary pair.",
  "For each colour below, choose its complementary match.",
] as const;

const WARM_COOL_PROMPTS = [
  "Sort each colour into Warm colour or Cool colour.",
  "Decide whether each colour below is warm or cool, and sort it.",
  "Classify each colour as Warm or Cool.",
  "Which of these colours are warm, and which are cool? Sort them.",
  "Sort each colour by its warm/cool category.",
] as const;

const GRADATION_PROMPTS = [
  "Arrange these blue shades to build a colour gradation strip, from lightest to darkest.",
  "Put these blue shades in order, from lightest to darkest.",
  "Order these shades to form a gradation strip, lightest first.",
  "Sort these blue shades into a gradation sequence, from lightest to darkest.",
  "Place these shades in order to build a smooth gradation, lightest first.",
] as const;

const DOMINANCE_PROMPTS = [
  "This chart shows the relative size of three shapes in a still life composition. Which shape shows dominance in the picture?",
  "Look at the chart of shape sizes in this still life composition. Which shape is dominant?",
  "This chart compares three shapes' sizes in a composition. Which one dominates the picture?",
  "Using the chart, identify which shape creates dominance in the still life.",
  "Which of these three shapes, shown in the chart, dominates the composition?",
] as const;

export const drawingAndPainting: Skill = {
  id: "g8-cas-drawing-painting",
  code: "C.1",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Drawing and Painting",
  description: "Complementary colours, warm/cool colour mood, dominance through size, and colour gradation strips.",
  generate(rng) {
    const branch = randChoice(rng, ["complementary-match", "warm-cool", "gradation-order", "theory-mc", "dominance-chart"] as const);

    if (branch === "complementary-match") {
      const tokens = shuffle(rng, COMPLEMENTARY_PAIRS.map((p) => ({ id: p.a, label: p.a })));
      const targets = shuffle(rng, COMPLEMENTARY_PAIRS.map((p) => ({ id: p.a, label: p.b })));
      const correctMap: Record<string, string> = {};
      for (const p of COMPLEMENTARY_PAIRS) correctMap[p.a] = p.a;
      return {
        kind: "click-match",
        prompt: randChoice(rng, COMPLEMENTARY_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Complementary colours sit directly opposite each other on the colour wheel.",
        explanation: COMPLEMENTARY_PAIRS.map((p) => `${p.a} and ${p.b} are complementary — they sit opposite each other on the colour wheel.`).join(" "),
      };
    }

    if (branch === "warm-cool") {
      const items = shuffle(rng, WARM_COOL);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, WARM_COOL_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: [
          { id: "warm", label: "Warm colour" },
          { id: "cool", label: "Cool colour" },
        ],
        correctBucket,
        hint: "Warm colours (red, orange, yellow) energise a picture; cool colours (blue, green, purple) calm it.",
        explanation: items.map((c) => c.reason).join(" "),
      };
    }

    if (branch === "gradation-order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, GRADATION_PROMPTS),
        instruction: "Click the shades in order, lightest first.",
        items: shuffle(rng, GRADATION_STEPS),
        correctOrder: GRADATION_STEPS.map((s) => s.id),
        hint: "A gradation strip shows a smooth, gradual change from the lightest tint to the darkest shade.",
        explanation: `Lightest to darkest: ${GRADATION_STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "dominance-chart") {
      const shapes = shuffle(rng, ["Circle A", "Circle B", "Circle C"]);
      const sizes = [randInt(rng, 6, 9), randInt(rng, 2, 4), randInt(rng, 3, 5)];
      const data = shapes.map((label, i) => ({ label, value: sizes[i] }));
      const dominant = data.reduce((a, b) => (b.value > a.value ? b : a));
      const choices = shuffle(rng, shapes);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, DOMINANCE_PROMPTS),
        visual: { type: "bar-chart", data },
        choices,
        correctIndex: choices.indexOf(dominant.label),
        hint: "Dominance is usually created by making one element noticeably larger than the rest.",
        explanation: `${dominant.label} is the largest of the three shapes, so it draws the eye first and creates dominance in the composition.`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Complementary colours sit opposite on the wheel; dominance and unity are about how the whole picture works together.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
