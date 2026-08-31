import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Jīntiān shì ", after: ", hěn nuǎnhuo.", answer: "qíngtiān", gloss: "今天是晴天，很暖和。 (Today is sunny, and warm.)" },
  { before: "Wǒ dǎsuàn qù ", after: ".", answer: "diàoyú", gloss: "我打算去钓鱼。 (I plan to go fishing.)" },
  { before: "Kěshì míngtiān kěnéng ", after: ".", answer: "xiàyǔ", gloss: "可是明天可能下雨。 (But tomorrow it might rain.)" },
  { before: "Xiàyǔtiān wǒ xǐhuan zài jiā kàn ", after: ".", answer: "shū", gloss: "下雨天我喜欢在家看书。 (On rainy days I like to stay home and read.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["今天", "是晴天，", "很暖和。"], sentence: "今天是晴天，很暖和。", gloss: "Today is sunny, and warm." },
  { chunks: ["我", "打算", "去钓鱼。"], sentence: "我打算去钓鱼。", gloss: "I plan to go fishing." },
  { chunks: ["明天", "可能", "下雨。"], sentence: "明天可能下雨。", gloss: "It might rain tomorrow." },
];

export const environmentWriting: Skill = {
  id: "ma-w-environment",
  code: "W.8",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about weather and environment",
  description: "Fill in missing pinyin words and arrange hanzi to write correct sentences about the weather.",
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
        hint: "Time words like 今天 (jīntiān, 'today') and 明天 (míngtiān, 'tomorrow') usually come first.",
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
      hint: "Think about the weather vocabulary you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
