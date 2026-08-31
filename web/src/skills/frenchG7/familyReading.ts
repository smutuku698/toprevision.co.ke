import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Amani : Voici ma famille. Mon père s'appelle Kamau. Il est agriculteur.",
  "Amani : Ma mère s'appelle Faith. Elle est médecin.",
  "Amani : J'ai un frère et une sœur.",
  "Amani : Mon frère s'appelle Kevin. Il a quinze ans. Il est élève.",
  "Amani : Ma sœur s'appelle Njeri. Elle a dix ans. Elle est élève aussi.",
  "Amani : Nous habitons tous à Nakuru.",
  "Amani : J'aime beaucoup ma famille.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amani's father is called Kamau.", isTrue: true },
  { text: "Amani's father is a doctor.", isTrue: false },
  { text: "Amani's mother is a doctor.", isTrue: true },
  { text: "Amani has two brothers.", isTrue: false },
  { text: "Amani's brother is called Kevin.", isTrue: true },
  { text: "Kevin is fifteen years old.", isTrue: true },
  { text: "Njeri is Amani's sister.", isTrue: true },
  { text: "Njeri is fifteen years old.", isTrue: false },
  { text: "The family lives in Nakuru.", isTrue: true },
  { text: "Amani says she loves her family very much.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Voici ma famille.", meaning: "Here is my family." },
  { phrase: "Il est agriculteur.", meaning: "He is a farmer." },
  { phrase: "Elle est médecin.", meaning: "She is a doctor." },
  { phrase: "J'ai un frère et une sœur.", meaning: "I have a brother and a sister." },
  { phrase: "Il a quinze ans.", meaning: "He is fifteen years old." },
  { phrase: "Elle a dix ans.", meaning: "She is ten years old." },
  { phrase: "Il est élève.", meaning: "He is a pupil." },
  { phrase: "Nous habitons tous à Nakuru.", meaning: "We all live in Nakuru." },
  { phrase: "J'aime beaucoup ma famille.", meaning: "I love my family very much." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel est le métier du père d'Amani ?",
    correct: "Agriculteur",
    distractors: ["Médecin", "Professeur", "Chauffeur"],
    explanation: "The text says: \"Mon père s'appelle Kamau. Il est agriculteur.\" — He is a farmer.",
  },
  {
    q: "Quel âge a Kevin ?",
    correct: "Quinze ans",
    distractors: ["Dix ans", "Douze ans", "Treize ans"],
    explanation: "The text says: \"Mon frère s'appelle Kevin. Il a quinze ans.\"",
  },
  {
    q: "Où habite la famille d'Amani ?",
    correct: "À Nakuru",
    distractors: ["À Nairobi", "À Kisumu", "À Mombasa"],
    explanation: "The text says: \"Nous habitons tous à Nakuru.\" — We all live in Nakuru.",
  },
  {
    q: "Combien de frères et sœurs a Amani ?",
    correct: "Un frère et une sœur",
    distractors: ["Deux frères", "Deux sœurs", "Aucun"],
    explanation: "The text says: \"J'ai un frère et une sœur.\" — I have a brother and a sister.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mon père s'appelle Kamau. Il est ", after: ".", answer: "agriculteur", gloss: "He is a farmer." },
  { before: "Ma mère s'appelle Faith. Elle est ", after: ".", answer: "médecin", gloss: "She is a doctor." },
  { before: "J'ai un frère et une ", after: ".", answer: "sœur", gloss: "I have a brother and a sister." },
  { before: "Mon frère s'appelle Kevin. Il a quinze ", after: ".", answer: "ans", gloss: "He is fifteen years old." },
  { before: "Ma sœur s'appelle Njeri. Elle a dix ", after: ".", answer: "ans", gloss: "She is ten years old." },
  { before: "Nous habitons tous à ", after: ".", answer: "Nakuru", gloss: "We all live in Nakuru." },
  { before: "J'aime beaucoup ma ", after: ".", answer: "famille", gloss: "I love my family very much." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon", "père", "s'appelle", "Kamau", "."], sentence: "Mon père s'appelle Kamau." },
  { chunks: ["Il", "a", "quinze", "ans", "."], sentence: "Il a quinze ans." },
  { chunks: ["Nous", "habitons", "tous", "à", "Nakuru", "."], sentence: "Nous habitons tous à Nakuru." },
];

export const familyReading: Skill = {
  id: "g7-fr-r-family",
  code: "R.2",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: nuclear family and professions",
  description: "Read a short French passage describing Amani's family — names, ages, and professions — and answer comprehension questions.",
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
        hint: "Reread the passage carefully and check exactly what it says about each family member.",
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
        prompt: "Match each phrase from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the passage above.",
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
        acceptedAnswers: accentAccepted(item.answer),
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
      hint: "Look at what the passage actually says about each family member.",
      explanation: q.explanation,
    };
  },
};
