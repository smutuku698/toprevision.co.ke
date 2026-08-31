import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CONTEXTS = [
  { unit: "°C", noun: "temperature", place: "Nyeri" },
  { unit: "°C", noun: "temperature", place: "Mount Kenya's summit" },
  { unit: "m", noun: "elevation relative to sea level", place: "a point near Lake Turkana" },
  { unit: "KES", noun: "account balance", place: "a savings account" },
] as const;

function fmtTerm(n: number): string {
  return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

export const integers: Skill = {
  id: "g8-math-n-integers",
  code: "N.1",
  subjectId: "math",
  strandId: "g8-math-numbers",
  grade: 8,
  title: "Integers in real life",
  description: "Identify, represent, add, subtract, and order integers — from multi-step classical arithmetic to real-life situations like temperature, elevation, and money.",
  generate(rng) {
    const branch = randChoice(rng, ["plot", "classical-chain", "combine", "compare", "order", "sign-sort"] as const);

    if (branch === "plot") {
      const value = randInt(rng, -35, 35);
      const ctx = randChoice(rng, CONTEXTS);
      return {
        kind: "number-line",
        prompt: `The ${ctx.noun} at ${ctx.place} is ${value}${ctx.unit}. Click the point on the number line that shows this value.`,
        hint: "Negative values sit to the left of zero; positive values sit to the right.",
        min: -40,
        max: 40,
        step: 1,
        correctValue: value,
        mode: "point",
        explanation: `${value}${ctx.unit} is ${value < 0 ? `${Math.abs(value)} units to the left of` : value > 0 ? `${value} units to the right of` : "exactly at"} zero on the number line.`,
      };
    }

    if (branch === "classical-chain") {
      // A pure multi-term integer arithmetic chain, no real-world dressing —
      // this is the "classical" arithmetic that should come before word problems.
      const termCount = randChoice(rng, [3, 4] as const);
      const terms = Array.from({ length: termCount }, () => randInt(rng, -30, 30) || 7);
      const answer = terms.reduce((a, b) => a + b, 0);
      const exprParts = terms.map((t, i) => (i === 0 ? String(t) : fmtTerm(t)));
      const expr = exprParts.join(" ");
      const steps: string[] = [];
      let running = terms[0];
      for (let i = 1; i < terms.length; i++) {
        const before = running;
        running += terms[i];
        steps.push(`${before} ${fmtTerm(terms[i])} = ${running}`);
      }
      return {
        kind: "fill-blank",
        prompt: `Work out: $${expr}$`,
        before: "",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "Work left to right, one operation at a time. Keep track of the sign carefully.",
        explanation: `Step by step: ${steps.join("; ")}. Final answer: ${answer}.`,
      };
    }

    if (branch === "combine") {
      // Two sequential real-world changes, not just one — a single addition/
      // subtraction is too easy on its own at this level.
      const start = randInt(rng, -40, 40);
      const change1 = randInt(rng, -25, 25) || 5;
      const change2 = randInt(rng, -25, 25) || -6;
      const afterFirst = start + change1;
      const result = afterFirst + change2;
      const ctx = randChoice(rng, CONTEXTS);
      const verb = (c: number) => (c >= 0 ? `rises by ${c}` : `falls by ${Math.abs(c)}`);
      return {
        kind: "fill-blank",
        prompt: `The ${ctx.noun} at ${ctx.place} starts at ${start}${ctx.unit}. It then ${verb(change1)}${ctx.unit}, and after that ${verb(change2)}${ctx.unit}. What is the final ${ctx.noun}?`,
        before: "Final value =",
        after: ctx.unit,
        correctAnswer: String(result),
        inputMode: "numeric",
        hint: "Apply each change in order: first change, then the second change, to the running total.",
        explanation: `Start at ${start}. After the first change: $${start} ${fmtTerm(change1)} = ${afterFirst}$. After the second change: $${afterFirst} ${fmtTerm(change2)} = ${result}$${ctx.unit}.`,
      };
    }

    if (branch === "compare") {
      // Both values are forced into a range where sign reasoning actually
      // matters (never a trivial two-positive-digit comparison).
      const mode = randChoice(rng, ["both-negative", "mixed-sign"] as const);
      let a: number;
      let b: number;
      if (mode === "both-negative") {
        a = -randInt(rng, 1, 45);
        b = -randInt(rng, 1, 45);
        while (b === a) b = -randInt(rng, 1, 45);
      } else {
        a = -randInt(rng, 5, 40);
        b = randInt(rng, 1, 8); // close-magnitude-looking positive, forces real sign reasoning
        if (rng() < 0.5) [a, b] = [b, a];
      }
      const question = randChoice(rng, ["greater", "less"] as const);
      const answerIsA = question === "greater" ? a > b : a < b;
      const ctx = randChoice(rng, CONTEXTS);
      return {
        kind: "multiple-choice",
        prompt: `Two readings of ${ctx.noun} are recorded: ${a}${ctx.unit} and ${b}${ctx.unit}. Which value is ${question}?`,
        choices: [`${a}${ctx.unit}`, `${b}${ctx.unit}`],
        correctIndex: answerIsA ? 0 : 1,
        hint: "On a number line, values further right are greater; values further left are smaller — a negative number is always less than a positive one, and between two negatives, the one closer to zero is greater.",
        explanation: `Between ${a} and ${b}: ${a > b ? `${a} is to the right of ${b}` : `${b} is to the right of ${a}`} on the number line, so ${answerIsA ? a : b} is the ${question} value.`,
      };
    }

    if (branch === "order") {
      const count = randChoice(rng, [5, 6, 7] as const);
      const direction = randChoice(rng, ["ascending", "descending"] as const);
      const values = sampleDistinctInts(rng, -45, 45, count);
      const ctx = randChoice(rng, CONTEXTS);
      const items = values.map((v) => ({ id: `v${v}`, label: `${v}${ctx.unit}` }));
      const sorted = [...values].sort((a, b) => (direction === "ascending" ? a - b : b - a));
      const prompt =
        direction === "ascending"
          ? `Order these ${ctx.noun} readings from lowest to highest.`
          : `Order these ${ctx.noun} readings from highest to lowest.`;
      return {
        kind: "ordering",
        prompt,
        instruction: "Click them in order.",
        items: shuffle(rng, items),
        correctOrder: sorted.map((v) => `v${v}`),
        hint: "The most negative value is always the smallest.",
        explanation: `In order: ${sorted.map((v) => `${v}${ctx.unit}`).join(", ")}.`,
      };
    }

    // sign-sort: categorize into above/below a zero reference
    const count = 7;
    const values = sampleDistinctInts(rng, -40, 40, count, [0]);
    const ctx = randChoice(rng, CONTEXTS);
    const items = values.map((v) => ({ id: `v${v}`, label: `${v}${ctx.unit}` }));
    const buckets =
      ctx.noun === "account balance"
        ? [{ id: "credit", label: "In credit (above 0)" }, { id: "debit", label: "In debt (below 0)" }]
        : [{ id: "above", label: "Above 0" }, { id: "below", label: "Below 0" }];
    const correctBucket: Record<string, string> = {};
    for (const v of values) correctBucket[`v${v}`] = v > 0 ? buckets[0].id : buckets[1].id;
    return {
      kind: "categorize",
      prompt: `Sort these ${ctx.noun} readings from ${ctx.place} into the correct group.`,
      items: shuffle(rng, items),
      buckets,
      correctBucket,
      hint: "Positive integers are above zero; negative integers are below zero.",
      explanation: `${buckets[0].label}: ${values.filter((v) => v > 0).join(", ") || "none"}. ${buckets[1].label}: ${values.filter((v) => v < 0).join(", ") || "none"}.`,
    };
  },
};
