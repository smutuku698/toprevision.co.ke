import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared helpers for KICD Grade 5 French skills — Kenyan name pool plus reusable
// prompt-frame-pool composer functions, same pattern as web/src/skills/agricultureG5/g5AgShared.ts
// and web/src/skills/scienceG5/g5SciShared.ts, so every branch clears the project's 20+/10-floor
// distinct-phrasing standard (root CLAUDE.md) without hand-authoring a fully bespoke pool per branch.
// Note: the frenchG6/frenchG7 reference files predate this standard and use single fixed prompt
// strings per branch — do NOT copy that part of their pattern; every frenchG5 branch must draw its
// prompt from one of these pools (or a skill-local pool built the same way) instead.

export const NAMES = [
  "Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno",
  "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula",
] as const;
export function name(rng: RNG): string { return randChoice(rng, NAMES); }

const MATCH_FRAMES: ((what: string) => string)[] = [
  (w) => `Match each ${w}.`,
  (w) => `Pair each ${w}.`,
  (w) => `Connect each ${w}.`,
  (w) => `Which one fits each ${w}? Match them up.`,
  (w) => `Link each ${w}.`,
  (w) => `Find the correct match for each ${w}.`,
  (w) => `Match the pairs: ${w}.`,
  (w) => `Work out and match each ${w}.`,
  (w) => `Correctly pair up each ${w}.`,
  (w) => `Match these up: ${w}.`,
  (w) => `Choose the right match for each ${w}.`,
  (w) => `Draw a line in your mind, then match each ${w}.`,
];
export function matchPrompt(rng: RNG, what: string): string { return randChoice(rng, MATCH_FRAMES)(what); }

const SORT_FRAMES: ((what: string) => string)[] = [
  (w) => `Sort each ${w}.`,
  (w) => `Group these ${w}.`,
  (w) => `Classify each ${w}.`,
  (w) => `Which group does each one belong to? Sort by ${w}.`,
  (w) => `Place each item into the correct group: ${w}.`,
  (w) => `Organise these into groups: ${w}.`,
  (w) => `Read each item and sort it: ${w}.`,
  (w) => `Work through each item and sort it: ${w}.`,
  (w) => `Decide which group each one belongs to: ${w}.`,
  (w) => `Sort the items below: ${w}.`,
  (w) => `Look at each item and sort it: ${w}.`,
  (w) => `Categorise each item: ${w}.`,
];
export function sortPrompt(rng: RNG, what: string): string { return randChoice(rng, SORT_FRAMES)(what); }

const ORDER_FRAMES: ((what: string) => string)[] = [
  (w) => `Put ${w} in the correct order.`,
  (w) => `Arrange ${w} in the right order.`,
  (w) => `Order ${w}, from first to last.`,
  (w) => `Rearrange ${w} into the correct order.`,
  (w) => `Drag ${w} into the correct order.`,
  (w) => `Work out the correct order for ${w}.`,
  (w) => `Put ${w} back into the right sequence.`,
  (w) => `Sequence ${w} correctly.`,
  (w) => `Get ${w} into the correct order.`,
  (w) => `Fix the order of ${w}.`,
  (w) => `Click ${w} into the correct order.`,
  (w) => `Sort ${w} into the correct sequence.`,
];
export function orderPrompt(rng: RNG, what: string): string { return randChoice(rng, ORDER_FRAMES)(what); }

const FILL_FRAMES = [
  "Fill in the missing word to complete the sentence.",
  "Complete the sentence with the missing word.",
  "Which word completes this sentence correctly?",
  "Finish the sentence with the correct word.",
  "What word is missing from this sentence?",
  "Fill in the blank correctly.",
  "Which word fits in the blank?",
  "Supply the missing word.",
  "Complete this sentence.",
  "What's the missing word here?",
  "Fill in the gap to complete the sentence.",
  "Finish this sentence with the right word.",
] as const;
export function fillPrompt(rng: RNG): string { return randChoice(rng, FILL_FRAMES); }

const SPEAKING_SCENARIO_CLOSERS = [
  "What do you say?",
  "What should you say here?",
  "How do you respond?",
  "What's the right thing to say?",
  "What would you say in French?",
  "Which words fit this moment?",
  "How would you reply?",
  "What do you say out loud?",
  "What's your response?",
  "What should you say next?",
  "How do you answer?",
  "What is the correct thing to say?",
] as const;
export function speakingScenarioCloser(rng: RNG): string { return randChoice(rng, SPEAKING_SCENARIO_CLOSERS); }

const WRITING_SCENARIO_CLOSERS = [
  "Which word or sentence should you write?",
  "What should you write here?",
  "Which French word or sentence fits?",
  "What's the correct thing to write?",
  "Which word should you write down?",
  "What do you write in this case?",
  "Which sentence should you write?",
  "What's the right word to write?",
  "Which word fits what you need to write?",
  "What should you write in French?",
  "Which is the correct word to write down?",
  "What's the correct word or phrase to write?",
] as const;
export function writingScenarioCloser(rng: RNG): string { return randChoice(rng, WRITING_SCENARIO_CLOSERS); }

const READING_TF_FRAMES = [
  "Sort each statement as True or False, based on the passage.",
  "Decide whether each statement is True or False, based on the passage.",
  "Read each statement and mark it True or False.",
  "Based on the passage, sort each statement as True or False.",
  "Check the passage, then sort each statement as True or False.",
  "Which statements are True and which are False, based on the passage?",
  "Sort these statements as True or False using the passage above.",
  "Reread the passage, then sort each statement as True or False.",
  "According to the passage, is each statement True or False?",
  "Match each statement to True or False, based on the passage.",
  "Sort each statement below as True or False.",
  "Check each statement against the passage: True or False?",
] as const;
export function readingTrueFalsePrompt(rng: RNG): string { return randChoice(rng, READING_TF_FRAMES); }
