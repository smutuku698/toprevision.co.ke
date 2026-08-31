import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import { COUNT_SCENARIO_SUBJECTS, fillPlace } from "./contexts";
import type { Skill } from "@/lib/types";

// Place names ones..millions, index = power of ten.
const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands", "millions"] as const;
const PLACE_VARIANTS: Record<string, string[]> = {
  ones: ["ones", "one"],
  tens: ["tens", "ten"],
  hundreds: ["hundreds", "hundred"],
  thousands: ["thousands", "thousand"],
  "ten thousands": ["ten thousands", "ten thousand"],
  "hundred thousands": ["hundred thousands", "hundred thousand"],
  millions: ["millions", "million"],
};

/** A number with all-distinct digits (so "the digit 7" never refers to more than one position), 4-7 digits long. */
function genNumber(rng: RNG, minLen = 4, maxLen = 7): { value: number; digits: number[] } {
  const len = randInt(rng, minLen, maxLen);
  const digits = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, len);
  if (digits[0] === 0) {
    const swapIdx = digits.findIndex((d, i) => i > 0 && d !== 0);
    [digits[0], digits[swapIdx]] = [digits[swapIdx], digits[0]];
  }
  return { value: Number(digits.join("")), digits };
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export const placeValueAndTotalValue: Skill = {
  id: "g6-math-n-place-value-total-value",
  code: "N.1",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Place value and total value",
  description: "Find the place value and total value of digits in numbers up to millions, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["place-value", "total-value", "identify-digit", "expanded-form", "match-place-value", "order-place-value", "digit-family"] as const);

    if (branch === "place-value") {
      const { value, digits } = genNumber(rng);
      const idx = randInt(rng, 0, digits.length - 1);
      const digit = digits[idx];
      const exponent = digits.length - 1 - idx;
      const placeName = PLACE_NAMES[exponent];
      return {
        kind: "fill-blank",
        prompt: `In the number ${fmt(value)}, what is the place value of the digit ${digit}?`,
        before: "Place value:",
        after: "",
        correctAnswer: placeName,
        acceptedAnswers: PLACE_VARIANTS[placeName],
        inputMode: "text",
        hint: "Count the digit's position from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions.",
        explanation: `In ${fmt(value)}, the digit ${digit} is in the ${placeName} place.`,
      };
    }

    if (branch === "total-value") {
      const useReal = rng() < 0.5;
      const { value, digits } = genNumber(rng);
      const idx = randInt(rng, 0, digits.length - 1);
      const digit = digits[idx];
      const exponent = digits.length - 1 - idx;
      const placeName = PLACE_NAMES[exponent];
      const totalValue = digit * 10 ** exponent;
      const prompt = useReal
        ? `The ${fillPlace(randChoice(rng, COUNT_SCENARIO_SUBJECTS), rng)} is ${fmt(value)}. What is the total value of the digit ${digit} in this number?`
        : `In the number ${fmt(value)}, what is the total value of the digit ${digit}?`;
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
      return {
        kind: "multiple-choice",
        prompt: `In the number ${fmt(value)}, which digit is in the ${placeName} place?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Count places from the right, starting with ones.",
        explanation: `Counting from the right, the ${placeName} digit of ${fmt(value)} is ${correctDigit}.`,
      };
    }

    if (branch === "expanded-form") {
      const { value, digits } = genNumber(rng, 4, 6);
      const parts = digits
        .map((d, i) => ({ d, exp: digits.length - 1 - i }))
        .filter((p) => p.d !== 0)
        .map((p) => fmt(p.d * 10 ** p.exp));
      return {
        kind: "fill-blank",
        prompt: `What number is represented by this expanded form? $${parts.join(" + ")}$`,
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
      return {
        kind: "click-match",
        prompt: "Match each place value name to its value.",
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
      return {
        kind: "ordering",
        prompt: "Order these place values from smallest to largest.",
        instruction: "Click them in order, smallest value first.",
        items: shuffle(rng, chosen).map((p) => ({ id: p.id, label: p.label })),
        correctOrder: sorted.map((p) => p.id),
        hint: "Ones is the smallest; each place to the left is 10 times bigger.",
        explanation: `From smallest to largest: ${sorted.map((p) => p.label).join(", ")}.`,
      };
    }

    // digit-family: categorize numbers by whether they reach into the millions place (7 digits) or not.
    const numbers = Array.from({ length: 6 }, () => genNumber(rng, 4, 7));
    const items = numbers.map((n, i) => ({ id: `num${i}`, label: fmt(n.value) }));
    const buckets = [
      { id: "up-to-hundred-thousands", label: "Up to hundred thousands (6 digits or fewer)" },
      { id: "into-millions", label: "Reaches the millions place (7 digits)" },
    ];
    const correctBucket: Record<string, string> = {};
    numbers.forEach((n, i) => (correctBucket[`num${i}`] = n.digits.length === 7 ? "into-millions" : "up-to-hundred-thousands"));
    return {
      kind: "categorize",
      prompt: "Sort each number by whether it has a digit in the millions place.",
      items,
      buckets,
      correctBucket,
      hint: "Count the digits: 7 digits means the number reaches into the millions place.",
      explanation: numbers.map((n) => `${fmt(n.value)} has ${n.digits.length} digits, so it is ${n.digits.length === 7 ? "into the millions" : "up to hundred thousands"}`).join("; ") + ".",
    };
  },
};
