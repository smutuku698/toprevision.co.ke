import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each type of divorce to its description.",
  "Pair each type of divorce with its description.",
  "Connect each type below to its description.",
  "Match each type of divorce to what it involves.",
  "Link each type of divorce to its correct description.",
  "Choose the correct description for each type of divorce.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each situation as at-Talaq or Khul'u.",
  "Group each situation under at-Talaq or Khul'u.",
  "Decide whether each situation is at-Talaq or Khul'u, and sort it there.",
  "Sort each situation into the correct category: at-Talaq, or Khul'u.",
  "Place each situation into the right bucket — at-Talaq, or Khul'u.",
  "Categorise each situation as at-Talaq or Khul'u.",
];

const ORDER_PROMPTS = [
  "Arrange the stages of at-Talaq in the correct order.",
  "Put the stages of at-Talaq into the correct order.",
  "Sequence these stages of at-Talaq correctly.",
  "Order these stages of at-Talaq as they actually happen.",
  "Sort these stages of at-Talaq into their correct order.",
  "Arrange these stages of at-Talaq from first to last.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Which term completes this sentence?",
  "Complete the sentence with the correct term.",
  "Work out the missing term below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which term belongs in the blank?",
];

const TYPES: { type: string; description: string }[] = [
  { type: "At-Talaq", description: "Divorce initiated by the husband, pronounced according to Islamic rules" },
  { type: "Khul'u", description: "Divorce initiated by the wife, typically by returning her dowry (mahr) to the husband" },
];

const SCENARIO_ITEMS = [
  { text: "A husband pronounces the words of divorce to end the marriage", type: "At-Talaq" },
  { text: "A wife who is unhappy in the marriage offers to return her mahr to secure a divorce", type: "Khul'u" },
  { text: "The husband initiates the separation according to Islamic procedure", type: "At-Talaq" },
  { text: "The wife seeks release from the marriage by giving up her dowry", type: "Khul'u" },
] as const;

const ORDER_ITEMS = [
  { id: "first", label: "The husband pronounces the first Talaq; the iddah (waiting period) begins and it is revocable" },
  { id: "second", label: "If not reconciled, a second Talaq may be pronounced, still revocable during iddah" },
  { id: "third", label: "If a third Talaq is pronounced, the divorce becomes final and irrevocable" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is 'at-Talaq' in Islamic teaching?",
    correct: "Divorce initiated by the husband",
    distractors: ["Divorce initiated by the wife", "A type of marriage contract", "A waiting period observed by a widow"],
  },
  {
    q: "What does the wife typically do to obtain a Khul'u?",
    correct: "Return her dowry (mahr) to the husband",
    distractors: ["Pay a fine to the court", "Wait one full year with no action", "Ask her father to pronounce the divorce"],
  },
  {
    q: "What is one effect of divorce on society, according to Islamic teaching?",
    correct: "It can affect the stability and wellbeing of children and the wider family",
    distractors: ["It always strengthens family unity", "It has no impact on children", "It is celebrated as a positive event by the community"],
  },
  {
    q: "Why is divorce described as the last resort in marital conflict?",
    correct: "Because Islam encourages reconciliation first, and divorce is only used once that has failed",
    distractors: ["Because divorce is the first option a couple should consider", "Because Islam forbids divorce completely", "Because only the wife may ever request separation"],
  },
];

export const typesOfDivorce: Skill = {
  id: "g8-ire-mu-types-of-divorce",
  code: "MU.2",
  subjectId: "ire",
  strandId: "g8-ire-mu",
  grade: 8,
  title: "Types of Divorce: At-Talaq and Khul'u",
  description: "At-Talaq (husband-initiated divorce) and Khul'u (wife-initiated divorce), and their effects on society.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, TYPES.map((t) => ({ id: t.type, label: t.type })));
      const targets = shuffle(rng, TYPES.map((t) => ({ id: t.type, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of TYPES) correctMap[t.type] = t.type;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "One type is initiated by the husband, the other by the wife.",
        explanation: TYPES.map((t) => `${t.type} — ${t.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIO_ITEMS);
      const buckets = TYPES.map((t) => ({ id: t.type, label: t.type }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Look at who is initiating the divorce and whether the dowry is being returned.",
        explanation: chosen.map((c) => `"${c.text}" — an example of ${c.type}.`).join(" "),
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
        hint: "The first two pronouncements are revocable during iddah; the third makes the divorce final.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "In Khul'u, the wife typically returns her",
        after: "(bridal gift) to the husband as part of ending the marriage.",
        correctAnswer: "mahr",
        acceptedAnswers: ["dowry"],
        inputMode: "text",
        hint: "This is the gift the husband gave the wife at the start of the marriage.",
        explanation: "In Khul'u, the wife typically returns her mahr (dowry) to the husband to secure the divorce.",
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
      hint: "At-Talaq is husband-initiated divorce; Khul'u is wife-initiated, typically involving return of the mahr.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
