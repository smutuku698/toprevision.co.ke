// Shared content pools for Grade 6 Indigenous Languages (Upper Primary).
// Mined from grade-6-curriculum-desings/GRADE-6-INDIGENOUS-LANGUAGE-Curriculum-Designs.pdf — see
// curriculum-reference/grade-6/indigenous-languages.json for the full mining record.
//
// Indigenous Languages is deliberately generic/language-agnostic in the KICD design itself: every
// "Suggested Vocabulary" list and example sentence in the source PDF is written in ENGLISH, because
// each school teaches its own community's mother tongue and KICD does not prescribe which one. Skills
// here are English-medium grammar/reading/writing-skill content contextualised through the 9 official
// KICD themes — the same convention already used for this project's Grade 7/8/9 Indigenous Language
// builds (see curriculum.ts's g7-il-*/g8-il-*/il-* strand comments).

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
