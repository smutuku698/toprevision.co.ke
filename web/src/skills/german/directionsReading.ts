import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Wo ist die Kirche? Die Kirche liegt hinter dem Markt.\n" +
  "Wo ist das Krankenhaus? Das Krankenhaus liegt auf der Hauptstraße.\n" +
  "Wie komme ich zur Schule? Geh von dem Markt geradeaus, dann bieg rechts ab. Die Schule ist ein Kilometer entfernt.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wo liegt die Kirche?",
    correct: "Hinter dem Markt",
    distractors: ["Auf der Hauptstraße", "Neben der Schule", "Im Krankenhaus"],
    explanation: "Der Text sagt \"Die Kirche liegt hinter dem Markt.\"",
  },
  {
    q: "Wo liegt das Krankenhaus?",
    correct: "Auf der Hauptstraße",
    distractors: ["Hinter dem Markt", "Neben der Kirche", "Ein Kilometer entfernt"],
    explanation: "Der Text sagt \"Das Krankenhaus liegt auf der Hauptstraße.\"",
  },
  {
    q: "Wie weit ist die Schule entfernt?",
    correct: "Ein Kilometer",
    distractors: ["Zwei Kilometer", "Fünf Kilometer", "Zehn Meter"],
    explanation: "Der Text sagt \"Die Schule ist ein Kilometer entfernt.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Die Kirche liegt hinter dem Markt.", isTrue: true },
  { text: "Das Krankenhaus liegt neben der Schule.", isTrue: false },
  { text: "Die Schule ist ein Kilometer entfernt.", isTrue: true },
  { text: "Man muss links abbiegen, um zur Schule zu kommen.", isTrue: false },
];

export const directionsReading: Skill = {
  id: "de-r-directions",
  code: "R.9",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: direction and location",
  description: "Read short German directions to local places and answer comprehension questions.",
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
        hint: "Reread where each place is located and which way to turn.",
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
      hint: "Match each place name to its described location.",
      explanation: q.explanation,
    };
  },
};
