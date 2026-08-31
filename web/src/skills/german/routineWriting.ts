import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";
import { fillBlankPrompts, orderingPrompts } from "./germanPromptPools";

const ORDER_PROMPTS = orderingPrompts();
const FILL_PROMPTS = fillBlankPrompts();

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich ", after: " um 7 Uhr auf.", answer: "stehe" },
  { before: "Ich esse um 7.30 mein ", after: ".", answer: "Frühstück" },
  { before: "Ich ", after: " um 9.20 Uhr Mathe.", answer: "lerne" },
  { before: "Am Sonntag gehe ich in die ", after: ".", answer: "Kirche" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich stehe", "um 7 Uhr", "auf."], sentence: "Ich stehe um 7 Uhr auf." },
  { chunks: ["Ich lerne", "um 9.20 Uhr", "Mathe."], sentence: "Ich lerne um 9.20 Uhr Mathe." },
  { chunks: ["Am Sonntag", "gehe ich", "in die Kirche."], sentence: "Am Sonntag gehe ich in die Kirche." },
];

export const routineWriting: Skill = {
  id: "de-w-routine",
  code: "W.4",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing about daily routine",
  description: "Fill in missing routine words and arrange words to write correct German sentences about a daily routine.",
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
        hint: "German time expressions often come right after the verb.",
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
      hint: "Think about what happens at that time of day.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
