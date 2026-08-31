import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "food" | "drink" }[] = [
  { hanzi: "米饭", pinyin: "mǐfàn", meaning: "rice", tag: "food" },
  { hanzi: "面条", pinyin: "miàntiáo", meaning: "noodles", tag: "food" },
  { hanzi: "鸡蛋", pinyin: "jīdàn", meaning: "egg", tag: "food" },
  { hanzi: "水果", pinyin: "shuǐguǒ", meaning: "fruit", tag: "food" },
  { hanzi: "面包", pinyin: "miànbāo", meaning: "bread", tag: "food" },
  { hanzi: "茶", pinyin: "chá", meaning: "tea", tag: "drink" },
  { hanzi: "果汁", pinyin: "guǒzhī", meaning: "juice", tag: "drink" },
  { hanzi: "牛奶", pinyin: "niúnǎi", meaning: "milk", tag: "drink" },
  { hanzi: "水", pinyin: "shuǐ", meaning: "water", tag: "drink" },
  { hanzi: "咖啡", pinyin: "kāfēi", meaning: "coffee", tag: "drink" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ xiǎng ",
    after: " yì bēi guǒzhī.",
    answer: "hē",
    gloss: "我想喝一杯果汁。(Wǒ xiǎng hē yì bēi guǒzhī.) — I would like to drink a glass of juice.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["我想", "吃米饭", "和鸡蛋。"],
    sentence: "我想吃米饭和鸡蛋。",
    gloss: "Wǒ xiǎng chī mǐfàn hé jīdàn. — I would like to eat rice and eggs.",
  },
];

export const foodsSpeaking: Skill = {
  id: "g8-ma-ls-foods",
  code: "LS.6",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Foods and drinks",
  description: "Naming common foods and drinks, and expressing what you would like to eat or drink — oral vocabulary and expressions.",
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
        prompt: "Match each Mandarin food or drink word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "吃 (chī) means 'to eat', 喝 (hē) means 'to drink' — pair them with food or drink words.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const foods = shuffle(rng, VOCAB.filter((v) => v.tag === "food")).slice(0, 4);
      const drinks = shuffle(rng, VOCAB.filter((v) => v.tag === "drink")).slice(0, 3);
      const items = shuffle(rng, [...foods, ...drinks]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Food or a Drink.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "food", label: "Food" },
          { id: "drink", label: "Drink" },
        ],
        correctBucket,
        hint: "Foods are things you eat with 吃; drinks are things you drink with 喝.",
        explanation: [...foods, ...drinks].map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.meaning !== correct.meaning)).slice(0, 3);
      const choices = shuffle(rng, [correct.meaning, ...distractors.map((d) => d.meaning)]);

      return {
        kind: "multiple-choice",
        prompt: `What does "${correct.hanzi} (${correct.pinyin})" mean?`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Decide whether this word names a food or a drink.",
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
        hint: "This verb means 'to drink' and comes right before the drink.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi words to form a correct spoken sentence.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Say what you would like first, then list the foods.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
