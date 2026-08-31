import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Near my house there is a ", after: " where I borrow books.", answer: "maktaba" },
  { before: "Every Friday, my family prays at the ", after: ".", answer: "masjid" },
  { before: "My mother buys vegetables at the ", after: ".", answer: "suuq" },
  { before: "I study every day at my ", after: ".", answer: "madrasa" },
  { before: "In the evening, children play in the ", after: ".", answer: "hadiqa" },
  { before: "Our ", after: " is next to a big river.", answer: "bayt" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Near my house", "there is a", "madrasa."], sentence: "Near my house there is a madrasa." },
  { chunks: ["Every Friday,", "we pray at the", "masjid."], sentence: "Every Friday, we pray at the masjid." },
  { chunks: ["My family buys food", "at the", "suuq."], sentence: "My family buys food at the suuq." },
  { chunks: ["In the afternoon,", "I read books at the", "maktaba."], sentence: "In the afternoon, I read books at the maktaba." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means 'mosque'?",
    correct: "masjid",
    distractors: ["madrasa", "maktaba", "hadiqa"],
    explanation: "'masjid' means mosque; 'madrasa' is school, 'maktaba' is library, and 'hadiqa' is garden/park.",
  },
  {
    prompt: "Which word means 'river'?",
    correct: "nahr",
    distractors: ["tareeq", "bayt", "suuq"],
    explanation: "'nahr' means river; 'tareeq' is road/street, 'bayt' is house/home, and 'suuq' is market.",
  },
  {
    prompt: "Which word means 'market'?",
    correct: "suuq",
    distractors: ["madrasa", "masjid", "bayt"],
    explanation: "'suuq' means market; 'madrasa' is school, 'masjid' is mosque, and 'bayt' is house/home.",
  },
  {
    prompt: "Which word means 'road' or 'street'?",
    correct: "tareeq",
    distractors: ["nahr", "hadiqa", "maktaba"],
    explanation: "'tareeq' means road/street; 'nahr' is river, 'hadiqa' is garden/park, and 'maktaba' is library.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "madrasa", meaning: "school" },
  { term: "bayt", meaning: "house / home" },
  { term: "suuq", meaning: "market" },
  { term: "masjid", meaning: "mosque" },
  { term: "maktaba", meaning: "library" },
  { term: "hadiqa", meaning: "garden / park" },
  { term: "tareeq", meaning: "road / street" },
  { term: "nahr", meaning: "river" },
];

export const surroundingWriting: Skill = {
  id: "g8-ar-w-surrounding",
  code: "W.3",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing a paragraph about my surrounding",
  description: "Practise romanized Arabic words for places in your surroundings: fill in words, order simple sentences, and match places to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct sentence about a place in your surrounding.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Think about where the place word fits naturally in the English sentence.",
        explanation: `The correct sentence is: "${set.sentence}"`,
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
        hint: "Think carefully about the meaning of each place word.",
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
        prompt: "Match each romanized Arabic place word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'masjid' and 'madrasa' both start with 'ma-' but mean different places.",
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
      hint: "Think about the place words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
