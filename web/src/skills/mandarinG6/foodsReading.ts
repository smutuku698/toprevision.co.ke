import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Reading R.6 "Foods and Drinks" — focus: word recognition, oral presentation
// skills (articulation, projection) when reading food/taste sentences aloud.
// KIQ: "What strategies can you use to read aloud effectively?"

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
  { before: "炖豆", after: "。", answer: "xián", gloss: "炖豆咸。— Stewed beans are salty." },
  { before: "", after: "辣。", answer: "dùn niúròu", gloss: "炖牛肉辣。— Stewed beef is spicy." },
  { before: "红薯", after: "。", answer: "tián", gloss: "红薯甜。— Sweet potato is sweet." },
  { before: "面包", after: "。", answer: "hǎochī", gloss: "面包好吃。— Bread is delicious." },
  { before: "奶茶", after: "。", answer: "hǎohē", gloss: "奶茶好喝。— Milk tea is delicious to drink." },
  { before: "乌加利", after: "。", answer: "xián", gloss: "乌加利咸。— Ugali is salty." },
  { before: "米饭", after: "。", answer: "suān", gloss: "米饭酸。— Rice is sour." },
  { before: "饼", after: "。", answer: "kǔ", gloss: "饼苦。— The pancake is bitter." },
  { before: "蔬菜", after: "。", answer: "kǔ", gloss: "蔬菜苦。— Vegetables are bitter." },
  { before: "鸡蛋", after: "。", answer: "xián", gloss: "鸡蛋咸。— Egg is salty." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["炖豆", "咸", "。"], sentence: "炖豆咸。", gloss: "Dùn dòu xián. — Stewed beans are salty." },
  { chunks: ["炖牛肉", "辣", "。"], sentence: "炖牛肉辣。", gloss: "Dùn niúròu là. — Stewed beef is spicy." },
  { chunks: ["红薯", "甜", "。"], sentence: "红薯甜。", gloss: "Hóngshǔ tián. — Sweet potato is sweet." },
  { chunks: ["面包", "好吃", "。"], sentence: "面包好吃。", gloss: "Miànbāo hǎochī. — Bread is delicious." },
  { chunks: ["奶茶", "好喝", "。"], sentence: "奶茶好喝。", gloss: "Nǎichá hǎohē. — Milk tea is delicious to drink." },
  { chunks: ["乌加利", "咸", "。"], sentence: "乌加利咸。", gloss: "Wūjiālì xián. — Ugali is salty." },
  { chunks: ["米饭", "酸", "。"], sentence: "米饭酸。", gloss: "Mǐfàn suān. — Rice is sour." },
  { chunks: ["饼", "苦", "。"], sentence: "饼苦。", gloss: "Bǐng kǔ. — The pancake is bitter." },
  { chunks: ["蔬菜", "苦", "。"], sentence: "蔬菜苦。", gloss: "Shūcài kǔ. — Vegetables are bitter." },
  { chunks: ["鸡蛋", "咸", "。"], sentence: "鸡蛋咸。", gloss: "Jīdàn xián. — Egg is salty." },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} reads a food word aloud, projecting their voice clearly to the back of the classroom:",
  "Practising articulation, {name} carefully reads out",
  "{name} reads a taste word aloud to the class from a flashcard:",
  "Reading a food menu aloud, {name} pauses on",
  "{name} is practising clear pronunciation and reads",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this sentence aloud and needs to project the missing word clearly.",
  "Help {name} read this food sentence aloud by filling in the missing pinyin word.",
  "{name} reads this sentence about food aloud but one word is missing.",
  "To read this sentence aloud with clear articulation, {name} needs the missing word.",
  "{name} is practising reading a food sentence aloud — type the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this food sentence aloud, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the sentence can be read aloud clearly.",
  "{name} wrote this sentence about food in pieces. Put them in order.",
  "To read this sentence aloud with good articulation, {name} first needs the pieces in order.",
  "{name} is practising reading sentences about food aloud — arrange the pieces into order.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a food menu aloud, sorting words by type as they read.",
  "Help {name} sort these words while reading through a food list.",
  "{name} is practising comprehension by sorting foods and tastes.",
  "As {name} reads each word aloud, sort it into the correct group.",
  "{name} is organizing a food-and-taste reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each item into its correct group.",
  "Read each item and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the items below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading food words aloud and matching each to its meaning.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practising reading these words and connecting them to their meanings.",
  "As {name} reads each food word aloud, match it to what it means.",
  "{name} is reviewing food vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word or phrase to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], learnerName: string): string {
  return randChoice(rng, pool).replace("{name}", learnerName);
}

export const foodsReading: Skill = {
  id: "g6-ma-r-foods",
  code: "R.6",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: foods and drinks aloud",
  description: "Word recognition and oral presentation skills (articulation, projection) reading food and taste vocabulary aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "order", "categorize", "match"] as const);
    const learnerName = randChoice(rng, LEARNERS);

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const prompt = `${withName(rng, MC_OPENERS, learnerName)} "${correct.hanzi} (${correct.pinyin})". ${randChoice(rng, MC_CLOSERS)}`;

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "好吃 describes food; 好喝 describes drinks — read each carefully before choosing.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      const prompt = `${withName(rng, FILL_OPENERS, learnerName)} ${randChoice(rng, FILL_CLOSERS)}`;

      return {
        kind: "fill-blank",
        prompt,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This sentence follows the pattern [food] [taste]。",
        explanation: item.gloss,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);
      const prompt = `${withName(rng, ORDER_OPENERS, learnerName)} ${randChoice(rng, ORDER_CLOSERS)}`;

      return {
        kind: "ordering",
        prompt,
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Name the food first, then the taste word, then end with 。",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const buckets: { id: Tag; label: string }[] = [
        { id: "food", label: "Food or Drink" },
        { id: "taste", label: "Taste Word" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of chosen) correctBucket[v.hanzi] = v.tag;
      const prompt = `${withName(rng, CATEGORIZE_OPENERS, learnerName)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`;

      return {
        kind: "categorize",
        prompt,
        items: shuffle(rng, chosen).map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets,
        correctBucket,
        hint: "A food/drink names something you eat or drink; a taste word describes how it is.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${buckets.find((b) => b.id === v.tag)!.label.toLowerCase()}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, VOCAB).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.hanzi] = v.hanzi;
    const prompt = `${withName(rng, MATCH_OPENERS, learnerName)} ${randChoice(rng, MATCH_CLOSERS)}`;

    return {
      kind: "click-match",
      prompt,
      tokens,
      targets,
      correctMap,
      hint: "Read each word aloud, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
