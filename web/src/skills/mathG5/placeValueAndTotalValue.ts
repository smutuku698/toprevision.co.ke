import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, fmt } from "./mathUtils";
import { COUNT_SCENARIO_SUBJECTS, fillPlace } from "./contexts";
import type { Skill } from "@/lib/types";

// Grade 5 caps place/total value at hundreds of thousands (a 6-digit ceiling) — no millions, no
// squares/square-roots (those are Grade 6+). PLACE_NAMES index = power of ten.
const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands"] as const;
const PLACE_VARIANTS: Record<string, string[]> = {
  ones: ["ones", "one"],
  tens: ["tens", "ten"],
  hundreds: ["hundreds", "hundred"],
  thousands: ["thousands", "thousand"],
  "ten thousands": ["ten thousands", "ten thousand"],
  "hundred thousands": ["hundred thousands", "hundred thousand"],
};

/** A number with all-distinct digits, 3-6 digits long, never starting with 0. */
function genNumber(rng: RNG, minLen = 3, maxLen = 6): { value: number; digits: number[] } {
  const len = randInt(rng, minLen, maxLen);
  const digits = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, len);
  if (digits[0] === 0) {
    const swapIdx = digits.findIndex((d, i) => i > 0 && d !== 0);
    [digits[0], digits[swapIdx]] = [digits[swapIdx], digits[0]];
  }
  return { value: Number(digits.join("")), digits };
}

export const placeValueAndTotalValue: Skill = {
  id: "g5-math-n-place-value-total-value",
  code: "N.1",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Place value and total value",
  description: "Find the place value and total value of digits in numbers up to hundreds of thousands, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["place-value", "total-value", "identify-digit", "expanded-form", "match-place-value", "order-place-value", "digit-family"] as const);

    if (branch === "place-value") {
      const { value, digits } = genNumber(rng);
      const idx = randInt(rng, 0, digits.length - 1);
      const digit = digits[idx];
      const exponent = digits.length - 1 - idx;
      const placeName = PLACE_NAMES[exponent];
      const openers = [
        `Look at the number ${fmt(value)}.`,
        `Here is a number: ${fmt(value)}.`,
        `Consider the number ${fmt(value)}.`,
        `Study this number: ${fmt(value)}.`,
        `Take the number ${fmt(value)}.`,
      ];
      const closers = [
        ` What is the place value of the digit ${digit}?`,
        ` Identify the place value of the digit ${digit}.`,
        ` Name the place value represented by the digit ${digit}.`,
        ` Which place value does the digit ${digit} sit in?`,
      ];
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, openers)}${randChoice(rng, closers)}`,
        before: "Place value:",
        after: "",
        correctAnswer: placeName,
        acceptedAnswers: PLACE_VARIANTS[placeName],
        inputMode: "text",
        hint: "Count the digit's position from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.",
        explanation: `In ${fmt(value)}, the digit ${digit} is in the ${placeName} place.`,
      };
    }

    if (branch === "total-value") {
      const useReal = rng() < 0.55;
      const { value, digits } = genNumber(rng);
      const idx = randInt(rng, 0, digits.length - 1);
      const digit = digits[idx];
      const exponent = digits.length - 1 - idx;
      const placeName = PLACE_NAMES[exponent];
      const totalValue = digit * 10 ** exponent;
      let prompt: string;
      if (useReal) {
        const subjectLine = fillPlace(randChoice(rng, COUNT_SCENARIO_SUBJECTS), rng);
        const openers = [
          `The number of ${subjectLine} was recorded as ${fmt(value)}.`,
          `A record shows the number of ${subjectLine} as ${fmt(value)}.`,
          `A count of ${subjectLine} came to ${fmt(value)}.`,
          `A report lists the number of ${subjectLine} as ${fmt(value)}.`,
          `A clerk wrote down the number of ${subjectLine} as ${fmt(value)}.`,
        ];
        const closers = [
          ` What is the total value of the digit ${digit} in this number?`,
          ` Find the total value represented by the digit ${digit}.`,
          ` What does the digit ${digit} contribute to this number's total value?`,
          ` Work out the total value of the digit ${digit}.`,
        ];
        prompt = `${randChoice(rng, openers)}${randChoice(rng, closers)}`;
      } else {
        const openers = [
          `In the number ${fmt(value)}:`,
          `Given the number ${fmt(value)}:`,
          `Look at ${fmt(value)}.`,
          `Take the number ${fmt(value)}.`,
          `Here is a number: ${fmt(value)}.`,
        ];
        const closers = [
          ` What is the total value of the digit ${digit}?`,
          ` Find the total value of the digit ${digit}.`,
          ` Work out what the digit ${digit} is really worth here.`,
          ` What does the digit ${digit} stand for in total value?`,
        ];
        prompt = `${randChoice(rng, openers)}${randChoice(rng, closers)}`;
      }
      return {
        kind: "fill-blank",
        prompt,
        before: "Total value =",
        after: "",
        correctAnswer: String(totalValue),
        inputMode: "numeric",
        hint: `The digit ${digit} is in the ${placeName} place, so multiply ${digit} by the value of that place.`,
        explanation: `The digit ${digit} is in the ${placeName} place: $${digit} \\times ${fmt(10 ** exponent)} = ${fmt(totalValue)}$.`,
      };
    }

    if (branch === "identify-digit") {
      const { value, digits } = genNumber(rng);
      const idx = randInt(rng, 0, digits.length - 1);
      const exponent = digits.length - 1 - idx;
      const placeName = PLACE_NAMES[exponent];
      const correctDigit = digits[idx];
      const otherDigits = digits.filter((_, i) => i !== idx).map(String);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correctDigit), otherDigits, Math.min(3, otherDigits.length));
      const openers = [
        `In the number ${fmt(value)},`,
        `Looking at ${fmt(value)},`,
        `For the number ${fmt(value)},`,
        `Given ${fmt(value)},`,
        `In ${fmt(value)}:`,
      ];
      const closers = [
        ` which digit is in the ${placeName} place?`,
        ` what digit sits in the ${placeName} place?`,
        ` identify the digit occupying the ${placeName} place.`,
        ` name the digit in the ${placeName} column.`,
      ];
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, openers)}${randChoice(rng, closers)}`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Count places from the right, starting with ones — the other digits are simply from the wrong position.",
        explanation: `Counting from the right, the ${placeName} digit of ${fmt(value)} is ${correctDigit}. The other choices are digits from different positions in the same number.`,
      };
    }

    if (branch === "expanded-form") {
      const { value, digits } = genNumber(rng, 3, 6);
      const parts = digits
        .map((d, i) => ({ d, exp: digits.length - 1 - i }))
        .filter((p) => p.d !== 0)
        .map((p) => fmt(p.d * 10 ** p.exp));
      const openers = [
        "What number is represented by this expanded form?",
        "Which number does this expanded form describe?",
        "Add up this expanded form to find the number:",
        "This expanded form describes a number. What is it?",
        "Work out the number shown by this expanded form:",
      ];
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, openers)} $${parts.join(" + ")}$`,
        before: "Number =",
        after: "",
        correctAnswer: String(value),
        inputMode: "numeric",
        hint: "Add up all the parts of the expanded form.",
        explanation: `$${parts.join(" + ")} = ${fmt(value)}$.`,
      };
    }

    if (branch === "match-place-value") {
      const chosen = shuffle(rng, PLACE_NAMES.map((p, exp) => ({ id: p, label: p[0].toUpperCase() + p.slice(1), value: fmt(10 ** exp) }))).slice(0, 5);
      const tokens = chosen.map((p) => ({ id: p.id, label: p.label }));
      const targets = shuffle(rng, chosen.map((p) => ({ id: `v-${p.id}`, label: p.value })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p) => (correctMap[`v-${p.id}`] = p.id));
      const prompts = [
        "Match each place value name to its value.",
        "Match each place-value column to the number it represents.",
        "Pair each place value with its correct value.",
        "Match each place name to how much it is worth.",
        "Connect each place value to its value.",
        "Link each place-value name to its correct value.",
        "Match each place value to its correct amount.",
        "Pair each place-value name with its value.",
        "Match each column name to its value.",
        "Connect each place value name to the amount it stands for.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Each place is 10 times the value of the place to its right.",
        explanation: chosen.map((p) => `${p.label} = ${p.value}`).join("; ") + ".",
      };
    }

    if (branch === "order-place-value") {
      const chosen = shuffle(rng, PLACE_NAMES.map((p, exp) => ({ id: p, label: p[0].toUpperCase() + p.slice(1), exp }))).slice(0, 5);
      const sorted = [...chosen].sort((a, b) => a.exp - b.exp);
      const prompts = [
        "Order these place values from smallest to largest.",
        "Arrange these place values from smallest to largest.",
        "Put these place values in order, smallest to largest.",
        "Sort these place values from the smallest to the largest.",
        "Rank these place values from smallest to largest.",
        "Arrange these place-value columns starting with the smallest.",
        "Order these place-value names from smallest value to largest.",
        "Sequence these place values, smallest first.",
        "Put these place values in increasing order.",
        "Arrange these place values starting with the smallest one.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest value first.",
        items: shuffle(rng, chosen).map((p) => ({ id: p.id, label: p.label })),
        correctOrder: sorted.map((p) => p.id),
        hint: "Ones is the smallest; each place to the left is 10 times bigger.",
        explanation: `From smallest to largest: ${sorted.map((p) => p.label).join(", ")}.`,
      };
    }

    // digit-family: categorize numbers by whether they reach into the hundred-thousands place (6 digits) or not.
    const numbers = Array.from({ length: 6 }, () => genNumber(rng, 3, 6));
    const items = numbers.map((n, i) => ({ id: `num${i}`, label: fmt(n.value) }));
    const buckets = [
      { id: "up-to-ten-thousands", label: "Up to ten thousands (5 digits or fewer)" },
      { id: "into-hundred-thousands", label: "Reaches the hundred thousands place (6 digits)" },
    ];
    const correctBucket: Record<string, string> = {};
    numbers.forEach((n, i) => (correctBucket[`num${i}`] = n.digits.length === 6 ? "into-hundred-thousands" : "up-to-ten-thousands"));
    const prompts = [
      "Sort each number by whether it has a digit in the hundred thousands place.",
      "Sort each number by whether it reaches the hundred thousands place.",
      "Group each number by whether it has a hundred-thousands digit.",
      "Sort these numbers by whether they reach into the hundred thousands.",
      "Classify each number by whether it has a hundred thousands digit.",
      "Sort each number into the correct group based on its number of digits.",
      "Group these numbers by how far their place values reach.",
      "Sort each number by whether it is a 6-digit number or shorter.",
      "Classify each number by whether it reaches the hundred-thousands column.",
      "Sort each number by its digit count relative to the hundred thousands place.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, prompts),
      items,
      buckets,
      correctBucket,
      hint: "Count the digits: 6 digits means the number reaches into the hundred thousands place.",
      explanation: numbers.map((n) => `${fmt(n.value)} has ${n.digits.length} digits, so it is ${n.digits.length === 6 ? "into the hundred thousands" : "up to ten thousands"}`).join("; ") + ".",
    };
  },
};
