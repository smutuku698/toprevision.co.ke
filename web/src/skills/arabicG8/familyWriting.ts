import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'father' is written as ", after: ".", answer: "ab" },
  { before: "In Arabic, 'mother' is written as ", after: ".", answer: "umm" },
  { before: "In Arabic, 'brother' is written as ", after: ".", answer: "akh" },
  { before: "In Arabic, 'sister' is written as ", after: ".", answer: "ukht" },
  { before: "In Arabic, 'grandfather' is written as ", after: ".", answer: "jadd" },
  { before: "In Arabic, 'daughter' is written as ", after: ".", answer: "bint" },
];

const ORDER_SETS: { chunks: string[]; description: string }[] = [
  { chunks: ["ab", "umm", "akh", "ukht"], description: "father, mother, brother, sister" },
  { chunks: ["jadd", "jadda", "khaal", "khaala"], description: "grandfather, grandmother, maternal uncle, maternal aunt" },
  { chunks: ["ab", "umm", "ibn", "bint"], description: "father, mother, son, daughter" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means 'grandmother'?",
    correct: "jadda",
    distractors: ["jadd", "umm", "khaala"],
    explanation: "'jadda' means grandmother; 'jadd' is grandfather, 'umm' is mother, and 'khaala' is maternal aunt.",
  },
  {
    prompt: "Which word means 'maternal uncle'?",
    correct: "khaal",
    distractors: ["khaala", "akh", "ibn"],
    explanation: "'khaal' means maternal uncle; 'khaala' is maternal aunt, 'akh' is brother, and 'ibn' is son.",
  },
  {
    prompt: "Which of these is a feature of neat, legible handwriting?",
    correct: "Letters are evenly spaced and sit correctly on the line",
    distractors: ["Letters overlap and slant in different directions", "Words are squeezed together with no spacing", "Letters change size on every line"],
    explanation: "Neat, legible handwriting has evenly spaced, consistently sized letters that sit correctly on the line, making it easy for others to read.",
  },
  {
    prompt: "Why is neatness important when writing about your family in Arabic?",
    correct: "So the teacher and other readers can read every word clearly",
    distractors: ["So the writing looks the same as everyone else's", "So you can write faster without thinking about spelling", "So you can skip spaces between words"],
    explanation: "Neat, legible writing lets any reader — including your teacher — understand your work clearly and easily.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "ab", meaning: "father" },
  { term: "umm", meaning: "mother" },
  { term: "akh", meaning: "brother" },
  { term: "ukht", meaning: "sister" },
  { term: "jadd", meaning: "grandfather" },
  { term: "jadda", meaning: "grandmother" },
  { term: "khaal", meaning: "maternal uncle" },
  { term: "khaala", meaning: "maternal aunt" },
  { term: "ibn", meaning: "son" },
  { term: "bint", meaning: "daughter" },
];

export const familyWriting: Skill = {
  id: "g8-ar-w-family",
  code: "W.2",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing about family",
  description: "Practise romanized Arabic family vocabulary and neat, legible handwriting habits: fill in words, order family terms, match meanings, and choose good handwriting practices.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: `Arrange the family words in this order: ${set.description}.`,
        instruction: "Click the words in the correct order.",
        items,
        correctOrder,
        hint: "Read the requested order carefully before clicking.",
        explanation: `The correct order is: ${set.chunks.join(", ")} (${set.description}).`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think carefully about the meaning of each family word, or about what makes writing easy to read.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each romanized Arabic family word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'khaal'/'khaala' are maternal uncle/aunt — different from 'akh'/'ukht' (brother/sister).",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing Arabic word to complete the sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the family words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
