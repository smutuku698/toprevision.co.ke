import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 2 "Environmental Conservation", sub-strand 2.2.1
// "Reading Fluency" (R.2): intonation, pause.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "intonation", meaning: "the rise and fall of the voice's pitch while reading" },
  { concept: "pause", meaning: "a brief stop, usually shown by punctuation, while reading" },
  { concept: "fluency", meaning: "the ability to read smoothly, accurately, and with expression" },
  { concept: "stress", meaning: "extra emphasis placed on a particular word or syllable" },
  { concept: "pace", meaning: "the speed at which a person reads" },
  { concept: "expression", meaning: "showing feeling and meaning through the voice while reading" },
  { concept: "comma pause", meaning: "a brief pause taken when a comma appears in a sentence" },
  { concept: "full stop pause", meaning: "a longer, complete pause taken at the end of a sentence" },
  { concept: "rising intonation", meaning: "the voice pitch goes up, usually for questions" },
  { concept: "falling intonation", meaning: "the voice pitch goes down, usually for statements" },
];

interface SentenceEntry { text: string; mark: string; cue: string }

const SENTENCES: SentenceEntry[] = [
  { text: "Would you help conserve the river near your home", mark: "?", cue: "Question — rising intonation" },
  { text: "Never litter along the riverbank", mark: "!", cue: "Exclamation — spoken with emphasis" },
  { text: "Trees help keep the environment clean", mark: ".", cue: "Statement — falling intonation" },
  { text: "Save water, it is precious", mark: "!", cue: "Exclamation — spoken with emphasis" },
  { text: "Do you reuse plastic bottles at home", mark: "?", cue: "Question — rising intonation" },
  { text: "Pollution harms rivers and the animals living in them", mark: ".", cue: "Statement — falling intonation" },
  { text: "Plant a tree today", mark: "!", cue: "Exclamation — spoken with emphasis" },
  { text: "The community recycles bottles every week", mark: ".", cue: "Statement — falling intonation" },
  { text: "Why should we conserve energy at home", mark: "?", cue: "Question — rising intonation" },
  { text: "Recycling reduces waste in our surroundings", mark: ".", cue: "Statement — falling intonation" },
  { text: "Can factories reduce the pollution they release", mark: "?", cue: "Question — rising intonation" },
  { text: "Protect the wetlands for future generations", mark: "!", cue: "Exclamation — spoken with emphasis" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "Would you help conserve the river near your home", after: "", answer: "?" },
  { before: "Never litter along the riverbank", after: "", answer: "!" },
  { before: "Trees help keep the environment clean", after: "", answer: "." },
  { before: "Save water, it is precious", after: "", answer: "!" },
  { before: "Do you reuse plastic bottles at home", after: "", answer: "?" },
  { before: "Pollution harms rivers and the animals living in them", after: "", answer: "." },
  { before: "Plant a tree today", after: "", answer: "!" },
  { before: "The community recycles bottles every week", after: "", answer: "." },
  { before: "Why should we conserve energy at home", after: "", answer: "?" },
  { before: "After collecting the litter", after: "the class recycled it properly.", answer: "," },
];

const FLUENCY_STEPS: { id: string; label: string }[] = [
  { id: "preview", label: "Preview the passage to notice its punctuation" },
  { id: "silent", label: "Read the passage silently once for meaning" },
  { id: "steady", label: "Read aloud at a steady, natural pace" },
  { id: "pause", label: "Pause briefly at commas and fully at full stops" },
  { id: "stress", label: "Raise your pitch for questions and stress important words" },
  { id: "practise", label: "Practise until the reading sounds smooth and expressive" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Would you help conserve the river near your home?" aloud. What should happen to ${who}'s voice at the end?`, correct: "It should rise in pitch, because it is a question", wrong: ["It should fall sharply, as if it were a statement", "It should stay completely flat", "It should stop with no sound at all"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The community recycles bottles every week." with a rising tone at the end. What is the problem?`, correct: "The sentence is a statement, so the tone should fall, not rise", wrong: ["There is no problem — all sentences rise at the end", "The sentence is missing a comma", "The sentence should be whispered instead"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "fluency" means in reading. What is the correct meaning?`, correct: "The ability to read smoothly, accurately, and with expression", wrong: ["The speed at which a person reads only", "A brief stop shown by punctuation", "Extra emphasis on one word"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} discusses "comma pause" while practising a passage about recycling. What is a comma pause?`, correct: "A brief pause taken when a comma appears in a sentence", wrong: ["A long, complete pause at the end of a sentence", "A rise in pitch used for questions", "A pause used only before exclamation marks"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Plant a tree today!" in a flat, unexcited voice. What is missing from ${who}'s reading?`, correct: "Expression and stress, since it is an exclamation calling for action", wrong: ["A rising tone at the very start only", "Complete silence throughout", "A long pause before every word"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads a passage far too quickly, running sentences together with no pauses. What should ${who} change?`, correct: "Slow the pace down and pause at commas and full stops", wrong: ["Read even faster to finish sooner", "Stop reading altogether", "Skip every punctuation mark on purpose"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked to identify the difference between rising and falling intonation. Which is correct?`, correct: "Rising intonation goes up in pitch, usually for questions; falling intonation goes down, usually for statements", wrong: ["Rising intonation is only used at the start of a passage", "Falling intonation is only used for questions", "There is no real difference between the two"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Why should we conserve energy at home" without any pause before starting the next sentence. What has ${who} likely missed?`, correct: "The full stop pause or question mark cue that signals the sentence has ended", wrong: ["Nothing — pauses are never needed between sentences", "The need to read faster", "The need to skip the sentence entirely"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} practises reading a passage about pollution multiple times before presenting it. Why does this help?`, correct: `Practice helps ${who} read more smoothly, with better pace, pauses, and intonation`, wrong: ["Practice has no effect on how a passage sounds when read aloud", "Practice only helps with spelling, not reading aloud", "Practice makes the passage shorter"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Save water, it is precious!" What tone best matches the exclamation mark?`, correct: "A strong, emphatic tone that shows urgency", wrong: ["A quiet, uninterested tone", "A rising tone, as if asking a question", "Complete silence"] }; },
];

export const environmentReadingFluency: Skill = {
  id: "g6-il-r-environment",
  code: "R.2",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Environmental conservation: reading fluency",
  description: "Read conservation-themed texts using correct intonation and pause for fluent, expressive reading.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Let the punctuation guide you: pause briefly at commas, pause fully at full stops, and raise your pitch for questions.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each reading-fluency term with its meaning.", "each term below with its correct meaning.", "each fluency term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence by the punctuation mark it should end with.", "each sentence below into the correct punctuation group.", "these sentences by whether they are a question, statement, or exclamation.", "each sentence into its matching punctuation-mark group."];
      const chosen = shuffle(rng, SENTENCES).slice(0, 8);
      const buckets = [{ id: "?", label: "Question (?)" }, { id: "!", label: "Exclamation (!)" }, { id: ".", label: "Statement (.)" }];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.mark));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: is this sentence asking something, showing strong feeling, or simply stating a fact?", explanation: chosen.map((c) => `"${c.text}${c.mark}" — ${c.cue}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for reading a passage fluently in order.", "these fluent-reading steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, FLUENCY_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: FLUENCY_STEPS.map((s) => s.id), hint: "Start by previewing the passage, read silently, then aloud at a steady pace, pausing and stressing correctly, and practise.", explanation: FLUENCY_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the correct punctuation mark.", "the missing punctuation mark below.", "the mark that best fits this sentence.", "the correct mark to finish the sentence.", "the punctuation mark that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      const filled = `${entry.before}${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim();
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${filled} — the mark "${entry.answer}" fits this sentence.` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
