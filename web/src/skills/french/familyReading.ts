import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Je m'appelle Kevin. J'ai une famille nucléaire et une famille élargie. Mon père s'appelle Peter ; il est agriculteur et il travaille à la ferme. Ma mère s'appelle Grace ; elle est infirmière et elle travaille à l'hôpital. J'ai une sœur, Wanjiru, qui est encore à l'école. Mon oncle, le frère de mon père, est commerçant et il travaille dans un magasin au marché.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quelle est la profession du père de Kevin ?",
    correct: "Il est agriculteur",
    distractors: ["Il est médecin", "Il est enseignant", "Il est commerçant"],
    explanation: "Le texte dit \"Mon père s'appelle Peter ; il est agriculteur.\"",
  },
  {
    q: "Où travaille la mère de Kevin ?",
    correct: "À l'hôpital",
    distractors: ["À l'école", "À la ferme", "Au magasin"],
    explanation: "\"Ma mère... est infirmière et elle travaille à l'hôpital.\"",
  },
  {
    q: "Qui est commerçant dans la famille de Kevin ?",
    correct: "Son oncle",
    distractors: ["Sa sœur", "Sa mère", "Son père"],
    explanation: "\"Mon oncle, le frère de mon père, est commerçant.\"",
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
  { text: "Le père de Kevin est agriculteur.", isTrue: true },
  { text: "La mère de Kevin travaille à l'école.", isTrue: false },
  { text: "Kevin a une sœur qui s'appelle Wanjiru.", isTrue: true },
  { text: "L'oncle de Kevin est médecin.", isTrue: false },
];

export const familyReading: Skill = {
  id: "fr-r-family",
  code: "R.2",
  subjectId: "french",
  strandId: "fr-reading",
  grade: 9,
  title: "Reading: the nuclear and extended family",
  description: "Read a short French text about a family and answer comprehension questions.",
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
      hint: "Reread the passage and find the sentence about that family member.",
      explanation: q.explanation,
    };
  },
};
