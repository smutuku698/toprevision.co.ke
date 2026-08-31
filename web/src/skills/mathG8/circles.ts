import { randChoice, randInt, roundTo, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ANGLES = [30, 45, 60, 90, 120, 150, 180, 270] as const;
const REAL_OBJECTS = ["a bicycle wheel", "a running track's inner circle", "a water tank's lid", "a round table top", "a football field's centre circle"];

export const circles: Skill = {
  id: "g8-math-me-circles",
  code: "ME.1",
  subjectId: "math",
  strandId: "g8-math-measurements",
  grade: 8,
  title: "Circles: circumference, arcs, and sectors",
  description: "Find the circumference of a circle, the length of an arc, and the perimeter of a sector in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["circumference", "reverse-radius", "arc-length", "sector-perimeter", "compare", "match", "circumference-sort"] as const);

    if (branch === "circumference") {
      const radius = randInt(rng, 5, 45);
      const object = randChoice(rng, REAL_OBJECTS);
      const precise = 2 * 3.14 * radius;
      const answer = roundTo(precise, 1).toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `${object[0].toUpperCase()}${object.slice(1)} has a radius of ${radius} cm. Find its circumference. Use $\\pi \\approx 3.14$.`,
        visual: { type: "circle-shape", radius },
        before: "Circumference =",
        after: "cm",
        correctAnswer: answer,
        acceptedAnswers: [precise.toFixed(2)],
        inputMode: "numeric",
        hint: "Circumference $= 2\\pi r$.",
        explanation: `Circumference $= 2 \\times 3.14 \\times ${radius} = ${answer}$ cm.`,
      };
    }

    if (branch === "reverse-radius") {
      // Inverse problem: given the circumference, find the radius — forces
      // division, not just plugging into the formula forward.
      const radius = randInt(rng, 5, 40);
      const circumference = Math.round(2 * 3.14 * radius);
      const object = randChoice(rng, REAL_OBJECTS);
      return {
        kind: "fill-blank",
        prompt: `${object[0].toUpperCase()}${object.slice(1)} has a circumference of ${circumference} cm. Find its radius, to the nearest whole number. Use $\\pi \\approx 3.14$.`,
        before: "Radius ≈",
        after: "cm",
        correctAnswer: String(radius),
        inputMode: "numeric",
        hint: "Rearrange $C = 2\\pi r$ to get $r = \\dfrac{C}{2\\pi}$.",
        explanation: `$r = \\dfrac{C}{2\\pi} = \\dfrac{${circumference}}{2 \\times 3.14} = \\dfrac{${circumference}}{6.28} \\approx ${radius}$ cm.`,
      };
    }

    if (branch === "arc-length") {
      const radius = randInt(rng, 4, 30);
      const angle = randChoice(rng, ANGLES);
      const precise = (angle / 360) * 2 * 3.14 * radius;
      const answer = roundTo(precise, 1).toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `A circle has radius ${radius} cm. Find the length of an arc with angle ${angle}°. Use $\\pi \\approx 3.14$.`,
        visual: { type: "circle-sector", radius, angleDeg: angle },
        before: "Arc length =",
        after: "cm",
        correctAnswer: answer,
        acceptedAnswers: [precise.toFixed(2)],
        inputMode: "numeric",
        hint: "Arc length $= \\frac{\\theta}{360} \\times 2\\pi r$.",
        explanation: `Arc length $= \\frac{${angle}}{360} \\times 2 \\times 3.14 \\times ${radius} = ${answer}$ cm.`,
      };
    }

    if (branch === "sector-perimeter") {
      const radius = randInt(rng, 4, 30);
      const angle = randChoice(rng, ANGLES);
      const arcPrecise = (angle / 360) * 2 * 3.14 * radius;
      const perimeter = 2 * radius + arcPrecise;
      const answer = roundTo(perimeter, 1).toFixed(1);
      return {
        kind: "fill-blank",
        prompt: `A sector of a circle has radius ${radius} cm and angle ${angle}°. Find the perimeter of the sector (the two straight radii plus the arc). Use $\\pi \\approx 3.14$.`,
        visual: { type: "circle-sector", radius, angleDeg: angle },
        before: "Perimeter =",
        after: "cm",
        correctAnswer: answer,
        acceptedAnswers: [perimeter.toFixed(2)],
        inputMode: "numeric",
        hint: "Perimeter of a sector = two radii + the arc length.",
        explanation: `Arc length $= \\frac{${angle}}{360} \\times 2 \\times 3.14 \\times ${radius} = ${arcPrecise.toFixed(2)}$ cm. Perimeter $= ${radius} + ${radius} + ${arcPrecise.toFixed(2)} = ${answer}$ cm.`,
      };
    }

    if (branch === "compare") {
      const r1 = randInt(rng, 3, 15);
      let r2 = randInt(rng, 3, 15);
      while (r2 === r1) r2 = randInt(rng, 3, 15);
      const bigger = r1 > r2 ? "A" : "B";
      return {
        kind: "multiple-choice",
        prompt: `Circle A has radius ${r1} cm and circle B has radius ${r2} cm. Which circle has the greater circumference?`,
        choices: ["Circle A", "Circle B", "They are equal"],
        correctIndex: bigger === "A" ? 0 : 1,
        hint: "A larger radius always means a larger circumference — they're directly proportional.",
        explanation: `Circumference is directly proportional to radius ($C = 2\\pi r$), so the circle with the larger radius (${bigger === "A" ? r1 : r2} cm) has the greater circumference.`,
      };
    }

    if (branch === "match") {
      const count = randChoice(rng, [3, 4] as const);
      const radii = sampleDistinctInts(rng, 3, 20, count);
      const tokens = radii.map((r) => ({ id: `r${r}`, label: `radius = ${r} cm` }));
      const targets = shuffle(rng, radii.map((r) => ({ id: `c${r}`, label: `${roundTo(2 * 3.14 * r, 1).toFixed(1)} cm` })));
      const correctMap: Record<string, string> = {};
      for (const r of radii) correctMap[`c${r}`] = `r${r}`;
      return {
        kind: "click-match",
        prompt: "Match each radius to the circle's circumference. Use $\\pi \\approx 3.14$.",
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Circumference $= 2\\pi r$.",
        explanation: radii.map((r) => `radius ${r} cm → circumference ${roundTo(2 * 3.14 * r, 1).toFixed(1)} cm`).join("; ") + ".",
      };
    }

    // circumference-sort: categorize circles by whether circumference exceeds a threshold
    const threshold = randChoice(rng, [30, 50, 75, 100] as const);
    const radii = new Set<number>();
    while (radii.size < 5) radii.add(randInt(rng, 3, 20));
    const items = Array.from(radii).map((r) => ({ id: `r${r}`, label: `radius ${r} cm` }));
    const buckets = [
      { id: "over", label: `Circumference > ${threshold} cm` },
      { id: "under", label: `Circumference ≤ ${threshold} cm` },
    ];
    const correctBucket: Record<string, string> = {};
    for (const r of radii) correctBucket[`r${r}`] = 2 * 3.14 * r > threshold ? "over" : "under";
    return {
      kind: "categorize",
      prompt: `Sort each circle by whether its circumference is more than ${threshold} cm. Use $\\pi \\approx 3.14$.`,
      items,
      buckets,
      correctBucket,
      hint: "Work out circumference = 2πr for each radius, then compare to the threshold.",
      explanation: Array.from(radii).map((r) => `radius ${r}: circumference = ${roundTo(2 * 3.14 * r, 1)} cm`).join("; ") + ".",
    };
  },
};
