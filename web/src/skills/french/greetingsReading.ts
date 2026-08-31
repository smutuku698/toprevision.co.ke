import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Amina : Bonjour Monsieur, comment allez-vous ?\n" +
  "Le professeur : Je vais très bien, merci. Et vous ?\n" +
  "Amina : Je vais bien aussi, merci. Comment vous appelez-vous ?\n" +
  "Le professeur : Je m'appelle Monsieur Kamau. Enchanté !\n" +
  "Amina : Enchantée, Monsieur Kamau ! Je m'appelle Amina.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Qui parle dans ce dialogue ?",
    correct: "Amina et son professeur, Monsieur Kamau",
    distractors: ["Deux élèves inconnus", "Amina et sa mère", "Monsieur Kamau et un médecin"],
    explanation: "Le dialogue est entre Amina et son professeur, qui se présente comme Monsieur Kamau.",
  },
  {
    q: "Comment le professeur se sent-il ?",
    correct: "Il va très bien",
    distractors: ["Il est malade", "Il est fatigué", "Il ne répond pas"],
    explanation: "Le professeur répond \"Je vais très bien, merci.\"",
  },
  {
    q: "Comment s'appelle le professeur ?",
    correct: "Monsieur Kamau",
    distractors: ["Monsieur Otieno", "Madame Kamau", "Monsieur Amina"],
    explanation: "Le professeur dit \"Je m'appelle Monsieur Kamau.\"",
  },
];

const TRUE_FALSE_PROMPTS = [
  "Sort each statement as True or False, based on the dialogue.",
  "Decide whether each statement below is True or False, based on the dialogue above.",
  "Read the dialogue again and sort these statements into True or False.",
  "Which of these statements are true and which are false, according to the dialogue?",
  "Sort each sentence as True or False using what the dialogue says.",
  "Based on the dialogue, mark each statement True or False.",
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina demande comment va le professeur.", isTrue: true },
  { text: "Le professeur s'appelle Madame Aisha.", isTrue: false },
  { text: "Amina et le professeur se rencontrent pour la première fois.", isTrue: true },
  { text: "Amina refuse de dire son nom.", isTrue: false },
];

export const greetingsReading: Skill = {
  id: "fr-r-greetings",
  code: "R.1",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: formal greetings and introductions",
  description: "Read a short French dialogue of a formal introduction and answer comprehension questions.",
  generate(rng) {
    if (rng() < 0.45) {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: randChoice(rng, TRUE_FALSE_PROMPTS),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check what each character actually says.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
