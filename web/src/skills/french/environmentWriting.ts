import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "./frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Il ", after: " fort aujourd'hui.", answer: "pleut" },
  { before: "Après la pluie, il ", after: " beau et chaud.", answer: "fait" },
  { before: "Il y a eu des ", after: " dans le village.", answer: "inondations" },
  { before: "La ", after: " a détruit les récoltes.", answer: "sécheresse" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il a plu", "pendant", "deux semaines."], sentence: "Il a plu pendant deux semaines." },
  { chunks: ["Les inondations", "ont détruit", "les récoltes."], sentence: "Les inondations ont détruit les récoltes." },
  { chunks: ["Après la pluie,", "le temps", "est redevenu beau."], sentence: "Après la pluie, le temps est redevenu beau." },
];

export const environmentWriting: Skill = {
  id: "fr-w-environment",
  code: "W.8",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing about weather and environment",
  description: "Fill in missing weather vocabulary and arrange words into correct sentences about the environment.",
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
        hint: "The subject usually comes first, then the verb, then the rest of the sentence.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the sentence about weather and environment.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Think about weather conditions and their effects.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
