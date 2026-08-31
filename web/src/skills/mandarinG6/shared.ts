// Shared content pools for Grade 6 Mandarin, "Listening and Speaking" strand.
// Kenyan learner names/places used to build Scenario+Hook multiple-choice prompts across all
// nine theme files, per curriculum-reference/RIGOR-STANDARDS.md.

import type { RNG } from "@/lib/rng";
import { randChoice } from "@/lib/rng";

export const NAMES = [
  "Amina", "Brian", "Chebet", "Dennis", "Faith", "Gideon", "Halima", "Ian",
  "Joyce", "Kevin", "Lilian", "Mohammed", "Naomi", "Otieno", "Peris", "Wanjiru",
] as const;

export const PLACES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Malindi", "Nyeri", "Kitale"] as const;

export function name(rng: RNG): string {
  return randChoice(rng, NAMES);
}
export function place(rng: RNG): string {
  return randChoice(rng, PLACES);
}
