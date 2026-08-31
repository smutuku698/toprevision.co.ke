import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}
function roundTen(n: number): number {
  return Math.round(n / 10) * 10;
}
function roundHundred(n: number): number {
  return Math.round(n / 100) * 100;
}

/** Chain of multiplication by a constant ratio, capped at 1000. */
function buildGeoChain(s: number, r: number): number[] {
  const terms = [s];
  while (terms[terms.length - 1] * r <= 1000) terms.push(terms[terms.length - 1] * r);
  return terms;
}

export const estimatingProductsAndPatterns: Skill = {
  id: "g6-math-n-estimating-patterns",
  code: "N.6",
  subjectId: "math",
  strandId: "g6-math-numbers",
  grade: 6,
  title: "Estimating products and multiplication patterns",
  description: "Estimate products by rounding factors to the nearest ten, and explore multiplication patterns with products up to 1,000.",
  generate(rng) {
    const branch = randChoice(rng, ["estimate-fill", "estimate-mc", "pattern-next", "pattern-geometric", "pattern-order", "pattern-sort", "pattern-match"] as const);

    if (branch === "estimate-fill") {
      const a = randInt(rng, 12, 995);
      const b = randInt(rng, 12, 95);
      const ra = roundTen(a);
      const rb = roundTen(b);
      const estimate = ra * rb;
      return {
        kind: "fill-blank",
        prompt: `Estimate $${fmt(a)} \\times ${b}$ by first rounding each number to the nearest ten.`,
        before: "Estimate =",
        after: "",
        correctAnswer: String(estimate),
        inputMode: "numeric",
        hint: `Round ${fmt(a)} to ${fmt(ra)} and ${b} to ${rb}, then multiply.`,
        explanation: `${fmt(a)} rounds to ${fmt(ra)}, and ${b} rounds to ${rb}: $${fmt(ra)} \\times ${rb} = ${fmt(estimate)}$.`,
      };
    }

    if (branch === "estimate-mc") {
      const a = randInt(rng, 12, 995);
      const b = randInt(rng, 12, 95);
      const ra = roundTen(a);
      const rb = roundTen(b);
      const correct = ra * rb;
      const exact = a * b;
      const onlyOneRounded = ra * b;
      const roundedToHundred = roundHundred(a) * roundHundred(b);
      const candidates = [...new Set([exact, onlyOneRounded, roundedToHundred])].filter((v) => v !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), candidates.map(fmt), Math.min(3, candidates.length));
      return {
        kind: "multiple-choice",
        prompt: `Which is the best ESTIMATE of $${fmt(a)} \\times ${b}$, rounding both numbers to the nearest ten first?`,
        choices,
        correctIndex,
        layout: "row",
        hint: "An estimate rounds BOTH numbers to the nearest ten before multiplying — not just one, and not to the nearest hundred.",
        explanation: `Rounding both to the nearest ten: ${fmt(a)} → ${fmt(ra)}, ${b} → ${rb}, giving $${fmt(ra)} \\times ${rb} = ${fmt(correct)}$.`,
      };
    }

    if (branch === "pattern-next") {
      const n = randInt(rng, 3, 15);
      const maxK = Math.floor(1000 / n);
      const s = randInt(rng, 1, Math.max(1, maxK - 5));
      const terms = [0, 1, 2, 3, 4].map((k) => (s + k) * n);
      return {
        kind: "fill-blank",
        prompt: `Find the next number in this pattern: ${terms.slice(0, 4).map(fmt).join(", ")}, ___`,
        before: "Next number =",
        after: "",
        correctAnswer: String(terms[4]),
        inputMode: "numeric",
        hint: `Each number is a multiple of ${n} — find the gap between consecutive terms.`,
        explanation: `This is the ${n} times-table pattern: each term increases by ${n}. The next number is ${fmt(terms[3])} + ${n} = ${fmt(terms[4])}.`,
      };
    }

    if (branch === "pattern-geometric") {
      const s = randChoice(rng, [2, 3, 4, 5] as const);
      const r = randChoice(rng, [2, 3] as const);
      const chain = buildGeoChain(s, r);
      if (chain.length < 5) {
        // Fallback — s=2, r=2 always produces a chain of length 9.
        const fallback = buildGeoChain(2, 2);
        const shown = fallback.slice(0, fallback.length - 1);
        const correct = fallback[fallback.length - 1];
        const prev = shown[shown.length - 1];
        const wrong = [prev + 2, correct * 2, shown[shown.length - 2]];
        const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), [...new Set(wrong)].map(fmt), 3);
        return {
          kind: "multiple-choice",
          prompt: `What is the next number in this pattern: ${shown.map(fmt).join(", ")}, ___?`,
          choices,
          correctIndex,
          layout: "row",
          hint: "Each number is found by multiplying the one before it by the same constant amount.",
          explanation: `Each term is multiplied by 2 to get the next: ${fmt(prev)} × 2 = ${fmt(correct)}.`,
        };
      }
      const shown = chain.slice(0, chain.length - 1);
      const correct = chain[chain.length - 1];
      const prev = shown[shown.length - 1];
      const wrongAdd = prev + r; // mistake: added the ratio instead of multiplying by it
      const wrongExtra = correct * r; // mistake: applied one multiplication step too many
      const wrongRepeat = shown[shown.length - 2]; // mistake: repeated an earlier term
      const wrong = [...new Set([wrongAdd, wrongExtra, wrongRepeat])].filter((v) => v !== correct && v <= 3000);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(correct), wrong.map(fmt), Math.min(3, wrong.length));
      return {
        kind: "multiple-choice",
        prompt: `What is the next number in this pattern: ${shown.map(fmt).join(", ")}, ___?`,
        choices,
        correctIndex,
        layout: "row",
        hint: `Each number is multiplied by ${r} to get the next number in the pattern.`,
        explanation: `Each term is multiplied by ${r} to get the next: ${fmt(prev)} × ${r} = ${fmt(correct)}.`,
      };
    }

    if (branch === "pattern-order") {
      const n = randInt(rng, 3, 20);
      const maxK = Math.floor(1000 / n);
      const ks = sampleDistinctInts(rng, 1, maxK, 5);
      const items = ks.map((k) => ({ id: `k${k}`, label: fmt(k * n) }));
      const sorted = [...ks].sort((a, b) => a - b);
      return {
        kind: "ordering",
        prompt: `These are all multiples of ${n}. Order them from smallest to largest.`,
        instruction: "Click them in order, smallest first.",
        items: shuffle(rng, items),
        correctOrder: sorted.map((k) => `k${k}`),
        hint: `Divide each number by ${n} to see how many times ${n} it represents, then compare.`,
        explanation: `From smallest to largest: ${sorted.map((k) => fmt(k * n)).join(", ")}.`,
      };
    }

    if (branch === "pattern-sort") {
      const n = randInt(rng, 3, 20);
      const maxK = Math.floor(1000 / n);
      const multipleKs = sampleDistinctInts(rng, 1, maxK, 3);
      const multiples = multipleKs.map((k) => k * n);
      const nonMultiples = new Set<number>();
      while (nonMultiples.size < 3) {
        const candidate = randInt(rng, n + 1, 999);
        if (candidate % n !== 0) nonMultiples.add(candidate);
      }
      const combined = shuffle(rng, [...multiples, ...nonMultiples]);
      const items = combined.map((v) => ({ id: String(v), label: fmt(v) }));
      const buckets = [
        { id: "multiple", label: `Multiple of ${n}` },
        { id: "not", label: `Not a multiple of ${n}` },
      ];
      const correctBucket: Record<string, string> = {};
      combined.forEach((v) => (correctBucket[String(v)] = v % n === 0 ? "multiple" : "not"));
      return {
        kind: "categorize",
        prompt: `Sort each number by whether it belongs in the ${n} times-table pattern (is a multiple of ${n}).`,
        items,
        buckets,
        correctBucket,
        hint: `A number is a multiple of ${n} if it divides evenly by ${n}, with no remainder.`,
        explanation: combined.map((v) => `${fmt(v)} ${v % n === 0 ? "is" : "is not"} a multiple of ${n}`).join("; ") + ".",
      };
    }

    // pattern-match: match multiplication facts within the n times-table to their products.
    const n = randInt(rng, 3, 20);
    const maxK = Math.floor(1000 / n);
    const ks = sampleDistinctInts(rng, 1, maxK, 4);
    const tokens = ks.map((k) => ({ id: `k${k}`, label: `${n} × ${k}` }));
    const targets = shuffle(rng, ks.map((k) => ({ id: `p${k}`, label: fmt(n * k) })));
    const correctMap: Record<string, string> = {};
    ks.forEach((k) => (correctMap[`p${k}`] = `k${k}`));
    return {
      kind: "click-match",
      prompt: `Match each multiplication fact to its product.`,
      tokens,
      targets,
      correctMap,
      hint: `Work out ${n} times each number.`,
      explanation: ks.map((k) => `${n} × ${k} = ${fmt(n * k)}`).join("; ") + ".",
    };
  },
};
