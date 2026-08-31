import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "food" | "taste";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "红薯", pinyin: "hóngshǔ", meaning: "sweet potato", tag: "food" },
  { hanzi: "面包", pinyin: "miànbāo", meaning: "bread", tag: "food" },
  { hanzi: "鸡蛋", pinyin: "jīdàn", meaning: "egg", tag: "food" },
  { hanzi: "奶茶", pinyin: "nǎichá", meaning: "milk tea", tag: "food" },
  { hanzi: "乌加利", pinyin: "wūjiālì", meaning: "ugali", tag: "food" },
  { hanzi: "米饭", pinyin: "mǐfàn", meaning: "rice", tag: "food" },
  { hanzi: "饼", pinyin: "bǐng", meaning: "pancake / flatbread", tag: "food" },
  { hanzi: "炖豆", pinyin: "dùn dòu", meaning: "stewed beans", tag: "food" },
  { hanzi: "炖牛肉", pinyin: "dùn niúròu", meaning: "stewed beef", tag: "food" },
  { hanzi: "蔬菜", pinyin: "shūcài", meaning: "vegetables", tag: "food" },
  { hanzi: "咸", pinyin: "xián", meaning: "salty", tag: "taste" },
  { hanzi: "甜", pinyin: "tián", meaning: "sweet", tag: "taste" },
  { hanzi: "辣", pinyin: "là", meaning: "spicy", tag: "taste" },
  { hanzi: "苦", pinyin: "kǔ", meaning: "bitter", tag: "taste" },
  { hanzi: "酸", pinyin: "suān", meaning: "sour", tag: "taste" },
  { hanzi: "好吃", pinyin: "hǎochī", meaning: "delicious (food)", tag: "taste" },
  { hanzi: "好喝", pinyin: "hǎohē", meaning: "delicious (drink)", tag: "taste" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "", after: " tián.", answer: "Hóngshǔ", gloss: "红薯甜。— Sweet potato is sweet." },
  { before: "", after: " hǎochī.", answer: "Wūjiālì", gloss: "乌加利好吃。— Ugali is delicious." },
  { before: "", after: " hǎohē.", answer: "Nǎichá", gloss: "奶茶好喝。— Milk tea is delicious (to drink)." },
  { before: "Mǐfàn ", after: ".", answer: "xián", gloss: "米饭咸。— Rice is salty." },
  { before: "Dùn dòu ", after: ".", answer: "là", gloss: "炖豆辣。— Stewed beans are spicy." },
  { before: "", after: " hǎochī.", answer: "Dùn niúròu", gloss: "炖牛肉好吃。— Stewed beef is delicious." },
  { before: "Shūcài ", after: ".", answer: "kǔ", gloss: "蔬菜苦。— Vegetables are bitter." },
  { before: "Miànbāo ", after: ".", answer: "tián", gloss: "面包甜。— Bread is sweet." },
  { before: "Jīdàn ", after: ".", answer: "xián", gloss: "鸡蛋咸。— Egg is salty." },
  { before: "Bǐng ", after: ".", answer: "suān", gloss: "饼酸。— Pancake is sour." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["红薯甜，", "乌加利", "好吃。"], sentence: "红薯甜，乌加利好吃。", gloss: "Hóngshǔ tián, wūjiālì hǎochī. — Sweet potato is sweet, ugali is delicious." },
  { chunks: ["奶茶好喝，", "米饭", "咸。"], sentence: "奶茶好喝，米饭咸。", gloss: "Nǎichá hǎohē, mǐfàn xián. — Milk tea is delicious, rice is salty." },
  { chunks: ["炖豆辣，", "炖牛肉", "好吃。"], sentence: "炖豆辣，炖牛肉好吃。", gloss: "Dùn dòu là, dùn niúròu hǎochī. — Stewed beans are spicy, stewed beef is delicious." },
  { chunks: ["蔬菜苦，", "面包", "甜。"], sentence: "蔬菜苦，面包甜。", gloss: "Shūcài kǔ, miànbāo tián. — Vegetables are bitter, bread is sweet." },
  { chunks: ["鸡蛋咸，", "饼", "酸。"], sentence: "鸡蛋咸，饼酸。", gloss: "Jīdàn xián, bǐng suān. — Egg is salty, pancake is sour." },
  { chunks: ["红薯甜，", "米饭咸，", "蔬菜苦。"], sentence: "红薯甜，米饭咸，蔬菜苦。", gloss: "Hóngshǔ tián, mǐfàn xián, shūcài kǔ. — Sweet potato is sweet, rice is salty, vegetables are bitter." },
  { chunks: ["乌加利好吃，", "奶茶好喝，", "炖牛肉好吃。"], sentence: "乌加利好吃，奶茶好喝，炖牛肉好吃。", gloss: "Wūjiālì hǎochī, nǎichá hǎohē, dùn niúròu hǎochī. — Ugali is delicious, milk tea is delicious, stewed beef is delicious." },
  { chunks: ["面包甜，", "鸡蛋咸，", "炖豆辣。"], sentence: "面包甜，鸡蛋咸，炖豆辣。", gloss: "Miànbāo tián, jīdàn xián, dùn dòu là. — Bread is sweet, egg is salty, stewed beans are spicy." },
  { chunks: ["饼酸，", "蔬菜苦，", "米饭咸。"], sentence: "饼酸，蔬菜苦，米饭咸。", gloss: "Bǐng suān, shūcài kǔ, mǐfàn xián. — Pancake is sour, vegetables are bitter, rice is salty." },
  { chunks: ["红薯甜，", "炖牛肉好吃，", "奶茶好喝。"], sentence: "红薯甜，炖牛肉好吃，奶茶好喝。", gloss: "Hóngshǔ tián, dùn niúròu hǎochī, nǎichá hǎohē. — Sweet potato is sweet, stewed beef is delicious, milk tea is delicious." },
];

const MATCH_OPENERS = [
  "Match each food or taste word to its correct English meaning.",
  "Pair up every word below with what it means in English.",
  "Connect each term to its correct translation.",
  "Find the right English meaning for each item shown.",
  "Look at each word and match it to its meaning.",
];
const MATCH_CLOSERS = [
  "Say each one aloud in your head as you match it.",
  "Match every item before you check your answers.",
  "Think about the pinyin pronunciation as you decide.",
  "Take your time with each pair.",
];

const CATEGORIZE_OPENERS = [
  "Sort each word below into the correct group.",
  "Decide which category each word belongs to.",
  "Group these words by whether they name a food or describe a taste.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about whether it names something to eat or drink, or describes how it tastes.",
  "Some are foods, others describe flavour.",
  "Use what you know about each word's meaning.",
  "Check each one carefully before moving on.",
];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence.",
  "Complete the sentence below with the correct pinyin word.",
  "Type the missing word (tone marks optional) to finish the sentence.",
  "One word is missing from this spoken sentence — fill it in.",
  "Read the sentence and supply the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Tone marks are optional if you can't type them.",
  "Think about what makes the sentence grammatically complete.",
  "Sound the sentence out before you answer.",
  "Check the surrounding words for clues.",
];

const ORDER_OPENERS = [
  "Arrange the hanzi pieces to form a correct spoken sentence.",
  "Put the words in the right order to make a complete sentence.",
  "Reorder the chunks below into a correct Mandarin sentence.",
  "Rebuild the sentence by placing each piece in order.",
  "Click the pieces in the order a fluent speaker would say them.",
];
const ORDER_CLOSERS = [
  "Say the sentence in your head as you order the pieces.",
  "Think about which food is being described in each part.",
  "Check the meaning of each chunk before deciding its place.",
  "The food name usually comes right before its taste.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, is describing lunch in Mandarin class and says "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `At a family meal in ${p}, ${n} practises saying "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `While listening to a food-tasting dialogue, ${n} hears the words "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher in ${p} asks the class to explain the meaning of "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} reads a Mandarin menu card and points to "${hanzi} (${pinyin})".`,
];
const MC_CLOSERS = [
  "What does this mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const foodsSpeaking: Skill = {
  id: "g6-ma-ls-foods",
  code: "LS.6",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "Foods and drinks — tastes",
  description: "Common foods and drinks and words for describing taste — oral vocabulary for talking about meals.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "好吃 (hǎochī) describes tasty FOOD; 好喝 (hǎohē) describes a tasty DRINK.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const foods = shuffle(rng, VOCAB.filter((v) => v.tag === "food")).slice(0, 5);
      const tastes = shuffle(rng, VOCAB.filter((v) => v.tag === "taste")).slice(0, 4);
      const items = shuffle(rng, [...foods, ...tastes]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "food", label: "Food or Drink" },
          { id: "taste", label: "Taste Word" },
        ],
        correctBucket,
        hint: "Foods and drinks are things you eat or drink; taste words describe how they taste.",
        explanation: [...foods, ...tastes]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "food" ? "food/drink" : "taste word"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const n = name(rng);
      const p = place(rng);
      const scenario = randChoice(rng, MC_OPENERS)(n, p, correct.hanzi, correct.pinyin);

      return {
        kind: "multiple-choice",
        prompt: `${scenario} ${randChoice(rng, MC_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether this names a food/drink or describes a taste.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "In Mandarin, a taste word can directly follow the food name without needing an extra 'is' word.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Each food name comes right before the taste word that describes it.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
