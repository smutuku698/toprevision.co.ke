import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared helpers for KICD Grade 5 Islamic Religious Education skills — Muslim-Kenyan name/place pools
// plus reusable prompt-frame-pool composer functions, same pattern as web/src/skills/socialStudiesG5/
// g5SsShared.ts and the other Grade 5 subject shared-helper files, so every branch clears the project's
// 20+/10-floor distinct-phrasing standard (root CLAUDE.md) without hand-authoring a fully bespoke pool
// per branch. Name/place pool follows the precedent already set in web/src/skills/ireG6/zakat.ts.

export const KENYAN_NAMES = [
  "Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar",
  "Khadija", "Ridhwan", "Mariam", "Suleiman", "Saida", "Abdalla", "Nasra", "Juma",
] as const;

export const KENYAN_PLACES = [
  "Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale",
  "Eastleigh", "Marsabit", "Mandera", "Kisumu", "Kilifi", "Tana River", "Moyale", "Voi",
] as const;

export function name(rng: RNG): string { return randChoice(rng, KENYAN_NAMES); }
export function place(rng: RNG): string { return randChoice(rng, KENYAN_PLACES); }

const SORT_FRAMES: ((what: string) => string)[] = [
  (w) => `Sort each statement by ${w}.`,
  (w) => `Decide ${w} for each statement below, then sort it into the correct group.`,
  (w) => `Group these statements by ${w}.`,
  (w) => `For each statement, work out ${w}.`,
  (w) => `Read each statement and sort it by ${w}.`,
  (w) => `Organise these statements according to ${w}.`,
  (w) => `Classify each statement by ${w}.`,
  (w) => `Which group does each statement belong to? Sort by ${w}.`,
  (w) => `Place each statement into the correct group, based on ${w}.`,
  (w) => `Sort the statements below by ${w}.`,
  (w) => `Work through each statement and sort it by ${w}.`,
  (w) => `Look at each statement and decide ${w}, then sort it.`,
];
export function sortPrompt(rng: RNG, what: string): string { return randChoice(rng, SORT_FRAMES)(what); }

const MATCH_FRAMES: ((what: string) => string)[] = [
  (w) => `Match each ${w}.`,
  (w) => `Pair each ${w}.`,
  (w) => `Connect each ${w}.`,
  (w) => `Which one fits each ${w}? Match them up.`,
  (w) => `Work out and match each ${w}.`,
  (w) => `Link each ${w}.`,
  (w) => `Find the correct match for each ${w}.`,
  (w) => `Match the pairs: ${w}.`,
  (w) => `Correctly pair up each ${w}.`,
  (w) => `Match these up: ${w}.`,
  (w) => `Choose the right match for each ${w}.`,
  (w) => `Draw the connection between each ${w}.`,
];
export function matchPrompt(rng: RNG, what: string): string { return randChoice(rng, MATCH_FRAMES)(what); }

const ORDER_FRAMES: ((what: string) => string)[] = [
  (w) => `Put ${w} in the correct order.`,
  (w) => `Arrange ${w} in the right order.`,
  (w) => `Place ${w} in the order they would actually happen.`,
  (w) => `Order ${w}, from first to last.`,
  (w) => `Sort ${w} into the correct sequence.`,
  (w) => `Rearrange ${w} into the proper order.`,
  (w) => `Drag ${w} into the correct sequence.`,
  (w) => `Work out the correct order for ${w}.`,
  (w) => `Put ${w} back into the right sequence.`,
  (w) => `Sequence ${w} correctly, from first to last.`,
  (w) => `Get ${w} into the correct order.`,
  (w) => `Fix the order of ${w}.`,
];
export function orderPrompt(rng: RNG, what: string): string { return randChoice(rng, ORDER_FRAMES)(what); }

const IDENTIFY_FRAMES: ((what: string) => string)[] = [
  (w) => `Identify ${w}.`,
  (w) => `Which ${w} is this?`,
  (w) => `What is ${w}?`,
  (w) => `Work out ${w}.`,
  (w) => `Name ${w}.`,
  (w) => `Which one describes ${w}?`,
  (w) => `Can you identify ${w}?`,
  (w) => `Recognise ${w}.`,
  (w) => `What is the correct answer for ${w}?`,
  (w) => `Look closely and work out ${w}.`,
  (w) => `Say what ${w} is.`,
  (w) => `Choose the correct answer for ${w}.`,
];
export function identifyPrompt(rng: RNG, what: string): string { return randChoice(rng, IDENTIFY_FRAMES)(what); }

export const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Finish the sentence correctly.",
  "What word is missing here?",
  "Complete this fact.",
  "Fill in the blank.",
  "Which word fits in the blank?",
  "Complete this statement.",
  "What's the missing word?",
  "Fill in the gap.",
  "Finish this fact with the correct word.",
  "Supply the missing word.",
  "Which word makes this sentence correct?",
] as const;
export function fillBlankPrompt(rng: RNG): string { return randChoice(rng, FILL_BLANK_PROMPTS); }

export const EVALUATE_CLOSERS = [
  "Is this the right way to think about it?",
  "Evaluate this claim.",
  "Is this correct, according to Islamic teaching?",
  "Would you agree with this statement?",
  "Is this sound reasoning?",
  "Is this claim accurate?",
  "Does this reflect correct Islamic teaching?",
  "Is this the correct understanding?",
  "Would this be considered correct, or a mistake?",
  "Is this a fair conclusion?",
  "Should this statement be accepted as correct?",
  "Is this claim well-founded?",
] as const;
export function evaluateCloser(rng: RNG): string { return randChoice(rng, EVALUATE_CLOSERS); }
