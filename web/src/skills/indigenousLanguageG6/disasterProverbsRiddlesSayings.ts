import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 3 "Disaster Awareness", sub-strand 3.2.1
// "Reading for Information" (R.3): proverbs, riddles, sayings. Only genuine, real English
// proverbs/riddles are used here — none are invented.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ProverbEntry { proverb: string; meaning: string; category: string }

const PROVERBS: ProverbEntry[] = [
  { proverb: "A stitch in time saves nine.", meaning: "Dealing with a problem early prevents it from becoming worse.", category: "Preparedness" },
  { proverb: "Forewarned is forearmed.", meaning: "Knowing about a danger in advance helps you prepare for it.", category: "Preparedness" },
  { proverb: "Prevention is better than cure.", meaning: "It is better to stop a problem before it happens than to fix it afterward.", category: "Preparedness" },
  { proverb: "Look before you leap.", meaning: "Think carefully before acting.", category: "Preparedness" },
  { proverb: "Don't put all your eggs in one basket.", meaning: "Don't risk everything on a single plan.", category: "Preparedness" },
  { proverb: "Many hands make light work.", meaning: "A task becomes easier when many people help.", category: "Teamwork and support" },
  { proverb: "United we stand, divided we fall.", meaning: "People are stronger when they work together.", category: "Teamwork and support" },
  { proverb: "A friend in need is a friend indeed.", meaning: "A true friend helps you when you are in trouble.", category: "Teamwork and support" },
  { proverb: "Actions speak louder than words.", meaning: "What a person does matters more than what they say.", category: "Teamwork and support" },
  { proverb: "A problem shared is a problem halved.", meaning: "Talking about a problem with others makes it feel lighter.", category: "Teamwork and support" },
];

interface RiddleEntry { riddle: string; answer: string }

const RIDDLES: RiddleEntry[] = [
  { riddle: "I give light in the dark, but I have no flame. Press my switch and I come alive. What am I?", answer: "a torch" },
  { riddle: "I am small and loud, carried on a string. Blow into me to call for help. What am I?", answer: "a whistle" },
  { riddle: "I am a box full of bandages and medicine, kept ready for injuries. What am I?", answer: "a first-aid kit" },
  { riddle: "I spray foam or powder to put out flames. What am I?", answer: "a fire extinguisher" },
  { riddle: "I keep you warm on a cold night, often handed out during an emergency. What am I?", answer: "a blanket" },
  { riddle: "I have no legs, yet I carry news and warnings into every home. What am I?", answer: "a radio" },
];

interface FillEntry { before: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "A stitch in time", answer: "saves nine" },
  { before: "Forewarned is", answer: "forearmed" },
  { before: "Prevention is better than", answer: "cure" },
  { before: "Look before you", answer: "leap" },
  { before: "Don't put all your eggs in one", answer: "basket" },
  { before: "Many hands make", answer: "light work" },
  { before: "United we stand, divided we", answer: "fall" },
  { before: "A friend in need is a friend", answer: "indeed" },
  { before: "Actions speak louder than", answer: "words" },
  { before: "A problem shared is a problem", answer: "halved" },
];

const INTERPRET_STEPS: { id: string; label: string }[] = [
  { id: "read", label: "Read the proverb exactly as written" },
  { id: "images", label: "Think about what each key word or image represents" },
  { id: "situation", label: "Consider the situation the proverb is usually used in" },
  { id: "own-words", label: "State the proverb's lesson in your own words" },
  { id: "check", label: "Check your explanation matches how people actually use the proverb" },
  { id: "compare", label: "Compare it with a similar proverb you already know" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); const r = randChoice(rng, RIDDLES); const others = RIDDLES.filter((x) => x.answer !== r.answer).map((x) => x.answer); return { prompt: `${who} in ${where} solves this riddle: "${r.riddle}" What is the answer?`, correct: r.answer, wrong: shuffle(rng, others).slice(0, 3) }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the proverb "Forewarned is forearmed." What lesson does it teach about disaster awareness?`, correct: "Knowing about a danger in advance helps you prepare for it", wrong: ["Danger cannot be predicted, so there is no point preparing", "Warnings should always be ignored", "Only adults need to know about warnings"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s class in ${where} discusses "Many hands make light work" after a community clean-up. What is this proverb's lesson?`, correct: "A task becomes easier when many people help", wrong: ["Only one person should ever do a task", "Hard work should always be avoided", "Tasks are always difficult, no matter how many people help"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears "Don't put all your eggs in one basket" used while planning for an emergency. What does it mean here?`, correct: "Don't risk everything on a single plan — have backup options too", wrong: ["Always carry eggs during an emergency", "Never make any plans at all", "Baskets are the safest place to store food"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must sort "A friend in need is a friend indeed" into a proverb category. Which category fits best?`, correct: "Teamwork and support", wrong: ["Preparedness", "Neither category", "Both equally, with no clear fit"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must sort "Look before you leap" into a proverb category. Which category fits best?`, correct: "Preparedness", wrong: ["Teamwork and support", "Neither category", "Both equally, with no clear fit"] }; },
  (rng) => { const who = name(rng), where = place(rng); const r = randChoice(rng, RIDDLES); const others = RIDDLES.filter((x) => x.answer !== r.answer).map((x) => x.answer); return { prompt: `${who}'s group in ${where} is given this riddle to solve together: "${r.riddle}" What is the answer?`, correct: r.answer, wrong: shuffle(rng, others).slice(0, 3) }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears "United we stand, divided we fall" during a disaster-response drill. What is the lesson?`, correct: "People are stronger when they work together", wrong: ["It is always safer to act completely alone", "Standing still is safer than moving", "Only leaders should ever act during an emergency"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} says a proverb's meaning without checking whether it matches how people actually use it. What might go wrong?`, correct: `${who} may give an inaccurate explanation of the proverb`, wrong: ["Nothing — every guess about a proverb's meaning is correct", "The proverb will change its wording automatically", "The listener will always agree regardless"] }; },
  (rng) => { const who = name(rng), where = place(rng); const r = randChoice(rng, RIDDLES); const others = RIDDLES.filter((x) => x.answer !== r.answer).map((x) => x.answer); return { prompt: `During disaster-preparedness week in ${where}, ${who} is asked to solve this riddle: "${r.riddle}" What is the answer?`, correct: r.answer, wrong: shuffle(rng, others).slice(0, 3) }; },
];

export const disasterProverbsRiddlesSayings: Skill = {
  id: "g6-il-r-disaster",
  code: "R.3",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Disaster awareness: proverbs, riddles and sayings",
  description: "Identify and interpret proverbs, riddles, and sayings related to preparedness, caution, and community support.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Think about the situation a proverb or riddle is normally used in, not just its literal words.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each proverb with its meaning.", "each proverb below with what it actually teaches.", "each saying with the lesson it explains.", "each proverb with its correct meaning."];
      const chosen = shuffle(rng, PROVERBS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `p${i}`, label: a.proverb })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `p${i}`, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.proverb}" — ${a.meaning}`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each proverb below by its category.", "each proverb into the group it fits best.", "these proverbs into their correct categories.", "each proverb by whether it is about preparedness or teamwork."];
      const chosen = shuffle(rng, PROVERBS).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.category)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `pr${i}`, label: c.proverb }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`pr${i}`] = c.category));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: is this proverb mainly about getting ready ahead of time, or about people helping each other?", explanation: chosen.map((c) => `"${c.proverb}" — ${c.category}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for interpreting a proverb's meaning in order.", "these interpretation steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, INTERPRET_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: INTERPRET_STEPS.map((s) => s.id), hint: "Start by reading the proverb, think about its images, consider its situation, then explain and check it.", explanation: INTERPRET_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the proverb with", "Choose and write", "Supply"];
      const CLOSERS = ["the missing words that finish this proverb.", "the rest of this proverb below.", "the words that correctly complete the proverb.", "the correct ending for the proverb.", "the words that best fit the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: "", correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer}.` };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
