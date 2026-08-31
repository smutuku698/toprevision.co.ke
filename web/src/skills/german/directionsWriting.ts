import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Die Kirche liegt hinter dem ", after: ".", answer: "Markt" },
  { before: "Das Krankenhaus liegt auf der ", after: ".", answer: "Hauptstraße" },
  { before: "Bieg ", after: " ab.", answer: "rechts" },
  { before: "Die Schule ist ein ", after: " entfernt.", answer: "Kilometer" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Die Kirche", "liegt", "hinter dem Markt."], sentence: "Die Kirche liegt hinter dem Markt." },
  { chunks: ["Geh", "geradeaus,", "dann bieg rechts ab."], sentence: "Geh geradeaus, dann bieg rechts ab." },
  { chunks: ["Die Schule", "ist", "ein Kilometer entfernt."], sentence: "Die Schule ist ein Kilometer entfernt." },
];

export const directionsWriting: Skill = {
  id: "de-w-directions",
  code: "W.9",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing directions and locations",
  description: "Fill in missing words and arrange words to write correct German sentences about locations and directions.",
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
        hint: "State the place first, then how it's positioned or reached.",
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
      hint: "Think about the place or direction being described.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
