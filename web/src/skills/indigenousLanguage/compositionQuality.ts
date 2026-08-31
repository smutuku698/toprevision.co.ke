import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STRENGTHENS = [
  "Every detail relates directly to the main story",
  "Sentences end with correct punctuation marks",
  "Paragraphs are organized in a logical order",
  "Handwriting is neat and easy to read",
  "New speakers in dialogue start on a new line",
  "The composition stays focused on one clear topic",
];

const WEAKENS = [
  "Random unrelated facts are added with no connection to the story",
  "Sentences run on with no punctuation at all",
  "Ideas jump around with no clear order",
  "Handwriting is messy and hard to read",
  "Dialogue from different speakers is bunched into one paragraph",
  "The composition wanders between several unrelated topics",
];

const PUNCTUATION: { correct: string; wrong: string }[] = [
  { correct: "Achieng, who works at the market, arrived early.", wrong: "Achieng who works at the market arrived early" },
  { correct: "\"Wait for me!\" shouted Otieno.", wrong: "Wait for me shouted Otieno" },
  { correct: "The farmer planted maize, beans, and kale.", wrong: "The farmer planted maize beans and kale" },
  { correct: "Is the shop open today?", wrong: "Is the shop open today" },
];

export const compositionQuality: Skill = {
  id: "il-w-composition-quality",
  code: "W.7",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "First aid: assessing the quality of a narrative composition",
  description: "Sort traits that strengthen or weaken a composition, and choose the correctly punctuated sentence.",
  generate(rng) {
    if (rng() < 0.5) {
      const strengthens = shuffle(rng, STRENGTHENS).slice(0, 3);
      const weakens = shuffle(rng, WEAKENS).slice(0, 3);
      const items = shuffle(rng, [
        ...strengthens.map((label) => ({ id: label, label, bucket: "strengthens" })),
        ...weakens.map((label) => ({ id: label, label, bucket: "weakens" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each trait into Strengthens the composition or Weakens the composition.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "strengthens", label: "Strengthens the composition" },
          { id: "weakens", label: "Weakens the composition" },
        ],
        correctBucket,
        hint: "A strong composition is relevant, correctly punctuated, neat, and logically organized.",
        explanation: `Strengthens: ${strengthens.join(" / ")}. Weakens: ${weakens.join(" / ")}.`,
      };
    }

    const entry = randChoice(rng, PUNCTUATION);
    const choices = shuffle(rng, [entry.correct, entry.wrong]);

    return {
      kind: "multiple-choice",
      prompt: "Which sentence is correctly punctuated?",
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Check for a missing comma, quotation mark, or full stop/question mark.",
      explanation: `"${entry.correct}" has the correct punctuation. "${entry.wrong}" is missing punctuation it needs.`,
    };
  },
};
