import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ měitiān zǎoshang qī diǎn ", after: ".", answer: "qǐchuáng", gloss: "我每天早上七点起床。 (I get up at 7am every day.)" },
  { before: "Wǒ měige xīngqīrì ", after: " yīfu.", answer: "xǐ", gloss: "我每个星期日洗衣服。 (I wash clothes every Sunday.)" },
  { before: "Wǎnshang wǒ zuò zuòyè, ránhòu ", after: ".", answer: "shuìjiào", gloss: "晚上我做作业，然后睡觉。 (In the evening I do homework, then sleep.)" },
  { before: "Wǒ chī zǎofàn, ", after: ".", answer: "xǐzǎo", gloss: "我吃早饭，洗澡。 (I eat breakfast, bathe.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "每天", "七点起床。"], sentence: "我每天七点起床。", gloss: "I get up at 7 o'clock every day." },
  { chunks: ["晚上", "我", "做作业。"], sentence: "晚上我做作业。", gloss: "In the evening I do homework." },
  { chunks: ["我", "每个星期日", "洗衣服。"], sentence: "我每个星期日洗衣服。", gloss: "I wash clothes every Sunday." },
];

export const routineWriting: Skill = {
  id: "ma-w-routine",
  code: "W.4",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about daily routine",
  description: "Fill in missing pinyin words and arrange hanzi to write correct sentences about a daily schedule.",
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
        hint: "Time expressions usually come near the start of a Mandarin sentence.",
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
      hint: "Think about the routine verbs you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
