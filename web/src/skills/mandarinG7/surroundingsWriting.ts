import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "shop" | "transaction" | "item" }[] = [
  { hanzi: "书店", pinyin: "shūdiàn", meaning: "bookstore", tag: "shop" },
  { hanzi: "衣服店", pinyin: "yīfú diàn", meaning: "clothing store", tag: "shop" },
  { hanzi: "食品店", pinyin: "shípǐn diàn", meaning: "food store", tag: "shop" },
  { hanzi: "药店", pinyin: "yàodiàn", meaning: "pharmacy", tag: "shop" },
  { hanzi: "鞋店", pinyin: "xiédiàn", meaning: "shoe store", tag: "shop" },
  { hanzi: "市场", pinyin: "shìchǎng", meaning: "market", tag: "shop" },
  { hanzi: "老板", pinyin: "lǎobǎn", meaning: "shopkeeper", tag: "transaction" },
  { hanzi: "多少钱", pinyin: "duōshǎo qián", meaning: "how much money", tag: "transaction" },
  { hanzi: "买", pinyin: "mǎi", meaning: "to buy", tag: "transaction" },
  { hanzi: "卖", pinyin: "mài", meaning: "to sell", tag: "transaction" },
  { hanzi: "水果", pinyin: "shuǐguǒ", meaning: "fruit", tag: "item" },
  { hanzi: "蔬菜", pinyin: "shūcài", meaning: "vegetables", tag: "item" },
  { hanzi: "钱", pinyin: "qián", meaning: "money", tag: "item" },
  { hanzi: "药", pinyin: "yào", meaning: "medicine", tag: "item" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ yào ", after: " shuǐguǒ.", answer: "mǎi", gloss: "我要买水果。(I want to buy fruit.)" },
  { before: "Zhège shìchǎng ", after: " shénme?", answer: "mài", gloss: "这个市场卖什么？(What does this market sell?)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我要去市场", "买水果", "和蔬菜。"], sentence: "我要去市场买水果和蔬菜。", gloss: "I want to go to the market to buy fruit and vegetables." },
];

export const surroundingsWriting: Skill = {
  id: "g7-ma-w-surroundings",
  code: "W.3",
  subjectId: "mandarin",
  strandId: "g7-ma-writing",
  grade: 7,
  title: "My surroundings: the marketplace",
  description: "Guided writing — spelling, word order, and vocabulary for shops and marketplace transactions.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "match", "categorize", "mc"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to describe a shopping trip.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Say where you're going first, then what you'll buy.",
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
        prompt: "Match each shop or marketplace word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words name a place to shop; others describe the act of buying and selling.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shops = shuffle(rng, VOCAB.filter((v) => v.tag === "shop")).slice(0, 3);
      const transactions = shuffle(rng, VOCAB.filter((v) => v.tag === "transaction")).slice(0, 3);
      const chosen = shuffle(rng, [...shops, ...transactions]);
      const correctBucket: Record<string, string> = {};
      for (const v of shops) correctBucket[v.hanzi] = "shop";
      for (const v of transactions) correctBucket[v.hanzi] = "transaction";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Shop or a Transaction Word.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "shop", label: "Shop" },
          { id: "transaction", label: "Transaction Word" },
        ],
        correctBucket,
        hint: "A shop is a place; a transaction word describes buying and selling.",
        explanation: [...shops, ...transactions].map((v) => `"${v.hanzi}" is a ${correctBucket[v.hanzi] === "shop" ? "shop" : "transaction word"}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, [correct.hanzi, ...distractors.map((d) => d.hanzi)]);

      return {
        kind: "multiple-choice",
        prompt: `Which hanzi word correctly means "${correct.meaning}"?`,
        choices,
        correctIndex: choices.indexOf(correct.hanzi),
        layout: "list",
        hint: "Match the meaning to the exact word, not a similar shopping-related one.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" is the word that means "${correct.meaning}".`,
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
      hint: "Think about whether the sentence is about buying or selling.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
