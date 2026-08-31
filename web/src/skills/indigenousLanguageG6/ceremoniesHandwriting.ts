import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 1 "Ceremonies and Festivals", sub-strand 1.3.1
// "Handwriting" (W.1): features, neatness and legibility, adverbs.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "letter formation", meaning: "shaping each letter correctly and consistently" },
  { concept: "consistent size", meaning: "keeping letters a similar height throughout a piece of writing" },
  { concept: "even spacing", meaning: "leaving equal, appropriate gaps between letters and words" },
  { concept: "straight baseline", meaning: "keeping letters sitting evenly on the writing line" },
  { concept: "legibility", meaning: "how easily writing can be read by someone else" },
  { concept: "neatness", meaning: "writing that is tidy, without smudges or excessive corrections" },
  { concept: "proportion", meaning: "keeping tall and short letters in the correct relative size" },
  { concept: "pressure control", meaning: "applying even pressure with the pen or pencil, avoiding tears or blots" },
  { concept: "joins", meaning: "how letters connect to each other in cursive or joined-up writing" },
  { concept: "slant", meaning: "whether letters lean consistently in one direction or stay upright" },
];

interface HabitEntry { habit: string; type: string }

const HABITS: HabitEntry[] = [
  { habit: "Writing each letter the same size throughout the essay.", type: "Good habit" },
  { habit: "Letting letters drift above and below the line randomly.", type: "Poor habit" },
  { habit: "Leaving even spaces between each word.", type: "Good habit" },
  { habit: "Cramming words together with no space at all.", type: "Poor habit" },
  { habit: "Checking that tall letters are clearly taller than short letters.", type: "Good habit" },
  { habit: "Writing so quickly that letters become unreadable.", type: "Poor habit" },
  { habit: "Keeping a steady, even pressure on the pencil.", type: "Good habit" },
  { habit: "Pressing so hard the pencil tears the page.", type: "Poor habit" },
  { habit: "Rewriting a messy sentence neatly before submitting it.", type: "Good habit" },
  { habit: "Ignoring smudges and crossed-out words in the final copy.", type: "Poor habit" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "She copied the ceremony passage", after: ", keeping every letter neat.", answer: "carefully" },
  { before: "He wrote about the anniversary celebration", after: ", without any rush.", answer: "patiently" },
  { before: "The essay about the parade was written", after: ", with even spacing throughout.", answer: "neatly" },
  { before: "She practised her handwriting", after: ", improving a little each day.", answer: "consistently" },
  { before: "He rewrote the messy paragraph", after: ", making it easy to read.", answer: "legibly" },
  { before: "The elder's speech was copied", after: ", word for word, letter for letter.", answer: "accurately" },
  { before: "She formed each letter", after: ", following the correct shape every time.", answer: "correctly" },
  { before: "He checked his handwriting", after: ", before handing in the essay.", answer: "thoroughly" },
  { before: "The class wrote the festival story", after: ", sitting each letter on the line.", answer: "steadily" },
  { before: "She finished her handwriting practice", after: ", right before the bell rang.", answer: "promptly" },
];

const HANDWRITING_STEPS: { id: string; label: string }[] = [
  { id: "sit", label: "Sit comfortably and hold the pencil correctly" },
  { id: "form", label: "Form each letter with the correct shape" },
  { id: "size", label: "Keep letters a consistent size and sitting on the line" },
  { id: "spacing", label: "Leave even spacing between letters and words" },
  { id: "pressure", label: "Apply steady, even pressure while writing" },
  { id: "check", label: "Check the finished writing for neatness before submitting it" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes an essay about a ceremony but lets letters drift above and below the line randomly. What handwriting feature is ${who} missing?`, correct: "A straight baseline", wrong: ["Even spacing", "Pressure control", "Joins"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "legibility" means. What is the correct meaning?`, correct: "How easily writing can be read by someone else", wrong: ["How fast a person can write", "How many words fit on one page", "How dark the ink or pencil mark is"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} discusses cramming words together with no space at all. What kind of habit is this?`, correct: "Poor habit", wrong: ["Good habit", "Neither type", "Both types equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} presses so hard while writing about a festival that the pencil tears the page. What feature has ${who} failed to control?`, correct: "Pressure control", wrong: ["Letter formation", "Proportion", "Slant"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} rewrites a messy sentence neatly before handing in the essay. What kind of habit is this?`, correct: "Good habit", wrong: ["Poor habit", "Neither type", "Both types equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes tall letters and short letters at the exact same height throughout an essay. What feature is ${who} ignoring?`, correct: "Proportion", wrong: ["Even spacing", "Neatness", "Straight baseline"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked why neatness matters when writing about a ceremony for a class magazine. What is the best reason?`, correct: "Neat writing is easier for other readers to understand", wrong: ["Neatness has no effect on how well a reader understands the text", "Neatness only matters for handwriting competitions", "Messy writing is always faster and therefore better"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes so quickly that several letters in a sentence about the festival become unreadable. What is the main problem?`, correct: "Speed has been prioritised over legibility, making the writing hard to read", wrong: ["There is no problem, since speed is the only thing that matters", "The sentence has too many adverbs", "The paper is the wrong size"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} checks that letters lean consistently in the same direction throughout an essay. What feature is ${who} checking?`, correct: "Slant", wrong: ["Pressure control", "Even spacing", "Proportion"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} never checks their handwriting before submitting an essay about a ceremony. What might ${who} miss?`, correct: "Smudges, uneven letters, or spacing problems that reduce neatness", wrong: ["Nothing — checking handwriting is never useful", "Spelling mistakes only, never handwriting issues", "The topic of the essay itself"] }; },
];

export const ceremoniesHandwriting: Skill = {
  id: "g6-il-w-ceremonies",
  code: "W.1",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Ceremonies and festivals: handwriting",
  description: "Identify features of good handwriting and rewrite ceremony-themed text neatly and legibly, using adverbs correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Good handwriting keeps letters consistent in size and shape, evenly spaced, sitting on the line, and easy for someone else to read.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each handwriting term with its meaning.", "each term below with its correct meaning.", "each handwriting feature with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each habit below by whether it is good or poor for handwriting.", "each habit into the correct handwriting group.", "these habits into their correct groups.", "each habit by whether it improves or harms neatness and legibility."];
      const chosen = shuffle(rng, HABITS).slice(0, 8);
      const buckets = [{ id: "Good habit", label: "Good habit" }, { id: "Poor habit", label: "Poor habit" }];
      const items = chosen.map((c, i) => ({ id: `h${i}`, label: c.habit }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`h${i}`] = c.type));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this habit make writing more consistent, even, and readable, or less so?", explanation: chosen.map((c) => `"${c.habit}" — ${c.type}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for producing neat, legible handwriting in order.", "these handwriting steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, HANDWRITING_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: HANDWRITING_STEPS.map((s) => s.id), hint: "Start by sitting comfortably, form letters correctly, keep them consistent and spaced, apply even pressure, and check.", explanation: HANDWRITING_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the adverb that correctly completes this sentence.", "the missing adverb below.", "the word that tells us how the writing was done.", "the correct adverb to finish the sentence.", "the adverb that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
