import { gcd, randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, fmt, lcm } from "./mathUtils";
import { HCF_GROUPING_CONTEXTS, LCM_REPEATING_EVENT_CONTEXTS, place } from "./contexts";
import type { Skill } from "@/lib/types";

const DIVISORS = [2, 5, 10] as const;
const DIVISOR_RULES: Record<number, string> = {
  2: "its last digit is even (0, 2, 4, 6 or 8)",
  5: "its last digit is 0 or 5",
  10: "its last digit is 0",
};

function isDivisible(n: number, d: number): boolean {
  return n % d === 0;
}

/** A random number, guaranteed divisible by d, within a real-life-sized range. */
function makeDivisibleBy(rng: RNG, d: number): number {
  const k = randInt(rng, 10, 2000);
  return k * d;
}

/** A pair of numbers whose HCF is exactly g (built from two coprime multipliers of g). */
function genHcfPair(rng: RNG): { a: number; b: number; g: number; m1: number; m2: number } {
  const g = randInt(rng, 2, 12);
  let m1 = randInt(rng, 2, 9);
  let m2 = randInt(rng, 2, 9);
  while (gcd(m1, m2) !== 1 || m1 === m2) {
    m1 = randInt(rng, 2, 9);
    m2 = randInt(rng, 2, 9);
  }
  return { a: g * m1, b: g * m2, g, m1, m2 };
}

export const divisibilityHcfLcm: Skill = {
  id: "g5-math-n-divisibility-hcf-lcm",
  code: "N.4",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Divisibility, HCF and LCM",
  description: "Apply divisibility tests of 2, 5 and 10, and determine the HCF/GCD and LCM of numbers, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["divisibility-check", "divisibility-sort", "divisibility-rule-match", "hcf-classical", "hcf-real-world", "lcm-classical", "lcm-real-world", "order-lcm"] as const);

    if (branch === "divisibility-check") {
      const d = randChoice(rng, DIVISORS);
      const base = makeDivisibleBy(rng, d);
      // Offset range is independent of d (not capped at d-1) — for d=2, a range of only [1, d-1]=[1,1]
      // collapses to a single achievable offset (base±1), which can never produce 3 distinct
      // non-divisible candidates and loops forever. A wider fixed range always has enough non-divisible
      // offsets for every d in DIVISORS.
      const offsets = new Set<number>();
      while (offsets.size < 3) {
        const o = randInt(rng, 1, 9);
        const sign = rng() < 0.5 ? 1 : -1;
        const candidate = base + sign * o;
        if (candidate > 0 && !isDivisible(candidate, d)) offsets.add(candidate);
      }
      const candidates = [...offsets];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(base), candidates.map(fmt), Math.min(3, candidates.length));
      const openers = [
        `Which of these numbers is exactly divisible by ${d}?`,
        `Which number below divides evenly by ${d}, with nothing left over?`,
        `Pick the number that is divisible by ${d}.`,
        `Only one of these numbers is divisible by ${d}. Which one?`,
        `Choose the number that ${d} divides exactly.`,
        `Identify which number is a multiple of ${d}.`,
        `Which of these can be shared into groups of ${d} with none left over?`,
        `Select the number divisible by ${d}.`,
        `A trader wants to pack items in groups of ${d}. Which count below packs exactly?`,
        `Which number here leaves no remainder when divided by ${d}?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, openers),
        choices,
        correctIndex,
        layout: "row",
        hint: `A number is divisible by ${d} if ${DIVISOR_RULES[d]}.`,
        explanation: `${fmt(base)} is divisible by ${d} because ${DIVISOR_RULES[d]}. The other numbers are close but fail the last-digit test.`,
      };
    }

    if (branch === "divisibility-sort") {
      const d = randChoice(rng, DIVISORS);
      const nums = Array.from({ length: 6 }, () => {
        const useDivisible = rng() < 0.5;
        if (useDivisible) return makeDivisibleBy(rng, d);
        // Offset range is independent of d (not just 1..d-1, which collapses to a single value for d=2) —
        // same fix as the divisibility-check branch above, for varied non-divisible numbers at every d.
        let offset = randInt(rng, 1, 9);
        if (offset % d === 0) offset += 1;
        return makeDivisibleBy(rng, d) + offset;
      });
      const items = nums.map((n, i) => ({ id: `n${i}`, label: fmt(n) }));
      const buckets = [
        { id: "yes", label: `Divisible by ${d}` },
        { id: "no", label: `NOT divisible by ${d}` },
      ];
      const correctBucket: Record<string, string> = {};
      nums.forEach((n, i) => (correctBucket[`n${i}`] = isDivisible(n, d) ? "yes" : "no"));
      const prompts = [
        `Sort each number by whether it is divisible by ${d}.`,
        `Sort these numbers into 'divisible by ${d}' and 'not divisible by ${d}'.`,
        `Group each number by whether ${d} divides it exactly.`,
        `Apply the divisibility test for ${d} and sort each number.`,
        `Check each number against the divisibility rule for ${d}, then sort it.`,
        `Sort each of these numbers by the divisibility test for ${d}.`,
        `Classify each number as divisible by ${d} or not.`,
        `Use the last-digit rule for ${d} to sort each number.`,
        `Sort each number by whether it can be divided by ${d} exactly.`,
        `Group these numbers by the divisibility test for ${d}.`,
      ];
      return {
        kind: "categorize",
        prompt: randChoice(rng, prompts),
        items,
        buckets,
        correctBucket,
        hint: `A number is divisible by ${d} if ${DIVISOR_RULES[d]}.`,
        explanation: nums.map((n) => `${fmt(n)} is ${isDivisible(n, d) ? "" : "NOT "}divisible by ${d} (last digit ${n % 10})`).join("; ") + ".",
      };
    }

    if (branch === "divisibility-rule-match") {
      const pairs = DIVISORS.map((d) => ({ term: `Divisible by ${d}`, meaning: DIVISOR_RULES[d].replace(/^its /, "Its ") }));
      const tokens = pairs.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, pairs.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      pairs.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      const prompts = [
        "Match each divisibility rule to what it checks.",
        "Match each divisor to its divisibility rule.",
        "Pair each rule with the divisor it tests for.",
        "Connect each divisibility test to its rule.",
        "Match each divisor to the correct last-digit rule.",
        "Pair each divisibility statement with its rule.",
        "Match each rule to the divisor it belongs to.",
        "Link each divisor to its correct divisibility test.",
        "Match each divisibility rule to the divisor it describes.",
        "Connect each divisor with its matching rule.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Check the last digit of the number for each rule.",
        explanation: pairs.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    if (branch === "hcf-classical") {
      const { a, b, g } = genHcfPair(rng);
      const openers = [
        `Find the HCF of ${a} and ${b}.`,
        `What is the highest common factor of ${a} and ${b}?`,
        `Work out the HCF (GCD) of ${a} and ${b}.`,
        `Determine the greatest common divisor of ${a} and ${b}.`,
        `Find the greatest number that divides both ${a} and ${b} exactly.`,
        `What is the largest common factor of ${a} and ${b}?`,
        `Calculate the HCF of ${a} and ${b}.`,
        `Find the GCD of ${a} and ${b}.`,
        `What number is the highest common factor shared by ${a} and ${b}?`,
        `Work out the greatest common divisor shared by ${a} and ${b}.`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, openers),
        before: "HCF =",
        after: "",
        correctAnswer: String(g),
        inputMode: "numeric",
        hint: "List the factors of both numbers, then find the largest factor common to both.",
        explanation: `${a} = ${g} × ${a / g} and ${b} = ${g} × ${b / g}, and their multipliers share no common factor, so the HCF is ${g}.`,
      };
    }

    if (branch === "hcf-real-world") {
      const { a, b, g } = genHcfPair(rng);
      const ctx = randChoice(rng, HCF_GROUPING_CONTEXTS);
      const wrongFactorOfOne = 1; // "no common factor" misconception — treating them as having HCF 1
      const wrongProduct = Math.min(a, b); // "smaller number is always the HCF" misconception
      const wrongSum = g + randInt(rng, 1, 3);
      const candidates = [...new Set([wrongFactorOfOne, wrongProduct, wrongSum])].filter((v) => v !== g && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(g), candidates.map(String), Math.min(3, candidates.length));
      const openers = [
        `A trader has ${a} ${ctx.itemA} and ${b} ${ctx.itemB}. They are to be ${ctx.action}.`,
        `A shopkeeper has ${a} ${ctx.itemA} and ${b} ${ctx.itemB}, ${ctx.action}.`,
        `There are ${a} ${ctx.itemA} and ${b} ${ctx.itemB} to be ${ctx.action}.`,
        `A market vendor has ${a} ${ctx.itemA} and ${b} ${ctx.itemB}, to be ${ctx.action}.`,
        `A stall has ${a} ${ctx.itemA} and ${b} ${ctx.itemB} that must be ${ctx.action}.`,
        `A supplier delivers ${a} ${ctx.itemA} and ${b} ${ctx.itemB}, which are to be ${ctx.action}.`,
        `A learner is given ${a} ${ctx.itemA} and ${b} ${ctx.itemB}, to be ${ctx.action}.`,
        `An organiser has ${a} ${ctx.itemA} and ${b} ${ctx.itemB}, and these must be ${ctx.action}.`,
      ];
      const closers = [
        " How many of each go into one group?",
        " How many of each item does each group contain?",
        " What is the size of each group?",
        " How many items of each kind will each group have?",
      ];
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, openers)}${randChoice(rng, closers)}`,
        choices,
        correctIndex,
        layout: "row",
        hint: "The largest group size that works exactly for both totals is their HCF.",
        explanation: `The HCF of ${a} and ${b} is ${g}, so each group holds ${g} of each item. Taking the smaller total or assuming no common factor at all would be wrong here.`,
      };
    }

    if (branch === "lcm-classical") {
      const a = randInt(rng, 2, 12);
      let b = randInt(rng, 2, 12);
      while (b === a) b = randInt(rng, 2, 12);
      const answer = lcm(a, b);
      const openers = [
        `Find the LCM of ${a} and ${b}.`,
        `What is the least common multiple of ${a} and ${b}?`,
        `Work out the LCM of ${a} and ${b}.`,
        `Determine the lowest common multiple of ${a} and ${b}.`,
        `Find the smallest number that both ${a} and ${b} divide into exactly.`,
        `Calculate the LCM of ${a} and ${b}.`,
        `What is the least common multiple shared by ${a} and ${b}?`,
        `Find the lowest number that is a multiple of both ${a} and ${b}.`,
        `What number is the LCM of ${a} and ${b}?`,
        `Work out the smallest common multiple of ${a} and ${b}.`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, openers),
        before: "LCM =",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "List the multiples of each number until you find the smallest one they share.",
        explanation: `Multiples of ${a}: ${Array.from({ length: 6 }, (_, i) => a * (i + 1)).join(", ")}... Multiples of ${b}: ${Array.from({ length: 6 }, (_, i) => b * (i + 1)).join(", ")}... The smallest shared multiple is ${answer}.`,
      };
    }

    if (branch === "lcm-real-world") {
      const a = randInt(rng, 3, 15);
      let b = randInt(rng, 3, 15);
      while (b === a) b = randInt(rng, 3, 15);
      const answer = lcm(a, b);
      const ctx = randChoice(rng, LCM_REPEATING_EVENT_CONTEXTS);
      // Substitute the same {place} value into both events once — eventB's own text intentionally has no
      // second {place} token in the source pool (it refers back to "the same" place as eventA), so reusing
      // one local variable is correct here, not the "called place(rng) twice" bug this rule normally guards.
      const p = place(rng);
      const eventA = ctx.eventA.replace("{place}", p);
      const eventB = ctx.eventB.replace("{place}", p);
      const wrongProduct = a * b; // "just multiply them" misconception, ignoring shared factors
      const wrongSum = a + b;
      const wrongLarger = Math.max(a, b);
      const candidates = [...new Set([wrongProduct, wrongSum, wrongLarger])].filter((v) => v !== answer);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(answer), candidates.map(String), Math.min(3, candidates.length));
      const openers = [
        `${eventA} happens every ${a} minutes, and ${eventB} happens every ${b} minutes.`,
        `${eventA} repeats every ${a} minutes, while ${eventB} repeats every ${b} minutes.`,
        `${eventA} occurs every ${a} minutes, and ${eventB} occurs every ${b} minutes.`,
        `Every ${a} minutes, ${eventA} happens. Every ${b} minutes, ${eventB} happens.`,
        `${eventA} runs on a ${a}-minute cycle, and ${eventB} runs on a ${b}-minute cycle.`,
        `${eventA} takes place every ${a} minutes and ${eventB} every ${b} minutes.`,
      ];
      const closers = [
        " If both happen together right now, after how many minutes will they next happen together again?",
        " They happen together now. In how many minutes will they next coincide?",
        " Starting together now, after how many minutes will both happen at the same time again?",
        " If they start together, how many minutes pass before they line up again?",
      ];
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, openers)}${randChoice(rng, closers)}`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Find the LCM of the two time gaps — simply multiplying them overcounts if they share a common factor.",
        explanation: `The LCM of ${a} and ${b} is ${answer}, so they next coincide after ${answer} minutes. Just multiplying (${a} × ${b} = ${wrongProduct}) overcounts whenever the two numbers share a common factor.`,
      };
    }

    // order-lcm: order several number pairs by their LCM, smallest to largest.
    const seen = new Set<string>();
    const pairs: { id: string; a: number; b: number; l: number }[] = [];
    let i = 0;
    while (pairs.length < 5) {
      const a = randInt(rng, 2, 12);
      let b = randInt(rng, 2, 12);
      while (b === a) b = randInt(rng, 2, 12);
      const key = [a, b].sort((x, y) => x - y).join("-");
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ id: `p${i}`, a, b, l: lcm(a, b) });
        i++;
      }
    }
    const sorted = [...pairs].sort((x, y) => x.l - y.l);
    const prompts = [
      "Order these pairs of numbers from smallest to largest LCM.",
      "Arrange these number pairs by their LCM, smallest first.",
      "Put these pairs in order of their least common multiple.",
      "Sort these pairs by their LCM, starting with the smallest.",
      "Rank these number pairs by their LCM, smallest to largest.",
      "Order these pairs of numbers by their lowest common multiple.",
      "Arrange these pairs from the smallest LCM to the largest.",
      "Sequence these number pairs by LCM, smallest first.",
      "Put these pairs of numbers in increasing order of LCM.",
      "Sort these pairs by least common multiple, smallest to largest.",
    ];
    return {
      kind: "ordering",
      prompt: randChoice(rng, prompts),
      instruction: "Click them in order, smallest LCM first.",
      items: shuffle(rng, pairs).map((p) => ({ id: p.id, label: `${p.a} and ${p.b}` })),
      correctOrder: sorted.map((p) => p.id),
      hint: "Work out the LCM of each pair before comparing.",
      explanation: sorted.map((p) => `${p.a} and ${p.b}: LCM = ${p.l}`).join("; ") + ".",
    };
  },
};
