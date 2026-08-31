import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { AREA_SURFACE_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// Area of a rectangle or square = length x width, measured in cm². Rectangles and squares only —
// no triangles, combined shapes or circles at this grade (see curriculum-reference scope note).

function fillCtx(ctx: string, rng: RNG): string {
  return ctx.replace("{place}", place(rng));
}

export const areaOfRectanglesAndSquares: Skill = {
  id: "g5-math-m-area",
  code: "M.3",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Area of rectangles and squares",
  description: "Identify the square centimetre as a unit of area, and work out the area of rectangles and squares as length x width, in real-life Kenyan situations.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "unit-mc",
        "rectangle-area-fill",
        "square-area-fill",
        "missing-dimension-mc",
        "counting-squares",
        "click-match",
        "ordering",
        "categorize",
      ] as const
    );

    if (branch === "unit-mc") {
      const prompts = [
        "Which unit is used to measure the area of a surface like a table top?",
        "What unit do we use for area?",
        "Which of these is a unit for measuring area, not length?",
        "To measure how much surface a rectangle covers, which unit is used?",
        "Which unit correctly measures area?",
        "Area is measured using which unit?",
        "Which unit tells us how much surface something covers?",
        "When covering a surface with 1 cm by 1 cm squares, what unit describes the total?",
        "Which unit is correct for the area of a school flag?",
        "Which of these units measures area rather than length or volume?",
        "Pick the correct unit for measuring the area of a floor tile.",
        "Which unit should be used to state the area of a garden plot?",
      ];
      // Misconceptions: cm confuses area with a length unit; cm³ confuses it with volume; m² is the right
      // idea (a squared unit) but the wrong scale for classroom-sized objects.
      const wrong = ["cm", "cm³", "m²"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "cm²", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "row",
        hint: "Area is a squared unit — think of covering a surface with 1 cm by 1 cm squares.",
        explanation: "cm² (square centimetres) measures area. cm measures length only (not squared), cm³ measures volume, and m² is a squared unit but too large a scale for small classroom objects.",
      };
    }

    if (branch === "rectangle-area-fill") {
      const surface = randChoice(rng, AREA_SURFACE_CONTEXTS);
      const label = fillCtx(surface, rng);
      const length = randInt(rng, 4, 22);
      const width = randInt(rng, 3, 18);
      const area = length * width;
      const openers = [
        `${label[0].toUpperCase()}${label.slice(1)} is shaped like a rectangle, ${length} cm long and ${width} cm wide.`,
        `A rectangle representing ${label} measures ${length} cm by ${width} cm.`,
        `${label[0].toUpperCase()}${label.slice(1)} has a length of ${length} cm and a width of ${width} cm.`,
        `The rectangular shape of ${label} is ${length} cm long and ${width} cm wide.`,
        `${label[0].toUpperCase()}${label.slice(1)} measures ${length} cm in length and ${width} cm in width.`,
      ];
      const closers = [
        "What is its area?",
        "Find its area.",
        "Work out the area of this surface.",
        "Calculate the area.",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        visual: { type: "rectangle", width: length, height: width },
        before: "Area =",
        after: "cm²",
        correctAnswer: String(area),
        inputMode: "numeric",
        hint: "Area of a rectangle = length × width.",
        explanation: `Area = ${length} × ${width} = ${area} cm².`,
      };
    }

    if (branch === "square-area-fill") {
      const surface = randChoice(rng, AREA_SURFACE_CONTEXTS);
      const label = fillCtx(surface, rng);
      const side = randInt(rng, 3, 20);
      const area = side * side;
      const openers = [
        `${label[0].toUpperCase()}${label.slice(1)} is a square with each side measuring ${side} cm.`,
        `A square shape for ${label} has sides of ${side} cm.`,
        `${label[0].toUpperCase()}${label.slice(1)} is square-shaped, ${side} cm on every side.`,
        `The square outline of ${label} measures ${side} cm along each side.`,
        `${label[0].toUpperCase()}${label.slice(1)} is a square measuring ${side} cm by ${side} cm.`,
      ];
      const closers = [
        "What is its area?",
        "Find its area.",
        "Work out the area of this square.",
        "Calculate the area.",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        visual: { type: "rectangle", width: side, height: side },
        before: "Area =",
        after: "cm²",
        correctAnswer: String(area),
        inputMode: "numeric",
        hint: "Area of a square = side × side.",
        explanation: `Area = ${side} × ${side} = ${area} cm².`,
      };
    }

    if (branch === "missing-dimension-mc") {
      const length = randInt(rng, 5, 20);
      const width = randInt(rng, 4, 18);
      const area = length * width;
      const surface = randChoice(rng, AREA_SURFACE_CONTEXTS);
      const label = fillCtx(surface, rng);
      // Misconception distractors: adding length to itself instead of dividing, halving the area instead
      // of dividing by length, and a small off-by-a-bit slip.
      const wrong = [String(width + 3), String(Math.max(1, Math.round(area / 2))), String(Math.max(1, width - 2))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(width), wrong, 3);
      const prompts = [
        `${label[0].toUpperCase()}${label.slice(1)} is a rectangle with an area of ${area} cm² and a length of ${length} cm. What is its width?`,
        `A rectangle has area ${area} cm² and length ${length} cm. Find its width.`,
        `${label[0].toUpperCase()}${label.slice(1)} covers ${area} cm² and is ${length} cm long. How wide is it?`,
        `Given a rectangle of area ${area} cm² and length ${length} cm, what is the width?`,
        `A rectangular surface of ${label} has area ${area} cm² and length ${length} cm. Find the width.`,
        `If a rectangle's area is ${area} cm² and its length is ${length} cm, what must its width be?`,
        `${label[0].toUpperCase()}${label.slice(1)} has an area of ${area} cm². Its length is ${length} cm. Work out the width.`,
        `A rectangle measuring ${length} cm long has an area of ${area} cm². Find its width.`,
        `Find the missing width of a rectangle with area ${area} cm² and length ${length} cm.`,
        `${label[0].toUpperCase()}${label.slice(1)} is ${length} cm long with an area of ${area} cm². What width does it have?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices: choices.map((c) => `${c} cm`),
        correctIndex,
        layout: "row",
        hint: "Rearrange: width = area ÷ length.",
        explanation: `Width = ${area} ÷ ${length} = ${width} cm. (Halving the area instead of dividing by the length, or adjusting the length instead, gives the wrong distractors.)`,
      };
    }

    if (branch === "counting-squares") {
      const rows = randInt(rng, 3, 7);
      const cols = randInt(rng, 3, 8);
      const filled: [number, number][] = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) filled.push([r, c]);
      const total = rows * cols;
      const prompts = [
        `This surface is covered edge to edge with 1 cm by 1 cm squares, arranged in ${rows} rows of ${cols}. How many 1 cm² squares cover it in total?`,
        `Each cell in this grid is exactly 1 cm by 1 cm. There are ${rows} rows and ${cols} squares in every row. How many 1 cm² squares are there altogether?`,
        `A surface is fully covered with 1 cm² unit squares, ${rows} rows deep and ${cols} squares across. Count the total number of unit squares.`,
        `If you covered this shape with 1 cm by 1 cm cut-outs, you would need ${rows} rows of ${cols} squares each. How many squares in total, and so what is the area in cm²?`,
        `This shape is built from 1 cm² unit squares: ${rows} rows, each with ${cols} squares. What is the total count of unit squares — the area in cm²?`,
        `Counting 1 cm² squares row by row: there are ${cols} squares in each of ${rows} rows. What is the total, in cm²?`,
        `A rectangle is tiled completely with 1 cm by 1 cm squares — ${rows} rows of ${cols}. Find the total number of squares, which is the area in cm².`,
        `Every square in this grid measures 1 cm by 1 cm. With ${rows} rows and ${cols} columns, how many squares (and so how many cm²) does it take to cover the shape?`,
        `To find the area, count the unit squares: ${rows} rows, ${cols} squares per row. What is the total in cm²?`,
        `This surface is made of 1 cm² squares arranged in ${rows} rows of ${cols} each. How many unit squares cover it altogether?`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, prompts),
        visual: { type: "grid-shape", rows, cols, filled },
        before: "Total unit squares =",
        after: "cm²",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Count the squares in one row, then multiply by the number of rows — this is exactly why area = length × width.",
        explanation: `${rows} rows × ${cols} squares per row = ${total} unit squares, so the area is ${total} cm². This shows why the area of a rectangle equals length × width: multiplying the number of unit squares in a row by the number of rows counts every square without counting one by one.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctRectangles(rng, 4);
      const tokens = shuffle(rng, chosen.map((r, i) => ({ id: `r${i}`, label: `${r.l} cm × ${r.w} cm` })));
      const targets = shuffle(rng, chosen.map((r, i) => ({ id: `r${i}`, label: `${r.l * r.w} cm²` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`r${i}`] = `r${i}`));
      const prompts = [
        "Match each rectangle's dimensions to its area.",
        "Pair each length-and-width pair with its correct area.",
        "Match each rectangle to its area in cm².",
        "Click to match each set of dimensions to its area.",
        "Find the correct area for each rectangle's dimensions.",
        "Match each rectangle card to its area value.",
        "Pair up each rectangle with its calculated area.",
        "Connect each length × width pair to its area.",
        "Match every rectangle's size to its area.",
        "Line up each rectangle with the area it covers.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Multiply the length by the width.",
        explanation: chosen.map((r) => `${r.l} cm × ${r.w} cm = ${r.l * r.w} cm²`).join("; ") + ".",
      };
    }

    if (branch === "ordering") {
      const chosen = pickDistinctRectangles(rng, 4);
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: `${r.l} cm × ${r.w} cm` }));
      const sortedIdx = chosen.map((_, i) => i).sort((a, b) => chosen[a].l * chosen[a].w - chosen[b].l * chosen[b].w);
      const prompts = [
        "Arrange these rectangles from smallest to largest area.",
        "Order these rectangles by area, smallest first.",
        "Put these rectangles in order of area, smallest to largest.",
        "Rank these rectangles from smallest to largest area.",
        "Sort these rectangles into order by area, smallest first.",
        "Sequence these rectangles from smallest area to largest.",
        "Line up these rectangles from the smallest area to the largest.",
        "Place these rectangles in order, starting with the smallest area.",
        "Which rectangle has the smallest area? Order them all from there.",
        "Arrange these shapes from smallest to largest area.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest area first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `r${i}`),
        hint: "Multiply length by width for each rectangle before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${chosen[i].l} cm × ${chosen[i].w} cm (${chosen[i].l * chosen[i].w} cm²)`).join(", ")}.`,
      };
    }

    // categorize
    const threshold = randChoice(rng, [50, 100, 150, 200] as const);
    const chosen = pickDistinctRectangles(rng, 6);
    const items = chosen.map((r, i) => ({ id: `r${i}`, label: `${r.l} cm × ${r.w} cm` }));
    const buckets = [
      { id: "under", label: `Less than ${threshold} cm²` },
      { id: "over", label: `${threshold} cm² or more` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.l * r.w < threshold ? "under" : "over"));
    const catPrompts = [
      `Sort each rectangle by whether its area is less than ${threshold} cm², or ${threshold} cm² or more.`,
      `Group each rectangle as under ${threshold} cm², or ${threshold} cm² and above.`,
      `Classify each rectangle by its area: below ${threshold} cm², or ${threshold} cm² and up.`,
      `Sort these rectangles into two groups using ${threshold} cm² as the cut-off.`,
      `Organise each rectangle by whether its area is under ${threshold} cm².`,
      `Decide whether each rectangle's area is less than ${threshold} cm², or not.`,
      `Place each rectangle in the correct group based on the ${threshold} cm² cut-off.`,
      `Sort these rectangles by area, using ${threshold} cm² as the dividing line.`,
      `Which rectangles have an area under ${threshold} cm²? Sort them all.`,
      `Categorise each rectangle as under ${threshold} cm², or ${threshold} cm² or more.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Multiply length by width for each rectangle, then compare to the threshold.",
      explanation: chosen.map((r) => `${r.l} cm × ${r.w} cm = ${r.l * r.w} cm²`).join("; ") + ".",
    };
  },
};

function pickDistinctRectangles(rng: RNG, count: number): { l: number; w: number }[] {
  const seen = new Set<string>();
  const result: { l: number; w: number }[] = [];
  while (result.length < count) {
    const l = randInt(rng, 3, 20);
    const w = randInt(rng, 3, 18);
    const key = `${l}x${w}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ l, w });
    }
  }
  return result;
}
