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
  "Fill in the missing word to complete the sentence about health.",
  "Complete the sentence about health with the missing word.",
  "Type the missing word to finish the sentence about health.",
  "Which word completes this sentence about health? Fill it in.",
  "Fill in the blank with the correct health-related word.",
  "Add the missing word to complete the sentence correctly.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "J'ai mal à la ", after: ".", answer: "tête" },
  { before: "Je suis ", after: ", j'ai de la fièvre.", answer: "malade" },
  { before: "Le ", after: " m'a donné un médicament.", answer: "médecin" },
  { before: "L'", after: " a pris ma température.", answer: "infirmière" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Otieno", "avait mal", "à la tête."], sentence: "Otieno avait mal à la tête." },
  { chunks: ["Le médecin", "a examiné", "Otieno."], sentence: "Le médecin a examiné Otieno." },
  { chunks: ["Après deux jours,", "il allait", "beaucoup mieux."], sentence: "Après deux jours, il allait beaucoup mieux." },
];

export const healthWriting: Skill = {
  id: "fr-w-health",
  code: "W.7",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing about health",
  description: "Fill in missing health vocabulary and arrange words into correct sentences about health.",
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
      hint: "Think about symptoms, body parts, and who works at a hospital.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
