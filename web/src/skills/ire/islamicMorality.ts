import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each statement about Islamic morality as True or False.",
  "Decide whether each statement about Islamic morality is True or False.",
  "Sort these statements about Islamic morality into True or False.",
  "Read each statement about Islamic morality and sort it as True or False.",
  "Place each statement into the True or False bucket.",
  "Categorise each statement about Islamic morality as True or False.",
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is Islamic morality significant in a Muslim's life?",
    correct: "It promotes righteousness and helps build an upright, just society",
    distractors: ["It only matters during Ramadan", "It applies only to religious scholars", "It has no connection to daily behaviour"],
  },
  {
    q: "What does upholding Islamic morality help a Muslim earn?",
    correct: "Rewards from Allah (S.W.T.) for righteous conduct",
    distractors: ["Automatic wealth", "Exemption from all hardship", "Fame among people"],
  },
  {
    q: "How does Islamic morality benefit society as a whole?",
    correct: "It fosters trust, respect, and good relationships among people",
    distractors: ["It has no effect on how people treat each other", "It only benefits the wealthy", "It replaces the need for good conduct entirely"],
  },
];

const STATEMENTS: { text: string; isTrue: boolean }[] = [
  { text: "Islamic morality promotes righteousness and helps build an upright, just society.", isTrue: true },
  { text: "Upholding Islamic morality can earn a Muslim rewards from Allah (S.W.T.).", isTrue: true },
  { text: "Islamic morality fosters trust, respect, and good relationships among people.", isTrue: true },
  { text: "Islamic morality only matters during the month of Ramadan.", isTrue: false },
  { text: "Islamic morality applies only to religious scholars.", isTrue: false },
  { text: "Islamic morality has no effect on how people treat each other.", isTrue: false },
];

export const islamicMorality: Skill = {
  id: "ire-ak-morality",
  code: "AK.2",
  subjectId: "ire",
  strandId: "ire-akhlaq",
  grade: 9,
  title: "The significance of Islamic morality",
  description: "Answer questions about why Islamic morality (Akhlaq) matters.",
  generate(rng) {
    const hint = "Islamic morality is meant to be practised daily, promoting righteousness both for the individual and for society.";

    if (rng() < 0.4) {
      const chosen = shuffle(rng, STATEMENTS).slice(0, 5);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
