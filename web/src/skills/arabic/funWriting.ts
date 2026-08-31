import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Hal anta ", after: " al-usbu' al-qadim?", answer: "mutafarrigh", gloss: "Are you free next week?" },
  { before: "Ana ", after: ", laa astatee'.", answer: "aasif", gloss: "I'm sorry, I can't." },
  { before: "Hal yumkinuka an tahjiza lee ", after: "?", answer: "ghadan", gloss: "Can you book me for tomorrow?" },
  { before: "Ladayya ", after: " as-saa'ata at-taasi'a.", answer: "maw'id", gloss: "I have an appointment at nine o'clock." },
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
  { chunks: ["Hal anta", "mutafarrigh", "ghadan?"], sentence: "Hal anta mutafarrigh ghadan?", gloss: "Are you free tomorrow?" },
  { chunks: ["Na'am,", "ana mutafarrigh", "yawm al-ithnayn."], sentence: "Na'am, ana mutafarrigh yawm al-ithnayn.", gloss: "Yes, I am free on Monday." },
  { chunks: ["Ladayya", "maw'id", "as-saa'ata ar-raabi'a."], sentence: "Ladayya maw'id as-saa'ata ar-raabi'a.", gloss: "I have an appointment at four o'clock." },
];

export const funWriting: Skill = {
  id: "ar-w-fun",
  code: "W.5",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing about plans and appointments",
  description: "Fill in missing words and arrange words to write correct Arabic sentences about plans (romanized).",
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
      hint: "Think about the expressions for plans and appointments you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
