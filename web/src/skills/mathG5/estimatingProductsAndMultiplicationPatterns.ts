import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmt } from "./mathUtils";
import type { Skill } from "@/lib/types";

function roundToNearestTen(n: number): number {
  return Math.round(n / 10) * 10;
}

export const estimatingProductsAndMultiplicationPatterns: Skill = {
  id: "g5-math-n-estimating-products-patterns",
  code: "N.10",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Estimating products and multiplication patterns",
  description: "Estimate products by rounding to the nearest ten, and create/continue multiplication number patterns with a product not exceeding 1000.",
  generate(rng) {
    const branch = randChoice(rng, ["round-estimate", "estimate-mc", "pattern-next", "pattern-rule-mc", "pattern-match", "pattern-order"] as const);

    if (branch === "round-estimate") {
      const a = randInt(rng, 12, 88);
      const b = randInt(rng, 12, 88);
      const ra = roundToNearestTen(a);
      const rb = roundToNearestTen(b);
      const estimate = ra * rb;
      const openers = [
        `Round ${a} and ${b} to the nearest ten before multiplying.`,
        `To estimate, round both ${a} and ${b} to the nearest ten.`,
        `First round ${a} and ${b} to the nearest ten.`,
        `Round each of ${a} and ${b} to the nearest ten.`,
        `Use rounding to the nearest ten on ${a} and ${b}.`,
      ];
      const closers = ["What is the estimated product?", "Find the estimated product.", "What estimate do you get?", "Work out the estimated product."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Estimated product =",
        after: "",
        correctAnswer: String(estimate),
        inputMode: "numeric",
        hint: "Round each number to the nearest ten, then multiply the rounded numbers.",
        explanation: `${a} rounds to ${ra}; ${b} rounds to ${rb}. ${ra} × ${rb} = ${fmt(estimate)}.`,
      };
    }

    if (branch === "estimate-mc") {
      const a = randInt(rng, 12, 88);
      const b = randInt(rng, 12, 88);
      const correct = roundToNearestTen(a) * roundToNearestTen(b);
      const roundOneOnly = roundToNearestTen(a) * b;
      const noRounding = a * b;
      const roundDownBoth = Math.floor(a / 10) * 10 * (Math.floor(b / 10) * 10);
      const candidates = [...new Set([roundOneOnly, noRounding, roundDownBoth])].filter((v) => v !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), candidates.map(fmt), Math.min(3, candidates.length));
      const openers = [
        `A learner estimates ${a} × ${b} by rounding both numbers to the nearest ten first.`,
        `To estimate ${a} × ${b}, round both numbers to the nearest ten.`,
        `Estimate the product of ${a} and ${b} by rounding both to the nearest ten.`,
        `Which estimate correctly rounds BOTH ${a} and ${b} to the nearest ten before multiplying?`,
      ];
      const closers = [" What is the estimated product?", " Which is the correct estimate?", " Find the best estimate.", " Pick the correctly-rounded estimate."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Round EACH factor to the nearest ten before multiplying — not just one of them, and not the exact answer.",
        explanation: `${a} rounds to ${roundToNearestTen(a)}; ${b} rounds to ${roundToNearestTen(b)}. Estimated product = ${fmt(correct)}. Rounding only one factor, or not rounding at all, gives the wrong distractors.`,
      };
    }

    if (branch === "pattern-next") {
      const factor = randInt(rng, 2, 9);
      const terms = Array.from({ length: 4 }, (_, i) => factor * (i + 1));
      const next = factor * 5;
      if (next > 1000) return this.generate(rng); // guard, extremely unlikely with these ranges
      const openers = [
        `Look at this multiplication pattern: ${terms.join(", ")}, ...`,
        `Here is a pattern of multiples: ${terms.join(", ")}, ...`,
        `Study this pattern: ${terms.join(", ")}, ...`,
        `Consider the sequence ${terms.join(", ")}, ...`,
        `This pattern lists multiples of the same number: ${terms.join(", ")}, ...`,
      ];
      const closers = ["What is the next number?", "Find the next term.", "What comes next in the pattern?", "Continue the pattern — what is the next number?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Next number =",
        after: "",
        correctAnswer: String(next),
        inputMode: "numeric",
        hint: "These are multiples of the same number — find which number, then multiply it by the next count.",
        explanation: `Each term is a multiple of ${factor} (${factor} × 1, ${factor} × 2, ${factor} × 3, ${factor} × 4, ...). ${factor} × 5 = ${next}.`,
      };
    }

    if (branch === "pattern-rule-mc") {
      const factor = randInt(rng, 3, 12);
      const terms = Array.from({ length: 4 }, (_, i) => factor * (i + 1));
      const wrong = [factor * 2, Math.max(2, factor - 2), factor + 3];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(factor), wrong.map(String), 3);
      const openers = [
        `A pattern goes ${terms.join(", ")}, ...`,
        `Look at this number pattern: ${terms.join(", ")}, ...`,
        `In this pattern, ${terms.join(", ")}, ...`,
        `Study the pattern ${terms.join(", ")}, ...`,
      ];
      const closers = [" all the terms are multiples of which number?", " what number are all these terms multiples of?", " find the number this pattern is built from.", " which number, multiplied by 1, 2, 3, 4..., gives this pattern?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Look at the first term — it is exactly this base number.",
        explanation: `The first term, ${terms[0]}, is the base number, and every other term is a multiple of it. Doubling it, or being off by a small amount, gives the wrong distractors.`,
      };
    }

    if (branch === "pattern-match") {
      const bases = shuffle(rng, [3, 4, 6, 7, 8, 9]).slice(0, 4);
      const patterns = bases.map((f, i) => {
        const terms = Array.from({ length: 3 }, (_, k) => f * (k + 1));
        return { id: `p${i}`, label: `${terms.join(", ")}, ...`, rule: `Multiples of ${f}` };
      });
      const tokens = patterns.map((p) => ({ id: p.id, label: p.label }));
      const targets = shuffle(rng, patterns.map((p) => ({ id: `r-${p.id}`, label: p.rule })));
      const correctMap: Record<string, string> = {};
      patterns.forEach((p) => (correctMap[`r-${p.id}`] = p.id));
      const prompts = [
        "Match each pattern to the number it is built from.",
        "Pair each sequence with the base number it's a multiple of.",
        "Match each pattern to its correct rule.",
        "Connect each number sequence to its base multiple.",
        "Match each pattern to what all its terms are multiples of.",
        "Pair each sequence with its correct rule.",
        "Match each pattern card to the rule that generates it.",
        "Link each number pattern to its multiplication rule.",
        "Match every sequence to the number it multiplies.",
        "Connect each pattern to its base number.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Look at the first term in each pattern — that's the base number.",
        explanation: patterns.map((p) => `${p.label} → ${p.rule}`).join("; ") + ".",
      };
    }

    // pattern-order: order several multiplication patterns by their next term.
    const seen = new Set<number>();
    const seqs: { id: string; label: string; next: number }[] = [];
    let i = 0;
    while (seqs.length < 5) {
      const f = randInt(rng, 2, 15);
      const terms = Array.from({ length: 3 }, (_, k) => f * (k + 1));
      const next = f * 4;
      if (!seen.has(next) && next <= 1000) {
        seen.add(next);
        seqs.push({ id: `s${i}`, label: `${terms.join(", ")}, ...`, next });
        i++;
      }
    }
    const sorted = [...seqs].sort((a, b) => a.next - b.next);
    const prompts = [
      "Order these patterns by their next term, smallest to largest.",
      "Arrange these sequences by their next number, from smallest.",
      "Sort these patterns by what comes next, smallest first.",
      "Put these sequences in order of their next term.",
      "Rank these patterns by their next number, smallest to largest.",
      "Sequence these patterns by their next term.",
      "Order these number patterns by the size of their next term.",
      "Arrange these patterns from smallest next-term to largest.",
      "Sort these sequences by their upcoming term, smallest first.",
      "Put these patterns in increasing order of their next number.",
    ];
    return {
      kind: "ordering",
      prompt: randChoice(rng, prompts),
      instruction: "Click them in order, smallest next term first.",
      items: shuffle(rng, seqs).map((s) => ({ id: s.id, label: s.label })),
      correctOrder: sorted.map((s) => s.id),
      hint: "Work out the next term of each pattern before comparing.",
      explanation: sorted.map((s) => `${s.label} → next is ${s.next}`).join("; ") + ".",
    };
  },
};
