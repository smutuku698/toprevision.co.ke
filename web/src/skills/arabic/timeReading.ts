import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Fee kulli sabaah, astayqidhu as-saa'ata as-saabi'a.\n" +
  "Aakulu al-fatoor thumma adhhabu ilaa al-madrasa as-saa'ata ath-thaamina.\n" +
  "Ba'da al-madrasa, adrusu fee al-masaa'.\n" +
  "Aakulu al-'asha' as-saa'ata ath-thaamina masaa'an, thumma anaamu mubakkiran.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What time does the speaker wake up?",
    correct: "Seven o'clock",
    distractors: ["Six o'clock", "Eight o'clock", "Nine o'clock"],
    explanation: "The text says \"astayqidhu as-saa'ata as-saabi'a\" — \"I wake up at seven o'clock.\"",
  },
  {
    q: "What does the speaker do right before going to school?",
    correct: "Eats breakfast",
    distractors: ["Studies", "Sleeps", "Eats dinner"],
    explanation: "The text says \"Aakulu al-fatoor thumma adhhabu ilaa al-madrasa\" — \"I eat breakfast then go to school.\"",
  },
  {
    q: "When does the speaker study, according to the text?",
    correct: "In the evening, after school",
    distractors: ["Early in the morning", "During breakfast", "Right after waking up"],
    explanation: "The text says \"Ba'da al-madrasa, adrusu fee al-masaa'\" — \"After school, I study in the evening.\"",
  },
];

const TRUE_FALSE_PROMPTS = [
  "Sort each statement as True or False, based on the passage.",
  "Decide whether each statement below is True or False, based on the passage.",
  "Read the passage again and sort each statement as True or False.",
  "Is each statement True or False according to the passage? Sort it.",
  "Using the passage above, sort each statement into True or False.",
  "Check the passage and sort each statement as True or False.",
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "The speaker wakes up at seven o'clock.", isTrue: true },
  { text: "The speaker eats breakfast after going to school.", isTrue: false },
  { text: "The speaker studies in the evening after school.", isTrue: true },
  { text: "The speaker stays up very late every night.", isTrue: false },
];

export const timeReading: Skill = {
  id: "ar-r-time",
  code: "R.4",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: daily routine and time",
  description: "Read a short Arabic passage about a daily routine and answer comprehension questions.",
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
        hint: "Reread the passage carefully and check the order of activities and their times.",
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
      hint: "Look for the time expressions and the order the activities are mentioned in.",
      explanation: q.explanation,
    };
  },
};
