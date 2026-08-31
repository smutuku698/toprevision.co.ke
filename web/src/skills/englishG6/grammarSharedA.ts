// Shared Kenyan-context name/place pools for Grade 6 English "Language Use" (Grammar) skills G.1-G.7
// (determiners, concrete/abstract nouns, correlative conjunctions, relative/indefinite pronouns,
// comparative/superlative adjectives, phrasal quantifiers, future continuous tense).
//
// A second agent builds G.8-G.13 in parallel with its own `grammarSharedB.ts` — minor duplication of
// name/place pools across the two files is expected and acceptable (same precedent already set by the
// Grade 6 Agriculture round).

import { shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

export const KENYAN_NAMES = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
  "Simiyu", "Wekesa", "Chepkoech", "Onyango", "Wairimu", "Korir", "Muthoni", "Kipchoge",
  "Adhiambo", "Lodunga",
] as const;

export const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Eldoret", "Machakos", "Kitale", "Meru", "Nyeri", "Garissa",
  "Kericho", "Kakamega", "Bungoma", "Malindi", "Voi", "Isiolo", "Naivasha", "Thika",
  "Kitui", "Embu", "Homa Bay", "Kilifi", "Narok", "Kajiado", "Migori", "Busia",
  "Marsabit", "Wajir", "Lamu", "Nyahururu", "Nanyuki", "Mombasa", "Nairobi", "Kapsabet",
] as const;

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function pickNames(rng: RNG, count: number): string[] {
  return shuffle(rng, [...KENYAN_NAMES]).slice(0, count);
}

export function pickPlaces(rng: RNG, count: number): string[] {
  return shuffle(rng, [...KENYAN_PLACES]).slice(0, count);
}
