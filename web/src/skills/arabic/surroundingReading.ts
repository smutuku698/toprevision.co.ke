import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Amina: Undhur! Haadhihi qittati, hiya sagheeratun wa baydaa'.\n" +
  "The teacher: Jameelatun! Hal ladayka hayawanaatun ukhra?\n" +
  "Amina: Na'am, ladayna baqaratun kabeeratun wa sawdaa' fee al-mazra'a.\n" +
  "The teacher: Wa maadha 'an al-hayawanaat al-barriya?\n" +
  "Amina: Ra'aytu asadan kabeeran fee al-hadeeqa al-wataniya.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "How does Amina describe her cat?",
    correct: "Small and white",
    distractors: ["Big and black", "Small and black", "Big and white"],
    explanation: "Amina says \"hiya sagheeratun wa baydaa'\" — \"she is small and white.\"",
  },
  {
    q: "What colour and size is the cow on the farm?",
    correct: "Big and black",
    distractors: ["Small and white", "Big and white", "Small and brown"],
    explanation: "Amina describes it as \"baqaratun kabeeratun wa sawdaa'\" — \"a big, black cow.\"",
  },
  {
    q: "Where did Amina see the lion?",
    correct: "At the national park",
    distractors: ["At the farm", "At the zoo", "At school"],
    explanation: "Amina says \"Ra'aytu asadan kabeeran fee al-hadeeqa al-wataniya\" — \"I saw a big lion at the national park.\"",
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
  { text: "Amina's cat is small and white.", isTrue: true },
  { text: "Amina says the cow on the farm is small.", isTrue: false },
  { text: "Amina saw a lion at the national park.", isTrue: true },
  { text: "Amina says she has no animals at all.", isTrue: false },
];

export const surroundingReading: Skill = {
  id: "ar-r-surrounding",
  code: "R.3",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: animals in my surrounding",
  description: "Read a short Arabic dialogue describing animals by size and colour, and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the size and colour Amina gives for each animal.",
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
      hint: "Look for the size and colour words Amina uses to describe each animal.",
      explanation: q.explanation,
    };
  },
};
