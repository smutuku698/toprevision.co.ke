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
  "Fill in the missing word to complete the sentence about future plans.",
  "Complete the sentence about future plans with the missing word.",
  "Type the missing word to finish the sentence about plans.",
  "Which word completes this sentence about future plans? Fill it in.",
  "Fill in the blank with the correct word for talking about plans.",
  "Add the missing word to complete the sentence correctly.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Je ", after: " nager ce week-end.", answer: "vais" },
  { before: "Nous allons ", after: " un film ce soir.", answer: "regarder" },
  { before: "La semaine ", after: ", nous allons voyager.", answer: "prochaine" },
  { before: "", after: ", je vais faire mes devoirs.", answer: "Ce soir" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Samedi matin,", "nous allons", "jouer au football."], sentence: "Samedi matin, nous allons jouer au football." },
  { chunks: ["Ce soir,", "je vais", "regarder un film."], sentence: "Ce soir, je vais regarder un film." },
  { chunks: ["La semaine prochaine,", "nous allons", "visiter un parc."], sentence: "La semaine prochaine, nous allons visiter un parc." },
];

export const plansWriting: Skill = {
  id: "fr-w-plans",
  code: "W.5",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing about plans and dates",
  description: "Fill in missing words and arrange words into correct sentences about future plans.",
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
        hint: "Time expressions like 'samedi matin' or 'ce soir' often start the sentence.",
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
      hint: "'Aller + infinitive' (le futur proche) is used to talk about near-future plans.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
