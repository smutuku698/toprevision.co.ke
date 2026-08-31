import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  '"Excusez-moi, comment est-ce que je peux aller à la gare ?" a demandé le touriste. "C\'est facile," a répondu la femme. "Continuez tout droit jusqu\'au pont, puis tournez à droite. La gare est juste après la station de métro, à côté de l\'avenue principale." Le touriste a remercié la femme et a pris le bus pour arriver plus vite à la gare.';

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Que cherche le touriste ?",
    correct: "La gare",
    distractors: ["La station de métro", "L'avenue principale", "Le pont"],
    explanation: "Le touriste demande \"comment est-ce que je peux aller à la gare ?\"",
  },
  {
    q: "Que doit-il faire au pont ?",
    correct: "Tourner à droite",
    distractors: ["Tourner à gauche", "S'arrêter", "Traverser"],
    explanation: "\"Continuez tout droit jusqu'au pont, puis tournez à droite.\"",
  },
  {
    q: "Comment le touriste est-il arrivé à la gare ?",
    correct: "En bus",
    distractors: ["En taxi", "En vélo", "À pied"],
    explanation: "\"Le touriste... a pris le bus pour arriver plus vite à la gare.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Le touriste cherche la gare.", isTrue: true },
  { text: "Il doit tourner à gauche au pont.", isTrue: false },
  { text: "La gare est à côté de l'avenue principale.", isTrue: true },
  { text: "Le touriste a marché jusqu'à la gare.", isTrue: false },
];

export const directionsReading: Skill = {
  id: "fr-r-directions",
  code: "R.9",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: directions and locations",
  description: "Read a short French dialogue about asking for directions and answer comprehension questions.",
  generate(rng) {
    if (rng() < 0.45) {
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
        hint: "Reread the directions given by the woman carefully.",
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
      hint: "Follow the directions given step by step.",
      explanation: q.explanation,
    };
  },
};
