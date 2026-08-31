import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Achieng beschreibt ihre beste Freundin, Faith.",
  "Faith ist groß und sportlich.",
  "Ihre Haare sind lang und lockig.",
  "Ihre Augen sind dunkel.",
  "Faith ist auch sehr klug und lustig.",
  "Sie ist immer freundlich zu allen Klassenkameraden.",
  "Achieng beschreibt auch ihren Bruder Kevin.",
  "Kevin ist klein, aber sehr stark.",
  "Seine Haare sind kurz und glatt.",
  "Achieng findet, man sollte immer positiv über andere sprechen.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Faith ist groß und sportlich.", isTrue: true },
  { text: "Faiths Haare sind kurz und glatt.", isTrue: false },
  { text: "Faiths Augen sind dunkel.", isTrue: true },
  { text: "Faith ist unfreundlich zu Klassenkameraden.", isTrue: false },
  { text: "Faith ist klug und lustig.", isTrue: true },
  { text: "Kevin ist groß und schwach.", isTrue: false },
  { text: "Kevin ist klein, aber stark.", isTrue: true },
  { text: "Kevins Haare sind lockig.", isTrue: false },
  { text: "Kevins Haare sind kurz und glatt.", isTrue: true },
  { text: "Achieng findet, man sollte positiv über andere sprechen.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Faith ist groß und sportlich.", meaning: "Faith is tall and athletic." },
  { phrase: "Ihre Haare sind lang und lockig.", meaning: "Her hair is long and curly." },
  { phrase: "Ihre Augen sind dunkel.", meaning: "Her eyes are dark." },
  { phrase: "Faith ist sehr klug und lustig.", meaning: "Faith is very smart and funny." },
  { phrase: "Sie ist immer freundlich.", meaning: "She is always friendly." },
  { phrase: "Kevin ist klein, aber sehr stark.", meaning: "Kevin is short, but very strong." },
  { phrase: "Seine Haare sind kurz und glatt.", meaning: "His hair is short and straight." },
  { phrase: "Man sollte positiv über andere sprechen.", meaning: "One should speak positively about others." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wie sind Faiths Haare?",
    correct: "Lang und lockig",
    distractors: ["Kurz und glatt", "Kurz und lockig", "Lang und glatt"],
    explanation: "The passage says: \"Ihre Haare sind lang und lockig.\"",
  },
  {
    q: "Wie beschreibt Achieng Kevin?",
    correct: "Klein, aber sehr stark",
    distractors: ["Groß und stark", "Klein und schwach", "Groß und schwach"],
    explanation: "The passage says: \"Kevin ist klein, aber sehr stark.\"",
  },
  {
    q: "Welche zwei Persönlichkeitswörter beschreiben Faith?",
    correct: "Klug und lustig",
    distractors: ["Groß und stark", "Dunkel und lang", "Klein und schwach"],
    explanation: "The passage says: \"Faith ist auch sehr klug und lustig.\" — Klug and lustig describe personality; the others describe physical traits.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Achieng beschreibt ihre beste ", after: ", Faith.", answer: "Freundin", gloss: "Achieng describes her best friend, Faith." },
  { before: "Faith ist groß und ", after: ".", answer: "sportlich", gloss: "Faith is tall and athletic." },
  { before: "Ihre Haare sind lang und ", after: ".", answer: "lockig", gloss: "Her hair is long and curly." },
  { before: "Ihre Augen sind ", after: ".", answer: "dunkel", gloss: "Her eyes are dark." },
  { before: "Faith ist auch sehr klug und ", after: ".", answer: "lustig", gloss: "Faith is also very smart and funny." },
  { before: "Sie ist immer ", after: " zu allen Klassenkameraden.", answer: "freundlich", gloss: "She is always friendly to all classmates." },
  { before: "Kevin ist klein, aber sehr ", after: ".", answer: "stark", gloss: "Kevin is short, but very strong." },
  { before: "Seine Haare sind kurz und ", after: ".", answer: "glatt", gloss: "His hair is short and straight." },
  { before: "Achieng findet, man sollte immer positiv über andere ", after: ".", answer: "sprechen", gloss: "Achieng thinks one should always speak positively about others." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Faith", "ist", "groß und sportlich", "."], sentence: "Faith ist groß und sportlich." },
  { chunks: ["Kevin", "ist", "klein, aber sehr stark", "."], sentence: "Kevin ist klein, aber sehr stark." },
];

export const bodyReading: Skill = {
  id: "g7-de-r-body",
  code: "R.7",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: describing physical appearances",
  description: "Read a short German passage describing two people's appearance and personality, and answer comprehension questions.",
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
        hint: "Reread the passage carefully — Faith and Kevin have different described traits.",
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
      hint: "Look at exactly which traits the passage assigns to Faith versus Kevin.",
      explanation: q.explanation,
    };
  },
};
