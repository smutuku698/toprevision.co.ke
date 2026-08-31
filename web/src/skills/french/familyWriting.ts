import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "./frenchUtils";

const ORDER_PROMPTS = [
  "Arrange the words/phrases to form a correct French sentence.",
  "Put these words and phrases in the correct order to make a French sentence.",
  "Rearrange the pieces below into a correct French sentence.",
  "Click the pieces in the order that forms a correct French sentence.",
  "Order these chunks to build a grammatically correct French sentence.",
  "Reassemble these words/phrases into the right French sentence.",
];

const FILL_PROMPTS = [
  "Fill in the missing family word to complete the sentence.",
  "Complete the sentence with the missing family word.",
  "Type the missing family word to finish the sentence.",
  "Which family word completes this sentence? Fill it in.",
  "Fill in the blank with the correct family word.",
  "Add the missing family word to complete the sentence correctly.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Mon ", after: " est médecin.", answer: "père" },
  { before: "Ma ", after: " est infirmière.", answer: "mère" },
  { before: "J'ai un ", after: " et une sœur.", answer: "frère" },
  { before: "Ma ", after: " habite à la campagne.", answer: "grand-mère" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mon père,", "Peter,", "est agriculteur."], sentence: "Mon père, Peter, est agriculteur." },
  { chunks: ["Ma mère", "travaille", "à l'hôpital."], sentence: "Ma mère travaille à l'hôpital." },
  { chunks: ["J'ai", "une sœur", "et un frère."], sentence: "J'ai une sœur et un frère." },
];

export const familyWriting: Skill = {
  id: "fr-w-family",
  code: "W.2",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing about the nuclear and extended family",
  description: "Fill in missing family vocabulary and arrange words into correct sentences about family.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
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
      prompt: randChoice(rng, FILL_PROMPTS),
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Look at the rest of the sentence for clues about which family member fits.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
