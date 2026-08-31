import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ESSAY_SETS: { sentences: string[] }[] = [
  {
    sentences: [
      "Today the weather is hot (haar) and sunny (shams).",
      "There is a strong wind (riyah) blowing from the sea (bahr).",
      "In the afternoon, dark clouds bring rain (matar).",
      "By evening, the weather turns cold (baarid) again.",
    ],
  },
  {
    sentences: [
      "Near our village there is a tall mountain (jabal) and a green forest (ghaaba).",
      "In the morning, the sun (shams) shines brightly over the trees.",
      "Later, the wind (riyah) grows strong and cool.",
      "By night, it becomes cold (baarid) near the forest (ghaaba).",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "In Arabic, 'rain' is written as ", after: ".", answer: "matar" },
  { before: "In Arabic, 'sun' is written as ", after: ".", answer: "shams" },
  { before: "In Arabic, 'wind' is written as ", after: ".", answer: "riyah" },
  { before: "In Arabic, 'mountain' is written as ", after: ".", answer: "jabal" },
  { before: "In Arabic, 'sea' is written as ", after: ".", answer: "bahr" },
  { before: "In Arabic, 'forest' is written as ", after: ".", answer: "ghaaba" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word means 'wind'?",
    correct: "riyah",
    distractors: ["matar", "shams", "bahr"],
    explanation: "'riyah' means wind; 'matar' is rain, 'shams' is sun, and 'bahr' is sea.",
  },
  {
    prompt: "Which word means 'forest'?",
    correct: "ghaaba",
    distractors: ["jabal", "bahr", "matar"],
    explanation: "'ghaaba' means forest; 'jabal' is mountain, 'bahr' is sea, and 'matar' is rain.",
  },
  {
    prompt: "In a weather essay, which sentence would make the best opening sentence?",
    correct: "Today the weather is hot (haar) and sunny (shams).",
    distractors: [
      "By evening, the weather turns cold (baarid) again.",
      "Later, the wind (riyah) grows strong.",
      "In conclusion, the weather changed a lot today.",
    ],
    explanation: "A good essay opening introduces the overall topic before adding details — describing today's general weather sets the scene, while the others describe later events or a conclusion.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "matar", meaning: "rain" },
  { term: "shams", meaning: "sun" },
  { term: "haar", meaning: "hot" },
  { term: "baarid", meaning: "cold" },
  { term: "riyah", meaning: "wind" },
  { term: "jabal", meaning: "mountain" },
  { term: "bahr", meaning: "sea" },
  { term: "ghaaba", meaning: "forest" },
];

export const weatherWriting: Skill = {
  id: "g8-ar-w-weather",
  code: "W.8",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing a short essay about weather",
  description: "Practise romanized Arabic weather vocabulary for guided essay writing: order essay sentences, fill in words, and match meanings.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "fill", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ESSAY_SETS);
      const items = shuffle(rng, set.sentences.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.sentences.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the sentences to form a short, logically ordered weather essay.",
        instruction: "Click the sentences in the correct order, from opening to closing.",
        items,
        correctOrder,
        hint: "A good essay opens with the general weather, adds details, then closes with how things change.",
        explanation: `The correctly ordered essay is: "${set.sentences.join(" ")}"`,
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
        hint: "Think about the meaning of each weather word, or about how essays are structured.",
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
        prompt: "Match each romanized Arabic weather word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'haar' (hot) and 'baarid' (cold) are opposites.",
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
      hint: "Think about the weather words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
