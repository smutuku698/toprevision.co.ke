import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Haadha ", after: ", ismuhu Ahmad.", answer: "abi", gloss: "This is my father, his name is Ahmad." },
  { before: "Haadhihi ", after: ", ismuha Fatima.", answer: "ummi", gloss: "This is my mother, her name is Fatima." },
  { before: "Haadha ", after: " wa haadhihi ukhti.", answer: "akhi", gloss: "This is my brother and this is my sister." },
  { before: "Nuhibbu ba'dana ", after: ".", answer: "katheeran", gloss: "We love each other very much." },
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
  { chunks: ["Hadhihi", "usrati,", "nuhibbu ba'dana."], sentence: "Hadhihi usrati, nuhibbu ba'dana.", gloss: "This is my family, we love each other." },
  { chunks: ["Haadha", "jaddi", "wa haadhihi jaddati."], sentence: "Haadha jaddi wa haadhihi jaddati.", gloss: "This is my grandfather and this is my grandmother." },
  { chunks: ["'Ammi", "wa", "khaali", "yazuurunani."], sentence: "'Ammi wa khaali yazuurunani.", gloss: "My paternal uncle and maternal uncle visit us." },
];

export const familyWriting: Skill = {
  id: "ar-w-family",
  code: "W.2",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing about family members",
  description: "Fill in missing words and arrange words to write correct Arabic sentences about family (romanized).",
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
      hint: "Think about the family words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
