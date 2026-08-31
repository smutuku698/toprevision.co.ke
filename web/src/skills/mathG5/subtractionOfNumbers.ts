import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmt } from "./mathUtils";
import { COUNT_SCENARIO_SUBJECTS, fillPlace } from "./contexts";
import type { Skill } from "@/lib/types";

/** A pair (minuend, subtrahend) of up-to-6-digit numbers, minuend > subtrahend. */
function genPair(rng: RNG, regroup: boolean): { minuend: number; subtrahend: number } {
  if (!regroup) {
    // Build digit-by-digit so every digit of the subtrahend is <= the matching digit of the minuend
    // (no borrowing needed anywhere).
    const len = randInt(rng, 4, 6);
    const minDigits: number[] = [];
    const subDigits: number[] = [];
    for (let i = 0; i < len; i++) {
      const md = i === 0 ? randInt(rng, 2, 9) : randInt(rng, 0, 9);
      const sd = i === 0 ? randInt(rng, 1, md) : randInt(rng, 0, md);
      minDigits.push(md);
      subDigits.push(sd);
    }
    return { minuend: Number(minDigits.join("")), subtrahend: Number(subDigits.join("")) };
  }
  const minuend = randInt(rng, 100000, 990000);
  const subtrahend = randInt(rng, 10000, minuend - 1000);
  return { minuend, subtrahend };
}

export const subtractionOfNumbers: Skill = {
  id: "g5-math-n-subtraction",
  code: "N.7",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Subtracting whole numbers",
  description: "Subtract up to two 6-digit numbers, without and with regrouping, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["no-regroup", "regroup", "real-world", "missing-minuend-mc", "click-match", "categorize"] as const);

    if (branch === "no-regroup") {
      const { minuend, subtrahend } = genPair(rng, false);
      const answer = minuend - subtrahend;
      const openers = [
        `Work out ${fmt(minuend)} − ${fmt(subtrahend)}.`,
        `Subtract ${fmt(subtrahend)} from ${fmt(minuend)}.`,
        `Find ${fmt(minuend)} minus ${fmt(subtrahend)}.`,
        `Calculate ${fmt(minuend)} − ${fmt(subtrahend)}.`,
        `What is ${fmt(minuend)} take away ${fmt(subtrahend)}?`,
      ];
      const closers = ["", "What is the difference?", "Find the answer.", "Work out the difference."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Difference =",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "Subtract matching place values — no regrouping is needed here.",
        explanation: `${fmt(minuend)} − ${fmt(subtrahend)} = ${fmt(answer)}.`,
      };
    }

    if (branch === "regroup") {
      const { minuend, subtrahend } = genPair(rng, true);
      const answer = minuend - subtrahend;
      const openers = [
        `Subtract with regrouping: ${fmt(minuend)} − ${fmt(subtrahend)}.`,
        `Work out ${fmt(minuend)} − ${fmt(subtrahend)}, regrouping where needed.`,
        `Find the difference ${fmt(minuend)} − ${fmt(subtrahend)}.`,
        `Calculate ${fmt(minuend)} − ${fmt(subtrahend)}.`,
        `What is ${fmt(minuend)} minus ${fmt(subtrahend)}?`,
      ];
      const closers = ["", "What is the difference?", "Find the answer.", "Work out the difference."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Difference =",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "When a digit in the minuend is smaller than the matching digit in the subtrahend, borrow from the place to its left.",
        explanation: `${fmt(minuend)} − ${fmt(subtrahend)} = ${fmt(answer)}.`,
      };
    }

    if (branch === "real-world") {
      const subject = fillPlace(randChoice(rng, COUNT_SCENARIO_SUBJECTS), rng);
      const total = randInt(rng, 50000, 900000);
      const used = randInt(rng, 5000, total - 1000);
      const remaining = total - used;
      const openers = [
        `A record shows the number of ${subject} was ${fmt(total)}. Of these, ${fmt(used)} have already been counted or used.`,
        `Out of ${fmt(total)} ${subject}, a total of ${fmt(used)} has already been accounted for.`,
        `The number of ${subject} started at ${fmt(total)}, and ${fmt(used)} of that has since been used up.`,
        `A report lists ${fmt(total)} ${subject} to begin with; ${fmt(used)} of it has already gone.`,
        `Starting with ${fmt(total)} ${subject}, ${fmt(used)} has already been taken away.`,
      ];
      const closers = ["How many remain?", "Find the number remaining.", "What is left?", "How many are left?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Remaining =",
        after: "",
        correctAnswer: String(remaining),
        inputMode: "numeric",
        hint: "Subtract the amount already used from the starting total.",
        explanation: `${fmt(total)} − ${fmt(used)} = ${fmt(remaining)}.`,
      };
    }

    if (branch === "missing-minuend-mc") {
      const { minuend, subtrahend } = genPair(rng, true);
      const answer = minuend - subtrahend;
      // Misconceptions: adding instead of subtracting; swapping minuend/subtrahend; an off-by-a-digit slip.
      const wrongAdd = minuend + subtrahend;
      const wrongSwap = subtrahend - minuend < 0 ? Math.abs(subtrahend - minuend) : subtrahend;
      const wrongSlip = answer + randChoice(rng, [10, 100, 1000] as const);
      const candidates = [...new Set([wrongAdd, wrongSwap, wrongSlip])].filter((v) => v !== answer && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(answer), candidates.map(fmt), Math.min(3, candidates.length));
      const openers = [
        `A number ${fmt(minuend)} has ${fmt(subtrahend)} subtracted from it.`,
        `Start with ${fmt(minuend)} and take away ${fmt(subtrahend)}.`,
        `${fmt(minuend)} minus ${fmt(subtrahend)} is being worked out.`,
        `From ${fmt(minuend)}, subtract ${fmt(subtrahend)}.`,
      ];
      const closers = [" What is the result?", " Which answer is correct?", " Find the difference.", " What is the correct difference?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Subtract, don't add — and subtract in the right order (larger minus smaller).",
        explanation: `${fmt(minuend)} − ${fmt(subtrahend)} = ${fmt(answer)}. Adding the numbers, or subtracting them in the wrong order, gives the wrong distractors.`,
      };
    }

    if (branch === "click-match") {
      const pairs = pickDistinctPairs(rng, 4);
      const tokens = pairs.map((p, i) => ({ id: `p${i}`, label: `${fmt(p.a)} − ${fmt(p.b)}` }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: fmt(p.a - p.b) })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      const prompts = [
        "Match each subtraction to its answer.",
        "Pair each subtraction expression with its difference.",
        "Match each calculation to its correct result.",
        "Connect each subtraction to its answer.",
        "Match each pair of numbers to their difference.",
        "Pair each subtraction with the correct difference.",
        "Match each expression to its answer.",
        "Link each subtraction sum to its result.",
        "Match every subtraction to its correct answer.",
        "Connect each calculation with its difference.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Work out each difference before matching.",
        explanation: pairs.map((p) => `${fmt(p.a)} − ${fmt(p.b)} = ${fmt(p.a - p.b)}`).join("; ") + ".",
      };
    }

    // categorize: sort subtraction problems by whether they need regrouping.
    const problems = Array.from({ length: 6 }, () => {
      const needsRegroup = rng() < 0.5;
      const { minuend, subtrahend } = genPair(rng, needsRegroup);
      return { minuend, subtrahend, needsRegroup };
    });
    const items = problems.map((p, i) => ({ id: `pr${i}`, label: `${fmt(p.minuend)} − ${fmt(p.subtrahend)}` }));
    const buckets = [
      { id: "no-regroup", label: "No regrouping needed" },
      { id: "regroup", label: "Needs regrouping" },
    ];
    const correctBucket: Record<string, string> = {};
    problems.forEach((p, i) => (correctBucket[`pr${i}`] = p.needsRegroup ? "regroup" : "no-regroup"));
    const catPrompts = [
      "Sort each subtraction by whether it needs regrouping.",
      "Group each problem as needing regrouping, or not.",
      "Classify each subtraction: regrouping needed, or not.",
      "Sort these subtractions into 'needs regrouping' and 'no regrouping'.",
      "Decide whether each subtraction needs regrouping, then sort it.",
      "Check each subtraction for regrouping, and sort accordingly.",
      "Sort each calculation by whether borrowing is required.",
      "Group these subtractions by whether they require regrouping.",
      "Classify each problem by whether any digit needs borrowing.",
      "Sort each subtraction based on whether regrouping is needed.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Compare each digit of the subtrahend to the matching digit of the minuend — if any subtrahend digit is bigger, regrouping is needed.",
      explanation: problems.map((p) => `${fmt(p.minuend)} − ${fmt(p.subtrahend)} ${p.needsRegroup ? "needs" : "does not need"} regrouping`).join("; ") + ".",
    };
  },
};

function pickDistinctPairs(rng: RNG, count: number): { a: number; b: number }[] {
  const seen = new Set<string>();
  const result: { a: number; b: number }[] = [];
  while (result.length < count) {
    const a = randInt(rng, 10000, 990000);
    const b = randInt(rng, 1000, a - 500);
    const key = `${a}-${b}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ a, b });
    }
  }
  return result;
}
