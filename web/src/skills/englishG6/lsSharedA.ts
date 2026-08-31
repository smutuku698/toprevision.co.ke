// Shared helpers for the Grade 6 English "Listening and Speaking" skills built by this agent
// (themes 1-7: Child Labour, Cultural and Religious Celebrations, Etiquette - Telephone,
// Emergency Rescue Services, Our Tourist Attractions, Jobs and Occupation - Work Ethics,
// Technology: Scientific Innovations). A second agent builds themes 8-13 in parallel and may
// create its own similarly-named shared file (e.g. lsSharedB.ts) — minor duplication across the
// two agents' shared files is expected and fine, matching this project's Grade 6 Agriculture
// precedent (g6AgShared.ts / sharedG6Ag.ts).
import { shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

export const KENYAN_NAMES = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
  "Simiyu", "Wekesa", "Chepkoech", "Onyango", "Wairimu", "Korir", "Mueni", "Litali",
] as const;

export const KENYAN_PLACES = [
  "Nakuru", "Kisumu", "Eldoret", "Nyeri", "Machakos", "Kitale", "Malindi", "Kericho",
  "Garissa", "Kakamega", "Bungoma", "Meru", "Nanyuki", "Voi", "Naivasha", "Isiolo",
  "Mombasa", "Thika", "Kitui", "Homa Bay", "Narok", "Migori", "Embu", "Lodwar",
  "Kajiado", "Wajir", "Nyahururu", "Webuye", "Mumias", "Ruiru",
] as const;

export function pickNames(rng: RNG, count: number): string[] {
  return shuffle(rng, KENYAN_NAMES).slice(0, count);
}

export function pickPlace(rng: RNG): string {
  return shuffle(rng, KENYAN_PLACES)[0];
}

// ---- Cross-theme sound bank -------------------------------------------------
// Every target sound named across Listening & Speaking themes 1-7 in
// curriculum-reference/grade-6/english.json, with a small exemplar-word pool for each.
// Themes 1 and 7 give exemplar words verbatim in the design ("tear, appear, rear, clear,
// severe" for /ɪə/; "of/on/from/lot/hot" for /ɒ/; "door/sort/short/ball/call" for /ɔː/) — used
// verbatim below. Themes 2-6 name only the sound (e.g. "Sounds /l/ and /r/") with no exemplar
// word list in the source, matching the design's own pattern of using generic phonics exemplars
// rather than theme vocabulary for sound-identification words — standard, commonly-taught
// exemplar words are supplied for those, each one double-checked not to also contain another
// bank sound in a way that would make it an ambiguous distractor elsewhere in this bank.
export type SoundEntry = { theme: string; sound: string; word: string };

export const SOUND_BANK: SoundEntry[] = [
  // LS.1 Child Labour — /ɪə/ (verbatim from design)
  { theme: "LS.1", sound: "/ɪə/", word: "tear" },
  { theme: "LS.1", sound: "/ɪə/", word: "appear" },
  { theme: "LS.1", sound: "/ɪə/", word: "rear" },
  { theme: "LS.1", sound: "/ɪə/", word: "clear" },
  { theme: "LS.1", sound: "/ɪə/", word: "severe" },
  // LS.2 Cultural and Religious Celebrations — /l/ and /r/
  { theme: "LS.2", sound: "/l/", word: "land" },
  { theme: "LS.2", sound: "/l/", word: "love" },
  { theme: "LS.2", sound: "/l/", word: "light" },
  { theme: "LS.2", sound: "/l/", word: "look" },
  { theme: "LS.2", sound: "/l/", word: "listen" },
  { theme: "LS.2", sound: "/r/", word: "rain" },
  { theme: "LS.2", sound: "/r/", word: "road" },
  { theme: "LS.2", sound: "/r/", word: "right" },
  { theme: "LS.2", sound: "/r/", word: "read" },
  { theme: "LS.2", sound: "/r/", word: "run" },
  // LS.3 Etiquette - Telephone — /æ/ and /ɜː/
  { theme: "LS.3", sound: "/æ/", word: "cat" },
  { theme: "LS.3", sound: "/æ/", word: "bag" },
  { theme: "LS.3", sound: "/æ/", word: "hand" },
  { theme: "LS.3", sound: "/æ/", word: "glad" },
  { theme: "LS.3", sound: "/æ/", word: "mat" },
  { theme: "LS.3", sound: "/ɜː/", word: "bird" },
  { theme: "LS.3", sound: "/ɜː/", word: "girl" },
  { theme: "LS.3", sound: "/ɜː/", word: "word" },
  { theme: "LS.3", sound: "/ɜː/", word: "learn" },
  { theme: "LS.3", sound: "/ɜː/", word: "nurse" },
  // LS.4 Emergency Rescue Services — /ʊə/
  { theme: "LS.4", sound: "/ʊə/", word: "sure" },
  { theme: "LS.4", sound: "/ʊə/", word: "pure" },
  { theme: "LS.4", sound: "/ʊə/", word: "cure" },
  { theme: "LS.4", sound: "/ʊə/", word: "tour" },
  { theme: "LS.4", sound: "/ʊə/", word: "endure" },
  // LS.5 Our Tourist Attractions — /ð/ and /θ/
  { theme: "LS.5", sound: "/ð/", word: "this" },
  { theme: "LS.5", sound: "/ð/", word: "that" },
  { theme: "LS.5", sound: "/ð/", word: "then" },
  { theme: "LS.5", sound: "/ð/", word: "there" },
  { theme: "LS.5", sound: "/ð/", word: "mother" },
  { theme: "LS.5", sound: "/θ/", word: "think" },
  { theme: "LS.5", sound: "/θ/", word: "three" },
  { theme: "LS.5", sound: "/θ/", word: "thin" },
  { theme: "LS.5", sound: "/θ/", word: "path" },
  { theme: "LS.5", sound: "/θ/", word: "both" },
  // LS.6 Jobs and Occupation - Work Ethics — /f/, /v/, /əʊ/
  { theme: "LS.6", sound: "/f/", word: "fish" },
  { theme: "LS.6", sound: "/f/", word: "fun" },
  { theme: "LS.6", sound: "/f/", word: "fast" },
  { theme: "LS.6", sound: "/f/", word: "safe" },
  { theme: "LS.6", sound: "/f/", word: "far" },
  { theme: "LS.6", sound: "/v/", word: "van" },
  { theme: "LS.6", sound: "/v/", word: "very" },
  { theme: "LS.6", sound: "/v/", word: "give" },
  { theme: "LS.6", sound: "/v/", word: "seven" },
  { theme: "LS.6", sound: "/v/", word: "voice" },
  { theme: "LS.6", sound: "/əʊ/", word: "go" },
  { theme: "LS.6", sound: "/əʊ/", word: "home" },
  { theme: "LS.6", sound: "/əʊ/", word: "bone" },
  { theme: "LS.6", sound: "/əʊ/", word: "coat" },
  { theme: "LS.6", sound: "/əʊ/", word: "most" },
  // LS.7 Technology: Scientific Innovations — /ɒ/ and /ɔː/ (verbatim from design)
  { theme: "LS.7", sound: "/ɒ/", word: "of" },
  { theme: "LS.7", sound: "/ɒ/", word: "on" },
  { theme: "LS.7", sound: "/ɒ/", word: "from" },
  { theme: "LS.7", sound: "/ɒ/", word: "lot" },
  { theme: "LS.7", sound: "/ɒ/", word: "hot" },
  { theme: "LS.7", sound: "/ɔː/", word: "door" },
  { theme: "LS.7", sound: "/ɔː/", word: "sort" },
  { theme: "LS.7", sound: "/ɔː/", word: "short" },
  { theme: "LS.7", sound: "/ɔː/", word: "ball" },
  { theme: "LS.7", sound: "/ɔː/", word: "call" },
];

/** Words from the SOUND_BANK whose sound differs from `sound` — used to build genuinely
 * different-sounding multiple-choice distractors for a "which word has this sound" question. */
export function crossThemeSoundDistractors(rng: RNG, sound: string, count: number): string[] {
  const pool = SOUND_BANK.filter((e) => e.sound !== sound).map((e) => e.word);
  return shuffle(rng, Array.from(new Set(pool))).slice(0, count);
}
