import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Hallo! Ich heiße Faith. Ich stelle meine Familie vor.",
  "Das ist mein Vater. Er heißt Samuel. Er ist fünfundvierzig Jahre alt.",
  "Mein Vater ist Lehrer von Beruf.",
  "Das ist meine Mutter. Sie heißt Grace. Sie ist zweiundvierzig Jahre alt.",
  "Meine Mutter ist Ärztin von Beruf.",
  "Ich habe einen Bruder. Er heißt Kevin. Er ist sechzehn Jahre alt.",
  "Mein Bruder ist noch Schüler.",
  "Ich habe auch eine Schwester. Sie heißt Lucy. Sie ist zehn Jahre alt.",
  "Meine Schwester ist auch noch Schülerin.",
  "Meine Eltern heißen Samuel und Grace.",
  "Ich habe zwei Geschwister: einen Bruder und eine Schwester.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Faiths Vater heißt Samuel.", isTrue: true },
  { text: "Faiths Vater ist Arzt von Beruf.", isTrue: false },
  { text: "Faiths Mutter ist Ärztin von Beruf.", isTrue: true },
  { text: "Faiths Mutter heißt Lucy.", isTrue: false },
  { text: "Faiths Bruder heißt Kevin.", isTrue: true },
  { text: "Faiths Bruder ist sechzehn Jahre alt.", isTrue: true },
  { text: "Faiths Schwester ist zehn Jahre alt.", isTrue: true },
  { text: "Faith hat drei Geschwister.", isTrue: false },
  { text: "Faiths Vater ist fünfundvierzig Jahre alt.", isTrue: true },
  { text: "Faiths Schwester heißt Lucy.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Ich stelle meine Familie vor.", meaning: "I am introducing my family." },
  { phrase: "Das ist mein Vater.", meaning: "This is my father." },
  { phrase: "Er ist Lehrer von Beruf.", meaning: "He is a teacher by profession." },
  { phrase: "Das ist meine Mutter.", meaning: "This is my mother." },
  { phrase: "Sie ist Ärztin von Beruf.", meaning: "She is a doctor by profession." },
  { phrase: "Ich habe einen Bruder.", meaning: "I have a brother." },
  { phrase: "Er ist noch Schüler.", meaning: "He is still a student." },
  { phrase: "Ich habe auch eine Schwester.", meaning: "I also have a sister." },
  { phrase: "Meine Eltern heißen Samuel und Grace.", meaning: "My parents are named Samuel and Grace." },
  { phrase: "Ich habe zwei Geschwister.", meaning: "I have two siblings." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Was ist Faiths Vater von Beruf?",
    correct: "Lehrer",
    distractors: ["Arzt", "Ingenieur", "Bauer"],
    explanation: "The text says: \"Mein Vater ist Lehrer von Beruf.\" — My father is a teacher.",
  },
  {
    q: "Wie alt ist Faiths Mutter?",
    correct: "Zweiundvierzig Jahre alt",
    distractors: ["Fünfundvierzig Jahre alt", "Sechzehn Jahre alt", "Zehn Jahre alt"],
    explanation: "The text says: \"Sie ist zweiundvierzig Jahre alt.\" — She is forty-two years old, referring to the mother.",
  },
  {
    q: "Wie viele Geschwister hat Faith?",
    correct: "Zwei",
    distractors: ["Eins", "Drei", "Keine"],
    explanation: "The text says: \"Ich habe zwei Geschwister: einen Bruder und eine Schwester.\" — I have two siblings.",
  },
  {
    q: "Wie heißt Faiths Schwester?",
    correct: "Lucy",
    distractors: ["Grace", "Kevin", "Samuel"],
    explanation: "The text says: \"Ich habe auch eine Schwester. Sie heißt Lucy.\" — I also have a sister. Her name is Lucy.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Das ist mein Vater. Er ", after: " Samuel.", answer: "heißt", gloss: "This introduces the father's name." },
  { before: "Mein Vater ist ", after: " von Beruf.", answer: "Lehrer", gloss: "The father's profession is teacher." },
  { before: "Das ist meine Mutter. Sie ", after: " Grace.", answer: "heißt", gloss: "This introduces the mother's name." },
  { before: "Meine Mutter ist ", after: " von Beruf.", answer: "Ärztin", gloss: "The mother's profession is doctor." },
  { before: "Ich habe einen ", after: ". Er heißt Kevin.", answer: "Bruder", gloss: "This introduces the brother." },
  { before: "Mein Bruder ist ", after: " Schüler.", answer: "noch", gloss: "The brother is still a student." },
  { before: "Ich habe auch eine ", after: ". Sie heißt Lucy.", answer: "Schwester", gloss: "This introduces the sister." },
  { before: "Meine Eltern ", after: " Samuel und Grace.", answer: "heißen", gloss: "The parents' names are given." },
  { before: "Ich habe zwei ", after: ": einen Bruder und eine Schwester.", answer: "Geschwister", gloss: "The total number of siblings is stated." },
  { before: "Faiths Bruder ist ", after: " Jahre alt.", answer: "sechzehn", gloss: "The brother's age is sixteen." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Das ist", "mein Vater", "."], sentence: "Das ist mein Vater." },
  { chunks: ["Mein Vater", "ist", "Lehrer von Beruf", "."], sentence: "Mein Vater ist Lehrer von Beruf." },
];

export const familyReading: Skill = {
  id: "g7-de-r-family",
  code: "R.2",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: nuclear family and professions",
  description: "Read a short German passage where a learner introduces their nuclear family, and answer comprehension questions.",
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
        hint: "Reread the passage carefully and check each family member's exact age and profession.",
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
      hint: "Look at exactly what the passage says about this family member.",
      explanation: q.explanation,
    };
  },
};
