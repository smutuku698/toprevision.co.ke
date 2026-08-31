import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 5 "Farm Tools", sub-strand 5.1.1
// "Giving Directions" (LS.5): spelling + constructing sentences to give directions.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VocabEntry { word: string; meaning: string; group: string }

const VOCAB: VocabEntry[] = [
  { word: "jembe", meaning: "a hand tool with a broad blade, used for digging and hoeing", group: "Farm tools" },
  { word: "slasher", meaning: "a tool with a long blade, used to cut grass and weeds", group: "Farm tools" },
  { word: "rake", meaning: "a tool with a row of teeth, used to gather leaves or level soil", group: "Farm tools" },
  { word: "tractor", meaning: "a large motor vehicle used to pull farm equipment", group: "Farm tools" },
  { word: "tool store", meaning: "a place where farm tools are kept", group: "Farm people and places" },
  { word: "farmer", meaning: "a person who grows crops and keeps animals", group: "Farm people and places" },
  { word: "farm", meaning: "land used for growing crops or keeping animals", group: "Farm people and places" },
  { word: "dig", meaning: "to break up and turn over soil, often with a jembe", group: "Farm actions" },
  { word: "plant", meaning: "to place seeds or seedlings in the soil to grow", group: "Farm actions" },
  { word: "harvest", meaning: "to gather a ripe crop from the field", group: "Farm actions" },
  { word: "weed", meaning: "to remove unwanted plants growing among the crops", group: "Farm actions" },
  { word: "sharp", meaning: "having a fine cutting edge that cuts easily", group: "Describing tools" },
  { word: "modern", meaning: "using up-to-date methods or equipment", group: "Describing tools" },
  { word: "traditional", meaning: "used in the customary, long-established way", group: "Describing tools" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "Turn", after: "at the gate to reach the tool store.", answer: "left" },
  { before: "Walk", after: "past the maize field to reach the farm.", answer: "straight" },
  { before: "The tool store is", after: "the farmhouse, just a few steps away.", answer: "beside" },
  { before: "The tractor is parked", after: "the big mango tree.", answer: "behind" },
  { before: "Stand", after: "the gate and you will see the jembe rack.", answer: "in front of" },
  { before: "The rake is kept", after: "the slasher, on the same shelf.", answer: "next to" },
  { before: "Walk", after: "the river to reach the maize field.", answer: "past" },
  { before: "Turn", after: "at the well to find the tool store.", answer: "right" },
  { before: "The farm is", after: "the school, on the other side of the road.", answer: "across from" },
  { before: "The jembe is kept", after: "the tool store's door, on the left.", answer: "near" },
];

const DIRECTION_STEPS: { id: string; label: string }[] = [
  { id: "face", label: "Face the person you are giving directions to" },
  { id: "landmark", label: "Identify a starting point — a landmark both of you know" },
  { id: "order", label: "Give the directions in the order the listener will actually follow them" },
  { id: "words", label: "Use clear direction words such as left, right, straight, near, and beside" },
  { id: "mention", label: "Mention useful landmarks along the way" },
  { id: "check", label: "Check the listener has understood by asking them to repeat the directions" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked how to spell the tool used for digging and hoeing. Which spelling is correct?`, correct: "jembe", wrong: ["jembi", "jenbe", "jemmbe"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must spell the word for gathering a ripe crop from the field. Which spelling is correct?`, correct: "harvest", wrong: ["harvist", "harvast", "havest"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must spell the large motor vehicle used to pull farm equipment. Which spelling is correct?`, correct: "tractor", wrong: ["tracktor", "traktor", "tracter"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "tool store" into a vocabulary group. Which group does it belong to?`, correct: "Farm people and places", wrong: ["Farm tools", "Farm actions", "Describing tools"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `A visitor in ${where} asks ${who} for directions to the tool store. Which response gives the clearest directions?`, correct: `"Walk straight past the maize field, then turn left at the gate — the tool store is beside the farmhouse."`, wrong: ["\"It's over there somewhere.\"", "\"You can't miss it.\"", "\"Just walk around until you find it.\""] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} gives directions but the listener still looks confused. What should ${who} do?`, correct: "Repeat the directions using a clear landmark, and check the listener understood", wrong: ["Assume the listener already understands and walk away", "Speak faster so the listener pays closer attention", "Give a completely different set of directions"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "weed" means when used about farm work. What is the correct meaning?`, correct: "To remove unwanted plants growing among the crops", wrong: ["To place seeds in the soil to grow", "To gather a ripe crop from the field", "To break up and turn over the soil"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} describes a jembe as "sharp." What is ${who} describing?`, correct: "That the jembe has a fine cutting edge that cuts easily", wrong: ["That the jembe is very old", "That the jembe is kept in the tool store", "That the jembe is used to pull other equipment"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} needs to write directions but keeps guessing spellings instead of checking them. What is the likely result?`, correct: "The written directions may contain spelling mistakes that confuse the reader", wrong: ["The directions will automatically be correct", "Spelling has no effect on how clear the directions are", "The reader will always understand regardless of spelling"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must spell the tool with a row of teeth used to gather leaves. Which spelling is correct?`, correct: "rake", wrong: ["raike", "rack", "rayk"] }; },
];

export const farmToolsGivingDirections: Skill = {
  id: "g6-il-ls-farm-tools",
  code: "LS.5",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Farm tools: giving directions",
  description: "Spell farm-tool vocabulary correctly and construct clear sentences that give directions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Check the exact spelling of the farm word carefully, and use clear direction words in the order the listener will follow them.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each farm word with the meaning that explains it.", "each word below with its correct meaning.", "each farm-tools word with the phrase that defines it.", "each word with what it actually means."];
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.word })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.word] = a.word;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.word} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each word below into the correct farm-tools group.", "each vocabulary word into the group it belongs to.", "these farm words into their correct groups.", "each word by whether it names a tool, a place/person, an action, or a description."];
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.group)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.group));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does the word name a tool, a farm person/place, an action, or a description of a tool?", explanation: chosen.map((c) => `"${c.word}" — ${c.group.toLowerCase()}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for giving clear directions in order.", "these direction-giving steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, DIRECTION_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: DIRECTION_STEPS.map((s) => s.id), hint: "Start by facing the listener and finding a shared landmark, then give the steps in order, using clear words, and checking understanding.", explanation: DIRECTION_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the direction word that correctly completes this sentence.", "the missing direction word below.", "the word that best completes these directions.", "the correct word to finish the sentence.", "the direction word that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
