import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared helpers for KICD Grade 5 Agriculture skills — Kenyan name/place pools plus reusable
// prompt-frame-pool composer functions, same pattern as web/src/skills/scienceG5/g5SciShared.ts,
// so every branch clears the project's 20+/10-floor distinct-phrasing standard (root CLAUDE.md)
// without hand-authoring a fully bespoke pool per branch.

export const KENYAN_PLACES = [
  "Nyeri", "Nakuru", "Kisumu", "Eldoret", "Machakos", "Kitale", "Kericho", "Kakamega",
  "Bungoma", "Meru", "Embu", "Kitui", "Narok", "Kajiado", "Homa Bay", "Kilifi",
] as const;

export const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian",
  "Mwangi", "Naliaka", "Otieno", "Wanjiru", "Achieng", "Kamau", "Njeri", "Wafula",
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
export function orderPrompt(rng: RNG, what: string): string { return randChoice(rng, ORDER_FRAMES)(what); }

const IDENTIFY_FRAMES: ((what: string) => string)[] = [
  (w) => `Identify this ${w}.`,
  (w) => `Which ${w} is shown here?`,
  (w) => `What is the name of this ${w}?`,
  (w) => `Look at this ${w}. What is it?`,
  (w) => `Name this ${w}.`,
  (w) => `What ${w} is pictured here?`,
  (w) => `Which ${w} does this show?`,
  (w) => `Can you name this ${w}?`,
  (w) => `Recognise this ${w} — what is it?`,
  (w) => `What is this ${w} called?`,
  (w) => `Look closely — which ${w} is this?`,
  (w) => `Say what ${w} this is.`,
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
  "Is this good practice?",
  "Is this the right way to do it?",
  "Would you say this is done correctly?",
  "Is this a wise way to handle it?",
  "Does this show good practice, or not?",
  "Is this a sensible approach?",
  "Should this be considered correct practice?",
  "Is this how it should be done?",
  "Does this reflect good practice?",
  "Would this be considered correct, or a mistake?",
  "Is this the correct approach?",
  "Is this a good habit to follow?",
] as const;
export function evaluateCloser(rng: RNG): string { return randChoice(rng, EVALUATE_CLOSERS); }
