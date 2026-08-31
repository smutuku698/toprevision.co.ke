import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "place" | "activity" }[] = [
  { hanzi: "公园", pinyin: "gōngyuán", meaning: "park", tag: "place" },
  { hanzi: "电影院", pinyin: "diànyǐngyuàn", meaning: "cinema", tag: "place" },
  { hanzi: "游泳池", pinyin: "yóuyǒngchí", meaning: "swimming pool", tag: "place" },
  { hanzi: "游泳", pinyin: "yóuyǒng", meaning: "to swim", tag: "activity" },
  { hanzi: "骑自行车", pinyin: "qí zìxíngchē", meaning: "to ride a bicycle", tag: "activity" },
  { hanzi: "看电影", pinyin: "kàn diànyǐng", meaning: "to watch a movie", tag: "activity" },
  { hanzi: "踢足球", pinyin: "tī zúqiú", meaning: "to play football", tag: "activity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ ",
    after: " qí zìxíngchē.",
    answer: "xǐhuan",
    gloss: "我喜欢骑自行车。(Wǒ xǐhuan qí zìxíngchē.) — I like riding a bicycle.",
  },
  {
    before: "Wǒmen yìqǐ qù gōngyuán ",
    after: ".",
    answer: "ba",
    gloss: "我们一起去公园吧。(Wǒmen yìqǐ qù gōngyuán ba.) — Let's go to the park together.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "喜欢", "骑自行车。"], sentence: "我喜欢骑自行车。", gloss: "Wǒ xǐhuan qí zìxíngchē. — I like riding a bicycle." },
  { chunks: ["周末", "我打算", "去电影院。"], sentence: "周末我打算去电影院。", gloss: "Zhōumò wǒ dǎsuàn qù diànyǐngyuàn. — This weekend I plan to go to the cinema." },
];

export const funWriting: Skill = {
  id: "g8-ma-w-fun",
  code: "W.5",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing about fun activities and plans",
  description: "Guided writing — spelling, word order, and vocabulary for leisure places and weekend activities.",
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
        hint: "State who or when first, then the action.",
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
        prompt: "Match each leisure word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some of these are places, and some are activities you do there.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, VOCAB.filter((v) => v.tag === "place"));
      const activities = shuffle(rng, VOCAB.filter((v) => v.tag === "activity")).slice(0, 3);
      const chosen = shuffle(rng, [...places, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const v of places) correctBucket[v.hanzi] = "place";
      for (const v of activities) correctBucket[v.hanzi] = "activity";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Place or an Activity.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "place", label: "Place" },
          { id: "activity", label: "Activity" },
        ],
        correctBucket,
        hint: "Places are where you go; activities are what you do.",
        explanation: [...places, ...activities].map((v) => `"${v.hanzi}" is ${correctBucket[v.hanzi] === "place" ? "a place" : "an activity"}.`).join(" "),
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
      hint: "Think about how to say you like an activity, or suggest doing something together.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
