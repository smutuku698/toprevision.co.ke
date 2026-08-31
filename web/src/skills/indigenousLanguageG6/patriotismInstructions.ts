import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 9 "Patriotism", sub-strand 9.1.1
// "Listening for Information: Instructions" (LS.9): responding to instructions + verbs + adverbs.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VocabEntry { word: string; meaning: string; group: string }

const VOCAB: VocabEntry[] = [
  { word: "patriot", meaning: "a person who loves and strongly supports their country", group: "People and symbols" },
  { word: "country", meaning: "a nation with its own government and land", group: "People and symbols" },
  { word: "community", meaning: "a group of people living together in the same area", group: "People and symbols" },
  { word: "flag", meaning: "a piece of cloth with a design that represents a country", group: "People and symbols" },
  { word: "leaders", meaning: "people who guide or govern a country or group", group: "People and symbols" },
  { word: "peace", meaning: "freedom from conflict or disturbance", group: "Ideas and actions" },
  { word: "unity", meaning: "the state of being joined together as one", group: "Ideas and actions" },
  { word: "love", meaning: "a deep affection or care for someone or something", group: "Ideas and actions" },
  { word: "build", meaning: "to construct or develop something", group: "Ideas and actions" },
  { word: "betray", meaning: "to be disloyal to someone or something, breaking their trust", group: "Ideas and actions" },
];

interface VerbAdverb { sentence: string; verb: string; adverb: string }

const INSTRUCTIONS: VerbAdverb[] = [
  { sentence: "Sing the national anthem proudly.", verb: "sing", adverb: "proudly" },
  { sentence: "Protect your country's flag respectfully.", verb: "protect", adverb: "respectfully" },
  { sentence: "Build unity in your community peacefully.", verb: "build", adverb: "peacefully" },
  { sentence: "Honour your leaders faithfully.", verb: "honour", adverb: "faithfully" },
  { sentence: "Serve your country loyally.", verb: "serve", adverb: "loyally" },
  { sentence: "Vote for your leaders wisely.", verb: "vote", adverb: "wisely" },
  { sentence: "Defend your community bravely.", verb: "defend", adverb: "bravely" },
  { sentence: "Share patriotic songs joyfully.", verb: "share", adverb: "joyfully" },
  { sentence: "Promote unity sincerely.", verb: "promote", adverb: "sincerely" },
  { sentence: "Support peace initiatives actively.", verb: "support", adverb: "actively" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "Sing the national anthem", after: "during the assembly.", answer: "proudly" },
  { before: "Protect your country's flag", after: "at all times.", answer: "respectfully" },
  { before: "Build unity in your community", after: "and without conflict.", answer: "peacefully" },
  { before: "Honour your leaders", after: "by following just laws.", answer: "faithfully" },
  { before: "Serve your country", after: "wherever you are needed.", answer: "loyally" },
  { before: "Vote for your leaders", after: "after learning about their plans.", answer: "wisely" },
  { before: "Defend your community", after: "when it faces danger.", answer: "bravely" },
  { before: "Share patriotic songs", after: "with younger learners.", answer: "joyfully" },
  { before: "Promote unity", after: "in everything you do.", answer: "sincerely" },
  { before: "Support peace initiatives", after: "in your school and community.", answer: "actively" },
];

const RESPOND_STEPS: { id: string; label: string }[] = [
  { id: "listen", label: "Listen attentively to the full instruction" },
  { id: "verb", label: "Identify the verb — the action being asked for" },
  { id: "adverb", label: "Identify any adverb describing how to do it" },
  { id: "carry-out", label: "Carry out the action exactly as instructed" },
  { id: "check", label: "Check your action matches both the verb and the adverb" },
  { id: "clarify", label: "Ask for clarification if any part was unclear" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears the instruction "Sing the national anthem proudly." Which word is the VERB?`, correct: "sing", wrong: ["proudly", "national", "anthem"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears "Protect your country's flag respectfully." Which word tells HOW to protect the flag?`, correct: "respectfully", wrong: ["protect", "country's", "flag"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is asked what "unity" means after hearing it in a patriotic speech. What is the correct meaning?`, correct: "The state of being joined together as one", wrong: ["Freedom from conflict or disturbance", "A deep affection or care for someone", "A person who loves their country"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} sorts "leaders" into a vocabulary group. Which group does it belong to?`, correct: "People and symbols", wrong: ["Ideas and actions", "None of these groups", "Both groups equally"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears "Vote for your leaders wisely." but only follows the verb, ignoring the adverb. What has ${who} missed?`, correct: "The instruction to vote thoughtfully, using good judgement", wrong: ["The instruction to vote at all", "The instruction to attend the vote", "Nothing — the adverb does not change the meaning"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} is told what "betray" means. Which explanation is correct?`, correct: "To be disloyal to someone or something, breaking their trust", wrong: ["To construct or develop something", "To guide or govern a country", "To love and strongly support one's country"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears "Defend your community bravely." What does "bravely" describe?`, correct: "How the defending should be done", wrong: ["Who should do the defending", "When the defending should happen", "Where the defending should happen"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} keeps chatting with a deskmate while a patriotic instruction is being read aloud. What is the likely effect?`, correct: `${who} may miss part of the verb or adverb needed to follow the instruction correctly`, wrong: ["There will be no effect, since instructions are always repeated instantly", "It will help catch the instruction faster", "It will make the instruction finish sooner"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} hears "Promote unity sincerely." What does the adverb "sincerely" add to the instruction?`, correct: "That the promoting of unity should be done honestly and genuinely", wrong: ["That unity should be promoted quickly", "That unity should be promoted loudly", "That unity should only be promoted once"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} must decide whether "country" names a person, a place, or an idea. Which is it?`, correct: "A place — a nation with its own government and land", wrong: ["A person who governs a nation", "An idea about freedom from conflict", "An action, like building or serving"] }; },
];

export const patriotismInstructions: Skill = {
  id: "g6-il-ls-patriotism",
  code: "LS.9",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Patriotism: listening for instructions",
  description: "Identify verbs and adverbs in spoken instructions about patriotism, and respond to them correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen for the verb (the action) and any adverb (how it should be done) in the instruction before responding.";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each instruction with the adverb it uses.", "each sentence below with its adverb.", "each patriotism instruction with the word that tells HOW to do it.", "each instruction with its correct adverb."];
      const chosen = shuffle(rng, INSTRUCTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `i${i}`, label: a.sentence })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `i${i}`, label: a.adverb })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`i${i}`] = `i${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.sentence}" — adverb: ${a.adverb}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each word below into the correct patriotism-vocabulary group.", "each vocabulary word into the group it belongs to.", "these patriotism words into their correct groups.", "each word by whether it names a person/symbol or an idea/action."];
      const chosen = shuffle(rng, VOCAB).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.group)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.group));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does the word name a person or symbol of patriotism, or an idea or action related to it?", explanation: chosen.map((c) => `"${c.word}" — ${c.group.toLowerCase()}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for responding to a spoken instruction in order.", "these response steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, RESPOND_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: RESPOND_STEPS.map((s) => s.id), hint: "Start by listening carefully, identify the verb and adverb, act, check, and clarify if needed.", explanation: RESPOND_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the adverb that correctly completes this instruction.", "the missing adverb below.", "the word that tells HOW the action should be done.", "the correct adverb to finish the instruction.", "the adverb that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
