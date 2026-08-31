import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Frau Njeri: Guten Tag! Wie geht es Ihnen?",
  "Herr Otieno: Mir geht es gut, danke. Und Ihnen?",
  "Frau Njeri: Sehr gut, danke. Wie heißen Sie?",
  "Herr Otieno: Ich heiße Otieno. Freut mich, Sie kennenzulernen.",
  "Frau Njeri: Freut mich auch. Auf Wiedersehen!",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "How does Frau Njeri greet Herr Otieno at the start of the dialogue?",
    correct: "Guten Tag! Wie geht es Ihnen?",
    distractors: ["Wie heißt du?", "Auf Wiedersehen!", "Wie heißen Sie?"],
    explanation: "Frau Njeri opens with \"Guten Tag! Wie geht es Ihnen?\" — a formal greeting using the 'Sie' form.",
  },
  {
    q: "What is the man's name in the dialogue?",
    correct: "Otieno",
    distractors: ["Njeri", "Kamau", "Amina"],
    explanation: "The man says \"Ich heiße Otieno.\"",
  },
  {
    q: "How does Herr Otieno answer when Frau Njeri asks \"Wie geht es Ihnen?\"?",
    correct: "Mir geht es gut, danke. Und Ihnen?",
    distractors: ["Ich heiße Otieno.", "Auf Wiedersehen!", "Freut mich, Sie kennenzulernen."],
    explanation: "Herr Otieno replies \"Mir geht es gut, danke. Und Ihnen?\"",
  },
  {
    q: "Which phrase does Frau Njeri use to ask for Herr Otieno's name?",
    correct: "Wie heißen Sie?",
    distractors: ["Wie geht es Ihnen?", "Wie heißt du?", "Auf Wiedersehen!"],
    explanation: "She asks politely: \"Wie heißen Sie?\" — the formal way to ask someone's name.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Frau Njeri and Herr Otieno use the formal 'Sie' form with each other.", isTrue: true },
  { text: "Herr Otieno says he is doing badly.", isTrue: false },
  { text: "Herr Otieno is pleased to meet Frau Njeri.", isTrue: true },
  { text: "Frau Njeri and Herr Otieno say 'Tschüss' to end the conversation.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Guten Tag", meaning: "Good day / Hello" },
  { phrase: "Wie geht es Ihnen?", meaning: "How are you? (formal)" },
  { phrase: "Mir geht es gut, danke.", meaning: "I'm doing well, thank you." },
  { phrase: "Wie heißen Sie?", meaning: "What is your name? (formal)" },
  { phrase: "Freut mich, Sie kennenzulernen.", meaning: "Pleased to meet you." },
  { phrase: "Auf Wiedersehen!", meaning: "Goodbye! (formal)" },
];

export const greetingsReading: Skill = {
  id: "g8-de-r-greetings",
  code: "R.1",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: formal greetings and introductions",
  description: "Read a formal German dialogue between two adults meeting for the first time and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what each speaker actually says.",
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
        prompt: "Match each formal German expression from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these exact expressions in the dialogue above.",
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
        hint: "The dialogue opens with a greeting and closes with a goodbye.",
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
      hint: "Look at what each speaker says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
