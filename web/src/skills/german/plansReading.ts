import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Hallo! Ich heiße Otieno. Am Sonntag treffe ich meine Freundin Amina. Wir möchten heute Abend tanzen.\n" +
  "Am Nachmittag spiele ich Fußball mit meinen Freunden. Später möchte ich mein Buch lesen.\n" +
  "Amina möchte lieber Musik hören.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wen trifft Otieno am Sonntag?",
    correct: "Seine Freundin Amina",
    distractors: ["Seinen Bruder", "Seinen Lehrer", "Seine Mutter"],
    explanation: "Der Text sagt \"Am Sonntag treffe ich meine Freundin Amina.\"",
  },
  {
    q: "Was möchten Otieno und Amina heute Abend machen?",
    correct: "Tanzen",
    distractors: ["Schlafen", "Lernen", "Kochen"],
    explanation: "Der Text sagt \"Wir möchten heute Abend tanzen.\"",
  },
  {
    q: "Was möchte Amina lieber machen?",
    correct: "Musik hören",
    distractors: ["Fußball spielen", "Ein Buch lesen", "Tanzen"],
    explanation: "Der Text sagt \"Amina möchte lieber Musik hören.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Otieno spielt am Nachmittag Fußball.", isTrue: true },
  { text: "Amina möchte ein Buch lesen.", isTrue: false },
  { text: "Otieno trifft Amina am Sonntag.", isTrue: true },
  { text: "Otieno möchte heute Abend schlafen.", isTrue: false },
];

export const plansReading: Skill = {
  id: "de-r-plans",
  code: "R.5",
  subjectId: "german",
  strandId: "de-reading",
  grade: 9,
  title: "Reading: making plans and dates",
  description: "Read a short German text about weekend plans and answer comprehension questions.",
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
        hint: "Reread who wants to do what, and who prefers something different.",
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
      hint: "Match each name in the text to the activity they plan or prefer.",
      explanation: q.explanation,
    };
  },
};
