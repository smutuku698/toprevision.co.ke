import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "transport" | "direction" }[] = [
  { hanzi: "公共汽车", pinyin: "gōnggòng qìchē", meaning: "bus", tag: "transport" },
  { hanzi: "出租车", pinyin: "chūzūchē", meaning: "taxi", tag: "transport" },
  { hanzi: "火车", pinyin: "huǒchē", meaning: "train", tag: "transport" },
  { hanzi: "左", pinyin: "zuǒ", meaning: "left", tag: "direction" },
  { hanzi: "右", pinyin: "yòu", meaning: "right", tag: "direction" },
  { hanzi: "一直走", pinyin: "yìzhí zǒu", meaning: "go straight", tag: "direction" },
  { hanzi: "远", pinyin: "yuǎn", meaning: "far", tag: "direction" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Yìzhí zǒu, ránhòu wǎng yòu ",
    after: ".",
    answer: "guǎi",
    gloss: "一直走，然后往右拐。(Yìzhí zǒu, ránhòu wǎng yòu guǎi.) — Go straight, then turn right.",
  },
  {
    before: "Chēzhàn lí zhèr bù ",
    after: ".",
    answer: "yuǎn",
    gloss: "车站离这儿不远。(Chēzhàn lí zhèr bù yuǎn.) — The station is not far from here.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["请问，", "车站", "在哪儿？"], sentence: "请问，车站在哪儿？", gloss: "Qǐngwèn, chēzhàn zài nǎr? — Excuse me, where is the station?" },
  { chunks: ["车站", "离这儿", "不远。"], sentence: "车站离这儿不远。", gloss: "Chēzhàn lí zhèr bù yuǎn. — The station is not far from here." },
];

export const gettingAroundWriting: Skill = {
  id: "g8-ma-w-getting-around",
  code: "W.9",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing about getting around",
  description: "Guided writing — spelling, word order, and vocabulary for transport and directions.",
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
        hint: "Polite questions often start with 请问 (qǐngwèn, 'excuse me').",
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
        prompt: "Match each transport or direction word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some of these name a vehicle; others tell you which way to go.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const transport = shuffle(rng, VOCAB.filter((v) => v.tag === "transport"));
      const direction = shuffle(rng, VOCAB.filter((v) => v.tag === "direction")).slice(0, 3);
      const chosen = shuffle(rng, [...transport, ...direction]);
      const correctBucket: Record<string, string> = {};
      for (const v of transport) correctBucket[v.hanzi] = "transport";
      for (const v of direction) correctBucket[v.hanzi] = "direction";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Mode of Transport or a Direction word.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "transport", label: "Mode of Transport" },
          { id: "direction", label: "Direction" },
        ],
        correctBucket,
        hint: "Transport words name a vehicle; direction words tell you which way to go.",
        explanation: [...transport, ...direction].map((v) => `"${v.hanzi}" is ${correctBucket[v.hanzi] === "transport" ? "a mode of transport" : "a direction word"}.`).join(" "),
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
      hint: "Think about direction words and distance expressions.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
