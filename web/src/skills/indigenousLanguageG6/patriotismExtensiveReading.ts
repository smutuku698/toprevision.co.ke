import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 9 "Patriotism", sub-strand 9.2.1
// "Extensive Reading: Dialogues" (R.9): vocabulary building, comprehension questions.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const DIALOGUE = `AMINA: Did you know our country celebrates Heroes' Day every year?
BRIAN: Yes! My grandfather always says true patriots build unity, not division.
AMINA: That's true. Our flag reminds us of the sacrifices made for peace.
BRIAN: I think respecting our leaders and community is one way to show love for our country.
AMINA: Exactly. Even singing a patriotic song with pride is a small way to honour that.`;

interface QAEntry { question: string; type: string; answer: string }

const QUESTIONS: QAEntry[] = [
  { question: "What day does the country celebrate every year, according to the dialogue?", type: "Direct", answer: "Heroes' Day" },
  { question: "What does Brian's grandfather say true patriots do?", type: "Direct", answer: "Build unity, not division" },
  { question: "What does the flag remind the speakers of?", type: "Direct", answer: "The sacrifices made for peace" },
  { question: "According to Brian, what is one way to show love for the country?", type: "Direct", answer: "Respecting leaders and community" },
  { question: "What does Amina suggest is a small way to honour the country?", type: "Direct", answer: "Singing a patriotic song with pride" },
  { question: "How do Amina and Brian seem to feel about their country, based on their tone?", type: "Inferential", answer: "They feel proud and respectful of their country" },
  { question: "Why might Brian's grandfather value unity so highly?", type: "Inferential", answer: "Because unity likely helped the country overcome past struggles or division" },
  { question: "What kind of relationship do Amina and Brian seem to have?", type: "Inferential", answer: "A friendly, respectful relationship built on shared conversation" },
  { question: "Why does the flag matter to the speakers, beyond being a piece of cloth?", type: "Inferential", answer: "Because it symbolises sacrifice and shared history, not just decoration" },
  { question: "What might happen if people stopped respecting their leaders and community?", type: "Inferential", answer: "Unity and peace in the community might weaken" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "A true", after: "loves and strongly supports their country.", answer: "patriot" },
  { before: "The national", after: "represents our country's identity.", answer: "flag" },
  { before: "Respecting our", after: "helps maintain order and direction.", answer: "leaders" },
  { before: "Singing a patriotic", after: "with pride shows love for one's country.", answer: "song" },
  { before: "To", after: "one's country is to break its trust through disloyalty.", answer: "betray" },
  { before: "A strong sense of", after: "brings people together as one.", answer: "unity" },
  { before: "Every citizen can help", after: "a better community.", answer: "build" },
  { before: "Lasting", after: "comes from mutual respect and cooperation.", answer: "peace" },
  { before: "A", after: "is a group of people living together in the same area.", answer: "community" },
  { before: "Deep", after: "for one's country inspires acts of service.", answer: "love" },
];

const COMPREHENSION_STEPS: { id: string; label: string }[] = [
  { id: "read", label: "Read the whole dialogue to understand who is speaking and what about" },
  { id: "reread-q", label: "Reread the question carefully to know what it is asking" },
  { id: "decide", label: "Decide whether the answer is stated directly or must be inferred" },
  { id: "find", label: "Find the relevant part of the dialogue for a direct question" },
  { id: "reason", label: "Use clues and reasoning for an inferential question" },
  { id: "write", label: "Write the answer clearly, using evidence from the dialogue" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the dialogue and is asked "What day does the country celebrate every year?" Where should ${who} look for the answer?`, correct: "Directly in the dialogue — Amina states it clearly", wrong: ["Nowhere — the answer cannot be found at all", "Only by guessing, since it is never mentioned", "In a completely different, unrelated passage"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked "Why might Brian's grandfather value unity so highly?" What kind of question is this?`, correct: "An inferential question — the answer is not stated directly, so it must be reasoned out", wrong: ["A direct question, since the dialogue states the exact reason", "A question with no possible answer", "A question about spelling, not meaning"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "What does the flag remind the speakers of?" into a question type. Which type is it?`, correct: "Direct", wrong: ["Inferential", "Neither type", "Both types equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "How do Amina and Brian seem to feel about their country?" into a question type. Which type is it?`, correct: "Inferential", wrong: ["Direct", "Neither type", "Both types equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "unity" means after reading the dialogue. What is the correct meaning?`, correct: "The state of being joined together as one", wrong: ["Freedom from conflict or disturbance", "A deep affection or care for something", "A song that expresses pride in one's country"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} answers a direct question by guessing instead of checking the dialogue. What is the risk?`, correct: "The answer might be wrong, even though the dialogue clearly states it", wrong: ["There is no risk — guessing is always accurate", "The dialogue will change to match the guess", "Direct questions never have a stated answer"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "betray" means. What is the correct meaning?`, correct: "To be disloyal to someone or something, breaking their trust", wrong: ["To love and strongly support one's country", "To sing a song expressing national pride", "To construct or develop something"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads that Brian says "true patriots build unity, not division." What can ${who} infer about Brian's own values?`, correct: `${who} can infer that Brian values unity and dislikes division`, wrong: ["Nothing can be inferred from this statement", "That Brian dislikes his own country", "That Brian never speaks to Amina again"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must decide how to answer "What might happen if people stopped respecting their leaders and community?" What kind of thinking does this require?`, correct: "Reasoning beyond the exact words of the dialogue, using inference", wrong: ["Simply copying a sentence word for word from the dialogue", "Ignoring the question entirely", "Looking only at the dialogue's punctuation"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked "What does Amina suggest is a small way to honour the country?" Which answer is correct?`, correct: "Singing a patriotic song with pride", wrong: ["Building a new flag", "Betraying one's leaders", "Avoiding the community entirely"] }; },
];

export const patriotismExtensiveReading: Skill = {
  id: "g6-il-r-patriotism",
  code: "R.9",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Patriotism: extensive reading of dialogues",
  description: "Build vocabulary and answer direct and inferential comprehension questions from a patriotism-themed dialogue.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A direct question's answer is stated in the text; an inferential question's answer must be reasoned out from clues.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each question about the dialogue with its correct answer.", "each question below with the answer it expects.", "each question with the correct answer from the dialogue.", "each question with its matching answer."];
      const chosen = shuffle(rng, QUESTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `q${i}`, label: a.question })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `q${i}`, label: a.answer })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`q${i}`] = `q${i}`));
      return { kind: "click-match", prompt: `${randChoice(rng, withEach(OPENERS, CLOSERS))} Dialogue:\n${DIALOGUE}`, tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.question}" — ${a.answer}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each question below by whether it is Direct or Inferential.", "each question into its correct type.", "these questions into their correct groups.", "each question by whether its answer is stated directly or must be reasoned out."];
      const chosen = shuffle(rng, QUESTIONS).slice(0, 8);
      const buckets = [{ id: "Direct", label: "Direct" }, { id: "Inferential", label: "Inferential" }];
      const items = chosen.map((c, i) => ({ id: `qt${i}`, label: c.question }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`qt${i}`] = c.type));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: is the answer stated word for word in the dialogue, or must it be worked out using clues?", explanation: chosen.map((c) => `"${c.question}" — ${c.type}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for answering comprehension questions in order.", "these comprehension steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, COMPREHENSION_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: COMPREHENSION_STEPS.map((s) => s.id), hint: "Start by reading the dialogue, reread the question, decide its type, then find or reason out the answer.", explanation: COMPREHENSION_STEPS.map((s) => s.label).join(" → ") };
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
