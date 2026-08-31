import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich möchte bitte eine Tasse ", after: ".", answer: "Tee" },
  { before: "Darf ich eine Flasche ", after: " haben?", answer: "Wasser" },
  { before: "Das macht zusammen 150 ", after: ".", answer: "Schilling" },
  { before: "", after: " schön!", answer: "Danke" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich möchte", "bitte", "eine Tasse Tee."], sentence: "Ich möchte bitte eine Tasse Tee." },
  { chunks: ["Darf ich", "eine Flasche Wasser", "haben?"], sentence: "Darf ich eine Flasche Wasser haben?" },
  { chunks: ["Das macht", "zusammen", "150 Schilling."], sentence: "Das macht zusammen 150 Schilling." },
];

export const eatingOutWriting: Skill = {
  id: "de-w-eating-out",
  code: "W.6",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing a restaurant order (menu)",
  description: "Fill in missing words and arrange words to write correct German sentences for ordering food.",
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
        hint: "Polite requests usually start with 'Ich möchte' or 'Darf ich'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the German restaurant sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about what's being ordered, paid for, or said.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
