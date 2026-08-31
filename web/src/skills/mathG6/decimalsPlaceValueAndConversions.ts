import { randChoice, randInt, shuffle } from "@/lib/rng";
import { formatFraction, buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

const PLACE_NAMES = ["tenths", "hundredths", "thousandths", "ten-thousandths"] as const;

export const decimalsPlaceValueAndConversions: Skill = {
  id: "g6-math-n-decimals-place-value-conversions",
  code: "N.13",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Decimal place value and conversions",
  description: "Identify decimals up to ten thousandths, round decimals to 3 decimal places, and convert between decimals and fractions.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["place-value", "rounding", "decimal-to-fraction", "fraction-to-decimal", "reverse-rounding", "classify-round", "order-decimals", "match-places"] as const
    );

    if (branch === "place-value") {
      const places = randInt(rng, 1, 4);
      const wholePart = randInt(rng, 1, 90);
      const digits: number[] = [];
      for (let i = 0; i < places; i++) digits.push(randInt(rng, 0, 9));
      let allZero = true;
      for (const d of digits) if (d !== 0) allZero = false;
      if (allZero) {
        const lastIndex: number = digits.length - 1;
        digits.splice(lastIndex, 1, randInt(rng, 1, 9));
      }
      const decStr = `${wholePart}.${digits.join("")}`;
      const askPos = randInt(rng, 0, places - 1);
      const digitAsked = digits[askPos];
      const placeName = PLACE_NAMES[askPos];
      const ordinal = ["1st", "2nd", "3rd", "4th"][askPos];
      return {
        kind: "fill-blank",
        prompt: `In the number ${decStr}, what place value does the digit ${digitAsked} (the ${ordinal} digit after the decimal point) represent?`,
        before: "Place value =",
        after: "",
        correctAnswer: placeName,
        acceptedAnswers: [placeName, placeName.replace("-", " ")],
        inputMode: "text",
        hint: "Count positions after the decimal point: tenths, hundredths, thousandths, ten-thousandths.",
        explanation: `The digit ${askPos + 1} place${askPos === 0 ? "" : "s"} after the decimal point is the ${placeName} column, so ${digitAsked} represents ${placeName}.`,
      };
    }

    if (branch === "rounding") {
      const wholePart = randInt(rng, 1, 90);
      const d1 = randInt(rng, 0, 9);
      const d2 = randInt(rng, 0, 9);
      const d3 = randInt(rng, 0, 9);
      const d4 = randInt(rng, 0, 9);
      const number = Number(`${wholePart}.${d1}${d2}${d3}${d4}`);
      const rounded = Math.round(number * 1000) / 1000;
      return {
        kind: "fill-blank",
        prompt: `Round ${number} off to 3 decimal places.`,
        before: "Rounded value =",
        after: "",
        correctAnswer: rounded.toFixed(3),
        inputMode: "numeric",
        hint: "Look at the 4th decimal digit — 5 or more rounds the 3rd digit up, below 5 leaves it unchanged.",
        explanation: `${number} rounded to 3 decimal places is ${rounded.toFixed(3)}.`,
      };
    }

    if (branch === "decimal-to-fraction") {
      const denom = randChoice(rng, [4, 5, 10, 20, 25, 50, 100] as const);
      const numer = randInt(rng, 1, denom - 1);
      const decimalValue = numer / denom;
      const answer = formatFraction(numer, denom);
      return {
        kind: "fill-blank",
        prompt: `Convert ${decimalValue} to a fraction in its lowest terms.`,
        before: "",
        after: "",
        correctAnswer: answer,
        inputMode: "text",
        hint: "Write the decimal over a power of 10, then simplify.",
        explanation: `${decimalValue} $= \\frac{${Math.round(decimalValue * denom)}}{${denom}}$, simplified to ${answer}.`,
      };
    }

    if (branch === "fraction-to-decimal") {
      const denom = randChoice(rng, [4, 5, 10, 20, 25, 50, 100] as const);
      const numer = randInt(rng, 1, denom - 1);
      const decimalValue = numer / denom;
      return {
        kind: "fill-blank",
        prompt: `Convert $\\frac{${numer}}{${denom}}$ to a decimal.`,
        before: "",
        after: "",
        correctAnswer: String(decimalValue),
        inputMode: "numeric",
        hint: "Change the fraction to an equivalent fraction with a denominator of 10, 100 or 1000, or divide the numerator by the denominator.",
        explanation: `$\\frac{${numer}}{${denom}} = ${decimalValue}$.`,
      };
    }

    if (branch === "reverse-rounding") {
      const wholePart = randInt(rng, 1, 90);
      const tenthsDigit = randInt(rng, 1, 8); // keep away from 0/9 so target±0.1 stays a clean comparison
      const target = Number(`${wholePart}.${tenthsDigit}`);
      const correctHundredths = randInt(rng, 1, 4);
      const correctOriginal = Number(`${target}${correctHundredths}`);
      const wrongUpHundredths = randInt(rng, 5, 9);
      const wrongUp = Number(`${target}${wrongUpHundredths}`); // rounds to target + 0.1, not target
      const lowerTarget = Number((target - 0.1).toFixed(1));
      const wrongLowerHundredths = randInt(rng, 0, 4);
      const wrongLower = Number(`${lowerTarget}${wrongLowerHundredths}`); // rounds to target - 0.1
      const upperTarget = Number((target + 0.1).toFixed(1));
      const wrongUpperHundredths = randInt(rng, 0, 4);
      const wrongUpper = Number(`${upperTarget}${wrongUpperHundredths}`); // rounds to target + 0.1
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correctOriginal), [String(wrongUp), String(wrongLower), String(wrongUpper)], 3);
      return {
        kind: "multiple-choice",
        prompt: `Which of these numbers rounds to ${target.toFixed(1)} when rounded to 1 decimal place?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Check the hundredths digit — 5 or more rounds the tenths digit up, below 5 leaves it unchanged.",
        explanation: `${correctOriginal}'s hundredths digit is ${correctHundredths}, which is below 5, so it rounds down and stays ${target.toFixed(1)}.`,
      };
    }

    if (branch === "classify-round") {
      const wholeChoices = [12, 34, 56, 78, 9, 45, 67, 23, 89, 15, 62, 30] as const;
      const items = Array.from({ length: 5 }, () => {
        const whole = randChoice(rng, wholeChoices);
        const tenths = randInt(rng, 0, 9);
        return { whole, tenths, label: `${whole}.${tenths}` };
      });
      const dedup = items.filter((it, i) => items.findIndex((o) => o.label === it.label) === i);
      const finalItems = dedup.map((it, i) => ({ id: `d${i}`, label: it.label }));
      const buckets = [
        { id: "up", label: "Rounds UP to the next whole number" },
        { id: "down", label: "Rounds DOWN to the same whole number" },
      ];
      const correctBucket: Record<string, string> = {};
      dedup.forEach((it, i) => (correctBucket[`d${i}`] = it.tenths >= 5 ? "up" : "down"));
      return {
        kind: "categorize",
        prompt: "Sort each decimal by whether it rounds up or down when rounded to the nearest whole number.",
        items: finalItems,
        buckets,
        correctBucket,
        hint: "A tenths digit of 5 or more rounds up; below 5 rounds down.",
        explanation: dedup.map((it) => `${it.label} rounds ${it.tenths >= 5 ? "up" : "down"}`).join("; ") + ".",
      };
    }

    if (branch === "order-decimals") {
      const count = 5;
      const valuesSet = new Set<number>();
      while (valuesSet.size < count) valuesSet.add(randInt(rng, 105, 9870));
      const values = [...valuesSet].map((v) => v / 1000);
      const ascending = rng() < 0.5;
      const sorted = [...values].sort((a, b) => (ascending ? a - b : b - a));
      const items = values.map((v) => ({ id: String(v), label: String(v) }));
      return {
        kind: "ordering",
        prompt: `Arrange these decimals in ${ascending ? "ascending (smallest to largest)" : "descending (largest to smallest)"} order.`,
        instruction: "Drag to arrange in order.",
        items: shuffle(rng, items),
        correctOrder: sorted.map((v) => String(v)),
        hint: "Compare the whole-number parts first, then the tenths, then the hundredths, then the thousandths.",
        explanation: `In ${ascending ? "ascending" : "descending"} order: ${sorted.join(", ")}.`,
      };
    }

    const pairs = [
      { term: "Tenths", meaning: "The first digit after the decimal point" },
      { term: "Hundredths", meaning: "The second digit after the decimal point" },
      { term: "Thousandths", meaning: "The third digit after the decimal point" },
      { term: "Ten-thousandths", meaning: "The fourth digit after the decimal point" },
    ] as const;
    const chosen = shuffle(rng, pairs);
    const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
    const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
    return {
      kind: "click-match",
      prompt: "Match each decimal place-value column to its position.",
      tokens,
      targets,
      correctMap,
      hint: "Count positions from the decimal point, moving right.",
      explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
    };
  },
};
