import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared Kenyan-localisation pools for Grade 7 HRE.
//
// Kept in one module (rather than copy-pasted per skill, as creG7/preTechnicalG7 do) because all
// eight HRE G7 skills draw on the same learner cohort and the same real Kenyan places of worship —
// duplicating the pools eight times would guarantee they drift apart.
//
// Localisation here is structural, not decorative (RIGOR-STANDARDS.md): threading these pools
// through ~12 scenario templates per skill is what turns 12 templates into a much larger effective
// pool for a learner working through a 20-question session.

/** Given names common in Kenya's Hindu, Jain and Sikh communities — the actual HRE learner cohort. */
export const HRE_NAMES = [
  "Anjali",
  "Rohan",
  "Priya",
  "Karan",
  "Meera",
  "Arjun",
  "Simran",
  "Dev",
  "Kavita",
  "Harpreet",
  "Nisha",
  "Amit",
  "Rekha",
  "Gurleen",
  "Vikram",
  "Shreya",
] as const;

/**
 * Names of classmates, neighbours and colleagues from Kenya's wider communities. The design's
 * essence statement frames HRE around "understanding of differences with people of different
 * heritages and religions", so inter-community scenarios are curriculum-endorsed, not invented.
 */
export const NEIGHBOUR_NAMES = [
  "Wanjiru",
  "Otieno",
  "Amina",
  "Kipchoge",
  "Njeri",
  "Baraka",
  "Chebet",
  "Juma",
  "Naliaka",
  "Mutiso",
] as const;

/** Kenyan towns and neighbourhoods with established Hindu, Jain, Buddhist or Sikh communities. */
export const KENYAN_PLACES = [
  "Parklands, Nairobi",
  "Westlands, Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Machakos",
  "Kericho",
  "Nyeri",
  "Kitale",
  "Kakamega",
] as const;

/** Real categories of place of worship a Kenyan HRE learner would actually visit. */
export const PLACES_OF_WORSHIP = [
  "the Sanatan Dharma mandir",
  "the Jain derasar",
  "the Buddhist vihara",
  "the gurdwara",
] as const;

export function name(rng: RNG): string {
  return randChoice(rng, HRE_NAMES);
}

export function neighbour(rng: RNG): string {
  return randChoice(rng, NEIGHBOUR_NAMES);
}

export function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}

export function worshipPlace(rng: RNG): string {
  return randChoice(rng, PLACES_OF_WORSHIP);
}

/** A curated scenario multiple-choice item: correct answer plus its own confusable distractor set. */
export interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}
