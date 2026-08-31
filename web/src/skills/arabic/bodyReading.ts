import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "At-tabeeb: Keyfa haaluka al-yawm?\n" +
  "Kamau: Ana mareed, wa ra'see yu'limuni.\n" +
  "At-tabeeb: Hal anta muta'ab aydan?\n" +
  "Kamau: Na'am, wa ana jaa'i' wa 'atshaan.\n" +
  "At-tabeeb: Ishrab maa'an katheeran wa istarih. Satakoonu bikhayr ghadan.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "How does Kamau say he feels at the start?",
    correct: "Sick, with a headache",
    distractors: ["Energetic and happy", "Tired but not sick", "Perfectly fine"],
    explanation: "Kamau says \"Ana mareed, wa ra'see yu'limuni\" — \"I am sick, and my head hurts.\"",
  },
  {
    q: "Besides being tired, what else does Kamau say?",
    correct: "He is hungry and thirsty",
    distractors: ["He is energetic", "He is happy", "He wants to sleep"],
    explanation: "Kamau says \"ana jaa'i' wa 'atshaan\" — \"I am hungry and thirsty.\"",
  },
  {
    q: "What does the doctor advise?",
    correct: "Drink plenty of water and rest",
    distractors: ["Go to school immediately", "Eat only bread", "Exercise a lot"],
    explanation: "The doctor says \"Ishrab maa'an katheeran wa istarih\" — \"Drink plenty of water and rest.\"",
  },
];

const TRUE_FALSE_PROMPTS = [
  "Sort each statement as True or False, based on the dialogue.",
  "Decide whether each statement below is True or False, based on the dialogue.",
  "Read the dialogue again and sort each statement as True or False.",
  "Is each statement True or False according to the dialogue? Sort it.",
  "Using the dialogue above, sort each statement into True or False.",
  "Check the dialogue and sort each statement as True or False.",
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kamau says he has a headache.", isTrue: true },
  { text: "Kamau says he feels energetic.", isTrue: false },
  { text: "The doctor tells Kamau to drink water and rest.", isTrue: true },
  { text: "The doctor says Kamau will never feel better.", isTrue: false },
];

export const bodyReading: Skill = {
  id: "ar-r-body",
  code: "R.7",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: states of health",
  description: "Read a short Arabic dialogue between a doctor and patient and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what Kamau says about how he feels.",
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
      hint: "Look at what Kamau tells the doctor, and what the doctor advises.",
      explanation: q.explanation,
    };
  },
};
