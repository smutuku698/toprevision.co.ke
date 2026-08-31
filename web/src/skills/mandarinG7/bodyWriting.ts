import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "size" | "appearance" }[] = [
  { hanzi: "高", pinyin: "gāo", meaning: "tall", tag: "size" },
  { hanzi: "矮", pinyin: "ǎi", meaning: "short (height)", tag: "size" },
  { hanzi: "长", pinyin: "cháng", meaning: "long", tag: "size" },
  { hanzi: "短", pinyin: "duǎn", meaning: "short (length)", tag: "size" },
  { hanzi: "大", pinyin: "dà", meaning: "big", tag: "size" },
  { hanzi: "小", pinyin: "xiǎo", meaning: "small", tag: "size" },
  { hanzi: "黑", pinyin: "hēi", meaning: "dark", tag: "appearance" },
  { hanzi: "胖", pinyin: "pàng", meaning: "fat", tag: "appearance" },
  { hanzi: "瘦", pinyin: "shòu", meaning: "thin", tag: "appearance" },
  { hanzi: "帅", pinyin: "shuài", meaning: "handsome", tag: "appearance" },
  { hanzi: "好看", pinyin: "hǎokàn", meaning: "good-looking", tag: "appearance" },
  { hanzi: "漂亮", pinyin: "piàoliang", meaning: "pretty", tag: "appearance" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Dàwèi hěn ", after: "，yě hěn shuài.", answer: "gāo", gloss: "大卫很高，也很帅。(David is tall, and also handsome.)" },
  { before: "Tā de tóufǎ hěn hēi, bù ", after: "。", answer: "cháng", gloss: "他的头发很黑，不长。(His hair is dark, not long.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["老师很矮，", "但是", "很好看。"], sentence: "老师很矮，但是很好看。", gloss: "The teacher is short, but very good-looking." },
];

export const bodyWriting: Skill = {
  id: "g7-ma-w-body",
  code: "W.7",
  subjectId: "mandarin",
  strandId: "g7-ma-writing",
  grade: 7,
  title: "My body: describing physical attributes",
  description: "Guided writing — using the correct adjective, and 很/不, to describe physical attributes.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "match", "categorize", "mc"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to form a correct description with a contrast.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "State the first attribute, then the contrast word \"但是\" (but), then the second attribute.",
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
        prompt: "Match each descriptive word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe size or length; others describe general appearance.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const size = shuffle(rng, VOCAB.filter((v) => v.tag === "size")).slice(0, 3);
      const appearance = shuffle(rng, VOCAB.filter((v) => v.tag === "appearance")).slice(0, 3);
      const chosen = shuffle(rng, [...size, ...appearance]);
      const correctBucket: Record<string, string> = {};
      for (const v of size) correctBucket[v.hanzi] = "size";
      for (const v of appearance) correctBucket[v.hanzi] = "appearance";

      return {
        kind: "categorize",
        prompt: "Sort each word as describing Size/Length or general Appearance.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "size", label: "Size / Length" },
          { id: "appearance", label: "Appearance" },
        ],
        correctBucket,
        hint: "Size/length words could describe an object's dimension too; appearance words describe how someone looks overall.",
        explanation: [...size, ...appearance].map((v) => `"${v.hanzi}" describes ${correctBucket[v.hanzi] === "size" ? "size or length" : "appearance"}.`).join(" "),
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
        hint: "Match the meaning to the exact word, not just a similar-looking attribute.",
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
      hint: "很 (hěn) means \"very\" before a positive description; 不 (bù) negates the description.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
