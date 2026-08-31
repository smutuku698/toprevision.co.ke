import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import type { Skill } from "@/lib/types";

/** A proper fraction with denominator not exceeding 12, that isn't already in lowest terms. */
function genSimplifiable(rng: RNG): { n: number; d: number; simpleN: number; simpleD: number } {
  const simpleD = randInt(rng, 2, 6);
  let simpleN = randInt(rng, 1, simpleD - 1);
  while (gcdOf(simpleN, simpleD) !== 1) simpleN = randInt(rng, 1, simpleD - 1);
  const factor = randInt(rng, 2, Math.floor(12 / simpleD));
  return { n: simpleN * factor, d: simpleD * factor, simpleN, simpleD };
}
function gcdOf(a: number, b: number): number {
  return b === 0 ? a : gcdOf(b, a % b);
}

export const simplifyingComparingOrderingFractions: Skill = {
  id: "g5-math-n-fractions-simplify-order",
  code: "N.13",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Simplifying, comparing and ordering fractions",
  description: "Simplify fractions, compare fractions, and order fractions with denominators not exceeding 12.",
  generate(rng) {
    const branch = randChoice(rng, ["simplify", "compare-mc", "compare-same-denom", "order", "click-match", "categorize"] as const);

    if (branch === "simplify") {
      const { n, d, simpleN, simpleD } = genSimplifiable(rng);
      const openers = [
        `Simplify the fraction ${n}/${d}.`,
        `Write ${n}/${d} in its simplest form.`,
        `Reduce ${n}/${d} to its lowest terms.`,
        `What is ${n}/${d} simplified?`,
        `Express ${n}/${d} in simplest form.`,
      ];
      const closers = ["", "Give your answer as a fraction.", "Write the simplified fraction.", "Find the simplest form."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "Simplest form =",
        after: "",
        correctAnswer: `${simpleN}/${simpleD}`,
        inputMode: "text",
        hint: "Divide both the numerator and denominator by their highest common factor.",
        explanation: `The HCF of ${n} and ${d} is ${n / simpleN}. ${n} ÷ ${n / simpleN} = ${simpleN}, and ${d} ÷ ${n / simpleN} = ${simpleD}, so ${n}/${d} = ${simpleN}/${simpleD}.`,
      };
    }

    if (branch === "compare-mc") {
      const d1 = randInt(rng, 2, 12);
      const d2 = randInt(rng, 2, 12);
      const n1 = randInt(rng, 1, d1 - 1);
      const n2 = randInt(rng, 1, d2 - 1);
      if (n1 / d1 === n2 / d2) return this.generate(rng);
      const larger = n1 / d1 > n2 / d2 ? `${n1}/${d1}` : `${n2}/${d2}`;
      const smaller = larger === `${n1}/${d1}` ? `${n2}/${d2}` : `${n1}/${d1}`;
      // Misconception distractors: comparing numerators only, and comparing denominators only.
      const wrongByNumerator = n1 > n2 ? `${n1}/${d1}` : `${n2}/${d2}`;
      const wrongByDenominator = d1 > d2 ? `${n1}/${d1}` : `${n2}/${d2}`;
      const candidates = [...new Set([wrongByNumerator, wrongByDenominator])].filter((v) => v !== larger);
      const { choices } = buildChoicesFromStrings(rng, larger, candidates, Math.min(2, candidates.length));
      const choicesFinal = choices.length > 1 ? choices : [larger, smaller];
      const correctIdx = choicesFinal.indexOf(larger);
      const openers = [
        `Compare ${n1}/${d1} and ${n2}/${d2}.`,
        `Between ${n1}/${d1} and ${n2}/${d2},`,
        `Look at these two fractions: ${n1}/${d1} and ${n2}/${d2}.`,
        `${n1}/${d1} and ${n2}/${d2} are being compared.`,
      ];
      const closers = [" which is larger?", " which fraction is bigger?", " which one is greater?", " find the larger fraction."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices: choicesFinal,
        correctIndex: correctIdx,
        layout: "row",
        hint: "Convert both fractions to a common denominator, then compare the numerators.",
        explanation: `${n1}/${d1} = ${(n1 / d1).toFixed(3)}, ${n2}/${d2} = ${(n2 / d2).toFixed(3)}, so ${larger} is larger. Comparing numerators or denominators alone, without a common denominator, gives the wrong answer.`,
      };
    }

    if (branch === "compare-same-denom") {
      const d = randInt(rng, 4, 12);
      const n1 = randInt(rng, 1, d - 1);
      let n2 = randInt(rng, 1, d - 1);
      while (n2 === n1) n2 = randInt(rng, 1, d - 1);
      const symbol = n1 > n2 ? ">" : "<";
      const wrong = [n1 > n2 ? "<" : ">", "="];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, symbol, wrong, 2);
      const openers = [
        `Compare ${n1}/${d} and ${n2}/${d}.`,
        `Which symbol correctly compares ${n1}/${d} and ${n2}/${d}?`,
        `${n1}/${d} ___ ${n2}/${d} — which symbol fits?`,
        `Fill in the correct comparison: ${n1}/${d} ___ ${n2}/${d}.`,
      ];
      const closers = ["", "Choose >, < or =.", "Pick the correct symbol.", "Which comparison is correct?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "With the same denominator, the fraction with the bigger numerator is bigger.",
        explanation: `${n1}/${d} and ${n2}/${d} share the same denominator, so just compare the numerators: ${n1} ${symbol} ${n2}.`,
      };
    }

    if (branch === "order") {
      const items = pickDistinctFractions(rng, 4);
      const sortedIdx = items.map((_, i) => i).sort((a, b) => items[a].n / items[a].d - items[b].n / items[b].d);
      const prompts = [
        "Order these fractions from smallest to largest.",
        "Arrange these fractions, starting with the smallest.",
        "Put these fractions in order from smallest to largest.",
        "Rank these fractions from smallest to largest.",
        "Sort these fractions into order, smallest first.",
        "Sequence these fractions from smallest to largest.",
        "Line up these fractions from the smallest to the largest.",
        "Place these fractions in order, beginning with the smallest.",
        "Which fraction is smallest? Order them all from there.",
        "Arrange these fractions from smallest to largest value.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest first.",
        items: shuffle(rng, items.map((f, i) => ({ id: `f${i}`, label: `${f.n}/${f.d}` }))),
        correctOrder: sortedIdx.map((i) => `f${i}`),
        hint: "Convert every fraction to a common denominator, or to a decimal, before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${items[i].n}/${items[i].d}`).join(", ")}.`,
      };
    }

    if (branch === "click-match") {
      const pairs = Array.from({ length: 4 }, () => genSimplifiable(rng));
      const tokens = pairs.map((p, i) => ({ id: `p${i}`, label: `${p.n}/${p.d}` }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: `${p.simpleN}/${p.simpleD}` })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      const prompts = [
        "Match each fraction to its simplest form.",
        "Pair each fraction with its reduced form.",
        "Match each fraction to how it looks in lowest terms.",
        "Connect each fraction to its simplified version.",
        "Match each fraction card to its simplest equivalent.",
        "Pair each fraction with its correct simplification.",
        "Match each fraction to its lowest-terms form.",
        "Link each fraction to its simplest fraction.",
        "Match every fraction to its reduced version.",
        "Connect each fraction with its simplest form.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Divide numerator and denominator by their HCF for each fraction.",
        explanation: pairs.map((p) => `${p.n}/${p.d} = ${p.simpleN}/${p.simpleD}`).join("; ") + ".",
      };
    }

    // categorize: sort fractions by whether they are already in simplest form.
    const items6 = Array.from({ length: 6 }, () => {
      const alreadySimple = rng() < 0.5;
      if (alreadySimple) {
        const d = randInt(rng, 3, 12);
        let n = randInt(rng, 1, d - 1);
        while (gcdOf(n, d) !== 1) n = randInt(rng, 1, d - 1);
        return { n, d, simple: true };
      }
      const { n, d } = genSimplifiable(rng);
      return { n, d, simple: false };
    });
    const items = items6.map((f, i) => ({ id: `f${i}`, label: `${f.n}/${f.d}` }));
    const buckets = [
      { id: "simple", label: "Already in simplest form" },
      { id: "not-simple", label: "Can still be simplified" },
    ];
    const correctBucket: Record<string, string> = {};
    items6.forEach((f, i) => (correctBucket[`f${i}`] = f.simple ? "simple" : "not-simple"));
    const catPrompts = [
      "Sort each fraction by whether it is already in simplest form.",
      "Group each fraction as simplest form, or can still be simplified.",
      "Classify each fraction: already reduced, or not.",
      "Sort these fractions into 'simplest form' and 'can be simplified'.",
      "Check each fraction's numerator and denominator for a common factor, then sort it.",
      "Decide whether each fraction can be simplified further, then sort it.",
      "Sort each fraction by whether its numerator and denominator share a common factor.",
      "Group these fractions by whether they are fully reduced.",
      "Classify each fraction by whether it is in lowest terms.",
      "Sort each fraction based on whether it can still be reduced.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "A fraction is in simplest form when its numerator and denominator have no common factor other than 1.",
      explanation: items6.map((f) => `${f.n}/${f.d} is ${f.simple ? "already simplest form" : "not yet simplified"}`).join("; ") + ".",
    };
  },
};

function pickDistinctFractions(rng: RNG, count: number): { n: number; d: number }[] {
  const seen = new Set<string>();
  const result: { n: number; d: number }[] = [];
  while (result.length < count) {
    const d = randInt(rng, 3, 12);
    const n = randInt(rng, 1, d - 1);
    const key = `${n}/${d}`;
    const val = n / d;
    if (!seen.has(key) && !result.some((r) => r.n / r.d === val)) {
      seen.add(key);
      result.push({ n, d });
    }
  }
  return result;
}
