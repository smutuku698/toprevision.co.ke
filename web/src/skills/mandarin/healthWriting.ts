import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ gǎnjué bù shūfu, ", after: ", hái yǒudiǎn fāshāo.", answer: "tóuténg", gloss: "我感觉不舒服，头疼，还有点发烧。 (I feel unwell, headache, and a bit of a fever.)" },
  { before: "Nǐ yīnggāi qù ", after: ".", answer: "kànbìng", gloss: "你应该去看病。 (You should go see a doctor.)" },
  { before: "Wǒ xiǎng qù kàn yīshēng, ránhòu ", after: ".", answer: "chī yào", gloss: "我想去看医生，然后吃药。 (I want to see the doctor, then take medicine.)" },
  { before: "Xīwàng nǐ zǎodiǎn ", after: "!", answer: "hǎo qǐlái", gloss: "希望你早点好起来！ (Hope you get well soon!)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "感觉", "不舒服。"], sentence: "我感觉不舒服。", gloss: "I feel unwell." },
  { chunks: ["你", "应该", "去看病。"], sentence: "你应该去看病。", gloss: "You should go see a doctor." },
  { chunks: ["我", "头疼，", "还发烧。"], sentence: "我头疼，还发烧。", gloss: "I have a headache, and also a fever." },
];

export const healthWriting: Skill = {
  id: "ma-w-health",
  code: "W.7",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about how you feel",
  description: "Fill in missing pinyin words and arrange hanzi to write correct sentences about health.",
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
        hint: "Describe how you feel first, then what you think should happen.",
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
      hint: "Think about the symptoms and clinic vocabulary you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
