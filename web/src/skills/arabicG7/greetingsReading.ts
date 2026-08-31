import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Amina: Assalamu alaykum!",
  "Juma: Wa alaykumu assalam. Sabahal khayr!",
  "Amina: Sabahal khayr! Maa ismuka?",
  "Juma: Ismi Juma. Keyfa haaluka?",
  "Amina: Bikhayr shukran. Wa anta?",
  "Juma: Bikhayr, alhamdulillah.",
  "Amina: Ma'a as-salama!",
  "Juma: Ma'a as-salama!",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who greets first in the dialogue?",
    correct: "Amina",
    distractors: ["Juma", "The teacher", "Neither — they speak at the same time"],
    explanation: "Amina opens the dialogue with \"Assalamu alaykum!\"",
  },
  {
    q: "What does Juma say when Amina greets him?",
    correct: "Wa alaykumu assalam (And peace be upon you too)",
    distractors: ["Ma'a as-salama (Goodbye)", "Keyfa haaluka? (How are you?)", "Ismi Juma (My name is Juma)"],
    explanation: "Juma replies \"Wa alaykumu assalam\" — the standard response to \"Assalamu alaykum.\"",
  },
  {
    q: "How does Juma answer when Amina asks \"Keyfa haaluka?\"",
    correct: "Bikhayr, alhamdulillah (Well, praise be to God)",
    distractors: ["Ma'a as-salama (Goodbye)", "Sabahal khayr (Good morning)", "Maa ismuka? (What is your name?)"],
    explanation: "Juma answers \"Bikhayr, alhamdulillah\" — \"I am well, praise be to God.\"",
  },
  {
    q: "What do both Amina and Juma say to end the conversation?",
    correct: "Ma'a as-salama (Goodbye)",
    distractors: ["Sabahal khayr (Good morning)", "Assalamu alaykum (Peace be upon you)", "Shukran (Thank you)"],
    explanation: "Both say \"Ma'a as-salama\" to close the conversation.",
  },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Assalamu alaykum", meaning: "Peace be upon you" },
  { phrase: "Wa alaykumu assalam", meaning: "And peace be upon you too" },
  { phrase: "Sabahal khayr", meaning: "Good morning" },
  { phrase: "Maa ismuka?", meaning: "What is your name?" },
  { phrase: "Keyfa haaluka?", meaning: "How are you?" },
  { phrase: "Ma'a as-salama", meaning: "Goodbye" },
];

// Sub-strand 2.1 SLO: "read words and phrases while underlining huruf shamsiyya and
// huruf qamariyyah." Moon letters keep the "al-" prefix pronounced as written; sun
// letters cause the L to assimilate into the following consonant (written "al-" but
// not pronounced with an L sound).
const MOON_SUN: { word: string; bucket: "Moon" | "Sun" }[] = [
  { word: "al-qamar (the moon)", bucket: "Moon" },
  { word: "al-kitab (the book)", bucket: "Moon" },
  { word: "al-bayt (the house)", bucket: "Moon" },
  { word: "al-walad (the boy)", bucket: "Moon" },
  { word: "ash-shams (the sun)", bucket: "Sun" },
  { word: "an-najma (the star)", bucket: "Sun" },
  { word: "at-tilmeedh (the student)", bucket: "Sun" },
  { word: "ar-rajul (the man)", bucket: "Sun" },
];

const FILL: { before: string; after: string; correct: string; accepted?: string[] }[] = [
  { before: "Juma: Wa alaykumu ", after: " (And peace be upon you too).", correct: "assalam" },
  { before: "Amina: Maa ", after: "? (What is your name?)", correct: "ismuka" },
  { before: "To say \"good morning\" in Arabic, you say \"", after: " khayr.\"", correct: "sabahal" },
  { before: "To say \"thank you\" in Arabic, you say \"", after: ".\"", correct: "shukran" },
  { before: "To say goodbye in Arabic, you say \"", after: " as-salama.\"", correct: "maa" },
];

export const greetingsReading: Skill = {
  id: "g7-ar-r-greetings",
  code: "R.1",
  subjectId: "arabic",
  strandId: "g7-ar-reading",
  grade: 7,
  title: "Reading aloud: greetings and introductions",
  description: "Read a short Arabic dialogue between two students meeting for the first time, and practice sorting moon-letter and sun-letter words.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "categorize") {
      const items = MOON_SUN.map((m, i) => ({ id: `w${i}`, label: m.word, bucket: m.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word by whether \"al-\" keeps its L sound (moon letter) or the L sound changes (sun letter).",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Moon", label: "Moon letter (al- pronounced as written)" },
          { id: "Sun", label: "Sun letter (al- sound changes)" },
        ],
        correctBucket,
        hint: "Moon letters (like q, k, b, w) keep the L sound of \"al-\". Sun letters (like sh, n, t, r) cause the L to disappear and the first letter of the word to double instead.",
        explanation: MOON_SUN.map((m) => `"${m.word}" is a ${m.bucket === "Moon" ? "moon letter word — al- is pronounced as written" : "sun letter word — the L sound changes"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each expression from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Amina greets Juma first, then they exchange names, feelings, and finally say goodbye.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing word from the dialogue.",
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: f.accepted,
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
        explanation: `The missing word is "${f.correct}".`,
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
      hint: "Look at what each person says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
