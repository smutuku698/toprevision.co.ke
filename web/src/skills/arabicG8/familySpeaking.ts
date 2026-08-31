import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Amina: Listen, I want to tell you about my family!",
  "Amina: This is my ab and my umm.",
  "Otieno: Do you have any akh or ukht?",
  "Amina: Yes, I have one akh and two ukht.",
  "Otieno: And your jadd and jadda?",
  "Amina: My jadd and jadda live with us too.",
  "Otieno: Is that your khaal?",
  "Amina: Yes! He is umm's brother. He has an ibn and a bint.",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Listen to Amina speak. Who does she introduce first?",
    correct: "Her ab and umm (father and mother)",
    distractors: ["Her jadd and jadda", "Her akh and ukht", "Her khaal"],
    explanation: "Amina says, \"This is my ab and my umm\" first.",
  },
  {
    q: "How many akh and ukht does Amina say she has?",
    correct: "One akh and two ukht",
    distractors: ["Two akh and one ukht", "No akh or ukht", "Three akh only"],
    explanation: "Amina says, \"I have one akh and two ukht.\"",
  },
  {
    q: "Who does Amina say lives with her family?",
    correct: "Her jadd and jadda (grandfather and grandmother)",
    distractors: ["Her khaal and khaala", "Her ibn and bint", "No one else"],
    explanation: "Amina says, \"My jadd and jadda live with us too.\"",
  },
  {
    q: "Whose brother is Amina's khaal, according to what she says?",
    correct: "Her umm's brother",
    distractors: ["Her ab's brother", "Her akh's brother", "No one's brother"],
    explanation: "Amina says, \"He is umm's brother.\"",
  },
];

const CATEGORY_ITEMS: { label: string; bucket: "Immediate family" | "Extended family" }[] = [
  { label: "ab", bucket: "Immediate family" },
  { label: "akh", bucket: "Immediate family" },
  { label: "jadd", bucket: "Extended family" },
  { label: "khaal", bucket: "Extended family" },
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

export const familySpeaking: Skill = {
  id: "g8-ar-ls-family",
  code: "LS.2",
  subjectId: "arabic",
  strandId: "g8-ar-listening-speaking",
  grade: 8,
  title: "Listening & speaking: family",
  description: "Listen to Amina introduce her family out loud, then answer comprehension questions and practise saying family words aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = CATEGORY_ITEMS.map((s, i) => ({ id: `s${i}`, label: s.label, bucket: s.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        speakable: true,
        prompt: "Sort each family word as Immediate family or Extended family.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Immediate family", label: "Immediate family" },
          { id: "Extended family", label: "Extended family" },
        ],
        correctBucket,
        hint: "Immediate family live in your household; extended family are relatives beyond that.",
        explanation: CATEGORY_ITEMS.map((s) => `"${s.label}" is ${s.bucket.toLowerCase()}.`).join(" "),
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
        speakable: true,
        prompt: "Match each spoken family word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
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
        speakable: true,
        prompt: "Put these lines from Amina's spoken introduction in the order they were said.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Amina introduces her parents first, then her siblings, then her grandparents, then her khaal.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      speakable: true,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Imagine hearing Amina say each line aloud, one family member at a time.",
      explanation: q.explanation,
    };
  },
};
