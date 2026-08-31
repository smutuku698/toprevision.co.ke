import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Frau Njeri: Guten Tag, Herr Otieno! Was ist Ihr Vater von Beruf?",
  "Herr Otieno: Er ist Lehrer von Beruf. Und Ihre Mutter, was ist sie von Beruf?",
  "Frau Njeri: Meine Mutter ist Ärztin von Beruf. Wie alt ist Ihre Cousine?",
  "Herr Otieno: Meine Cousine ist zehn Jahre alt. Und Ihr Bruder, wie alt ist er?",
  "Frau Njeri: Mein Bruder ist zwanzig Jahre alt.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is Herr Otieno's father's profession?",
    correct: "Er ist Lehrer von Beruf.",
    distractors: ["Er ist Arzt von Beruf.", "Er ist Ingenieur von Beruf.", "Er ist Koch von Beruf."],
    explanation: "Herr Otieno says \"Er ist Lehrer von Beruf\" — his father is a teacher.",
  },
  {
    q: "What is Frau Njeri's mother's profession?",
    correct: "Meine Mutter ist Ärztin von Beruf.",
    distractors: ["Meine Mutter ist Lehrerin von Beruf.", "Meine Mutter ist Bäuerin von Beruf.", "Meine Mutter ist Köchin von Beruf."],
    explanation: "Frau Njeri says \"Meine Mutter ist Ärztin von Beruf\" — her mother is a doctor.",
  },
  {
    q: "How old is Herr Otieno's cousin?",
    correct: "Meine Cousine ist zehn Jahre alt.",
    distractors: ["Meine Cousine ist zwanzig Jahre alt.", "Meine Cousine ist neun Jahre alt.", "Mein Bruder ist zehn Jahre alt."],
    explanation: "Herr Otieno answers \"Meine Cousine ist zehn Jahre alt.\"",
  },
  {
    q: "How old is Frau Njeri's brother?",
    correct: "Mein Bruder ist zwanzig Jahre alt.",
    distractors: ["Mein Bruder ist zehn Jahre alt.", "Meine Cousine ist zwanzig Jahre alt.", "Mein Bruder ist neun Jahre alt."],
    explanation: "Frau Njeri answers \"Mein Bruder ist zwanzig Jahre alt.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Herr Otieno's father is a teacher.", isTrue: true },
  { text: "Frau Njeri's mother is a farmer.", isTrue: false },
  { text: "Herr Otieno's cousin is ten years old.", isTrue: true },
  { text: "Frau Njeri's brother is nine years old.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "der Vater", meaning: "father" },
  { phrase: "die Mutter", meaning: "mother" },
  { phrase: "der Bruder", meaning: "brother" },
  { phrase: "die Cousine", meaning: "female cousin" },
  { phrase: "der Lehrer", meaning: "teacher (male)" },
  { phrase: "die Ärztin", meaning: "doctor (female)" },
  { phrase: "Wie alt sind Sie?", meaning: "How old are you? (formal)" },
  { phrase: "Was sind Sie von Beruf?", meaning: "What is your profession? (formal)" },
];

export const familyReading: Skill = {
  id: "g8-de-r-family",
  code: "R.2",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: extended family",
  description: "Read a formal German dialogue in which two adults ask each other about family members' professions and ages, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check each family member's profession and age.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
        prompt: "Match each German family word or phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these family words in the dialogue above.",
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
        hint: "The dialogue starts by asking about Herr Otieno's father and ends with Frau Njeri's brother's age.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
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
      hint: "Look at how each family member is described in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
