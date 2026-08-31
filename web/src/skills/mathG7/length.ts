import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// cm, dm, m, Dm (10m), Hm (100m) — factors relative to cm.
const UNITS = [
  { name: "cm", factorFromCm: 1 },
  { name: "dm", factorFromCm: 10 },
  { name: "m", factorFromCm: 100 },
  { name: "Dm", factorFromCm: 1000 },
  { name: "Hm", factorFromCm: 10000 },
] as const;

export const length: Skill = {
  id: "g7-math-m-length",
  code: "M.2",
  subjectId: "math",
  strandId: "g7-math-measurements",
  grade: 7,
  title: "Length",
  description: "Convert units of length (cm, dm, m, Dm, Hm), perform operations, and find the perimeter of plane figures and the circumference of circles.",
  generate(rng) {
    const branch = randChoice(rng, ["convert", "perimeter", "circumference", "circumference-reverse", "compare-units", "order-lengths"] as const);

    if (branch === "convert") {
      const fromIdx = randInt(rng, 0, UNITS.length - 1);
      let toIdx = randInt(rng, 0, UNITS.length - 1);
      while (toIdx === fromIdx) toIdx = randInt(rng, 0, UNITS.length - 1);
      const from = UNITS[fromIdx];
      const to = UNITS[toIdx];
      const value = randInt(rng, 2, 90);
      const cmValue = value * from.factorFromCm;
      const converted = cmValue / to.factorFromCm;
      const answer = Number.isInteger(converted) ? String(converted) : converted.toFixed(3);
      return {
        kind: "fill-blank",
        prompt: `Convert ${value} ${from.name} to ${to.name}.`,
        before: "",
        after: to.name,
        correctAnswer: answer,
        inputMode: "numeric",
        hint: `Convert ${from.name} to cm first (× ${from.factorFromCm}), then divide by ${to.factorFromCm} to get ${to.name}.`,
        explanation: `${value} ${from.name} = ${cmValue} cm = ${answer} ${to.name}.`,
      };
    }

    if (branch === "perimeter") {
      const w = randInt(rng, 5, 40);
      const h = randInt(rng, 5, 40);
      const perimeter = 2 * (w + h);
      return {
        kind: "fill-blank",
        prompt: `A rectangular school compound is ${w} m long and ${h} m wide. Find the total length of fencing needed to go around it (the perimeter).`,
        visual: { type: "rectangle", width: w, height: h, labelWidth: `${w} m`, labelHeight: `${h} m` },
        before: "Perimeter =",
        after: "m",
        correctAnswer: String(perimeter),
        inputMode: "numeric",
        hint: "Perimeter of a rectangle = 2 × (length + width).",
        explanation: `Perimeter $= 2 \\times (${w} + ${h}) = 2 \\times ${w + h} = ${perimeter}$ m.`,
      };
    }

    if (branch === "circumference") {
      const radius = randChoice(rng, [7, 14, 21, 28, 35, 42, 49] as const); // multiples of 7 keep 22/7 exact
      const circumference = Math.round((2 * (22 / 7) * radius) * 100) / 100;
      return {
        kind: "fill-blank",
        prompt: `A circular water tank has a radius of ${radius} m. Find its circumference. (Use π ≈ 22/7)`,
        visual: { type: "circle-shape", radius, label: `${radius} m` },
        before: "Circumference =",
        after: "m",
        correctAnswer: String(circumference),
        inputMode: "numeric",
        hint: "Circumference = 2 × π × radius.",
        explanation: `Circumference $= 2 \\times \\frac{22}{7} \\times ${radius} = ${circumference}$ m.`,
      };
    }

    if (branch === "circumference-reverse") {
      const radius = randChoice(rng, [7, 14, 21, 28, 35, 42] as const);
      const circumference = Math.round(2 * (22 / 7) * radius);
      const wrong = [String(radius + 2), String(radius - 2), String(Math.round(circumference / 2)), String(radius * 2)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(radius), wrong);
      return {
        kind: "multiple-choice",
        prompt: `A circular running track has a circumference of ${circumference} m. Find its radius. (Use π ≈ 22/7)`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Rearrange: radius = circumference ÷ (2 × π).",
        explanation: `radius $= ${circumference} \\div (2 \\times \\frac{22}{7}) = ${radius}$ m.`,
      };
    }

    if (branch === "compare-units") {
      const vm = randInt(rng, 2, 9);
      const vcm = randInt(rng, 20, 900);
      const vDm = randInt(rng, 2, 9);
      const vdm = randInt(rng, 20, 90);
      const values = [
        { label: `${vm} m`, cm: vm * 100 },
        { label: `${vcm} cm`, cm: vcm },
        { label: `${vDm} Dm`, cm: vDm * 1000 },
        { label: `${vdm} dm`, cm: vdm * 10 },
      ];
      const benchmark = 500; // 5 m in cm
      const items = values.map((v, i) => ({ id: `v${i}`, label: v.label }));
      const buckets = [
        { id: "over", label: "Longer than 5 m" },
        { id: "under", label: "5 m or shorter" },
      ];
      const correctBucket: Record<string, string> = {};
      values.forEach((v, i) => (correctBucket[`v${i}`] = v.cm > benchmark ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: "Sort each length by whether it is longer than 5 m, after converting to the same unit.",
        items,
        buckets,
        correctBucket,
        hint: "Convert every length to cm first, then compare to 500 cm (5 m).",
        explanation: values.map((v) => `${v.label} = ${v.cm} cm, which is ${v.cm > benchmark ? "longer" : "not longer"} than 5 m`).join("; ") + ".",
      };
    }

    // order-lengths
    const om = randInt(rng, 2, 8);
    const ocm = randInt(rng, 100, 700);
    const oDm = randInt(rng, 1, 5);
    const odm = randInt(rng, 10, 70);
    const raw = [
      { label: `${om} m`, cm: om * 100 },
      { label: `${ocm} cm`, cm: ocm },
      { label: `${oDm} Dm`, cm: oDm * 1000 },
      { label: `${odm} dm`, cm: odm * 10 },
    ];
    const items = raw.map((v, i) => ({ id: `v${i}`, label: v.label }));
    const sortedIdx = raw.map((_, i) => i).sort((a, b) => raw[a].cm - raw[b].cm);
    return {
      kind: "ordering",
      prompt: "Arrange these lengths from shortest to longest (they use different units).",
      instruction: "Click them in order, shortest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `v${i}`),
      hint: "Convert every length to the same unit (e.g. cm) before comparing.",
      explanation: `In order: ${sortedIdx.map((i) => `${raw[i].label} (${raw[i].cm} cm)`).join(", ")}.`,
    };
  },
};
