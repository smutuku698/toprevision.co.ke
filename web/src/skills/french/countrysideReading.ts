import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Le week-end dernier, ma famille a visité la campagne près de chez ma grand-mère. Nous avons vu beaucoup d'animaux domestiques : des vaches, des chèvres et des poules. Le lendemain, nous sommes allés dans une réserve où nous avons vu des animaux sauvages : un lion, un éléphant et une girafe. Mon petit frère a adoré regarder les zèbres courir dans la savane.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quels animaux domestiques la famille a-t-elle vus près de la maison de la grand-mère ?",
    correct: "Des vaches, des chèvres et des poules",
    distractors: ["Des lions et des éléphants", "Des zèbres et des girafes", "Des chiens et des chats seulement"],
    explanation: "Le texte dit qu'ils ont vu \"des vaches, des chèvres et des poules\" près de la maison.",
  },
  {
    q: "Quels animaux sauvages ont-ils vus dans la réserve ?",
    correct: "Un lion, un éléphant et une girafe",
    distractors: ["Des vaches et des chèvres", "Des poules et des chiens", "Seulement des zèbres"],
    explanation: "Dans la réserve, ils ont vu \"un lion, un éléphant et une girafe.\"",
  },
  {
    q: "Qu'est-ce que le petit frère a adoré regarder ?",
    correct: "Les zèbres courir dans la savane",
    distractors: ["Les poules dans la ferme", "Les vaches boire de l'eau", "Les chèvres dormir"],
    explanation: "\"Mon petit frère a adoré regarder les zèbres courir dans la savane.\"",
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
  { text: "La famille a vu des vaches près de chez la grand-mère.", isTrue: true },
  { text: "Ils n'ont vu aucun animal sauvage.", isTrue: false },
  { text: "Le petit frère aime regarder les zèbres.", isTrue: true },
  { text: "Ils ont vu des lions près de la maison de la grand-mère.", isTrue: false },
];

export const countrysideReading: Skill = {
  id: "fr-r-countryside",
  code: "R.3",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: the countryside",
  description: "Read a short French text about a countryside visit and answer comprehension questions.",
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
        hint: "Reread the passage and check each statement against what it actually says.",
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
      hint: "Reread the passage carefully to find where each part happened.",
      explanation: q.explanation,
    };
  },
};
