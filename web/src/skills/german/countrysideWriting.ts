import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "./germanUtils";
import { fillBlankPrompts, orderingPrompts } from "./germanPromptPools";

const ORDER_PROMPTS = orderingPrompts();
const FILL_PROMPTS = fillBlankPrompts("animal word");

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Die ", after: " gibt Milch.", answer: "Kuh" },
  { before: "Der ", after: " hat eine lange Nase.", answer: "Elefant" },
  { before: "Das ", after: " legt Eier.", answer: "Huhn" },
  { before: "Die ", after: " miaut.", answer: "Katze" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Die Kuh", "ist", "braun und groß."], sentence: "Die Kuh ist braun und groß." },
  { chunks: ["Der Elefant", "hat", "eine lange Nase."], sentence: "Der Elefant hat eine lange Nase." },
  { chunks: ["Die Katze", "ist", "klein."], sentence: "Die Katze ist klein." },
];

export const countrysideWriting: Skill = {
  id: "de-w-countryside",
  code: "W.3",
  subjectId: "german",
  strandId: "de-writing",
  grade: 9,
  title: "Writing about animals in the countryside",
  description: "Fill in missing animal words and arrange words to write correct German sentences about animals.",
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
        hint: "Start with the animal, then the verb, then the description.",
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
      hint: "Think about which animal matches the description.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
