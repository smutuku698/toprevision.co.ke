import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each of the four things a servant will be questioned about to what they will be asked.",
  "Pair each of the four things a servant is questioned about with what they will be asked.",
  "Connect each item below to what the servant will be asked about it.",
  "Match each of the four things to the question asked about it.",
  "Link each accountability item to what a servant will be asked.",
  "Choose the correct question for each of the four accountability items.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as coming from the Hadith on accountability or the Hadith on respect for authority.",
  "Group each statement under the Hadith on accountability or the Hadith on respect for authority.",
  "Decide whether each statement comes from the accountability Hadith or the authority Hadith, and sort it there.",
  "Sort each statement into the correct Hadith: accountability, or respect for authority.",
  "Place each statement into the right bucket — accountability, or respect for authority.",
  "Categorise each statement as from the Hadith on accountability or on respect for authority.",
];

const ORDER_PROMPTS = [
  "Arrange the four things a servant will be questioned about, in the order they are named in the Hadith.",
  "Put the four things a servant will be questioned about into the order named in the Hadith.",
  "Sequence these four accountability items as the Hadith names them.",
  "Order these four things as they are named in the Hadith on accountability.",
  "Sort these four items into the order the Hadith names them.",
  "Arrange these accountability items in the order given in the Hadith.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const ACCOUNTABILITY_ITEMS: { item: string; question: string }[] = [
  { item: "Lifetime", question: "How he spent it" },
  { item: "Youth", question: "How he used it" },
  { item: "Wealth", question: "How he earned it and how he spent it" },
  { item: "Knowledge", question: "What he did with it" },
];

const SORT_ITEMS = [
  { text: "A servant will be asked how he spent his lifetime", hadith: "accountability" },
  { text: "A servant will be asked what he did with his knowledge", hadith: "accountability" },
  { text: "It is an obligation on a Muslim to listen to and obey the leader", hadith: "authority" },
  { text: "There is no obedience if the leader commands disobedience to Allah", hadith: "authority" },
  { text: "A servant will be asked how he earned and spent his wealth", hadith: "accountability" },
] as const;
const HADITH_LABEL: Record<string, string> = { accountability: "From the Hadith on accountability", authority: "From the Hadith on respect for authority" };

const ORDER_ITEMS = [
  { id: "lifetime", label: "How he spent his lifetime" },
  { id: "youth", label: "How he used his youth" },
  { id: "wealth", label: "How he earned his wealth and how he spent it" },
  { id: "knowledge", label: "What he did with his knowledge" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "According to the Hadith on accountability (At-Tirmidhi), when will a servant's feet not move on the Day of Resurrection?",
    correct: "Until he is questioned about his lifetime, youth, wealth, and knowledge",
    distractors: ["Until he recites the whole Qur'an", "Until every other person has been judged", "Until he names all the prophets"],
  },
  {
    q: "According to the Hadith on respect for authority, when is a Muslim not obliged to obey a leader?",
    correct: "When the leader commands something that involves disobedience to Allah",
    distractors: ["Whenever the Muslim personally disagrees with the leader", "Only if the leader is not a Muslim", "A Muslim must always obey a leader with no exception"],
  },
  {
    q: "What lesson about intention and responsibility does the accountability Hadith teach?",
    correct: "That every Muslim will personally answer for how they used their time, wealth, and knowledge",
    distractors: ["That only wealthy people will be questioned on the Day of Judgement", "That accountability only applies to religious leaders", "That knowledge cannot be questioned about"],
  },
  {
    q: "Why is obeying a leader described as an obligation in Islam?",
    correct: "Because it maintains order in the community, as long as the leader does not command disobedience to Allah",
    distractors: ["Because leaders are considered infallible", "Because disobedience to a leader is never allowed under any circumstance", "Because it replaces obedience to Allah"],
  },
];

export const selectedHadith: Skill = {
  id: "g8-ire-ha-selected-hadith",
  code: "HA.2",
  subjectId: "ire",
  strandId: "g8-ire-ha",
  grade: 8,
  title: "Selected Hadith: Accountability and Respect for Authority",
  description: "The Hadith on accountability for one's lifetime, youth, wealth, and knowledge, and the Hadith on obeying a leader.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, ACCOUNTABILITY_ITEMS.map((a) => ({ id: a.item, label: a.item })));
      const targets = shuffle(rng, ACCOUNTABILITY_ITEMS.map((a) => ({ id: a.item, label: a.question })));
      const correctMap: Record<string, string> = {};
      for (const a of ACCOUNTABILITY_ITEMS) correctMap[a.item] = a.item;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The Hadith on accountability names four things: lifetime, youth, wealth, and knowledge.",
        explanation: ACCOUNTABILITY_ITEMS.map((a) => `${a.item} — ${a.question.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SORT_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.hadith))).map((b) => ({ id: b, label: HADITH_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `h${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`h${i}`] = c.hadith));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "One Hadith lists what a servant will be questioned about; the other is about obeying a leader.",
        explanation: chosen.map((c) => `"${c.text}" — ${HADITH_LABEL[c.hadith].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_ITEMS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_ITEMS.map((s) => s.id),
        hint: "The Hadith lists: lifetime, then youth, then wealth (earned and spent), then knowledge.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "According to Hadith, a Muslim must obey their leader unless commanded to disobey",
        after: ".",
        correctAnswer: "Allah",
        inputMode: "text",
        hint: "There is no obedience to a created being in disobedience to the Creator.",
        explanation: "Obedience to a leader is an obligation on a Muslim, unless the leader commands disobedience to Allah — in which case there is no obedience.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "These two Hadith teach personal accountability before Allah, and lawful obedience to those in authority.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
