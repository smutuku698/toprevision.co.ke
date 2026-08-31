import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "./mandarinUtils";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ dǎsuàn gēn péngyou qù gōngyuán kàn ", after: ".", answer: "dòngwù", gloss: "我打算跟朋友去公园看动物。 (I plan to go to the park with a friend to see animals.)" },
  { before: "Zhōumò nǐ ", after: " zuò shénme?", answer: "dǎsuàn", gloss: "周末你打算做什么？ (What do you plan to do on the weekend?)" },
  { before: "Wǒ yào qù shāngchǎng, ránhòu qí ", after: ".", answer: "zìxíngchē", gloss: "我要去商场，然后骑自行车。 (I want to go to the mall, then ride a bicycle.)" },
  { before: "Tīng qǐlái hěn ", after: "!", answer: "hǎowán", gloss: "听起来很好玩！ (Sounds fun!)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "打算", "去公园看动物。"], sentence: "我打算去公园看动物。", gloss: "I plan to go to the park to see animals." },
  { chunks: ["周末", "你", "打算做什么？"], sentence: "周末你打算做什么？", gloss: "What do you plan to do on the weekend?" },
  { chunks: ["我要", "去商场，", "然后骑自行车。"], sentence: "我要去商场，然后骑自行车。", gloss: "I want to go to the mall, then ride a bicycle." },
];

export const plansWriting: Skill = {
  id: "ma-w-plans",
  code: "W.5",
  subjectId: "mandarin",
  strandId: "ma-writing",
  grade: 9,
  title: "Writing about fun activities and plans",
  description: "Fill in missing pinyin words and arrange hanzi to write correct sentences about weekend plans.",
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
        hint: "打算 (dǎsuàn, 'plan to') comes right before the activity it introduces.",
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
      hint: "Think about the plans and activities vocabulary you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
