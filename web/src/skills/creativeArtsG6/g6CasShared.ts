import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared Kenyan localization pools + small helpers reused across every Grade 6 Creative Arts
// skill file (Strands 1.0 Creating and Executing / 2.0 Performing and Displaying / 3.0
// Appreciation in Creative Arts). Kept here instead of duplicated per file, matching the
// established convention in agricultureG6/g6AgShared.ts.

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
  "Marsabit",
  "Turkana",
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
 * reach the pool-size floor without re-authoring near-duplicate scenarios by hand. Each fact
 * carries its own curated correct answer / plausible-misconception distractors / explanation
 * (authored once); each frame only varies the surrounding scenario narration (actor, place,
 * situational detail) around that fixed fact.
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

export interface FillBlankTemplate {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint?: string;
  explanation: string;
}
