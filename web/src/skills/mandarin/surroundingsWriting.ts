import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ jiā yǒu yì zhī ", after: " hé yì zhī gǒu.", answer: "māo", gloss: "我家有一只猫和一只狗。 (My family has a cat and a dog.)" },
  { before: "Shuǐniú hěn dà, yě hěn ", after: ".", answer: "xiōngměng", gloss: "水牛很大，也很凶猛。 (The buffalo is very big and also fierce.)" },
  { before: "Māo hěn ", after: ", gǒu hěn yǒuhǎo.", answer: "kě'ài", gloss: "猫很可爱，狗很友好。 (The cat is adorable, the dog is friendly.)" },
  { before: "Kěnníyà yǒu hěn duō yěshēng ", after: ".", answer: "dòngwù", gloss: "肯尼亚有很多野生动物。 (Kenya has many wild animals.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["水牛", "很大，", "也很凶猛。"], sentence: "水牛很大，也很凶猛。", gloss: "The buffalo is very big and also fierce." },
  { chunks: ["我家", "有", "一只猫。"], sentence: "我家有一只猫。", gloss: "My family has a cat." },
  { chunks: ["肯尼亚", "有很多", "野生动物。"], sentence: "肯尼亚有很多野生动物。", gloss: "Kenya has many wild animals." },
];

export const surroundingsWriting: Skill = {
  id: "ma-w-surroundings",
  code: "W.3",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about animals around me",
  description: "Fill in missing pinyin words and arrange hanzi to write correct sentences about animals.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to form a correct Mandarin sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Chinese word order is usually Subject + Verb + Object, just like English.",
        explanation: `The correct sentence is: "${set.sentence}" — meaning "${set.gloss}"`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing pinyin word to complete the sentence (tone marks optional).",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: pinyinAccepted(item.answer),
      inputMode: "text",
      hint: "Think about the animal and descriptive words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
