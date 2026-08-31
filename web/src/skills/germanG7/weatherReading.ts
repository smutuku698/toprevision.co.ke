import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Mumbi schreibt über die Jahreszeiten in Deutschland.",
  "In Deutschland gibt es vier Jahreszeiten: Frühling, Sommer, Herbst und Winter.",
  "Im Frühling werden die Tage wärmer, und es regnet oft.",
  "Im Sommer ist es heiß, und die Sonne scheint viel.",
  "Im Herbst wird es kälter, und die Blätter fallen von den Bäumen.",
  "Im Winter schneit es oft, und man trägt eine Mütze und einen Pullover.",
  "In Kenia gibt es keinen Schnee.",
  "In Kenia gibt es eine Regenzeit und eine Trockenzeit, aber keine vier Jahreszeiten.",
  "Mumbi findet den Winter in Deutschland interessant, weil sie noch nie Schnee gesehen hat.",
  "Sie möchte einmal den Winter in Deutschland erleben.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "In Deutschland gibt es vier Jahreszeiten.", isTrue: true },
  { text: "Im Sommer ist es kalt.", isTrue: false },
  { text: "Im Winter schneit es oft in Deutschland.", isTrue: true },
  { text: "Im Herbst werden die Tage wärmer.", isTrue: false },
  { text: "In Kenia gibt es Schnee.", isTrue: false },
  { text: "In Kenia gibt es eine Regenzeit und eine Trockenzeit.", isTrue: true },
  { text: "Mumbi hat schon oft Schnee gesehen.", isTrue: false },
  { text: "Mumbi möchte den Winter in Deutschland erleben.", isTrue: true },
  { text: "Im Winter trägt man eine Mütze und einen Pullover.", isTrue: true },
  { text: "Im Frühling regnet es oft.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Es gibt vier Jahreszeiten.", meaning: "There are four seasons." },
  { phrase: "Die Tage werden wärmer.", meaning: "The days get warmer." },
  { phrase: "Die Sonne scheint viel.", meaning: "The sun shines a lot." },
  { phrase: "Die Blätter fallen von den Bäumen.", meaning: "The leaves fall from the trees." },
  { phrase: "Es schneit oft.", meaning: "It often snows." },
  { phrase: "In Kenia gibt es keinen Schnee.", meaning: "In Kenya there is no snow." },
  { phrase: "Eine Regenzeit und eine Trockenzeit.", meaning: "A rainy season and a dry season." },
  { phrase: "Sie möchte den Winter erleben.", meaning: "She would like to experience winter." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wie viele Jahreszeiten gibt es in Deutschland, laut dem Text?",
    correct: "Vier",
    distractors: ["Zwei", "Drei", "Fünf"],
    explanation: "The text says: \"In Deutschland gibt es vier Jahreszeiten.\"",
  },
  {
    q: "Was passiert im Winter in Deutschland, laut dem Text?",
    correct: "Es schneit oft.",
    distractors: ["Es ist sehr heiß.", "Die Blätter fallen.", "Die Tage werden wärmer."],
    explanation: "The text says: \"Im Winter schneit es oft, und man trägt eine Mütze und einen Pullover.\"",
  },
  {
    q: "Was gibt es in Kenia, laut dem Text, statt vier Jahreszeiten?",
    correct: "Eine Regenzeit und eine Trockenzeit",
    distractors: ["Nur einen Sommer", "Nur einen Winter", "Fünf Jahreszeiten"],
    explanation: "The text says: \"In Kenia gibt es eine Regenzeit und eine Trockenzeit, aber keine vier Jahreszeiten.\"",
  },
  {
    q: "Warum findet Mumbi den Winter interessant?",
    correct: "Weil sie noch nie Schnee gesehen hat.",
    distractors: ["Weil sie den Sommer nicht mag.", "Weil es in Kenia auch schneit.", "Weil ihre Familie in Deutschland lebt."],
    explanation: "The text says: \"Mumbi findet den Winter in Deutschland interessant, weil sie noch nie Schnee gesehen hat.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mumbi schreibt über die ", after: " in Deutschland.", answer: "Jahreszeiten", gloss: "Mumbi writes about the seasons in Germany." },
  { before: "Im Frühling werden die Tage ", after: ", und es regnet oft.", answer: "wärmer", gloss: "In spring the days get warmer, and it often rains." },
  { before: "Im Sommer ist es heiß, und die Sonne scheint ", after: ".", answer: "viel", gloss: "In summer it is hot, and the sun shines a lot." },
  { before: "Im Herbst wird es kälter, und die Blätter fallen von den ", after: ".", answer: "Bäumen", gloss: "In autumn it gets colder, and the leaves fall from the trees." },
  { before: "Im Winter schneit es oft, und man trägt eine Mütze und einen ", after: ".", answer: "Pullover", gloss: "In winter it often snows, and one wears a cap and a sweater." },
  { before: "In Kenia gibt es keinen ", after: ".", answer: "Schnee", gloss: "In Kenya there is no snow." },
  { before: "In Kenia gibt es eine Regenzeit und eine ", after: ".", answer: "Trockenzeit", gloss: "In Kenya there is a rainy season and a dry season." },
  { before: "Mumbi hat noch nie ", after: " gesehen.", answer: "Schnee", gloss: "Mumbi has never seen snow." },
  { before: "Sie möchte einmal den Winter in Deutschland ", after: ".", answer: "erleben", gloss: "She would like to experience winter in Germany once." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["In Deutschland", "gibt es", "vier Jahreszeiten", "."], sentence: "In Deutschland gibt es vier Jahreszeiten." },
  { chunks: ["In Kenia", "gibt es", "keinen Schnee", "."], sentence: "In Kenia gibt es keinen Schnee." },
];

export const weatherReading: Skill = {
  id: "g7-de-r-weather",
  code: "R.8",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: weather, seasons, and clothing",
  description: "Read a short German passage comparing the four German seasons to Kenya's climate, and answer comprehension questions.",
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
        hint: "Reread the passage carefully, comparing what it says about Germany and Kenya.",
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
      hint: "Look at exactly what the passage says about this season or country.",
      explanation: q.explanation,
    };
  },
};
