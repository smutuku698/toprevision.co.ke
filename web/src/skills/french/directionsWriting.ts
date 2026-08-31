import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "./frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Tournez à ", after: " au pont.", answer: "droite" },
  { before: "", after: " tout droit jusqu'à la gare.", answer: "Continuez" },
  { before: "Traversez ", after: " pour arriver à l'école.", answer: "la rue" },
  { before: "La gare est à côté de l'", after: " principale.", answer: "avenue" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Continuez", "tout droit", "jusqu'au pont."], sentence: "Continuez tout droit jusqu'au pont." },
  { chunks: ["Tournez", "à droite", "au pont."], sentence: "Tournez à droite au pont." },
  { chunks: ["Le touriste", "a pris", "le bus."], sentence: "Le touriste a pris le bus." },
];

export const directionsWriting: Skill = {
  id: "fr-w-directions",
  code: "W.9",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing directions and locations",
  description: "Fill in missing direction vocabulary and arrange words into correct sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Direction instructions usually give the action first, then where.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the direction sentence.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Think about how you'd give someone directions to a place.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
