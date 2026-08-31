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
  "Fill in the missing animal word to complete the sentence.",
  "Complete the sentence with the missing animal word.",
  "Type the missing animal word to finish the sentence.",
  "Which animal word completes this sentence? Fill it in.",
  "Fill in the blank with the correct animal word.",
  "Add the missing animal word to complete the sentence correctly.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Le ", after: " est le roi des animaux.", answer: "lion" },
  { before: "La ", after: " donne du lait.", answer: "vache" },
  { before: "L'", after: " a une longue trompe.", answer: "éléphant" },
  { before: "La ", after: " a un long cou.", answer: "girafe" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Le lion", "est", "un animal sauvage."], sentence: "Le lion est un animal sauvage." },
  { chunks: ["La vache", "est", "un animal domestique."], sentence: "La vache est un animal domestique." },
  { chunks: ["Nous avons vu", "des zèbres", "dans la savane."], sentence: "Nous avons vu des zèbres dans la savane." },
];

export const countrysideWriting: Skill = {
  id: "fr-w-countryside",
  code: "W.3",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing about the countryside",
  description: "Fill in missing animal vocabulary and arrange words into correct sentences about animals.",
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
      hint: "Think about which animal matches the description in the sentence.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
