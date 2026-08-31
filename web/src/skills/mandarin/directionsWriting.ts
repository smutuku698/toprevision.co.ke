import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Qǐngwèn, túshūguǎn zài ", after: "?", answer: "nǎr", gloss: "请问，图书馆在哪儿？ (Excuse me, where is the library?)" },
  { before: "Yìzhí zǒu, ránhòu wǎng yòu ", after: ".", answer: "guǎi", gloss: "一直走，然后往右拐。 (Go straight, then turn right.)" },
  { before: "Bù yuǎn, hěn ", after: ".", answer: "jìn", gloss: "不远，很近。 (Not far, very near.)" },
  { before: "Zǒu wǔ fēnzhōng jiù ", after: " le.", answer: "dào", gloss: "走五分钟就到了。 (Five minutes on foot and you'll arrive.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["一直走，", "然后", "往右拐。"], sentence: "一直走，然后往右拐。", gloss: "Go straight, then turn right." },
  { chunks: ["图书馆", "离这儿", "很近。"], sentence: "图书馆离这儿很近。", gloss: "The library is very near here." },
  { chunks: ["请问，", "图书馆", "在哪儿？"], sentence: "请问，图书馆在哪儿？", gloss: "Excuse me, where is the library?" },
];

export const directionsWriting: Skill = {
  id: "ma-w-directions",
  code: "W.9",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about directions and location",
  description: "Fill in missing pinyin words and arrange hanzi to write correct sentences about directions.",
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
        hint: "Direction instructions are usually given as a sequence of steps.",
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
      hint: "Think about the direction vocabulary you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
