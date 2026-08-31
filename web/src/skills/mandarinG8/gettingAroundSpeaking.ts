import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "transport" | "direction" }[] = [
  { hanzi: "公共汽车", pinyin: "gōnggòng qìchē", meaning: "bus", tag: "transport" },
  { hanzi: "出租车", pinyin: "chūzūchē", meaning: "taxi", tag: "transport" },
  { hanzi: "火车", pinyin: "huǒchē", meaning: "train", tag: "transport" },
  { hanzi: "飞机", pinyin: "fēijī", meaning: "airplane", tag: "transport" },
  { hanzi: "自行车", pinyin: "zìxíngchē", meaning: "bicycle", tag: "transport" },
  { hanzi: "左", pinyin: "zuǒ", meaning: "left", tag: "direction" },
  { hanzi: "右", pinyin: "yòu", meaning: "right", tag: "direction" },
  { hanzi: "一直走", pinyin: "yìzhí zǒu", meaning: "go straight", tag: "direction" },
  { hanzi: "拐弯", pinyin: "guǎiwān", meaning: "to turn", tag: "direction" },
  { hanzi: "远", pinyin: "yuǎn", meaning: "far", tag: "direction" },
  { hanzi: "近", pinyin: "jìn", meaning: "near", tag: "direction" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Qǐng ",
    after: " zǒu, ránhòu wǎng zuǒ guǎi.",
    answer: "yìzhí",
    gloss: "请一直走，然后往左拐。(Qǐng yìzhí zǒu, ránhòu wǎng zuǒ guǎi.) — Please go straight, then turn left.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["车站", "离这儿", "不远。"],
    sentence: "车站离这儿不远。",
    gloss: "Chēzhàn lí zhèr bù yuǎn. — The station is not far from here.",
  },
];

export const gettingAroundSpeaking: Skill = {
  id: "g8-ma-ls-getting-around",
  code: "LS.9",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Getting around",
  description: "Naming modes of transport and giving simple directions — oral vocabulary and expressions.",
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
        prompt: "Match each Mandarin transport or direction word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "远 (yuǎn, 'far') and 近 (jìn, 'near') are opposites — easy to mix up.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const transport = shuffle(rng, VOCAB.filter((v) => v.tag === "transport")).slice(0, 4);
      const direction = shuffle(rng, VOCAB.filter((v) => v.tag === "direction")).slice(0, 3);
      const items = shuffle(rng, [...transport, ...direction]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Mode of Transport or a Direction word.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "transport", label: "Mode of Transport" },
          { id: "direction", label: "Direction" },
        ],
        correctBucket,
        hint: "Transport words name a vehicle; direction words tell you which way to go.",
        explanation: [...transport, ...direction].map((v) => `"${v.hanzi} (${v.pinyin})" is ${v.tag === "transport" ? "a mode of transport" : "a direction word"}.`).join(" "),
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
        hint: "Decide whether this word names a vehicle or a direction.",
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
        hint: "This word means 'straight' and comes right before 走 (zǒu, 'walk/go').",
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
      hint: "Name the place first, then describe how far it is with 离 (lí, 'from').",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
