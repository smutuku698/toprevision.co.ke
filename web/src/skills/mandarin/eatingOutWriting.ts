import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ xiǎng yào yí fèn chǎofàn hé yì wǎn ", after: ".", answer: "tāng", gloss: "我想要一份炒饭和一碗汤。 (I would like a fried rice and a bowl of soup.)" },
  { before: "Qǐng gěi wǒ yì shuāng ", after: ".", answer: "kuàizi", gloss: "请给我一双筷子。 (Please give me a pair of chopsticks.)" },
  { before: "", after: "?", answer: "Duōshao qián", gloss: "多少钱？ (How much money?)" },
  { before: "Yígòng èrshí ", after: ".", answer: "kuài", gloss: "一共二十块。 (Twenty kuai in total.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我想要", "一份炒饭", "和一碗汤。"], sentence: "我想要一份炒饭和一碗汤。", gloss: "I would like a fried rice and a bowl of soup." },
  { chunks: ["请", "给我", "一双筷子。"], sentence: "请给我一双筷子。", gloss: "Please give me a pair of chopsticks." },
  { chunks: ["一共", "二十块。"], sentence: "一共二十块。", gloss: "Twenty kuai in total." },
];

export const eatingOutWriting: Skill = {
  id: "ma-w-eating-out",
  code: "W.6",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about ordering food",
  description: "Fill in missing pinyin words and arrange hanzi to write correct restaurant sentences.",
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
        hint: "Polite requests like 请 (qǐng, 'please') usually come at the start of the sentence.",
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
      hint: "Think about the restaurant vocabulary you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
