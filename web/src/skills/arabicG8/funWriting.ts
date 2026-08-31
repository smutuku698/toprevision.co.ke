import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PUNCT_MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which sentence uses punctuation correctly?",
    correct: "Do you like swimming (as-sibaaha)?",
    distractors: ["Do you like swimming (as-sibaaha)", "do you like swimming (as-sibaaha)?", "Do you like swimming (as-sibaaha)."],
    explanation: "A question needs a capital letter at the start and a question mark at the end: 'Do you like swimming (as-sibaaha)?'",
  },
  {
    prompt: "Which sentence uses punctuation correctly?",
    correct: "I enjoy drawing (ar-rasm) every weekend.",
    distractors: ["i enjoy drawing (ar-rasm) every weekend.", "I enjoy drawing (ar-rasm) every weekend", "I enjoy drawing (ar-rasm) every weekend,"],
    explanation: "A statement starts with a capital letter and ends with a single full stop: 'I enjoy drawing (ar-rasm) every weekend.'",
  },
  {
    prompt: "Which sentence uses punctuation correctly?",
    correct: "What an exciting trip (ar-rihla) that was!",
    distractors: ["what an exciting trip (ar-rihla) that was!", "What an exciting trip (ar-rihla) that was.", "What an exciting trip (ar-rihla) that was"],
    explanation: "An excited exclamation starts with a capital letter and ends with an exclamation mark: 'What an exciting trip (ar-rihla) that was!'",
  },
  {
    prompt: "Which sentence uses punctuation correctly?",
    correct: "My hobbies are football (kurat al-qadam), music (al-musiqa), and travel (as-safar).",
    distractors: [
      "My hobbies are football (kurat al-qadam) music (al-musiqa) and travel (as-safar).",
      "my hobbies are football (kurat al-qadam), music (al-musiqa), and travel (as-safar).",
      "My hobbies are football (kurat al-qadam), music (al-musiqa), and travel (as-safar)",
    ],
    explanation: "Items in a list need commas between them, and the sentence must start with a capital letter and end with a full stop.",
  },
];

const PUNCT_FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Do you enjoy football (kurat al-qadam)", after: "", answer: "?" },
  { before: "I love music (al-musiqa) and drawing (ar-rasm)", after: "", answer: "." },
  { before: "What a wonderful trip (ar-rihla) that was", after: "", answer: "!" },
  { before: "My favourite hobbies are swimming (as-sibaaha)", after: " and football (kurat al-qadam).", answer: "," },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["I", "enjoy", "swimming", "(as-sibaaha)", "."], sentence: "I enjoy swimming (as-sibaaha)." },
  { chunks: ["Do", "you", "like", "football", "(kurat al-qadam)", "?"], sentence: "Do you like football (kurat al-qadam)?" },
  { chunks: ["What", "a", "fun", "trip", "(ar-rihla)", "!"], sentence: "What a fun trip (ar-rihla)!" },
  { chunks: ["My", "hobby", "is", "drawing", "(ar-rasm)", "."], sentence: "My hobby is drawing (ar-rasm)." },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "as-sibaaha", meaning: "swimming" },
  { term: "kurat al-qadam", meaning: "football" },
  { term: "ar-rasm", meaning: "drawing" },
  { term: "al-musiqa", meaning: "music" },
  { term: "as-safar", meaning: "travel" },
  { term: "ar-rihla", meaning: "trip / excursion" },
];

export const funWriting: Skill = {
  id: "g8-ar-w-fun",
  code: "W.5",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing about mechanics of writing / punctuation",
  description: "Practise the mechanics of writing — applying correct punctuation in sentences about hobbies — and romanized Arabic hobby vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["choice", "fill", "order", "match"] as const);

    if (branch === "fill") {
      const item = randChoice(rng, PUNCT_FILL_ITEMS);

      return {
        kind: "fill-blank",
        prompt: "Insert the correct punctuation mark to complete the sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        inputMode: "text",
        hint: "Think about whether the sentence is a question, a statement, an exclamation, or a list.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words to form a correct, correctly-punctuated sentence about a hobby.",
        instruction: "Click the pieces in the correct order, including the punctuation mark.",
        items,
        correctOrder,
        hint: "The punctuation mark always comes last, right after the final word.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each romanized Arabic hobby word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'as-sibaaha' and 'as-safar' both start with 'as-' but mean very different things.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const q = randChoice(rng, PUNCT_MC_ITEMS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Check the capital letter at the start and the punctuation mark at the end.",
      explanation: q.explanation,
    };
  },
};
