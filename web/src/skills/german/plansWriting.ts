import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich ", after: " am Sonntag meine Freundin.", answer: "treffe" },
  { before: "Ich möchte heute Abend ", after: ".", answer: "tanzen" },
  { before: "Ich spiele heute Nachmittag ", after: ".", answer: "Fußball" },
  { before: "Ich möchte später mein Buch ", after: ".", answer: "lesen" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich treffe", "am Sonntag", "meine Freundin."], sentence: "Ich treffe am Sonntag meine Freundin." },
  { chunks: ["Ich möchte", "heute Abend", "tanzen."], sentence: "Ich möchte heute Abend tanzen." },
  { chunks: ["Ich spiele", "heute Nachmittag", "Fußball."], sentence: "Ich spiele heute Nachmittag Fußball." },
];

export const plansWriting: Skill = {
  id: "de-w-plans",
  code: "W.5",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing about plans and dates",
  description: "Fill in missing words and arrange words to write correct German sentences about weekend plans.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The verb comes second; the time phrase often comes right after it.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the German sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about what activity is being planned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
