import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; group: "errand" | "leisure" }[] = [
  { hanzi: "车站", pinyin: "chēzhàn", meaning: "station", group: "errand" },
  { hanzi: "邮局", pinyin: "yóujú", meaning: "post office", group: "errand" },
  { hanzi: "医院", pinyin: "yīyuàn", meaning: "hospital", group: "errand" },
  { hanzi: "银行", pinyin: "yínháng", meaning: "bank", group: "errand" },
  { hanzi: "商场", pinyin: "shāngchǎng", meaning: "shopping mall", group: "leisure" },
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "library", group: "leisure" },
  { hanzi: "公园", pinyin: "gōngyuán", meaning: "park", group: "leisure" },
  { hanzi: "学校", pinyin: "xuéxiào", meaning: "school", group: "leisure" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ xiān jīngguò yóujú, ránhòu jīngguò ",
    after: ".",
    answer: "yínháng",
    gloss: "我先经过邮局，然后经过银行。(Wǒ xiān jīngguò yóujú, ránhòu jīngguò yínháng.) — I pass the post office first, then the bank.",
  },
  {
    before: "Gōngyuán pángbiān yǒu yì tiáo ",
    after: ".",
    answer: "hé",
    gloss: "公园旁边有一条河。(Gōngyuán pángbiān yǒu yì tiáo hé.) — There is a river next to the park.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["我", "先经过邮局，", "然后经过银行。"],
    sentence: "我先经过邮局，然后经过银行。",
    gloss: "Wǒ xiān jīngguò yóujú, ránhòu jīngguò yínháng. — I pass the post office first, then the bank.",
  },
  {
    chunks: ["图书馆", "在", "学校旁边。"],
    sentence: "图书馆在学校旁边。",
    gloss: "Túshūguǎn zài xuéxiào pángbiān. — The library is next to the school.",
  },
];

export const surroundingsWriting: Skill = {
  id: "g8-ma-w-surroundings",
  code: "W.3",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing about places in my surroundings",
  description: "Guided writing — spelling, word order, and vocabulary for places around town.",
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
        hint: "Describe the location or order of places step by step.",
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
        prompt: "Match each place name to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each place name out loud, paying attention to the tone on each syllable.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const errand = shuffle(rng, VOCAB.filter((v) => v.group === "errand")).slice(0, 3);
      const leisure = shuffle(rng, VOCAB.filter((v) => v.group === "leisure")).slice(0, 3);
      const chosen = shuffle(rng, [...errand, ...leisure]);
      const correctBucket: Record<string, string> = {};
      for (const v of errand) correctBucket[v.hanzi] = "errand";
      for (const v of leisure) correctBucket[v.hanzi] = "leisure";

      return {
        kind: "categorize",
        prompt: "Sort each place as somewhere for Everyday Errands or Leisure & Learning.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "errand", label: "Everyday Errands" },
          { id: "leisure", label: "Leisure & Learning" },
        ],
        correctBucket,
        hint: "Think about whether you go there to get something done, or to relax and learn.",
        explanation: [...errand, ...leisure].map((v) => `"${v.hanzi}" is a place for ${correctBucket[v.hanzi] === "errand" ? "everyday errands" : "leisure & learning"}.`).join(" "),
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
      hint: "Think about the place words you've learned around town.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
