import { gcd, randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

function fmtLinear(coefX: number, constant: number, varName = "x"): string {
  if (coefX === 0) return String(constant);
  const xTerm = coefX === 1 ? varName : coefX === -1 ? `-${varName}` : `${coefX}${varName}`;
  if (constant === 0) return xTerm;
  return `${xTerm}${constant > 0 ? "+" : "-"}${Math.abs(constant)}`;
}
function fmtLinearSpaced(coefX: number, constant: number, varName = "x"): string {
  if (coefX === 0) return String(constant);
  const xTerm = coefX === 1 ? varName : coefX === -1 ? `-${varName}` : `${coefX}${varName}`;
  if (constant === 0) return xTerm;
  return `${xTerm} ${constant > 0 ? "+" : "-"} ${Math.abs(constant)}`;
}

export const algebraicExpressions: Skill = {
  id: "g8-math-a-algebraic-expressions",
  code: "A.1",
  subjectId: "math",
  strandId: "g8-math-algebra",
  grade: 8,
  title: "Algebraic expressions",
  description: "Evaluate, factorize, and simplify algebraic expressions and fractions.",
  generate(rng) {
    const branch = randChoice(rng, ["evaluate", "expand", "factorize", "simplify-fraction", "match-factor", "fully-factorized-sort"] as const);

    if (branch === "evaluate") {
      const a = randInt(rng, 2, 12);
      const b = randInt(rng, 2, 12);
      const c = randInt(rng, 1, 20);
      const x = randInt(rng, -8, 10);
      const y = randInt(rng, -8, 10);
      const form = randChoice(rng, ["square", "product", "linear"] as const);
      const expr = form === "square" ? `${a}x^2 - ${b}y + ${c}` : form === "product" ? `${a}xy - ${b}x + ${c}` : `${a}x + ${b}y - ${c}`;
      const answer = form === "square" ? a * x * x - b * y + c : form === "product" ? a * x * y - b * x + c : a * x + b * y - c;
      return {
        kind: "fill-blank",
        prompt: `Evaluate $${expr}$ when $x = ${x}$ and $y = ${y}$.`,
        before: "",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "Substitute the given values in place of x and y, then work out the arithmetic — watch the order of operations.",
        explanation:
          form === "square"
            ? `$${a}(${x})^2 - ${b}(${y}) + ${c} = ${a}\\times${x * x} - ${b * y} + ${c} = ${a * x * x} - ${b * y} + ${c} = ${answer}$.`
            : form === "product"
            ? `$${a}(${x})(${y}) - ${b}(${x}) + ${c} = ${a * x * y} - ${b * x} + ${c} = ${answer}$.`
            : `$${a}(${x}) + ${b}(${y}) - ${c} = ${a * x} + ${b * y} - ${c} = ${answer}$.`,
      };
    }

    if (branch === "expand") {
      // Expand two brackets and combine like terms — algebraic expansion, a
      // genuinely different skill from simplifying a single fraction.
      const k1 = randInt(rng, 2, 7);
      const a1 = randInt(rng, 1, 8);
      const b1 = randInt(rng, 1, 12);
      const k2 = randInt(rng, 2, 7);
      const a2 = randInt(rng, 1, 8);
      const b2 = randInt(rng, 1, 12);
      const op = randChoice(rng, ["add", "sub"] as const);
      const opSym = op === "add" ? "+" : "-";
      const coefX = op === "add" ? k1 * a1 + k2 * a2 : k1 * a1 - k2 * a2;
      const constant = op === "add" ? k1 * b1 + k2 * b2 : k1 * b1 - k2 * b2;
      const answer = fmtLinear(coefX, constant);
      return {
        kind: "fill-blank",
        prompt: `Expand and simplify: $${k1}(${a1}x + ${b1}) ${opSym} ${k2}(${a2}x + ${b2})$`,
        before: "",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [fmtLinearSpaced(coefX, constant)],
        inputMode: "text",
        hint: "Expand each bracket first (multiply everything inside by the number outside), then collect like terms.",
        explanation: `$${k1}(${a1}x + ${b1}) = ${k1 * a1}x + ${k1 * b1}$. $${k2}(${a2}x + ${b2}) = ${k2 * a2}x + ${k2 * b2}$. Combining: $${k1 * a1}x ${opSym} ${k2 * a2}x = ${coefX}x$, and $${k1 * b1} ${opSym} ${k2 * b2} = ${constant}$. Result: ${answer}.`,
      };
    }

    if (branch === "factorize") {
      const k = randInt(rng, 2, 12);
      const p = randInt(rng, 1, 11);
      let q = randInt(rng, 1, 11);
      while (p === q) q = randInt(rng, 1, 11);
      const a = k * p;
      const b = k * q;
      const answer = `${k}(${p}x+${q})`;
      const wrongCandidates = [`${k}(${p}x-${q})`, `${p}(${k}x+${q})`, `${k + 1}(${p}x+${q})`, `${k}(${p}x+${q + 1})`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, answer, wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `Factorize fully: $${a}x + ${b}$`,
        choices,
        correctIndex,
        layout: "list",
        hint: `Find the greatest common factor of ${a} and ${b}.`,
        explanation: `The greatest common factor of ${a} and ${b} is ${k}. $${a}x + ${b} = ${k}(${p}x + ${q})$.`,
      };
    }

    if (branch === "simplify-fraction") {
      const form = randChoice(rng, ["linear", "monomial"] as const);
      if (form === "linear") {
        const c = randInt(rng, 2, 6);
        const p = randInt(rng, 1, 8);
        const q = randInt(rng, 1, 8);
        const a = c * p;
        const b = c * q;
        const answer = fmtLinear(p, q);
        return {
          kind: "fill-blank",
          prompt: `Simplify: $\\dfrac{${a}x + ${b}}{${c}}$`,
          before: "",
          after: "",
          correctAnswer: answer,
          acceptedAnswers: [fmtLinearSpaced(p, q)],
          inputMode: "text",
          hint: `Divide each term in the numerator by ${c}.`,
          explanation: `$\\dfrac{${a}x + ${b}}{${c}} = \\dfrac{${a}x}{${c}} + \\dfrac{${b}}{${c}} = ${p}x + ${q}$.`,
        };
      }
      const coef = randInt(rng, 2, 9);
      const divisor = randInt(rng, 2, 6);
      const numCoef = coef * divisor;
      const answer = coef === 1 ? "x" : `${coef}x`;
      return {
        kind: "fill-blank",
        prompt: `Simplify: $\\dfrac{${numCoef}x^2}{${divisor}x}$`,
        before: "",
        after: "",
        correctAnswer: answer,
        inputMode: "text",
        hint: `Divide the coefficients (${numCoef} ÷ ${divisor}), and subtract the powers of x.`,
        explanation: `$\\dfrac{${numCoef}x^2}{${divisor}x} = \\dfrac{${numCoef}}{${divisor}}x^{2-1} = ${coef}x$.`,
      };
    }

    if (branch === "match-factor") {
      const pairCount = randChoice(rng, [3, 4] as const);
      const ks = sampleDistinctInts(rng, 2, 9, pairCount);
      const tokens = ks.map((k) => {
        const p = randInt(rng, 1, 7);
        const q = randInt(rng, 1, 7);
        return { k, p, q, a: k * p, b: k * q };
      });
      const expressionTokens = tokens.map((t) => ({ id: `e${t.k}-${t.p}-${t.q}`, label: `${t.a}x + ${t.b}` }));
      const factorTargets = shuffle(rng, tokens.map((t) => ({ id: `f${t.k}-${t.p}-${t.q}`, label: `${t.k}(${t.p}x + ${t.q})` })));
      const correctMap: Record<string, string> = {};
      for (const t of tokens) correctMap[`f${t.k}-${t.p}-${t.q}`] = `e${t.k}-${t.p}-${t.q}`;
      return {
        kind: "click-match",
        prompt: "Match each expression to its fully factorized form.",
        tokens: shuffle(rng, expressionTokens),
        targets: factorTargets,
        correctMap,
        hint: "Find the greatest common factor of each expression's terms.",
        explanation: tokens.map((t) => `${t.a}x + ${t.b} = ${t.k}(${t.p}x + ${t.q})`).join("; ") + ".",
      };
    }

    // fully-factorized-sort: categorize expressions as fully factorized or not
    const fullyFactorized = Array.from({ length: 3 }, () => {
      const k = randInt(rng, 2, 9);
      const p = randInt(rng, 1, 7);
      let q = randInt(rng, 1, 7);
      while (gcd(p, q) !== 1) q = randInt(rng, 1, 7);
      return `${k}(${p}x+${q})`;
    });
    const notFactorized = Array.from({ length: 3 }, () => {
      const k = randInt(rng, 2, 6);
      const p = randInt(rng, 2, 6);
      const q = randInt(rng, 2, 6);
      return `${k * p}x+${k * q}`;
    });
    const items = shuffle(rng, [...fullyFactorized, ...notFactorized]).map((expr, i) => ({ id: `x${i}-${expr}`, label: expr }));
    const buckets = [
      { id: "full", label: "Fully factorized" },
      { id: "more", label: "Can still be factorized" },
    ];
    const correctBucket: Record<string, string> = {};
    for (const item of items) {
      correctBucket[item.id] = fullyFactorized.includes(item.label) ? "full" : "more";
    }
    return {
      kind: "categorize",
      prompt: "Sort each expression by whether it is already fully factorized.",
      items,
      buckets,
      correctBucket,
      hint: "An expression is fully factorized when the terms inside the brackets share no more common factors.",
      explanation: "An expression like 6(2x+3) is fully factorized (2 and 3 share no common factor), but 12x+18 still has a common factor of 6 to pull out.",
    };
  },
};
