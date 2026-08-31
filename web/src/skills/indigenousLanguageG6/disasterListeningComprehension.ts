import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 3 "Disaster Awareness", sub-strand 3.1.1
// "Listening Comprehension" (LS.3): adjectives of colour/shape/size + vocabulary building.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VocabEntry { word: string; meaning: string; group: string }

const VOCAB: VocabEntry[] = [
  { word: "emergency", meaning: "a serious, unexpected situation needing immediate action", group: "Disaster ideas" },
  { word: "disaster", meaning: "a sudden event that causes great damage or suffering", group: "Disaster ideas" },
  { word: "hazard", meaning: "something that could cause danger or harm", group: "Disaster ideas" },
  { word: "response", meaning: "the action taken to deal with something that has happened", group: "People and actions" },
  { word: "drought", meaning: "a long period with little or no rain", group: "Disaster events" },
  { word: "tremor", meaning: "a shaking movement, often from an earthquake", group: "Disaster events" },
  { word: "floods", meaning: "an overflow of water onto normally dry land", group: "Disaster events" },
  { word: "fire", meaning: "flames that burn and can destroy property", group: "Disaster events" },
  { word: "rescue", meaning: "to save someone from a dangerous situation", group: "People and actions" },
  { word: "locusts", meaning: "swarming insects that destroy crops", group: "Disaster events" },
  { word: "donate", meaning: "to give something freely to help others", group: "Support and safety" },
  { word: "support", meaning: "to help or assist someone in need", group: "Support and safety" },
  { word: "evacuate", meaning: "to leave a dangerous place and move to safety", group: "People and actions" },
];

interface AdjEntry { adjective: string; category: string }

const ADJECTIVES: AdjEntry[] = [
  { adjective: "red", category: "Colour" }, { adjective: "orange", category: "Colour" }, { adjective: "grey", category: "Colour" }, { adjective: "yellow", category: "Colour" },
  { adjective: "round", category: "Shape" }, { adjective: "jagged", category: "Shape" }, { adjective: "curved", category: "Shape" }, { adjective: "square", category: "Shape" },
  { adjective: "huge", category: "Size" }, { adjective: "tiny", category: "Size" }, { adjective: "vast", category: "Size" }, { adjective: "narrow", category: "Size" }, { adjective: "enormous", category: "Size" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The rescue workers wore bright", after: "vests so they could spot each other easily.", answer: "orange" },
  { before: "After the tremor, the wall had a", after: "crack running from top to bottom.", answer: "jagged" },
  { before: "The flood covered a", after: "area of farmland near the river.", answer: "vast" },
  { before: "The emergency exit sign is painted", after: "so it stands out clearly.", answer: "red" },
  { before: "The water tank has a", after: "shape, making it easy to load on a truck.", answer: "round" },
  { before: "The road leading to the shelter was very", after: ", making it hard for large vehicles to pass.", answer: "narrow" },
  { before: "The smoke cloud from the fire looked", after: "against the sky.", answer: "grey" },
  { before: "The locusts formed an", after: "swarm that covered the whole field.", answer: "enormous" },
  { before: "The warning flag flown at the coast was", after: "to signal danger.", answer: "yellow" },
  { before: "The relief tent had a", after: "roof to let rainwater run off easily.", answer: "curved" },
];

const RESPONSE_STEPS: { id: string; label: string }[] = [
  { id: "calm", label: "Stay calm and listen carefully to the instructions being given" },
  { id: "identify", label: "Identify the type of hazard being described" },
  { id: "route", label: "Follow the evacuation route calmly, without pushing others" },
  { id: "assemble", label: "Gather at the designated safe assembly point" },
  { id: "wait", label: "Wait for further instructions from an adult or official" },
  { id: "support", label: "Offer support to anyone who needs help" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears an announcement describing a "vast" flooded area. What does "vast" tell the listener?`, correct: "That the flooded area is very large", wrong: ["That the flooded area is a certain colour", "That the flooded area is shaped like a circle", "That the flooded area is very small"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `In ${where}, ${who} is asked what "evacuate" means after hearing it in a safety recording. What is the correct meaning?`, correct: "To leave a dangerous place and move to safety", wrong: ["To give something freely to help others", "To save someone directly from danger", "To stay exactly where you are"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} must sort the word "rescue" into the correct vocabulary group. Which group does it belong to?`, correct: "People and actions", wrong: ["Disaster events", "Disaster ideas", "Support and safety"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears the description "a huge, jagged crack in the road." Which word describes the SHAPE of the crack?`, correct: `"jagged"`, wrong: [`"huge" — because it describes shape`, `"crack" — because it describes shape`, `"road" — because it describes shape`] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears that locals "donate" blankets after a disaster. What does "donate" mean here?`, correct: "To give something freely to help others", wrong: ["To leave a dangerous place", "To shake violently, like an earthquake", "To destroy something on purpose"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears a recording describe a "tiny" tremor felt by residents. What does "tiny" suggest about the tremor?`, correct: "That the tremor was very small or weak", wrong: ["That the tremor lasted a very long time", "That the tremor was a certain colour", "That the tremor destroyed many buildings"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked how best to assist someone affected by a disaster. What is the most appropriate response?`, correct: "Offer calm, practical support such as helping them reach a safe place or get supplies", wrong: ["Ignore them until an adult arrives, even if help is urgently needed", "Record a video instead of helping", "Assume someone else will help them"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears an emergency alert but keeps talking to a deskmate instead of listening. What is the likely result?`, correct: `${who} may miss important safety instructions and vocabulary needed to respond correctly`, wrong: ["There will be no effect, since alerts always repeat instantly", "It will help catch more details than usual", "It will make the alert finish sooner"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears "drought" and "floods" used in the same passage. What do both words have in common?`, correct: "Both name a type of disaster event related to water", wrong: ["Both name a colour", "Both name a rescue action", "Both name an object used during a disaster"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s teacher in ${where} says a "hazard" is not the same as a "disaster." What is the difference?`, correct: "A hazard is something that could cause harm, while a disaster is the harmful event that has already happened", wrong: ["A hazard always refers to a colour, while a disaster does not", "There is no real difference between the two words", "A hazard only happens after a disaster, never before"] }; },
];

export const disasterListeningComprehension: Skill = {
  id: "g6-il-ls-disaster",
  code: "LS.3",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Disaster awareness: listening comprehension",
  description: "Recognise colour, shape, and size adjectives and disaster-awareness vocabulary in oral texts.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen for exactly what a word describes: is it naming a colour, a shape, a size, or a disaster-related idea?";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each adjective with the category it describes.", "each adjective below with colour, shape, or size.", "each word with the type of description it gives.", "each adjective with its correct category."];
      // One adjective per category, so tokens/targets pair up 1:1 with distinct, unambiguous labels.
      const categories = Array.from(new Set(ADJECTIVES.map((a) => a.category)));
      const chosen = categories.map((cat) => randChoice(rng, ADJECTIVES.filter((a) => a.category === cat)));
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.adjective, label: a.adjective })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.adjective, label: a.category })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.adjective] = a.adjective;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.adjective} — ${a.category}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each word into the correct disaster-vocabulary group.", "each vocabulary word into the group it belongs to.", "these disaster words into their correct groups.", "each word by whether it names an event, an action, an idea, or support."];
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.group)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.group));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does the word name a disaster event, a disaster-related idea, a person's action, or a form of support?", explanation: chosen.map((c) => `"${c.word}" — ${c.group.toLowerCase()}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for responding to an emergency alert in order.", "these response steps into the order they should happen.", "the steps below into a sensible response sequence.", "these steps as they would actually happen during a drill."];
      const items = shuffle(rng, RESPONSE_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: RESPONSE_STEPS.map((s) => s.id), hint: "Start by staying calm and listening, then identify the hazard, evacuate, assemble, wait, and support others.", explanation: RESPONSE_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the adjective that correctly completes this sentence.", "the missing adjective below.", "the word that best describes the object.", "the correct adjective to finish the sentence.", "the adjective that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
