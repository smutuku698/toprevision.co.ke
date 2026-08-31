import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import { MEASUREMENT_DECIMAL_CONTEXTS, place } from "./contexts";
import type { Skill } from "@/lib/types";

export const decimalPercentagesAndOperations: Skill = {
  id: "g6-math-n-decimal-percentages-operations",
  code: "N.14",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Decimal percentages and operations",
  description: "Convert between decimals and percentages, and add and subtract decimals up to 4 decimal places, in real-life measurement situations.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["decimal-to-percent", "percent-to-decimal", "add-decimals", "sub-decimals", "reverse-add", "classify-magnitude", "match-decimal-percent", "order-measurements"] as const
    );

    if (branch === "decimal-to-percent") {
      const decimalValue = randInt(rng, 5, 95) / 100;
      const percent = decimalValue * 100;
      return {
        kind: "fill-blank",
        prompt: `Convert ${decimalValue} to a percentage.`,
        before: "",
        after: "%",
        correctAnswer: String(Math.round(percent * 100) / 100),
        inputMode: "numeric",
        hint: "Multiply the decimal by 100.",
        explanation: `${decimalValue} $\\times 100 = ${percent}\\%$.`,
      };
    }

    if (branch === "percent-to-decimal") {
      const percent = randChoice(rng, [5, 12, 25, 40, 55, 63, 78, 90, 8, 18, 32, 46, 58, 72, 84] as const);
      const decimalValue = percent / 100;
      return {
        kind: "fill-blank",
        prompt: `Convert ${percent}% to a decimal.`,
        before: "",
        after: "",
        correctAnswer: String(decimalValue),
        inputMode: "numeric",
        hint: "Divide the percentage by 100.",
        explanation: `${percent}% $\\div 100 = ${decimalValue}$.`,
      };
    }

    if (branch === "add-decimals") {
      const ctx = randChoice(rng, MEASUREMENT_DECIMAL_CONTEXTS);
      const a = randInt(rng, 5000, 99999) / 10000;
      const b = randInt(rng, 5000, 99999) / 10000;
      const result = Math.round((a + b) * 10000) / 10000;
      return {
        kind: "fill-blank",
        prompt: `${ctx.subject.replace("{place}", place(rng)).replace(/^./, (c) => c.toUpperCase())} was ${a} ${ctx.unit} on one occasion and ${b} ${ctx.unit} on another. Find the total.`,
        before: "",
        after: ctx.unit,
        correctAnswer: String(result),
        inputMode: "numeric",
        hint: "Line up the decimal points, then add.",
        explanation: `$${a} + ${b} = ${result}$ ${ctx.unit}.`,
      };
    }

    if (branch === "sub-decimals") {
      const ctx = randChoice(rng, MEASUREMENT_DECIMAL_CONTEXTS);
      const a = randInt(rng, 5000, 99999) / 10000;
      const b = randInt(rng, 5000, 99999) / 10000;
      const bigger = Math.max(a, b);
      const smaller = Math.min(a, b);
      const result = Math.round((bigger - smaller) * 10000) / 10000;
      return {
        kind: "fill-blank",
        prompt: `${ctx.subject.replace("{place}", place(rng)).replace(/^./, (c) => c.toUpperCase())} was ${bigger} ${ctx.unit} at first, then dropped to ${smaller} ${ctx.unit}. Find the difference.`,
        before: "",
        after: ctx.unit,
        correctAnswer: String(result),
        inputMode: "numeric",
        hint: "Line up the decimal points, then subtract the smaller from the larger.",
        explanation: `$${bigger} - ${smaller} = ${result}$ ${ctx.unit}.`,
      };
    }

    if (branch === "reverse-add") {
      const a = randInt(rng, 500, 9999) / 1000;
      const total = randInt(rng, 1, 15) + a + randInt(rng, 1, 999) / 1000;
      const roundedTotal = Math.round(total * 1000) / 1000;
      const b = Math.round((roundedTotal - a) * 1000) / 1000;
      const wrong = [String(Math.round((roundedTotal + a) * 1000) / 1000), String(a), String(Math.round((b + 1) * 1000) / 1000)];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(b), wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Two measurements add up to ${roundedTotal}. One of them is ${a}. Find the other measurement.`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Subtract the known measurement from the total.",
        explanation: `${roundedTotal} − ${a} = ${b}.`,
      };
    }

    if (branch === "classify-magnitude") {
      const benchmark = Number((randInt(rng, 10, 90) / 10).toFixed(1));
      const items = Array.from({ length: 5 }, () => {
        const value = Number((randInt(rng, 5, 200) / 10).toFixed(1));
        return { label: String(value), value };
      });
      const dedup = items.filter((it, i) => items.findIndex((o) => o.label === it.label) === i);
      const finalItems = dedup.map((it, i) => ({ id: `v${i}`, label: it.label }));
      const buckets = [
        { id: "over", label: `Greater than ${benchmark}` },
        { id: "under", label: `${benchmark} or less` },
      ];
      const correctBucket: Record<string, string> = {};
      dedup.forEach((it, i) => (correctBucket[`v${i}`] = it.value > benchmark ? "over" : "under"));
      return {
        kind: "categorize",
        prompt: `Sort each decimal value by whether it is greater than ${benchmark}, or ${benchmark} or less.`,
        items: finalItems,
        buckets,
        correctBucket,
        hint: "Compare the whole-number part first, then the decimal part.",
        explanation: dedup.map((it) => `${it.label} is ${it.value > benchmark ? "greater than" : "not greater than"} ${benchmark}`).join("; ") + ".",
      };
    }

    if (branch === "match-decimal-percent") {
      const percents = [5, 10, 20, 25, 40, 50, 60, 75, 80, 90] as const;
      const chosen = shuffle(rng, [...percents]).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: `${p}%` }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: String(p / 100) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each percentage to its decimal equivalent.",
        tokens,
        targets,
        correctMap,
        hint: "Divide each percentage by 100 to get the decimal.",
        explanation: chosen.map((p) => `${p}% = ${p / 100}`).join("; ") + ".",
      };
    }

    const count = 5;
    const valuesSet = new Set<number>();
    while (valuesSet.size < count) valuesSet.add(randInt(rng, 105, 9870));
    const ctx = randChoice(rng, MEASUREMENT_DECIMAL_CONTEXTS);
    const values = [...valuesSet].map((v) => v / 1000);
    const ascending = rng() < 0.5;
    const sorted = [...values].sort((a, b) => (ascending ? a - b : b - a));
    const items = values.map((v) => ({ id: String(v), label: `${v} ${ctx.unit}` }));
    return {
      kind: "ordering",
      prompt: `These are 5 recordings of ${ctx.subject.replace("{place}", place(rng))}. Arrange them in ${ascending ? "ascending (smallest to largest)" : "descending (largest to smallest)"} order.`,
      instruction: "Drag to arrange in order.",
      items: shuffle(rng, items),
      correctOrder: sorted.map((v) => String(v)),
      hint: "Compare the whole-number parts first, then each decimal place in turn.",
      explanation: `In ${ascending ? "ascending" : "descending"} order: ${sorted.map((v) => `${v} ${ctx.unit}`).join(", ")}.`,
    };
  },
};
