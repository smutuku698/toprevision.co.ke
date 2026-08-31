import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

interface Expr {
  tex: string;
  correct: number;
  wrongLTR?: number; // result if solved strictly left-to-right, ignoring operator precedence
  wrongNoBracket?: number; // result if the brackets are ignored
  category: "bracket" | "mult-div" | "add-sub-only";
}

function TA(rng: RNG): Expr {
  const a = randInt(rng, 10, 300);
  const b = randInt(rng, 2, 20);
  const c = randInt(rng, 2, 20);
  return { tex: `${a} + ${b} \\times ${c}`, correct: a + b * c, wrongLTR: (a + b) * c, category: "mult-div" };
}
function TB(rng: RNG): Expr {
  const a = randInt(rng, 2, 20);
  const b = randInt(rng, 2, 20);
  const c = randInt(rng, 10, 300);
  return { tex: `${a} \\times ${b} + ${c}`, correct: a * b + c, wrongLTR: a * (b + c), category: "mult-div" };
}
function TC(rng: RNG): Expr {
  let a = randInt(rng, 8, 20);
  let b = randInt(rng, 8, 20);
  let c = randInt(rng, 2, 10);
  let d = randInt(rng, 2, 10);
  if (a * b <= c * d) {
    [a, c] = [c, a];
    [b, d] = [d, b];
  }
  return { tex: `${a} \\times ${b} - ${c} \\times ${d}`, correct: a * b - c * d, wrongLTR: (a * b - c) * d, category: "mult-div" };
}
function TD(rng: RNG): Expr {
  const a = randInt(rng, 2, 50);
  const b = randInt(rng, 2, 50);
  const c = randInt(rng, 2, 20);
  return { tex: `(${a} + ${b}) \\times ${c}`, correct: (a + b) * c, wrongNoBracket: a + b * c, category: "bracket" };
}
function TF(rng: RNG): Expr {
  const a = randInt(rng, 2, 20);
  const b = randInt(rng, 10, 60);
  const c = randInt(rng, 2, 9);
  return { tex: `${a} \\times (${b} - ${c})`, correct: a * (b - c), wrongNoBracket: a * b - c, category: "bracket" };
}
function TE(rng: RNG): Expr {
  const a = randInt(rng, 100, 900);
  const b = randInt(rng, 2, 90);
  const c = randInt(rng, 2, 90);
  return { tex: `${a} - ${b} + ${c}`, correct: a - b + c, category: "add-sub-only" };
}

export const combinedOperations: Skill = {
  id: "g6-math-n-combined-operations",
  code: "N.9",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Combined operations",
  description: "Perform combined operations involving addition, subtraction, multiplication and division, up to 3-digit numbers, following the correct order of operations.",
  generate(rng) {
    const branch = randChoice(rng, ["evaluate-fill", "evaluate-bracket-fill", "evaluate-mc-ltr", "evaluate-mc-bracket", "order-steps", "categorize-first-op", "match-results"] as const);

    if (branch === "evaluate-fill") {
      const expr = randChoice(rng, [TA, TB, TC, TE])(rng);
      return {
        kind: "fill-blank",
        prompt: `Work out: $${expr.tex}$`,
        before: "Answer =",
        after: "",
        correctAnswer: String(expr.correct),
        inputMode: "numeric",
        hint: "Multiplication and division come before addition and subtraction (unless there are brackets).",
        explanation: `$${expr.tex} = ${expr.correct}$.`,
      };
    }

    if (branch === "evaluate-bracket-fill") {
      const expr = randChoice(rng, [TD, TF])(rng);
      return {
        kind: "fill-blank",
        prompt: `Work out: $${expr.tex}$`,
        before: "Answer =",
        after: "",
        correctAnswer: String(expr.correct),
        inputMode: "numeric",
        hint: "Always work out what is inside the brackets first.",
        explanation: `$${expr.tex} = ${expr.correct}$.`,
      };
    }

    if (branch === "evaluate-mc-ltr") {
      const expr = randChoice(rng, [TA, TB, TC])(rng);
      const delta1 = expr.correct + randInt(rng, 1, 9);
      const delta2 = Math.max(0, expr.correct - randInt(rng, 1, 9));
      const candidates = [...new Set([expr.wrongLTR!, delta1, delta2])].filter((v) => v !== expr.correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(expr.correct), candidates.map(String), Math.min(3, candidates.length));
      return {
        kind: "multiple-choice",
        prompt: `Work out: $${expr.tex}$`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Do the multiplication or division first, then the addition or subtraction — don't just work left to right.",
        explanation: `$${expr.tex} = ${expr.correct}$. Working strictly left to right without following order of operations gives the wrong answer ${expr.wrongLTR}.`,
      };
    }

    if (branch === "evaluate-mc-bracket") {
      const expr = randChoice(rng, [TD, TF])(rng);
      const delta1 = expr.correct + randInt(rng, 1, 9);
      const delta2 = Math.max(0, expr.correct - randInt(rng, 1, 9));
      const candidates = [...new Set([expr.wrongNoBracket!, delta1, delta2])].filter((v) => v !== expr.correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(expr.correct), candidates.map(String), Math.min(3, candidates.length));
      return {
        kind: "multiple-choice",
        prompt: `Work out: $${expr.tex}$`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Work out the brackets first — they always take priority over multiplication and division.",
        explanation: `$${expr.tex} = ${expr.correct}$. Ignoring the brackets and using the usual order of operations instead gives the wrong answer ${expr.wrongNoBracket}.`,
      };
    }

    if (branch === "order-steps") {
      const a = randInt(rng, 20, 300);
      const b = randInt(rng, 2, 20);
      const c = randInt(rng, 2, 20);
      const e = randInt(rng, 2, 10);
      const k = randInt(rng, 2, 20);
      const d = k * e;
      const bc = b * c;
      const steps = [
        { id: "first", label: `Work out ${b} × ${c} and ${d} ÷ ${e} first (multiplication and division)` },
        { id: "second", label: `Add the result of ${b} × ${c} (= ${bc}) to ${a}` },
        { id: "third", label: `Subtract the result of ${d} ÷ ${e} (= ${k}) from that total` },
      ];
      return {
        kind: "ordering",
        prompt: `To solve $${a} + ${b} \\times ${c} - ${d} \\div ${e}$ correctly, put these steps in the right order.`,
        instruction: "Click the steps in the order you should perform them.",
        items: shuffle(rng, steps),
        correctOrder: steps.map((s) => s.id),
        hint: "Multiplication and division always come before addition and subtraction, no matter which order they're written in.",
        explanation: `$${a} + ${b} \\times ${c} - ${d} \\div ${e} = ${a} + ${bc} - ${k} = ${a + bc - k}$.`,
      };
    }

    if (branch === "categorize-first-op") {
      const chosen: Expr[] = shuffle(rng, [randChoice(rng, [TD, TF])(rng), randChoice(rng, [TD, TF])(rng), randChoice(rng, [TA, TB, TC])(rng), randChoice(rng, [TA, TB, TC])(rng), TE(rng), TE(rng)]);
      const items = chosen.map((e, i) => ({ id: `c${i}`, label: e.tex }));
      const buckets = [
        { id: "bracket", label: "Brackets first" },
        { id: "mult-div", label: "Multiplication/division first" },
        { id: "add-sub-only", label: "Only +/− — work left to right" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`c${i}`] = e.category));
      return {
        kind: "categorize",
        prompt: "Sort each expression by what you should do FIRST to solve it.",
        items,
        buckets,
        correctBucket,
        hint: "Brackets always come first; otherwise multiplication/division comes before addition/subtraction; if there's only + and −, work left to right.",
        explanation: chosen.map((e) => `$${e.tex}$: ${e.category === "bracket" ? "brackets first" : e.category === "mult-div" ? "multiplication/division first" : "only +/−, so work left to right"}`).join("; ") + ".",
      };
    }

    // match-results: match expressions to their evaluated results.
    const seen = new Set<number>();
    const exprs: Expr[] = [];
    while (exprs.length < 4) {
      const e = randChoice(rng, [TA, TB, TC, TE])(rng);
      if (!seen.has(e.correct)) {
        seen.add(e.correct);
        exprs.push(e);
      }
    }
    const tokens = exprs.map((e, i) => ({ id: `e${i}`, label: e.tex }));
    const targets = shuffle(rng, exprs.map((e, i) => ({ id: `r${i}`, label: String(e.correct) })));
    const correctMap: Record<string, string> = {};
    exprs.forEach((e, i) => (correctMap[`r${i}`] = `e${i}`));
    return {
      kind: "click-match",
      prompt: "Match each expression to its correct value.",
      tokens,
      targets,
      correctMap,
      hint: "Follow the order of operations for each expression before matching.",
      explanation: exprs.map((e) => `${e.tex} = ${e.correct}`).join("; ") + ".",
    };
  },
};
