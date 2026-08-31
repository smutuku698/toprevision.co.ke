import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmt } from "./mathUtils";
import type { Skill } from "@/lib/types";

function roundTo(n: number, base: number): number {
  return Math.round(n / base) * base;
}

/** Two 6-digit-ish addends whose sum stays under 1,000,000. */
function genAddends(rng: RNG): { a: number; b: number } {
  const a = randInt(rng, 1000, 480000);
  const b = randInt(rng, 1000, 480000);
  return { a, b };
}

export const estimatingSumsAndAdditionPatterns: Skill = {
  id: "g5-math-n-estimating-sums-patterns",
  code: "N.6",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Estimating sums and addition patterns",
  description: "Estimate sums by rounding addends to the nearest hundred or thousand, and create/continue number patterns involving addition up to 1,000,000.",
  generate(rng) {
    const branch = randChoice(rng, ["round-hundred", "round-thousand", "estimate-mc", "pattern-next", "pattern-rule-mc", "pattern-match", "pattern-order"] as const);

    if (branch === "round-hundred") {
      const { a, b } = genAddends(rng);
      const ra = roundTo(a, 100);
      const rb = roundTo(b, 100);
      const estimate = ra + rb;
      const openers = [
        `Round ${fmt(a)} and ${fmt(b)} to the nearest hundred before adding.`,
        `To estimate, round both ${fmt(a)} and ${fmt(b)} to the nearest hundred.`,
        `First round ${fmt(a)} and ${fmt(b)} to the nearest hundred.`,
        `Round each of ${fmt(a)} and ${fmt(b)} to the nearest hundred.`,
        `Use rounding to the nearest hundred on ${fmt(a)} and ${fmt(b)}.`,
      ];
      const closers = [
        "What is the estimated sum?",
        "Find the estimated total.",
        "What estimate do you get for the sum?",
        "Work out the estimated sum.",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Estimated sum =",
        after: "",
        correctAnswer: String(estimate),
        inputMode: "numeric",
        hint: "Round each addend to the nearest hundred, then add the rounded numbers.",
        explanation: `${fmt(a)} rounds to ${fmt(ra)}; ${fmt(b)} rounds to ${fmt(rb)}. ${fmt(ra)} + ${fmt(rb)} = ${fmt(estimate)}.`,
      };
    }

    if (branch === "round-thousand") {
      const { a, b } = genAddends(rng);
      const ra = roundTo(a, 1000);
      const rb = roundTo(b, 1000);
      const estimate = ra + rb;
      const openers = [
        `Round ${fmt(a)} and ${fmt(b)} to the nearest thousand before adding.`,
        `To estimate, round both ${fmt(a)} and ${fmt(b)} to the nearest thousand.`,
        `First round ${fmt(a)} and ${fmt(b)} to the nearest thousand.`,
        `Round each of ${fmt(a)} and ${fmt(b)} to the nearest thousand.`,
        `Use rounding to the nearest thousand on ${fmt(a)} and ${fmt(b)}.`,
      ];
      const closers = [
        "What is the estimated sum?",
        "Find the estimated total.",
        "What estimate do you get for the sum?",
        "Work out the estimated sum.",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Estimated sum =",
        after: "",
        correctAnswer: String(estimate),
        inputMode: "numeric",
        hint: "Round each addend to the nearest thousand, then add the rounded numbers.",
        explanation: `${fmt(a)} rounds to ${fmt(ra)}; ${fmt(b)} rounds to ${fmt(rb)}. ${fmt(ra)} + ${fmt(rb)} = ${fmt(estimate)}.`,
      };
    }

    if (branch === "estimate-mc") {
      const { a, b } = genAddends(rng);
      const roundBase = randChoice(rng, [100, 1000] as const);
      const correct = roundTo(a, roundBase) + roundTo(b, roundBase);
      // Misconceptions: rounding only one addend; rounding both down instead of to nearest; rounding to the wrong base.
      const roundOneOnly = roundTo(a, roundBase) + b;
      const roundDownBoth = Math.floor(a / roundBase) * roundBase + Math.floor(b / roundBase) * roundBase;
      const wrongBase = roundBase === 100 ? roundTo(a, 1000) + roundTo(b, 1000) : roundTo(a, 100) + roundTo(b, 100);
      const candidates = [...new Set([roundOneOnly, roundDownBoth, wrongBase])].filter((v) => v !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), candidates.map(fmt), Math.min(3, candidates.length));
      const openers = [
        `A learner wants to quickly estimate ${fmt(a)} + ${fmt(b)} by rounding each number to the nearest ${roundBase === 100 ? "hundred" : "thousand"}.`,
        `To estimate ${fmt(a)} + ${fmt(b)}, round both numbers to the nearest ${roundBase === 100 ? "hundred" : "thousand"} first.`,
        `Estimate the sum of ${fmt(a)} and ${fmt(b)} by rounding both to the nearest ${roundBase === 100 ? "hundred" : "thousand"}.`,
        `Which estimate correctly rounds BOTH ${fmt(a)} and ${fmt(b)} to the nearest ${roundBase === 100 ? "hundred" : "thousand"} before adding?`,
        `A shopkeeper rounds ${fmt(a)} and ${fmt(b)} to the nearest ${roundBase === 100 ? "hundred" : "thousand"} to estimate the total quickly.`,
        `What is the correctly-rounded estimate for ${fmt(a)} + ${fmt(b)}, rounding to the nearest ${roundBase === 100 ? "hundred" : "thousand"}?`,
      ];
      const closers = [" What is the estimated sum?", " Which is the correct estimate?", " Find the best estimate.", " Pick the correctly-rounded estimate."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Round EACH addend to the nearest place before adding — not just one of them, and not always rounding down.",
        explanation: `${fmt(a)} rounds to ${fmt(roundTo(a, roundBase))}; ${fmt(b)} rounds to ${fmt(roundTo(b, roundBase))}. Sum = ${fmt(correct)}. Rounding only one number, or always rounding down, gives the wrong distractors.`,
      };
    }

    if (branch === "pattern-next") {
      const start = randInt(rng, 5, 500) * 10;
      const diff = randInt(rng, 2, 50) * 10;
      const terms = Array.from({ length: 4 }, (_, i) => start + i * diff);
      const next = start + 4 * diff;
      const openers = [
        `Look at this number pattern: ${terms.join(", ")}, ...`,
        `Here is a growing pattern: ${terms.join(", ")}, ...`,
        `Study this addition pattern: ${terms.join(", ")}, ...`,
        `Consider the sequence ${terms.join(", ")}, ...`,
        `This pattern increases by the same amount each time: ${terms.join(", ")}, ...`,
      ];
      const closers = ["What is the next number?", "Find the next term.", "What comes next in the pattern?", "Continue the pattern — what is the next number?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Next number =",
        after: "",
        correctAnswer: String(next),
        inputMode: "numeric",
        hint: `Find the constant amount being added each time, then add it to the last term.`,
        explanation: `Each term increases by ${diff} (${terms[1]} − ${terms[0]} = ${diff}). ${terms[3]} + ${diff} = ${next}.`,
      };
    }

    if (branch === "pattern-rule-mc") {
      const start = randInt(rng, 5, 200) * 10;
      const diff = randInt(rng, 5, 40) * 10;
      const terms = Array.from({ length: 4 }, (_, i) => start + i * diff);
      const wrong = [diff * 2, Math.max(10, diff - 10), diff + 10];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(diff), wrong.map(String), 3);
      const openers = [
        `A pattern goes ${terms.join(", ")}, ...`,
        `Look at this number pattern: ${terms.join(", ")}, ...`,
        `In this pattern, ${terms.join(", ")}, ...`,
        `Study the pattern ${terms.join(", ")}, ...`,
      ];
      const closers = [" what number is being added each time?", " what is the pattern's rule (the amount added each time)?", " find the constant difference between terms.", " what value is added at each step?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Subtract any term from the one right after it.",
        explanation: `${terms[1]} − ${terms[0]} = ${diff}, and this is added every time. Doubling it, or being off by 10, gives the wrong distractors.`,
      };
    }

    if (branch === "pattern-match") {
      const rules = shuffle(rng, [10, 20, 25, 50, 100, 200].map((d) => d)).slice(0, 4);
      const patterns = rules.map((d, i) => {
        const start = randInt(rng, 5, 50) * 10;
        const terms = Array.from({ length: 3 }, (_, k) => start + k * d);
        return { id: `p${i}`, label: `${terms.join(", ")}, ...`, rule: `Add ${d} each time` };
      });
      const tokens = patterns.map((p) => ({ id: p.id, label: p.label }));
      const targets = shuffle(rng, patterns.map((p) => ({ id: `r-${p.id}`, label: p.rule })));
      const correctMap: Record<string, string> = {};
      patterns.forEach((p) => (correctMap[`r-${p.id}`] = p.id));
      const prompts = [
        "Match each number pattern to its rule.",
        "Pair each sequence with the amount added each time.",
        "Match each pattern to the correct addition rule.",
        "Connect each number sequence to its rule.",
        "Match each growing pattern to how much it increases by.",
        "Pair each sequence with its correct rule.",
        "Match each pattern card to the rule that generates it.",
        "Link each number pattern to its addition rule.",
        "Match every sequence to the constant amount it adds.",
        "Connect each pattern to the number added at each step.",
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

    // pattern-order: order several addition patterns by their next term.
    const seen = new Set<number>();
    const seqs: { id: string; label: string; next: number }[] = [];
    let i = 0;
    while (seqs.length < 5) {
      const start = randInt(rng, 5, 300) * 10;
      const diff = randInt(rng, 5, 60) * 10;
      const terms = Array.from({ length: 3 }, (_, k) => start + k * diff);
      const next = start + 3 * diff;
      if (!seen.has(next)) {
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
