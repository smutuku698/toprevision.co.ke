import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Nín ", after: ", wǒ jiào Ānnà.", answer: "hǎo", gloss: "您好，我叫安娜。 (Hello, I'm Ana.)" },
  { before: "Wǒ ", after: " Wáng.", answer: "xìng", gloss: "我姓王。 (My surname is Wang.)" },
  { before: "Nín shì nǎ guó ", after: "?", answer: "rén", gloss: "您是哪国人？ (What country are you from?)" },
  { before: "", after: ", Ānnà!", answer: "Xìnghuì", gloss: "幸会，安娜！ (Pleased to meet you, Ana!)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["您好，", "我叫安娜，", "很高兴认识您！"], sentence: "您好，我叫安娜，很高兴认识您！", gloss: "Hello, I'm Ana, nice to meet you!" },
  { chunks: ["我", "是", "肯尼亚人。"], sentence: "我是肯尼亚人。", gloss: "I am Kenyan." },
  { chunks: ["您", "贵姓？"], sentence: "您贵姓？", gloss: "What is your (honourable) surname?" },
];

export const greetingsWriting: Skill = {
  id: "ma-w-greetings",
  code: "W.1",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing formal greetings and introductions",
  description: "Fill in missing pinyin words and arrange hanzi to write correct Mandarin greeting sentences.",
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
        hint: "Sound the pieces out in different orders until the sentence makes sense.",
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
      hint: "Think about the greeting expressions you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
