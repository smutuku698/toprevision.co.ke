import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared helpers for KICD Grade 5 Science & Technology skills — Kenyan-context name/place pools plus
// reusable prompt-frame pools so every branch clears the project's 20+/10-floor distinct-phrasing standard
// (see root CLAUDE.md) without hand-authoring a fully bespoke pool per branch. Each frame pool below has
// 10-12 entries; composed with a per-branch topic fragment or item pool, the effective variety a learner
// sees stays well above the 10-floor while keeping each skill file's own code lean.

export const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Nyeri", "Kitale", "Machakos", "Kericho", "Eldoret", "Mombasa",
  "Nairobi", "Nanyuki", "Bungoma", "Meru", "Kakamega", "Naivasha", "Kiambu", "Kajiado",
] as const;

export const KENYAN_NAMES = [
  "Achieng", "Brian", "Cherono", "Diana", "Erick", "Fauzia", "Gideon", "Halima",
  "Ian", "Joyce", "Kiptoo", "Lucy", "Mutinda", "Naserian", "Otieno", "Wanjiru",
] as const;

export function place(rng: RNG): string { return randChoice(rng, KENYAN_PLACES); }
export function name(rng: RNG): string { return randChoice(rng, KENYAN_NAMES); }

const SORT_FRAMES: ((what: string) => string)[] = [
  (w) => `Sort each item by ${w}.`,
  (w) => `Decide ${w} for each item below, then sort it into the correct group.`,
  (w) => `Group these items by ${w}.`,
  (w) => `For each item, work out ${w}.`,
  (w) => `Read each item and sort it by ${w}.`,
  (w) => `Organise these items according to ${w}.`,
  (w) => `Classify each item by ${w}.`,
  (w) => `Which group does each item belong to? Sort by ${w}.`,
  (w) => `Place each item into the correct group, based on ${w}.`,
  (w) => `Sort the items below by ${w}.`,
  (w) => `Work through each item and sort it by ${w}.`,
  (w) => `Look at each item and decide ${w}, then sort it.`,
];
/** Compose a categorize/sort-branch prompt from a shared frame pool + a per-branch topic fragment. */
export function sortPrompt(rng: RNG, what: string): string { return randChoice(rng, SORT_FRAMES)(what); }

const MATCH_FRAMES: ((what: string) => string)[] = [
  (w) => `Match each ${w}.`,
  (w) => `Pair each ${w}.`,
  (w) => `Connect each ${w}.`,
  (w) => `Which one fits each ${w}? Match them up.`,
  (w) => `Draw a line in your mind, then match each ${w}.`,
  (w) => `Link each ${w}.`,
  (w) => `Find the correct match for each ${w}.`,
  (w) => `Match the pairs: ${w}.`,
  (w) => `Work out and match each ${w}.`,
  (w) => `Correctly pair up each ${w}.`,
  (w) => `Match these up: ${w}.`,
  (w) => `Choose the right match for each ${w}.`,
];
/** Compose a click-match prompt from a shared frame pool + a per-branch "X to its Y" fragment. */
export function matchPrompt(rng: RNG, what: string): string { return randChoice(rng, MATCH_FRAMES)(what); }

const ORDER_FRAMES: ((what: string) => string)[] = [
  (w) => `Put ${w} in the correct order.`,
  (w) => `Arrange ${w} in the right order.`,
  (w) => `Place ${w} in the order you would actually carry them out.`,
  (w) => `Order ${w}, from first to last.`,
  (w) => `Sort ${w} into the correct sequence.`,
  (w) => `Rearrange ${w} into the proper order.`,
  (w) => `Drag ${w} into the correct sequence.`,
  (w) => `Work out the correct order for ${w}.`,
  (w) => `Put ${w} back into the right sequence.`,
  (w) => `Sequence ${w} correctly, from first to last.`,
  (w) => `Get ${w} into the correct running order.`,
  (w) => `Fix the order of ${w}.`,
];
/** Compose an ordering-branch prompt from a shared frame pool + a per-branch "the steps of X" fragment. */
export function orderPrompt(rng: RNG, what: string): string { return randChoice(rng, ORDER_FRAMES)(what); }

const IDENTIFY_FRAMES: ((what: string) => string)[] = [
  (w) => `Identify this ${w}.`,
  (w) => `Which ${w} is shown here?`,
  (w) => `What is the name of this ${w}?`,
  (w) => `Look at this ${w}. What is it called?`,
  (w) => `Name this ${w}.`,
  (w) => `What ${w} is pictured here?`,
  (w) => `Which ${w} does this show?`,
  (w) => `Can you name this ${w}?`,
  (w) => `Recognise this ${w} — what is it?`,
  (w) => `What is this ${w} called?`,
  (w) => `Look closely — which ${w} is this?`,
  (w) => `Say what ${w} this is.`,
];
/** Compose a multiple-choice identify-from-visual prompt from a shared frame pool + a per-branch noun phrase. */
export function identifyPrompt(rng: RNG, what: string): string { return randChoice(rng, IDENTIFY_FRAMES)(what); }

const HOTSPOT_FRAMES: ((what: string) => string)[] = [
  (w) => `What is the labelled part of ${w}?`,
  (w) => `Which part of ${w} is marked?`,
  (w) => `Name the marked part of ${w}.`,
  (w) => `Look at the marked spot on ${w}. What is it called?`,
  (w) => `What is this labelled part of ${w} called?`,
  (w) => `Identify the marked part of ${w}.`,
  (w) => `Which part of ${w} is pointed out here?`,
  (w) => `What do we call the marked part of ${w}?`,
  (w) => `Point out what the marked part of ${w} is.`,
  (w) => `Which labelled part is this, on ${w}?`,
  (w) => `Say what the marked part of ${w} is called.`,
  (w) => `What part of ${w} is highlighted?`,
];
/** Compose a hotspot prompt from a shared frame pool + a per-branch diagram-name fragment. */
export function hotspotPrompt(rng: RNG, what: string): string { return randChoice(rng, HOTSPOT_FRAMES)(what); }

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
/** Topic-agnostic prompt pool for fill-blank branches (12+ entries — clears the 10-floor with no topic slot needed). */
export function fillBlankPrompt(rng: RNG): string { return randChoice(rng, FILL_BLANK_PROMPTS); }
