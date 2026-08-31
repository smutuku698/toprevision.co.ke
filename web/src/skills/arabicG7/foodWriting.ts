import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Sub-strand 3.6 Mechanics of Writing: Punctuation — identifying punctuation marks and using
// them correctly to write a paragraph, framed around shopping for food and drinks.

const PUNCT_TERMS: { mark: string; name: string; use: string }[] = [
  { mark: ".", name: "full stop", use: "ends a statement" },
  { mark: ",", name: "comma", use: "separates items in a list or pauses a sentence" },
  { mark: "?", name: "question mark", use: "ends a question" },
  { mark: "!", name: "exclamation mark", use: "ends an exclamation or shows strong feeling" },
];

const SENTENCES: { text: string; correctMark: "." | "," | "?" | "!"; withoutMark: string }[] = [
  { text: "I would like khubz, lahm, and shay", correctMark: ".", withoutMark: "I would like khubz, lahm, and shay" },
  { text: "Would you like qahwa or halib", correctMark: "?", withoutMark: "Would you like qahwa or halib" },
  { text: "The lahm here is so ladheedh", correctMark: "!", withoutMark: "The lahm here is so ladheedh" },
  { text: "Please bring khubz, aruz, and maa'", correctMark: ".", withoutMark: "Please bring khubz, aruz, and maa'" },
  { text: "Is the shay hulw or plain", correctMark: "?", withoutMark: "Is the shay hulw or plain" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "The punctuation mark that ends a question is called a ", after: ".", answer: "question mark" },
  { before: "The punctuation mark that separates items in a list is called a ", after: ".", answer: "comma" },
  { before: "The punctuation mark that shows strong feeling, like excitement, is called an ", after: ".", answer: "exclamation mark" },
  { before: "The punctuation mark that ends a simple statement is called a ", after: ".", answer: "full stop" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["I would like", "khubz,", "lahm,", "and shay."], sentence: "I would like khubz, lahm, and shay." },
  { chunks: ["Would you like", "qahwa", "or", "halib?"], sentence: "Would you like qahwa or halib?" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which punctuation mark correctly ends the sentence: 'The lahm here is so ladheedh'?",
    correct: "! (exclamation mark)",
    distractors: [". (full stop)", ", (comma)", "No punctuation is needed"],
    explanation: "\"The lahm here is so ladheedh\" expresses strong, excited feeling, so it needs an exclamation mark.",
  },
  {
    prompt: "Which punctuation mark correctly ends the sentence: 'Would you like qahwa or halib'?",
    correct: "? (question mark)",
    distractors: ["! (exclamation mark)", ", (comma)", ". (full stop)"],
    explanation: "This sentence asks a question, so it needs a question mark.",
  },
  {
    prompt: "In the sentence 'I would like khubz, lahm, and shay.', why are commas used?",
    correct: "To separate the items in the list of food and drinks",
    distractors: ["To end the sentence", "To show strong feeling", "To ask a question"],
    explanation: "Commas separate items in a list — here, khubz, lahm, and shay.",
  },
];

export const foodWriting: Skill = {
  id: "g7-ar-w-food",
  code: "W.6",
  subjectId: "arabic",
  strandId: "g7-ar-writing",
  grade: 7,
  title: "Mechanics of writing: punctuation (food and drinks)",
  description: "Practise identifying and using correct punctuation marks in Arabic-themed food and shopping sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, PUNCT_TERMS.map((p) => ({ id: p.mark, label: `${p.mark} (${p.name})` })));
      const targets = shuffle(rng, PUNCT_TERMS.map((p) => ({ id: p.mark, label: p.use })));
      const correctMap: Record<string, string> = {};
      for (const p of PUNCT_TERMS) correctMap[p.mark] = p.mark;

      return {
        kind: "click-match",
        prompt: "Match each punctuation mark to what it is used for.",
        tokens,
        targets,
        correctMap,
        hint: "One mark ends a statement, one ends a question, one shows strong feeling, and one separates list items.",
        explanation: PUNCT_TERMS.map((p) => `"${p.mark}" (${p.name}) ${p.use}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SENTENCES);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.withoutMark }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.correctMark));

      return {
        kind: "categorize",
        prompt: "Sort each unpunctuated sentence by which punctuation mark it needs at the end.",
        items,
        buckets: [
          { id: ".", label: "Needs a full stop (.)" },
          { id: "?", label: "Needs a question mark (?)" },
          { id: "!", label: "Needs an exclamation mark (!)" },
        ],
        correctBucket,
        hint: "A question asks something; an exclamation shows strong feeling; a plain statement needs neither.",
        explanation: chosen.map((s) => `"${s.text}" needs "${s.correctMark}" at the end.`).join(" "),
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the pieces, including their punctuation, to form a correct sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Read each piece's punctuation carefully — it tells you where it belongs in the sentence.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Fill in the missing punctuation-mark name.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about what job each punctuation mark does in a sentence.",
        explanation: `${item.before}${item.answer}${item.after}`,
      };
    }

    const q = randChoice(rng, MC_ITEMS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Read the sentence's meaning and tone carefully before choosing the mark.",
      explanation: q.explanation,
    };
  },
};
