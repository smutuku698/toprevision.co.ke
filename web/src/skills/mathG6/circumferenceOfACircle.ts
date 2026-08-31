import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Circumference = 2 × π × radius = π × diameter, using π ≈ 22/7 as per the Grade 6 design.
// Radii/diameters are kept as multiples of 7 so that 22/7 divides exactly.

const RADII_MULT7 = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84] as const;

// 32 distinct real-world Kenyan circular-object contexts.
const CIRCULAR_OBJECTS = [
  "a circular water storage tank",
  "a farm pond",
  "a wooden cartwheel",
  "an oil drum's lid",
  "a manhole cover",
  "a Kenyan coin",
  "a cooking pot (sufuria) lid",
  "a bicycle wheel",
  "a car tyre",
  "a wall clock face",
  "a football pitch's centre circle",
  "a trampoline",
  "a round dining table",
  "a well's opening",
  "a grain silo's top",
  "a roundabout at a busy junction",
  "a tractor's rear wheel",
  "a satellite dish",
  "a circular flower bed",
  "a well cover",
  "a hula hoop",
  "a basketball hoop rim",
  "a circular swimming pool",
  "a gong used at a school assembly",
  "a circular sisal rug",
  "a large serving plate",
  "a circular window",
  "a traditional millstone",
  "a circular fish pond",
  "a circular water trough for cattle",
  "a centre-pivot irrigation circle",
  "a circular table mat",
] as const;

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export const circumferenceOfACircle: Skill = {
  id: "g6-math-m-circumference",
  code: "M.2",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Circumference of a circle",
  description: "Determine the circumference of a circle from its radius or diameter, work backwards from a known circumference, and use the relationship between circumference and diameter (π ≈ 22/7).",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "circumference-from-radius",
        "circumference-from-diameter",
        "diameter-from-circumference",
        "radius-from-circumference",
        "relationship-mc",
        "compare-classical",
        "click-match",
        "categorize",
        "order-circumference",
      ] as const
    );

    if (branch === "circumference-from-radius") {
      const radius = randChoice(rng, RADII_MULT7);
      const circumference = 2 * (22 / 7) * radius;
      const object = randChoice(rng, CIRCULAR_OBJECTS);
      return {
        kind: "fill-blank",
        prompt: `${object[0].toUpperCase()}${object.slice(1)} has a radius of ${radius} cm. Find its circumference. (Use π ≈ 22/7)`,
        visual: { type: "circle-shape", radius, label: `${radius} cm` },
        before: "Circumference =",
        after: "cm",
        correctAnswer: fmt(circumference),
        inputMode: "numeric",
        hint: "Circumference = 2 × π × radius.",
        explanation: `Circumference $= 2 \\times \\frac{22}{7} \\times ${radius} = ${fmt(circumference)}$ cm.`,
      };
    }

    if (branch === "circumference-from-diameter") {
      const diameter = randChoice(rng, RADII_MULT7.map((r) => r * 2));
      const circumference = (22 / 7) * diameter;
      const object = randChoice(rng, CIRCULAR_OBJECTS);
      return {
        kind: "fill-blank",
        prompt: `${object[0].toUpperCase()}${object.slice(1)} has a diameter of ${diameter} cm. Find its circumference. (Use π ≈ 22/7)`,
        visual: { type: "circle-shape", radius: diameter / 2, label: `${diameter} cm` },
        before: "Circumference =",
        after: "cm",
        correctAnswer: fmt(circumference),
        inputMode: "numeric",
        hint: "Circumference = π × diameter.",
        explanation: `Circumference $= \\frac{22}{7} \\times ${diameter} = ${fmt(circumference)}$ cm.`,
      };
    }

    if (branch === "diameter-from-circumference") {
      const diameter = randChoice(rng, RADII_MULT7.map((r) => r * 2));
      const circumference = (22 / 7) * diameter;
      const object = randChoice(rng, CIRCULAR_OBJECTS);
      const wrong = [String(diameter / 2), String(diameter * 2), String(diameter + 7)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(diameter), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${object[0].toUpperCase()}${object.slice(1)} has a circumference of ${fmt(circumference)} cm. Find its diameter. (Use π ≈ 22/7)`,
        choices: choices.map((c) => `${c} cm`),
        correctIndex,
        layout: "row",
        hint: "Rearrange: diameter = circumference ÷ π.",
        explanation: `diameter $= ${fmt(circumference)} \\div \\frac{22}{7} = ${diameter}$ cm. (Halving or doubling the circumference by mistake gives the wrong distractors.)`,
      };
    }

    if (branch === "radius-from-circumference") {
      const radius = randChoice(rng, RADII_MULT7);
      const circumference = 2 * (22 / 7) * radius;
      const object = randChoice(rng, CIRCULAR_OBJECTS);
      return {
        kind: "fill-blank",
        prompt: `${object[0].toUpperCase()}${object.slice(1)} has a circumference of ${fmt(circumference)} cm. Find its radius. (Use π ≈ 22/7)`,
        before: "Radius =",
        after: "cm",
        correctAnswer: String(radius),
        inputMode: "numeric",
        hint: "Rearrange: radius = circumference ÷ (2 × π).",
        explanation: `radius $= ${fmt(circumference)} \\div (2 \\times \\frac{22}{7}) = ${radius}$ cm.`,
      };
    }

    if (branch === "relationship-mc") {
      const correct = "About 3 1/7 times (π ≈ 22/7) the diameter";
      const wrong = ["Exactly 2 times the diameter", "Exactly half the diameter", "About 3 1/7 times the radius"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: "For any circle, the circumference is always how many times its diameter?",
        choices,
        correctIndex,
        layout: "list",
        hint: "This constant ratio is π, which we approximate as 22/7 (about 3 1/7).",
        explanation: "The circumference of any circle is always about 3 1/7 (π ≈ 22/7) times its diameter — this ratio is the same for every circle, large or small.",
      };
    }

    if (branch === "compare-classical") {
      const r1 = randChoice(rng, RADII_MULT7);
      let r2 = randChoice(rng, RADII_MULT7);
      while (r2 === r1) r2 = randChoice(rng, RADII_MULT7);
      const bigger = r1 > r2 ? "A" : "B";
      return {
        kind: "multiple-choice",
        prompt: `Circle A has radius ${r1} cm and circle B has radius ${r2} cm. Which circle has the greater circumference?`,
        choices: ["Circle A", "Circle B", "They are equal"],
        correctIndex: bigger === "A" ? 0 : 1,
        layout: "row",
        hint: "A larger radius always gives a larger circumference.",
        explanation: `Circumference $= 2\\pi r$, so the circle with the bigger radius (${bigger === "A" ? r1 : r2} cm) has the greater circumference: ${fmt(2 * (22 / 7) * r1)} cm vs ${fmt(2 * (22 / 7) * r2)} cm.`,
      };
    }

    if (branch === "click-match") {
      const chosenObjects = shuffle(rng, [...CIRCULAR_OBJECTS]).slice(0, 4);
      const radii = shuffle(rng, [...RADII_MULT7]).slice(0, 4);
      const tokens = chosenObjects.map((o, i) => ({ id: `o${i}`, label: `${o[0].toUpperCase()}${o.slice(1)} (radius ${radii[i]} cm)` }));
      const targets = shuffle(rng, chosenObjects.map((_, i) => ({ id: `o${i}`, label: `${fmt(2 * (22 / 7) * radii[i])} cm` })));
      const correctMap: Record<string, string> = {};
      chosenObjects.forEach((_, i) => (correctMap[`o${i}`] = `o${i}`));
      return {
        kind: "click-match",
        prompt: "Match each circular object to its circumference. (Use π ≈ 22/7)",
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Circumference = 2 × π × radius.",
        explanation: chosenObjects.map((o, i) => `${o}, radius ${radii[i]} cm → circumference ${fmt(2 * (22 / 7) * radii[i])} cm`).join("; ") + ".",
      };
    }

    if (branch === "categorize") {
      const threshold = randChoice(rng, [66, 132, 198, 264] as const);
      const chosenObjects = shuffle(rng, [...CIRCULAR_OBJECTS]).slice(0, 6);
      const radii = chosenObjects.map(() => randChoice(rng, RADII_MULT7));
      const items = chosenObjects.map((o, i) => ({ id: `o${i}`, label: `${o[0].toUpperCase()}${o.slice(1)} (radius ${radii[i]} cm)` }));
      const buckets = [
        { id: "over", label: `Circumference over ${threshold} cm` },
        { id: "under", label: `Circumference ${threshold} cm or less` },
      ];
      const correctBucket: Record<string, string> = {};
      chosenObjects.forEach((_, i) => (correctBucket[`o${i}`] = 2 * (22 / 7) * radii[i] > threshold ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: `Sort each circular object by whether its circumference is over ${threshold} cm, or ${threshold} cm and under. (Use π ≈ 22/7)`,
        items,
        buckets,
        correctBucket,
        hint: "Work out circumference = 2 × π × radius for each, then compare to the threshold.",
        explanation: chosenObjects.map((o, i) => `${o}: circumference = ${fmt(2 * (22 / 7) * radii[i])} cm`).join("; ") + ".",
      };
    }

    // order-circumference
    const chosenObjects = shuffle(rng, [...CIRCULAR_OBJECTS]).slice(0, 4);
    const radii = shuffle(rng, [...RADII_MULT7]).slice(0, 4);
    const items = chosenObjects.map((o, i) => ({ id: `o${i}`, label: `${o[0].toUpperCase()}${o.slice(1)} (radius ${radii[i]} cm)` }));
    const sortedIdx = chosenObjects.map((_, i) => i).sort((a, b) => radii[a] - radii[b]);
    return {
      kind: "ordering",
      prompt: "Arrange these circular objects from smallest to greatest circumference. (Use π ≈ 22/7)",
      instruction: "Click them in order, smallest circumference first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `o${i}`),
      hint: "A larger radius always means a larger circumference — you can compare radii directly.",
      explanation: `In order: ${sortedIdx.map((i) => `${chosenObjects[i]} (radius ${radii[i]} cm, circumference ${fmt(2 * (22 / 7) * radii[i])} cm)`).join(", ")}.`,
    };
  },
};
