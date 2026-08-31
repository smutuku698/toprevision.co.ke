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
  { item: "of cloth for a school uniform", unit: "m" },
  { item: "of maize flour used for ugali", unit: "kg" },
  { item: "of a water tank filled by a pipe", unit: "" },
  { item: "of a plot of land planted with beans", unit: "" },
  { item: "of a journey completed by a matatu", unit: "" },
] as const;

export const fractions: Skill = {
  id: "g8-math-n-fractions",
  code: "N.2",
  subjectId: "math",
  strandId: "g8-math-numbers",
  grade: 8,
  title: "Operations on fractions",
  description: "Add, subtract, multiply, and divide fractions — including combined operations — in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["add-sub", "combined", "mixed-number", "multiply-divide", "order", "half-sort"] as const);

    if (branch === "add-sub") {
      const d1 = randChoice(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const d2 = randChoice(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      const op = randChoice(rng, ["add", "sub"] as const);
      const ctx = randChoice(rng, REAL_LIFE);
      // For subtraction, make sure the first fraction is the larger one.
      const first = op === "sub" && n1 / d1 < n2 / d2 ? { n: n2, d: d2 } : { n: n1, d: d1 };
      const second = op === "sub" && n1 / d1 < n2 / d2 ? { n: n1, d: d1 } : { n: n2, d: d2 };
      const [rn, rd] = op === "add" ? addFrac(first.n, first.d, second.n, second.d) : subFrac(first.n, first.d, second.n, second.d);
      const answer = formatFraction(rn, rd);
      const opWord = op === "add" ? "adds" : "uses up";
      const opSym = op === "add" ? "+" : "-";
      return {
        kind: "fill-blank",
        prompt: `A worker completes $\\frac{${first.n}}{${first.d}}$ ${ctx.item}, then ${opWord} $\\frac{${second.n}}{${second.d}}$ more. What fraction ${op === "add" ? "in total" : "is left after subtracting"}?`,
        visual: { type: "fraction-bar", numerator: first.n, denominator: first.d },
        before: "Answer =",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [`${rn}/${rd}`],
        inputMode: "text",
        hint: `Find a common denominator (a multiple of ${first.d} and ${second.d}), then ${op === "add" ? "add" : "subtract"} the numerators.`,
        explanation: `Common denominator = ${first.d * second.d}: $\\frac{${first.n}}{${first.d}} ${opSym} \\frac{${second.n}}{${second.d}} = \\frac{${first.n * second.d}}{${first.d * second.d}} ${opSym} \\frac{${second.n * first.d}}{${first.d * second.d}} = \\frac{${op === "add" ? first.n * second.d + second.n * first.d : first.n * second.d - second.n * first.d}}{${first.d * second.d}}$, which simplifies to $\\frac{${rn}}{${rd}}$.`,
      };
    }

    if (branch === "combined") {
      // Three-term combined operation: (a/b op1 c/d) op2 e/f — a genuine
      // multi-step BODMAS-style fraction problem, not a single operation.
      const d1 = randChoice(rng, [2, 3, 4, 5]);
      const d2 = randChoice(rng, [2, 3, 4, 5]);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      const op1 = randChoice(rng, ["add", "sub"] as const);
      let firstA = { n: n1, d: d1 };
      let firstB = { n: n2, d: d2 };
      if (op1 === "sub" && n1 / d1 < n2 / d2) [firstA, firstB] = [firstB, firstA];
      const [sn, sd] = op1 === "add" ? addFrac(firstA.n, firstA.d, firstB.n, firstB.d) : subFrac(firstA.n, firstA.d, firstB.n, firstB.d);
      const op2 = randChoice(rng, ["multiply", "add"] as const);
      const n3 = randInt(rng, 1, 4);
      const d3 = randInt(rng, n3 + 1, 6);
      const [rn, rd] = op2 === "multiply" ? mulFrac(sn, sd, n3, d3) : addFrac(sn, sd, n3, d3);
      const answer = formatFraction(rn, rd);
      const op1Sym = op1 === "add" ? "+" : "-";
      const op2Sym = op2 === "multiply" ? "\\times" : "+";
      return {
        kind: "fill-blank",
        prompt: `Work out: $\\left(\\frac{${firstA.n}}{${firstA.d}} ${op1Sym} \\frac{${firstB.n}}{${firstB.d}}\\right) ${op2Sym} \\frac{${n3}}{${d3}}$`,
        before: "Answer =",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [`${rn}/${rd}`],
        inputMode: "text",
        hint: "Work inside the brackets first, simplify, then do the outer operation.",
        explanation: `$\\frac{${firstA.n}}{${firstA.d}} ${op1Sym} \\frac{${firstB.n}}{${firstB.d}} = \\frac{${sn}}{${sd}}$ (simplified). Then $\\frac{${sn}}{${sd}} ${op2Sym} \\frac{${n3}}{${d3}} = \\frac{${rn}}{${rd}}$.`,
      };
    }

    if (branch === "mixed-number") {
      // Mixed-number addition/subtraction — convert to improper fractions,
      // operate, then convert the answer back to a mixed number.
      const w1 = randInt(rng, 1, 6);
      const w2 = randInt(rng, 1, 6);
      const d1 = randChoice(rng, [2, 3, 4, 5, 6, 8]);
      const d2 = randChoice(rng, [2, 3, 4, 5, 6, 8]);
      const f1 = randInt(rng, 1, d1 - 1);
      const f2 = randInt(rng, 1, d2 - 1);
      const imp1 = w1 * d1 + f1;
      const imp2 = w2 * d2 + f2;
      const op = randChoice(rng, ["add", "sub"] as const);
      let a = { n: imp1, d: d1, w: w1, f: f1 };
      let b = { n: imp2, d: d2, w: w2, f: f2 };
      if (op === "sub" && imp1 / d1 < imp2 / d2) [a, b] = [b, a];
      const [rn, rd] = op === "add" ? addFrac(a.n, a.d, b.n, b.d) : subFrac(a.n, a.d, b.n, b.d);
      const wholePart = Math.floor(rn / rd);
      const fracPart = rn - wholePart * rd;
      const mixedAnswer = fracPart === 0 ? String(wholePart) : `${wholePart} ${fracPart}/${rd}`;
      const opSym = op === "add" ? "+" : "-";
      return {
        kind: "fill-blank",
        prompt: `Work out: $${a.w}\\frac{${a.f}}{${a.d}} ${opSym} ${b.w}\\frac{${b.f}}{${b.d}}$ (give your answer as a mixed number, e.g. "2 1/3")`,
        before: "Answer =",
        after: "",
        correctAnswer: mixedAnswer,
        acceptedAnswers: [formatFraction(rn, rd)],
        inputMode: "text",
        hint: "Convert each mixed number to an improper fraction first, then operate, then convert back.",
        explanation: `$${a.w}\\frac{${a.f}}{${a.d}} = \\frac{${a.n}}{${a.d}}$ and $${b.w}\\frac{${b.f}}{${b.d}} = \\frac{${b.n}}{${b.d}}$. $\\frac{${a.n}}{${a.d}} ${opSym} \\frac{${b.n}}{${b.d}} = \\frac{${rn}}{${rd}}$, which as a mixed number is ${mixedAnswer}.`,
      };
    }

    if (branch === "multiply-divide") {
      const d1 = randChoice(rng, [2, 3, 4, 5]);
      const d2 = randChoice(rng, [2, 3, 4, 5]);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      const op = randChoice(rng, ["multiply", "divide"] as const);
      const [rn, rd] = op === "multiply" ? mulFrac(n1, d1, n2, d2) : divFrac(n1, d1, n2, d2);
      const answer = formatFraction(rn, rd);
      const prompt =
        op === "multiply"
          ? `A tank is $\\frac{${n1}}{${d1}}$ full. $\\frac{${n2}}{${d2}}$ of that water is used today. What fraction of the whole tank was used?`
          : `A tailor has $\\frac{${n1}}{${d1}}$ m of ribbon left. Each bow needs $\\frac{${n2}}{${d2}}$ m. Work out $\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}$ to find how many bows can be made.`;
      const wrongCandidates = [
        formatFraction(n1 * n2, d1 * d2 === 0 ? 1 : d1 + d2),
        formatFraction(n2, d1),
        formatFraction(n1, d2),
        formatFraction(rn + 1, rd),
        formatFraction(rd, rn || 1),
      ];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, answer, wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex,
        layout: "row",
        hint: op === "multiply" ? "Multiply the numerators, then multiply the denominators." : "Multiplying by the reciprocal: flip the second fraction, then multiply.",
        explanation:
          op === "multiply"
            ? `$\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}} = \\frac{${n1 * n2}}{${d1 * d2}} = \\frac{${rn}}{${rd}}$.`
            : `$\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}} = \\frac{${n1 * d2}}{${d1 * n2}} = \\frac{${rn}}{${rd}}$.`,
      };
    }

    if (branch === "order") {
      const count = 4;
      const seen = new Set<string>();
      const fracs: [number, number][] = [];
      while (fracs.length < count) {
        const d = randChoice(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
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
        hint: "Convert to a common denominator, or compare as decimals, to compare fractions.",
        explanation: `In order: ${sorted.map(([n, d]) => `${n}/${d}`).join(", ")}.`,
      };
    }

    // half-sort: categorize fractions as less than or at least one half
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
