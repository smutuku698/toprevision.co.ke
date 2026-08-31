import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 1 "Ceremonies and Festivals", sub-strand 1.2.1
// "Reading for Information: Note Making" (R.1): key points, summarising, adverbs.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "key point", meaning: "the most important idea in a text" },
  { concept: "supporting detail", meaning: "extra information that explains or backs up a key point" },
  { concept: "summary", meaning: "a short restatement of a text's main ideas, in your own words" },
  { concept: "main idea", meaning: "what the whole text is mostly about" },
  { concept: "irrelevant detail", meaning: "information that does not help explain the main idea" },
  { concept: "note-taking", meaning: "writing down important points while reading or listening" },
  { concept: "paraphrase", meaning: "restating something in different words while keeping the same meaning" },
  { concept: "heading", meaning: "a short title that tells you what a section is about" },
  { concept: "skim", meaning: "to read quickly to get a general idea of a text" },
  { concept: "scan", meaning: "to read quickly, looking for one specific piece of information" },
];

interface StatementEntry { text: string; type: string }

const STATEMENTS: StatementEntry[] = [
  { text: "The community holds an anniversary celebration every year.", type: "Key point" },
  { text: "The celebration strengthens unity in the community.", type: "Key point" },
  { text: "Elders give speeches about the community's history.", type: "Supporting detail" },
  { text: "Dancers wear colourful traditional attire.", type: "Supporting detail" },
  { text: "The celebration usually lasts one full day.", type: "Supporting detail" },
  { text: "A parade of dancers and soloists opens the event.", type: "Supporting detail" },
  { text: "Gifts are exchanged between families during the event.", type: "Supporting detail" },
  { text: "One visitor mentioned it rained lightly last year.", type: "Irrelevant detail" },
  { text: "The nearest shop sells snacks all year round.", type: "Irrelevant detail" },
  { text: "Someone's shoes were a bright shade of blue.", type: "Irrelevant detail" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "Good notes are taken", after: ", capturing only the key points.", answer: "carefully" },
  { before: "She read the ceremony passage", after: "before summarising it.", answer: "attentively" },
  { before: "He skimmed the text", after: "to find the general topic.", answer: "quickly" },
  { before: "The summary reported the main idea", after: ", without changing its meaning.", answer: "accurately" },
  { before: "They read the whole passage", after: ", missing no important detail.", answer: "thoroughly" },
  { before: "She noted down the key points", after: ", leaving out anything unimportant.", answer: "selectively" },
  { before: "The group worked", after: "so as not to disturb other readers.", answer: "quietly" },
  { before: "He reviewed his notes", after: "after finishing the passage.", answer: "diligently" },
  { before: "The class organised its notes", after: ", one key point at a time.", answer: "methodically" },
  { before: "She handed in her summary", after: ", right after the reading period ended.", answer: "promptly" },
];

const NOTE_STEPS: { id: string; label: string }[] = [
  { id: "read-once", label: "Read the whole passage once without stopping" },
  { id: "main-idea", label: "Identify the main idea of the passage" },
  { id: "key-points", label: "Note the key points that support the main idea" },
  { id: "leave-out", label: "Leave out irrelevant details" },
  { id: "own-words", label: "Write the notes in your own words" },
  { id: "review", label: "Review your notes to check they cover the main idea" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads a ceremony passage and writes down "One visitor mentioned it rained lightly last year." Is this a key point worth noting?`, correct: "No — it is an irrelevant detail that does not support the main idea", wrong: ["Yes — every detail in a passage is equally important", "Yes — because it mentions the weather", "No — because it is too short to be a key point"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must summarise a passage about a harvest festival. What should the summary do?`, correct: `Restate the main ideas in ${who}'s own words, briefly and accurately`, wrong: ["Copy the whole passage word for word", "Add extra details that were not in the passage", "Focus only on one small, unimportant detail"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked to "skim" a passage before reading it closely. What should ${who} do?`, correct: "Read quickly to get a general idea of what the passage is about", wrong: ["Read every single word slowly and carefully", "Ignore the passage completely", "Read only the last sentence"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "Dancers wear colourful traditional attire" while note-making. What type of statement is this?`, correct: "Supporting detail", wrong: ["Key point", "Irrelevant detail", "None of these"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads that "the celebration strengthens unity in the community." What kind of statement is this?`, correct: "Key point", wrong: ["Irrelevant detail", "A single small supporting detail only", "None of these"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a summary that copies the entire ceremony passage word for word. What is the problem?`, correct: "A summary should be shorter and in the reader's own words, not a full copy", wrong: ["There is no problem, since copying is always accurate", "The summary is too short", "The summary should have used more adverbs"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked to "scan" a passage to find the date of a festival. What should ${who} do?`, correct: "Read quickly, looking only for that specific piece of information", wrong: ["Read every word slowly from beginning to end", "Skip the passage entirely", "Memorise the whole passage before answering"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} takes notes on a ceremony passage but forgets to check them against the main idea afterwards. What might go wrong?`, correct: `${who}'s notes might miss the main idea or include unimportant details`, wrong: ["Nothing — reviewing notes is never necessary", "The notes will automatically be correct", "The passage will change to match the notes"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} restates a sentence from a passage using different words but the same meaning. What is this called?`, correct: "Paraphrasing", wrong: ["Skimming", "Scanning", "Ignoring the text"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the heading "Anniversary Celebrations" above a passage. What is the heading's purpose?`, correct: "To tell the reader, briefly, what the passage is about", wrong: ["To list every supporting detail in the passage", "To replace the need for reading the passage", "To give the exact date of the event only"] }; },
];

export const ceremoniesNoteMaking: Skill = {
  id: "g6-il-r-ceremonies",
  code: "R.1",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Ceremonies and festivals: reading for information and note making",
  description: "Identify key points in a ceremony passage, summarise accurately, and use adverbs correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A key point is the main idea a passage is really about; a supporting detail explains it; an irrelevant detail does neither.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each note-making term with its meaning.", "each term below with its correct meaning.", "each reading term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each statement by whether it is a key point, a supporting detail, or an irrelevant detail.", "each statement below into its correct note-making group.", "these statements into their correct groups.", "each statement by how important it is to the main idea."];
      const chosen = shuffle(rng, STATEMENTS).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.type)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.type));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this explain the main idea directly, support it with extra information, or have nothing to do with it?", explanation: chosen.map((c) => `"${c.text}" — ${c.type}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for making notes on a passage in order.", "these note-making steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, NOTE_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: NOTE_STEPS.map((s) => s.id), hint: "Start by reading the whole passage, find the main idea, note key points, skip irrelevant details, and review.", explanation: NOTE_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the adverb that correctly completes this sentence.", "the missing adverb below.", "the word that tells us how the action was done.", "the correct adverb to finish the sentence.", "the adverb that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
