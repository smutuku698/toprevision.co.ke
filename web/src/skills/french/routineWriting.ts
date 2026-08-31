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
  "Fill in the missing verb to complete the routine sentence.",
  "Complete the routine sentence with the missing verb.",
  "Type the missing verb to finish the sentence about daily routine.",
  "Which verb completes this routine sentence? Fill it in.",
  "Fill in the blank with the correct routine verb.",
  "Add the missing verb to complete the sentence correctly.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Je me ", after: " à cinq heures.", answer: "lève" },
  { before: "Je ", after: " mes devoirs après l'école.", answer: "fais" },
  { before: "Nous ", after: " à vingt heures.", answer: "dînons" },
  { before: "Je me ", after: " à vingt-deux heures.", answer: "couche" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je me lève", "à cinq heures", "chaque matin."], sentence: "Je me lève à cinq heures chaque matin." },
  { chunks: ["Après l'école,", "je fais", "mes devoirs."], sentence: "Après l'école, je fais mes devoirs." },
  { chunks: ["Je me couche", "à vingt-deux heures", "quarante-cinq."], sentence: "Je me couche à vingt-deux heures quarante-cinq." },
];

export const routineWriting: Skill = {
  id: "fr-w-routine",
  code: "W.4",
  subjectId: "french",
  strandId: "fr-writing",
  grade: 9,
  title: "Writing about daily routine",
  description: "Fill in missing routine verbs and arrange words into correct sentences about daily routine.",
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
        hint: "Time expressions often come at the start or end of a routine sentence.",
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
      hint: "Match the verb form to the subject (je, nous...) already in the sentence.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
