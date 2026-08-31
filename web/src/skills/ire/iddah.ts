import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each situation to the length of iddah observed.",
  "Pair each situation with the correct length of iddah.",
  "Connect each situation below to its iddah period.",
  "Match each situation to how long its iddah lasts.",
  "Link each situation to the correct waiting period.",
  "Choose the correct length of iddah for each situation.",
];

const FILL_PROMPTS = [
  "Fill in the missing number.",
  "Which number completes this fact?",
  "Work out the missing number below.",
  "Complete the sentence with the correct number.",
  "Fill in the blank with the correct number.",
  "Which number belongs in the blank?",
];

const SITUATIONS: { situation: string; duration: string }[] = [
  { situation: "A divorced woman (not pregnant)", duration: "Three menstrual cycles" },
  { situation: "A widow", duration: "Four months and ten days" },
  { situation: "A pregnant woman (divorced or widowed)", duration: "Until she delivers her child" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is 'iddah' in Islam?",
    correct: "A waiting period a divorced or widowed woman observes before she may remarry",
    distractors: ["A daily prayer said only by widows", "A type of Islamic marriage contract", "A festival celebrated once a year"],
  },
  {
    q: "What is one reason Islam prescribes iddah?",
    correct: "To confirm whether the woman is pregnant, so the child's parentage is clear",
    distractors: ["To punish the woman for the divorce", "To prevent her from ever remarrying", "To test her patience for no other reason"],
  },
  {
    q: "For a widow, what is the general length of iddah in Islam?",
    correct: "Four months and ten days",
    distractors: ["One week", "Exactly one year", "There is no waiting period for a widow"],
  },
  {
    q: "What does observing iddah allow for, in the case of a divorce?",
    correct: "A period during which reconciliation between the couple may still be possible",
    distractors: ["Immediate remarriage the next day", "Automatic annulment of the marriage contract", "A public trial of the divorce"],
  },
];

export const iddah: Skill = {
  id: "ire-mu-iddah",
  code: "MU.2",
  subjectId: "ire",
  strandId: "ire-muamalat",
  grade: 9,
  title: "Iddah",
  description: "Answer questions about the waiting period of iddah for a divorcee or widow in Islam.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "match", "fill"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, SITUATIONS.map((s) => ({ id: s.situation, label: s.situation })));
      const targets = shuffle(rng, SITUATIONS.map((s) => ({ id: s.situation, label: s.duration })));
      const correctMap: Record<string, string> = {};
      for (const s of SITUATIONS) correctMap[s.situation] = s.situation;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The length of iddah depends on the woman's situation — divorced, widowed, or pregnant.",
        explanation: SITUATIONS.map((s) => `${s.situation} — ${s.duration.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "A widow's iddah lasts four months and",
        after: "days.",
        correctAnswer: "10",
        acceptedAnswers: ["ten"],
        inputMode: "numeric",
        hint: "The full period is stated as 'four months and ten days'.",
        explanation: "A widow's iddah lasts four months and ten days.",
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
      hint: "Iddah is a waiting period observed after divorce or widowhood, with rules that protect clarity of parentage and allow time for reconciliation.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
