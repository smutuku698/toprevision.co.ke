import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmt } from "./mathUtils";
import type { Skill } from "@/lib/types";

function roundTo(n: number, base: number): number {
  return Math.round(n / base) * base;
}

export const estimatingDifferencesPatternsAndCombinedOps: Skill = {
  id: "g5-math-n-estimating-differences-combined",
  code: "N.8",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Estimating differences, subtraction patterns, and combined operations",
  description: "Estimate differences by rounding, create subtraction number patterns up to 1,000,000, and perform combined addition and subtraction.",
  generate(rng) {
    const branch = randChoice(rng, ["round-hundred", "round-thousand", "estimate-mc", "pattern-next", "pattern-match", "combined-ops", "categorize"] as const);

    if (branch === "round-hundred" || branch === "round-thousand") {
      const base = branch === "round-hundred" ? 100 : 1000;
      const minuend = randInt(rng, 20000, 900000);
      const subtrahend = randInt(rng, 2000, minuend - 1000);
      const estimate = roundTo(minuend, base) - roundTo(subtrahend, base);
      const placeName = base === 100 ? "hundred" : "thousand";
      const openers = [
        `Round ${fmt(minuend)} and ${fmt(subtrahend)} to the nearest ${placeName} before subtracting.`,
        `To estimate, round both ${fmt(minuend)} and ${fmt(subtrahend)} to the nearest ${placeName}.`,
        `First round ${fmt(minuend)} and ${fmt(subtrahend)} to the nearest ${placeName}.`,
        `Round each of ${fmt(minuend)} and ${fmt(subtrahend)} to the nearest ${placeName}.`,
        `Use rounding to the nearest ${placeName} on ${fmt(minuend)} and ${fmt(subtrahend)}.`,
      ];
      const closers = ["What is the estimated difference?", "Find the estimated difference.", "What estimate do you get?", "Work out the estimated difference."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Estimated difference =",
        after: "",
        correctAnswer: String(estimate),
        inputMode: "numeric",
        hint: `Round both numbers to the nearest ${placeName}, then subtract the rounded numbers.`,
        explanation: `${fmt(minuend)} rounds to ${fmt(roundTo(minuend, base))}; ${fmt(subtrahend)} rounds to ${fmt(roundTo(subtrahend, base))}. ${fmt(roundTo(minuend, base))} − ${fmt(roundTo(subtrahend, base))} = ${fmt(estimate)}.`,
      };
    }

    if (branch === "estimate-mc") {
      const base = randChoice(rng, [100, 1000] as const);
      const minuend = randInt(rng, 20000, 900000);
      const subtrahend = randInt(rng, 2000, minuend - 1000);
      const correct = roundTo(minuend, base) - roundTo(subtrahend, base);
      const roundOneOnly = roundTo(minuend, base) - subtrahend;
      const roundDownBoth = Math.floor(minuend / base) * base - Math.floor(subtrahend / base) * base;
      const wrongOrder = roundTo(subtrahend, base) - roundTo(minuend, base);
      const candidates = [...new Set([roundOneOnly, roundDownBoth, Math.abs(wrongOrder)])].filter((v) => v !== correct && v >= 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), candidates.map(fmt), Math.min(3, candidates.length));
      const placeName = base === 100 ? "hundred" : "thousand";
      const openers = [
        `To estimate ${fmt(minuend)} − ${fmt(subtrahend)}, round both to the nearest ${placeName} first.`,
        `A learner rounds ${fmt(minuend)} and ${fmt(subtrahend)} to the nearest ${placeName} to estimate the difference.`,
        `Estimate ${fmt(minuend)} − ${fmt(subtrahend)} by rounding both numbers to the nearest ${placeName}.`,
        `Which estimate correctly rounds BOTH ${fmt(minuend)} and ${fmt(subtrahend)} to the nearest ${placeName}?`,
      ];
      const closers = [" What is the estimated difference?", " Which is the correct estimate?", " Find the best estimate.", " Pick the correctly-rounded estimate."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Round EACH number before subtracting — not just one of them, and always subtract in the same order (minuend minus subtrahend).",
        explanation: `${fmt(minuend)} rounds to ${fmt(roundTo(minuend, base))}; ${fmt(subtrahend)} rounds to ${fmt(roundTo(subtrahend, base))}. Difference = ${fmt(correct)}. Rounding only one number, or swapping the order, gives the wrong distractors.`,
      };
    }

    if (branch === "pattern-next") {
      const start = randInt(rng, 600, 1000) * 100;
      const diff = randInt(rng, 2, 40) * 10;
      const terms = Array.from({ length: 4 }, (_, i) => start - i * diff);
      const next = start - 4 * diff;
      const openers = [
        `Look at this shrinking number pattern: ${terms.join(", ")}, ...`,
        `Here is a pattern that decreases: ${terms.join(", ")}, ...`,
        `Study this subtraction pattern: ${terms.join(", ")}, ...`,
        `Consider the sequence ${terms.join(", ")}, ...`,
        `This pattern decreases by the same amount each time: ${terms.join(", ")}, ...`,
      ];
      const closers = ["What is the next number?", "Find the next term.", "What comes next in the pattern?", "Continue the pattern — what is the next number?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Next number =",
        after: "",
        correctAnswer: String(next),
        inputMode: "numeric",
        hint: "Find the constant amount being subtracted each time, then subtract it from the last term.",
        explanation: `Each term decreases by ${diff} (${terms[0]} − ${terms[1]} = ${diff}). ${terms[3]} − ${diff} = ${next}.`,
      };
    }

    if (branch === "pattern-match") {
      const rules = shuffle(rng, [15, 25, 50, 100, 150, 200]).slice(0, 4);
      const patterns = rules.map((d, i) => {
        const start = randInt(rng, 50, 100) * 100;
        const terms = Array.from({ length: 3 }, (_, k) => start - k * d);
        return { id: `p${i}`, label: `${terms.join(", ")}, ...`, rule: `Subtract ${d} each time` };
      });
      const tokens = patterns.map((p) => ({ id: p.id, label: p.label }));
      const targets = shuffle(rng, patterns.map((p) => ({ id: `r-${p.id}`, label: p.rule })));
      const correctMap: Record<string, string> = {};
      patterns.forEach((p) => (correctMap[`r-${p.id}`] = p.id));
      const prompts = [
        "Match each shrinking pattern to its rule.",
        "Pair each sequence with the amount subtracted each time.",
        "Match each pattern to the correct subtraction rule.",
        "Connect each number sequence to its rule.",
        "Match each shrinking pattern to how much it decreases by.",
        "Pair each sequence with its correct rule.",
        "Match each pattern card to the rule that generates it.",
        "Link each number pattern to its subtraction rule.",
        "Match every sequence to the constant amount it subtracts.",
        "Connect each pattern to the number subtracted at each step.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Subtract consecutive terms to find each pattern's rule.",
        explanation: patterns.map((p) => `${p.label} → ${p.rule}`).join("; ") + ".",
      };
    }

    if (branch === "combined-ops") {
      // a mix of addition and subtraction, evaluated left to right.
      const a = randInt(rng, 5000, 300000);
      const b = randInt(rng, 1000, 200000);
      const c = randInt(rng, 1000, 150000);
      const opOrder = randChoice(rng, ["add-sub", "sub-add"] as const);
      const result = opOrder === "add-sub" ? a + b - c : a - b + c;
      const expr = opOrder === "add-sub" ? `${fmt(a)} + ${fmt(b)} − ${fmt(c)}` : `${fmt(a)} − ${fmt(b)} + ${fmt(c)}`;
      const openers = [
        `Work out: ${expr}.`,
        `Calculate ${expr}.`,
        `Find the answer to ${expr}.`,
        `What is ${expr}?`,
        `Evaluate ${expr}, working from left to right.`,
        `Solve: ${expr}.`,
      ];
      const closers = ["", "Give your final answer.", "What is the result?", "Find the final value."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Answer =",
        after: "",
        correctAnswer: String(result),
        inputMode: "numeric",
        hint: "Work through addition and subtraction from left to right, one step at a time.",
        explanation:
          opOrder === "add-sub"
            ? `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}, then ${fmt(a + b)} − ${fmt(c)} = ${fmt(result)}.`
            : `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}, then ${fmt(a - b)} + ${fmt(c)} = ${fmt(result)}.`,
      };
    }

    // categorize: sort estimated differences by whether they exceed a threshold.
    const threshold = randChoice(rng, [50000, 100000, 200000, 400000] as const);
    const problems = Array.from({ length: 6 }, () => {
      const minuend = randInt(rng, 20000, 900000);
      const subtrahend = randInt(rng, 2000, minuend - 1000);
      const estimate = roundTo(minuend, 1000) - roundTo(subtrahend, 1000);
      return { minuend, subtrahend, estimate };
    });
    const items = problems.map((p, i) => ({ id: `d${i}`, label: `${fmt(p.minuend)} − ${fmt(p.subtrahend)}` }));
    const buckets = [
      { id: "under", label: `Estimated difference under ${fmt(threshold)}` },
      { id: "over", label: `Estimated difference ${fmt(threshold)} or more` },
    ];
    const correctBucket: Record<string, string> = {};
    problems.forEach((p, i) => (correctBucket[`d${i}`] = p.estimate < threshold ? "under" : "over"));
    const catPrompts = [
      `Estimate each difference (round to the nearest thousand), then sort by whether it is under ${fmt(threshold)}.`,
      `Round each pair to the nearest thousand and estimate the difference, then sort using ${fmt(threshold)} as the cut-off.`,
      `Estimate each difference, then group it as under ${fmt(threshold)}, or ${fmt(threshold)} and above.`,
      `Sort these subtractions by their estimated difference, using ${fmt(threshold)} as the dividing line.`,
      `Work out an estimated difference for each pair, then classify it against ${fmt(threshold)}.`,
      `Round and estimate each difference, then decide if it's under ${fmt(threshold)}.`,
      `Estimate first (nearest thousand), then sort each difference by the ${fmt(threshold)} cut-off.`,
      `Which estimated differences are under ${fmt(threshold)}? Sort them all.`,
      `Sort each pair by its estimated difference, above or below ${fmt(threshold)}.`,
      `Estimate each difference to the nearest thousand, then categorise it.`,
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Round both numbers to the nearest thousand, subtract, then compare the estimate to the threshold.",
      explanation: problems.map((p) => `${fmt(p.minuend)} − ${fmt(p.subtrahend)} ≈ ${fmt(p.estimate)}`).join("; ") + ".",
    };
  },
};
