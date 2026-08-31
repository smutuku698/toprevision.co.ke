import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared Kenyan localization pools + small helpers reused across every Grade 5 Creative Arts
// skill file (Strand 1.0 Creating and Executing / 2.0 Performing and Displaying / 3.0
// Appreciation in Creative Arts). Kept here instead of duplicated per file, matching the
// established convention in creativeArtsG6/g6CasShared.ts and agricultureG6/g6AgShared.ts.
//
// The Grade 5 design (KICD Primary School Curriculum Design — Creative Arts, Grade 5, First
// published 2017, Revised 2024) integrates Art and Craft, Music, and Physical Health Education
// as one learning area.

export const KENYAN_PLACES = [
  "Nyeri",
  "Nakuru",
  "Kisumu",
  "Eldoret",
  "Machakos",
  "Kitale",
  "Kericho",
  "Kakamega",
  "Bungoma",
  "Meru",
  "Embu",
  "Kitui",
  "Narok",
  "Kajiado",
  "Homa Bay",
  "Kilifi",
  "Kwale",
  "Garissa",
  "Isiolo",
  "Baringo",
  "Laikipia",
  "Murang'a",
  "Kiambu",
  "Nyandarua",
  "Tharaka Nithi",
  "Vihiga",
  "Siaya",
  "Busia",
  "Marsabit",
  "Turkana",
] as const;

export const KENYAN_NAMES = [
  "Amina",
  "Baraka",
  "Chebet",
  "Denis",
  "Fatuma",
  "Juma",
  "Kevin",
  "Lilian",
  "Mwangi",
  "Naliaka",
  "Otieno",
  "Wanjiru",
  "Achieng",
  "Kamau",
  "Njeri",
  "Wafula",
  "Cherono",
  "Musyoka",
  "Akinyi",
  "Kiptoo",
  "Wambui",
  "Salim",
  "Nyambura",
  "Odhiambo",
  "Rono",
  "Atieno",
  "Mumbi",
  "Hassan",
  "Zawadi",
  "Gitonga",
] as const;

export function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}

export function name(rng: RNG): string {
  return randChoice(rng, KENYAN_NAMES);
}

export interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

/** Turn a curated ScenarioMC (wrong answers already hand-picked as plausible misconceptions,
 * never a random draw from an unrelated pool) into shuffled multiple-choice fields. */
export function buildScenarioChoices(rng: RNG, q: ScenarioMC): { choices: string[]; correctIndex: number } {
  const choices = shuffle(rng, [q.correct, ...q.wrong]);
  return { choices, correctIndex: choices.indexOf(q.correct) };
}

/**
 * Combine a small authored fact pool with a small set of narrative "frames" to mechanically
 * reach the pool-size floor without re-authoring near-duplicate scenarios by hand. Each fact
 * carries its own curated correct answer / plausible-misconception distractors / explanation
 * (authored once); each frame only varies the surrounding scenario narration (actor, place,
 * situational detail) around that fixed fact. F facts x N frames = F*N genuinely different
 * prompts (different content AND different wording).
 */
export function expandScenarios<F>(
  facts: readonly F[],
  frames: readonly ((rng: RNG, fact: F) => ScenarioMC)[]
): ((rng: RNG) => ScenarioMC)[] {
  const out: ((rng: RNG) => ScenarioMC)[] = [];
  for (const fact of facts) {
    for (const frame of frames) {
      out.push((rng: RNG) => frame(rng, fact));
    }
  }
  return out;
}

/**
 * Compose a small "opener" pool (functions building the setup/situation clause, no trailing
 * punctuation, may embed their own random name/place) with a small "closer" pool (plain closing
 * question strings) into a frame array for `expandScenarios`. O openers x C closers yields O*C
 * distinct prompt skeletons from authoring only O+C pieces — the affordable way to clear the
 * 20+-phrasing pool-size floor for scenario/frame branches without hand-writing 20 full frames.
 * See root CLAUDE.md's repetition-defense rules for why 20+ is the target / 10 the hard floor.
 */
export function combineFrames<F extends { correct: string; wrong: string[]; explanation: string }>(
  openers: readonly ((rng: RNG, fact: F) => string)[],
  closers: readonly string[]
): ((rng: RNG, fact: F) => ScenarioMC)[] {
  const frames: ((rng: RNG, fact: F) => ScenarioMC)[] = [];
  for (const opener of openers) {
    for (const closer of closers) {
      frames.push((rng, fact) => ({
        prompt: `${opener(rng, fact)}. ${closer}`,
        correct: fact.correct,
        wrong: fact.wrong,
        explanation: fact.explanation,
      }));
    }
  }
  return frames;
}

/** Capitalize the first letter — used when a lowercase `situation` clause opens a sentence. */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface FillBlankTemplate {
  before: string;
  after: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint?: string;
  explanation: string;
}

/** Pick one phrasing from a prompt pool. Thin wrapper for readability at call sites. */
export function pickPrompt(rng: RNG, pool: readonly string[]): string {
  return randChoice(rng, pool);
}

// ---- Reusable generic prompt-phrasing pools (>= 20 each) --------------------
// Every branch's visible instruction line must be drawn from a pool of 20+ phrasings
// (10 hard floor). These generic pools cover the interaction shapes shared across the
// whole subject; skills add their own topic-specific pools where the wording needs to
// name the sub-strand's content.

export const SORT_PROMPTS = [
  "Sort each item into the correct group.",
  "Place each item under the heading it belongs to.",
  "Which group does each item belong to? Sort them.",
  "Drag each item into its matching category.",
  "Group these items correctly.",
  "Read each item and sort it under the right heading.",
  "Decide which category each item fits, then sort.",
  "Organise these items into their correct groups.",
  "Match each item to its group by sorting.",
  "Work out which heading each item goes under.",
  "Put each item where it belongs.",
  "Sort the items below into the correct categories.",
  "Classify each item by placing it in the right group.",
  "For each item, choose the group it fits best.",
  "Separate these items into their correct groups.",
  "Arrange each item under the heading that matches it.",
  "Look at each item and drop it into the right category.",
  "Sort every item into one of the groups shown.",
  "Assign each item to its correct heading.",
  "Categorise the items below.",
] as const;

export const TRUE_FALSE_PROMPTS = [
  "Sort each statement as true or false.",
  "Decide whether each statement below is true or false.",
  "Which of these statements are true? Sort each one.",
  "Read each statement and sort it as true or false.",
  "Some of these statements are correct and some are not — sort each one.",
  "Mark each statement true or false by sorting it.",
  "Work out which statements are true and which are false.",
  "Sort the statements below into true and false.",
  "Judge each statement: true or false?",
  "Place each statement under 'True' or 'False'.",
  "Check each statement and sort it as true or false.",
  "Are these statements true or false? Sort them.",
  "Sort each claim below as true or as false.",
  "Decide the truth of each statement, then sort.",
  "For each statement, choose true or false.",
  "Separate the true statements from the false ones.",
  "Sort these into statements that are correct and statements that are wrong.",
  "Read carefully and sort each statement true or false.",
  "Group each statement as either true or false.",
  "Sort every statement below by whether it is true.",
] as const;

export const MATCH_PROMPTS = [
  "Match each item to its correct pair.",
  "Pair each item with the one that goes with it.",
  "Connect each item to its match.",
  "Link each item on the left to the right one.",
  "For each item, choose its matching partner.",
  "Match each term to what it means.",
  "Draw a line from each item to its match.",
  "Pair up each item correctly.",
  "Match each item with its description.",
  "Join each item to the option that fits it.",
  "Work out which pairs go together, then match them.",
  "Connect each item to its correct meaning.",
  "Match each one to its partner.",
  "Find the correct pair for each item.",
  "Pair each item with its function.",
  "Match every item to the right option.",
  "Sort out which items belong together, then pair them.",
  "For each item on the left, pick its match on the right.",
  "Match each item below to its pair.",
  "Connect the matching items.",
] as const;

export const ORDER_PROMPTS = [
  "Put these steps in the correct order.",
  "Arrange these steps from first to last.",
  "Order these steps correctly.",
  "Sort these steps into the right sequence.",
  "Place these steps in the order they should be done.",
  "Which order do these steps go in? Arrange them.",
  "Drag the steps into the correct order.",
  "Work out the right order for these steps.",
  "Sequence these steps from beginning to end.",
  "Line up these steps in the order you would follow them.",
  "Rearrange these steps so they are in order.",
  "Put the steps below in the sequence they happen.",
  "Order the steps, earliest first.",
  "Sort the steps into the order they are carried out.",
  "Arrange the steps in the order they should happen.",
  "Number these steps in order by arranging them.",
  "Put these in the order they are done.",
  "Set these steps out in the correct sequence.",
  "Order these from the first thing you do to the last.",
  "Arrange the following steps correctly.",
] as const;

export const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Fill in the blank below.",
  "Complete the sentence with the correct word.",
  "Write the word that fills the gap.",
  "Add the missing word to finish the sentence.",
  "Complete this sentence.",
  "Fill in the gap.",
  "What word completes the sentence?",
  "Supply the missing word.",
  "Finish the sentence by filling the blank.",
  "Put the correct word in the blank.",
  "Complete the statement below.",
  "Which word belongs in the blank?",
  "Fill in the word that is missing.",
  "Complete the sentence correctly.",
  "Provide the word that fits the gap.",
  "Fill the blank with the right word.",
  "Read the sentence and fill in the missing word.",
  "Complete the sentence about this topic.",
] as const;

export const IDENTIFY_PROMPTS = [
  "Which one is being described?",
  "Read the description and identify it.",
  "Which of these fits the description?",
  "Name the one described here.",
  "Use the description to choose the correct answer.",
  "Which does this describe?",
  "Identify the correct answer from the description.",
  "Which one matches this description?",
  "Choose the one the description points to.",
  "Which of the options fits what is described?",
  "Work out which one is described below.",
  "Pick the answer that matches the description.",
  "Which is it? Read the clue and decide.",
  "From the description, which one is it?",
  "Select the one being described.",
  "Which of these is described here?",
  "Decide which one the description is about.",
  "Read carefully and identify the right one.",
  "Which answer does the description fit?",
  "Name the one this describes.",
] as const;
