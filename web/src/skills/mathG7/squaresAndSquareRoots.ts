import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, formatFraction } from "./mathUtils";
import type { Skill } from "@/lib/types";

const PERFECT_SQUARE_ROOTS = Array.from({ length: 24 }, (_, i) => i + 2); // 2..25
const NON_PERFECT_SQUARES = [10, 20, 30, 45, 50, 60, 70, 80, 90, 99, 110, 130, 150, 170, 190, 200, 230, 250, 275, 300];

export const squaresAndSquareRoots: Skill = {
  id: "g7-math-n-squares-square-roots",
  code: "N.5",
  subjectId: "math",
  strandId: "g7-math-numbers",
  grade: 7,
  title: "Squares and square roots",
  description: "Find the squares and square roots of whole numbers, fractions, and decimals of perfect squares, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["square", "square-root", "fraction-decimal", "identify-perfect", "sort-perfect", "match-square"] as const);

    if (branch === "square") {
      const n = randInt(rng, 11, 45);
      const sq = n * n;
      return {
        kind: "fill-blank",
        prompt: `A square vegetable plot has sides of ${n} m. Find its area (i.e. find ${n}²).`,
        before: `${n}² =`,
        after: "m²",
        correctAnswer: String(sq),
        inputMode: "numeric",
        hint: `${n}² means ${n} × ${n}.`,
        explanation: `${n}² = ${n} × ${n} = ${sq}.`,
      };
    }

    if (branch === "square-root") {
      const n = randChoice(rng, PERFECT_SQUARE_ROOTS);
      const sq = n * n;
      return {
        kind: "fill-blank",
        prompt: `A square courtyard has an area of ${sq} m². Find the length of one side (i.e. find $\\sqrt{${sq}}$).`,
        before: "Side length =",
        after: "m",
        correctAnswer: String(n),
        inputMode: "numeric",
        hint: `Find a whole number that, when multiplied by itself, gives ${sq}.`,
        explanation: `$\\sqrt{${sq}} = ${n}$ because ${n} × ${n} = ${sq}.`,
      };
    }

    if (branch === "fraction-decimal") {
      const kindPick = randChoice(rng, ["fraction", "decimal"] as const);
      if (kindPick === "fraction") {
        const n = randInt(rng, 2, 9);
        const d = randInt(rng, n + 1, 12);
        const askSquare = rng() < 0.5;
        if (askSquare) {
          const answer = formatFraction(n * n, d * d);
          return {
            kind: "fill-blank",
            prompt: `Find $\\left(\\frac{${n}}{${d}}\\right)^2$.`,
            before: "Answer =",
            after: "",
            correctAnswer: answer,
            acceptedAnswers: [`${n * n}/${d * d}`],
            inputMode: "text",
            hint: "Square the numerator and square the denominator separately.",
            explanation: `$\\left(\\frac{${n}}{${d}}\\right)^2 = \\frac{${n}^2}{${d}^2} = \\frac{${n * n}}{${d * d}}$.`,
          };
        }
        const answer = formatFraction(n, d);
        return {
          kind: "fill-blank",
          prompt: `Find $\\sqrt{\\frac{${n * n}}{${d * d}}}$.`,
          before: "Answer =",
          after: "",
          correctAnswer: answer,
          acceptedAnswers: [`${n}/${d}`],
          inputMode: "text",
          hint: "Take the square root of the numerator and the denominator separately.",
          explanation: `$\\sqrt{\\frac{${n * n}}{${d * d}}} = \\frac{\\sqrt{${n * n}}}{\\sqrt{${d * d}}} = \\frac{${n}}{${d}}$.`,
        };
      }
      const base = randChoice(rng, [3, 4, 5, 6, 7, 8, 9, 11, 12] as const);
      const decimalRoot = base / 10;
      const decimalSquare = Math.round(decimalRoot * decimalRoot * 100) / 100;
      const askSquare = rng() < 0.5;
      if (askSquare) {
        return {
          kind: "fill-blank",
          prompt: `Find ${decimalRoot}².`,
          before: `${decimalRoot}² =`,
          after: "",
          correctAnswer: String(decimalSquare),
          inputMode: "numeric",
          hint: "Multiply the decimal by itself.",
          explanation: `${decimalRoot} × ${decimalRoot} = ${decimalSquare}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `Find $\\sqrt{${decimalSquare}}$.`,
        before: "Answer =",
        after: "",
        correctAnswer: String(decimalRoot),
        inputMode: "numeric",
        hint: "Find a decimal that, multiplied by itself, gives this result.",
        explanation: `$\\sqrt{${decimalSquare}} = ${decimalRoot}$ because ${decimalRoot} × ${decimalRoot} = ${decimalSquare}.`,
      };
    }

    if (branch === "identify-perfect") {
      const isPerfect = rng() < 0.5;
      const value = isPerfect ? randChoice(rng, PERFECT_SQUARE_ROOTS) ** 2 : randChoice(rng, NON_PERFECT_SQUARES);
      const wrong = ["Yes, it is a perfect square", "No, it is not a perfect square"].filter((_, i) => (isPerfect ? i !== 0 : i !== 1));
      const correctText = isPerfect ? "Yes, it is a perfect square" : "No, it is not a perfect square";
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrong, 1);
      return {
        kind: "multiple-choice",
        prompt: `Is ${value} a perfect square (does it have a whole-number square root)?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Check whether a whole number, multiplied by itself, gives exactly this value.",
        explanation: isPerfect ? `${value} = ${Math.round(Math.sqrt(value))}², so it is a perfect square.` : `${value} does not have a whole-number square root, so it is not a perfect square.`,
      };
    }

    if (branch === "sort-perfect") {
      const perfectPool = Array.from(new Set(Array.from({ length: 3 }, () => randChoice(rng, PERFECT_SQUARE_ROOTS) ** 2)));
      const nonPerfectPool = Array.from(new Set(Array.from({ length: 3 }, () => randChoice(rng, NON_PERFECT_SQUARES))));
      const combined = shuffle(rng, [...new Set(perfectPool)].slice(0, 3).concat([...new Set(nonPerfectPool)].slice(0, 3)));
      const items = combined.map((v) => ({ id: String(v), label: String(v) }));
      const buckets = [
        { id: "perfect", label: "Perfect square" },
        { id: "not", label: "Not a perfect square" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of combined) correctBucket[String(v)] = Number.isInteger(Math.sqrt(v)) ? "perfect" : "not";
      return {
        kind: "categorize",
        prompt: "Sort each number by whether it is a perfect square.",
        items,
        buckets,
        correctBucket,
        hint: "A perfect square is the result of a whole number multiplied by itself.",
        explanation: combined.map((v) => `${v} is ${Number.isInteger(Math.sqrt(v)) ? "" : "not "}a perfect square`).join("; ") + ".",
      };
    }

    // match-square: match a whole number to its square
    const chosen = new Set<number>();
    while (chosen.size < 4) chosen.add(randInt(rng, 6, 20));
    const numbers = [...chosen];
    const tokens = numbers.map((n) => ({ id: `n${n}`, label: String(n) }));
    const targets = shuffle(rng, numbers.map((n) => ({ id: `s${n}`, label: String(n * n) })));
    const correctMap: Record<string, string> = {};
    for (const n of numbers) correctMap[`s${n}`] = `n${n}`;
    return {
      kind: "click-match",
      prompt: "Match each number to its square.",
      tokens,
      targets,
      correctMap,
      hint: "Multiply each number by itself.",
      explanation: numbers.map((n) => `${n}² = ${n * n}`).join("; ") + ".",
    };
  },
};
