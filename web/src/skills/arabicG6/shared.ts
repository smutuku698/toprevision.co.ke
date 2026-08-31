// Shared content pools for Grade 6 Arabic (Upper Primary, basic/foundational A1-target register).
// Mined from grade-6-curriculum-desings/GRADE-6-ARABIC-Curriculum-Designs.pdf — see
// curriculum-reference/grade-6/arabic.json for the full sourcing record. Grade 6's design gives very
// few concrete Arabic words verbatim (mostly the harakat/tanween/shaddah/madda phonetic-sign names,
// plus a handful of English-register example sentences) — the actual romanized-Arabic vocabulary items
// below were authored to match each sub-strand's NAMED category (e.g. "Vocabulary building- Nuclear
// family") at a basic Grade 6 level, following the same romanized-Arabic + English-meaning convention
// already established in arabicG7/arabicG8.

import type { RNG } from "@/lib/rng";
import { randChoice } from "@/lib/rng";

// ---- Kenyan localization pools (for Scenario+Hook Apply-tier branches) ----------------------------

export const NAMES = [
  "Amina", "Brian", "Chebet", "Dennis", "Fatuma", "Gideon", "Halima", "Ian",
  "Joyce", "Kevin", "Lilian", "Mohammed", "Naomi", "Otieno", "Peris", "Rashid",
] as const;

export const PLACES = [
  "Mombasa", "Kisumu", "Nakuru", "Garissa", "Malindi", "Nairobi", "Eldoret", "Lamu",
] as const;

export function name(rng: RNG): string {
  return randChoice(rng, NAMES);
}
export function place(rng: RNG): string {
  return randChoice(rng, PLACES);
}

// ---- Theme 1: Greetings and Introduction -----------------------------------------------------------

export const GREETING_VOCAB: { word: string; meaning: string }[] = [
  { word: "sabah al-khair", meaning: "good morning" },
  { word: "masaa al-khair", meaning: "good evening" },
  { word: "ahlan", meaning: "hello" },
  { word: "ahlan wa sahlan", meaning: "welcome" },
  { word: "kayfa haaluk", meaning: "how are you" },
  { word: "bikhair", meaning: "I am fine" },
  { word: "ismi...", meaning: "my name is..." },
  { word: "shukran", meaning: "thank you" },
  { word: "min fadlik", meaning: "please" },
  { word: "maa as-salama", meaning: "goodbye" },
  { word: "tasharrafna", meaning: "nice to meet you" },
  { word: "afwan", meaning: "you're welcome" },
];

// ---- Theme 2: Family (nuclear family) ---------------------------------------------------------------

export const FAMILY_VOCAB: { word: string; meaning: string }[] = [
  { word: "ab", meaning: "father" },
  { word: "umm", meaning: "mother" },
  { word: "akh", meaning: "brother" },
  { word: "ukht", meaning: "sister" },
  { word: "ibn", meaning: "son" },
  { word: "bint", meaning: "daughter" },
  { word: "jadd", meaning: "grandfather" },
  { word: "jadda", meaning: "grandmother" },
  { word: "amm", meaning: "paternal uncle" },
  { word: "amma", meaning: "paternal aunt" },
  { word: "khaal", meaning: "maternal uncle" },
  { word: "khaala", meaning: "maternal aunt" },
];

// ---- Theme 3: My Surrounding (school facilities) ------------------------------------------------------

export const SCHOOL_VOCAB: { word: string; meaning: string }[] = [
  { word: "madrasa", meaning: "school" },
  { word: "maktaba", meaning: "library" },
  { word: "fasl", meaning: "classroom" },
  { word: "maktab", meaning: "office" },
  { word: "mal'ab", meaning: "playground" },
  { word: "hadiqa", meaning: "garden" },
  { word: "mat'am", meaning: "dining hall" },
  { word: "mamarr", meaning: "corridor" },
  { word: "bawwaba", meaning: "gate" },
  { word: "hammam", meaning: "washroom" },
  { word: "sabbura", meaning: "blackboard" },
  { word: "ghurfat al-mu'allimeen", meaning: "staffroom" },
];

// ---- Theme 4: Time (months of the year, Arabic transliteration of the Gregorian calendar) -------------

export const MONTHS: { word: string; meaning: string; order: number }[] = [
  { word: "Yanayir", meaning: "January", order: 1 },
  { word: "Febrayir", meaning: "February", order: 2 },
  { word: "Maris", meaning: "March", order: 3 },
  { word: "Abril", meaning: "April", order: 4 },
  { word: "Mayu", meaning: "May", order: 5 },
  { word: "Yunyu", meaning: "June", order: 6 },
  { word: "Yulyu", meaning: "July", order: 7 },
  { word: "Aghustus", meaning: "August", order: 8 },
  { word: "Sibtambir", meaning: "September", order: 9 },
  { word: "Uktoubar", meaning: "October", order: 10 },
  { word: "Nufambir", meaning: "November", order: 11 },
  { word: "Disambir", meaning: "December", order: 12 },
];

// ---- Theme 5: Fun and Enjoyment (games and sports) -----------------------------------------------------

export const SPORT_VOCAB: { word: string; meaning: string }[] = [
  { word: "kurat al-qadam", meaning: "football" },
  { word: "kurat al-salla", meaning: "basketball" },
  { word: "kurat al-tawira", meaning: "volleyball" },
  { word: "sibaha", meaning: "swimming" },
  { word: "jary", meaning: "running" },
  { word: "qafz", meaning: "jumping" },
  { word: "darraja", meaning: "cycling" },
  { word: "shatranj", meaning: "chess" },
  { word: "habl al-qafz", meaning: "skipping rope" },
  { word: "sibaq", meaning: "racing" },
  { word: "lu'ba", meaning: "game" },
  { word: "riyada", meaning: "sport / exercise" },
];

// ---- Theme 6: Food and Drinks (food preferences) --------------------------------------------------------

export const FOOD_VOCAB: { word: string; meaning: string }[] = [
  { word: "ruzz", meaning: "rice" },
  { word: "khubz", meaning: "bread" },
  { word: "laban", meaning: "milk" },
  { word: "maa", meaning: "water" },
  { word: "shay", meaning: "tea" },
  { word: "qahwa", meaning: "coffee" },
  { word: "lahm", meaning: "meat" },
  { word: "samak", meaning: "fish" },
  { word: "khudra", meaning: "vegetables" },
  { word: "fawakih", meaning: "fruits" },
  { word: "bayd", meaning: "eggs" },
  { word: "asal", meaning: "honey" },
];

// ---- Theme 7: Body Parts (+ polite/etiquette words for conversational skills) --------------------------

export const BODY_VOCAB: { word: string; meaning: string }[] = [
  { word: "ras", meaning: "head" },
  { word: "yad", meaning: "hand" },
  { word: "rijl", meaning: "leg" },
  { word: "ayn", meaning: "eye" },
  { word: "anf", meaning: "nose" },
  { word: "fam", meaning: "mouth" },
  { word: "udhun", meaning: "ear" },
  { word: "sha'r", meaning: "hair" },
  { word: "asnaan", meaning: "teeth" },
  { word: "wajh", meaning: "face" },
  { word: "dhira'", meaning: "arm" },
  { word: "batn", meaning: "stomach" },
];

export const POLITE_VOCAB: { word: string; meaning: string }[] = [
  { word: "min fadlik", meaning: "please" },
  { word: "afwan", meaning: "excuse me / pardon" },
  { word: "law samaht", meaning: "excuse me (formal)" },
  { word: "asif", meaning: "sorry" },
  { word: "shukran", meaning: "thank you" },
  { word: "mumkin atadakhal", meaning: "may I interrupt" },
];

// ---- Theme 8: Weather and Environment (weather conditions) -----------------------------------------------

export const WEATHER_VOCAB: { word: string; meaning: string }[] = [
  { word: "shams", meaning: "sunny" },
  { word: "matar", meaning: "rainy" },
  { word: "rih", meaning: "windy" },
  { word: "ghuyum", meaning: "cloudy" },
  { word: "harr", meaning: "hot" },
  { word: "barid", meaning: "cold" },
  { word: "ratb", meaning: "humid" },
  { word: "jaaf", meaning: "dry" },
  { word: "thalj", meaning: "snowy" },
  { word: "asifa", meaning: "stormy" },
];

// ---- Theme 9: Getting Around (position/location vocabulary — 1.9's explicit content list) ----------------

export const POSITION_VOCAB: { word: string; meaning: string }[] = [
  { word: "bijaanib", meaning: "next to" },
  { word: "muqabil", meaning: "opposite" },
  { word: "amaam", meaning: "in front of" },
  { word: "khalf", meaning: "behind" },
  { word: "qareeb min", meaning: "near" },
  { word: "'abra", meaning: "across" },
  { word: "fawq", meaning: "above" },
  { word: "taht", meaning: "under" },
  { word: "baeed 'an", meaning: "far from" },
  { word: "fi wasat", meaning: "in the middle of" },
];

// ---- Arabic phonetic-sign concepts (harakat/tanween/shaddah/madda/makharij) -------------------------------
// Explicitly named in the source PDF at 1.1/2.1/3.1/3.2 (harakat), 1.3/2.3 (tanween), 1.4 (shaddah,
// with example words "sabburah, Allah, baddah"), 1.5/2.5 (madda), 1.7 (makhariju huruf).

export const HARAKAT: { sign: string; sound: string; description: string }[] = [
  { sign: "fatha", sound: "short a", description: "a small diagonal stroke above a letter, giving a short 'a' sound" },
  { sign: "kasra", sound: "short i", description: "a small diagonal stroke below a letter, giving a short 'i' sound" },
  { sign: "damma", sound: "short u", description: "a small curl above a letter, giving a short 'u' sound" },
  { sign: "sukun", sound: "no vowel", description: "a small circle above a letter, showing it has no vowel sound at all" },
];

export const TANWEEN: { sign: string; sound: string; description: string }[] = [
  { sign: "fathatan", sound: "-an", description: "a doubled fatha at the end of a word, adding an '-an' sound" },
  { sign: "kasratan", sound: "-in", description: "a doubled kasra at the end of a word, adding an '-in' sound" },
  { sign: "dammatan", sound: "-un", description: "a doubled damma at the end of a word, adding an '-un' sound" },
];

export const SHADDAH_WORDS = ["sabburah", "Allah", "baddah"] as const;

export const MADDA_WORDS = ["baab", "kitaab", "salaam", "Qur'aan"] as const;
