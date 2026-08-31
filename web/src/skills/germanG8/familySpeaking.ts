import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const WORDS: { word: string; meaning: string; gender: "masculine" | "feminine" }[] = [
  { word: "der Vater", meaning: "father", gender: "masculine" },
  { word: "die Mutter", meaning: "mother", gender: "feminine" },
  { word: "die Großmutter", meaning: "grandmother", gender: "feminine" },
  { word: "der Großvater", meaning: "grandfather", gender: "masculine" },
  { word: "der Onkel", meaning: "uncle", gender: "masculine" },
  { word: "die Tante", meaning: "aunt", gender: "feminine" },
  { word: "der Cousin", meaning: "cousin (male)", gender: "masculine" },
  { word: "die Cousine", meaning: "cousin (female)", gender: "feminine" },
  { word: "der Bruder", meaning: "brother", gender: "masculine" },
  { word: "die Schwester", meaning: "sister", gender: "feminine" },
  { word: "der Lehrer", meaning: "teacher (male)", gender: "masculine" },
  { word: "die Lehrerin", meaning: "teacher (female)", gender: "feminine" },
  { word: "der Arzt", meaning: "doctor (male)", gender: "masculine" },
  { word: "die Ärztin", meaning: "doctor (female)", gender: "feminine" },
  { word: "der Ingenieur", meaning: "engineer (male)", gender: "masculine" },
  { word: "die Ingenieurin", meaning: "engineer (female)", gender: "feminine" },
  { word: "der Bauer", meaning: "farmer (male)", gender: "masculine" },
  { word: "die Bäuerin", meaning: "farmer (female)", gender: "feminine" },
  { word: "der Koch", meaning: "cook (male)", gender: "masculine" },
  { word: "die Köchin", meaning: "cook (female)", gender: "feminine" },
];

const SENTENCES: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wer ist das? — Das ist mein Onkel.",
    correct: "That is my uncle.",
    distractors: ["That is my aunt.", "That is my grandfather.", "That is my cousin."],
    explanation: "'Mein Onkel' means 'my uncle' — the brother of one of your parents.",
  },
  {
    q: "Was bedeutet 'Was sind Sie von Beruf?' auf Englisch?",
    correct: "What is your profession?",
    distractors: ["How old are you?", "What is your name?", "Where do you live?"],
    explanation: "'Was sind Sie von Beruf?' formally asks about someone's profession.",
  },
  {
    q: "Was bedeutet 'der Bauer' auf Englisch?",
    correct: "the farmer (male)",
    distractors: ["the cook (male)", "the engineer (male)", "the doctor (male)"],
    explanation: "'Der Bauer' means 'the farmer' (male); the female form is 'die Bäuerin'.",
  },
  {
    q: "Welcher Satz ist die FORMELLE (Sie) Frage nach dem Alter?",
    correct: "Wie alt sind Sie?",
    distractors: ["Wie alt bist du?"],
    explanation: "'Wie alt sind Sie?' uses the formal 'Sie'; 'Wie alt bist du?' is the informal 'du' version.",
  },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Wie ", after: " sind Sie?", answer: "alt" },
  { before: "Wie alt ist Ihr ", after: "?", answer: "Vater" },
  { before: "Was sind Sie von ", after: "?", answer: "Beruf" },
  { before: "Ich bin ", after: " von Beruf.", answer: "Lehrerin" },
  { before: "Ich bin ", after: " von Beruf.", answer: "Arzt" },
  { before: "Ich bin ", after: " von Beruf.", answer: "Bäuerin" },
  { before: "Ich bin ", after: " von Beruf.", answer: "Ingenieur" },
  { before: "Ich bin ", after: " von Beruf.", answer: "Köchin" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie alt", "sind Sie", "?"], sentence: "Wie alt sind Sie?" },
  { chunks: ["Was sind Sie", "von Beruf", "?"], sentence: "Was sind Sie von Beruf?" },
  { chunks: ["Wie alt ist", "Ihr Vater", "?"], sentence: "Wie alt ist Ihr Vater?" },
];

export const familySpeaking: Skill = {
  id: "g8-de-ls-family",
  code: "LS.2",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "Extended family",
  description: "Learn and use vocabulary for extended family members and professions in German, using the formal Sie-Form.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const masculine = shuffle(rng, WORDS.filter((w) => w.gender === "masculine")).slice(0, 4);
      const feminine = shuffle(rng, WORDS.filter((w) => w.gender === "feminine")).slice(0, 4);
      const items = shuffle(rng, [...masculine, ...feminine]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.word] = item.gender;

      return {
        kind: "categorize",
        prompt: "Sort each word as Masculine (der) or Feminine (die).",
        items: items.map((it) => ({ id: it.word, label: it.word })),
        buckets: [
          { id: "masculine", label: "Masculine (der)" },
          { id: "feminine", label: "Feminine (die)" },
        ],
        correctBucket,
        hint: "Look at the article in front of the word: 'der' (masculine) versus 'die' (feminine).",
        explanation: `Masculine: ${masculine.map((w) => w.word).join(" / ")}. Feminine: ${feminine.map((w) => w.word).join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence about family or profession.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the family or profession vocabulary and the formal (Sie) question being answered.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, formal German sentence about family.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal questions in German usually start with a question word, then the verb.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const q = randChoice(rng, SENTENCES);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think carefully about which family member, profession, or register (formal/informal) is being described.",
        explanation: q.explanation,
      };
    }

    const chosen = shuffle(rng, WORDS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
    const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
    const correctMap: Record<string, string> = {};
    for (const w of chosen) correctMap[w.word] = w.word;

    return {
      kind: "click-match",
      prompt: "Match each German family or profession word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Notice the difference between 'der Cousin' (male cousin) and 'die Cousine' (female cousin).",
      explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
    };
  },
};
