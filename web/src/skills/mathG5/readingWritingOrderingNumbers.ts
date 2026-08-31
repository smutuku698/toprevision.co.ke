import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, fmt, numberToWords } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Grade 5 caps reading/writing in words AND ordering at tens of thousands (a 5-digit ceiling) —
// a lower ceiling than the 6-digit place/total-value ceiling in N.1 (see curriculum scope notes).
const MIN_N = 101;
const MAX_N = 99999;

/** Swap two distinct digits of n to produce a plausible "misread" value — the classic
 * place-value-transposition misconception (e.g. reading 12,405 as 12,450). */
function transposeDigits(rng: RNG, n: number): number {
  const digits = String(n).split("");
  if (digits.length < 2) return n + 1;
  for (let attempt = 0; attempt < 6; attempt++) {
    const i = randInt(rng, 0, digits.length - 1);
    let j = randInt(rng, 0, digits.length - 1);
    while (j === i) j = randInt(rng, 0, digits.length - 1);
    const copy = [...digits];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    if (copy[0] !== "0") {
      const val = Number(copy.join(""));
      if (val !== n) return val;
    }
  }
  return n + 10;
}

export const readingWritingOrderingNumbers: Skill = {
  id: "g5-math-n-reading-writing-ordering",
  code: "N.2",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Reading, writing and ordering numbers",
  description: "Read and write numbers up to tens of thousands in words, and order numbers up to tens of thousands, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["digits-to-words", "words-to-digits", "choose-words", "choose-digits", "match-number-words", "order-numbers", "spot-the-error"] as const);

    if (branch === "digits-to-words") {
      const n = randInt(rng, MIN_N, MAX_N);
      const openers = [
        `Write ${fmt(n)} in words.`,
        `Spell out ${fmt(n)} in words.`,
        `Express ${fmt(n)} in words.`,
        `How is ${fmt(n)} written in words?`,
        `Turn ${fmt(n)} into words.`,
        `Write out the number ${fmt(n)} in full words.`,
        `Show ${fmt(n)} written in words.`,
        `Put ${fmt(n)} into words.`,
        `A school clerk needs ${fmt(n)} written in words on a form. Write it out.`,
        `A cheque must show ${fmt(n)} written in words. Write it out.`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, openers),
        before: "In words:",
        after: "",
        correctAnswer: numberToWords(n),
        inputMode: "text",
        hint: "Work from the highest place value down: ten thousands, thousands, then hundreds, tens and ones.",
        explanation: `${fmt(n)} is written as "${numberToWords(n)}".`,
      };
    }

    if (branch === "words-to-digits") {
      const n = randInt(rng, MIN_N, MAX_N);
      const openers = [
        `Write this number in digits: "${numberToWords(n)}"`,
        `Turn these words into digits: "${numberToWords(n)}"`,
        `What number is this in digits: "${numberToWords(n)}"?`,
        `Express in digits: "${numberToWords(n)}"`,
        `Convert to digits: "${numberToWords(n)}"`,
        `A learner wrote "${numberToWords(n)}" in an exercise book. Write it in digits.`,
        `Read these words and give the number in digits: "${numberToWords(n)}"`,
        `Change these words to a number: "${numberToWords(n)}"`,
        `Write the digit form of: "${numberToWords(n)}"`,
        `A teacher dictated "${numberToWords(n)}". Write it in digits.`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, openers),
        before: "In digits:",
        after: "",
        correctAnswer: String(n),
        inputMode: "numeric",
        hint: "Build the number from the largest part of the words down to the smallest.",
        explanation: `"${numberToWords(n)}" is written as ${fmt(n)}.`,
      };
    }

    if (branch === "choose-words") {
      const n = randInt(rng, MIN_N, MAX_N);
      const correct = numberToWords(n);
      const distractorNums = new Set<number>();
      for (let i = 0; i < 6 && distractorNums.size < 3; i++) {
        const d = transposeDigits(rng, n);
        if (d > 0) distractorNums.add(d);
      }
      const wrong = [...distractorNums].map((d) => numberToWords(d)).filter((w) => w !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, Math.min(3, wrong.length));
      const openers = [
        `Which of these correctly writes ${fmt(n)} in words?`,
        `Choose the correct way to write ${fmt(n)} in words.`,
        `Which words correctly describe ${fmt(n)}?`,
        `Pick the correct written form of ${fmt(n)}.`,
        `Select the option that correctly spells out ${fmt(n)}.`,
        `Only one option matches ${fmt(n)}. Which one?`,
        `Which set of words matches ${fmt(n)}?`,
        `Identify the correct words for ${fmt(n)}.`,
        `Which of the following is ${fmt(n)} written in words?`,
        `Choose the option that is ${fmt(n)} in words.`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, openers),
        choices,
        correctIndex,
        layout: "list",
        hint: "Check every place value carefully — the wrong options swap two digits around.",
        explanation: `${fmt(n)} is written as "${correct}". The other options describe a number with two digits swapped.`,
      };
    }

    if (branch === "choose-digits") {
      const n = randInt(rng, MIN_N, MAX_N);
      const words = numberToWords(n);
      const distractorNums = new Set<number>();
      for (let i = 0; i < 6 && distractorNums.size < 3; i++) {
        const d = transposeDigits(rng, n);
        if (d > 0 && d !== n) distractorNums.add(d);
      }
      const wrong = [...distractorNums].map(fmt);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(n), wrong, Math.min(3, wrong.length));
      const openers = [
        `Which number is written in words as: "${words}"?`,
        `Choose the digit form of: "${words}"`,
        `Which of these numbers matches the words "${words}"?`,
        `Pick the number that these words describe: "${words}"`,
        `Select the correct number for: "${words}"`,
        `Only one number matches "${words}". Which one?`,
        `Identify the number written as "${words}".`,
        `Which digits correctly match "${words}"?`,
        `Choose the number that equals "${words}".`,
        `What number do these words describe: "${words}"?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, openers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Build the number one place value at a time, from largest to smallest.",
        explanation: `"${words}" is the number ${fmt(n)}. The other options have two digits swapped.`,
      };
    }

    if (branch === "match-number-words") {
      const nums = new Set<number>();
      while (nums.size < 4) nums.add(randInt(rng, MIN_N, MAX_N));
      const values = [...nums];
      const tokens = values.map((n) => ({ id: `d${n}`, label: fmt(n) }));
      const targets = shuffle(rng, values.map((n) => ({ id: `w${n}`, label: numberToWords(n) })));
      const correctMap: Record<string, string> = {};
      values.forEach((n) => (correctMap[`w${n}`] = `d${n}`));
      const prompts = [
        "Match each number to how it is written in words.",
        "Pair each number with its written-word form.",
        "Match each digit form to its matching words.",
        "Connect each number to the correct words.",
        "Match each number with how it should be spelled out.",
        "Pair each number to its words version.",
        "Link each number to its correct words.",
        "Match each number to the words that describe it.",
        "Connect each digit form to its word form.",
        "Match each number to its correctly spelled-out words.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Compare the thousands part of the words to the thousands digits of the number first.",
        explanation: values.map((n) => `${fmt(n)} = "${numberToWords(n)}"`).join("; ") + ".",
      };
    }

    if (branch === "order-numbers") {
      const nums = new Set<number>();
      while (nums.size < 5) nums.add(randInt(rng, MIN_N, MAX_N));
      const values = [...nums];
      const descending = rng() < 0.5;
      const sorted = [...values].sort((a, b) => (descending ? b - a : a - b));
      const prompts = [
        `Order these numbers from ${descending ? "largest to smallest" : "smallest to largest"}.`,
        `Arrange these numbers from ${descending ? "largest to smallest" : "smallest to largest"}.`,
        `Put these numbers in order, ${descending ? "largest first" : "smallest first"}.`,
        `Sort these numbers ${descending ? "starting with the largest" : "starting with the smallest"}.`,
        `Rank these numbers from ${descending ? "largest to smallest" : "smallest to largest"}.`,
        `A teacher wants these numbers arranged ${descending ? "largest to smallest" : "smallest to largest"}. Do it.`,
        `Sequence these numbers, ${descending ? "largest" : "smallest"} first.`,
        `Line up these numbers ${descending ? "from the biggest down" : "from the smallest up"}.`,
        `Arrange these numbers in ${descending ? "decreasing" : "increasing"} order.`,
        `Put these numbers into ${descending ? "decreasing" : "increasing"} order.`,
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: `Click them in order, ${descending ? "largest" : "smallest"} first.`,
        items: shuffle(rng, values.map((n) => ({ id: String(n), label: fmt(n) }))),
        correctOrder: sorted.map(String),
        hint: "Compare the digits from the left-most (biggest) place value first.",
        explanation: `${descending ? "Largest to smallest" : "Smallest to largest"}: ${sorted.map(fmt).join(", ")}.`,
      };
    }

    // spot-the-error: categorize number/words pairs as correctly written or containing a digit-transposition error.
    const count = 6;
    const used = new Set<number>();
    const pairs: { id: string; numberLabel: number; words: string; isCorrect: boolean; misreadAs: number }[] = [];
    for (let i = 0; i < count; i++) {
      let n = randInt(rng, 1010, MAX_N);
      while (used.has(n)) n = randInt(rng, 1010, MAX_N);
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
    const prompts = [
      "For each number and its words, sort it by whether the words correctly match the number.",
      "Sort each number-and-words pair by whether the words are correct.",
      "Check each pair below and sort by correctness.",
      "Sort these number/words pairs into correct and incorrect.",
      "Decide whether each pair below is correctly written and sort it.",
      "Sort each pair by whether it correctly matches number to words.",
      "Group each number-and-words pair as correct or containing an error.",
      "Sort each pair depending on whether the words match the number.",
      "Classify each number/words pair as correct or wrong.",
      "Sort each pair into the correct bucket based on accuracy.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, prompts),
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
