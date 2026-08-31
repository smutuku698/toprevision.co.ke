import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Hier soir, ma famille est allée au restaurant pour fêter l'anniversaire de ma sœur. Le serveur nous a apporté le menu. Mon père a commandé du poulet avec du riz, et ma mère a choisi du poisson avec de la salade. Moi, j'ai pris un jus de fruits, et ma sœur a demandé de l'eau. À la fin, mon père a demandé l'addition.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Pourquoi la famille est-elle allée au restaurant ?",
    correct: "Pour fêter l'anniversaire de la sœur",
    distractors: ["Pour fêter l'anniversaire du père", "Parce qu'il n'y avait rien à manger à la maison", "Pour rencontrer des amis"],
    explanation: "\"Ma famille est allée au restaurant pour fêter l'anniversaire de ma sœur.\"",
  },
  {
    q: "Qu'est-ce que le père a commandé ?",
    correct: "Du poulet avec du riz",
    distractors: ["Du poisson avec de la salade", "Un jus de fruits", "De l'eau seulement"],
    explanation: "\"Mon père a commandé du poulet avec du riz.\"",
  },
  {
    q: "Qu'est-ce que la sœur a bu ?",
    correct: "De l'eau",
    distractors: ["Du café", "Du thé", "Un jus de fruits"],
    explanation: "\"Ma sœur a demandé de l'eau.\"",
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
  { text: "La famille fête l'anniversaire de la sœur.", isTrue: true },
  { text: "La mère a commandé du poulet.", isTrue: false },
  { text: "Le narrateur a bu un jus de fruits.", isTrue: true },
  { text: "Personne n'a demandé l'addition.", isTrue: false },
];

export const eatingOutReading: Skill = {
  id: "fr-r-eating-out",
  code: "R.6",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: eating out",
  description: "Read a short French text about a restaurant visit and answer comprehension questions.",
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
        hint: "Reread the passage and check who ordered what.",
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
      hint: "Find the sentence about that family member's order.",
      explanation: q.explanation,
    };
  },
};
