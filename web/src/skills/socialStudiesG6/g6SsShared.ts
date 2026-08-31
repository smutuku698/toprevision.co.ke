// Shared Kenyan/Eastern-African localization pools for Grade 6 Social Studies. Kept local to
// socialStudiesG6/ so parallel builds do not touch any centrally-shared file. Threaded through
// scenario templates via rng so a modest template count produces a much larger effective
// variety (per RIGOR-STANDARDS.md / metallicMaterials.ts).
import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

export const G6_SS_KENYAN_NAMES = [
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

export const G6_SS_KENYAN_PLACES = [
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

/** Eastern African countries this design's strands actually range over (position/size,
 * language groups, resources, EAC). Kenya-first order kept deliberately, since several
 * sub-strands foreground Kenya's own case within the wider region. */
export const EASTERN_AFRICA_COUNTRIES = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Burundi",
  "South Sudan",
  "Somalia",
  "Ethiopia",
] as const;

/** The six countries that were East African Community member states as of this design's
 * writing (Kenya, Uganda, Tanzania, Rwanda, Burundi, South Sudan) — a narrower list than
 * EASTERN_AFRICA_COUNTRIES, used specifically for the 4.2 Regional Co-operations sub-strand. */
export const EAC_MEMBER_STATES = ["Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi", "South Sudan"] as const;

export function g6SsName(rng: RNG): string {
  return randChoice(rng, G6_SS_KENYAN_NAMES);
}

export function g6SsPlace(rng: RNG): string {
  return randChoice(rng, G6_SS_KENYAN_PLACES);
}

export function g6SsCountry(rng: RNG): string {
  return randChoice(rng, EASTERN_AFRICA_COUNTRIES);
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
 * reach the pool-size floor without re-authoring near-duplicate scenarios by hand. See
 * agricultureG6/sharedG6Ag.ts's identical helper for the full rationale — kept as a local
 * duplicate here since this file is intentionally not a shared cross-subject dependency.
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
