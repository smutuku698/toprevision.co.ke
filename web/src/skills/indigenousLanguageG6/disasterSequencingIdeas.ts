import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 3 "Disaster Awareness", sub-strand 3.3.1
// "Sequencing Ideas" (W.3): parts of a composition, writing in logical sequence.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "introduction", meaning: "the opening part of a composition that presents the topic" },
  { concept: "body", meaning: "the main part of a composition that develops the topic with details" },
  { concept: "conclusion", meaning: "the closing part of a composition that sums up or reflects on the topic" },
  { concept: "logical sequence", meaning: "the order in which ideas are arranged so one leads naturally to the next" },
  { concept: "topic sentence", meaning: "a sentence that states the main idea of a paragraph" },
  { concept: "transition", meaning: "a word or phrase that connects one idea or paragraph to the next" },
  { concept: "chronological order", meaning: "arranging events in the order they happened in time" },
  { concept: "cause and effect", meaning: "explaining how one event leads to another" },
  { concept: "paragraph", meaning: "a group of related sentences developing one idea" },
  { concept: "coherence", meaning: "when ideas in a composition connect clearly and make sense together" },
];

interface PartEntry { sentence: string; part: string }

const PARTS: PartEntry[] = [
  { sentence: "Disasters can strike a community without warning, and knowing how to respond can save lives.", part: "Introduction" },
  { sentence: "This essay will explain the sudden dangers of floods in our region.", part: "Introduction" },
  { sentence: "Understanding fire safety is essential for every household.", part: "Introduction" },
  { sentence: "First, when the alarm sounds, everyone should stop and listen carefully.", part: "Body" },
  { sentence: "Next, learners should follow the marked evacuation route calmly, without pushing.", part: "Body" },
  { sentence: "Then, everyone should gather at the designated safe assembly point.", part: "Body" },
  { sentence: "During a flood, families should move to higher ground as quickly as possible.", part: "Body" },
  { sentence: "Community members should help elderly neighbours reach safety first.", part: "Body" },
  { sentence: "In summary, staying calm and following the steps in order keeps everyone safe.", part: "Conclusion" },
  { sentence: "In conclusion, preparation and teamwork reduce the harm caused by floods.", part: "Conclusion" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The", after: "of a composition presents the topic to the reader.", answer: "introduction" },
  { before: "The", after: "develops the topic with supporting details.", answer: "body" },
  { before: "The", after: "sums up the main ideas at the end.", answer: "conclusion" },
  { before: "A", after: "connects one paragraph smoothly to the next.", answer: "transition" },
  { before: "Arranging events in the order they happened is called", after: "order.", answer: "chronological" },
  { before: "A", after: "states the main idea of a paragraph.", answer: "topic sentence" },
  { before: "When ideas connect clearly and make sense together, a composition has", after: ".", answer: "coherence" },
  { before: "Explaining how one event leads to another is called", after: ".", answer: "cause and effect" },
  { before: "A group of related sentences developing one idea is called a", after: ".", answer: "paragraph" },
  { before: "Arranging ideas so one leads naturally to the next is called", after: "sequence.", answer: "logical" },
];

const COMPOSITION_STEPS: { id: string; label: string }[] = [
  { id: "intro", label: "Write an introduction that presents the topic" },
  { id: "body", label: "Write body paragraphs that develop the topic with details, in a logical order" },
  { id: "transitions", label: "Use transition words to connect paragraphs smoothly" },
  { id: "chronological", label: "Arrange events in chronological order if telling a story" },
  { id: "conclusion", label: "Write a conclusion that sums up the main ideas" },
  { id: "reread", label: "Reread the whole composition to check it flows logically" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "First, when the alarm sounds, everyone should stop and listen carefully." Which part of a composition does this sentence belong to?`, correct: "Body", wrong: ["Introduction", "Conclusion", "None of these parts"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "In conclusion, preparation and teamwork reduce the harm caused by floods." Which part of a composition does this sentence belong to?`, correct: "Conclusion", wrong: ["Introduction", "Body", "None of these parts"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a body paragraph before ever introducing the topic. What is the problem?`, correct: "The composition is missing a clear introduction to guide the reader", wrong: ["There is no problem — order does not matter in a composition", "The body paragraph should have been the conclusion instead", "Compositions should never have an introduction"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} discusses "cause and effect" while planning a disaster essay. What does this term mean?`, correct: "Explaining how one event leads to another", wrong: ["Arranging ideas alphabetically", "Writing only in the past tense", "Repeating the same idea in every paragraph"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} tells a disaster story but jumps back and forth between events with no clear order. What is missing?`, correct: "Chronological order — the events should follow the order they actually happened", wrong: ["A conclusion, since only conclusions need order", "An introduction, since only introductions need order", "Nothing is missing — random order is always fine for stories"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} uses the word "next" to link two body paragraphs about evacuation steps. What is this word doing?`, correct: "Acting as a transition, connecting one idea smoothly to the next", wrong: ["Acting as a topic sentence", "Acting as the composition's conclusion", "Acting as an introduction"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a composition where every paragraph connects clearly and makes sense together. What quality does this composition have?`, correct: "Coherence", wrong: ["Chronological confusion", "A missing topic entirely", "An unrelated conclusion"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes "Understanding fire safety is essential for every household." at the very start of an essay. Which part is this?`, correct: "Introduction", wrong: ["Body", "Conclusion", "None of these parts"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes several sentences about evacuation all developing one idea. What is this group of sentences called?`, correct: "A paragraph", wrong: ["A topic sentence only", "A transition", "A conclusion only"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} finishes writing a disaster-awareness composition but never rereads it to check the order of ideas. What might ${who} miss?`, correct: "Places where the ideas do not flow logically from one to the next", wrong: ["Nothing — rereading a composition is never useful", "Only spelling mistakes, never issues with sequence", "The topic of the composition itself"] }; },
];

export const disasterSequencingIdeas: Skill = {
  id: "g6-il-w-disaster",
  code: "W.3",
  subjectId: "indigenous-language",
  strandId: "g6-il-writing",
  grade: 6,
  title: "Disaster awareness: sequencing ideas",
  description: "Identify the parts of a composition and arrange ideas about disaster awareness in a logical sequence.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A composition has an introduction, a body that develops the topic in order, and a conclusion that sums it up.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each composition term with its meaning.", "each term below with its correct meaning.", "each writing term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence below by the composition part it belongs to.", "each sentence into its correct composition-part group.", "these sentences into their correct groups.", "each sentence by whether it introduces, develops, or concludes the topic."];
      const chosen = shuffle(rng, PARTS).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.part)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `pt${i}`, label: c.sentence }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`pt${i}`] = c.part));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does this sentence introduce the topic, develop it with details, or sum it up at the end?", explanation: chosen.map((c) => `"${c.sentence}" — ${c.part}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for writing a well-sequenced composition in order.", "these composition-writing steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, COMPOSITION_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: COMPOSITION_STEPS.map((s) => s.id), hint: "Start with an introduction, build the body in a logical order using transitions, then write a conclusion and reread.", explanation: COMPOSITION_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the composition term that correctly completes this sentence.", "the missing term below.", "the word that best completes this sentence.", "the correct term to finish the sentence.", "the term that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
