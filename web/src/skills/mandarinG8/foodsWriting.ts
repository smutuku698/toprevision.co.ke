import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "food" | "drink" }[] = [
  { hanzi: "米饭", pinyin: "mǐfàn", meaning: "rice", tag: "food" },
  { hanzi: "面条", pinyin: "miàntiáo", meaning: "noodles", tag: "food" },
  { hanzi: "水果", pinyin: "shuǐguǒ", meaning: "fruit", tag: "food" },
  { hanzi: "茶", pinyin: "chá", meaning: "tea", tag: "drink" },
  { hanzi: "果汁", pinyin: "guǒzhī", meaning: "juice", tag: "drink" },
  { hanzi: "牛奶", pinyin: "niúnǎi", meaning: "milk", tag: "drink" },
  { hanzi: "水", pinyin: "shuǐ", meaning: "water", tag: "drink" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ xiǎng yào yì wǎn ",
    after: ", xièxie.",
    answer: "miàntiáo",
    gloss: "我想要一碗面条，谢谢。(Wǒ xiǎng yào yì wǎn miàntiáo, xièxie.) — I would like a bowl of noodles, thank you.",
  },
  {
    before: "Yígòng èrshí kuài ",
    after: ".",
    answer: "qián",
    gloss: "一共二十块钱。(Yígòng èrshí kuài qián.) — It is twenty kuai in total.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "想要", "一杯果汁。"], sentence: "我想要一杯果汁。", gloss: "Wǒ xiǎng yào yì bēi guǒzhī. — I would like a glass of juice." },
  { chunks: ["请", "给我", "菜单。"], sentence: "请给我菜单。", gloss: "Qǐng gěi wǒ càidān. — Please give me the menu." },
];

export const foodsWriting: Skill = {
  id: "g8-ma-w-foods",
  code: "W.6",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing about foods and drinks",
  description: "Guided writing — spelling, word order, and vocabulary for ordering food and drinks.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "match", "categorize"] as const);

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
        hint: "Polite requests often start with 请 (qǐng) or 我想要 (wǒ xiǎng yào).",
        explanation: `The correct sentence is: "${set.sentence}" — meaning "${set.gloss}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: "Match each food or drink word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether each word is something you eat or something you drink.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const foods = shuffle(rng, VOCAB.filter((v) => v.tag === "food"));
      const drinks = shuffle(rng, VOCAB.filter((v) => v.tag === "drink")).slice(0, 3);
      const chosen = shuffle(rng, [...foods, ...drinks]);
      const correctBucket: Record<string, string> = {};
      for (const v of foods) correctBucket[v.hanzi] = "food";
      for (const v of drinks) correctBucket[v.hanzi] = "drink";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Food or a Drink.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "food", label: "Food" },
          { id: "drink", label: "Drink" },
        ],
        correctBucket,
        hint: "Foods are eaten with 吃 (chī); drinks are drunk with 喝 (hē).",
        explanation: [...foods, ...drinks].map((v) => `"${v.hanzi}" is a ${correctBucket[v.hanzi]}.`).join(" "),
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
      hint: "Think about how to order food politely, and how prices are counted.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
