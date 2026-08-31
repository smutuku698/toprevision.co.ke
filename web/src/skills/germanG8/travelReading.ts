import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Reiseleiter: Guten Morgen! Bleiben Sie bitte im Auto.",
  "Frau Njeri: Wohin gehen wir denn zuerst?",
  "Reiseleiter: Wir suchen den Löwen und den Elefanten. Beobachten Sie die Tiere ruhig!",
  "Herr Otieno: Dort ist eine Giraffe! Fotografieren Sie sie, bitte!",
  "Reiseleiter: Gut, aber machen Sie keinen Lärm.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does the tour guide first ask the visitors to do?",
    correct: "Bleiben Sie bitte im Auto.",
    distractors: ["Fotografieren Sie den Löwen.", "Machen Sie keinen Lärm.", "Beobachten Sie die Tiere ruhig."],
    explanation: "The guide opens with \"Bleiben Sie bitte im Auto\" — please stay in the car.",
  },
  {
    q: "Which two animals are they looking for first?",
    correct: "Den Löwen und den Elefanten.",
    distractors: ["Die Giraffe und das Zebra.", "Den Tiger und die Schlange.", "Den Affen und den Löwen."],
    explanation: "The guide says \"Wir suchen den Löwen und den Elefanten.\"",
  },
  {
    q: "What does Herr Otieno spot?",
    correct: "Eine Giraffe.",
    distractors: ["Einen Löwen.", "Ein Zebra.", "Einen Tiger."],
    explanation: "Herr Otieno says \"Dort ist eine Giraffe!\"",
  },
  {
    q: "What final instruction does the guide give?",
    correct: "Machen Sie keinen Lärm.",
    distractors: ["Bleiben Sie im Auto.", "Fotografieren Sie den Löwen.", "Wohin gehen wir denn?"],
    explanation: "The guide ends with \"Gut, aber machen Sie keinen Lärm\" — don't make any noise.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "The guide tells the visitors to stay in the car.", isTrue: true },
  { text: "They are first looking for a giraffe and a zebra.", isTrue: false },
  { text: "Herr Otieno spots a giraffe.", isTrue: true },
  { text: "The guide says they may make as much noise as they like.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Bleiben Sie im Auto!", meaning: "Stay in the car!" },
  { phrase: "Beobachten Sie die Tiere ruhig!", meaning: "Observe the animals calmly!" },
  { phrase: "Fotografieren Sie sie!", meaning: "Photograph them!" },
  { phrase: "Machen Sie keinen Lärm!", meaning: "Don't make any noise!" },
  { phrase: "der Löwe", meaning: "the lion" },
  { phrase: "der Elefant", meaning: "the elephant" },
  { phrase: "die Giraffe", meaning: "the giraffe" },
  { phrase: "Wohin gehen wir denn?", meaning: "So where are we going?" },
];

export const travelReading: Skill = {
  id: "g8-de-r-travel",
  code: "R.5",
  subjectId: "german",
  strandId: "g8-de-reading",
  grade: 8,
  title: "Reading: safari and travel",
  description: "Read a formal German dialogue between a tour guide and visitors on a safari, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check what the guide instructs and what the visitors see.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each German word or phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these exact expressions in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The guide's opening instruction comes first, and the reminder about noise comes last.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
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
      hint: "Look at what the guide instructs and what the visitors notice in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
