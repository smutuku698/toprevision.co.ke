import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import { COUNT_SCENARIO_SUBJECTS, fillPlace } from "./contexts";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}
function roundToNearest(n: number, unit: number): number {
  return Math.round(n / unit) * unit;
}

export const orderingAndRoundingNumbers: Skill = {
  id: "g6-math-n-ordering-rounding",
  code: "N.3",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Ordering and rounding numbers",
  description: "Order numbers up to 100,000 and round them off to the nearest thousand, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["order-numbers", "round-fill-blank", "round-multiple-choice", "round-direction", "real-world-round", "match-round", "round-number-line"] as const);

    if (branch === "order-numbers") {
      const nums = new Set<number>();
      while (nums.size < 5) nums.add(randInt(rng, 101, 100000));
      const values = [...nums];
      const descending = rng() < 0.5;
      const sorted = [...values].sort((a, b) => (descending ? b - a : a - b));
      return {
        kind: "ordering",
        prompt: `Order these numbers from ${descending ? "largest to smallest" : "smallest to largest"}.`,
        instruction: `Click them in order, ${descending ? "largest" : "smallest"} first.`,
        items: shuffle(rng, values.map((n) => ({ id: String(n), label: fmt(n) }))),
        correctOrder: sorted.map(String),
        hint: "Compare the digits from the left-most (biggest) place value first.",
        explanation: `${descending ? "Largest to smallest" : "Smallest to largest"}: ${sorted.map(fmt).join(", ")}.`,
      };
    }

    if (branch === "round-fill-blank") {
      const n = randInt(rng, 1050, 99500);
      const rounded = roundToNearest(n, 1000);
      return {
        kind: "fill-blank",
        prompt: `Round ${fmt(n)} to the nearest thousand.`,
        before: "Rounded value =",
        after: "",
        correctAnswer: String(rounded),
        inputMode: "numeric",
        hint: "Look at the hundreds digit: 500 or more rounds up, below 500 rounds down.",
        explanation: `${fmt(n)} rounds to ${fmt(rounded)}, since the hundreds digit is ${Math.floor((n % 1000) / 100)}.`,
      };
    }

    if (branch === "round-multiple-choice") {
      const n = randInt(rng, 1050, 99500);
      const correct = roundToNearest(n, 1000);
      const wrong = [String(roundToNearest(n, 100)), String(roundToNearest(n, 10000)), String(correct + 1000), String(correct - 1000)].filter((w) => w !== String(correct));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), [...new Set(wrong)].map((w) => fmt(Number(w))));
      return {
        kind: "multiple-choice",
        prompt: `Round ${fmt(n)} to the nearest thousand.`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Rounding to the nearest THOUSAND means the answer must end in 000 — check the hundreds digit to decide up or down.",
        explanation: `${fmt(n)} rounds to ${fmt(correct)}. The wrong options round to the nearest hundred or ten-thousand instead, or shift a whole thousand too far.`,
      };
    }

    if (branch === "round-direction") {
      const nums = Array.from({ length: 6 }, () => randInt(rng, 1050, 99500));
      const items = nums.map((n, i) => ({ id: `n${i}`, label: fmt(n) }));
      const buckets = [
        { id: "up", label: "Rounds UP to the next thousand" },
        { id: "down", label: "Rounds DOWN to the current thousand" },
      ];
      const correctBucket: Record<string, string> = {};
      nums.forEach((n, i) => (correctBucket[`n${i}`] = (n % 1000) / 100 >= 5 ? "up" : "down"));
      return {
        kind: "categorize",
        prompt: "Sort each number by whether it rounds up or down when rounded to the nearest thousand.",
        items,
        buckets,
        correctBucket,
        hint: "If the hundreds digit is 5, 6, 7, 8 or 9, it rounds up. If it is 0, 1, 2, 3 or 4, it rounds down.",
        explanation: nums.map((n) => `${fmt(n)} rounds ${(n % 1000) / 100 >= 5 ? "up" : "down"} (hundreds digit is ${Math.floor((n % 1000) / 100)})`).join("; ") + ".",
      };
    }

    if (branch === "real-world-round") {
      const n = randInt(rng, 1050, 99500);
      const correct = roundToNearest(n, 1000);
      const subject = fillPlace(randChoice(rng, COUNT_SCENARIO_SUBJECTS), rng);
      const wrong = [String(roundToNearest(n, 100)), String(roundToNearest(n, 10000)), String(correct + 1000)].filter((w) => w !== String(correct));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), [...new Set(wrong)].map((w) => fmt(Number(w))));
      return {
        kind: "multiple-choice",
        prompt: `A survey recorded the number of ${subject} as ${fmt(n)}. For a summary report, round this figure to the nearest thousand.`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Rounding to the nearest thousand always gives an answer ending in 000.",
        explanation: `${fmt(n)} rounds to ${fmt(correct)} to the nearest thousand.`,
      };
    }

    if (branch === "match-round") {
      const nums = new Set<number>();
      while (nums.size < 4) nums.add(randInt(rng, 1050, 99500));
      const values = [...nums];
      const seenRounded = new Set<number>();
      const uniqueValues = values.filter((n) => {
        const r = roundToNearest(n, 1000);
        if (seenRounded.has(r)) return false;
        seenRounded.add(r);
        return true;
      });
      const tokens = uniqueValues.map((n) => ({ id: `n${n}`, label: fmt(n) }));
      const targets = shuffle(rng, uniqueValues.map((n) => ({ id: `r${n}`, label: fmt(roundToNearest(n, 1000)) })));
      const correctMap: Record<string, string> = {};
      uniqueValues.forEach((n) => (correctMap[`r${n}`] = `n${n}`));
      return {
        kind: "click-match",
        prompt: "Match each number to its value when rounded to the nearest thousand.",
        tokens,
        targets,
        correctMap,
        hint: "Check the hundreds digit of each number to decide whether it rounds up or down.",
        explanation: uniqueValues.map((n) => `${fmt(n)} rounds to ${fmt(roundToNearest(n, 1000))}`).join("; ") + ".",
      };
    }

    // round-number-line: click the nearest thousand on a zoomed-in local number line.
    const base = randInt(rng, 1, 19) * 5000; // multiple of 5000, keeps within 0..95000
    const n = randInt(rng, base + 400, base + 4600);
    const correct = roundToNearest(n, 1000);
    return {
      kind: "number-line",
      prompt: `The number ${fmt(n)} lies between ${fmt(base)} and ${fmt(base + 5000)}. Click the point that shows ${fmt(n)} rounded to the nearest thousand.`,
      min: base,
      max: base + 5000,
      step: 1000,
      correctValue: correct,
      mode: "point",
      hint: "Find where the hundreds digit tips the number closer to the thousand above or below.",
      explanation: `${fmt(n)} rounds to ${fmt(correct)} to the nearest thousand.`,
    };
  },
};
