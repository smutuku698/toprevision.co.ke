import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each virtue to what it means in Islamic teaching.",
  "Pair each virtue with what it means in Islamic teaching.",
  "Connect each virtue below to what it means.",
  "Match each virtue to the teaching that fits it.",
  "Link each virtue with its correct teaching.",
  "Choose the correct teaching for each virtue below.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each example as fulfilment of promise or anger management.",
  "Group each example under fulfilment of promise or anger management.",
  "Decide whether each example is about fulfilment of promise or anger management, and sort it there.",
  "Sort each example into the correct category: fulfilment of promise, or anger management.",
  "Place each example into the right bucket — promise, or anger.",
  "Categorise each example as fulfilment of promise or anger management.",
];

const ORDER_PROMPTS = [
  "Arrange the steps the Prophet (S.A.W.) advised for managing anger in the correct order.",
  "Put the steps the Prophet (S.A.W.) advised for managing anger into the correct order.",
  "Sequence these steps for managing anger as the Prophet (S.A.W.) advised.",
  "Order these anger-management steps as the Prophet (S.A.W.) advised them.",
  "Sort these steps for managing anger into their correct order.",
  "Arrange these anger-management steps from first to last.",
];

const FILL_PROMPTS = [
  "Fill in the missing instruction.",
  "Which instruction completes this sentence?",
  "Complete the sentence with the correct instruction.",
  "Work out the missing instruction below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which instruction belongs in the blank?",
];

const VIRTUES: { virtue: string; teaching: string }[] = [
  { virtue: "Fulfilment of promise", teaching: "Keeping one's word, even when it is difficult, as a mark of honesty and trustworthiness" },
  { virtue: "Anger management", teaching: "Controlling one's temper and responding calmly, following the example and advice of the Prophet (S.A.W.)" },
];

const SORT_ITEMS = [
  { text: "Keeping your word even when it is difficult to do so", bucket: "promise" },
  { text: "Returning a borrowed item on the exact date agreed", bucket: "promise" },
  { text: "Counting to ten and taking a deep breath before responding", bucket: "anger" },
  { text: "Sitting down or lying down when feeling angry, as advised by the Prophet", bucket: "anger" },
  { text: "Performing ablution (wudu) to cool down when angry", bucket: "anger" },
] as const;
const SORT_LABEL: Record<string, string> = { promise: "Fulfilment of promise", anger: "Anger management" };

const ORDER_ITEMS = [
  { id: "refuge", label: "Seek refuge in Allah from Shaytan" },
  { id: "silent", label: "Remain silent" },
  { id: "position", label: "Change position — sit if standing, lie down if sitting" },
  { id: "wudu", label: "Perform ablution (wudu) to cool down" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is fulfilment of promise considered an important virtue in Islam?",
    correct: "Because it reflects honesty and builds trust between people",
    distractors: ["Because it is only expected of leaders", "Because it has no connection to a Muslim's faith", "Because promises may be broken whenever convenient"],
  },
  {
    q: "What did the Prophet (S.A.W.) advise a person to do if they become angry while standing?",
    correct: "Sit down",
    distractors: ["Shout to release the anger", "Continue standing and confront the situation", "Walk away without changing position"],
  },
  {
    q: "What is one benefit of managing anger well, according to Islamic teaching?",
    correct: "It helps maintain harmonious relationships and self-control",
    distractors: ["It proves a person has no feelings", "It guarantees a person will never feel angry again", "It is only useful in business settings"],
  },
  {
    q: "How does breaking a promise affect a Muslim's character, according to Islamic teaching?",
    correct: "It damages trust and is considered a sign of hypocrisy if done habitually",
    distractors: ["It has no effect on how others see them", "It is always excusable with no consequence", "It only matters in financial promises"],
  },
];

export const virtuesInIslam: Skill = {
  id: "g8-ire-ak-virtues-in-islam",
  code: "AK.2",
  subjectId: "ire",
  strandId: "g8-ire-ak",
  grade: 8,
  title: "Virtues in Islam: Promise and Anger",
  description: "Fulfilment of promise and anger management as virtues taught in the sunnah of the Prophet (S.A.W.).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIRTUES.map((v) => ({ id: v.virtue, label: v.virtue })));
      const targets = shuffle(rng, VIRTUES.map((v) => ({ id: v.virtue, label: v.teaching })));
      const correctMap: Record<string, string> = {};
      for (const v of VIRTUES) correctMap[v.virtue] = v.virtue;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Both virtues shape how a Muslim treats others — one through honesty, the other through self-control.",
        explanation: VIRTUES.map((v) => `${v.virtue} — ${v.teaching.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SORT_ITEMS).slice(0, 4);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: SORT_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "One is about keeping your word; the other is about controlling your temper.",
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
        hint: "The advice moves from an inward step, to silence, to a physical change of position, to a final calming act.",
        explanation: ORDER_ITEMS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The Prophet (S.A.W.) advised that if a person is angry while standing, they should",
        after: ".",
        correctAnswer: "sit down",
        acceptedAnswers: ["sit"],
        inputMode: "text",
        hint: "Changing your physical position can help calm anger.",
        explanation: "The Prophet (S.A.W.) advised a standing, angry person to sit down, and a sitting person to lie down, to help calm the anger.",
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
      hint: "Fulfilment of promise and anger management are virtues Islam encourages for a Muslim's character and relationships.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
