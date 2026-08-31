import { randChoice, randInt, roundTo, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

export const area: Skill = {
  id: "g8-math-me-area",
  code: "ME.2",
  subjectId: "math",
  strandId: "g8-math-measurements",
  grade: 8,
  title: "Area, sector area, and surface area",
  description: "Find the area of a circle and sector, the surface area of cubes, cuboids, and cylinders, and the area of irregular shapes using a square grid.",
  generate(rng) {
    const branch = randChoice(rng, ["circle-area", "composite", "sector-area", "cuboid-sa", "cylinder-sa", "grid-area", "order-cuboids", "circle-area-sort"] as const);

    if (branch === "composite") {
      // A classical composite-area problem: a rectangular plate with a
      // circular hole cut out. Combines the rectangle and circle formulas
      // that are already core to this sub-strand, applied together.
      const width = randInt(rng, 12, 30);
      const height = randInt(rng, 10, 24);
      const maxRadius = Math.floor(Math.min(width, height) / 2) - 1;
      const radius = randInt(rng, 2, Math.max(2, maxRadius));
      const rectArea = width * height;
      const circleArea = 3.14 * radius * radius;
      const netPrecise = rectArea - circleArea;
      const answer = roundTo(netPrecise, 1).toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `A rectangular metal plate measuring ${width} cm by ${height} cm has a circular hole of radius ${radius} cm drilled through its centre. Find the remaining (net) area of the plate. Use $\\pi \\approx 3.14$.`,
        visual: { type: "rectangle", width, height },
        before: "Net area =",
        after: "cm²",
        correctAnswer: answer,
        acceptedAnswers: [netPrecise.toFixed(2)],
        inputMode: "numeric",
        hint: "Net area = area of the rectangle − area of the circular hole.",
        explanation: `Rectangle area $= ${width} \\times ${height} = ${rectArea}$ cm². Hole area $= 3.14 \\times ${radius}^2 = ${circleArea.toFixed(2)}$ cm². Net area $= ${rectArea} - ${circleArea.toFixed(2)} = ${answer}$ cm².`,
      };
    }

    if (branch === "circle-area") {
      const radius = randInt(rng, 3, 14);
      const precise = 3.14 * radius * radius;
      const answer = roundTo(precise, 1).toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `Find the area of a circular flower bed with radius ${radius} m. Use $\\pi \\approx 3.14$.`,
        visual: { type: "circle-shape", radius },
        before: "Area =",
        after: "m²",
        correctAnswer: answer,
        acceptedAnswers: [precise.toFixed(2)],
        inputMode: "numeric",
        hint: "Area of a circle $= \\pi r^2$.",
        explanation: `Area $= 3.14 \\times ${radius}^2 = 3.14 \\times ${radius * radius} = ${answer}$ m².`,
      };
    }

    if (branch === "sector-area") {
      const radius = randInt(rng, 4, 14);
      const angle = randChoice(rng, [30, 45, 60, 90, 120, 150, 180, 270] as const);
      const precise = (angle / 360) * 3.14 * radius * radius;
      const answer = roundTo(precise, 1).toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `A circular pizza of radius ${radius} cm is cut, and one slice has an angle of ${angle}°. Find the area of that slice. Use $\\pi \\approx 3.14$.`,
        visual: { type: "circle-sector", radius, angleDeg: angle },
        before: "Sector area =",
        after: "cm²",
        correctAnswer: answer,
        acceptedAnswers: [precise.toFixed(2)],
        inputMode: "numeric",
        hint: "Sector area $= \\frac{\\theta}{360} \\times \\pi r^2$.",
        explanation: `Sector area $= \\frac{${angle}}{360} \\times 3.14 \\times ${radius}^2 = ${answer}$ cm².`,
      };
    }

    if (branch === "cuboid-sa") {
      const isCube = rng() < 0.4;
      const length = randInt(rng, 4, 22);
      const width = isCube ? length : randInt(rng, 4, 22);
      const height = isCube ? length : randInt(rng, 4, 22);
      const sa = 2 * (length * width + width * height + length * height);
      return {
        kind: "fill-blank",
        prompt: `A ${isCube ? "cube-shaped storage box" : "cuboid-shaped storage box"} has ${isCube ? `sides of ${length} cm` : `length ${length} cm, width ${width} cm, and height ${height} cm`}. Find its total surface area.`,
        visual: isCube ? { type: "solid", shape: "cube", side: length } : { type: "solid", shape: "cuboid", length, width, height },
        before: "Surface area =",
        after: "cm²",
        correctAnswer: String(sa),
        inputMode: "numeric",
        hint: isCube ? "Surface area of a cube $= 6 \\times \\text{side}^2$." : "Surface area of a cuboid $= 2(lw + wh + lh)$.",
        explanation: isCube
          ? `Surface area $= 6 \\times ${length}^2 = 6 \\times ${length * length} = ${sa}$ cm².`
          : `Surface area $= 2(${length}\\times${width} + ${width}\\times${height} + ${length}\\times${height}) = 2(${length * width} + ${width * height} + ${length * height}) = ${sa}$ cm².`,
      };
    }

    if (branch === "cylinder-sa") {
      const radius = randInt(rng, 3, 10);
      const height = randInt(rng, 5, 20);
      const precise = 2 * 3.14 * radius * (radius + height);
      const answer = roundTo(precise, 1).toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `A cylindrical water tank has radius ${radius} m and height ${height} m. Find its total surface area (including both circular ends). Use $\\pi \\approx 3.14$.`,
        visual: { type: "solid", shape: "cylinder", radius, height },
        before: "Surface area =",
        after: "m²",
        correctAnswer: answer,
        acceptedAnswers: [precise.toFixed(2)],
        inputMode: "numeric",
        hint: "Surface area of a cylinder $= 2\\pi r(r + h)$.",
        explanation: `Surface area $= 2 \\times 3.14 \\times ${radius} \\times (${radius} + ${height}) = 2 \\times 3.14 \\times ${radius} \\times ${radius + height} = ${answer}$ m².`,
      };
    }

    if (branch === "grid-area") {
      const rows = 4;
      const cols = 5;
      const filledCount = randInt(rng, 10, 16);
      const allCells: [number, number][] = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) allCells.push([r, c]);
      const filled = shuffle(rng, allCells).slice(0, filledCount) as [number, number][];
      const unitArea = randChoice(rng, [1, 2, 4] as const);
      const answer = filledCount * unitArea;
      const wrongCandidates = [String(answer + unitArea), String(answer - unitArea), String(rows * cols * unitArea), String(filledCount)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(answer), wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `Each square on this grid represents ${unitArea} cm². Estimate the area of the shaded irregular shape by counting squares.`,
        visual: { type: "grid-shape", rows, cols, filled },
        choices: choices.map((c) => `${c} cm²`),
        correctIndex,
        layout: "grid",
        hint: `Count the shaded squares, then multiply by ${unitArea} cm² per square.`,
        explanation: `There are ${filledCount} shaded squares, each worth ${unitArea} cm², so the area $\\approx ${filledCount} \\times ${unitArea} = ${answer}$ cm².`,
      };
    }

    if (branch === "order-cuboids") {
      const count = 4;
      const boxes = Array.from({ length: count }, () => {
        const l = randInt(rng, 2, 10);
        const w = randInt(rng, 2, 10);
        const h = randInt(rng, 2, 10);
        return { l, w, h, sa: 2 * (l * w + w * h + l * h) };
      });
      const items = boxes.map((b, i) => ({ id: `b${i}`, label: `${b.l}×${b.w}×${b.h} cm` }));
      const sorted = [...boxes].sort((a, b) => a.sa - b.sa);
      return {
        kind: "ordering",
        prompt: "Order these cuboid boxes from smallest to largest total surface area.",
        instruction: "Click them in order, smallest surface area first.",
        items: shuffle(rng, items),
        correctOrder: sorted.map((b) => `b${boxes.indexOf(b)}`),
        hint: "Surface area of a cuboid = 2(lw + wh + lh) — work each one out, then compare.",
        explanation: sorted.map((b) => `${b.l}×${b.w}×${b.h} cm → SA = ${b.sa} cm²`).join("; ") + ".",
      };
    }

    // circle-area-sort: categorize circles by whether their area exceeds a threshold
    const threshold = randChoice(rng, [80, 100, 150, 200] as const);
    const radii = new Set<number>();
    while (radii.size < 5) radii.add(randInt(rng, 3, 12));
    const items = Array.from(radii).map((r) => ({ id: `r${r}`, label: `radius ${r} cm` }));
    const buckets = [
      { id: "over", label: `Area > ${threshold} cm²` },
      { id: "under", label: `Area ≤ ${threshold} cm²` },
    ];
    const correctBucket: Record<string, string> = {};
    for (const r of radii) correctBucket[`r${r}`] = 3.14 * r * r > threshold ? "over" : "under";
    return {
      kind: "categorize",
      prompt: `Sort each circle by whether its area is more than ${threshold} cm². Use $\\pi \\approx 3.14$.`,
      items,
      buckets,
      correctBucket,
      hint: "Work out area = πr² for each radius, then compare to the threshold.",
      explanation: Array.from(radii).map((r) => `radius ${r}: area = ${roundTo(3.14 * r * r, 1)} cm²`).join("; ") + ".",
    };
  },
};
