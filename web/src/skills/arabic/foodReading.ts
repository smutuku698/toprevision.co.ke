import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Al-naadil: Ahlan wa sahlan! Maadha tureed?\n" +
  "Amina: Ureedu khubzan wa lahman, min fadlik.\n" +
  "Al-naadil: Wa maadha tureed an tashrab?\n" +
  "Amina: Ureedu shayan, min fadlik.\n" +
  "Amina: Shukran. Al-hisab min fadlik.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What food does Amina order?",
    correct: "Bread and meat",
    distractors: ["Rice and meat", "Bread and rice", "Only bread"],
    explanation: "Amina says \"Ureedu khubzan wa lahman\" — \"I want bread and meat.\"",
  },
  {
    q: "What drink does Amina order?",
    correct: "Tea",
    distractors: ["Coffee", "Water", "Juice"],
    explanation: "Amina says \"Ureedu shayan\" — \"I want tea.\"",
  },
  {
    q: "What does Amina ask for at the end?",
    correct: "The bill",
    distractors: ["More bread", "A menu", "The waiter's name"],
    explanation: "Amina says \"Al-hisab min fadlik\" — \"The bill, please.\"",
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
  { text: "Amina orders bread and meat.", isTrue: true },
  { text: "Amina orders coffee to drink.", isTrue: false },
  { text: "Amina asks for the bill at the end.", isTrue: true },
  { text: "The waiter refuses to serve Amina.", isTrue: false },
];

export const foodReading: Skill = {
  id: "ar-r-food",
  code: "R.6",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: ordering food and drinks",
  description: "Read a short Arabic restaurant dialogue and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what Amina actually orders.",
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
      hint: "Look at exactly what Amina says she wants.",
      explanation: q.explanation,
    };
  },
};
