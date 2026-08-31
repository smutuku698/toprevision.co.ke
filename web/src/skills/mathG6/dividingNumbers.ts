import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import { SHARING_CONTEXTS, place } from "./contexts";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** A clean (no-remainder) division: dividend up to 4 digits, divisor up to 3 digits, dividend > divisor. */
function genDivision(rng: () => number) {
  const divisor = randInt(rng, 12, 480);
  const rawQuotient = randInt(rng, 11, 95);
  const maxQuotient = Math.max(2, Math.floor(9999 / divisor));
  const quotient = Math.min(rawQuotient, maxQuotient);
  return { divisor, quotient, dividend: divisor * quotient };
}

export const dividingNumbers: Skill = {
  id: "g6-math-n-dividing-numbers",
  code: "N.7",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Dividing numbers",
  description: "Divide up to a 4-digit number by up to a 3-digit number, in real-life sharing and distribution situations.",
  generate(rng) {
    const branch = randChoice(rng, ["classical", "real-world-fill", "real-world-mc", "match-quotients", "remainder-sort", "order-quotients"] as const);

    if (branch === "classical") {
      const { divisor, quotient, dividend } = genDivision(rng);
      return {
        kind: "fill-blank",
        prompt: `Find $${fmt(dividend)} \\div ${divisor}$.`,
        before: "Answer =",
        after: "",
        correctAnswer: String(quotient),
        inputMode: "numeric",
        hint: "Use long division: how many times does the divisor fit into the dividend?",
        explanation: `$${fmt(dividend)} \\div ${divisor} = ${quotient}$, since ${divisor} × ${quotient} = ${fmt(dividend)}.`,
      };
    }

    if (branch === "real-world-fill") {
      const { divisor, quotient, dividend } = genDivision(rng);
      const ctx = randChoice(rng, SHARING_CONTEXTS);
      const pl = place(rng);
      return {
        kind: "fill-blank",
        prompt: `In ${pl}, a total of ${fmt(dividend)} ${ctx.totalLabel} are shared equally among ${divisor} ${ctx.groupLabel}. How many does each get?`,
        before: "Each share =",
        after: "",
        correctAnswer: String(quotient),
        inputMode: "numeric",
        hint: `Divide the total by the number of shares: ${fmt(dividend)} ÷ ${divisor}.`,
        explanation: `Each share $= ${fmt(dividend)} \\div ${divisor} = ${quotient}$.`,
      };
    }

    if (branch === "real-world-mc") {
      const { divisor, quotient, dividend } = genDivision(rng);
      const ctx = randChoice(rng, SHARING_CONTEXTS);
      const pl = place(rng);
      const wrongOffPlace = quotient * 10; // misplaced a digit in the long-division working
      const wrongPlusOne = quotient + 1;
      const wrongMinusOne = quotient > 1 ? quotient - 1 : quotient + 2;
      const candidates = [...new Set([wrongOffPlace, wrongPlusOne, wrongMinusOne])].filter((v) => v !== quotient && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(quotient), candidates.map(String), Math.min(3, candidates.length));
      return {
        kind: "multiple-choice",
        prompt: `In ${pl}, ${fmt(dividend)} ${ctx.totalLabel} must be shared equally among ${divisor} ${ctx.groupLabel}. How many does each get?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Work through the long division one digit at a time — check you haven't shifted a digit's place.",
        explanation: `${fmt(dividend)} ÷ ${divisor} = ${quotient}, since ${divisor} × ${quotient} = ${fmt(dividend)}.`,
      };
    }

    if (branch === "match-quotients") {
      const seen = new Set<string>();
      const divisions: { divisor: number; quotient: number; dividend: number }[] = [];
      while (divisions.length < 4) {
        const d = genDivision(rng);
        const key = `${d.dividend}-${d.divisor}`;
        if (!seen.has(key)) {
          seen.add(key);
          divisions.push(d);
        }
      }
      const tokens = divisions.map((d, i) => ({ id: `e${i}`, label: `${fmt(d.dividend)} ÷ ${d.divisor}` }));
      const targets = shuffle(rng, divisions.map((d, i) => ({ id: `q${i}`, label: String(d.quotient) })));
      const correctMap: Record<string, string> = {};
      divisions.forEach((d, i) => (correctMap[`q${i}`] = `e${i}`));
      return {
        kind: "click-match",
        prompt: "Match each division to its quotient.",
        tokens,
        targets,
        correctMap,
        hint: "Work out each division, or check by multiplying the quotient back by the divisor.",
        explanation: divisions.map((d) => `${fmt(d.dividend)} ÷ ${d.divisor} = ${d.quotient}`).join("; ") + ".",
      };
    }

    if (branch === "remainder-sort") {
      const items: { id: string; dividend: number; divisor: number; hasRemainder: boolean }[] = [];
      for (let i = 0; i < 6; i++) {
        const { divisor, dividend: cleanDividend } = genDivision(rng);
        const addRemainder = rng() < 0.5 && divisor > 1;
        const remainder = addRemainder ? randInt(rng, 1, divisor - 1) : 0;
        const dividend = Math.min(9999, cleanDividend + remainder);
        items.push({ id: `d${i}`, dividend, divisor, hasRemainder: dividend % divisor !== 0 });
      }
      const buckets = [
        { id: "even", label: "Divides evenly (no remainder)" },
        { id: "remainder", label: "Leaves a remainder" },
      ];
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.hasRemainder ? "remainder" : "even"));
      return {
        kind: "categorize",
        prompt: "Sort each division by whether it divides evenly or leaves a remainder.",
        items: items.map((it) => ({ id: it.id, label: `${fmt(it.dividend)} ÷ ${it.divisor}` })),
        buckets,
        correctBucket,
        hint: "Check whether the divisor divides the dividend an exact whole number of times.",
        explanation: items.map((it) => `${fmt(it.dividend)} ÷ ${it.divisor} ${it.hasRemainder ? `leaves a remainder of ${it.dividend % it.divisor}` : "divides evenly"}`).join("; ") + ".",
      };
    }

    // order-quotients: order division expressions by their quotient, smallest to largest.
    const seen = new Set<string>();
    const divisions: { id: string; divisor: number; quotient: number; dividend: number }[] = [];
    let i = 0;
    while (divisions.length < 5) {
      const d = genDivision(rng);
      const key = `${d.dividend}-${d.divisor}`;
      if (!seen.has(key)) {
        seen.add(key);
        divisions.push({ id: `o${i}`, ...d });
        i++;
      }
    }
    const sorted = [...divisions].sort((a, b) => a.quotient - b.quotient);
    return {
      kind: "ordering",
      prompt: "Order these divisions from smallest to largest quotient.",
      instruction: "Click them in order, smallest quotient first.",
      items: shuffle(rng, divisions).map((d) => ({ id: d.id, label: `${fmt(d.dividend)} ÷ ${d.divisor}` })),
      correctOrder: sorted.map((d) => d.id),
      hint: "Work out each quotient before comparing.",
      explanation: sorted.map((d) => `${fmt(d.dividend)} ÷ ${d.divisor} = ${d.quotient}`).join("; ") + ".",
    };
  },
};
