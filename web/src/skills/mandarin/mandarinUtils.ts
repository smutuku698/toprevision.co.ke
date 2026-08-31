/** Strips pinyin tone marks (e.g. ni-with-tone -> ni, hao-with-tone -> hao) so typed answers without tone-mark input still validate. */
export function foldPinyinTones(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Accepted-answers list for a fill-blank correct answer: the toned pinyin plus a toneless fallback if they differ. */
export function pinyinAccepted(answer: string): string[] | undefined {
  const folded = foldPinyinTones(answer);
  return folded !== answer ? [folded] : undefined;
}

import type { RNG } from "@/lib/rng";
import { shuffle } from "@/lib/rng";

/**
 * Picks multiple-choice distractors preferring items that share the correct answer's `tag`
 * (a real, nameable confusable cluster — e.g. other greetings for a greeting, other holidays
 * for a holiday) before falling back to the rest of the pool if the cluster is too small.
 * Per curriculum-reference/RIGOR-STANDARDS.md's plausible-distractor rule: an unconstrained
 * random draw from a large/heterogeneous pool is eliminable on sight and must be avoided.
 */
export function clusteredDistractors<T extends { tag: string }>(
  rng: RNG,
  pool: readonly T[],
  correct: T,
  count: number,
  isSameItem: (a: T, b: T) => boolean
): T[] {
  const sameCluster = pool.filter((v) => v.tag === correct.tag && !isSameItem(v, correct));
  const rest = pool.filter((v) => v.tag !== correct.tag && !isSameItem(v, correct));
  const chosen = shuffle(rng, sameCluster).slice(0, count);
  if (chosen.length < count) chosen.push(...shuffle(rng, rest).slice(0, count - chosen.length));
  return chosen;
}

/**
 * Compose a small "opener" phrase pool with a small "closer" phrase pool into every ordered
 * combination — an affordable way to clear the prompt-stem pool-size floor (target 20+, hard
 * floor 10 per curriculum-reference/RIGOR-STANDARDS.md's permanent repetition-defense rule)
 * without hand-writing 20+ fully independent sentences per branch. An O-opener x C-closer pool
 * yields O*C distinct prompt strings from authoring only O+C short pieces.
 */
export function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  return openers.flatMap((o) => closers.map((c) => `${o} ${c}`));
}
