import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Njeri: This is a photo of my family.",
  "Njeri: This is my ab, and this is my umm.",
  "Kamau: Who are these two?",
  "Njeri: This is my akh and my ukht.",
  "Kamau: And this man and woman?",
  "Njeri: This is my jadd and my jadda.",
  "Kamau: Is that your khaal?",
  "Njeri: Yes, he is my umm's brother. He has an ibn and a bint too.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is Njeri showing Kamau?",
    correct: "A photo of her family",
    distractors: ["A photo of her school", "A photo of her pets", "A photo of her holiday"],
    explanation: "Njeri says, \"This is a photo of my family.\"",
  },
  {
    q: "Who does Njeri introduce as her 'ab' and 'umm'?",
    correct: "Her father and mother",
    distractors: ["Her grandfather and grandmother", "Her brother and sister", "Her uncle and aunt"],
    explanation: "'Ab' means father and 'umm' means mother.",
  },
  {
    q: "Who are Njeri's 'jadd' and 'jadda'?",
    correct: "Her grandfather and grandmother",
    distractors: ["Her father and mother", "Her son and daughter", "Her uncle and aunt"],
    explanation: "'Jadd' means grandfather and 'jadda' means grandmother.",
  },
  {
    q: "What does Njeri say her khaal has?",
    correct: "An ibn (son) and a bint (daughter)",
    distractors: ["An akh (brother) and an ukht (sister)", "A jadd (grandfather) and a jadda (grandmother)", "No children at all"],
    explanation: "Njeri says her khaal \"has an ibn and a bint too.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Njeri shows Kamau a photo of her family.", isTrue: true },
  { text: "Njeri says 'jadd' means her brother.", isTrue: false },
  { text: "Njeri's khaal is her mother's brother.", isTrue: true },
  { text: "Njeri says she has no akh or ukht.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "ab", meaning: "father" },
  { phrase: "umm", meaning: "mother" },
  { phrase: "akh", meaning: "brother" },
  { phrase: "ukht", meaning: "sister" },
  { phrase: "jadd", meaning: "grandfather" },
  { phrase: "jadda", meaning: "grandmother" },
  { phrase: "khaal", meaning: "maternal uncle" },
  { phrase: "ibn", meaning: "son" },
  { phrase: "bint", meaning: "daughter" },
];

export const familyReading: Skill = {
  id: "g8-ar-r-family",
  code: "R.2",
  subjectId: "arabic",
  strandId: "g8-ar-reading",
  grade: 8,
  title: "Reading: family",
  description: "Read a short Arabic dialogue about a family photo and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check what Njeri says about each family member.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each family word from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each word is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Njeri introduces her parents first, then her siblings, then her grandparents, then her khaal.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what Njeri says about each family member in turn.",
      explanation: q.explanation,
    };
  },
};
