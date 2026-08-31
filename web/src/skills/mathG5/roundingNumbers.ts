import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, fmt } from "./mathUtils";
import { COUNT_SCENARIO_SUBJECTS, fillPlace } from "./contexts";
import type { Skill } from "@/lib/types";

const MIN_N = 150;
const MAX_N = 99850;
const UNITS = [100, 1000] as const;
const OTHER_UNIT: Record<number, number[]> = { 100: [10, 1000], 1000: [100, 10000] };
const UNIT_WORD: Record<number, string> = { 100: "hundred", 1000: "thousand" };

function roundToNearest(n: number, unit: number): number {
  return Math.round(n / unit) * unit;
}

export const roundingNumbers: Skill = {
  id: "g5-math-n-rounding",
  code: "N.3",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Rounding numbers",
  description: "Round off numbers up to tens of thousands to the nearest hundred and to the nearest thousand, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["round-fill-blank", "round-multiple-choice", "round-direction", "real-world-round", "match-round", "round-number-line"] as const);

    if (branch === "round-fill-blank") {
      const unit = randChoice(rng, UNITS);
      const n = randInt(rng, MIN_N, MAX_N);
      const rounded = roundToNearest(n, unit);
      const openers = [
        `Round ${fmt(n)} to the nearest ${UNIT_WORD[unit]}.`,
        `What is ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}?`,
        `Give ${fmt(n)} rounded off to the nearest ${UNIT_WORD[unit]}.`,
        `Find ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}.`,
        `Round off ${fmt(n)} to the nearest ${UNIT_WORD[unit]}.`,
        `Rounded to the nearest ${UNIT_WORD[unit]}, what is ${fmt(n)}?`,
        `Approximate ${fmt(n)} to the nearest ${UNIT_WORD[unit]}.`,
        `Express ${fmt(n)} to the nearest ${UNIT_WORD[unit]}.`,
        `What does ${fmt(n)} become when rounded to the nearest ${UNIT_WORD[unit]}?`,
        `Work out ${fmt(n)} to the nearest ${UNIT_WORD[unit]}.`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, openers),
        before: "Rounded value =",
        after: "",
        correctAnswer: String(rounded),
        inputMode: "numeric",
        hint: unit === 100
          ? "Look at the tens digit: 50 or more rounds up, below 50 rounds down."
          : "Look at the hundreds digit: 500 or more rounds up, below 500 rounds down.",
        explanation: `${fmt(n)} rounds to ${fmt(rounded)} to the nearest ${UNIT_WORD[unit]}.`,
      };
    }

    if (branch === "round-multiple-choice") {
      const unit = randChoice(rng, UNITS);
      const n = randInt(rng, MIN_N, MAX_N);
      const correct = roundToNearest(n, unit);
      const [smallerUnit, biggerUnit] = OTHER_UNIT[unit];
      const wrong = [String(roundToNearest(n, smallerUnit)), String(roundToNearest(n, biggerUnit)), String(correct + unit), String(correct - unit)].filter((w) => w !== String(correct));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), [...new Set(wrong)].map((w) => fmt(Number(w))));
      const openers = [
        `Round ${fmt(n)} to the nearest ${UNIT_WORD[unit]}.`,
        `Which number is ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}?`,
        `Choose the correct value of ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}.`,
        `Select ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}.`,
        `Pick the correctly rounded value for ${fmt(n)} (nearest ${UNIT_WORD[unit]}).`,
        `Which option shows ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}?`,
        `What is ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}?`,
        `Identify ${fmt(n)} rounded off to the nearest ${UNIT_WORD[unit]}.`,
        `Choose ${fmt(n)}'s value when rounded to the nearest ${UNIT_WORD[unit]}.`,
        `Only one option is ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}. Which one?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, openers),
        choices,
        correctIndex,
        layout: "row",
        hint: `Rounding to the nearest ${UNIT_WORD[unit].toUpperCase()} means the answer must end in ${"0".repeat(String(unit).length - 1)} — check the ${unit === 100 ? "tens" : "hundreds"} digit to decide up or down.`,
        explanation: `${fmt(n)} rounds to ${fmt(correct)} to the nearest ${UNIT_WORD[unit]}. The wrong options round to the nearest ${UNIT_WORD[smallerUnit] ?? smallerUnit} or ${UNIT_WORD[biggerUnit] ?? biggerUnit} instead, or shift a whole ${UNIT_WORD[unit]} too far.`,
      };
    }

    if (branch === "round-direction") {
      const unit = randChoice(rng, UNITS);
      const nums = Array.from({ length: 6 }, () => randInt(rng, MIN_N, MAX_N));
      const checkDigit = (n: number) => (unit === 100 ? (n % 100) / 10 : (n % 1000) / 100);
      const items = nums.map((n, i) => ({ id: `n${i}`, label: fmt(n) }));
      const buckets = [
        { id: "up", label: `Rounds UP to the next ${UNIT_WORD[unit]}` },
        { id: "down", label: `Rounds DOWN to the current ${UNIT_WORD[unit]}` },
      ];
      const correctBucket: Record<string, string> = {};
      nums.forEach((n, i) => (correctBucket[`n${i}`] = checkDigit(n) >= 5 ? "up" : "down"));
      const prompts = [
        `Sort each number by whether it rounds up or down when rounded to the nearest ${UNIT_WORD[unit]}.`,
        `Sort these numbers into 'rounds up' and 'rounds down' for the nearest ${UNIT_WORD[unit]}.`,
        `Group each number by its rounding direction to the nearest ${UNIT_WORD[unit]}.`,
        `Sort each number by rounding direction (nearest ${UNIT_WORD[unit]}).`,
        `Classify each number as rounding up or down to the nearest ${UNIT_WORD[unit]}.`,
        `Sort these numbers by whether the nearest ${UNIT_WORD[unit]} is above or below them.`,
        `For the nearest ${UNIT_WORD[unit]}, sort each number as up or down.`,
        `Decide whether each number rounds up or down to the nearest ${UNIT_WORD[unit]}, then sort it.`,
        `Sort each of these numbers by its rounding direction to the nearest ${UNIT_WORD[unit]}.`,
        `Group these numbers by whether rounding to the nearest ${UNIT_WORD[unit]} takes them up or down.`,
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items,
        buckets,
        correctBucket,
        hint: unit === 100
          ? "If the tens digit is 5, 6, 7, 8 or 9, it rounds up. If it is 0, 1, 2, 3 or 4, it rounds down."
          : "If the hundreds digit is 5, 6, 7, 8 or 9, it rounds up. If it is 0, 1, 2, 3 or 4, it rounds down.",
        explanation: nums.map((n) => `${fmt(n)} rounds ${checkDigit(n) >= 5 ? "up" : "down"}`).join("; ") + ".",
      };
    }

    if (branch === "real-world-round") {
      const unit = randChoice(rng, UNITS);
      const n = randInt(rng, MIN_N, MAX_N);
      const correct = roundToNearest(n, unit);
      const [smallerUnit, biggerUnit] = OTHER_UNIT[unit];
      const subject = fillPlace(randChoice(rng, COUNT_SCENARIO_SUBJECTS), rng);
      const wrong = [String(roundToNearest(n, smallerUnit)), String(roundToNearest(n, biggerUnit)), String(correct + unit)].filter((w) => w !== String(correct));
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), [...new Set(wrong)].map((w) => fmt(Number(w))));
      const openers = [
        `A survey recorded the number of ${subject} as ${fmt(n)}.`,
        `A report lists the number of ${subject} as ${fmt(n)}.`,
        `The exact count of ${subject} was ${fmt(n)}.`,
        `An official record shows ${fmt(n)} for the number of ${subject}.`,
        `A newspaper published the figure ${fmt(n)} for the number of ${subject}.`,
        `A county officer noted ${fmt(n)} as the number of ${subject}.`,
        `For a summary chart, the number of ${subject} was counted as ${fmt(n)}.`,
        `A school assembly announced ${fmt(n)} as the number of ${subject}.`,
        `The precise figure for the number of ${subject} was ${fmt(n)}.`,
        `A radio bulletin reported ${fmt(n)} as the number of ${subject}.`,
      ];
      const closers = [
        ` For a summary report, round this figure to the nearest ${UNIT_WORD[unit]}.`,
        ` Round this figure to the nearest ${UNIT_WORD[unit]}.`,
        ` Give this figure rounded to the nearest ${UNIT_WORD[unit]}.`,
        ` What is this figure rounded to the nearest ${UNIT_WORD[unit]}?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, openers)}${randChoice(rng, closers)}`,
        choices,
        correctIndex,
        layout: "row",
        hint: `Rounding to the nearest ${UNIT_WORD[unit]} always gives an answer ending in ${"0".repeat(String(unit).length - 1)}.`,
        explanation: `${fmt(n)} rounds to ${fmt(correct)} to the nearest ${UNIT_WORD[unit]}.`,
      };
    }

    if (branch === "match-round") {
      const unit = randChoice(rng, UNITS);
      const nums = new Set<number>();
      while (nums.size < 4) nums.add(randInt(rng, MIN_N, MAX_N));
      const values = [...nums];
      const seenRounded = new Set<number>();
      const uniqueValues = values.filter((n) => {
        const r = roundToNearest(n, unit);
        if (seenRounded.has(r)) return false;
        seenRounded.add(r);
        return true;
      });
      const tokens = uniqueValues.map((n) => ({ id: `n${n}`, label: fmt(n) }));
      const targets = shuffle(rng, uniqueValues.map((n) => ({ id: `r${n}`, label: fmt(roundToNearest(n, unit)) })));
      const correctMap: Record<string, string> = {};
      uniqueValues.forEach((n) => (correctMap[`r${n}`] = `n${n}`));
      const prompts = [
        `Match each number to its value when rounded to the nearest ${UNIT_WORD[unit]}.`,
        `Pair each number with its rounded value (nearest ${UNIT_WORD[unit]}).`,
        `Match each number to its rounded-off value (nearest ${UNIT_WORD[unit]}).`,
        `Connect each number to its correctly rounded value (nearest ${UNIT_WORD[unit]}).`,
        `Match each number to what it rounds to (nearest ${UNIT_WORD[unit]}).`,
        `Pair each number with its nearest-${UNIT_WORD[unit]} value.`,
        `Link each number to its rounded value, nearest ${UNIT_WORD[unit]}.`,
        `Match each number to the correct rounded amount (nearest ${UNIT_WORD[unit]}).`,
        `Connect each number to the value it rounds to (nearest ${UNIT_WORD[unit]}).`,
        `Match each number with its nearest ${UNIT_WORD[unit]}.`,
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: unit === 100 ? "Check the tens digit of each number to decide whether it rounds up or down." : "Check the hundreds digit of each number to decide whether it rounds up or down.",
        explanation: uniqueValues.map((n) => `${fmt(n)} rounds to ${fmt(roundToNearest(n, unit))}`).join("; ") + ".",
      };
    }

    // round-number-line: click the nearest hundred/thousand on a zoomed-in local number line.
    const unit = randChoice(rng, UNITS);
    const spread = unit * 10;
    const base = randInt(rng, 1, Math.floor(90000 / spread)) * spread;
    const n = randInt(rng, base + Math.floor(unit * 0.4), base + spread - Math.floor(unit * 0.4));
    const correct = roundToNearest(n, unit);
    const prompts = [
      `The number ${fmt(n)} lies between ${fmt(base)} and ${fmt(base + spread)}. Click the point that shows ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}.`,
      `Click the point showing ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}, between ${fmt(base)} and ${fmt(base + spread)}.`,
      `On this stretch from ${fmt(base)} to ${fmt(base + spread)}, click ${fmt(n)} rounded to the nearest ${UNIT_WORD[unit]}.`,
      `${fmt(n)} sits between ${fmt(base)} and ${fmt(base + spread)}. Click its value rounded to the nearest ${UNIT_WORD[unit]}.`,
      `Between ${fmt(base)} and ${fmt(base + spread)}, click where ${fmt(n)} rounds to (nearest ${UNIT_WORD[unit]}).`,
      `Find ${fmt(n)} on this number line and click its rounded value (nearest ${UNIT_WORD[unit]}).`,
      `Click the correct rounded point for ${fmt(n)}, nearest ${UNIT_WORD[unit]}, on the line from ${fmt(base)} to ${fmt(base + spread)}.`,
      `Show where ${fmt(n)} rounds to (nearest ${UNIT_WORD[unit]}) on this number line.`,
      `Click the nearest ${UNIT_WORD[unit]} to ${fmt(n)} on this number line.`,
      `${fmt(n)} is marked between ${fmt(base)} and ${fmt(base + spread)}. Click its rounded value to the nearest ${UNIT_WORD[unit]}.`,
    ];
    return {
      kind: "number-line",
      prompt: randChoice(rng, prompts),
      min: base,
      max: base + spread,
      step: unit,
      correctValue: correct,
      mode: "point",
      hint: `Find where the ${unit === 100 ? "tens" : "hundreds"} digit tips the number closer to the ${UNIT_WORD[unit]} above or below.`,
      explanation: `${fmt(n)} rounds to ${fmt(correct)} to the nearest ${UNIT_WORD[unit]}.`,
    };
  },
};
