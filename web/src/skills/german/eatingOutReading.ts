import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Kellner: Guten Tag! Was möchten Sie bestellen?\n" +
  "Amina: Ich möchte bitte eine Tasse Tee.\n" +
  "Kellner: Und sonst noch etwas?\n" +
  "Amina: Ja, darf ich auch ein Brot haben?\n" +
  "Kellner: Natürlich. Das macht zusammen 150 Schilling.\n" +
  "Amina: Danke schön!\n" +
  "Kellner: Bitte schön!";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Was bestellt Amina zuerst?",
    correct: "Eine Tasse Tee",
    distractors: ["Einen Kaffee", "Eine Flasche Wasser", "Einen Saft"],
    explanation: "Amina sagt \"Ich möchte bitte eine Tasse Tee.\"",
  },
  {
    q: "Was bestellt Amina noch?",
    correct: "Ein Brot",
    distractors: ["Einen Kuchen", "Ein Ei", "Reis"],
    explanation: "Amina sagt \"darf ich auch ein Brot haben?\"",
  },
  {
    q: "Wie viel kostet die Bestellung?",
    correct: "150 Schilling",
    distractors: ["100 Schilling", "200 Schilling", "50 Schilling"],
    explanation: "Der Kellner sagt \"Das macht zusammen 150 Schilling.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina bestellt eine Tasse Tee.", isTrue: true },
  { text: "Amina bestellt einen Kaffee.", isTrue: false },
  { text: "Die Bestellung kostet 150 Schilling.", isTrue: true },
  { text: "Der Kellner sagt zuerst \"Danke schön\".", isTrue: false },
];

export const eatingOutReading: Skill = {
  id: "de-r-eating-out",
  code: "R.6",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: eating out",
  description: "Read a short German restaurant dialogue and answer comprehension questions.",
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
        hint: "Reread what Amina orders and what it costs.",
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
      hint: "Follow the order of the conversation between Amina and the waiter.",
      explanation: q.explanation,
    };
  },
};
