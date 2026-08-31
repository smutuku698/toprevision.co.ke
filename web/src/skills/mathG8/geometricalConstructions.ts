import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const POLYGON_NAMES: Record<number, string> = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon" };
const SIDES = [3, 4, 5, 6] as const;

export const geometricalConstructions: Skill = {
  id: "g8-math-ge-geometrical-constructions",
  code: "GE.1",
  subjectId: "math",
  strandId: "g8-math-geometry",
  grade: 8,
  title: "Angle properties of polygons",
  description: "Find the angle sum, interior angle, and exterior angle of polygons up to a hexagon, and understand the steps of geometrical construction.",
  generate(rng) {
    const branch = randChoice(rng, ["angle-sum", "missing-angle", "regular-interior", "exterior-sides", "regular-sort", "construction-steps", "protractor-measure"] as const);

    if (branch === "protractor-measure") {
      const angle = randInt(rng, 20, 160);
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

    if (branch === "missing-angle") {
      // A genuinely harder reverse problem: given all-but-one interior angle
      // of a polygon, find the missing one — requires the sum formula AND
      // multi-term subtraction, not just a formula lookup.
      const sides = randChoice(rng, [4, 5, 6] as const);
      const total = (sides - 2) * 180;
      const missing = randInt(rng, 60, 150);
      const remaining = total - missing;
      const knownCount = sides - 1;
      const base = Math.floor(remaining / knownCount);
      const knownAngles: number[] = [];
      let runningSum = 0;
      for (let i = 0; i < knownCount - 1; i++) {
        const jitter = randInt(rng, -10, 10);
        const a = base + jitter;
        knownAngles.push(a);
        runningSum += a;
      }
      knownAngles.push(remaining - runningSum);
      const knownSum = knownAngles.reduce((s, a) => s + a, 0);
      return {
        kind: "fill-blank",
        prompt: `A ${POLYGON_NAMES[sides]} has interior angles of ${knownAngles.map((a) => `${a}°`).join(", ")}, and one more unknown angle. Find the missing angle.`,
        visual: { type: "polygon", sides, label: POLYGON_NAMES[sides] },
        before: "Missing angle =",
        after: "°",
        correctAnswer: String(missing),
        inputMode: "numeric",
        hint: `First find the total angle sum for a ${sides}-sided shape, then subtract the known angles.`,
        explanation: `Angle sum for a ${POLYGON_NAMES[sides]} $= (${sides}-2)\\times180 = ${total}°$. Known angles add up to $${knownAngles.join(" + ")} = ${knownSum}°$. Missing angle $= ${total} - ${knownSum} = ${missing}°$.`,
      };
    }

    if (branch === "angle-sum") {
      const sides = randChoice(rng, SIDES);
      const sum = (sides - 2) * 180;
      return {
        kind: "fill-blank",
        prompt: `Find the sum of the interior angles of a ${POLYGON_NAMES[sides]} (${sides} sides).`,
        visual: { type: "polygon", sides, label: POLYGON_NAMES[sides] },
        before: "Sum =",
        after: "°",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Sum of interior angles $= (n - 2) \\times 180°$, where n is the number of sides.",
        explanation: `Sum $= (${sides} - 2) \\times 180 = ${sides - 2} \\times 180 = ${sum}°$.`,
      };
    }

    if (branch === "regular-interior") {
      const sides = randChoice(rng, SIDES);
      const sum = (sides - 2) * 180;
      const each = sum / sides;
      return {
        kind: "fill-blank",
        prompt: `Find the size of each interior angle of a regular ${POLYGON_NAMES[sides]}.`,
        visual: { type: "polygon", sides, label: `regular ${POLYGON_NAMES[sides]}` },
        before: "Each angle =",
        after: "°",
        correctAnswer: String(each),
        inputMode: "numeric",
        hint: "For a regular polygon, divide the angle sum equally among all the angles.",
        explanation: `Angle sum $= (${sides}-2)\\times180 = ${sum}°$. Each interior angle $= ${sum} \\div ${sides} = ${each}°$ (since all angles are equal in a regular polygon).`,
      };
    }

    if (branch === "exterior-sides") {
      const sides = randChoice(rng, SIDES);
      const exterior = 360 / sides;
      const askExterior = rng() < 0.5;
      if (askExterior) {
        const wrongCandidates = [String(exterior * 2), String(exterior / 2), String(360 - exterior), String(exterior + sides)];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, `${exterior}°`, wrongCandidates.map((c) => `${c}°`));
        return {
          kind: "multiple-choice",
          prompt: `What is the exterior angle of a regular ${POLYGON_NAMES[sides]}?`,
          visual: { type: "polygon", sides },
          choices,
          correctIndex,
          layout: "row",
          hint: "Exterior angle $= 360° \\div n$.",
          explanation: `Exterior angle $= 360 \\div ${sides} = ${exterior}°$.`,
        };
      }
      const wrongCandidates = [String(sides + 1), String(sides - 1), String(sides * 2)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(sides), wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `A regular polygon has an exterior angle of ${exterior}°. How many sides does it have?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Number of sides $= 360° \\div \\text{exterior angle}$.",
        explanation: `Number of sides $= 360 \\div ${exterior} = ${sides}$ — a regular ${POLYGON_NAMES[sides]}.`,
      };
    }

    if (branch === "regular-sort") {
      const regularExamples = ["a stop sign (regular octagon)", "floor tiles that are all identical squares", "a honeycomb cell (regular hexagon)", "an equilateral triangular road sign"];
      const irregularExamples = ["a house floor plan with an L-shape", "an arrowhead-shaped road sign", "a star-shaped flower bed", "an irregular plot of farmland with 5 unequal sides"];
      const chosenRegular = shuffle(rng, regularExamples).slice(0, 3);
      const chosenIrregular = shuffle(rng, irregularExamples).slice(0, 3);
      const items = shuffle(rng, [...chosenRegular, ...chosenIrregular]).map((label, i) => ({ id: `p${i}-${label}`, label }));
      const buckets = [
        { id: "regular", label: "Regular polygon (equal sides & angles)" },
        { id: "irregular", label: "Irregular polygon" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = chosenRegular.includes(item.label) ? "regular" : "irregular";
      return {
        kind: "categorize",
        prompt: "Sort each shape by whether it is a regular polygon.",
        items,
        buckets,
        correctBucket,
        hint: "A regular polygon has all sides equal in length AND all interior angles equal.",
        explanation: `Regular: ${chosenRegular.join(", ")}. Irregular: ${chosenIrregular.join(", ")}.`,
      };
    }

    // construction-steps: order the steps to construct a perpendicular bisector of a line
    const steps = [
      { id: "s1", label: "Open the compass to more than half the length of the line" },
      { id: "s2", label: "Place the compass point on one end of the line and draw an arc above and below it" },
      { id: "s3", label: "Without changing the compass width, repeat from the other end of the line" },
      { id: "s4", label: "Join the two points where the arcs cross with a straight line" },
    ];
    return {
      kind: "ordering",
      prompt: "Put these steps for constructing the perpendicular bisector of a line in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "You set the compass width first, then draw arcs from each end, then join where they cross.",
      explanation: "Perpendicular bisector construction: (1) set the compass width, (2) arc from one end, (3) arc from the other end with the same width, (4) join the two crossing points — that line is perpendicular to, and bisects, the original.",
    };
  },
};
