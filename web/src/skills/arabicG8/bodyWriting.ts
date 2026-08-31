import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ORDER_SETS: { chunks: string[]; description: string }[] = [
  { chunks: ["ra's", "udhun", "anf", "fam"], description: "head, ear, nose, mouth (top to bottom)" },
  { chunks: ["yad", "zahr", "rijl"], description: "hand, back, leg (top to bottom)" },
  { chunks: ["ra's", "yad", "rijl"], description: "head, hand, leg (top to bottom)" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'hand' is written as ", after: ".", answer: "yad" },
  { before: "In Arabic, 'leg' or 'foot' is written as ", after: ".", answer: "rijl" },
  { before: "In Arabic, 'ear' is written as ", after: ".", answer: "udhun" },
  { before: "In Arabic, 'nose' is written as ", after: ".", answer: "anf" },
  { before: "In Arabic, 'mouth' is written as ", after: ".", answer: "fam" },
  { before: "In Arabic, 'back' is written as ", after: ".", answer: "zahr" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means 'head'?",
    correct: "ra's",
    distractors: ["yad", "rijl", "zahr"],
    explanation: "'ra's' means head; 'yad' is hand, 'rijl' is leg/foot, and 'zahr' is back.",
  },
  {
    prompt: "Which word means 'ear'?",
    correct: "udhun",
    distractors: ["anf", "fam", "yad"],
    explanation: "'udhun' means ear; 'anf' is nose, 'fam' is mouth, and 'yad' is hand.",
  },
  {
    prompt: "Which word means 'back'?",
    correct: "zahr",
    distractors: ["rijl", "ra's", "udhun"],
    explanation: "'zahr' means back; 'rijl' is leg/foot, 'ra's' is head, and 'udhun' is ear.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "ra's", meaning: "head" },
  { term: "yad", meaning: "hand" },
  { term: "rijl", meaning: "leg / foot" },
  { term: "udhun", meaning: "ear" },
  { term: "anf", meaning: "nose" },
  { term: "fam", meaning: "mouth" },
  { term: "zahr", meaning: "back" },
];

export const bodyWriting: Skill = {
  id: "g8-ar-w-body",
  code: "W.7",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Creative writing: describing a character",
  description: "Practise romanized Arabic body-part vocabulary for creative character description: order a head-to-toe description, fill in words, and match meanings.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "fill", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: `When creatively describing a character, arrange these body-part words in this order: ${set.description}.`,
        instruction: "Click the words in the correct order.",
        items,
        correctOrder,
        hint: "Picture the character from head to toe as you order the words.",
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
        hint: "Think carefully about the meaning of each body-part word.",
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
        prompt: "Match each romanized Arabic body-part word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'anf' and 'udhun' are both on the face — but they are not the same feature.",
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
      hint: "Think about the body-part words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
