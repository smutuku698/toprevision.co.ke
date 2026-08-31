import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "shop" | "food" }[] = [
  { hanzi: "肉店", pinyin: "ròudiàn", meaning: "butcher shop", tag: "shop" },
  { hanzi: "面包店", pinyin: "miànbāodiàn", meaning: "bakery", tag: "shop" },
  { hanzi: "蔬菜店", pinyin: "shūcàidiàn", meaning: "vegetable store", tag: "shop" },
  { hanzi: "超市", pinyin: "chāoshì", meaning: "supermarket", tag: "shop" },
  { hanzi: "饭店", pinyin: "fàndiàn", meaning: "restaurant", tag: "shop" },
  { hanzi: "鸡肉", pinyin: "jīròu", meaning: "chicken", tag: "food" },
  { hanzi: "牛肉", pinyin: "niúròu", meaning: "beef", tag: "food" },
  { hanzi: "羊肉", pinyin: "yángròu", meaning: "mutton", tag: "food" },
  { hanzi: "猪肉", pinyin: "zhūròu", meaning: "pork", tag: "food" },
  { hanzi: "面包", pinyin: "miànbāo", meaning: "bread", tag: "food" },
  { hanzi: "蛋糕", pinyin: "dàngāo", meaning: "cake", tag: "food" },
  { hanzi: "饼干", pinyin: "bǐnggān", meaning: "biscuit", tag: "food" },
  { hanzi: "米饭", pinyin: "mǐfàn", meaning: "rice", tag: "food" },
  { hanzi: "面条", pinyin: "miàntiáo", meaning: "noodles", tag: "food" },
  { hanzi: "大饼", pinyin: "dàbǐng", meaning: "flatbread", tag: "food" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Māma, wǒmen qù ",
    after: " mǎi dōngxi ba.",
    answer: "chāoshì",
    gloss: "妈妈，我们去超市买东西吧。(Māma, wǒmen qù chāoshì mǎi dōngxi ba.) — Mom, let's go to the supermarket to buy things.",
  },
  {
    before: "Mǎi liǎng jīn niúròu hé yì jīn ",
    after: "。",
    answer: "jīròu",
    gloss: "买两斤牛肉和一斤鸡肉。(Mǎi liǎng jīn niúròu hé yì jīn jīròu.) — Buy two jin of beef and one jin of chicken.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["我们去超市", "买牛肉", "和面包。"],
    sentence: "我们去超市买牛肉和面包。",
    gloss: "Wǒmen qù chāoshì mǎi niúròu hé miànbāo. — We go to the supermarket to buy beef and bread.",
  },
];

export const foodsSpeaking: Skill = {
  id: "g7-ma-ls-foods",
  code: "LS.6",
  subjectId: "mandarin",
  strandId: "g7-ma-listening-speaking",
  grade: 7,
  title: "Foods and drinks: shopping for food",
  description: "Food shops and food-item vocabulary — oral vocabulary and expressions for shopping for food.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: "Match each food-shopping word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words name a shop; others name a food item you might buy there.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shops = shuffle(rng, VOCAB.filter((v) => v.tag === "shop")).slice(0, 4);
      const foods = shuffle(rng, VOCAB.filter((v) => v.tag === "food")).slice(0, 5);
      const items = shuffle(rng, [...shops, ...foods]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Shop or a Food Item.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "shop", label: "Shop" },
          { id: "food", label: "Food Item" },
        ],
        correctBucket,
        hint: "A shop is a place you go to; a food item is something you'd buy there.",
        explanation: [...shops, ...foods]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "shop" ? "shop" : "food item"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, [correct.meaning, ...distractors.map((d) => d.meaning)]);

      return {
        kind: "multiple-choice",
        prompt: `What does "${correct.hanzi} (${correct.pinyin})" mean?`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Decide whether this word names a shop or a food item.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing pinyin word to complete the sentence (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "The sentence is about a shopping trip — think about where they're going or what they're buying.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi phrases to describe a food-shopping trip.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Say where you're going first, then what you'll buy.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
