import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Chaque jour, je me lève à cinq heures. Je me lave et je prends mon petit-déjeuner à sept heures trente. Ensuite, je vais à l'école. Après l'école, je fais mes devoirs et je dîne avec ma famille. Je me couche à vingt-deux heures quarante-cinq.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "À quelle heure la personne se lève-t-elle ?",
    correct: "À cinq heures",
    distractors: ["À sept heures trente", "À midi", "À vingt-deux heures"],
    explanation: "\"Chaque jour, je me lève à cinq heures.\"",
  },
  {
    q: "Que fait la personne après l'école ?",
    correct: "Elle fait ses devoirs et dîne avec sa famille",
    distractors: ["Elle se couche tout de suite", "Elle prend le petit-déjeuner", "Elle ne fait rien"],
    explanation: "\"Après l'école, je fais mes devoirs et je dîne avec ma famille.\"",
  },
  {
    q: "À quelle heure la personne se couche-t-elle ?",
    correct: "À vingt-deux heures quarante-cinq",
    distractors: ["À sept heures", "À neuf heures", "À minuit"],
    explanation: "\"Je me couche à vingt-deux heures quarante-cinq.\"",
  },
];

const TRUE_FALSE_PROMPTS = [
  "Sort each statement as True or False, based on the passage.",
  "Decide whether each statement below is True or False, based on the passage above.",
  "Read the passage again and sort these statements into True or False.",
  "Which of these statements are true and which are false, according to the passage?",
  "Sort each sentence as True or False using what the passage says.",
  "Based on the passage, mark each statement True or False.",
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "La personne se lève à cinq heures.", isTrue: true },
  { text: "Elle prend le petit-déjeuner à midi.", isTrue: false },
  { text: "Elle dîne avec sa famille.", isTrue: true },
  { text: "Elle se couche à sept heures.", isTrue: false },
];

export const routineReading: Skill = {
  id: "fr-r-routine",
  code: "R.4",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: daily routine at home",
  description: "Read a short French text about someone's daily routine and answer comprehension questions.",
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
        hint: "Reread the passage and check each statement against the times given.",
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
      hint: "Look for the exact time or activity mentioned in the passage.",
      explanation: q.explanation,
    };
  },
};
