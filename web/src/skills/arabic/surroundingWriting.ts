import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Qittati ", after: " wa baydaa'.", answer: "sagheeratun", gloss: "My cat is small and white." },
  { before: "Al-feel ", after: " jiddan.", answer: "kabeerun", gloss: "The elephant is very big." },
  { before: "Ra'aytu ", after: " fee al-hadeeqa.", answer: "asadan", gloss: "I saw a lion at the park." },
  { before: "Ladayna ", after: " fee al-mazra'a.", answer: "kharoof", gloss: "We have a sheep on the farm." },
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
  { chunks: ["Qittati", "sagheeratun", "wa baydaa'."], sentence: "Qittati sagheeratun wa baydaa'.", gloss: "My cat is small and white." },
  { chunks: ["Ra'aytu", "asadan", "kabeeran", "fee al-hadeeqa."], sentence: "Ra'aytu asadan kabeeran fee al-hadeeqa.", gloss: "I saw a big lion at the park." },
  { chunks: ["Al-baqara", "sawdaa'", "wa kabeeratun."], sentence: "Al-baqara sawdaa' wa kabeeratun.", gloss: "The cow is black and big." },
];

export const surroundingWriting: Skill = {
  id: "ar-w-surrounding",
  code: "W.3",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing about animals in my surrounding",
  description: "Fill in missing words and arrange words to write correct Arabic sentences describing animals (romanized).",
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
      hint: "Think about the size and colour words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
