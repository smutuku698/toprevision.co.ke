import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Cette année, la saison des pluies a apporté beaucoup de problèmes dans notre région. Il a plu très fort pendant deux semaines, et il y a eu des inondations dans plusieurs villages. Beaucoup de familles ont perdu leurs récoltes. Les jeunes du village ont aidé à construire des canaux pour évacuer l'eau. Après la pluie, le temps est redevenu beau et chaud.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel problème la saison des pluies a-t-elle causé ?",
    correct: "Des inondations dans plusieurs villages",
    distractors: ["Une sécheresse grave", "Un manque de nourriture depuis le début", "Rien du tout"],
    explanation: "\"Il y a eu des inondations dans plusieurs villages.\"",
  },
  {
    q: "Qu'est-ce que beaucoup de familles ont perdu ?",
    correct: "Leurs récoltes",
    distractors: ["Leurs maisons seulement", "Leurs animaux seulement", "Rien, tout allait bien"],
    explanation: "\"Beaucoup de familles ont perdu leurs récoltes.\"",
  },
  {
    q: "Qu'est-ce que les jeunes du village ont fait pour aider ?",
    correct: "Construire des canaux pour évacuer l'eau",
    distractors: ["Quitter le village", "Ne rien faire", "Vendre leurs récoltes"],
    explanation: "\"Les jeunes du village ont aidé à construire des canaux pour évacuer l'eau.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Il a plu pendant deux semaines.", isTrue: true },
  { text: "Il n'y a eu aucun problème dans la région.", isTrue: false },
  { text: "Les jeunes ont aidé à construire des canaux.", isTrue: true },
  { text: "Le temps est resté mauvais pour toujours.", isTrue: false },
];

export const environmentReading: Skill = {
  id: "fr-r-environment",
  code: "R.8",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: my environment",
  description: "Read a short French text about the effects of weather on the environment and answer comprehension questions.",
  generate(rng) {
    if (rng() < 0.45) {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage and check the sequence of events described.",
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
      hint: "Follow the passage's story of the rainy season's effects and the response.",
      explanation: q.explanation,
    };
  },
};
