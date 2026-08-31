import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 2 "Environmental Conservation", sub-strand 2.1.1
// "Listening for Information: Active and passive voice" (LS.2). English-medium per shared.ts.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VoicePair { active: string; passive: string }

const PAIRS: VoicePair[] = [
  { active: "The learners planted the trees.", passive: "The trees were planted by the learners." },
  { active: "The factory pollutes the river.", passive: "The river is polluted by the factory." },
  { active: "The community recycles plastic bottles.", passive: "Plastic bottles are recycled by the community." },
  { active: "The rangers protect the forest.", passive: "The forest is protected by the rangers." },
  { active: "Farmers conserve water during the dry season.", passive: "Water is conserved by farmers during the dry season." },
  { active: "The county preserves the wetlands.", passive: "The wetlands are preserved by the county." },
  { active: "The class reuses old bottles for planting.", passive: "Old bottles are reused by the class for planting." },
  { active: "The NGO cleans the riverbank every month.", passive: "The riverbank is cleaned by the NGO every month." },
  { active: "Volunteers reduce waste at the market.", passive: "Waste at the market is reduced by volunteers." },
  { active: "The government protects the national park.", passive: "The national park is protected by the government." },
  { active: "The teacher explains conservation to the class.", passive: "Conservation is explained to the class by the teacher." },
  { active: "Villagers preserve the spring water source.", passive: "The spring water source is preserved by villagers." },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The river", after: "by the factory every day.", answer: "is polluted" },
  { before: "The forest", after: "by the rangers all year round.", answer: "is protected" },
  { before: "Plastic bottles", after: "by the community every week.", answer: "are recycled" },
  { before: "The wetlands", after: "by the county government.", answer: "are preserved" },
  { before: "Water", after: "by farmers during the dry season.", answer: "is conserved" },
  { before: "The trees", after: "by the learners last term.", answer: "were planted" },
  { before: "Old bottles", after: "by the class for planting seedlings.", answer: "are reused" },
  { before: "The national park", after: "by the government.", answer: "is protected" },
  { before: "Litter in the park", after: "by the volunteers yesterday.", answer: "was reduced" },
  { before: "The riverbank", after: "by the NGO every month.", answer: "is cleaned" },
];

const CONVERT_STEPS: { id: string; label: string }[] = [
  { id: "find-object", label: "Find the object of the active sentence — the thing the action is done to" },
  { id: "new-subject", label: "Move that object to the front of the sentence, as the new subject" },
  { id: "choose-be", label: "Choose the correct form of \"to be\" (is/are/was/were) to match the new subject" },
  { id: "past-participle", label: "Add the past participle form of the main verb" },
  { id: "add-by", label: "Add \"by\" followed by the person or thing that originally did the action" },
  { id: "reread", label: "Reread the new sentence to check it still means the same thing" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who} in ${where} hears the sentence "The rangers protect the forest." Is this sentence active or passive voice?`, correct: "Active voice — the subject (rangers) is doing the action", wrong: ["Passive voice — because the forest is mentioned", "Passive voice — because it names an action", "Neither — the sentence has no voice"] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who} in ${where} rewrites "The trees were planted by the learners." into active voice. Which is correct?`, correct: "The learners planted the trees.", wrong: ["The trees planted the learners.", "The learners were planted by the trees.", "Trees plant the learners every year."] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `In a listening exercise in ${where}, ${who} hears "The river is polluted by the factory." Who or what is doing the polluting?`, correct: "The factory", wrong: ["The river", "The community", "No one — the sentence has no doer"] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who} in ${where} must identify the object in the active sentence "The community recycles plastic bottles." What is the object?`, correct: "Plastic bottles", wrong: ["The community", "Recycles", "Bottles and the community together"] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `A classmate in ${where} tells ${who} that "Water is conserved by farmers" is active voice because it names an action. Is the classmate correct?`, correct: "No — it is passive voice, because the subject (water) receives the action instead of doing it", wrong: ["Yes — every sentence with a verb is active voice", "Yes — because farmers is mentioned in the sentence", "No — because it is missing a verb"] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who} in ${where} converts "The forest is protected by the rangers." to active voice. Which form of the verb should be used?`, correct: "protect (rangers protect the forest)", wrong: ["is protected (unchanged)", "protecting", "was protected"] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who}'s group in ${where} listens to instructions and must decide: which of these is written in passive voice?`, correct: "The wetlands are preserved by the county.", wrong: ["The county preserves the wetlands.", "Villagers preserve the spring.", "The class reuses old bottles."] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who} in ${where} is asked why a report about conservation efforts might use passive voice, such as "The national park is protected by the government." What is one reason?`, correct: "To put the focus on the national park being protected, rather than on who is doing the protecting", wrong: ["Because passive voice is always shorter to write", "Because active voice cannot be used in reports", "Because passive voice avoids using any verbs"] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who} in ${where} keeps chatting with a deskmate while a recording about active and passive voice plays. What is the likely effect on ${who}'s understanding?`, correct: `${who} will likely miss key examples needed to tell active and passive sentences apart`, wrong: ["There will be no effect, since the recording repeats every word", "It will help catch more examples than usual", "It will make the lesson finish sooner"] };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return { prompt: `${who} in ${where} must convert "Volunteers reduce waste at the market." to passive voice. Which is correct?`, correct: "Waste at the market is reduced by volunteers.", wrong: ["Waste reduces volunteers at the market.", "The market is reduced by volunteers.", "Volunteers are reduced by waste at the market."] };
  },
];

export const environmentActivePassiveVoice: Skill = {
  id: "g6-il-ls-environment",
  code: "LS.2",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Environmental conservation: active and passive voice",
  description: "Identify and convert between active and passive voice in sentences about environmental conservation.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Active voice: the subject does the action. Passive voice: the subject receives the action, and the doer often appears after \"by\".";

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = [
        "each active sentence with its passive equivalent.",
        "each sentence below with its matching voice change.",
        "each active-voice sentence to its passive-voice version.",
        "each sentence with the sentence that means the same thing in the other voice.",
      ];
      const chosen = shuffle(rng, PAIRS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `a${i}`, label: p.active })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `a${i}`, label: p.passive })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`a${i}`] = `a${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((p) => `"${p.active}" → "${p.passive}"`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each sentence into Active voice or Passive voice.", "each sentence below by its voice.", "these sentences into the correct voice group.", "each sentence by whether the subject does or receives the action."];
      const pool = shuffle(rng, PAIRS.flatMap((p) => [{ text: p.active, group: "Active voice" }, { text: p.passive, group: "Passive voice" }])).slice(0, 8);
      const buckets = [{ id: "Active voice", label: "Active voice" }, { id: "Passive voice", label: "Passive voice" }];
      const items = pool.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((c, i) => (correctBucket[`s${i}`] = c.group));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: does the subject at the start of the sentence do the action, or receive it?", explanation: pool.map((c) => `"${c.text}" — ${c.group}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for converting an active sentence to passive voice.", "these steps into the order you would follow.", "the steps below into a sensible sequence.", "these steps as you would actually apply them."];
      const items = shuffle(rng, CONVERT_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: CONVERT_STEPS.map((s) => s.id), hint: "Start with the object of the active sentence, then build the passive sentence around it.", explanation: CONVERT_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the correct passive-voice verb form.", "the missing words below.", "the verb form that completes this passive sentence.", "the correct form to finish the sentence.", "the words that best fit the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
