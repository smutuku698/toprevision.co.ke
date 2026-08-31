import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Ureedu ", after: ", min fadlik.", answer: "khubzan", gloss: "I want bread, please." },
  { before: "Ureedu an ", after: " shayan.", answer: "ashraba", gloss: "I want to drink tea." },
  { before: "Al-hisab ", after: ".", answer: "min fadlik", gloss: "The bill, please." },
  { before: "", after: " jiddan!", answer: "Shukran", gloss: "Thank you very much!" },
];

const ORDER_PROMPTS = [
  "Arrange the words/phrases to form a correct Arabic sentence.",
  "Put these words and phrases in order to form a correct Arabic sentence.",
  "Rearrange the pieces below into a correct Arabic sentence.",
  "Order the words/phrases so they form a correct Arabic sentence.",
  "Click the pieces in the order that builds a correct Arabic sentence.",
  "Assemble these words/phrases into a correct Arabic sentence.",
];

const FILL_PROMPTS = [
  "Fill in the missing romanized word to complete the Arabic sentence.",
  "Complete the Arabic sentence by filling in the missing romanized word.",
  "Type the missing romanized word to finish the sentence correctly.",
  "Which romanized word completes this Arabic sentence? Fill it in.",
  "Fill in the blank with the correct romanized word.",
  "Supply the missing romanized word to complete the sentence.",
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["Ureedu", "khubzan", "wa lahman,", "min fadlik."], sentence: "Ureedu khubzan wa lahman, min fadlik.", gloss: "I want bread and meat, please." },
  { chunks: ["Ureedu", "an ashraba", "shayan."], sentence: "Ureedu an ashraba shayan.", gloss: "I want to drink tea." },
  { chunks: ["Shukran,", "al-hisab", "min fadlik."], sentence: "Shukran, al-hisab min fadlik.", gloss: "Thank you, the bill please." },
];

export const foodWriting: Skill = {
  id: "ar-w-food",
  code: "W.6",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing about ordering food and drinks",
  description: "Fill in missing words and arrange words to write correct Arabic restaurant sentences (romanized).",
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
        hint: "Sound the pieces out in different orders until the sentence makes sense.",
        explanation: `The correct sentence is: "${set.sentence}" — meaning "${set.gloss}"`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the food, drink, and etiquette words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
