import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 6 "Health and Diseases", sub-strand 6.3.1
// "Creative Writing: Poetry" (W.6): stanza, rhythm, composing poems.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "stanza", meaning: "a group of lines in a poem, similar to a paragraph in prose" },
  { concept: "rhythm", meaning: "the pattern of stressed and unstressed beats in a poem" },
  { concept: "rhyme", meaning: "when the ending sounds of words match, often at the end of lines" },
  { concept: "verse", meaning: "a single line of a poem" },
  { concept: "refrain", meaning: "a line or group of lines repeated at intervals throughout a poem" },
  { concept: "imagery", meaning: "descriptive language that helps the reader picture something in their mind" },
  { concept: "couplet", meaning: "two lines of poetry that rhyme and are often paired together" },
  { concept: "theme", meaning: "the central message or subject of a poem" },
  { concept: "alliteration", meaning: "the repetition of the same beginning sound in nearby words" },
  { concept: "rhyming pair", meaning: "two words that share the same ending sound" },
];

interface PairEntry { a: string; b: string; rhymes: boolean }

const PAIRS: PairEntry[] = [
  { a: "care", b: "share", rhymes: true },
  { a: "health", b: "wealth", rhymes: true },
  { a: "clean", b: "seen", rhymes: true },
  { a: "sick", b: "quick", rhymes: true },
  { a: "pain", b: "rain", rhymes: true },
  { a: "rest", b: "best", rhymes: true },
  { a: "cure", b: "pure", rhymes: true },
  { a: "strong", b: "long", rhymes: true },
  { a: "day", b: "away", rhymes: true },
  { a: "germ", b: "firm", rhymes: true },
  { a: "health", b: "sick", rhymes: false },
  { a: "clean", b: "germ", rhymes: false },
  { a: "pain", b: "cure", rhymes: false },
  { a: "rest", b: "strong", rhymes: false },
];

interface FillEntry { word: string; answer: string }

const FILLS: FillEntry[] = [
  { word: "care", answer: "share" },
  { word: "health", answer: "wealth" },
  { word: "clean", answer: "seen" },
  { word: "sick", answer: "quick" },
  { word: "pain", answer: "rain" },
  { word: "rest", answer: "best" },
  { word: "cure", answer: "pure" },
  { word: "strong", answer: "long" },
  { word: "day", answer: "away" },
  { word: "germ", answer: "firm" },
];

const POEM_STEPS: { id: string; label: string }[] = [
  { id: "theme", label: "Choose a theme or message for the poem" },
  { id: "structure", label: "Decide how many stanzas and lines per stanza the poem will have" },
  { id: "brainstorm", label: "Brainstorm words and images related to the theme" },
  { id: "rhyme", label: "Choose rhyming word pairs to end certain lines" },
  { id: "write", label: "Write the lines, keeping a steady rhythm" },
  { id: "read-aloud", label: "Read the poem aloud to check its rhythm and rhyme sound right" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} groups four lines of a health poem together, similar to a paragraph. What is this group called?`, correct: "A stanza", wrong: ["A verse only", "A refrain", "A theme"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} notices that "care" and "share" end with the same sound. What is this called?`, correct: "A rhyming pair", wrong: ["Alliteration", "A refrain", "A theme"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} repeats the same line "Stay healthy, stay strong" after every stanza of a poem. What is this repeated line called?`, correct: "A refrain", wrong: ["A rhyming pair", "A theme", "Alliteration"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} checks whether "clean" and "germ" rhyme. Do they?`, correct: "No — their ending sounds do not match", wrong: ["Yes — every pair of words rhymes", "Yes — they both relate to health", "No, but only because they have different meanings"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} checks whether "health" and "wealth" rhyme. Do they?`, correct: "Yes — their ending sounds match", wrong: ["No — they are spelt differently", "No — they have different meanings", "Yes, but only because they are the same length"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "germs spread quickly, quiet and unseen" to help the reader picture how germs move. What is this called?`, correct: "Imagery", wrong: ["A refrain", "A rhyming pair", "A stanza"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes two rhyming lines together: "Wash your hands, keep them clean; germs are tiny, rarely seen." What is this pair of lines called?`, correct: "A couplet", wrong: ["A refrain", "A theme", "Alliteration"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} composes a whole poem about the importance of hygiene. What is this central message called?`, correct: "The theme", wrong: ["The rhythm", "A rhyming pair", "A stanza"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "Sick and sniffling, sneezing softly" using repeated "s" sounds. What technique is this?`, correct: "Alliteration", wrong: ["A rhyming pair", "A refrain", "A stanza"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads a poem aloud and taps out its steady pattern of stressed and unstressed beats. What is ${who} noticing?`, correct: "The poem's rhythm", wrong: ["The poem's theme only", "The poem's rhyming pairs only", "The poem's refrain only"] }; },
];

export const healthPoetry: Skill = {
  id: "g6-il-w-health",
  code: "W.6",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Health and diseases: poetry",
  description: "Identify stanza, rhythm, and rhyme, and compose simple poems about health and diseases.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A stanza is a group of lines; rhythm is the beat pattern; rhyme is when word endings sound the same.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each poetry term with its meaning.", "each term below with its correct meaning.", "each poetry term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each word pair below by whether the words rhyme.", "each pair into the correct rhyme group.", "these word pairs into their correct groups.", "each pair by whether their ending sounds match."];
      const chosen = shuffle(rng, PAIRS).slice(0, 8);
      const buckets = [{ id: "Rhymes", label: "Rhymes" }, { id: "Does not rhyme", label: "Does not rhyme" }];
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: `${c.a} / ${c.b}` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.rhymes ? "Rhymes" : "Does not rhyme"));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Say each pair of words aloud — do their endings sound the same?", explanation: chosen.map((c) => `${c.a} / ${c.b} — ${c.rhymes ? "rhymes" : "does not rhyme"}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for composing a poem in order.", "these poem-composing steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, POEM_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: POEM_STEPS.map((s) => s.id), hint: "Start with a theme, plan the structure, brainstorm words, choose rhymes, write with rhythm, and read aloud.", explanation: POEM_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["a word that rhymes with the word given.", "the missing rhyming word below.", "a word that correctly rhymes with it.", "the correct rhyming word to finish the sentence.", "a word that rhymes and fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: `A word that rhymes with "${entry.word}" is`, after: ".", correctAnswer: entry.answer, inputMode: "text", hint, explanation: `"${entry.word}" rhymes with "${entry.answer}".` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
