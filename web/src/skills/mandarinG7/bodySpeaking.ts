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
  {
    before: "Dàwèi hěn ",
    after: "，yě hěn shuài.",
    answer: "gāo",
    gloss: "大卫很高，也很帅。(Dàwèi hěn gāo, yě hěn shuài.) — David is tall, and also handsome.",
  },
  {
    before: "Tā de tóufǎ hěn hēi, bù ",
    after: "。",
    answer: "cháng",
    gloss: "他的头发很黑，不长。(Tā de tóufǎ hěn hēi, bù cháng.) — His hair is dark, not long.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["老师很矮，", "但是", "很好看。"],
    sentence: "老师很矮，但是很好看。",
    gloss: "Lǎoshī hěn ǎi, dànshì hěn hǎokàn. — The teacher is short, but very good-looking.",
  },
];

export const bodySpeaking: Skill = {
  id: "g7-ma-ls-body",
  code: "LS.7",
  subjectId: "mandarin",
  strandId: "g7-ma-listening-speaking",
  grade: 7,
  title: "My body: describing physical attributes",
  description: "Descriptive words for physical attributes, using 很 (very) and 不 (not) — oral vocabulary and expressions.",
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
        prompt: "Match each descriptive word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe size or length; others describe general appearance.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const size = shuffle(rng, VOCAB.filter((v) => v.tag === "size")).slice(0, 4);
      const appearance = shuffle(rng, VOCAB.filter((v) => v.tag === "appearance")).slice(0, 4);
      const items = shuffle(rng, [...size, ...appearance]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as describing Size/Length or general Appearance.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "size", label: "Size / Length" },
          { id: "appearance", label: "Appearance" },
        ],
        correctBucket,
        hint: "Size/length words could describe an object's dimension too; appearance words are about how someone looks overall.",
        explanation: [...size, ...appearance]
          .map((v) => `"${v.hanzi} (${v.pinyin})" describes ${v.tag === "size" ? "size or length" : "appearance"}.`)
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
        hint: "Decide whether this word describes a size, a length, or a general look.",
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
        hint: "很 (hěn) means \"very\" before a positive description; 不 (bù) negates the description.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

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
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
