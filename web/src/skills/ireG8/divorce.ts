import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each term to its meaning in resolving marital conflict.",
  "Pair each term with its meaning in resolving marital conflict.",
  "Connect each term below to what it means.",
  "Match each term to the meaning that fits it.",
  "Link each term with the correct definition.",
  "Choose the correct meaning for each term below.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a cause of marital conflict or a step in resolving it.",
  "Group each statement under a cause of marital conflict or a step in resolving it.",
  "Decide whether each statement is a cause or a resolution step, and sort it there.",
  "Sort each statement into the correct category: cause, or resolution step.",
  "Place each statement into the right bucket — cause, or step.",
  "Categorise each statement as a cause of marital conflict or a step in resolving it.",
];

const ORDER_PROMPTS = [
  "Arrange the Islamic process for resolving marital conflict in the correct order.",
  "Put the Islamic process for resolving marital conflict into the correct order.",
  "Sequence this process for resolving marital conflict correctly.",
  "Order these steps for resolving marital conflict as they actually happen.",
  "Sort these steps of the Islamic conflict-resolution process into order.",
  "Arrange these steps for resolving marital conflict from first to last.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Which term completes this sentence?",
  "Complete the sentence with the correct term.",
  "Work out the missing term below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which term belongs in the blank?",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Reconciliation", meaning: "The first attempt to resolve marital conflict, made directly between the couple" },
  { term: "Arbiters", meaning: "Mediators appointed from each spouse's family to help resolve a serious marital conflict, as instructed in Qur'an 4:35" },
  { term: "Divorce", meaning: "The last resort in marital conflict, used only when reconciliation has failed" },
];

const MIXED_ITEMS = [
  { text: "Poor communication between spouses", bucket: "cause" },
  { text: "Financial disagreements", bucket: "cause" },
  { text: "Interference from relatives", bucket: "cause" },
  { text: "The couple discussing the matter directly between themselves", bucket: "step" },
  { text: "Appointing an arbiter from each family, as in Qur'an 4:35", bucket: "step" },
  { text: "Seeking counsel from an Imam or respected elder", bucket: "step" },
] as const;
const MIXED_LABEL: Record<string, string> = { cause: "A cause of marital conflict", step: "A step in resolving marital conflict" };

const ORDER_ITEMS = [
  { id: "direct", label: "The couple try to resolve the matter directly between themselves" },
  { id: "arbiters", label: "If unresolved, arbiters are appointed from each family (Qur'an 4:35)" },
  { id: "attempt", label: "The arbiters attempt reconciliation between the couple" },
  { id: "divorce", label: "If reconciliation fails, divorce is considered as the last resort" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is one common cause of conflict in marriage?",
    correct: "Poor communication or financial disagreements between spouses",
    distractors: ["Regularly praying together", "Sharing household responsibilities fairly", "Consulting each other on decisions"],
  },
  {
    q: "According to Qur'an 4:35, what should be done if a couple cannot resolve a serious conflict alone?",
    correct: "Arbiters should be appointed from each spouse's family to attempt reconciliation",
    distractors: ["The marriage should end immediately with no discussion", "The couple should avoid seeking any outside help", "Only the husband's family should be involved"],
  },
  {
    q: "In Islamic teaching, what is the status of divorce in resolving marital conflict?",
    correct: "It is the last resort, used only after reconciliation has been attempted and failed",
    distractors: ["It is the first and preferred option", "It is forbidden under all circumstances", "It should be decided by one spouse without any discussion"],
  },
  {
    q: "Why does Islam encourage a structured process of reconciliation before divorce?",
    correct: "To give the marriage every reasonable chance to be preserved and to protect the family",
    distractors: ["To delay any decision indefinitely with no resolution", "Because reconciliation is never expected to succeed", "Because divorce is always the better outcome"],
  },
];

export const divorce: Skill = {
  id: "g8-ire-mu-divorce",
  code: "MU.1",
  subjectId: "ire",
  strandId: "g8-ire-mu",
  grade: 8,
  title: "Divorce: Causes and Conflict Resolution",
  description: "Causes of conflict in marriage and the Islamic mechanism for resolving it before divorce.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Islam moves from reconciliation, to arbiters, to divorce as a last resort.",
        explanation: TERMS.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, MIXED_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: MIXED_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "A cause creates the conflict; a step is part of the process used to resolve it.",
        explanation: chosen.map((c) => `"${c.text}" — ${MIXED_LABEL[c.bucket].toLowerCase()}.`).join(" "),
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
        hint: "The couple try first, then arbiters are brought in, and divorce is only considered if all reconciliation fails.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "According to Qur'an 4:35, if a couple cannot resolve their conflict alone,",
        after: "should be appointed from each family to attempt reconciliation.",
        correctAnswer: "arbiters",
        acceptedAnswers: ["an arbiter", "arbitrators"],
        inputMode: "text",
        hint: "These are mediators, one chosen from each spouse's family.",
        explanation: "Qur'an 4:35 instructs that arbiters be appointed from each family to attempt reconciliation before a couple considers divorce.",
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
      hint: "Islam provides a structured process — direct discussion, then arbiters — before divorce is considered as a last resort.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
