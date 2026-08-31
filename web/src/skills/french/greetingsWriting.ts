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
  "Fill in the missing word to complete the French sentence.",
  "Complete the French sentence with the missing word.",
  "Type the missing word to finish the French sentence.",
  "Which word completes this French sentence? Fill it in.",
  "Fill in the blank with the correct French word.",
  "Add the missing word to complete the sentence correctly.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Comment ", after: "-vous ?", answer: "allez" },
  { before: "Je vais ", after: ", merci.", answer: "bien" },
  { before: "", after: ", à bientôt !", answer: "Au revoir" },
  { before: "Comment vous ", after: "-vous ?", answer: "appelez" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Bonjour Monsieur,", "comment allez-vous", "?"], sentence: "Bonjour Monsieur, comment allez-vous ?" },
  { chunks: ["Je m'appelle", "Amina,", "enchantée", "!"], sentence: "Je m'appelle Amina, enchantée !" },
  { chunks: ["Au revoir,", "à bientôt", "!"], sentence: "Au revoir, à bientôt !" },
];

export const greetingsWriting: Skill = {
  id: "fr-w-greetings",
  code: "W.1",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing formal greetings and introductions",
  description: "Fill in missing words and arrange words to write correct French greeting sentences.",
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
        hint: "Read the pieces aloud in different orders until the sentence sounds right.",
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
      hint: "Think about the greeting expressions you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
