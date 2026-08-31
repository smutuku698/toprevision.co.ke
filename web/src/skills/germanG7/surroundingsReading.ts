import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Otieno geht am Samstag zum Markt.",
  "Er hat zweihundert Ksh dabei.",
  "Am ersten Stand verkauft eine Verkäuferin Tomaten. Ein Kilo kostet fünfzig Ksh.",
  "Otieno kauft zwei Kilo Tomaten. Das kostet hundert Ksh.",
  "Am zweiten Stand verkauft ein Verkäufer Zwiebeln. Ein Kilo kostet dreißig Ksh.",
  "Otieno kauft ein Kilo Zwiebeln. Das kostet dreißig Ksh.",
  "Otieno hat jetzt noch siebzig Ksh.",
  "Das Obst am dritten Stand ist ihm zu teuer.",
  "Otieno kauft kein Obst.",
  "Er geht mit Tomaten und Zwiebeln nach Hause.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Otieno geht am Samstag zum Markt.", isTrue: true },
  { text: "Otieno hat dreihundert Ksh dabei.", isTrue: false },
  { text: "Ein Kilo Tomaten kostet fünfzig Ksh.", isTrue: true },
  { text: "Otieno kauft drei Kilo Tomaten.", isTrue: false },
  { text: "Otieno kauft ein Kilo Zwiebeln.", isTrue: true },
  { text: "Ein Kilo Zwiebeln kostet dreißig Ksh.", isTrue: true },
  { text: "Otieno kauft Obst am dritten Stand.", isTrue: false },
  { text: "Otieno hat am Ende noch siebzig Ksh.", isTrue: true },
  { text: "Otieno geht mit leeren Händen nach Hause.", isTrue: false },
  { text: "Das Obst ist Otieno zu teuer.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Otieno geht am Samstag zum Markt.", meaning: "Otieno goes to the market on Saturday." },
  { phrase: "Er hat zweihundert Ksh dabei.", meaning: "He has two hundred Ksh with him." },
  { phrase: "Eine Verkäuferin verkauft Tomaten.", meaning: "A saleswoman sells tomatoes." },
  { phrase: "Ein Kilo kostet fünfzig Ksh.", meaning: "A kilo costs fifty Ksh." },
  { phrase: "Otieno kauft zwei Kilo Tomaten.", meaning: "Otieno buys two kilos of tomatoes." },
  { phrase: "Das Obst ist ihm zu teuer.", meaning: "The fruit is too expensive for him." },
  { phrase: "Otieno kauft kein Obst.", meaning: "Otieno doesn't buy any fruit." },
  { phrase: "Er geht nach Hause.", meaning: "He goes home." },
  { phrase: "Otieno hat noch siebzig Ksh.", meaning: "Otieno still has seventy Ksh." },
  { phrase: "Ein Verkäufer verkauft Zwiebeln.", meaning: "A salesman sells onions." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wie viel Geld hat Otieno am Anfang?",
    correct: "Zweihundert Ksh",
    distractors: ["Hundert Ksh", "Dreihundert Ksh", "Fünfzig Ksh"],
    explanation: "The passage says: \"Er hat zweihundert Ksh dabei.\" — He has two hundred Ksh with him.",
  },
  {
    q: "Warum kauft Otieno kein Obst?",
    correct: "Es ist ihm zu teuer.",
    distractors: ["Er mag kein Obst.", "Es gibt kein Obst am Markt.", "Er hat schon genug Obst."],
    explanation: "The passage says: \"Das Obst am dritten Stand ist ihm zu teuer.\" — The fruit at the third stall is too expensive for him.",
  },
  {
    q: "Wie viel Geld hat Otieno am Ende noch?",
    correct: "Siebzig Ksh",
    distractors: ["Zweihundert Ksh", "Dreißig Ksh", "Zehn Ksh"],
    explanation: "The passage says: \"Otieno hat jetzt noch siebzig Ksh.\" after buying tomatoes and onions.",
  },
  {
    q: "Was kauft Otieno am zweiten Stand?",
    correct: "Zwiebeln",
    distractors: ["Tomaten", "Obst", "Kartoffeln"],
    explanation: "The passage says: \"Am zweiten Stand verkauft ein Verkäufer Zwiebeln.\" — At the second stall a salesman sells onions.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Otieno geht am Samstag zum ", after: ".", answer: "Markt", gloss: "Otieno goes to the market on Saturday." },
  { before: "Er hat zweihundert Ksh ", after: ".", answer: "dabei", gloss: "He has two hundred Ksh with him." },
  { before: "Am ersten Stand verkauft eine ", after: " Tomaten.", answer: "Verkäuferin", gloss: "A saleswoman sells tomatoes at the first stall." },
  { before: "Ein Kilo ", after: " fünfzig Ksh.", answer: "kostet", gloss: "A kilo costs fifty Ksh." },
  { before: "Otieno kauft zwei ", after: " Tomaten.", answer: "Kilo", gloss: "Otieno buys two kilos of tomatoes." },
  { before: "Am zweiten Stand verkauft ein ", after: " Zwiebeln.", answer: "Verkäufer", gloss: "A salesman sells onions at the second stall." },
  { before: "Otieno hat jetzt noch siebzig ", after: ".", answer: "Ksh", gloss: "Otieno now has seventy Ksh left." },
  { before: "Das Obst am dritten Stand ist ihm zu ", after: ".", answer: "teuer", gloss: "The fruit at the third stall is too expensive for him." },
  { before: "Otieno kauft kein ", after: ".", answer: "Obst", gloss: "Otieno doesn't buy any fruit." },
  { before: "Er geht mit Tomaten und Zwiebeln nach ", after: ".", answer: "Hause", gloss: "He goes home with tomatoes and onions." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Otieno", "geht am Samstag", "zum Markt", "."], sentence: "Otieno geht am Samstag zum Markt." },
  { chunks: ["Er geht", "mit Tomaten und Zwiebeln", "nach Hause", "."], sentence: "Er geht mit Tomaten und Zwiebeln nach Hause." },
];

export const surroundingsReading: Skill = {
  id: "g7-de-r-surroundings",
  code: "R.3",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: my surroundings, at the market",
  description: "Read a short German passage about a market shopping trip and answer comprehension questions, including budget reasoning.",
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
        hint: "Track the money carefully — how much Otieno spends and how much he has left.",
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
      hint: "Track the numbers in the passage carefully.",
      explanation: q.explanation,
    };
  },
};

