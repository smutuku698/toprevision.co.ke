import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 6 "Health and Diseases", sub-strand 6.2.1
// "Reading Fluency" (R.6): intonation, speed/pace.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "pace", meaning: "the speed at which a person reads" },
  { concept: "natural pace", meaning: "a pace similar to how a person speaks normally" },
  { concept: "slow, deliberate reading", meaning: "reading carefully and slowly, often for important instructions" },
  { concept: "rushed reading", meaning: "reading too quickly, causing mistakes or lost meaning" },
  { concept: "emphasis", meaning: "giving certain words more importance through pace or tone" },
  { concept: "monotone", meaning: "reading in a flat voice with no change in pitch" },
  { concept: "expressive reading", meaning: "reading with feeling, using pace and tone to bring the text to life" },
  { concept: "dosage instructions", meaning: "information stating how much and how often medicine should be taken" },
  { concept: "safety warning", meaning: "an instruction meant to prevent harm" },
  { concept: "intonation", meaning: "the rise and fall of the voice's pitch while reading" },
];

interface SentenceEntry { text: string; pace: string }

const SENTENCES: SentenceEntry[] = [
  { text: "Take two tablets after every meal, three times a day.", pace: "Slow and careful" },
  { text: "The clinic is open from Monday to Friday.", pace: "Normal pace" },
  { text: "Do not exceed the stated dose under any circumstances.", pace: "Slow and careful" },
  { text: "The nurse checked the patient's temperature.", pace: "Normal pace" },
  { text: "Wash your hands for at least twenty seconds with soap.", pace: "Slow and careful" },
  { text: "Many people visit the hospital for regular check-ups.", pace: "Normal pace" },
  { text: "If symptoms worsen, seek medical help immediately.", pace: "Slow and careful" },
  { text: "The doctor recommended plenty of rest and fluids.", pace: "Normal pace" },
  { text: "Store this medicine away from sunlight and out of reach of children.", pace: "Slow and careful" },
  { text: "The ambulance arrived at the hospital within minutes.", pace: "Normal pace" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The nurse read the dosage instructions", after: ", making sure every word was clear.", answer: "slowly" },
  { before: "He read the general health tips", after: ", at his usual reading speed.", answer: "normally" },
  { before: "She read the safety warning", after: ", pausing on every important word.", answer: "carefully" },
  { before: "He rushed through the instructions", after: ", and nearly missed an important warning.", answer: "quickly" },
  { before: "The doctor spoke", after: ", giving the patient time to understand each point.", answer: "deliberately" },
  { before: "She read the health story aloud", after: ", with feeling and good expression.", answer: "expressively" },
  { before: "Reading in a flat voice with no pace changes is reading", after: ".", answer: "monotonously" },
  { before: "He read the medicine label", after: ", to avoid missing the correct dosage.", answer: "attentively" },
  { before: "The pace should slow down", after: "for warnings, and pick up again for general facts.", answer: "noticeably" },
  { before: "She practised until her reading sounded", after: ", not rushed or flat.", answer: "natural" },
];

const PACE_STEPS: { id: string; label: string }[] = [
  { id: "identify", label: "Identify whether the text is a general fact or an important instruction" },
  { id: "slow", label: "Slow down for dosage instructions and safety warnings" },
  { id: "normal", label: "Read general facts at a normal, natural pace" },
  { id: "stress", label: "Stress key words such as amounts, times, and warnings" },
  { id: "pause", label: "Pause briefly after each important instruction" },
  { id: "check", label: "Check the listener understood before moving on" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Take two tablets after every meal, three times a day." quickly, without slowing down. What is the risk?`, correct: "The listener might miss the exact dosage and take the wrong amount", wrong: ["There is no risk — dosage instructions are never important", "The medicine will automatically adjust itself", "The listener will always remember the dosage anyway"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The clinic is open from Monday to Friday." at a normal pace. Is this the right choice?`, correct: "Yes — it is a general fact, not an instruction that needs special caution", wrong: ["No — every sentence must be read as slowly as possible", "No — this sentence should be read faster than usual", "Yes, but only because the sentence is very short"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads a passage in a flat voice with no change in pitch at all. What is this called?`, correct: "Monotone reading", wrong: ["Expressive reading", "Slow, deliberate reading", "Rushed reading"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} discusses "emphasis" while practising a health passage. What does emphasis mean here?`, correct: "Giving certain words more importance through pace or tone", wrong: ["Reading every word at exactly the same speed", "Skipping difficult words entirely", "Reading only the first sentence of a passage"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must read "If symptoms worsen, seek medical help immediately." What pace fits this sentence best?`, correct: "Slow and careful, since it is an important safety warning", wrong: ["As fast as possible, to save time", "Silent reading only, with no sound at all", "It does not matter, since the words are simple"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads a whole passage at the very same fast speed, regardless of content. What is missing from ${who}'s reading?`, correct: "Adjusting pace between general facts and important instructions", wrong: ["Nothing — reading everything at one speed is always correct", "The passage's punctuation, which does not matter for pace", "The passage's title, which controls pace"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "dosage instructions" means. What is the correct meaning?`, correct: "Information stating how much and how often medicine should be taken", wrong: ["A warning about the side effects of a medicine only", "The name of the illness a medicine treats", "The place where medicine is stored"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads a health story with good pace, tone, and feeling. What is this called?`, correct: "Expressive reading", wrong: ["Monotone reading", "Rushed reading", "Silent reading"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} slows down and pauses clearly while reading "Wash your hands for at least twenty seconds with soap." Why is this a good choice?`, correct: "It helps the listener catch every detail of an important hygiene instruction", wrong: ["It makes the sentence sound boring on purpose", "It has no effect on how well the listener understands", "It is only done to fill up more reading time"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} keeps rushing through a passage, causing several words to run together. What is the likely effect?`, correct: "The listener may lose meaning or important details because of the rushed pace", wrong: ["The passage will automatically become easier to understand", "There is no effect on understanding, only on speed", "Rushing always makes reading sound more expressive"] }; },
];

export const healthReadingFluency: Skill = {
  id: "g6-il-r-health",
  code: "R.6",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Health and diseases: reading fluency",
  description: "Adjust reading pace and use correct intonation when reading health-related texts and instructions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Slow down for dosage instructions and safety warnings; read general facts at a normal, natural pace.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each reading term with its meaning.", "each term below with its correct meaning.", "each fluency term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence below by the pace it should be read at.", "each sentence into the correct pace group.", "these sentences into their correct pace groups.", "each sentence by whether it needs slow, careful reading or a normal pace."];
      const chosen = shuffle(rng, SENTENCES).slice(0, 8);
      const buckets = [{ id: "Slow and careful", label: "Slow and careful" }, { id: "Normal pace", label: "Normal pace" }];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.pace));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: is this an important instruction or warning, or a general fact?", explanation: chosen.map((c) => `"${c.text}" — ${c.pace}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for adjusting reading pace in order.", "these pace-adjusting steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, PACE_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: PACE_STEPS.map((s) => s.id), hint: "Start by identifying the text type, adjust your pace, stress key words, pause, and check understanding.", explanation: PACE_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the word that correctly completes this sentence.", "the missing word below.", "the word that best completes this sentence.", "the correct word to finish the sentence.", "the word that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
