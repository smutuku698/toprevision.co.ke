import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, formatFraction, simplifyFraction } from "./mathUtils";
import type { Skill } from "@/lib/types";

function addFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
  return simplifyFraction(n1 * d2 + n2 * d1, d1 * d2);
}
function subFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
  return simplifyFraction(n1 * d2 - n2 * d1, d1 * d2);
}
function mulFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
  return simplifyFraction(n1 * n2, d1 * d2);
}
function divFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
  return simplifyFraction(n1 * d2, d1 * n2);
}

const REAL_LIFE = [
  { item: "of a farm planted with sukuma wiki", context: "farm" },
  { item: "of a water tank used by a household in a day", context: "tank" },
  { item: "of a matatu's seats that were filled on a trip", context: "matatu" },
  { item: "of a class's homework that was completed by break time", context: "class" },
  { item: "of a bag of maize flour used while baking", context: "flour" },
  { item: "of a school's playground that was reseeded with grass", context: "playground" },
  { item: "of a delivery truck's cargo space that was loaded", context: "truck" },
  { item: "of a shop's stock of sugar that was sold in a day", context: "shop" },
  { item: "of a market trader's tomatoes that were sold by noon", context: "market" },
  { item: "of a herd of goats that were vaccinated at a clinic", context: "goats" },
] as const;

export const fractions: Skill = {
  id: "g7-math-n-fractions",
  code: "N.3",
  subjectId: "math",
  strandId: "g7-math-numbers",
  grade: 7,
  title: "Fractions",
  description: "Compare, add, subtract, multiply, and divide fractions (including whole numbers and mixed numbers), and find reciprocals, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["add-sub", "multiply-divide", "reciprocal", "whole-number", "order", "half-sort"] as const);

    if (branch === "add-sub") {
      const d1 = randChoice(rng, [2, 3, 4, 5, 6, 8, 9, 10]);
      const d2 = randChoice(rng, [2, 3, 4, 5, 6, 8, 9, 10]);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      const op = randChoice(rng, ["add", "sub"] as const);
      const ctx = randChoice(rng, REAL_LIFE);
      const first = op === "sub" && n1 / d1 < n2 / d2 ? { n: n2, d: d2 } : { n: n1, d: d1 };
      const second = op === "sub" && n1 / d1 < n2 / d2 ? { n: n1, d: d1 } : { n: n2, d: d2 };
      const [rn, rd] = op === "add" ? addFrac(first.n, first.d, second.n, second.d) : subFrac(first.n, first.d, second.n, second.d);
      const answer = formatFraction(rn, rd);
      const opSym = op === "add" ? "+" : "-";
      return {
        kind: "fill-blank",
        prompt: `On Monday, $\\frac{${first.n}}{${first.d}}$ ${ctx.item}. On Tuesday, ${op === "add" ? "a further" : "a total of"} $\\frac{${second.n}}{${second.d}}$ ${op === "add" ? "was added" : "was already counted within that, and needs subtracting"}. Work out $\\frac{${first.n}}{${first.d}} ${opSym} \\frac{${second.n}}{${second.d}}$.`,
        visual: { type: "fraction-bar", numerator: first.n, denominator: first.d },
        before: "Answer =",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [`${rn}/${rd}`],
        inputMode: "text",
        hint: `Find a common denominator (a multiple of ${first.d} and ${second.d}), then ${op === "add" ? "add" : "subtract"} the numerators.`,
        explanation: `Common denominator = ${first.d * second.d}: $\\frac{${first.n}}{${first.d}} ${opSym} \\frac{${second.n}}{${second.d}} = \\frac{${first.n * second.d}}{${first.d * second.d}} ${opSym} \\frac{${second.n * first.d}}{${first.d * second.d}}$, which simplifies to $\\frac{${rn}}{${rd}}$.`,
      };
    }

    if (branch === "multiply-divide") {
      const d1 = randChoice(rng, [2, 3, 4, 5, 6]);
      const d2 = randChoice(rng, [2, 3, 4, 5, 6]);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      const op = randChoice(rng, ["multiply", "divide"] as const);
      const [rn, rd] = op === "multiply" ? mulFrac(n1, d1, n2, d2) : divFrac(n1, d1, n2, d2);
      const answer = formatFraction(rn, rd);
      const prompt =
        op === "multiply"
          ? `A water tank is $\\frac{${n1}}{${d1}}$ full. A tap drains away $\\frac{${n2}}{${d2}}$ of that water. What fraction of the WHOLE tank was drained?`
          : `A tailor has $\\frac{${n1}}{${d1}}$ m of ribbon. Each bow uses $\\frac{${n2}}{${d2}}$ m of ribbon. Work out $\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}$ to find how many bows can be made.`;
      return {
        kind: "fill-blank",
        prompt,
        before: "Answer =",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [`${rn}/${rd}`],
        inputMode: "text",
        hint: op === "multiply" ? "Multiply the numerators, then multiply the denominators." : "Dividing by a fraction means multiplying by its reciprocal — flip the second fraction, then multiply.",
        explanation:
          op === "multiply"
            ? `$\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}} = \\frac{${n1 * n2}}{${d1 * d2}} = \\frac{${rn}}{${rd}}$.`
            : `$\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}} = \\frac{${n1 * d2}}{${d1 * n2}} = \\frac{${rn}}{${rd}}$.`,
      };
    }

    if (branch === "reciprocal") {
      const count = 4;
      const seen = new Set<string>();
      const fracs: [number, number][] = [];
      while (fracs.length < count) {
        const d = randInt(rng, 2, 9);
        const n = randInt(rng, 1, d - 1);
        const [rn, rd] = simplifyFraction(n, d);
        const key = `${rn}/${rd}`;
        if (!seen.has(key)) {
          seen.add(key);
          fracs.push([rn, rd]);
        }
      }
      const tokens = fracs.map(([n, d]) => ({ id: `f${n}-${d}`, label: `${n}/${d}` }));
      const targets = shuffle(rng, fracs.map(([n, d]) => ({ id: `r${n}-${d}`, label: `${d}/${n}` })));
      const correctMap: Record<string, string> = {};
      fracs.forEach(([n, d]) => (correctMap[`r${n}-${d}`] = `f${n}-${d}`));
      return {
        kind: "click-match",
        prompt: "Match each fraction to its reciprocal.",
        tokens,
        targets,
        correctMap,
        hint: "The reciprocal of a fraction is found by swapping its numerator and denominator.",
        explanation: fracs.map(([n, d]) => `The reciprocal of ${n}/${d} is ${d}/${n}`).join("; ") + ".",
      };
    }

    if (branch === "whole-number") {
      // Whole number ÷ fraction, or whole number × fraction — a genuinely
      // different sub-skill from fraction-by-fraction operations.
      const whole = randInt(rng, 2, 10);
      const d = randChoice(rng, [2, 3, 4, 5, 6] as const);
      const n = randInt(rng, 1, d - 1);
      const op = randChoice(rng, ["multiply", "divide"] as const);
      const [rn, rd] = op === "multiply" ? mulFrac(whole, 1, n, d) : mulFrac(whole, 1, d, n);
      const answer = formatFraction(rn, rd);
      const prompt =
        op === "multiply"
          ? `A farmer has ${whole} sacks of maize. He sells $\\frac{${n}}{${d}}$ of a sack to each of his regular customers. How many sacks does he sell to ${whole} customers buying that amount each? Work out $${whole} \\times \\frac{${n}}{${d}}$.`
          : `${whole} litres of milk are shared equally so that each container holds $\\frac{${n}}{${d}}$ of a litre. How many containers are needed? Work out $${whole} \\div \\frac{${n}}{${d}}$.`;
      const wrong = [formatFraction(whole * n + d, d), formatFraction(whole, n), formatFraction(rn + 1, rd), formatFraction(whole * d, n + 1)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, answer, wrong);
      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: op === "multiply" ? "Write the whole number as a fraction over 1, then multiply as usual." : "Dividing by a fraction means multiplying by its reciprocal.",
        explanation:
          op === "multiply"
            ? `$${whole} \\times \\frac{${n}}{${d}} = \\frac{${whole}}{1} \\times \\frac{${n}}{${d}} = \\frac{${whole * n}}{${d}} = ${answer}$.`
            : `$${whole} \\div \\frac{${n}}{${d}} = ${whole} \\times \\frac{${d}}{${n}} = \\frac{${whole * d}}{${n}} = ${answer}$.`,
      };
    }

    if (branch === "order") {
      const count = 4;
      const seen = new Set<string>();
      const fracs: [number, number][] = [];
      while (fracs.length < count) {
        const d = randChoice(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const n = randInt(rng, 1, d - 1);
        const [rn, rd] = simplifyFraction(n, d);
        const key = `${rn}/${rd}`;
        if (!seen.has(key)) {
          seen.add(key);
          fracs.push([rn, rd]);
        }
      }
      const items = fracs.map(([n, d]) => ({ id: `${n}-${d}`, label: `${n}/${d}` }));
      const sorted = [...fracs].sort((a, b) => a[0] / a[1] - b[0] / b[1]);
      return {
        kind: "ordering",
        prompt: "Order these fractions from smallest to largest.",
        instruction: "Click them in order, smallest first.",
        items: shuffle(rng, items),
        correctOrder: sorted.map(([n, d]) => `${n}-${d}`),
        hint: "Convert to a common denominator, or compare as decimals.",
        explanation: `In order: ${sorted.map(([n, d]) => `${n}/${d}`).join(", ")}.`,
      };
    }

    // half-sort
    const count = 6;
    const seen = new Set<string>();
    const fracs: [number, number][] = [];
    while (fracs.length < count) {
      const d = randChoice(rng, [3, 4, 5, 6, 7, 8, 9, 10]);
      const n = randInt(rng, 1, d - 1);
      const key = `${n}/${d}`;
      if (!seen.has(key)) {
        seen.add(key);
        fracs.push([n, d]);
      }
    }
    const items = fracs.map(([n, d]) => ({ id: `${n}-${d}`, label: `${n}/${d}` }));
    const buckets = [
      { id: "under", label: "Less than 1/2" },
      { id: "over", label: "1/2 or more" },
    ];
    const correctBucket: Record<string, string> = {};
    for (const [n, d] of fracs) correctBucket[`${n}-${d}`] = n / d < 0.5 ? "under" : "over";
    return {
      kind: "categorize",
      prompt: "Sort each fraction by whether it is less than one half, or one half and above.",
      items: shuffle(rng, items),
      buckets,
      correctBucket,
      hint: "A fraction is at least a half when the numerator is at least half the denominator.",
      explanation: fracs.map(([n, d]) => `${n}/${d} is ${n / d < 0.5 ? "less than" : "at least"} 1/2`).join("; ") + ".",
    };
  },
};
