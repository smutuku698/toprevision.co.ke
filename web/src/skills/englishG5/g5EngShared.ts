// Shared helpers for KICD Grade 5 English skills (all four strands: Listening and Speaking, Reading,
// Language Use / Grammar in Use, Writing). Kenyan-context name/place pools plus small composed prompt-pool
// helpers so every branch clears the root CLAUDE.md standard of 20+ distinct prompt phrasings (10 hard
// floor) without hand-authoring 20 full sentences per branch — each helper crosses a 6-entry "opener" pool
// with a 4-entry "closer" pool for 24 combinations. See curriculum-reference/grade-5/english.json.

import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

export const KENYAN_NAMES = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
  "Simiyu", "Wekesa", "Chepkoech", "Onyango", "Wairimu", "Korir", "Mueni", "Halima",
  "Baraka", "Jelimo", "Gideon", "Fatuma",
] as const;

export const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Eldoret", "Machakos", "Kitale", "Meru", "Nyeri", "Garissa",
  "Kericho", "Kakamega", "Bungoma", "Malindi", "Voi", "Isiolo", "Naivasha", "Thika",
  "Kitui", "Embu", "Homa Bay", "Kilifi", "Narok", "Kajiado", "Migori", "Busia",
  "Marsabit", "Wajir", "Lamu", "Nyahururu", "Nanyuki", "Mombasa", "Kapsabet", "Webuye",
] as const;

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export function name(rng: RNG): string { return randChoice(rng, KENYAN_NAMES); }
export function place(rng: RNG): string { return randChoice(rng, KENYAN_PLACES); }
export function pickNames(rng: RNG, count: number): string[] { return shuffle(rng, [...KENYAN_NAMES]).slice(0, count); }
export function pickPlaces(rng: RNG, count: number): string[] { return shuffle(rng, [...KENYAN_PLACES]).slice(0, count); }

// ---- Composed prompt pools -------------------------------------------------
// Each pool: 6 openers x 4 closers = 24 phrasings. `nc` = a noun phrase for what is being worked with,
// e.g. "the correct demonstrative determiner", "the missing preposition".

const CHOOSE_OPENERS: ((nc: string) => string)[] = [
  (n) => `Choose ${n}.`,
  (n) => `Pick ${n}.`,
  (n) => `Select ${n}.`,
  (n) => `Which is ${n}?`,
  (n) => `Identify ${n}.`,
  (n) => `Decide on ${n}.`,
];
const CHOOSE_CLOSERS = [
  "",
  " Read the whole sentence first.",
  " Only one option fits.",
  " Look carefully at the other words in the sentence.",
];
export function choosePrompt(rng: RNG, nc: string): string {
  return (randChoice(rng, CHOOSE_OPENERS)(nc) + randChoice(rng, CHOOSE_CLOSERS)).trim();
}

const FILL_OPENERS: ((nc: string) => string)[] = [
  (n) => `Fill in the blank with ${n}.`,
  (n) => `Complete the sentence with ${n}.`,
  (n) => `Supply ${n} for the gap.`,
  (n) => `Write ${n} that best fits the blank.`,
  (n) => `The blank needs ${n}. Type it in.`,
  (n) => `Which word — ${n} — completes this sentence?`,
];
const FILL_CLOSERS = [
  "",
  " Spell it correctly.",
  " One word only.",
  " Use the clue words around the gap.",
];
export function fillPrompt(rng: RNG, nc: string): string {
  return (randChoice(rng, FILL_OPENERS)(nc) + randChoice(rng, FILL_CLOSERS)).trim();
}

const SORT_OPENERS: ((nc: string) => string)[] = [
  (n) => `Sort each item by ${n}.`,
  (n) => `Put each item in the group that matches ${n}.`,
  (n) => `Group these items according to ${n}.`,
  (n) => `Decide ${n} for each item, then place it.`,
  (n) => `Drag each item to the box that shows ${n}.`,
  (n) => `Which group does each item belong to? Sort by ${n}.`,
];
const SORT_CLOSERS = [
  "",
  " Check every item before you finish.",
  " Two boxes, so read closely.",
  " The words in each item are your clue.",
];
export function sortPrompt(rng: RNG, nc: string): string {
  return (randChoice(rng, SORT_OPENERS)(nc) + randChoice(rng, SORT_CLOSERS)).trim();
}

const MATCH_OPENERS: ((nc: string) => string)[] = [
  (n) => `Match each ${n}.`,
  (n) => `Join each ${n} to its partner.`,
  (n) => `Link every ${n} correctly.`,
  (n) => `Pair up each ${n}.`,
  (n) => `Find the right partner for each ${n}.`,
  (n) => `Connect each ${n} to what it goes with.`,
];
const MATCH_CLOSERS = [
  "",
  " There is exactly one correct partner for each.",
  " Work through them one at a time.",
  " Say each pair aloud to check it.",
];
export function matchPrompt(rng: RNG, nc: string): string {
  return (randChoice(rng, MATCH_OPENERS)(nc) + randChoice(rng, MATCH_CLOSERS)).trim();
}

const ORDER_OPENERS: ((nc: string) => string)[] = [
  (n) => `Arrange ${n} in the correct order.`,
  (n) => `Put ${n} in order.`,
  (n) => `Rearrange ${n} so it is correct.`,
  (n) => `Order ${n} from first to last.`,
  (n) => `Fix the order of ${n}.`,
  (n) => `Which order is right for ${n}?`,
];
const ORDER_CLOSERS = [
  "",
  " Read your answer back to check it makes sense.",
  " Click the items one by one.",
  " There is only one correct order.",
];
export function orderPrompt(rng: RNG, nc: string): string {
  return (randChoice(rng, ORDER_OPENERS)(nc) + randChoice(rng, ORDER_CLOSERS)).trim();
}

// ---- Scenario frame composer (Apply / Analyze / Evaluate branches) --------
// 6 narrative openers x 4 closing-question phrasings = 24 frame skeletons. `s` = the situation clause,
// `q` = the question clause. Kenyan place/name variation is layered by the caller on top.

const SCENARIO_OPENERS: ((s: string) => string)[] = [
  (s) => `${s}`,
  (s) => `During an English lesson, ${lc(s)}`,
  (s) => `While working with a group, ${lc(s)}`,
  (s) => `In a story the class is reading, ${lc(s)}`,
  (s) => `At home that evening, ${lc(s)}`,
  (s) => `On the way to school, ${lc(s)}`,
];
const SCENARIO_CLOSERS: ((q: string) => string)[] = [
  (q) => `${q}`,
  (q) => `Think it through: ${lc(q)}`,
  (q) => `Which answer is correct — ${lc(q)}`,
  (q) => `Decide carefully. ${q}`,
];
function lc(s: string): string { return s.charAt(0).toLowerCase() + s.slice(1); }
export function scenarioPrompt(rng: RNG, situation: string, question: string): string {
  return `${randChoice(rng, SCENARIO_OPENERS)(situation)} ${randChoice(rng, SCENARIO_CLOSERS)(question)}`.trim();
}

/** Build a 3- or 4-option multiple-choice payload from a correct answer + a curated confusable-distractor
 * list (each distractor should encode a real, nameable misconception — never a random unrelated draw). */
export function mcFromCluster(
  rng: RNG,
  correct: string,
  confusableDistractors: string[],
  count = 3,
): { choices: string[]; correctIndex: number } {
  const wrong = shuffle(rng, Array.from(new Set(confusableDistractors.filter((d) => d !== correct)))).slice(0, count);
  const choices = shuffle(rng, [correct, ...wrong]);
  return { choices, correctIndex: choices.indexOf(correct) };
}
