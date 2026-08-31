import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";
import { fillBlankPrompts, orderingPrompts } from "./germanPromptPools";

const ORDER_PROMPTS = orderingPrompts();
const FILL_PROMPTS = fillBlankPrompts("family word");

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Mein ", after: " heißt Otieno.", answer: "Vater" },
  { before: "Meine ", after: " ist Ärztin.", answer: "Mutter" },
  { before: "Mein ", after: " ist zwölf Jahre alt.", answer: "Bruder" },
  { before: "Meine ", after: " heißt Nyambura.", answer: "Oma" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Mein Vater", "heißt", "Otieno."], sentence: "Mein Vater heißt Otieno." },
  { chunks: ["Meine Mutter", "ist", "Ärztin."], sentence: "Meine Mutter ist Ärztin." },
  { chunks: ["Mein Bruder", "ist", "zwölf Jahre alt."], sentence: "Mein Bruder ist zwölf Jahre alt." },
];

export const familyWriting: Skill = {
  id: "de-w-family",
  code: "W.2",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing about nuclear and extended family",
  description: "Fill in missing family words and arrange words to write correct German sentences about family.",
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
        hint: "Subject, then verb, then the rest of the information.",
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
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about who is being described in the sentence.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
