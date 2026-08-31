import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Ce matin, Otieno ne se sentait pas bien. Il avait mal à la tête et un peu de fièvre. Sa mère a décidé de l'emmener chez le médecin. À l'hôpital, l'infirmière a pris sa température, puis le médecin l'a examiné. Le médecin a dit qu'Otieno avait juste un rhume et lui a donné un médicament. Après deux jours de repos, Otieno allait beaucoup mieux.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Qu'est-ce qu'Otieno avait ce matin ?",
    correct: "Mal à la tête et un peu de fièvre",
    distractors: ["Mal au ventre seulement", "Rien du tout", "Mal aux dents"],
    explanation: "\"Il avait mal à la tête et un peu de fièvre.\"",
  },
  {
    q: "Qui a examiné Otieno à l'hôpital ?",
    correct: "Le médecin",
    distractors: ["Sa mère", "L'infirmière seulement", "Un autre patient"],
    explanation: "\"Puis le médecin l'a examiné.\"",
  },
  {
    q: "Comment Otieno se sentait-il après deux jours de repos ?",
    correct: "Beaucoup mieux",
    distractors: ["Encore plus malade", "Exactement pareil", "Il ne s'est jamais rétabli"],
    explanation: "\"Après deux jours de repos, Otieno allait beaucoup mieux.\"",
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
  { text: "Otieno avait mal à la tête.", isTrue: true },
  { text: "Le médecin a dit qu'Otieno avait une maladie grave.", isTrue: false },
  { text: "L'infirmière a pris la température d'Otieno.", isTrue: true },
  { text: "Otieno n'est jamais allé chez le médecin.", isTrue: false },
];

export const healthReading: Skill = {
  id: "fr-r-health",
  code: "R.7",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: at the doctor's",
  description: "Read a short French text about a visit to the doctor and answer comprehension questions.",
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
        hint: "Reread the passage and check each statement against what actually happened.",
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
      hint: "Follow the story from Otieno feeling unwell to recovering.",
      explanation: q.explanation,
    };
  },
};
