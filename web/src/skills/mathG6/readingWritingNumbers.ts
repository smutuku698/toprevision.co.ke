import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, numberToWords } from "./mathUtils";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** Swap two distinct digits of n to produce a plausible "misread" value — the classic
 * place-value-transposition misconception (e.g. reading 12,405 as 12,450). */
function transposeDigits(rng: RNG, n: number): number {
  const digits = String(n).split("");
  if (digits.length < 2) return n + 1;
  for (let attempt = 0; attempt < 6; attempt++) {
    const [i, j] = sampleDistinctInts(rng, 0, digits.length - 1, 2);
    const copy = [...digits];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    if (copy[0] !== "0") {
      const val = Number(copy.join(""));
      if (val !== n) return val;
    }
  }
  return n + 10;
}

export const readingWritingNumbers: Skill = {
  id: "g6-math-n-reading-writing-numbers",
  code: "N.2",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Reading and writing numbers",
  description: "Read and write numbers up to 100,000 in words and in symbols, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["digits-to-words", "words-to-digits", "choose-words", "choose-digits", "match-number-words", "order-by-words", "spot-the-error"] as const);

    if (branch === "digits-to-words") {
      const n = randInt(rng, 101, 100000);
      return {
        kind: "fill-blank",
        prompt: `Write ${fmt(n)} in words.`,
        before: "In words:",
        after: "",
        correctAnswer: numberToWords(n),
        inputMode: "text",
        hint: "Work from the highest place value down: thousands, then hundreds, tens and ones.",
        explanation: `${fmt(n)} is written as "${numberToWords(n)}".`,
      };
    }

    if (branch === "words-to-digits") {
      const n = randInt(rng, 101, 100000);
      return {
        kind: "fill-blank",
        prompt: `Write this number in digits: "${numberToWords(n)}"`,
        before: "In digits:",
        after: "",
        correctAnswer: String(n),
        inputMode: "numeric",
        hint: "Build the number from the largest part of the words down to the smallest.",
        explanation: `"${numberToWords(n)}" is written as ${fmt(n)}.`,
      };
    }

    if (branch === "choose-words") {
      const n = randInt(rng, 101, 100000);
      const correct = numberToWords(n);
      const distractorNums = new Set<number>();
      for (let i = 0; i < 5 && distractorNums.size < 3; i++) {
        const d = transposeDigits(rng, n);
        if (d > 0) distractorNums.add(d);
      }
      const wrong = [...distractorNums].map((d) => numberToWords(d)).filter((w) => w !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, Math.min(3, wrong.length));
      return {
        kind: "multiple-choice",
        prompt: `Which of these correctly writes ${fmt(n)} in words?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Check every place value carefully — the wrong options swap two digits around.",
        explanation: `${fmt(n)} is written as "${correct}".`,
      };
    }

    if (branch === "choose-digits") {
      const n = randInt(rng, 101, 100000);
      const words = numberToWords(n);
      const distractorNums = new Set<number>();
      for (let i = 0; i < 6 && distractorNums.size < 3; i++) {
        const d = transposeDigits(rng, n);
        if (d > 0 && d !== n) distractorNums.add(d);
      }
      const wrong = [...distractorNums].map(fmt);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(n), wrong, Math.min(3, wrong.length));
      return {
        kind: "multiple-choice",
        prompt: `Which number is written in words as: "${words}"?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Build the number one place value at a time, from largest to smallest.",
        explanation: `"${words}" is the number ${fmt(n)}.`,
      };
    }

    if (branch === "match-number-words") {
      const nums = new Set<number>();
      while (nums.size < 4) nums.add(randInt(rng, 101, 100000));
      const values = [...nums];
      const tokens = values.map((n) => ({ id: `d${n}`, label: fmt(n) }));
      const targets = shuffle(rng, values.map((n) => ({ id: `w${n}`, label: numberToWords(n) })));
      const correctMap: Record<string, string> = {};
      values.forEach((n) => (correctMap[`w${n}`] = `d${n}`));
      return {
        kind: "click-match",
        prompt: "Match each number to how it is written in words.",
        tokens,
        targets,
        correctMap,
        hint: "Compare the thousands part of the words to the thousands digits of the number first.",
        explanation: values.map((n) => `${fmt(n)} = "${numberToWords(n)}"`).join("; ") + ".",
      };
    }

    if (branch === "order-by-words") {
      const nums = new Set<number>();
      while (nums.size < 5) nums.add(randInt(rng, 101, 100000));
      const values = [...nums];
      const sorted = [...values].sort((a, b) => a - b);
      const items = values.map((n) => ({ id: String(n), label: numberToWords(n) }));
      return {
        kind: "ordering",
        prompt: "These numbers are written in words. Order them from smallest to largest.",
        instruction: "Click them in order, smallest first.",
        items: shuffle(rng, items),
        correctOrder: sorted.map(String),
        hint: "Convert each set of words to digits first, then compare place by place.",
        explanation: `In digits, from smallest to largest: ${sorted.map(fmt).join(", ")}.`,
      };
    }

    // spot-the-error: categorize number/words pairs as correctly written or containing a digit-transposition error.
    const count = 6;
    const used = new Set<number>();
    const pairs: { id: string; numberLabel: number; words: string; isCorrect: boolean; misreadAs: number }[] = [];
    for (let i = 0; i < count; i++) {
      let n = randInt(rng, 1010, 99999);
      while (used.has(n)) n = randInt(rng, 1010, 99999);
      used.add(n);
      const isCorrect = rng() < 0.5;
      const misreadAs = isCorrect ? n : transposeDigits(rng, n);
      const words = numberToWords(misreadAs);
      pairs.push({ id: `p${i}`, numberLabel: n, words, isCorrect, misreadAs });
    }
    const items = pairs.map((p) => ({ id: p.id, label: `${fmt(p.numberLabel)} — "${p.words}"` }));
    const buckets = [
      { id: "correct", label: "Correctly written" },
      { id: "error", label: "Has a digit error" },
    ];
    const correctBucket: Record<string, string> = {};
    pairs.forEach((p) => (correctBucket[p.id] = p.isCorrect ? "correct" : "error"));
    return {
      kind: "categorize",
      prompt: "For each number and its words, sort it by whether the words correctly match the number.",
      items,
      buckets,
      correctBucket,
      hint: "Convert the words back to digits and compare place by place with the given number.",
      explanation: pairs
        .map((p) => (p.isCorrect ? `${fmt(p.numberLabel)} — "${p.words}" is correct` : `${fmt(p.numberLabel)} — "${p.words}" is wrong (those words actually describe ${fmt(p.misreadAs)}, with two digits swapped)`))
        .join("; ") + ".",
    };
  },
};
