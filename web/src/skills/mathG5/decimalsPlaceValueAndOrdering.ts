import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import type { Skill } from "@/lib/types";

const DECIMAL_PLACES = ["tenths", "hundredths", "thousandths"] as const;

/** A decimal with 1-3 digits after the point, digits distinct, never trailing zero. */
function genDecimal(rng: RNG): { value: number; str: string; digits: number[] } {
  const places = randInt(rng, 1, 3);
  const whole = randInt(rng, 0, 99);
  const digits: number[] = [];
  const seen = new Set<number>();
  while (digits.length < places) {
    const d = randInt(rng, 1, 9);
    if (!seen.has(d)) {
      seen.add(d);
      digits.push(d);
    }
  }
  const str = `${whole}.${digits.join("")}`;
  return { value: Number(str), str, digits };
}

export const decimalsPlaceValueAndOrdering: Skill = {
  id: "g5-math-n-decimals-place-value-ordering",
  code: "N.15",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Place value and ordering of decimals",
  description: "Identify the place value of digits in decimals up to thousandths, and order decimals up to thousandths.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-place", "identify-digit-mc", "order", "compare-mc", "click-match", "categorize"] as const);

    if (branch === "identify-place") {
      const { str, digits } = genDecimal(rng);
      const idx = randInt(rng, 0, digits.length - 1);
      const digit = digits[idx];
      const placeName = DECIMAL_PLACES[idx];
      const openers = [
        `Look at the decimal ${str}.`,
        `Here is a decimal: ${str}.`,
        `Consider the decimal number ${str}.`,
        `Study this decimal: ${str}.`,
        `Take the decimal ${str}.`,
      ];
      const closers = [
        ` What is the place value of the digit ${digit}?`,
        ` Identify the place value of the digit ${digit}.`,
        ` Name the place value represented by the digit ${digit}.`,
        ` Which decimal place does the digit ${digit} sit in?`,
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Place value:",
        after: "",
        correctAnswer: placeName,
        acceptedAnswers: [placeName, placeName.slice(0, -1)],
        inputMode: "text",
        hint: "Count positions to the right of the decimal point: tenths, hundredths, thousandths.",
        explanation: `In ${str}, the digit ${digit} is ${idx + 1} place${idx > 0 ? "s" : ""} after the decimal point, in the ${placeName} place.`,
      };
    }

    if (branch === "identify-digit-mc") {
      const { str, digits } = genDecimal(rng);
      if (digits.length < 2) return this.generate(rng);
      const idx = randInt(rng, 0, digits.length - 1);
      const placeName = DECIMAL_PLACES[idx];
      const correctDigit = digits[idx];
      const otherDigits = digits.filter((_, i) => i !== idx).map(String);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correctDigit), otherDigits, Math.min(3, otherDigits.length));
      const openers = [`In the decimal ${str},`, `Looking at ${str},`, `For the number ${str},`, `Given ${str},`];
      const closers = [` which digit is in the ${placeName} place?`, ` what digit sits in the ${placeName} place?`, ` identify the digit occupying the ${placeName} place.`, ` name the digit in the ${placeName} position.`];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Count places from the decimal point, starting with tenths — the other digits are simply from the wrong position.",
        explanation: `Counting from the decimal point, the ${placeName} digit of ${str} is ${correctDigit}. The other choices are digits from different decimal places in the same number.`,
      };
    }

    if (branch === "order") {
      const items = pickDistinctDecimals(rng, 4);
      const sortedIdx = items.map((_, i) => i).sort((a, b) => items[a] - items[b]);
      const prompts = [
        "Order these decimals from smallest to largest.",
        "Arrange these decimals, starting with the smallest.",
        "Put these decimals in order from smallest to largest.",
        "Rank these decimals from smallest to largest.",
        "Sort these decimals into order, smallest first.",
        "Sequence these decimals from smallest to largest.",
        "Line up these decimals from the smallest to the largest.",
        "Place these decimals in order, beginning with the smallest.",
        "Which decimal is smallest? Order them all from there.",
        "Arrange these decimals from smallest to largest value.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest first.",
        items: shuffle(rng, items.map((v, i) => ({ id: `d${i}`, label: v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") }))),
        correctOrder: sortedIdx.map((i) => `d${i}`),
        hint: "Compare digit by digit from left to right — whole number part first, then tenths, hundredths, thousandths.",
        explanation: `In order: ${sortedIdx.map((i) => items[i].toFixed(3).replace(/0+$/, "").replace(/\.$/, "")).join(", ")}.`,
      };
    }

    if (branch === "compare-mc") {
      const a = pickDistinctDecimals(rng, 1)[0];
      let b = pickDistinctDecimals(rng, 1)[0];
      let attempts = 0;
      while (b === a && attempts < 10) {
        b = pickDistinctDecimals(rng, 1)[0];
        attempts++;
      }
      const symbol = a > b ? ">" : a < b ? "<" : "=";
      const wrong = [a > b ? "<" : ">", "="].filter((s) => s !== symbol);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, symbol, wrong, wrong.length);
      const aStr = a.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
      const bStr = b.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
      const openers = [`Compare ${aStr} and ${bStr}.`, `Which symbol correctly compares ${aStr} and ${bStr}?`, `${aStr} ___ ${bStr} — which symbol fits?`, `Fill in the correct comparison: ${aStr} ___ ${bStr}.`];
      const closers = ["", "Choose >, < or =.", "Pick the correct symbol.", "Which comparison is correct?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "A shorter decimal is not automatically smaller — compare place by place, padding with zeros if needed.",
        explanation: `Comparing digit by digit, ${aStr} ${symbol} ${bStr}. A common mistake is assuming a decimal with fewer digits is always smaller.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctDecimals(rng, 4);
      const tokens = chosen.map((v, i) => ({ id: `d${i}`, label: v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") }));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `d${i}`, label: `${Math.round(v * 1000)} thousandths` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`d${i}`] = `d${i}`));
      const prompts = [
        "Match each decimal to how many thousandths it equals.",
        "Pair each decimal with its value in thousandths.",
        "Match each decimal to its thousandths count.",
        "Connect each decimal to its equivalent in thousandths.",
        "Match each decimal card to its thousandths value.",
        "Pair up each decimal with its thousandths total.",
        "Match every decimal to its correct thousandths count.",
        "Link each decimal to the number of thousandths it represents.",
        "Match each decimal to its value expressed in thousandths.",
        "Connect each decimal with its thousandths equivalent.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Multiply the decimal by 1000 to find how many thousandths it equals.",
        explanation: chosen.map((v) => `${v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} = ${Math.round(v * 1000)} thousandths`).join("; ") + ".",
      };
    }

    // categorize
    const threshold = randChoice(rng, [1, 5, 10, 50] as const);
    const chosen = pickDistinctDecimals(rng, 6, threshold);
    const items = chosen.map((v, i) => ({ id: `d${i}`, label: v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") }));
    const buckets = [
      { id: "under", label: `Less than ${threshold}` },
      { id: "over", label: `${threshold} or more` },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((v, i) => (correctBucket[`d${i}`] = v < threshold ? "under" : "over"));
    const catPrompts = [
      `Sort each decimal by whether it is less than ${threshold}.`,
      `Group each decimal as under ${threshold}, or ${threshold} and above.`,
      `Classify each decimal: below ${threshold}, or ${threshold} and up.`,
      `Sort these decimals into two groups using ${threshold} as the cut-off.`,
      `Organise each decimal by whether it is under ${threshold}.`,
      `Decide whether each decimal is less than ${threshold}, or not.`,
      `Place each decimal in the correct group based on the ${threshold} cut-off.`,
      `Sort these decimals by size, using ${threshold} as the dividing line.`,
      `Which decimals are under ${threshold}? Sort them all.`,
      `Categorise each decimal as under ${threshold}, or ${threshold} or more.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Compare each decimal directly to the threshold value.",
      explanation: chosen.map((v) => `${v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} is ${v < threshold ? "less than" : "at least"} ${threshold}`).join("; ") + ".",
    };
  },
};

function pickDistinctDecimals(rng: RNG, count: number, maxWhole = 99): number[] {
  const seen = new Set<number>();
  const result: number[] = [];
  while (result.length < count) {
    const whole = randInt(rng, 0, maxWhole);
    const places = randInt(rng, 1, 3);
    const frac = randInt(rng, 1, 10 ** places - 1);
    const value = Number(`${whole}.${String(frac).padStart(places, "0")}`);
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}
