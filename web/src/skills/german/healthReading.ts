import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Otieno ist krank. Er hat Kopfschmerzen und Rückenschmerzen.\n" +
  "\"Was tut dir weh?\", fragt seine Mutter.\n" +
  "\"Mein Kopf tut mir weh und mein Rücken auch\", sagt Otieno.\n" +
  "Seine Mutter sagt: \"Geh zum Arzt!\" Otieno geht ins Krankenhaus.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Was für Schmerzen hat Otieno?",
    correct: "Kopfschmerzen und Rückenschmerzen",
    distractors: ["Nur Kopfschmerzen", "Nur Rückenschmerzen", "Keine Schmerzen"],
    explanation: "Der Text sagt \"Er hat Kopfschmerzen und Rückenschmerzen.\"",
  },
  {
    q: "Wer fragt \"Was tut dir weh?\"?",
    correct: "Seine Mutter",
    distractors: ["Sein Vater", "Der Arzt", "Seine Schwester"],
    explanation: "Der Text sagt \"'Was tut dir weh?', fragt seine Mutter.\"",
  },
  {
    q: "Wohin geht Otieno?",
    correct: "Ins Krankenhaus",
    distractors: ["Zur Schule", "Nach Hause", "Zum Markt"],
    explanation: "Der Text sagt \"Otieno geht ins Krankenhaus.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Otieno ist krank.", isTrue: true },
  { text: "Otieno hat nur Halsschmerzen.", isTrue: false },
  { text: "Seine Mutter sagt, er soll zum Arzt gehen.", isTrue: true },
  { text: "Otieno geht zur Schule.", isTrue: false },
];

export const healthReading: Skill = {
  id: "de-r-health",
  code: "R.7",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: at the doctor's",
  description: "Read a short German text about being sick and answer comprehension questions.",
  generate(rng) {
    if (rng() < 0.45) {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the text.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread what hurts and what Otieno's mother tells him to do.",
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
      hint: "Follow the conversation between Otieno and his mother.",
      explanation: q.explanation,
    };
  },
};
