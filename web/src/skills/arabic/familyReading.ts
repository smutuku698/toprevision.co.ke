import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "Amina: Hadhihi usrati. Haadha abi, wa haadhihi ummi.\n" +
  "The teacher: Man haadha?\n" +
  "Amina: Haadha akhi, wa haadhihi ukhti.\n" +
  "The teacher: Wa man haadhaani?\n" +
  "Amina: Haadhaani jaddi wa jaddati. Nuhibbu ba'dana katheeran.";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is Amina showing the teacher?",
    correct: "A picture of her family",
    distractors: ["A picture of her school", "A picture of her pets", "A picture of her village"],
    explanation: "Amina introduces \"Hadhihi usrati\" — \"This is my family\" — and names each member.",
  },
  {
    q: "Who are 'jaddi wa jaddati' in the dialogue?",
    correct: "Her grandfather and grandmother",
    distractors: ["Her uncle and aunt", "Her brother and sister", "Her father and mother"],
    explanation: "\"Jaddi\" means my grandfather and \"jaddati\" means my grandmother.",
  },
  {
    q: "How does Amina describe her family's relationship?",
    correct: "They love each other very much",
    distractors: ["They rarely speak to each other", "They live in different countries", "They do not get along"],
    explanation: "Amina says \"Nuhibbu ba'dana katheeran\" — \"We love each other very much.\"",
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
  { text: "Amina introduces her father and mother first.", isTrue: true },
  { text: "Amina says she has no siblings.", isTrue: false },
  { text: "Amina's grandparents appear in the picture.", isTrue: true },
  { text: "Amina says her family does not love each other.", isTrue: false },
];

export const familyReading: Skill = {
  id: "ar-r-family",
  code: "R.2",
  subjectId: "arabic",
  strandId: "ar-reading",
  grade: 9,
  title: "Reading: family members",
  description: "Read a short Arabic dialogue about a family photo and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what Amina actually says about each family member.",
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
      hint: "Look at what Amina says about each family member in turn.",
      explanation: q.explanation,
    };
  },
};
