import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const POLYGON_NAMES: Record<number, string> = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon" };

export const angles: Skill = {
  id: "g7-math-g-angles",
  code: "G.1",
  subjectId: "math",
  strandId: "g7-math-geometry",
  grade: 7,
  title: "Angles",
  description: "Relate angles on a straight line, at a point, and on a transversal, solve angles in a parallelogram, and find angle properties of polygons up to a hexagon.",
  generate(rng) {
    const branch = randChoice(rng, ["protractor-measure", "angles-straight-line", "angles-at-point", "transversal", "polygon-angle-sum", "parallelogram-angles", "match-angle-types", "sort-angle-pairs"] as const);

    if (branch === "protractor-measure") {
      const angle = randInt(rng, 15, 165);
      return {
        kind: "protractor",
        mode: "measure",
        rayBAngleDeg: angle,
        correctAngleDeg: angle,
        toleranceDeg: 3,
        prompt: "Drag the blue needle to line up exactly with the red ray, then submit your reading.",
        hint: "Line the needle up on top of the red ray, then read the degree mark it points to on the scale.",
        explanation: `The red ray sits at ${angle}° on the protractor scale.`,
      };
    }

    if (branch === "angles-straight-line") {
      const a = randInt(rng, 20, 150);
      const b = 180 - a;
      return {
        kind: "fill-blank",
        prompt: `Two angles lie on a straight line. One angle is ${a}°. Find the other angle.`,
        before: "Other angle =",
        after: "°",
        correctAnswer: String(b),
        inputMode: "numeric",
        hint: "Angles on a straight line add up to 180°.",
        explanation: `$180° - ${a}° = ${b}°$.`,
      };
    }

    if (branch === "angles-at-point") {
      const a = randInt(rng, 40, 150);
      const b = randInt(rng, 40, 150);
      const c = 360 - a - b;
      return {
        kind: "fill-blank",
        prompt: `Three angles meet at a single point. Two of them are ${a}° and ${b}°. Find the third angle.`,
        before: "Third angle =",
        after: "°",
        correctAnswer: String(c),
        inputMode: "numeric",
        hint: "Angles at a point add up to 360°.",
        explanation: `$360° - ${a}° - ${b}° = ${c}°$.`,
      };
    }

    if (branch === "transversal") {
      const known = randInt(rng, 30, 150);
      const relationship = randChoice(rng, ["corresponding", "alternate", "co-interior"] as const);
      const answer = relationship === "co-interior" ? 180 - known : known;
      return {
        kind: "fill-blank",
        prompt: `A transversal crosses two parallel lines. One angle formed is ${known}°. Find its ${relationship} angle.`,
        before: `${relationship[0].toUpperCase()}${relationship.slice(1)} angle =`,
        after: "°",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: relationship === "co-interior" ? "Co-interior angles add up to 180°." : `${relationship[0].toUpperCase()}${relationship.slice(1)} angles are equal.`,
        explanation: relationship === "co-interior" ? `Co-interior angles sum to 180°: $180° - ${known}° = ${answer}°$.` : `${relationship[0].toUpperCase()}${relationship.slice(1)} angles are equal, so the answer is ${answer}°.`,
      };
    }

    if (branch === "polygon-angle-sum") {
      const sides = randChoice(rng, [3, 4, 5, 6] as const);
      const sum = (sides - 2) * 180;
      const askSum = rng() < 0.5;
      if (askSum) {
        return {
          kind: "fill-blank",
          prompt: `Find the sum of the interior angles of a ${POLYGON_NAMES[sides]} (${sides} sides).`,
          visual: { type: "polygon", sides, label: POLYGON_NAMES[sides] },
          before: "Sum =",
          after: "°",
          correctAnswer: String(sum),
          inputMode: "numeric",
          hint: "Sum of interior angles = (n − 2) × 180°.",
          explanation: `Sum $= (${sides} - 2) \\times 180 = ${sum}°$.`,
        };
      }
      // Reverse: given all-but-one interior angle, find the missing one.
      const missing = randInt(rng, 60, 150);
      const remaining = sum - missing;
      const knownCount = sides - 1;
      const base = Math.floor(remaining / knownCount);
      const knownAngles: number[] = [];
      let running = 0;
      for (let i = 0; i < knownCount - 1; i++) {
        const jitter = randInt(rng, -8, 8);
        const val = base + jitter;
        knownAngles.push(val);
        running += val;
      }
      knownAngles.push(remaining - running);
      const knownSum = knownAngles.reduce((s, a) => s + a, 0);
      return {
        kind: "fill-blank",
        prompt: `A ${POLYGON_NAMES[sides]} has interior angles ${knownAngles.map((a) => `${a}°`).join(", ")}, plus one more unknown angle. Find the missing angle.`,
        visual: { type: "polygon", sides, label: POLYGON_NAMES[sides] },
        before: "Missing angle =",
        after: "°",
        correctAnswer: String(missing),
        inputMode: "numeric",
        hint: `First find the angle sum for a ${sides}-sided shape, then subtract the known angles.`,
        explanation: `Angle sum $= (${sides}-2)\\times180 = ${sum}°$. Known angles add to $${knownAngles.join(" + ")} = ${knownSum}°$. Missing angle $= ${sum} - ${knownSum} = ${missing}°$.`,
      };
    }

    if (branch === "parallelogram-angles") {
      const angle = randInt(rng, 40, 140);
      const askType = randChoice(rng, ["opposite", "co-interior"] as const);
      const answer = askType === "opposite" ? angle : 180 - angle;
      const wrong = askType === "opposite" ? [String(180 - angle), String(angle + 10), String(angle - 10)] : [String(angle), String(angle + 10), String(90 - Math.min(angle, 89))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(answer), wrong);
      return {
        kind: "multiple-choice",
        prompt: `In a parallelogram, one angle is ${angle}°. Find the angle ${askType === "opposite" ? "directly opposite it" : "adjacent to it (next to it along a side)"}.`,
        choices: choices.map((c) => `${c}°`),
        correctIndex,
        layout: "row",
        hint: askType === "opposite" ? "Opposite angles in a parallelogram are always equal." : "Adjacent angles in a parallelogram (co-interior, between the parallel sides) always add up to 180°.",
        explanation: askType === "opposite" ? `Opposite angles in a parallelogram are equal, so the answer is ${angle}°.` : `Adjacent angles in a parallelogram sum to 180°: $180° - ${angle}° = ${answer}°$.`,
      };
    }

    if (branch === "match-angle-types") {
      const pairs = [
        { term: "Supplementary angles", meaning: "Two angles that add up to 180°" },
        { term: "Complementary angles", meaning: "Two angles that add up to 90°" },
        { term: "Vertically opposite angles", meaning: "Equal angles formed opposite each other where two lines cross" },
        { term: "Corresponding angles", meaning: "Equal angles in matching positions where a transversal crosses two parallel lines" },
        { term: "Alternate angles", meaning: "Equal angles on opposite sides of a transversal, between two parallel lines" },
      ];
      const chosen = shuffle(rng, pairs).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each angle-pair term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the definition is about a fixed total, or about position relative to lines.",
        explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    // sort-angle-pairs: categorize named angle-pair relationships
    const pairPool = [
      { label: "Two angles that add up to 180° on a straight line", type: "supplementary" },
      { label: "Two angles that add up to 90°", type: "complementary" },
      { label: "Two equal angles on the same side of a transversal, in matching corners", type: "corresponding" },
      { label: "Two equal angles on opposite sides of a transversal, between the parallel lines", type: "alternate" },
      { label: "Two angles formed by intersecting lines, opposite each other, always equal", type: "vertically opposite" },
      { label: "Two angles between parallel lines, on the same side of the transversal, adding to 180°", type: "co-interior" },
    ];
    const chosen = shuffle(rng, pairPool).slice(0, 5);
    const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.label }));
    const buckets = [
      { id: "sum-based", label: "Defined by adding to a fixed total (90°/180°)" },
      { id: "position-based", label: "Defined by their position relative to lines" },
    ];
    const sumBasedTypes = new Set(["supplementary", "complementary", "co-interior"]);
    const correctBucket: Record<string, string> = {};
    chosen.forEach((p, i) => (correctBucket[`p${i}`] = sumBasedTypes.has(p.type) ? "sum-based" : "position-based"));
    return {
      kind: "categorize",
      prompt: "Sort each angle-pair description by whether it is defined by a fixed angle total, or by its position relative to lines.",
      items,
      buckets,
      correctBucket,
      hint: "Supplementary, complementary, and co-interior angles are all defined by what they add up to. Corresponding, alternate, and vertically opposite angles are defined by position, and are equal (not summed).",
      explanation: chosen.map((p) => `"${p.label}" describes ${p.type} angles`).join("; ") + ".",
    };
  },
};
