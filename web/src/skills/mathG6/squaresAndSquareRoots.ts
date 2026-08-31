import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Square-shaped real-world contexts for area <-> side-length scenario branches.
const SQUARE_AREA_CONTEXTS = [
  "kitchen garden", "chicken run", "school car park", "classroom floor tile pattern", "flag",
  "sleeping mat", "maize-drying ground", "goat pen", "school assembly ground marking", "wall poster",
  "vegetable seedbed", "compound paving slab", "rabbit hutch floor", "prayer mat", "picture frame",
  "chalkboard patch", "chess board", "quilt patch", "kitchen table top", "solar panel",
  "biogas digester cover", "bee-keeping enclosure", "trampoline mat", "playground hopscotch square",
  "storeroom floor", "water tank base", "nursery bed", "notice board", "handkerchief", "cattle dip floor",
] as const;

export const squaresAndSquareRoots: Skill = {
  id: "g6-math-n-squares-square-roots",
  code: "N.4",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Squares and square roots",
  description: "Find squares of whole numbers up to 100 and square roots of perfect squares up to 10,000, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["square", "square-root", "identify-perfect", "sort-perfect", "match-square", "order-squares"] as const);

    if (branch === "square") {
      const n = randInt(rng, 2, 100);
      const sq = n * n;
      const useContext = rng() < 0.5;
      if (useContext) {
        const ctx = randChoice(rng, SQUARE_AREA_CONTEXTS);
        return {
          kind: "fill-blank",
          prompt: `A square ${ctx} has sides of ${n} m. Find its area (i.e. find ${n}²).`,
          before: `${n}² =`,
          after: "m²",
          correctAnswer: String(sq),
          inputMode: "numeric",
          hint: `${n}² means ${n} × ${n}.`,
          explanation: `${n}² = ${n} × ${n} = ${sq}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `Find ${n}².`,
        before: `${n}² =`,
        after: "",
        correctAnswer: String(sq),
        inputMode: "numeric",
        hint: `${n}² means ${n} × ${n}.`,
        explanation: `${n}² = ${n} × ${n} = ${sq}.`,
      };
    }

    if (branch === "square-root") {
      const n = randInt(rng, 2, 100);
      const sq = n * n;
      const useContext = rng() < 0.5;
      if (useContext) {
        const ctx = randChoice(rng, SQUARE_AREA_CONTEXTS);
        return {
          kind: "fill-blank",
          prompt: `A square ${ctx} has an area of ${sq} m². Find the length of one side (i.e. find $\\sqrt{${sq}}$).`,
          before: "Side length =",
          after: "m",
          correctAnswer: String(n),
          inputMode: "numeric",
          hint: "Find a whole number that, when multiplied by itself, gives this area.",
          explanation: `$\\sqrt{${sq}} = ${n}$ because ${n} × ${n} = ${sq}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `Find $\\sqrt{${sq}}$.`,
        before: "Answer =",
        after: "",
        correctAnswer: String(n),
        inputMode: "numeric",
        hint: "Find a whole number that, when multiplied by itself, gives this value.",
        explanation: `$\\sqrt{${sq}} = ${n}$ because ${n} × ${n} = ${sq}.`,
      };
    }

    if (branch === "identify-perfect") {
      const isPerfect = rng() < 0.5;
      const root = randInt(rng, 2, 99);
      const value = isPerfect ? root * root : root * root + randChoice(rng, [1, 2, 3, -1, -2]);
      const correctText = isPerfect ? "Yes, it is a perfect square" : "No, it is not a perfect square";
      const wrong = [isPerfect ? "No, it is not a perfect square" : "Yes, it is a perfect square"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correctText, wrong, 1);
      return {
        kind: "multiple-choice",
        prompt: `Is ${value} a perfect square (does it have a whole-number square root)?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Check whether a whole number, multiplied by itself, gives exactly this value.",
        explanation: isPerfect
          ? `${value} = ${root}², so it is a perfect square.`
          : `${value} is close to ${root}² = ${root * root}, but is not itself a perfect square.`,
      };
    }

    if (branch === "sort-perfect") {
      const roots = sampleDistinctInts(rng, 2, 30, 3);
      const perfectPool = roots.map((r) => r * r);
      const nonPerfectPool = roots.map((r) => r * r + randChoice(rng, [1, 2, 3]));
      const combined = shuffle(rng, [...perfectPool, ...nonPerfectPool]);
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

    if (branch === "match-square") {
      const numbers = sampleDistinctInts(rng, 6, 60, 4);
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
    }

    // order-squares: order a set of perfect squares by their square root, smallest to largest.
    const roots = sampleDistinctInts(rng, 3, 90, 5);
    const items = roots.map((r) => ({ id: String(r * r), label: String(r * r) }));
    const sorted = [...roots].sort((a, b) => a - b);
    return {
      kind: "ordering",
      prompt: "These are all perfect squares. Order them from smallest to largest by their square roots.",
      instruction: "Click them in order, smallest first.",
      items: shuffle(rng, items),
      correctOrder: sorted.map((r) => String(r * r)),
      hint: "Work out the square root of each number, then compare the roots.",
      explanation: sorted.map((r) => `√${r * r} = ${r}`).join("; ") + ".",
    };
  },
};
