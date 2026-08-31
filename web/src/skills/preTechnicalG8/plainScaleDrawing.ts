import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const RF_EXPLANATIONS = [
  { rf: "1:50", meaning: "1 unit on the drawing represents 50 of the same units in real life" },
  { rf: "1:100", meaning: "1 unit on the drawing represents 100 of the same units in real life" },
  { rf: "1:20", meaning: "1 unit on the drawing represents 20 of the same units in real life" },
  { rf: "1:200", meaning: "1 unit on the drawing represents 200 of the same units in real life" },
] as const;

const FEATURE_ITEMS = [
  { text: "Shows the representative fraction (RF), written as a ratio like 1:50", bucket: "feature" },
  { text: "Is divided into units that let you read off real-life measurements directly", bucket: "feature" },
  { text: "Has a small extension divided into finer subdivisions for reading smaller units", bucket: "feature" },
  { text: "Shows the compass bearing (direction) a road or river travels in", bucket: "not-feature" },
  { text: "Shows colour bands representing the height of land above sea level", bucket: "not-feature" },
] as const;

const FEATURE_LABEL: Record<string, string> = { feature: "A feature of a plain scale", "not-feature": "Not a feature of a plain scale" };

const SCALE_STEPS = [
  { id: "choose", label: "Choose a suitable scale that fits the paper size for the actual object" },
  { id: "calculate", label: "Calculate the scaled-down (or up) length for each dimension" },
  { id: "construct", label: "Lightly draw construction lines to lay out the figure's outline" },
  { id: "draw", label: "Draw the final figure accurately to the calculated dimensions" },
  { id: "label", label: "Label the drawing with its dimensions and the scale used" },
];

export const plainScaleDrawing: Skill = {
  id: "g8-pt-c-plain-scale-drawing",
  code: "C.3",
  subjectId: "pre-technical",
  strandId: "g8-pt-communication",
  grade: 8,
  title: "Plain Scale Drawing",
  description: "The features of a plain scale, interpreting the representative fraction, and drawing plane figures to a given scale.",
  generate(rng) {
    const branch = randChoice(rng, ["interpret-rf", "scale-calc", "room-choice", "feature-sort", "steps-order"] as const);

    if (branch === "interpret-rf") {
      const rf = randChoice(rng, RF_EXPLANATIONS);
      const others = RF_EXPLANATIONS.filter((r) => r.rf !== rf.rf).map((r) => r.meaning);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, rf.meaning, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `A plain scale drawing has a representative fraction (RF) of ${rf.rf}. What does this mean?`,
        choices,
        correctIndex,
        hint: "The RF is written as drawing-units : real-life-units.",
        explanation: `RF ${rf.rf} means ${rf.meaning}.`,
      };
    }

    if (branch === "scale-calc") {
      const scaleFactor = randChoice(rng, [20, 25, 50, 100] as const);
      const direction = randChoice(rng, ["to-drawn", "to-actual", "find-scale"] as const);
      if (direction === "to-drawn") {
        const actual = randInt(rng, 4, 40) * scaleFactor;
        const drawn = actual / scaleFactor;
        return {
          kind: "fill-blank",
          prompt: `A wall is ${actual} cm long in real life. On a drawing with scale 1:${scaleFactor}, how long should the wall be drawn, in cm?`,
          before: "Drawn length =",
          after: "cm",
          correctAnswer: String(drawn),
          inputMode: "numeric",
          hint: "Drawn length = actual length ÷ scale factor.",
          explanation: `Drawn length $= ${actual} \\div ${scaleFactor} = ${drawn}$ cm.`,
        };
      }
      if (direction === "to-actual") {
        const drawn = randInt(rng, 3, 30);
        const actual = drawn * scaleFactor;
        return {
          kind: "fill-blank",
          prompt: `A wall is drawn ${drawn} cm long on a plan with scale 1:${scaleFactor}. What is its actual length in real life, in cm?`,
          before: "Actual length =",
          after: "cm",
          correctAnswer: String(actual),
          inputMode: "numeric",
          hint: "Actual length = drawn length × scale factor.",
          explanation: `Actual length $= ${drawn} \\times ${scaleFactor} = ${actual}$ cm.`,
        };
      }
      const drawn = randInt(rng, 3, 20);
      const actual = drawn * scaleFactor;
      return {
        kind: "fill-blank",
        prompt: `A wall that is actually ${actual} cm long was drawn as ${drawn} cm on a plain scale drawing. What is the scale, expressed as 1:n?`,
        before: "Scale = 1 :",
        after: "",
        correctAnswer: String(scaleFactor),
        inputMode: "numeric",
        hint: "n = actual length ÷ drawn length.",
        explanation: `n $= ${actual} \\div ${drawn} = ${scaleFactor}$, so the scale is 1:${scaleFactor}.`,
      };
    }

    if (branch === "room-choice") {
      const widthM = randInt(rng, 4, 10);
      const heightM = randInt(rng, 3, 8);
      const scaleFactor = randChoice(rng, [50, 100] as const);
      const drawnWidth = (widthM * 100) / scaleFactor;
      const drawnHeight = (heightM * 100) / scaleFactor;
      const correctText = `${drawnWidth} cm by ${drawnHeight} cm`;
      const decoys = [
        `${drawnHeight} cm by ${drawnWidth} cm`,
        `${widthM} cm by ${heightM} cm`,
        `${drawnWidth * 2} cm by ${drawnHeight * 2} cm`,
      ];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, decoys, 3);
      return {
        kind: "multiple-choice",
        prompt: `This room measures ${widthM} m by ${heightM} m in real life. What should its dimensions be on a drawing at a scale of 1:${scaleFactor}, in cm?`,
        visual: { type: "rectangle", width: widthM, height: heightM, labelWidth: `${widthM} m`, labelHeight: `${heightM} m` },
        choices,
        correctIndex,
        hint: `Convert each metre measurement to cm, then divide by the scale factor ${scaleFactor}.`,
        explanation: `${widthM} m = ${widthM * 100} cm ÷ ${scaleFactor} = ${drawnWidth} cm. ${heightM} m = ${heightM * 100} cm ÷ ${scaleFactor} = ${drawnHeight} cm.`,
      };
    }

    if (branch === "feature-sort") {
      const chosen = shuffle(rng, FEATURE_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: FEATURE_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into whether it is a feature of a plain scale, or not.",
        items,
        buckets,
        correctBucket,
        hint: "A plain scale is only about converting between drawing size and real-life size — not direction or elevation.",
        explanation: chosen.map((c) => `"${c.text}" — ${FEATURE_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    // steps-order
    const items = shuffle(rng, SCALE_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the correct steps for drawing a plane figure to a given scale.",
      instruction: "Click them in order.",
      items,
      correctOrder: SCALE_STEPS.map((s) => s.id),
      hint: "Decide the scale first, calculate before drawing, and finish by labelling the result.",
      explanation: SCALE_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
