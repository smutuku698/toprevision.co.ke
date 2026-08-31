import { randChoice, randInt } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [7, 24, 25],
  [12, 16, 20],
  [10, 24, 26],
  [20, 21, 29],
  [9, 40, 41],
];

// Near-miss triples that fail a² + b² = c² by a small margin, for the
// "is this a right triangle?" mode — close enough to require the check,
// not so far off that it's an obvious guess.
const NEAR_MISSES: [number, number, number][] = [
  [4, 5, 7],
  [6, 7, 10],
  [5, 9, 11],
  [7, 10, 13],
  [8, 9, 13],
  [6, 11, 14],
];

export const pythagoras: Skill = {
  id: "math-m-pythagoras",
  code: "M.2",
  subjectId: "math",
  strandId: "math-measurement",
  grade: 9,
  title: "The Pythagorean theorem",
  description: "Find a missing side of a right-angled triangle, or test whether three lengths form a right triangle.",
  generate(rng) {
    const mode = randChoice(rng, ["hypotenuse", "leg", "leg", "identify"] as const);

    if (mode === "identify") {
      const useRealTriple = randChoice(rng, [true, false]);
      const scale = randInt(rng, 1, 2);
      const [a, b, c] = (useRealTriple ? randChoice(rng, TRIPLES) : randChoice(rng, NEAR_MISSES)).map(
        (n) => n * scale
      );
      const sides = [a, b, c];
      const sumSquares = a * a + b * b;
      const isRight = sumSquares === c * c;

      return {
        kind: "multiple-choice",
        prompt: `A triangle has sides ${sides[0]} cm, ${sides[1]} cm, and ${sides[2]} cm. Is it a right-angled triangle?`,
        choices: ["Yes, it is a right triangle", "No, it is not a right triangle"],
        correctIndex: isRight ? 0 : 1,
        hint: "Check whether the square of the longest side equals the sum of the squares of the other two.",
        explanation: isRight
          ? `$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${sumSquares}$, and $${c}^2 = ${c * c}$. Since these are equal, the sides do satisfy $a^2 + b^2 = c^2$, so it IS a right triangle.`
          : `$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${sumSquares}$, but $${c}^2 = ${c * c}$. Since $${sumSquares} \\neq ${c * c}$, the sides do NOT satisfy $a^2 + b^2 = c^2$, so it is not a right triangle.`,
      };
    }

    const [a, b, c] = randChoice(rng, TRIPLES);
    const scale = randInt(rng, 1, 3);
    const base = a * scale;
    const height = b * scale;
    const hyp = c * scale;

    if (mode === "hypotenuse") {
      return {
        kind: "fill-blank",
        prompt: "Find the length of the hypotenuse.",
        visual: { type: "right-triangle", base, height, showHypotenuse: false },
        before: "c =",
        after: "",
        unit: "cm",
        correctAnswer: String(hyp),
        inputMode: "numeric",
        hint: "$a^2 + b^2 = c^2$",
        explanation: `Using $a^2 + b^2 = c^2$: $${base}^2 + ${height}^2 = ${base * base} + ${height * height} = ${
          base * base + height * height
        }$. Taking the square root gives $c = ${hyp}$ cm.`,
      };
    }

    // mode === "leg": hide one of the two legs instead, and give the hypotenuse.
    const hideBase = randChoice(rng, [true, false]);
    const missing = hideBase ? base : height;
    const known = hideBase ? height : base;

    return {
      kind: "fill-blank",
      prompt: "Find the length of the missing leg.",
      visual: {
        type: "right-triangle",
        base,
        height,
        showHypotenuse: true,
        labelBase: hideBase ? "?" : String(base),
        labelHeight: hideBase ? String(height) : "?",
        labelHypotenuse: String(hyp),
      },
      before: "missing leg =",
      after: "",
      unit: "cm",
      correctAnswer: String(missing),
      inputMode: "numeric",
      hint: "Rearrange $a^2 + b^2 = c^2$ to solve for the missing leg: $\\text{missing}^2 = c^2 - \\text{known}^2$.",
      explanation: `Rearranging $a^2 + b^2 = c^2$ for the missing leg: $\\text{missing}^2 = c^2 - \\text{known}^2 = ${hyp}^2 - ${known}^2 = ${
        hyp * hyp
      } - ${known * known} = ${hyp * hyp - known * known}$. Taking the square root gives the missing leg $= ${missing}$ cm.`,
    };
  },
};
