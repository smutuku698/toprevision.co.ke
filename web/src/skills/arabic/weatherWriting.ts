import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Ash-shamsu ", after: " al-yawm.", answer: "haaratun", gloss: "The sun is hot today." },
  { before: "Yanzilu al-", after: " katheeran fee ash-shitaa'.", answer: "matar", gloss: "A lot of rain falls in winter." },
  { before: "An-naasu ya'maloona fee az-", after: ".", answer: "ziraa'a", gloss: "People work in farming." },
  { before: "Al-jawwu ", after: " al-yawm.", answer: "baaridun", gloss: "The weather is cold today." },
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
  { chunks: ["Ash-shamsu", "haaratun", "fee as-sayf."], sentence: "Ash-shamsu haaratun fee as-sayf.", gloss: "The sun is hot in summer." },
  { chunks: ["Ba'du", "ar-rijaal", "yadhhaboona", "li sayd as-samak."], sentence: "Ba'du ar-rijaal yadhhaboona li sayd as-samak.", gloss: "Some men go fishing." },
  { chunks: ["Al-jawwu", "baaridun", "wa yanzilu al-matar."], sentence: "Al-jawwu baaridun wa yanzilu al-matar.", gloss: "The weather is cold and it is raining." },
];

export const weatherWriting: Skill = {
  id: "ar-w-weather",
  code: "W.8",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing about weather and local activities",
  description: "Fill in missing words and arrange words to write correct Arabic sentences about weather (romanized).",
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
      hint: "Think about the weather and activity words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
