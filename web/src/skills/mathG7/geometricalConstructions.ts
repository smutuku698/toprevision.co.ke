import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Angles constructible with ruler and compass only: multiples of 7.5° (halves of 15°, itself half of 30°).
const CONSTRUCTIBLE = [15, 22.5, 30, 45, 60, 75, 90, 105, 120, 135, 150] as const;
const NOT_CONSTRUCTIBLE = [10, 20, 40, 50, 70, 80, 100, 110] as const;

export const geometricalConstructions: Skill = {
  id: "g7-math-g-geometrical-constructions",
  code: "G.2",
  subjectId: "math",
  strandId: "g7-math-geometry",
  grade: 7,
  title: "Geometrical constructions",
  description: "Measure and bisect angles, construct 90°, 45°, 60°, 30° and other multiples of 7.5°, and construct triangles and circles using a ruler and a pair of compasses only.",
  generate(rng) {
    const branch = randChoice(rng, ["protractor-measure", "protractor-construct", "bisect", "which-constructible", "match-construction", "bisector-steps", "circle-radius"] as const);

    if (branch === "protractor-measure") {
      const angle = randInt(rng, 10, 170);
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

    if (branch === "protractor-construct") {
      const angle = randChoice(rng, CONSTRUCTIBLE);
      return {
        kind: "protractor",
        mode: "construct",
        correctAngleDeg: angle,
        toleranceDeg: 3,
        prompt: `Drag the needle to construct an angle of ${angle}° from the fixed baseline ray.`,
        hint: "Rotate the needle until the scale reading matches the target angle.",
        explanation: `An angle of ${angle}° was constructed from the baseline.`,
      };
    }

    if (branch === "bisect") {
      const angle = randChoice(rng, [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140] as const);
      const half = angle / 2;
      return {
        kind: "fill-blank",
        prompt: `An angle of ${angle}° is bisected using a ruler and a pair of compasses only. Find the size of each resulting half.`,
        before: "Each half =",
        after: "°",
        correctAnswer: String(half),
        inputMode: "numeric",
        hint: "Bisecting an angle splits it into two exactly equal halves.",
        explanation: `Bisecting ${angle}° gives two equal angles of $${angle} \\div 2 = ${half}°$ each.`,
      };
    }

    if (branch === "which-constructible") {
      const isConstructible = rng() < 0.5;
      const value = isConstructible ? randChoice(rng, CONSTRUCTIBLE) : randChoice(rng, NOT_CONSTRUCTIBLE);
      const correctText = isConstructible ? "Yes — it is a multiple of 7.5°" : "No — it is not a multiple of 7.5°";
      const wrong = [isConstructible ? "No — it is not a multiple of 7.5°" : "Yes — it is a multiple of 7.5°"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrong, 1);
      return {
        kind: "multiple-choice",
        prompt: `Can an angle of ${value}° be constructed using only a ruler and a pair of compasses (repeated bisecting of 90°, 60°, and their combinations)?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Ruler-and-compass constructions can only make angles that are multiples of 7.5° (obtained by bisecting 90°, 60°, and 30° combinations).",
        explanation: `${value}° ${isConstructible ? "is" : "is not"} a multiple of 7.5°, so it ${isConstructible ? "can" : "cannot"} be constructed with a ruler and compass alone.`,
      };
    }

    if (branch === "match-construction") {
      const pairs = [
        { angle: "90°", method: "Construct a perpendicular bisector of a straight line" },
        { angle: "60°", method: "Draw an arc from a point, then another arc of the same radius from where the first arc crosses the line" },
        { angle: "45°", method: "Construct 90°, then bisect it" },
        { angle: "30°", method: "Construct 60°, then bisect it" },
        { angle: "120°", method: "Construct two adjacent 60° angles" },
      ];
      const chosen = shuffle(rng, pairs).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `a${i}`, label: p.angle }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.method })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `a${i}`));
      return {
        kind: "click-match",
        prompt: "Match each angle to the ruler-and-compass method used to construct it.",
        tokens,
        targets,
        correctMap,
        hint: "Bigger constructed angles often build on smaller ones (e.g. 30° comes from bisecting 60°).",
        explanation: chosen.map((p) => `${p.angle}: ${p.method}`).join("; ") + ".",
      };
    }

    if (branch === "bisector-steps") {
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
        explanation: "Perpendicular bisector: (1) set the compass width, (2) arc from one end, (3) arc from the other end with the same width, (4) join the two crossing points.",
      };
    }

    // circle-radius: circle construction with a ruler and pair of compasses — find radius/diameter
    const radius = randInt(rng, 3, 12);
    const askDiameter = rng() < 0.5;
    return {
      kind: "fill-blank",
      prompt: askDiameter
        ? `A circle is constructed using a pair of compasses opened to ${radius} cm. Find the circle's diameter.`
        : `A circle needs a diameter of ${radius * 2} cm. How wide should the pair of compasses be opened (the radius)?`,
      visual: { type: "circle-shape", radius, label: `r = ${radius} cm` },
      before: askDiameter ? "Diameter =" : "Compass opening (radius) =",
      after: "cm",
      correctAnswer: askDiameter ? String(radius * 2) : String(radius),
      inputMode: "numeric",
      hint: "The compass opening equals the radius. Diameter = 2 × radius.",
      explanation: askDiameter ? `Diameter $= 2 \\times ${radius} = ${radius * 2}$ cm.` : `Radius $= ${radius * 2} \\div 2 = ${radius}$ cm — that is how wide to open the compass.`,
    };
  },
};
