import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Amina: Hal anta mutafarrigh al-usbu' al-qadim?\n" +
  "Kamau: Na'am, ana mutafarrigh yawm al-ithnayn. Limaadha?\n" +
  "Amina: Hal tureedu an tal'aba kurat al-qadam ma'i?\n" +
  "Kamau: Bikulli suroor! Ayy saa'a?\n" +
  "Amina: As-saa'ata ar-raabi'a ba'da adh-dhuhr, fee al-mal'ab.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does Amina first ask Kamau?",
    correct: "Whether he is free next week",
    distractors: ["Whether he likes football", "Whether he is hungry", "Whether he is tired"],
    explanation: "Amina asks \"Hal anta mutafarrigh al-usbu' al-qadim?\" — \"Are you free next week?\"",
  },
  {
    q: "What does Kamau say about Monday?",
    correct: "He is free on Monday",
    distractors: ["He is busy on Monday", "He is sick on Monday", "He is traveling on Monday"],
    explanation: "Kamau replies \"Na'am, ana mutafarrigh yawm al-ithnayn\" — \"Yes, I am free on Monday.\"",
  },
  {
    q: "What time and place do they agree to meet?",
    correct: "4 o'clock in the afternoon, at the field",
    distractors: ["9 o'clock in the morning, at school", "2 o'clock, at Amina's house", "6 o'clock in the evening, at the market"],
    explanation: "Amina says \"As-saa'ata ar-raabi'a ba'da adh-dhuhr, fee al-mal'ab\" — \"At 4 o'clock in the afternoon, at the field.\"",
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
  { text: "Amina asks Kamau if he is free next week.", isTrue: true },
  { text: "Kamau says he is busy every day next week.", isTrue: false },
  { text: "Amina invites Kamau to play football.", isTrue: true },
  { text: "They agree to meet at Amina's house.", isTrue: false },
];

export const funReading: Skill = {
  id: "ar-r-fun",
  code: "R.5",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: making plans and appointments",
  description: "Read a short Arabic dialogue about making plans and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what day, time, and place they agree on.",
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
      hint: "Look at the day, time, and place mentioned in the dialogue.",
      explanation: q.explanation,
    };
  },
};
