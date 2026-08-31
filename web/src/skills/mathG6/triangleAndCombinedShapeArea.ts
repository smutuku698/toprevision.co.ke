import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Area of a triangle = ½ × base × height (established from cutting a rectangle along its diagonal).
// Area of a combined shape = sum of the areas of its rectangle and triangle parts.

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// 31 real-world triangular contexts.
const TRIANGLE_CONTEXTS = [
  "a triangular flower bed",
  "a triangular school notice board",
  "the triangular gable end of a simple roof",
  "a triangular national flag panel",
  "a small triangular dhow sail",
  "a triangular chapati/samosa packaging label",
  "a triangular road warning sign",
  "a triangular plot of land at a road junction",
  "a triangular parade banner",
  "a triangular kite",
  "a triangular metal support bracket",
  "a triangular roof truss",
  "a triangular pizza-slice display board",
  "a triangular bunting flag",
  "a triangular road hazard sign",
  "a triangular garden bed border",
  "a triangular sandwich-board (A-frame) sign",
  "a triangular end of a market stall roof",
  "a triangular wall decoration",
  "a triangular school badge",
  "a triangular flowerbed edging",
  "a triangular section of a kitchen garden",
  "a triangular paving slab",
  "a triangular metal gusset plate",
  "a triangular tent side panel",
  "a triangular market-stall canopy end",
  "a triangular paving stone",
  "a triangular brace for a water tank stand",
  "a triangular fence gusset",
  "a triangular section of a billboard",
  "a triangular play-area floor marking",
] as const;

// 30 real-world combined rectangle + triangle contexts (a wall/base topped with a gable-style roof).
const COMBINED_CONTEXTS = [
  "a garden shed's end wall",
  "a dog kennel's front wall",
  "a tent's side panel",
  "a barn's end wall",
  "a bus-stop shelter's end wall",
  "a chicken coop's end wall",
  "a workshop's gable end",
  "a greenhouse's end wall",
  "a garage's end wall",
  "a warehouse's gable end",
  "a church hall's end wall",
  "a market stall's canopy end",
  "a house's gable end",
  "a granary's end wall",
  "a cattle shed's end wall",
  "a village store's end wall",
  "a roadside kiosk's end wall",
  "a goat pen's end wall",
  "a maize store's gable end",
  "a milking parlour's end wall",
  "a piggery's end wall",
  "a nursery classroom's end wall",
  "a borehole pump house's end wall",
  "a water tank house's end wall",
  "a tool shed's end wall",
  "a poultry house's end wall",
  "a rabbit hutch's end wall",
  "a car port's end wall",
  "a bicycle shed's end wall",
  "a farm produce store's end wall",
] as const;

export const triangleAndCombinedShapeArea: Skill = {
  id: "g6-math-m-triangle-combined-area",
  code: "M.3",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Area of triangles and combined shapes",
  description: "Work out the area of triangles using ½ × base × height, solve for a missing base or height, and find the area of combined shapes made of rectangles and triangles.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "triangle-forward",
        "triangle-classical",
        "reverse-height",
        "reverse-base",
        "combined-shape",
        "click-match",
        "order-area",
        "categorize-area",
      ] as const
    );

    if (branch === "triangle-forward") {
      const base = randInt(rng, 6, 40);
      const height = randInt(rng, 4, 30);
      const area = (base * height) / 2;
      const ctx = randChoice(rng, TRIANGLE_CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `${ctx[0].toUpperCase()}${ctx.slice(1)} has a base of ${base} cm and a perpendicular height of ${height} cm. Find its area.`,
        visual: { type: "right-triangle", base, height, labelBase: `${base} cm`, labelHeight: `${height} cm` },
        before: "Area =",
        after: "cm²",
        correctAnswer: fmt(area),
        inputMode: "numeric",
        hint: "Area of a triangle = ½ × base × height.",
        explanation: `Area $= \\frac{1}{2} \\times ${base} \\times ${height} = ${fmt(area)}$ cm².`,
      };
    }

    if (branch === "triangle-classical") {
      const base = randInt(rng, 4, 50);
      const height = randInt(rng, 4, 36);
      const area = (base * height) / 2;
      return {
        kind: "fill-blank",
        prompt: `Find the area of a triangle with base ${base} cm and height ${height} cm.`,
        visual: { type: "right-triangle", base, height, labelBase: `${base} cm`, labelHeight: `${height} cm` },
        before: "Area =",
        after: "cm²",
        correctAnswer: fmt(area),
        inputMode: "numeric",
        hint: "Area of a triangle = ½ × base × height.",
        explanation: `Area $= \\frac{1}{2} \\times ${base} \\times ${height} = ${fmt(area)}$ cm².`,
      };
    }

    if (branch === "reverse-height") {
      const base = randInt(rng, 4, 30);
      const height = randInt(rng, 4, 24);
      const area = (base * height) / 2;
      const ctx = randChoice(rng, TRIANGLE_CONTEXTS);
      const wrong = [String(height * 2), String(Math.round(area / base)), String(height + base)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(height), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${ctx[0].toUpperCase()}${ctx.slice(1)} has an area of ${fmt(area)} cm² and a base of ${base} cm. Find its perpendicular height.`,
        choices: choices.map((c) => `${c} cm`),
        correctIndex,
        layout: "row",
        hint: "Rearrange the formula: height = (2 × area) ÷ base.",
        explanation: `height $= (2 \\times ${fmt(area)}) \\div ${base} = ${height}$ cm. (Forgetting to double the area first, or dividing by height instead of base, gives the wrong distractors.)`,
      };
    }

    if (branch === "reverse-base") {
      const base = randInt(rng, 4, 30);
      const height = randInt(rng, 4, 24);
      const area = (base * height) / 2;
      const ctx = randChoice(rng, TRIANGLE_CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `${ctx[0].toUpperCase()}${ctx.slice(1)} has an area of ${fmt(area)} cm² and a perpendicular height of ${height} cm. Find its base.`,
        before: "Base =",
        after: "cm",
        correctAnswer: String(base),
        inputMode: "numeric",
        hint: "Rearrange the formula: base = (2 × area) ÷ height.",
        explanation: `base $= (2 \\times ${fmt(area)}) \\div ${height} = ${base}$ cm.`,
      };
    }

    if (branch === "combined-shape") {
      const width = randInt(rng, 6, 26);
      const rectHeight = randInt(rng, 4, 20);
      const triHeight = randInt(rng, 3, 16);
      const rectArea = width * rectHeight;
      const triArea = (width * triHeight) / 2;
      const totalArea = rectArea + triArea;
      const ctx = randChoice(rng, COMBINED_CONTEXTS);
      return {
        kind: "fill-blank",
        prompt: `${ctx[0].toUpperCase()}${ctx.slice(1)} is shaped like a rectangle ${width} cm wide and ${rectHeight} cm tall, topped by a triangular part with the same ${width} cm base and a height of ${triHeight} cm. Find the total area of the whole shape.`,
        visual: { type: "rectangle", width, height: rectHeight, labelWidth: `${width} cm`, labelHeight: `${rectHeight} cm` },
        before: "Total area =",
        after: "cm²",
        correctAnswer: fmt(totalArea),
        inputMode: "numeric",
        hint: "Find the rectangle's area and the triangle's area separately, then add them.",
        explanation: `Rectangle area $= ${width} \\times ${rectHeight} = ${rectArea}$ cm². Triangle area $= \\frac{1}{2} \\times ${width} \\times ${triHeight} = ${fmt(triArea)}$ cm². Total $= ${rectArea} + ${fmt(triArea)} = ${fmt(totalArea)}$ cm².`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctTriangles(rng, 4);
      const tokens = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: `base ${t.base} cm, height ${t.height} cm` })));
      const targets = shuffle(rng, chosen.map((t, i) => ({ id: `t${i}`, label: `${fmt((t.base * t.height) / 2)} cm²` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each triangle's base and height to its area.",
        tokens,
        targets,
        correctMap,
        hint: "Area = ½ × base × height.",
        explanation: chosen.map((t) => `base ${t.base} cm, height ${t.height} cm → area ${fmt((t.base * t.height) / 2)} cm²`).join("; ") + ".",
      };
    }

    if (branch === "order-area") {
      const chosen = pickDistinctTriangles(rng, 4);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: `base ${t.base} cm, height ${t.height} cm` }));
      const sortedIdx = chosen.map((_, i) => i).sort((a, b) => (chosen[a].base * chosen[a].height) - (chosen[b].base * chosen[b].height));
      return {
        kind: "ordering",
        prompt: "Arrange these triangles from smallest to largest area.",
        instruction: "Click them in order, smallest area first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `t${i}`),
        hint: "Work out ½ × base × height for each triangle before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `base ${chosen[i].base} cm, height ${chosen[i].height} cm (area ${fmt((chosen[i].base * chosen[i].height) / 2)} cm²)`).join(", ")}.`,
      };
    }

    // categorize-area
    const threshold = randChoice(rng, [50, 100, 150, 200] as const);
    const chosen = pickDistinctTriangles(rng, 6);
    const items = chosen.map((t, i) => ({ id: `t${i}`, label: `base ${t.base} cm, height ${t.height} cm` }));
    const buckets = [
      { id: "over", label: `Area over ${threshold} cm²` },
      { id: "under", label: `Area ${threshold} cm² or less` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((t, i) => (correctBucket[`t${i}`] = (t.base * t.height) / 2 > threshold ? "over" : "under"));
    return {
      kind: "categorize",
      prompt: `Sort each triangle by whether its area is over ${threshold} cm², or ${threshold} cm² and under.`,
      items,
      buckets,
      correctBucket,
      hint: "Work out ½ × base × height for each triangle, then compare to the threshold.",
      explanation: chosen.map((t) => `base ${t.base} cm, height ${t.height} cm: area = ${fmt((t.base * t.height) / 2)} cm²`).join("; ") + ".",
    };
  },
};

function pickDistinctTriangles(rng: RNG, count: number) {
  const seen = new Set<number>();
  const result: { base: number; height: number }[] = [];
  while (result.length < count) {
    const base = randInt(rng, 4, 36);
    const height = randInt(rng, 4, 28);
    const area = base * height;
    if (!seen.has(area)) {
      seen.add(area);
      result.push({ base, height });
    }
  }
  return result;
}
