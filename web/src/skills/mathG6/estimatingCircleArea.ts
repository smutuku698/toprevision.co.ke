import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

/** Build a rows×cols grid (each cell 1 unit²) with the cells whose centre falls inside a
 * circle of the given radius (centred on the grid) marked as filled — the standard
 * "estimate area by counting squares" method. */
function circleGridFilled(radius: number): { rows: number; cols: number; filled: [number, number][] } {
  const size = radius * 2;
  const center = radius;
  const filled: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dr = r + 0.5 - center;
      const dc = c + 0.5 - center;
      if (Math.sqrt(dr * dr + dc * dc) <= radius) filled.push([r, c]);
    }
  }
  return { rows: size, cols: size, filled };
}

const CIRCLE_OBJECTS = [
  "a circular pond", "a round table top", "a circular flower bed", "a manhole cover",
  "a circular rug", "a well opening", "a circular garden plot", "a round mirror",
  "a circular water tank lid", "a coin", "a circular window", "a round dinner plate",
] as const;

// 32 shape-area task descriptions — 16 need the ½ factor (triangle-based), 16 don't (rectangle/square-based).
const AREA_TASK_DESCRIPTIONS: { text: string; needsHalf: boolean }[] = [
  { text: "Finding the area of a triangular flag", needsHalf: true },
  { text: "Finding the area of a triangular road warning sign", needsHalf: true },
  { text: "Finding the area of a triangular flower bed", needsHalf: true },
  { text: "Finding the area of a triangular roof gable", needsHalf: true },
  { text: "Finding the area of a triangular kite", needsHalf: true },
  { text: "Finding the area of a triangular sail", needsHalf: true },
  { text: "Finding the area of a triangular notice board", needsHalf: true },
  { text: "Finding the area of a triangular school badge", needsHalf: true },
  { text: "Finding the area of a triangular parade banner", needsHalf: true },
  { text: "Finding the area of a triangular paving slab", needsHalf: true },
  { text: "Finding the area of a triangular garden bed", needsHalf: true },
  { text: "Finding the area of a triangular bunting flag", needsHalf: true },
  { text: "Finding the area of a triangular support bracket", needsHalf: true },
  { text: "Finding the area of a triangular tent panel", needsHalf: true },
  { text: "Finding the area of the triangular end of a market-stall roof", needsHalf: true },
  { text: "Finding the area of a triangular metal gusset plate", needsHalf: true },
  { text: "Finding the area of a rectangular football pitch", needsHalf: false },
  { text: "Finding the area of a square classroom floor", needsHalf: false },
  { text: "Finding the area of a rectangular maize garden", needsHalf: false },
  { text: "Finding the area of a square floor tile", needsHalf: false },
  { text: "Finding the area of a rectangular school compound", needsHalf: false },
  { text: "Finding the area of an exercise book cover", needsHalf: false },
  { text: "Finding the area of a square window pane", needsHalf: false },
  { text: "Finding the area of a rectangular chalkboard", needsHalf: false },
  { text: "Finding the area of a square vegetable plot", needsHalf: false },
  { text: "Finding the area of a rectangular door", needsHalf: false },
  { text: "Finding the area of a rectangular desk top", needsHalf: false },
  { text: "Finding the area of a square sleeping mat", needsHalf: false },
  { text: "Finding the area of a rectangular banner", needsHalf: false },
  { text: "Finding the area of a rectangular water tank's base", needsHalf: false },
  { text: "Finding the area of a square poultry-pen floor", needsHalf: false },
  { text: "Finding the area of a rectangular carpet", needsHalf: false },
];

export const estimatingCircleArea: Skill = {
  id: "g6-math-m-estimating-circle-area",
  code: "M.4",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Estimating the area of circles",
  description: "Estimate the area of a circle by counting unit squares on a grid, recognise which shapes' area formulas need a ½ factor, and compare circle areas.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "grid-estimate-fill",
        "grid-estimate-mc",
        "grid-estimate-classical",
        "half-factor-categorize",
        "shape-formula-match",
        "order-circle-area",
      ] as const
    );

    if (branch === "grid-estimate-fill") {
      const radius = randInt(rng, 3, 7);
      const { rows, cols, filled } = circleGridFilled(radius);
      const object = randChoice(rng, CIRCLE_OBJECTS);
      return {
        kind: "fill-blank",
        prompt: `Each square on this grid represents 1 cm². The shaded squares approximate the shape of ${object}. Estimate its area by counting the shaded squares.`,
        visual: { type: "grid-shape", rows, cols, filled },
        before: "Estimated area ≈",
        after: "cm²",
        correctAnswer: String(filled.length),
        inputMode: "numeric",
        hint: "Count every shaded square, including partly-covered ones near the edge that were shaded in.",
        explanation: `There are ${filled.length} shaded squares, each worth 1 cm², so the estimated area is about ${filled.length} cm².`,
      };
    }

    if (branch === "grid-estimate-mc") {
      const radius = randInt(rng, 3, 7);
      const { rows, cols, filled } = circleGridFilled(radius);
      const object = randChoice(rng, CIRCLE_OBJECTS);
      const formulaEstimate = Math.round((22 / 7) * radius * radius);
      const wrong = [String(rows * cols), String(formulaEstimate), String(filled.length + 4)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(filled.length), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Each square on this grid represents 1 cm². The shaded squares approximate the shape of ${object}. Which is the best estimate of its area, found by counting shaded squares?`,
        visual: { type: "grid-shape", rows, cols, filled },
        choices: choices.map((c) => `${c} cm²`),
        correctIndex,
        layout: "grid",
        hint: "Count only the shaded squares — not the whole grid.",
        explanation: `Counting the shaded squares gives ${filled.length} cm². (Counting the whole grid, ${rows * cols} cm², counts unshaded squares too.)`,
      };
    }

    if (branch === "grid-estimate-classical") {
      const radius = randInt(rng, 3, 7);
      const { rows, cols, filled } = circleGridFilled(radius);
      return {
        kind: "fill-blank",
        prompt: "Each square on this grid represents 1 cm². Estimate the area of the shaded circle by counting the shaded squares.",
        visual: { type: "grid-shape", rows, cols, filled },
        before: "Estimated area ≈",
        after: "cm²",
        correctAnswer: String(filled.length),
        inputMode: "numeric",
        hint: "Count every shaded square.",
        explanation: `There are ${filled.length} shaded squares, each worth 1 cm², so the estimated area is about ${filled.length} cm².`,
      };
    }

    if (branch === "half-factor-categorize") {
      const chosen = shuffle(rng, AREA_TASK_DESCRIPTIONS).slice(0, 8);
      const items = chosen.map((d, i) => ({ id: `d${i}`, label: d.text }));
      const buckets = [
        { id: "half", label: "Needs the ½ factor" },
        { id: "nohalf", label: "Doesn't need the ½ factor" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((d, i) => (correctBucket[`d${i}`] = d.needsHalf ? "half" : "nohalf"));
      return {
        kind: "categorize",
        prompt: "Sort each area task by whether its shape's area formula needs to be multiplied by ½.",
        items,
        buckets,
        correctBucket,
        hint: "Only triangles use ½ × base × height. Rectangles and squares just multiply two sides.",
        explanation: chosen.map((d) => `"${d.text}" ${d.needsHalf ? "needs ½ (it's a triangle)" : "does not need ½ (it's a rectangle or square)"}`).join("; ") + ".",
      };
    }

    if (branch === "shape-formula-match") {
      const pairs = [
        { shape: "Triangle", formula: "½ × base × height" },
        { shape: "Rectangle", formula: "length × width" },
        { shape: "Square", formula: "side × side" },
        { shape: "Circle (estimate)", formula: "count the shaded unit squares" },
      ];
      const tokens = pairs.map((p, i) => ({ id: `s${i}`, label: p.shape }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `f${i}`, label: p.formula })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((p, i) => (correctMap[`f${i}`] = `s${i}`));
      return {
        kind: "click-match",
        prompt: "Match each shape to how its area is found.",
        tokens,
        targets,
        correctMap,
        hint: "Only the triangle's formula includes a ½ factor; a circle's area is estimated by counting squares, not by a simple formula at this stage.",
        explanation: pairs.map((p) => `${p.shape}: ${p.formula}`).join("; ") + ".",
      };
    }

    // order-circle-area
    const radii = pickDistinctRadii(rng, 4);
    const items = radii.map((r, i) => ({ id: `r${i}`, label: `radius ${r} cm` }));
    const sortedIdx = radii.map((_, i) => i).sort((a, b) => radii[a] - radii[b]);
    return {
      kind: "ordering",
      prompt: "Arrange these circles from smallest to largest area.",
      instruction: "Click them in order, smallest area first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `r${i}`),
      hint: "A bigger radius always means a bigger area — you can compare radii directly.",
      explanation: `In order: ${sortedIdx.map((i) => `radius ${radii[i]} cm (area ≈ ${Math.round((22 / 7) * radii[i] * radii[i])} cm²)`).join(", ")}.`,
    };
  },
};

function pickDistinctRadii(rng: RNG, count: number): number[] {
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randInt(rng, 3, 12));
  return shuffle(rng, Array.from(seen));
}
