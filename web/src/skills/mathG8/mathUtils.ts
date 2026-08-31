import { gcd, shuffle } from "@/lib/rng";
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
