import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Die ", after: " scheint.", answer: "Sonne" },
  { before: "Es ", after: ".", answer: "regnet" },
  { before: "Ich gehe ", after: ".", answer: "schwimmen" },
  { before: "Ich ", after: " Blumen.", answer: "pflanze" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Die Sonne", "scheint", "heute."], sentence: "Die Sonne scheint heute." },
  { chunks: ["Ich gehe", "heute", "schwimmen."], sentence: "Ich gehe heute schwimmen." },
  { chunks: ["Es regnet,", "und ich", "pflanze Blumen."], sentence: "Es regnet, und ich pflanze Blumen." },
];

export const environmentWriting: Skill = {
  id: "de-w-environment",
  code: "W.8",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing about weather and environment",
  description: "Fill in missing words and arrange words to write correct German sentences about weather.",
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
        hint: "Describe the weather first, then the activity that goes with it.",
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
      hint: "Think about the weather or activity being described.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
