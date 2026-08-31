import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ jiā yǒu sān kǒu ", after: ".", answer: "rén", gloss: "我家有三口人。 (My family has three people.)" },
  { before: "Wǒ bàba shì ", after: ", zài yīyuàn gōngzuò.", answer: "yīshēng", gloss: "我爸爸是医生，在医院工作。 (My dad is a doctor, working at a hospital.)" },
  { before: "Wǒ ", after: " shì lǎoshī.", answer: "māma", gloss: "我妈妈是老师。 (My mom is a teacher.)" },
  { before: "Wǒ shūshu shì jǐngchá, zài ", after: " gōngzuò.", answer: "pàichūsuǒ", gloss: "我叔叔是警察，在派出所工作。 (My uncle is a police officer, working at the police station.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "爸爸", "是医生。"], sentence: "我爸爸是医生。", gloss: "My dad is a doctor." },
  { chunks: ["我家", "有", "三口人。"], sentence: "我家有三口人。", gloss: "My family has three people." },
  { chunks: ["我", "叔叔", "是警察。"], sentence: "我叔叔是警察。", gloss: "My uncle is a police officer." },
];

export const familyWriting: Skill = {
  id: "ma-w-family",
  code: "W.2",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about family and professions",
  description: "Fill in missing pinyin words and arrange hanzi to write correct sentences about family members.",
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
      hint: "Think about the family and profession words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
