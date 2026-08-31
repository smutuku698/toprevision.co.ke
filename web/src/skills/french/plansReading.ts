import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Ce week-end, mes amis et moi allons faire beaucoup d'activités amusantes. Samedi matin, nous allons jouer au football au terrain de l'école. L'après-midi, nous allons nager à la piscine. Le soir, nous allons regarder un film chez Amina. Dimanche, nous allons visiter le nouveau parc en ville avec nos familles.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Que vont-ils faire samedi matin ?",
    correct: "Jouer au football",
    distractors: ["Nager à la piscine", "Regarder un film", "Visiter un parc"],
    explanation: "\"Samedi matin, nous allons jouer au football au terrain de l'école.\"",
  },
  {
    q: "Où vont-ils regarder un film ?",
    correct: "Chez Amina",
    distractors: ["Au cinéma", "À l'école", "Chez la grand-mère"],
    explanation: "\"Le soir, nous allons regarder un film chez Amina.\"",
  },
  {
    q: "Que vont-ils faire dimanche ?",
    correct: "Visiter le nouveau parc en ville avec leurs familles",
    distractors: ["Jouer au football toute la journée", "Rester à la maison", "Aller à l'école"],
    explanation: "\"Dimanche, nous allons visiter le nouveau parc en ville avec nos familles.\"",
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
  { text: "Ils vont nager samedi après-midi.", isTrue: true },
  { text: "Ils vont regarder un film chez Kevin.", isTrue: false },
  { text: "Ils vont jouer au football samedi matin.", isTrue: true },
  { text: "Ils ne font rien dimanche.", isTrue: false },
];

export const plansReading: Skill = {
  id: "fr-r-plans",
  code: "R.5",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: making plans and dates",
  description: "Read a short French text about weekend plans and answer comprehension questions.",
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
        hint: "Reread the passage and check each statement against what it says about each day.",
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
      hint: "Look for which day and time each activity happens.",
      explanation: q.explanation,
    };
  },
};
