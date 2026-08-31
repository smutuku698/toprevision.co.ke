import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Njeri geht mit ihrer Mutter einkaufen.",
  "Zuerst gehen sie zur Metzgerei. Sie kaufen ein Kilo Fleisch.",
  "Dann gehen sie zum Lebensmittelladen für Reis und Zucker.",
  "Sie kaufen zwei Kilo Reis und ein Kilo Zucker.",
  "Im Supermarkt kaufen sie einen Liter Milch und ein Dutzend Eier.",
  "Njeri fragt: 'Wie viel kostet der Käse?'",
  "Die Verkäuferin sagt: 'Der Käse kostet hundertzwanzig Ksh pro Kilo.'",
  "Njeris Mutter kauft auch Salz und Öl zum Kochen.",
  "Am Ende kaufen sie noch Saft zum Trinken.",
  "Njeri trägt die Einkaufstasche nach Hause.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Njeri geht mit ihrer Mutter einkaufen.", isTrue: true },
  { text: "Sie kaufen zuerst Milch.", isTrue: false },
  { text: "Sie kaufen ein Kilo Fleisch bei der Metzgerei.", isTrue: true },
  { text: "Sie kaufen drei Kilo Reis.", isTrue: false },
  { text: "Sie kaufen ein Kilo Zucker.", isTrue: true },
  { text: "Im Supermarkt kaufen sie ein Dutzend Eier.", isTrue: true },
  { text: "Der Käse kostet hundertzwanzig Ksh pro Kilo.", isTrue: true },
  { text: "Njeris Mutter kauft kein Salz.", isTrue: false },
  { text: "Sie kaufen auch Saft.", isTrue: true },
  { text: "Njeri trägt nichts nach Hause.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Njeri geht mit ihrer Mutter einkaufen.", meaning: "Njeri goes shopping with her mother." },
  { phrase: "Sie kaufen ein Kilo Fleisch.", meaning: "They buy a kilo of meat." },
  { phrase: "Sie kaufen zwei Kilo Reis.", meaning: "They buy two kilos of rice." },
  { phrase: "Sie kaufen einen Liter Milch.", meaning: "They buy a litre of milk." },
  { phrase: "Wie viel kostet der Käse?", meaning: "How much does the cheese cost?" },
  { phrase: "Der Käse kostet hundertzwanzig Ksh.", meaning: "The cheese costs one hundred twenty Ksh." },
  { phrase: "Sie kaufen Salz und Öl.", meaning: "They buy salt and oil." },
  { phrase: "Sie kaufen Saft zum Trinken.", meaning: "They buy juice to drink." },
  { phrase: "Njeri trägt die Einkaufstasche.", meaning: "Njeri carries the shopping bag." },
  { phrase: "Sie gehen zur Metzgerei.", meaning: "They go to the butchery." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wo kaufen Njeri und ihre Mutter zuerst ein?",
    correct: "Bei der Metzgerei",
    distractors: ["Im Supermarkt", "Im Lebensmittelladen", "Auf dem Markt"],
    explanation: "The passage says: \"Zuerst gehen sie zur Metzgerei.\"",
  },
  {
    q: "Wie viel Reis kaufen sie?",
    correct: "Zwei Kilo",
    distractors: ["Ein Kilo", "Drei Kilo", "Ein Liter"],
    explanation: "The passage says: \"Sie kaufen zwei Kilo Reis und ein Kilo Zucker.\"",
  },
  {
    q: "Wie viel kostet der Käse pro Kilo?",
    correct: "Hundertzwanzig Ksh",
    distractors: ["Hundert Ksh", "Fünfzig Ksh", "Zweihundert Ksh"],
    explanation: "The passage says: \"Der Käse kostet hundertzwanzig Ksh pro Kilo.\"",
  },
  {
    q: "Was kaufen sie zuletzt?",
    correct: "Saft",
    distractors: ["Milch", "Eier", "Reis"],
    explanation: "The passage says: \"Am Ende kaufen sie noch Saft zum Trinken.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Njeri geht mit ihrer Mutter ", after: ".", answer: "einkaufen", gloss: "Njeri goes shopping with her mother." },
  { before: "Zuerst gehen sie zur ", after: ".", answer: "Metzgerei", gloss: "First they go to the butchery." },
  { before: "Sie kaufen ", after: " Kilo Fleisch.", answer: "ein", gloss: "They buy a kilo of meat." },
  { before: "Dann gehen sie zum Lebensmittelladen für Reis und ", after: ".", answer: "Zucker", gloss: "Then they go to the grocery store for rice and sugar." },
  { before: "Im Supermarkt kaufen sie einen Liter ", after: ".", answer: "Milch", gloss: "At the supermarket they buy a litre of milk." },
  { before: "Njeri fragt: 'Wie viel kostet der ", after: "?'", answer: "Käse", gloss: "Njeri asks how much the cheese costs." },
  { before: "Der Käse kostet hundertzwanzig Ksh pro ", after: ".", answer: "Kilo", gloss: "The cheese costs one hundred twenty Ksh per kilo." },
  { before: "Njeris Mutter kauft auch Salz und ", after: " zum Kochen.", answer: "Öl", gloss: "Njeri's mother also buys salt and oil for cooking." },
  { before: "Am Ende kaufen sie noch ", after: " zum Trinken.", answer: "Saft", gloss: "In the end they also buy juice to drink." },
  { before: "Njeri trägt die Einkaufs", after: " nach Hause.", answer: "tasche", gloss: "Njeri carries the shopping bag home." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Njeri geht", "mit ihrer Mutter", "einkaufen", "."], sentence: "Njeri geht mit ihrer Mutter einkaufen." },
  { chunks: ["Der Käse", "kostet", "hundertzwanzig Ksh", "."], sentence: "Der Käse kostet hundertzwanzig Ksh." },
];

export const foodsReading: Skill = {
  id: "g7-de-r-foods",
  code: "R.6",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: shopping for food",
  description: "Read a short German passage about a family shopping trip for food, and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "click-match", "ordering", "fill-blank", "multiple-choice"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, TRUE_FALSE).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Track exactly which shop each item is bought at, and the quantities.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each sentence from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each sentence is used in the passage above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put the pieces in order to rebuild this line from the passage.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the passage above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from this line of the passage.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the passage above.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
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
      hint: "Track exactly what the passage says about each purchase.",
      explanation: q.explanation,
    };
  },
};
