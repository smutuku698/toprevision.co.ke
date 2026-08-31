import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared Kenyan localization pools + small helpers reused across every Grade 6 Agriculture
// (Strand 1.0 Conservation of Resources / Strand 2.0 Food Production Processes) skill file.
// Kept here instead of duplicated per file so a handful of authored facts/frames can be
// combined into the Grade-6-specific 30+ item pool floor without re-typing the same
// place/name pools eight times.

export const KENYAN_PLACES = [
  "Nyeri",
  "Nakuru",
  "Kisumu",
  "Eldoret",
  "Machakos",
  "Kitale",
  "Kericho",
  "Kakamega",
  "Bungoma",
  "Meru",
  "Embu",
  "Kitui",
  "Narok",
  "Kajiado",
  "Homa Bay",
  "Kilifi",
  "Kwale",
  "Garissa",
  "Isiolo",
  "Baringo",
  "Laikipia",
  "Murang'a",
  "Kiambu",
  "Nyandarua",
  "Tharaka Nithi",
  "Vihiga",
  "Siaya",
  "Busia",
  "Kwale County",
  "Marsabit",
] as const;

export const KENYAN_NAMES = [
  "Amina",
  "Baraka",
  "Chebet",
  "Denis",
  "Fatuma",
  "Juma",
  "Kevin",
  "Lilian",
  "Mwangi",
  "Naliaka",
  "Otieno",
  "Wanjiru",
  "Achieng",
  "Kamau",
  "Njeri",
  "Wafula",
  "Cherono",
  "Musyoka",
  "Akinyi",
  "Kiptoo",
  "Wambui",
  "Salim",
  "Nyambura",
  "Odhiambo",
  "Rono",
  "Atieno",
  "Mumbi",
  "Hassan",
] as const;

export function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}

export function name(rng: RNG): string {
  return randChoice(rng, KENYAN_NAMES);
}

export interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

/** Turn a curated ScenarioMC (wrong answers already hand-picked as plausible misconceptions,
 * never a random draw from an unrelated pool) into shuffled multiple-choice fields. */
export function buildScenarioChoices(rng: RNG, q: ScenarioMC): { choices: string[]; correctIndex: number } {
  const choices = shuffle(rng, [q.correct, ...q.wrong]);
  return { choices, correctIndex: choices.indexOf(q.correct) };
}

/**
 * Combine a small authored fact pool with a small set of narrative "frames" to mechanically
 * reach the Grade-6 30-item pool floor without re-authoring near-duplicate scenarios by hand.
 * Each fact carries its own curated correct answer / plausible-misconception distractors /
 * explanation (authored once); each frame only varies the surrounding scenario narration
 * (actor, place, situational detail) around that fixed fact. A pool of F facts x N frames
 * yields F*N genuinely different prompts (different content AND different wording), not F*N
 * copies of one sentence with a name swapped in.
 */
export function expandScenarios<F>(
  facts: readonly F[],
  frames: readonly ((rng: RNG, fact: F) => ScenarioMC)[]
): ((rng: RNG) => ScenarioMC)[] {
  const out: ((rng: RNG) => ScenarioMC)[] = [];
  for (const fact of facts) {
    for (const frame of frames) {
      out.push((rng: RNG) => frame(rng, fact));
    }
  }
  return out;
}

/**
 * Compose a small "opener" pool (functions that build the setup/situation clause, no trailing
 * punctuation, may embed their own random name/place) with a small "closer" pool (plain closing
 * question strings) into a frame array for `expandScenarios`. O openers x C closers yields O*C
 * distinct prompt skeletons from authoring only O+C pieces — the affordable way to clear the
 * 20+-phrasing pool-size floor for scenario/frame branches without hand-writing 20 full frames.
 * See root CLAUDE.md's repetition-defense rules (2026-08-19 raise) for why 20+ is the target.
 */
export function combineFrames<F extends { correct: string; wrong: string[] }>(
  openers: readonly ((rng: RNG, fact: F) => string)[],
  closers: readonly string[]
): ((rng: RNG, fact: F) => ScenarioMC)[] {
  const frames: ((rng: RNG, fact: F) => ScenarioMC)[] = [];
  for (const opener of openers) {
    for (const closer of closers) {
      frames.push((rng, fact) => ({
        prompt: `${opener(rng, fact)}. ${closer}`,
        correct: fact.correct,
        wrong: fact.wrong,
        explanation: fact.correct,
      }));
    }
  }
  return frames;
}

/** Capitalize the first letter — used when a lowercase `situation` clause opens a sentence. */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface FillBlankTemplate {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint?: string;
  explanation: string;
}
