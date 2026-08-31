import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Fractions whose decimal expansion terminates (denominator's prime factors are only 2 and 5).
const TERMINATING: [number, number][] = [
  [1, 2], [3, 4], [1, 5], [2, 5], [1, 8], [3, 8], [1, 4], [7, 8], [1, 20], [3, 10],
];
// Fractions that produce a recurring decimal.
const RECURRING: [number, number][] = [
  [1, 3], [2, 3], [1, 6], [5, 6], [1, 9], [2, 9], [1, 7], [1, 11], [4, 9], [5, 9],
];

const RECEIPT_ITEMS = [
  { name: "bread", price: 65 },
  { name: "milk", price: 55 },
  { name: "sugar", price: 140 },
  { name: "rice", price: 180 },
  { name: "cooking oil", price: 320 },
  { name: "soap", price: 45 },
];

function decimalPlaces(n: number): number {
  const s = String(n);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

export const decimals: Skill = {
  id: "g8-math-n-decimals",
  code: "N.3",
  subjectId: "math",
  strandId: "g8-math-numbers",
  grade: 8,
  title: "Decimals: conversion, rounding, and standard form",
  description: "Convert fractions to decimals, identify recurring decimals, round numbers, use significant figures and standard form, and combine decimal operations in real life.",
  generate(rng) {
    const branch = randChoice(rng, ["fraction-to-decimal", "round", "sig-fig", "standard-form", "combined-ops", "receipt", "terminating-sort", "order"] as const);

    if (branch === "fraction-to-decimal") {
      const [n, d] = randChoice(rng, TERMINATING);
      const answer = (n / d).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
      return {
        kind: "fill-blank",
        prompt: `Convert $\\frac{${n}}{${d}}$ to a decimal.`,
        before: "",
        after: "",
        correctAnswer: answer,
        acceptedAnswers: [String(n / d)],
        inputMode: "text",
        hint: "Divide the numerator by the denominator.",
        explanation: `$${n} \\div ${d} = ${answer}$.`,
      };
    }

    if (branch === "round") {
      const whole = randInt(rng, 1, 500);
      const decPart = randInt(rng, 100, 999);
      const num = whole + decPart / 1000;
      const places = randChoice(rng, [1, 2] as const);
      const rounded = Number(num.toFixed(places));
      const wrongCandidates = [
        Number(num.toFixed(places === 1 ? 2 : 1)).toFixed(places),
        (rounded + 1 / 10 ** places).toFixed(places),
        (rounded - 1 / 10 ** places).toFixed(places),
        Math.trunc(num * 10 ** places / 10 ** places).toFixed(places),
      ];
      const answer = rounded.toFixed(places);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, answer, wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `Round $${num.toFixed(3)}$ to ${places} decimal place${places > 1 ? "s" : ""}.`,
        choices,
        correctIndex,
        layout: "row",
        hint: `Look at the digit right after the ${places === 1 ? "1st" : "2nd"} decimal place to decide whether to round up.`,
        explanation: `$${num.toFixed(3)}$ rounded to ${places} decimal place${places > 1 ? "s" : ""} is $${answer}$.`,
      };
    }

    if (branch === "sig-fig") {
      const num = randInt(rng, 1000, 98765);
      const sf = randChoice(rng, [1, 2, 3] as const);
      const magnitude = Math.floor(Math.log10(num)) + 1;
      const factor = 10 ** (magnitude - sf);
      const rounded = Math.round(num / factor) * factor;
      return {
        kind: "fill-blank",
        prompt: `Express $${num}$ to ${sf} significant figure${sf > 1 ? "s" : ""}.`,
        before: "",
        after: "",
        correctAnswer: String(rounded),
        inputMode: "numeric",
        hint: `Keep the first ${sf} non-zero digit${sf > 1 ? "s" : ""} counting from the left, then round the rest to zero.`,
        explanation: `${num} to ${sf} significant figure${sf > 1 ? "s" : ""} is ${rounded} — keep the first ${sf} digit${sf > 1 ? "s" : ""} from the left and round the remaining digits.`,
      };
    }

    if (branch === "standard-form") {
      const mantissa = randInt(rng, 10, 99) / 10;
      const exponent = randChoice(rng, [2, 3, 4, 5, 6] as const);
      const fullNumber = mantissa * 10 ** exponent;
      const answer = `${mantissa} × 10^${exponent}`;
      const wrongCandidates = [
        `${mantissa} × 10^${exponent - 1}`,
        `${mantissa} × 10^${exponent + 1}`,
        `${mantissa * 10} × 10^${exponent - 1}`,
        `${(mantissa / 10).toFixed(2)} × 10^${exponent + 1}`,
      ];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, answer, wrongCandidates);
      return {
        kind: "multiple-choice",
        prompt: `Write $${Math.round(fullNumber).toLocaleString()}$ in standard form ($a \\times 10^n$, where $1 \\le a < 10$).`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Move the decimal point until only one non-zero digit remains before it — the number of places moved is the power of 10.",
        explanation: `$${Math.round(fullNumber).toLocaleString()} = ${mantissa} \\times 10^{${exponent}}$.`,
      };
    }

    if (branch === "combined-ops") {
      // Genuine BODMAS-style combined decimal operations (multiplication/division
      // before addition/subtraction), constructed so every intermediate step stays
      // an exact decimal — no rounding error, but still a real multi-step problem.
      const opType = randChoice(rng, ["mul-first", "div-first"] as const);
      const a = randInt(rng, 30, 90) / 10;
      if (opType === "mul-first") {
        const b = randInt(rng, 10, 50) / 10;
        const c = randInt(rng, 2, 6);
        const product = Math.round(b * c * 10) / 10;
        const answer = Math.round((a + product) * 10) / 10;
        return {
          kind: "fill-blank",
          prompt: `Work out: $${a} + ${b} \\times ${c}$`,
          before: "",
          after: "",
          correctAnswer: answer.toFixed(1),
          acceptedAnswers: [String(answer)],
          inputMode: "numeric",
          hint: "Multiplication comes before addition — work out the multiplication first.",
          explanation: `$${b} \\times ${c} = ${product}$. Then $${a} + ${product} = ${answer}$.`,
        };
      }
      const c = randInt(rng, 2, 5);
      const q = randInt(rng, 10, 40) / 10;
      const b = Math.round(q * c * 10) / 10;
      const answer = Math.round((a - q) * 10) / 10;
      return {
        kind: "fill-blank",
        prompt: `Work out: $${a} - ${b} \\div ${c}$`,
        before: "",
        after: "",
        correctAnswer: answer.toFixed(1),
        acceptedAnswers: [String(answer)],
        inputMode: "numeric",
        hint: "Division comes before subtraction — work out the division first.",
        explanation: `$${b} \\div ${c} = ${q}$. Then $${a} - ${q} = ${answer}$.`,
      };
    }

    if (branch === "receipt") {
      const count = randChoice(rng, [3, 4, 5] as const);
      const items = shuffle(rng, RECEIPT_ITEMS).slice(0, count);
      const total = items.reduce((s, it) => s + it.price, 0);
      const totalStr = (total / 1).toFixed(2);
      return {
        kind: "fill-blank",
        prompt: `A shopper buys ${items.map((it) => `${it.name} (KES ${it.price.toFixed(2)})`).join(", ")}. What is the total bill?`,
        before: "Total = KES",
        after: "",
        correctAnswer: totalStr,
        acceptedAnswers: [String(total)],
        inputMode: "numeric",
        hint: "Add up all the decimal prices, lining up the decimal points.",
        explanation: `${items.map((it) => it.price.toFixed(2)).join(" + ")} = ${totalStr}.`,
      };
    }

    if (branch === "terminating-sort") {
      const count = 5;
      const term = shuffle(rng, TERMINATING).slice(0, Math.ceil(count / 2));
      const rec = shuffle(rng, RECURRING).slice(0, Math.floor(count / 2));
      const all = shuffle(rng, [...term, ...rec]);
      const items = all.map(([n, d]) => ({ id: `${n}-${d}`, label: `${n}/${d}` }));
      const buckets = [
        { id: "terminating", label: "Terminating decimal" },
        { id: "recurring", label: "Recurring decimal" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const [n, d] of term) correctBucket[`${n}-${d}`] = "terminating";
      for (const [n, d] of rec) correctBucket[`${n}-${d}`] = "recurring";
      return {
        kind: "categorize",
        prompt: "Sort each fraction by whether it converts to a terminating or a recurring decimal.",
        items,
        buckets,
        correctBucket,
        hint: "A fraction's decimal terminates only when its simplest-form denominator's only prime factors are 2 and/or 5.",
        explanation: `Terminating: ${term.map(([n, d]) => `${n}/${d} = ${(n / d).toFixed(3)}`).join(", ")}. Recurring: ${rec
          .map(([n, d]) => `${n}/${d} = ${(n / d).toFixed(3)}...`)
          .join(", ")}.`,
      };
    }

    // order: order decimals from smallest to largest
    const count = 5;
    const seen = new Set<number>();
    while (seen.size < count) {
      seen.add(randInt(rng, -50, 50) / 10 ** randChoice(rng, [1, 2] as const));
    }
    const values = Array.from(seen);
    const items = values.map((v) => ({ id: `v${v}`, label: v.toFixed(decimalPlaces(v) || 1) }));
    const sorted = [...values].sort((a, b) => a - b);
    return {
      kind: "ordering",
      prompt: "Order these decimals from smallest to largest.",
      instruction: "Click them in order.",
      items: shuffle(rng, items),
      correctOrder: sorted.map((v) => `v${v}`),
      hint: "Compare digit by digit starting from the whole-number part, then the tenths, then the hundredths.",
      explanation: `In order: ${sorted.map((v) => v.toFixed(decimalPlaces(v) || 1)).join(", ")}.`,
    };
  },
};
