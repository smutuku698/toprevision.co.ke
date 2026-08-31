import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const INSTRUMENTS = [
  { id: "set-squares", label: "Set squares", use: "Drawing parallel lines and standard angles such as 30°, 45°, 60°, and 90°" },
  { id: "drawing-set", label: "Drawing set (compasses & dividers)", use: "Drawing circles, arcs, and stepping off equal distances along a line" },
  { id: "straight-edges", label: "Straight edges / T-square", use: "Guiding a pencil to draw straight horizontal or parallel lines across the board" },
  { id: "pencils", label: "Drawing pencils", use: "Producing lines of different thickness and darkness, from construction lines to outlines" },
  { id: "protractor", label: "Protractor", use: "Measuring and marking out angles of any size accurately" },
] as const;

const ENVIRONMENT_ITEMS = [
  { text: "A flat, stable table with enough space to lay out the drawing board", bucket: "good" },
  { text: "Bright, even lighting that falls across the paper without casting shadows", bucket: "good" },
  { text: "The T-square held firmly against the working edge of the drawing board", bucket: "good" },
  { text: "Instruments cleaned and kept within easy reach on the table", bucket: "good" },
  { text: "Working in dim light with shadows falling across the paper", bucket: "poor" },
  { text: "A cluttered table with tools and books piled on top of the drawing", bucket: "poor" },
  { text: "Eating or drinking directly over an open technical drawing", bucket: "poor" },
] as const;

const ENV_LABEL: Record<string, string> = { good: "Good drawing environment practice", poor: "Poor drawing environment practice" };

const SETUP_STEPS = [
  { id: "clear", label: "Clear and wipe the table before laying out any equipment" },
  { id: "secure", label: "Secure the paper flat on the drawing board with tape or clips" },
  { id: "position", label: "Position the T-square or drawing set squarely against the board's edge" },
  { id: "sharpen", label: "Sharpen the pencil to a fine point suitable for clean lines" },
  { id: "check", label: "Check that all needed instruments are within reach before starting" },
];

export const planeGeometry: Skill = {
  id: "g8-pt-c-plane-geometry",
  code: "C.1",
  subjectId: "pre-technical",
  strandId: "g8-pt-communication",
  grade: 8,
  title: "Plane Geometry",
  description: "Instruments used in drawing, the layout of a good drawing environment, and constructing combined shapes applied in technical drawing.",
  generate(rng) {
    const branch = randChoice(rng, ["instrument-match", "environment-sort", "combined-area", "instrument-recall", "setup-order"] as const);

    if (branch === "instrument-match") {
      const tokens = shuffle(rng, INSTRUMENTS.map((i) => ({ id: i.id, label: i.label })));
      const targets = shuffle(rng, INSTRUMENTS.map((i) => ({ id: i.id, label: i.use })));
      const correctMap: Record<string, string> = {};
      for (const i of INSTRUMENTS) correctMap[i.id] = i.id;
      return {
        kind: "click-match",
        prompt: "Match each drawing instrument to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint: "Each instrument is designed for a specific kind of line, angle, or curve.",
        explanation: INSTRUMENTS.map((i) => `${i.label}: ${i.use}.`).join(" "),
      };
    }

    if (branch === "environment-sort") {
      const chosen = shuffle(rng, ENVIRONMENT_ITEMS).slice(0, randInt(rng, 5, 7));
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: ENV_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `e${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`e${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into good or poor practice for setting up a drawing environment.",
        items,
        buckets,
        correctBucket,
        hint: "A good drawing environment keeps the paper, tools, and light working for accuracy, not against it.",
        explanation: chosen.map((c) => `"${c.text}" — ${ENV_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "combined-area") {
      const width = randInt(rng, 8, 16);
      const height = randInt(rng, 5, 10);
      const triBase = width;
      const triHeight = randInt(rng, 3, 8);
      const rectArea = width * height;
      const triArea = (triBase * triHeight) / 2;
      const totalArea = rectArea + triArea;
      return {
        kind: "fill-blank",
        prompt: `A workshop name-plate is drawn as a combined shape: a rectangle ${width} cm by ${height} cm (shown below) with a right-angled triangular end attached, base ${triBase} cm and height ${triHeight} cm. Find the total area of the combined shape, in cm².`,
        before: "Total area =",
        after: "cm²",
        correctAnswer: String(totalArea),
        inputMode: "numeric",
        visual: { type: "rectangle", width, height },
        hint: "Total area = area of the rectangle + area of the triangle. Triangle area = 1/2 × base × height.",
        explanation: `Rectangle area $= ${width} \\times ${height} = ${rectArea}$ cm². Triangle area $= \\frac{1}{2} \\times ${triBase} \\times ${triHeight} = ${triArea}$ cm². Total $= ${rectArea} + ${triArea} = ${totalArea}$ cm².`,
      };
    }

    if (branch === "instrument-recall") {
      const i = randChoice(rng, INSTRUMENTS);
      const others = INSTRUMENTS.filter((x) => x.id !== i.id).map((x) => x.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, i.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which drawing instrument is used for: "${i.use}"?`,
        choices,
        correctIndex,
        hint: "Think about which tool is specifically shaped or designed for this job.",
        explanation: `${i.label}: ${i.use}.`,
      };
    }

    // setup-order
    const items = shuffle(rng, SETUP_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps for setting up a drawing environment before starting a technical drawing.",
      instruction: "Click them in order.",
      items,
      correctOrder: SETUP_STEPS.map((s) => s.id),
      hint: "Start by preparing the workspace itself, then the paper, then the instruments.",
      explanation: SETUP_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
