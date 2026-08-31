import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";
import { fillBlankPrompts, orderingPrompts } from "./germanPromptPools";

const ORDER_PROMPTS = orderingPrompts();
const FILL_PROMPTS = fillBlankPrompts();

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich ", after: " Amina.", answer: "heiße" },
  { before: "Wie ", after: " es dir?", answer: "geht" },
  { before: "Ich komme ", after: " Nairobi.", answer: "aus" },
  { before: "Auf ", after: "!", answer: "Wiedersehen" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Guten Tag,", "ich heiße", "Amina."], sentence: "Guten Tag, ich heiße Amina." },
  { chunks: ["Wie", "geht", "es", "dir?"], sentence: "Wie geht es dir?" },
  { chunks: ["Auf Wiedersehen,", "bis", "bald!"], sentence: "Auf Wiedersehen, bis bald!" },
];

export const greetingsWriting: Skill = {
  id: "de-w-greetings",
  code: "W.1",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing greetings and introductions",
  description: "Fill in missing words and arrange words to write correct German greeting sentences.",
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
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Think about the greeting expressions you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
