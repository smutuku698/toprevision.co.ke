// Shared Kenyan-localization pools for Grade 6 Agriculture (Hygiene Practices + Production
// Techniques strands). Kept local to agricultureG6/ so this build does not touch any
// centrally-shared file. Threaded through scenario templates via rng so a modest template
// count produces a much larger effective variety (per RIGOR-STANDARDS.md / metallicMaterials.ts).
import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

export const G6_KENYAN_NAMES = [
  "Amina",
  "Baraka",
  "Chebet",
  "Denis",
  "Faith",
  "Fatuma",
  "Gideon",
  "Hassan",
  "Irene",
  "Juma",
  "Kevin",
  "Lilian",
  "Mercy",
  "Mwangi",
  "Naliaka",
  "Otieno",
  "Peris",
  "Rotich",
  "Sarah",
  "Tabitha",
  "Wanjiru",
  "Wafula",
  "Zawadi",
  "Njeri",
] as const;

export const G6_KENYAN_PLACES = [
  "Kisumu",
  "Eldoret",
  "Nakuru",
  "Mombasa",
  "Nyeri",
  "Kitale",
  "Machakos",
  "Kericho",
  "Bungoma",
  "Kakamega",
  "Meru",
  "Embu",
  "Kiambu",
  "Murang'a",
  "Homa Bay",
  "Kajiado",
  "Narok",
  "Migori",
  "Siaya",
  "Kitui",
  "Garissa",
  "Nyahururu",
  "Molo",
  "Voi",
] as const;

export function g6Name(rng: RNG): string {
  return randChoice(rng, G6_KENYAN_NAMES);
}

export function g6Place(rng: RNG): string {
  return randChoice(rng, G6_KENYAN_PLACES);
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
 * See g6AgShared.ts's identical helper (Conservation/Food-Production strands) for the full
 * rationale — kept as a local duplicate here since this file is intentionally not a shared
 * cross-strand dependency.
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
