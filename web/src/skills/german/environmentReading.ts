import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Die Sonne scheint. Amina geht schwimmen.\n" +
  "Es regnet. Otieno pflanzt Blumen.\n" +
  "Es ist kalt. Kevin bleibt zu Hause.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Was macht Amina, wenn die Sonne scheint?",
    correct: "Sie geht schwimmen",
    distractors: ["Sie pflanzt Blumen", "Sie bleibt zu Hause", "Sie spielt Fußball"],
    explanation: "Der Text sagt \"Die Sonne scheint. Amina geht schwimmen.\"",
  },
  {
    q: "Was macht Otieno, wenn es regnet?",
    correct: "Er pflanzt Blumen",
    distractors: ["Er geht schwimmen", "Er bleibt zu Hause", "Er lernt Mathe"],
    explanation: "Der Text sagt \"Es regnet. Otieno pflanzt Blumen.\"",
  },
  {
    q: "Was macht Kevin, wenn es kalt ist?",
    correct: "Er bleibt zu Hause",
    distractors: ["Er geht schwimmen", "Er pflanzt Blumen", "Er geht in die Kirche"],
    explanation: "Der Text sagt \"Es ist kalt. Kevin bleibt zu Hause.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amina geht schwimmen, wenn die Sonne scheint.", isTrue: true },
  { text: "Otieno pflanzt Blumen, wenn es regnet.", isTrue: true },
  { text: "Kevin geht schwimmen, wenn es kalt ist.", isTrue: false },
  { text: "Es regnet, wenn die Sonne scheint.", isTrue: false },
];

export const environmentReading: Skill = {
  id: "de-r-environment",
  code: "R.8",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: my environment",
  description: "Read short German sentences about weather and activities and answer comprehension questions.",
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
        hint: "Match each person to the weather and the activity they do in it.",
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
      hint: "Each sentence pairs one weather condition with one person's activity.",
      explanation: q.explanation,
    };
  },
};
