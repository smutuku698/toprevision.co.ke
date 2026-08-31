import { gcd, randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

/** Reduce a fraction to lowest terms, keeping the sign on the numerator. */
export function simplifyFraction(numerator: number, denominator: number): [number, number] {
  if (denominator < 0) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const g = gcd(numerator, denominator) || 1;
  return [numerator / g, denominator / g];
}

/** "3/4" style string for a reduced fraction, or the whole number if it divides evenly. */
export function formatFraction(numerator: number, denominator: number): string {
  const [n, d] = simplifyFraction(numerator, denominator);
  if (d === 1) return String(n);
  return `${n}/${d}`;
}

/** Lowest common multiple of two positive integers. */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / (gcd(a, b) || 1);
}

/** Build a shuffled multiple-choice set from pre-formatted string candidates, deduped against the correct answer. */
export function buildChoicesFromStrings(
  rng: RNG,
  correctText: string,
  candidateTexts: readonly string[],
  count = 3
): { choices: string[]; correctIndex: number } {
  const seen = new Set([correctText]);
  const distractors: string[] = [];
  for (const c of shuffle(rng, candidateTexts)) {
    if (distractors.length >= count) break;
    if (!seen.has(c)) {
      seen.add(c);
      distractors.push(c);
    }
  }
  const choices = shuffle(rng, [correctText, ...distractors]);
  return { choices, correctIndex: choices.indexOf(correctText) };
}

/** Convert an integer 0-999,999 to English words (British "and" style, e.g. "one hundred and five"). */
export function numberToWords(n: number): string {
  const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function threeDigits(num: number): string {
    let s = "";
    if (num >= 100) {
      s += `${ones[Math.floor(num / 100)]} hundred`;
      num %= 100;
      if (num > 0) s += " and ";
    }
    if (num >= 20) {
      s += tens[Math.floor(num / 10)];
      if (num % 10 > 0) s += `-${ones[num % 10]}`;
    } else if (num > 0) {
      s += ones[num];
    }
    return s;
  }

  if (n === 0) return "zero";
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  let result = "";
  if (thousands > 0) {
    result += `${threeDigits(thousands)} thousand`;
    if (rest > 0) result += rest < 100 ? " and " : ", ";
  }
  if (rest > 0) result += threeDigits(rest);
  return result;
}

/** Format an integer with thousands separators, e.g. 123456 -> "123,456". */
export function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** Format a number with up to `decimals` places, dropping a trailing ".0"/".00" etc. */
export function fmtDec(n: number, decimals = 2): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * Compose a prompt from a small "opener" pool crossed with a small "closer" pool — the cheapest way
 * to clear the project's 20+/10-floor distinct-phrasing standard without hand-writing 20 bespoke
 * sentences per branch (see root CLAUDE.md's "Affordable way to reach 20+" note). `openers` and
 * `closers` are plain strings (already containing any embedded values via template literals).
 */
export function composePrompt(rng: RNG, openers: readonly string[], closers: readonly string[]): string {
  return `${randChoice(rng, openers)} ${randChoice(rng, closers)}`;
}
