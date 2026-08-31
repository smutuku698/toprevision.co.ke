import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.6 "Foods" — focus: writing mechanics (punctuation) for
// food-preference descriptions. KIQ: "How can we write an effective description?"

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "food" | "taste" | "feeling" }[] = [
  { hanzi: "红薯", pinyin: "hóngshǔ", meaning: "sweet potato", tag: "food" },
  { hanzi: "面包", pinyin: "miànbāo", meaning: "bread", tag: "food" },
  { hanzi: "鸡蛋", pinyin: "jīdàn", meaning: "egg", tag: "food" },
  { hanzi: "奶茶", pinyin: "nǎichá", meaning: "milk tea", tag: "food" },
  { hanzi: "乌加利", pinyin: "wūjiālì", meaning: "ugali", tag: "food" },
  { hanzi: "米饭", pinyin: "mǐfàn", meaning: "rice", tag: "food" },
  { hanzi: "饼", pinyin: "bǐng", meaning: "pancake / flatbread", tag: "food" },
  { hanzi: "蔬菜", pinyin: "shūcài", meaning: "vegetables", tag: "food" },
  { hanzi: "咸", pinyin: "xián", meaning: "salty", tag: "taste" },
  { hanzi: "甜", pinyin: "tián", meaning: "sweet", tag: "taste" },
  { hanzi: "辣", pinyin: "là", meaning: "spicy", tag: "taste" },
  { hanzi: "苦", pinyin: "kǔ", meaning: "bitter", tag: "taste" },
  { hanzi: "酸", pinyin: "suān", meaning: "sour", tag: "taste" },
  { hanzi: "好吃", pinyin: "hǎochī", meaning: "delicious (food)", tag: "feeling" },
  { hanzi: "好喝", pinyin: "hǎohē", meaning: "delicious (drink)", tag: "feeling" },
  { hanzi: "喜欢", pinyin: "xǐhuān", meaning: "like", tag: "feeling" },
  { hanzi: "不喜欢", pinyin: "bù xǐhuān", meaning: "don't like", tag: "feeling" },
  { hanzi: "爱", pinyin: "ài", meaning: "love", tag: "feeling" },
];

// "[food] [taste]。" — the food word or the taste word is blanked in turn; two extra items use
// 我 (wǒ, "I"), already taught in the Greetings theme, plus a feeling word.
const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Hóngshǔ ", after: "。", answer: "tián", gloss: "红薯甜。— Sweet potato is sweet." },
  { before: "", after: " tián。", answer: "miànbāo", gloss: "面包甜。— Bread is sweet." },
  { before: "Jīdàn ", after: "。", answer: "xián", gloss: "鸡蛋咸。— Egg is salty." },
  { before: "", after: " tián。", answer: "nǎichá", gloss: "奶茶甜。— Milk tea is sweet." },
  { before: "Wūjiālì ", after: "。", answer: "xián", gloss: "乌加利咸。— Ugali is salty." },
  { before: "", after: " suān。", answer: "mǐfàn", gloss: "米饭酸。— Rice is sour." },
  { before: "Bǐng ", after: "。", answer: "là", gloss: "饼辣。— The pancake is spicy." },
  { before: "", after: " kǔ。", answer: "shūcài", gloss: "蔬菜苦。— Vegetables are bitter." },
  { before: "Wǒ ", after: " mǐfàn。", answer: "xǐhuān", gloss: "我喜欢米饭。— I like rice." },
  { before: "Wǒ ", after: " nǎichá。", answer: "ài", gloss: "我爱奶茶。— I love milk tea." },
];

// "[food] [taste]。" as ordering chunks, plus two feeling sentences.
const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["红薯", "甜", "。"], sentence: "红薯甜。", gloss: "Hóngshǔ tián. — Sweet potato is sweet." },
  { chunks: ["面包", "甜", "。"], sentence: "面包甜。", gloss: "Miànbāo tián. — Bread is sweet." },
  { chunks: ["鸡蛋", "咸", "。"], sentence: "鸡蛋咸。", gloss: "Jīdàn xián. — Egg is salty." },
  { chunks: ["奶茶", "甜", "。"], sentence: "奶茶甜。", gloss: "Nǎichá tián. — Milk tea is sweet." },
  { chunks: ["乌加利", "咸", "。"], sentence: "乌加利咸。", gloss: "Wūjiālì xián. — Ugali is salty." },
  { chunks: ["米饭", "酸", "。"], sentence: "米饭酸。", gloss: "Mǐfàn suān. — Rice is sour." },
  { chunks: ["饼", "辣", "。"], sentence: "饼辣。", gloss: "Bǐng là. — The pancake is spicy." },
  { chunks: ["蔬菜", "苦", "。"], sentence: "蔬菜苦。", gloss: "Shūcài kǔ. — Vegetables are bitter." },
  { chunks: ["我", "喜欢", "米饭", "。"], sentence: "我喜欢米饭。", gloss: "Wǒ xǐhuān mǐfàn. — I like rice." },
  { chunks: ["我", "爱", "奶茶", "。"], sentence: "我爱奶茶。", gloss: "Wǒ ài nǎichá. — I love milk tea." },
];

// Punctuation drill (this theme's explicit writing-mechanics focus): three real punctuation
// roles in a food description — 。 ends a simple statement, 、 separates listed nouns, and ，
// separates two related clauses. All four candidate marks are shown every time, so a wrong
// pick is always a real, nameable punctuation confusion, never an unrelated random draw.
interface PunctItem {
  before: string;
  after: string;
  correctMark: "。" | "、" | "，";
  role: string;
  gloss: string;
}
const PUNCT_ITEMS: PunctItem[] = [
  { before: "我喜欢米饭", after: "", correctMark: "。", role: "ends a simple statement", gloss: "我喜欢米饭。— I like rice." },
  { before: "我喜欢米饭", after: "鸡蛋。", correctMark: "、", role: "separates two listed foods", gloss: "我喜欢米饭、鸡蛋。— I like rice, egg." },
  { before: "米饭好吃", after: "我喜欢。", correctMark: "，", role: "joins two related clauses", gloss: "米饭好吃，我喜欢。— Rice is delicious, I like it." },
  { before: "面包好吃", after: "", correctMark: "。", role: "ends a simple statement", gloss: "面包好吃。— Bread is delicious." },
  { before: "我喜欢面包", after: "奶茶。", correctMark: "、", role: "separates two listed foods", gloss: "我喜欢面包、奶茶。— I like bread, milk tea." },
  { before: "奶茶好喝", after: "我爱。", correctMark: "，", role: "joins two related clauses", gloss: "奶茶好喝，我爱。— Milk tea is delicious, I love it." },
  { before: "乌加利咸", after: "", correctMark: "。", role: "ends a simple statement", gloss: "乌加利咸。— Ugali is salty." },
  { before: "我喜欢红薯", after: "蔬菜。", correctMark: "、", role: "separates two listed foods", gloss: "我喜欢红薯、蔬菜。— I like sweet potato, vegetables." },
  { before: "饼甜", after: "我不喜欢。", correctMark: "，", role: "joins two related clauses", gloss: "饼甜，我不喜欢。— The pancake is sweet, I don't like it." },
  { before: "蔬菜苦", after: "", correctMark: "。", role: "ends a simple statement", gloss: "蔬菜苦。— Vegetables are bitter." },
];
const ALL_MARKS: ("。" | "、" | "，" | "？")[] = ["。", "、", "，", "？"];

const MATCH_OPENERS = [
  "Match each food, taste, or feeling word to its correct English meaning",
  "Pair every written word below with the meaning it stands for",
  "Connect each food or taste word to the English meaning it matches",
  "Work out what each food-related word means, then match it",
  "Line up each written word below with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your food description stays accurate.",
  "before using it in a written sentence.",
  "to make sure your spelling reflects the right meaning.",
  "so a reader knows exactly what you mean.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a Food, a Taste, or a Feeling Word",
  "Group these written words under Food, Taste, or Feeling Word",
  "Decide whether each item is a Food, a Taste, or a Feeling Word, then sort it",
  "Classify each expression as a Food, a Taste, or a Feeling Word",
  "Organize these words into Food, Taste, or Feeling Word groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a clear food description.",
  "so your written sentence stays organized.",
  "before writing about your favourite foods.",
  "to check your spelling matches the right category.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const PUNCT_OPENERS = [
  "Which punctuation mark correctly completes this food description",
  "A learner is writing about food and needs the right punctuation mark here",
  "Which mark belongs in the blank to write this sentence correctly",
  "To keep this description accurate, which punctuation mark fits here",
  "Choosing the right mark matters for clarity — which one fits here",
];
const PUNCT_CLOSERS = ['?', ", exactly?", " in this sentence?", " so the description reads correctly?"];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence",
  "Type the missing pinyin word that completes this sentence correctly",
  "Complete the sentence by filling in the missing pinyin word",
  "Write the correct pinyin word in the blank to finish the sentence",
  "Supply the missing pinyin word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional).",
  "to keep your description accurate.",
  "so the sentence is spelled correctly.",
  "before checking your written work.",
];
const FILL_PROMPTS = composePrompts(FILL_OPENERS, FILL_CLOSERS);

const ORDER_OPENERS = [
  "Arrange the hanzi pieces to form a correctly written sentence",
  "Put these hanzi words in the right order to build a clear sentence",
  "Sequence the hanzi chunks so the written sentence makes sense",
  "Reorder these pieces to write a grammatically correct sentence",
  "Work out the correct word order, then arrange the hanzi pieces",
];
const ORDER_CLOSERS = [
  "for a clear food description.",
  "so a reader can follow it clearly.",
  "before writing it into your paragraph.",
  "to keep the sentence coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const foodsWriting: Skill = {
  id: "g6-ma-w-foods",
  code: "W.6",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing food-preference descriptions",
  description: "Writing mechanics — correct punctuation — plus vocabulary for describing food preferences and tastes.",
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
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "好吃 describes food; 好喝 describes drinks — they are not interchangeable.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const foods = shuffle(rng, VOCAB.filter((v) => v.tag === "food")).slice(0, 4);
      const tastes = shuffle(rng, VOCAB.filter((v) => v.tag === "taste")).slice(0, 3);
      const feelings = shuffle(rng, VOCAB.filter((v) => v.tag === "feeling")).slice(0, 2);
      const items = shuffle(rng, [...foods, ...tastes, ...feelings]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "food", label: "Food" },
          { id: "taste", label: "Taste" },
          { id: "feeling", label: "Feeling Word" },
        ],
        correctBucket,
        hint: "Foods name a dish; tastes describe how it is; feeling words say how you feel about it.",
        explanation: items.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const item = randChoice(rng, PUNCT_ITEMS);
      const choices = shuffle(rng, Array.from(new Set(ALL_MARKS)));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, PUNCT_OPENERS)}: "${item.before}___${item.after}"${randChoice(rng, PUNCT_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(item.correctMark),
        layout: "row",
        hint: `Think about what this mark ${item.role}.`,
        explanation: `The correct mark is "${item.correctMark}", which ${item.role}. The full sentence is: "${item.before}${item.correctMark}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This sentence follows the pattern [food] [taste]。",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Name the food (or say 我 first), then the taste or feeling word, then end with 。",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
