import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 7 "Careers and Professions", sub-strand 7.3.1
// "Creative Writing: Narrative composition" (W.7): elements of narrative composition,
// neatness and legibility.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "character", meaning: "a person or animal who takes part in the events of a story" },
  { concept: "setting", meaning: "the time and place in which a story happens" },
  { concept: "plot", meaning: "the sequence of events that make up a story" },
  { concept: "conflict", meaning: "a problem or struggle the main character faces in a story" },
  { concept: "resolution", meaning: "how the conflict in a story is solved by the end" },
  { concept: "climax", meaning: "the most exciting or important turning point in a story" },
  { concept: "narrator", meaning: "the voice that tells the story" },
  { concept: "dialogue", meaning: "the words characters speak to each other in a story" },
  { concept: "beginning", meaning: "the opening part of a story that introduces characters and setting" },
  { concept: "ending", meaning: "the closing part of a story where the conflict is resolved" },
];

interface NarrativeEntry { text: string; element: string }

const NARRATIVE: NarrativeEntry[] = [
  { text: "Amina always dreamed of becoming a pilot.", element: "Character" },
  { text: "Amina's classmates joined her fundraising effort.", element: "Character" },
  { text: "One rainy morning in Nairobi, Amina heard the news.", element: "Setting" },
  { text: "The story takes place mostly at a flying school.", element: "Setting" },
  { text: "The flying school had closed its doors due to lack of funding.", element: "Conflict" },
  { text: "Amina felt frustrated when she heard the sad news.", element: "Conflict" },
  { text: "Amina organised a fundraiser with her classmates.", element: "Plot event" },
  { text: "After months of hard work, the school reopened.", element: "Plot event" },
  { text: "Amina took her first flying lesson.", element: "Resolution" },
  { text: "In the end, Amina's dream finally began to come true.", element: "Resolution" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The", after: "of a story is the person the events happen to.", answer: "character" },
  { before: "The", after: "is the time and place where a story happens.", answer: "setting" },
  { before: "The", after: "is the sequence of events that make up a story.", answer: "plot" },
  { before: "A", after: "is a problem the main character must face.", answer: "conflict" },
  { before: "The", after: "is how the conflict is solved by the end.", answer: "resolution" },
  { before: "The most exciting turning point in a story is called the", after: ".", answer: "climax" },
  { before: "The voice that tells the story is called the", after: ".", answer: "narrator" },
  { before: "The words characters speak to each other are called", after: ".", answer: "dialogue" },
  { before: "The opening part of a story is called the", after: ".", answer: "beginning" },
  { before: "The closing part of a story is called the", after: ".", answer: "ending" },
];

const NARRATIVE_STEPS: { id: string; label: string }[] = [
  { id: "character-setting", label: "Choose the main character and setting" },
  { id: "conflict", label: "Decide on the conflict the character will face" },
  { id: "plan-plot", label: "Plan the events of the plot in order" },
  { id: "begin", label: "Write the beginning, introducing character and setting" },
  { id: "climax", label: "Build up to the climax through the middle events" },
  { id: "end", label: "Write the ending, resolving the conflict" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "The flying school had closed its doors due to lack of funding." Which story element is this?`, correct: "Conflict", wrong: ["Setting", "Resolution", "Character"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "Amina took her first flying lesson," at the end of a story about a struggling flying school. Which element is this?`, correct: "Resolution", wrong: ["Conflict", "Setting", "Beginning"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "One rainy morning in Nairobi..." at the start of a careers story. Which element is this?`, correct: "Setting", wrong: ["Character", "Conflict", "Resolution"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "Amina organised a fundraiser with her classmates." into a story-element group. Which group fits?`, correct: "Plot event", wrong: ["Conflict", "Resolution", "Setting"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a story about a career without ever describing a problem the character faces. What is missing?`, correct: "A conflict — the story needs a problem or struggle for the character to face", wrong: ["A setting, since stories never need a place", "A character, since the story has none at all", "Nothing is missing from the story"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "climax" means in a narrative composition. What is the correct meaning?`, correct: "The most exciting or important turning point in a story", wrong: ["The opening part that introduces characters", "The closing part that resolves the conflict", "The words characters speak to each other"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "\"I won't give up,\" said Amina." in a story about a career struggle. What is this an example of?`, correct: "Dialogue", wrong: ["Setting", "Resolution", "Plot summary only"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a story with a clear beginning and middle but no ending at all. What is the problem?`, correct: "The story's conflict is never resolved for the reader", wrong: ["There is no problem — endings are optional in narratives", "The story needs a completely new conflict instead", "The story should have started with the ending"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes about Amina and her classmates in a careers story. What role do the classmates play?`, correct: "They are supporting characters who help the main character", wrong: ["They are the setting of the story", "They are the story's conflict", "They are the narrator only"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a careers story quickly and messily, making it hard to read. What should ${who} do before submitting it?`, correct: "Rewrite it neatly and legibly so it is easy for others to read", wrong: ["Nothing — neatness has no effect on a narrative composition", "Delete the whole story and start a new topic", "Remove all the dialogue from the story"] }; },
];

export const careersNarrativeComposition: Skill = {
  id: "g6-il-w-careers",
  code: "W.7",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Careers and professions: narrative composition",
  description: "Identify the elements of a narrative and write career-themed stories neatly and legibly.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Every narrative needs characters, a setting, a conflict, plot events, and a resolution that solves the conflict.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each narrative term with its meaning.", "each term below with its correct meaning.", "each story-element term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence below by the story element it represents.", "each sentence into its correct story-element group.", "these sentences into their correct groups.", "each sentence by whether it shows character, setting, conflict, a plot event, or resolution."];
      const chosen = shuffle(rng, NARRATIVE).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.element)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.element));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this sentence introduce a person, a place/time, a problem, an event, or how the problem was solved?", explanation: chosen.map((c) => `"${c.text}" — ${c.element}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for planning a narrative composition in order.", "these narrative-planning steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, NARRATIVE_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: NARRATIVE_STEPS.map((s) => s.id), hint: "Start with character and setting, plan the conflict and plot, write the beginning, build to the climax, and resolve it.", explanation: NARRATIVE_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the narrative term that correctly completes this sentence.", "the missing term below.", "the word that best completes this sentence.", "the correct term to finish the sentence.", "the term that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
