import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich habe ", after: ".", answer: "Kopfschmerzen" },
  { before: "Ich gehe zum ", after: ".", answer: "Arzt" },
  { before: "Mein ", after: " tut mir weh.", answer: "Kopf" },
  { before: "Ich habe Schmerzen am ", after: ".", answer: "Hals" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Otieno", "ist", "krank."], sentence: "Otieno ist krank." },
  { chunks: ["Mein Kopf", "tut mir", "weh."], sentence: "Mein Kopf tut mir weh." },
  { chunks: ["Ich gehe", "zum", "Arzt."], sentence: "Ich gehe zum Arzt." },
];

export const healthWriting: Skill = {
  id: "de-w-health",
  code: "W.7",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing about being sick",
  description: "Fill in missing words and arrange words to write correct German sentences about illness.",
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
        hint: "The body part or subject usually comes first.",
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
      hint: "Think about what hurts or where someone goes for help.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
