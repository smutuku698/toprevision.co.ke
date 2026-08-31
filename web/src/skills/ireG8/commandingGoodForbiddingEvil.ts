import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each way of changing a wrong to its description.",
  "Pair each way of changing a wrong with its description.",
  "Connect each method below to its description.",
  "Match each method to what it involves.",
  "Link each way of changing a wrong to its description.",
  "Choose the correct description for each way of changing a wrong.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each action as commanding good or forbidding evil.",
  "Group each action under commanding good or forbidding evil.",
  "Decide whether each action is commanding good or forbidding evil, and sort it there.",
  "Sort each action into the correct category: commanding good, or forbidding evil.",
  "Place each action into the right bucket — commanding good, or forbidding evil.",
  "Categorise each action as commanding good or forbidding evil.",
];

const ORDER_PROMPTS = [
  "Arrange the correct order of response to a wrong, according to the Hadith on commanding good and forbidding evil.",
  "Put the correct order of response to a wrong into place, as the Hadith describes.",
  "Sequence the correct response to a wrong, as the Hadith on commanding good and forbidding evil describes it.",
  "Order these responses to a wrong as the Hadith describes them.",
  "Sort these responses to a wrong into the order the Hadith gives.",
  "Arrange these responses to a wrong in the order taught by the Hadith.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const METHODS: { method: string; description: string }[] = [
  { method: "With the hand", description: "Actively changing or stopping a wrong when a person has the ability and authority to do so" },
  { method: "With the tongue", description: "Speaking up to advise or correct a wrong when unable to change it by action" },
  { method: "With the heart", description: "Disliking and rejecting a wrong inwardly when unable to change it by hand or tongue — the weakest level of faith" },
];

const SORT_ITEMS = [
  { text: "Encouraging a friend to pray on time", bucket: "commanding" },
  { text: "Reminding classmates to help the needy", bucket: "commanding" },
  { text: "Advising a friend to stop cheating in an exam", bucket: "forbidding" },
  { text: "Warning a sibling against telling lies", bucket: "forbidding" },
  { text: "Inviting neighbours to join congregational prayer", bucket: "commanding" },
] as const;
const SORT_LABEL: Record<string, string> = { commanding: "An example of commanding good", forbidding: "An example of forbidding evil" };

const ORDER_ITEMS = [
  { id: "hand", label: "Try to change the wrong by hand (action), if able" },
  { id: "tongue", label: "If unable, speak up against it with the tongue" },
  { id: "heart", label: "If unable to do either, reject it in the heart — the weakest level of faith" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should a Muslim command good and forbid evil?",
    correct: "To fulfil Allah's commandment and help build a morally upright society",
    distractors: ["Only to gain popularity among people", "Because it is optional and has no reward", "To control other people's private lives with force"],
  },
  {
    q: "What attitude should a Muslim have when commanding good or forbidding evil?",
    correct: "Wisdom, gentleness, and patience, avoiding harshness",
    distractors: ["Harsh criticism and public shaming", "Complete silence about any wrongdoing", "Anger and forceful confrontation at all times"],
  },
  {
    q: "According to the Hadith on changing wrong, what should a Muslim do if they cannot stop a wrong by hand or tongue?",
    correct: "Reject it in their heart, though this is the weakest level of faith",
    distractors: ["Ignore it and consider it acceptable", "Join in with the wrong", "Assume it is no longer a wrong"],
  },
  {
    q: "How can Muslims today command good and forbid evil in their communities?",
    correct: "Through gentle advice, good example, and speaking up with knowledge and patience",
    distractors: ["By avoiding all involvement in community matters", "By using violence to stop any wrongdoing", "By publicly humiliating wrongdoers"],
  },
];

export const commandingGoodForbiddingEvil: Skill = {
  id: "g8-ire-ak-commanding-good-forbidding-evil",
  code: "AK.1",
  subjectId: "ire",
  strandId: "g8-ire-ak",
  grade: 8,
  title: "Commanding Good and Forbidding Evil",
  description: "Ways of commanding good and forbidding evil, and applying wisdom when doing so.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.method, label: m.method })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.method, label: m.description })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.method] = m.method;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "A Muslim should try to change a wrong by hand, then tongue, then at minimum reject it in their heart.",
        explanation: METHODS.map((m) => `${m.method} — ${m.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SORT_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: SORT_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Commanding good encourages a right action; forbidding evil discourages a wrong one.",
        explanation: chosen.map((c) => `"${c.text}" — ${SORT_LABEL[c.bucket].toLowerCase()}.`).join(" "),
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
        hint: "Act first if you can, then speak if you cannot act, then at minimum reject it in your heart.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "If a Muslim cannot stop a wrong with their hand or tongue, they should at least reject it in their",
        after: "— though this is the weakest level of faith.",
        correctAnswer: "heart",
        inputMode: "text",
        hint: "This is the minimum, inward response when action or speech is not possible.",
        explanation: "According to Hadith, if a Muslim cannot change a wrong by hand or tongue, they should reject it in their heart, though this is the weakest level of faith.",
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
      hint: "Commanding good and forbidding evil should be done with wisdom, gentleness, and patience — by hand, tongue, or at minimum the heart.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
