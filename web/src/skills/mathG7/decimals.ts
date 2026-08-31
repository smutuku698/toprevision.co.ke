import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const DECIMAL_PLACES = ["tenths", "hundredths", "thousandths"];

function digitAtDecimalPlace(value: string, placeIndex: number): number {
  const [, frac = ""] = value.split(".");
  return Number(frac[placeIndex] ?? "0");
}

function randDecimal(rng: () => number, wholeMax: number, places: number): string {
  const whole = Math.floor(rng() * wholeMax);
  let frac = "";
  for (let i = 0; i < places; i++) frac += Math.floor(rng() * 10);
  return `${whole}.${frac}`;
}

export const decimals: Skill = {
  id: "g7-math-n-decimals",
  code: "N.4",
  subjectId: "math",
  strandId: "g7-math-numbers",
  grade: 7,
  title: "Decimals",
  description: "Place value and total value of digits in decimals, and multiplying and dividing decimals by whole numbers and by other decimals.",
  generate(rng) {
    const branch = randChoice(rng, ["place-value", "multiply-divide", "reverse-multiply", "order", "compare-sort", "match-names"] as const);

    if (branch === "place-value") {
      const value = randDecimal(rng, 900, 3);
      const placeIndex = randInt(rng, 0, 2);
      const digit = digitAtDecimalPlace(value, placeIndex);
      const totalValue = digit / 10 ** (placeIndex + 1);
      return {
        kind: "fill-blank",
        prompt: `In the number ${value}, what is the total value of the digit in the ${DECIMAL_PLACES[placeIndex]} place?`,
        before: "Total value =",
        after: "",
        correctAnswer: String(totalValue),
        inputMode: "numeric",
        hint: `The ${DECIMAL_PLACES[placeIndex]} place is the ${placeIndex + 1}${placeIndex === 0 ? "st" : placeIndex === 1 ? "nd" : "rd"} digit after the decimal point.`,
        explanation: `The digit in the ${DECIMAL_PLACES[placeIndex]} place of ${value} is ${digit}, so its total value is ${totalValue}.`,
      };
    }

    if (branch === "multiply-divide") {
      const a = (randInt(rng, 12, 95) / 10).toFixed(1);
      const b = randInt(rng, 2, 12);
      const op = randChoice(rng, ["multiply", "divide"] as const);
      const answer = op === "multiply" ? Number(a) * b : Number(a) / b;
      const roundedAnswer = Math.round(answer * 1000) / 1000;
      return {
        kind: "fill-blank",
        prompt: op === "multiply" ? `A packet of sweets costs KES ${a}. Find the total cost of ${b} packets.` : `A rope of length ${a} m is cut into ${b} equal pieces. Find the length of each piece.`,
        before: "Answer =",
        after: op === "multiply" ? "" : "m",
        correctAnswer: String(roundedAnswer),
        inputMode: "numeric",
        hint: op === "multiply" ? `Multiply ${a} by ${b}.` : `Divide ${a} by ${b}.`,
        explanation: op === "multiply" ? `${a} × ${b} = ${roundedAnswer}.` : `${a} ÷ ${b} = ${roundedAnswer}.`,
      };
    }

    if (branch === "reverse-multiply") {
      // Reverse-direction: given the decimal product, find the missing decimal factor.
      const factor = (randInt(rng, 15, 45) / 10).toFixed(1);
      const other = randInt(rng, 3, 9);
      const product = Math.round(Number(factor) * other * 100) / 100;
      const round2 = (n: number) => Math.round(n * 100) / 100;
      const wrong = [String(round2(product / (other + 1))), String(round2(product * 2)), String(round2(Number(factor) + 1)), String(round2(product - other))];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, factor, wrong);
      return {
        kind: "multiple-choice",
        prompt: `A number multiplied by ${other} gives ${product}. What is the number?`,
        choices,
        correctIndex,
        layout: "row",
        hint: `Divide ${product} by ${other} to find the missing number.`,
        explanation: `${product} ÷ ${other} = ${factor}, so the missing number is ${factor}.`,
      };
    }

    if (branch === "order") {
      const values = new Set<string>();
      while (values.size < 4) values.add(randDecimal(rng, 30, 2));
      const arr = [...values];
      const items = arr.map((v) => ({ id: v, label: v }));
      const sorted = [...arr].sort((a, b) => Number(a) - Number(b));
      return {
        kind: "ordering",
        prompt: "Arrange these decimal numbers from smallest to largest.",
        instruction: "Click them in order, smallest first.",
        items: shuffle(rng, items),
        correctOrder: sorted,
        hint: "Compare the whole-number part first, then compare digit by digit after the decimal point.",
        explanation: `In order: ${sorted.join(", ")}.`,
      };
    }

    if (branch === "compare-sort") {
      const benchmark = (randInt(rng, 30, 80) / 10).toFixed(1);
      const values = new Set<string>();
      while (values.size < 6) values.add(randDecimal(rng, 12, 2));
      const arr = [...values];
      const items = arr.map((v) => ({ id: v, label: v }));
      const buckets = [
        { id: "above", label: `Greater than ${benchmark}` },
        { id: "below", label: `Less than or equal to ${benchmark}` },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of arr) correctBucket[v] = Number(v) > Number(benchmark) ? "above" : "below";
      return {
        kind: "categorize",
        prompt: `Sort each decimal number by whether it is greater than ${benchmark}.`,
        items,
        buckets,
        correctBucket,
        hint: "Line up the decimal points, then compare digit by digit from the left.",
        explanation: arr.map((v) => `${v} is ${Number(v) > Number(benchmark) ? "greater than" : "less than or equal to"} ${benchmark}`).join("; ") + ".",
      };
    }

    // match-names: match a decimal place-value column name to what it means
    const pairs = sampleDistinctInts(rng, 0, 2, 3).map((i) => ({ name: DECIMAL_PLACES[i], meaning: [`1/10 of a whole`, `1/100 of a whole`, `1/1000 of a whole`][i] }));
    const tokens = pairs.map((p) => ({ id: `n-${p.name}`, label: p.name }));
    const targets = shuffle(rng, pairs.map((p) => ({ id: `m-${p.name}`, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of pairs) correctMap[`m-${p.name}`] = `n-${p.name}`;
    return {
      kind: "click-match",
      prompt: "Match each decimal place-value name to what it represents.",
      tokens,
      targets,
      correctMap,
      hint: "Each place to the right of the decimal point is ten times smaller than the one before it.",
      explanation: pairs.map((p) => `${p.name} = ${p.meaning}`).join("; ") + ".",
    };
  },
};
