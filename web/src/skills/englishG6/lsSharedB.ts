// Shared Kenyan-context name/place pool for the Listening & Speaking skills covering themes 8-13
// (The Farm - Animal Safety and Care, Lifestyle Diseases, Proper Use of Leisure Time, Sports - Indoor Games,
// Environment Conservation, Money - Trade). A separate agent is building themes 1-7 in the same folder in
// parallel and may create its own similarly-named shared file — small duplication across the two L&S
// shared-helper files is expected and fine (same precedent as this project's Grade 6 Agriculture round,
// which shipped g6AgShared.ts and sharedG6Ag.ts side by side).
import { shuffle, type RNG } from "@/lib/rng";

export const KENYAN_NAMES = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
  "Simiyu", "Wekesa", "Chepkoech", "Onyango", "Wairimu", "Korir", "Lodunga", "Kadzo",
  "Sanaipei", "Chebet", "Njoroge", "Adhiambo",
];

export const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Eldoret", "Machakos", "Nyeri", "Kitale", "Malindi", "Garissa",
  "Kericho", "Bungoma", "Kakamega", "Meru", "Embu", "Voi", "Naivasha", "Lodwar",
  "Kilifi", "Isiolo", "Homa Bay", "Nanyuki",
];

export function pickNames(rng: RNG, count: number): string[] {
  return shuffle(rng, KENYAN_NAMES).slice(0, count);
}

export function pickPlace(rng: RNG): string {
  return shuffle(rng, KENYAN_PLACES)[0];
}

/** Fill "{name}"/"{name2}"/"{place}" tokens in a static template string with rng-picked Kenyan values,
 * so a small fixed set of templates still reads as varied across many generations. */
export function fillTokens(template: string, rng: RNG): string {
  const names = pickNames(rng, 2);
  const place = pickPlace(rng);
  return template.replace(/\{name2\}/g, names[1]).replace(/\{name\}/g, names[0]).replace(/\{place\}/g, place);
}

// ---- Cross-theme sound bank for themes 8-13 ---------------------------------
// Every target sound named across Listening & Speaking themes 8-13 in
// curriculum-reference/grade-6/english.json, with a small exemplar-word pool for each.
export type SoundEntry = { theme: string; sound: string; word: string };

export const SOUND_BANK: SoundEntry[] = [
  // LS.8 The Farm - Animal Safety and Care — /ʃ/ and /ʧ/
  { theme: "LS.8", sound: "/ʃ/", word: "sheep" },
  { theme: "LS.8", sound: "/ʃ/", word: "shelter" },
  { theme: "LS.8", sound: "/ʃ/", word: "shed" },
  { theme: "LS.8", sound: "/ʃ/", word: "wash" },
  { theme: "LS.8", sound: "/ʃ/", word: "fish" },
  { theme: "LS.8", sound: "/ʧ/", word: "chicken" },
  { theme: "LS.8", sound: "/ʧ/", word: "chain" },
  { theme: "LS.8", sound: "/ʧ/", word: "chew" },
  { theme: "LS.8", sound: "/ʧ/", word: "catch" },
  { theme: "LS.8", sound: "/ʧ/", word: "teach" },
  // LS.9 Lifestyle Diseases — /eə/, /aʊ/ and /h/
  { theme: "LS.9", sound: "/eə/", word: "care" },
  { theme: "LS.9", sound: "/eə/", word: "share" },
  { theme: "LS.9", sound: "/eə/", word: "chair" },
  { theme: "LS.9", sound: "/aʊ/", word: "house" },
  { theme: "LS.9", sound: "/aʊ/", word: "how" },
  { theme: "LS.9", sound: "/aʊ/", word: "now" },
  { theme: "LS.9", sound: "/h/", word: "health" },
  { theme: "LS.9", sound: "/h/", word: "heart" },
  { theme: "LS.9", sound: "/h/", word: "habit" },
  // LS.10 Proper Use of Leisure Time — /h/ as in holiday, /j/ as in yam, /eə/ as in air
  { theme: "LS.10", sound: "/h/", word: "holiday" },
  { theme: "LS.10", sound: "/h/", word: "hobby" },
  { theme: "LS.10", sound: "/h/", word: "happy" },
  { theme: "LS.10", sound: "/j/", word: "yam" },
  { theme: "LS.10", sound: "/j/", word: "yellow" },
  { theme: "LS.10", sound: "/j/", word: "young" },
  { theme: "LS.10", sound: "/eə/", word: "air" },
  { theme: "LS.10", sound: "/eə/", word: "fair" },
  { theme: "LS.10", sound: "/eə/", word: "square" },
  // LS.11 Sports - Indoor Games — /ʊ/ and /uː/
  { theme: "LS.11", sound: "/ʊ/", word: "book" },
  { theme: "LS.11", sound: "/ʊ/", word: "good" },
  { theme: "LS.11", sound: "/ʊ/", word: "look" },
  { theme: "LS.11", sound: "/uː/", word: "moon" },
  { theme: "LS.11", sound: "/uː/", word: "school" },
  { theme: "LS.11", sound: "/uː/", word: "food" },
  // LS.12 Environment Conservation — /ʒ/ and /ʤ/
  { theme: "LS.12", sound: "/ʒ/", word: "treasure" },
  { theme: "LS.12", sound: "/ʒ/", word: "measure" },
  { theme: "LS.12", sound: "/ʒ/", word: "usual" },
  { theme: "LS.12", sound: "/ʤ/", word: "jungle" },
  { theme: "LS.12", sound: "/ʤ/", word: "danger" },
  { theme: "LS.12", sound: "/ʤ/", word: "garbage" },
  // LS.13 Money - Trade — /ʌ/, /ʊ/, /ʊə/, /eɪ/
  { theme: "LS.13", sound: "/ʌ/", word: "but" },
  { theme: "LS.13", sound: "/ʌ/", word: "money" },
  { theme: "LS.13", sound: "/ʌ/", word: "trust" },
  { theme: "LS.13", sound: "/ʊ/", word: "put" },
  { theme: "LS.13", sound: "/ʊ/", word: "full" },
  { theme: "LS.13", sound: "/ʊə/", word: "tour" },
  { theme: "LS.13", sound: "/ʊə/", word: "sure" },
  { theme: "LS.13", sound: "/eɪ/", word: "gate" },
  { theme: "LS.13", sound: "/eɪ/", word: "trade" },
  { theme: "LS.13", sound: "/eɪ/", word: "pay" },
];

/** Words from the SOUND_BANK whose sound differs from `sound` — used to build genuinely
 * different-sounding multiple-choice distractors for a "which word has this sound" question. */
export function crossThemeSoundDistractors(rng: RNG, sound: string, count: number): string[] {
  const pool = SOUND_BANK.filter((e) => e.sound !== sound).map((e) => e.word);
  return shuffle(rng, Array.from(new Set(pool))).slice(0, count);
}
