import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Madame Njeri : Bonjour Monsieur. Comment allez-vous ?",
  "Monsieur Otieno : Je vais bien, merci. Et vous ?",
  "Madame Njeri : Je vais très bien aussi, merci. Quel est votre nom, s'il vous plaît ?",
  "Monsieur Otieno : Je m'appelle Otieno. Enchanté de faire votre connaissance, Madame.",
  "Madame Njeri : Ravie de vous rencontrer, Monsieur Otieno. Au revoir !",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Comment Madame Njeri salue-t-elle Monsieur Otieno au début ?",
    correct: "Bonjour Monsieur. Comment allez-vous ?",
    distractors: ["Salut ! Ça va ?", "Au revoir, Monsieur.", "Tu t'appelles comment ?"],
    explanation: "Madame Njeri commence par \"Bonjour Monsieur. Comment allez-vous ?\", une salutation formelle avec 'vous'.",
  },
  {
    q: "Comment s'appelle l'homme dans le dialogue ?",
    correct: "Otieno",
    distractors: ["Njeri", "Kamau", "Amina"],
    explanation: "L'homme répond \"Je m'appelle Otieno.\"",
  },
  {
    q: "Que répond Monsieur Otieno quand Madame Njeri lui demande \"Comment allez-vous ?\"",
    correct: "Je vais bien, merci. Et vous ?",
    distractors: ["Je vais mal, merci.", "Je m'appelle Otieno.", "Au revoir, Madame."],
    explanation: "Monsieur Otieno répond \"Je vais bien, merci. Et vous ?\"",
  },
  {
    q: "Quelle phrase Madame Njeri utilise-t-elle pour demander le nom de Monsieur Otieno ?",
    correct: "Quel est votre nom, s'il vous plaît ?",
    distractors: ["Comment allez-vous ?", "Tu t'appelles comment ?", "Au revoir, Monsieur."],
    explanation: "Elle demande poliment : \"Quel est votre nom, s'il vous plaît ?\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Madame Njeri utilise la forme formelle 'vous'.", isTrue: true },
  { text: "Monsieur Otieno dit qu'il va mal.", isTrue: false },
  { text: "Monsieur Otieno est enchanté de faire la connaissance de Madame Njeri.", isTrue: true },
  { text: "Madame Njeri et Monsieur Otieno se disent 'Salut'.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Comment allez-vous ?", meaning: "How are you? (formal)" },
  { phrase: "Je vais bien, merci. Et vous ?", meaning: "I am doing well, thank you. And you?" },
  { phrase: "Quel est votre nom, s'il vous plaît ?", meaning: "What is your name, please?" },
  { phrase: "Enchanté de faire votre connaissance", meaning: "Pleased to meet you" },
  { phrase: "Ravi(e) de vous rencontrer", meaning: "Glad to meet you" },
  { phrase: "Au revoir, Monsieur/Madame", meaning: "Goodbye, Sir/Madam" },
];

export const greetingsReading: Skill = {
  id: "g8-fr-r-greetings",
  code: "R.1",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: formal greetings and introductions",
  description: "Read a formal French dialogue between two adults meeting for the first time and answer comprehension questions.",
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
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each formal French expression from the dialogue to its English meaning.",
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
