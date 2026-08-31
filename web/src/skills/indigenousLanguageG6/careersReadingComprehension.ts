import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 7 "Careers and Professions", sub-strand 7.2.1
// "Reading Comprehension" (R.7): summarising, inferring meaning.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface InferEntry { word: string; sentence: string; meaning: string }

const INFER_WORDS: InferEntry[] = [
  { word: "meticulously", sentence: "The pilot reviewed the flight plan meticulously, checking every detail twice.", meaning: "very carefully and with great attention to detail" },
  { word: "articulate", sentence: "The lawyer had to be articulate to explain the case clearly to the jury.", meaning: "able to express ideas clearly and effectively" },
  { word: "diagnosis", sentence: "The doctor's diagnosis was accurate, correctly identifying the illness.", meaning: "the identification of an illness based on its signs and symptoms" },
  { word: "abundant", sentence: "The farmer's harvest was abundant this year, filling every store.", meaning: "existing in large quantities; plentiful" },
  { word: "refined", sentence: "The artist's technique was so refined that every brushstroke looked deliberate.", meaning: "elegant and skilful" },
  { word: "navigated", sentence: "The driver navigated the busy road with confidence and skill.", meaning: "found a way through or steered a route" },
  { word: "innovative", sentence: "The engineer's design was innovative, unlike anything built before.", meaning: "new and original in its ideas or methods" },
  { word: "initiative", sentence: "Employers value employees who show initiative in solving problems.", meaning: "the ability to act independently, without being told what to do" },
  { word: "resilience", sentence: "The profession demanded resilience, since setbacks were common.", meaning: "the ability to recover quickly from difficulties" },
  { word: "wavered", sentence: "The teacher's patience never wavered, even with the most difficult learners.", meaning: "became weaker or less firm" },
];

interface SummaryEntry { statement: string; type: string }

const SUMMARIES: SummaryEntry[] = [
  { statement: "A pilot prepares carefully before flying and stays alert to keep passengers safe.", type: "Good summary" },
  { statement: "Pilots check the weather, inspect the aircraft, review the flight plan, stay calm, stay alert, and fly the aircraft, and must do this before every single flight without exception.", type: "Poor summary" },
  { statement: "A pilot only checks the weather and does nothing else.", type: "Poor summary" },
  { statement: "A doctor examines patients, diagnoses illness, and prescribes treatment to help them recover.", type: "Good summary" },
  { statement: "Doctors are always tired and never help anyone.", type: "Poor summary" },
  { statement: "A farmer plants, tends, and harvests crops to produce food for the community.", type: "Good summary" },
  { statement: "Farmers never do any work at all.", type: "Poor summary" },
  { statement: "A lawyer studies the law and represents clients in legal matters.", type: "Good summary" },
  { statement: "Lawyers are people who only wear suits.", type: "Poor summary" },
  { statement: "An artist creates original works using skill and imagination.", type: "Good summary" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "A doctor examines patients and", after: "illness before recommending treatment.", answer: "diagnoses" },
  { before: "A lawyer studies the law and", after: "clients in legal matters.", answer: "represents" },
  { before: "A farmer plants, tends, and", after: "crops to produce food.", answer: "harvests" },
  { before: "A pilot", after: "aircraft carrying passengers or cargo.", answer: "flies" },
  { before: "An artist", after: "original works using skill and imagination.", answer: "creates" },
  { before: "A teacher", after: "learners new knowledge and skills.", answer: "teaches" },
  { before: "An engineer", after: "new machines and structures.", answer: "designs" },
  { before: "A driver", after: "vehicles safely from one place to another.", answer: "operates" },
  { before: "A nurse cares for patients who are", after: "sick or injured.", answer: "sick" },
  { before: "A doctor's", after: "must be accurate to give the right treatment.", answer: "diagnosis" },
];

const SUMMARY_STEPS: { id: string; label: string }[] = [
  { id: "read", label: "Read the whole passage carefully first" },
  { id: "main-idea", label: "Identify the main idea — what the career mostly involves" },
  { id: "note", label: "Note only the most important supporting details" },
  { id: "restate", label: "Restate these ideas briefly, in your own words" },
  { id: "leave-out", label: "Leave out irrelevant or minor details" },
  { id: "check", label: "Check the summary still matches the passage's actual meaning" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The pilot reviewed the flight plan meticulously." What does "meticulously" mean here?`, correct: "Very carefully and with great attention to detail", wrong: ["Very quickly, without much thought", "Loudly, so everyone could hear", "Only once, without checking again"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Doctors are always tired and never help anyone." as a summary of a passage about doctors. What is the problem?`, correct: "It distorts the passage's actual meaning instead of summarising it accurately", wrong: ["There is no problem — it is short and clear", "It is too long compared to the original passage", "It uses too many career-related words"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a summary that copies every sentence from the original career passage. What is the issue?`, correct: "A summary should be brief and in the reader's own words, not a full copy", wrong: ["There is no issue, since copying guarantees accuracy", "The summary is too short", "The summary should have used fewer career words"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The engineer's design was innovative, unlike anything built before." What does "innovative" mean here?`, correct: "New and original in its ideas or methods", wrong: ["Old and outdated", "Copied exactly from another design", "Very expensive to build"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "A farmer plants, tends, and harvests crops to produce food for the community." as a summary. Which type is it?`, correct: "Good summary", wrong: ["Poor summary", "Neither type", "Both types equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "Employers value employees who show initiative in solving problems." What does "initiative" mean here?`, correct: "The ability to act independently, without being told what to do", wrong: ["The ability to follow instructions exactly, word for word", "A type of formal document", "The amount of money an employee earns"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is unsure of an unfamiliar career word. What is the best strategy to work out its meaning?`, correct: "Look at the surrounding words in the sentence for context clues", wrong: ["Skip the word and ignore the rest of the sentence", "Guess randomly without reading the sentence again", "Replace the word with any word that sounds similar"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The profession demanded resilience, since setbacks were common." What does "resilience" mean here?`, correct: "The ability to recover quickly from difficulties", wrong: ["A large amount of money earned", "The ability to work without any rest", "A formal qualification or certificate"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} writes a summary of a careers passage that is accurate but far too long, repeating almost every detail. What should ${who} improve?`, correct: "Make the summary more concise, keeping only the most important points", wrong: ["Add even more details from the passage", "Remove the main idea entirely", "Replace the summary with an unrelated topic"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "The artist's technique was so refined that every brushstroke looked deliberate." What does "refined" suggest about the technique?`, correct: "That it was elegant and skilful", wrong: ["That it was careless and messy", "That it was copied from someone else", "That it had never been practised before"] }; },
];

export const careersReadingComprehension: Skill = {
  id: "g6-il-r-careers",
  code: "R.7",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Careers and professions: reading comprehension",
  description: "Summarise career-related passages accurately and infer the meaning of unfamiliar words from context.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Use the words around an unfamiliar term as context clues, and keep a summary brief, accurate, and in your own words.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each career word with its meaning.", "each word below with its correct meaning.", "each word with the meaning inferred from its sentence.", "each word with what it actually means."];
      const chosen = shuffle(rng, INFER_WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.word })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.word] = a.word;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.word}" in "${a.sentence}" means ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each summary below by whether it is good or poor.", "each statement into the correct summary-quality group.", "these summaries into their correct groups.", "each summary by whether it accurately reflects the original passage."];
      const chosen = shuffle(rng, SUMMARIES).slice(0, 8);
      const buckets = [{ id: "Good summary", label: "Good summary" }, { id: "Poor summary", label: "Poor summary" }];
      const items = chosen.map((c, i) => ({ id: `su${i}`, label: c.statement }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`su${i}`] = c.type));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: is this brief and accurate, or does it distort the meaning, copy too much, or leave out the main idea?", explanation: chosen.map((c) => `"${c.statement}" — ${c.type}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for writing an accurate summary in order.", "these summarising steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, SUMMARY_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: SUMMARY_STEPS.map((s) => s.id), hint: "Start by reading fully, find the main idea, note key details, restate briefly, and check accuracy.", explanation: SUMMARY_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the word that correctly completes this career description.", "the missing word below.", "the word that best completes this sentence.", "the correct word to finish the sentence.", "the word that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
