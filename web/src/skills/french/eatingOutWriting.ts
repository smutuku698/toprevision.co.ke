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
  "Fill in the missing word to complete the restaurant sentence.",
  "Complete the restaurant sentence with the missing word.",
  "Type the missing word to finish the sentence about eating out.",
  "Which word completes this restaurant sentence? Fill it in.",
  "Fill in the blank with the correct restaurant word.",
  "Add the missing word to complete the sentence correctly.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Je ", after: " du poulet, s'il vous plaît.", answer: "voudrais" },
  { before: "J'ai besoin d'un ", after: " pour couper la viande.", answer: "couteau" },
  { before: "L'", after: ", s'il vous plaît !", answer: "addition" },
  { before: "Le ", after: " nous a apporté le menu.", answer: "serveur" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je voudrais", "du poulet,", "s'il vous plaît."], sentence: "Je voudrais du poulet, s'il vous plaît." },
  { chunks: ["Le serveur", "nous a apporté", "le menu."], sentence: "Le serveur nous a apporté le menu." },
  { chunks: ["Mon père a demandé", "l'addition", "à la fin."], sentence: "Mon père a demandé l'addition à la fin." },
];

export const eatingOutWriting: Skill = {
  id: "fr-w-eating-out",
  code: "W.6",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing about eating out",
  description: "Fill in missing restaurant vocabulary and arrange words into correct sentences.",
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
        hint: "The subject and verb usually come first, followed by what was ordered or requested.",
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
      hint: "Think about what you'd say or need at a restaurant.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
