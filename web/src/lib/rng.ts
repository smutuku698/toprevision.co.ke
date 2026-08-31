// Small seedable PRNG (mulberry32) + helpers for procedural question generation.
// Seeded so a question can be reproduced from a URL/seed if ever needed, but by
// default each call is seeded from Date.now()+random for infinite variety.

export type RNG = () => number;

export function makeRng(seed?: number): RNG {
  let a = (seed ?? Math.floor(Math.random() * 2 ** 31)) >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: RNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(rng: RNG, min: number, max: number): number {
  return rng() * (max - min) + min;
}

export function randChoice<T>(rng: RNG, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(rng: RNG, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sample `count` distinct values from a numeric range (inclusive), excluding any in `exclude`. */
export function sampleDistinctInts(
  rng: RNG,
  min: number,
  max: number,
  count: number,
  exclude: readonly number[] = []
): number[] {
  const pool: number[] = [];
  for (let v = min; v <= max; v++) if (!exclude.includes(v)) pool.push(v);
  return shuffle(rng, pool).slice(0, count);
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function roundTo(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** Build a set of plausible wrong answers around a correct numeric answer, deduped. */
export function numericDistractors(
  rng: RNG,
  correct: number,
  candidates: number[],
  count: number
): number[] {
  const unique = Array.from(new Set(candidates.filter((c) => c !== correct)));
  const chosen = shuffle(rng, unique).slice(0, count);
  // Pad with small offsets if we didn't get enough distinct distractors.
  let offset = 1;
  while (chosen.length < count) {
    const candidate = correct + offset * (rng() > 0.5 ? 1 : -1);
    if (candidate !== correct && !chosen.includes(candidate)) chosen.push(candidate);
    offset++;
  }
  return chosen.slice(0, count);
}
