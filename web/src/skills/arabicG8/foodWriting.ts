import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POEM_SETS: { lines: string[]; gloss: string }[] = [
  { lines: ["khubz haar,", "shay hulw,", "halib baarid."], gloss: "hot bread, sweet tea, cold milk" },
  { lines: ["aruz ladheedh,", "lahm haar,", "qahwa hulw."], gloss: "delicious rice, hot meat, sweet coffee" },
  { lines: ["khubz hulw,", "halib baarid,", "shay ladheedh."], gloss: "sweet bread, cold milk, delicious tea" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "The Arabic word for 'delicious' is ", after: ".", answer: "ladheedh" },
  { before: "The Arabic word for 'sweet' is ", after: ".", answer: "hulw" },
  { before: "The Arabic word for 'hot' is ", after: ".", answer: "haar" },
  { before: "The Arabic word for 'cold' is ", after: ".", answer: "baarid" },
  { before: "Complete the phrase for 'hot bread': khubz ", after: ".", answer: "haar" },
  { before: "Complete the phrase for 'cold milk': halib ", after: ".", answer: "baarid" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Which word pair means 'sweet tea'?",
    correct: "shay hulw",
    distractors: ["shay haar", "khubz hulw", "qahwa baarid"],
    explanation: "'shay' means tea and 'hulw' means sweet, so 'shay hulw' means 'sweet tea'.",
  },
  {
    prompt: "Which word means 'delicious'?",
    correct: "ladheedh",
    distractors: ["hulw", "haar", "baarid"],
    explanation: "'ladheedh' means delicious; 'hulw' is sweet, 'haar' is hot, and 'baarid' is cold.",
  },
  {
    prompt: "Which word pair means 'hot meat'?",
    correct: "lahm haar",
    distractors: ["lahm baarid", "aruz haar", "khubz hulw"],
    explanation: "'lahm' means meat and 'haar' means hot, so 'lahm haar' means 'hot meat'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "khubz", meaning: "bread" },
  { term: "lahm", meaning: "meat" },
  { term: "aruz", meaning: "rice" },
  { term: "shay", meaning: "tea" },
  { term: "qahwa", meaning: "coffee" },
  { term: "halib", meaning: "milk" },
  { term: "ladheedh", meaning: "delicious" },
  { term: "hulw", meaning: "sweet" },
  { term: "haar", meaning: "hot" },
  { term: "baarid", meaning: "cold" },
];

export const foodWriting: Skill = {
  id: "g8-ar-w-food",
  code: "W.6",
  subjectId: "arabic",
  strandId: "g8-ar-writing",
  grade: 8,
  title: "Writing a short poem about food",
  description: "Practise simple descriptive Arabic food-and-adjective pairs for guided poetry writing: order verse lines, fill in adjectives, and match words to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "fill", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, POEM_SETS);
      const items = shuffle(rng, set.lines.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.lines.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the lines to form a short descriptive food verse.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Read each word pair's meaning to help you decide the order.",
        explanation: `The correct verse is: "${set.lines.join(" ")}" (${set.gloss}).`,
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
        hint: "Think about the meaning of each food word and each descriptive word.",
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
        prompt: "Match each romanized Arabic food or descriptive word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'haar' (hot) and 'baarid' (cold) are opposites — so are 'hulw' (sweet) and other taste words.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing descriptive Arabic word to complete the sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the descriptive words for food you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
