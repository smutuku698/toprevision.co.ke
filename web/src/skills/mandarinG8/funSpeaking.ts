import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "place" | "activity" }[] = [
  { hanzi: "公园", pinyin: "gōngyuán", meaning: "park", tag: "place" },
  { hanzi: "动物园", pinyin: "dòngwùyuán", meaning: "zoo", tag: "place" },
  { hanzi: "电影院", pinyin: "diànyǐngyuàn", meaning: "cinema", tag: "place" },
  { hanzi: "游泳池", pinyin: "yóuyǒngchí", meaning: "swimming pool", tag: "place" },
  { hanzi: "游泳", pinyin: "yóuyǒng", meaning: "to swim", tag: "activity" },
  { hanzi: "骑自行车", pinyin: "qí zìxíngchē", meaning: "to ride a bicycle", tag: "activity" },
  { hanzi: "爬山", pinyin: "páshān", meaning: "to climb a mountain", tag: "activity" },
  { hanzi: "看电影", pinyin: "kàn diànyǐng", meaning: "to watch a movie", tag: "activity" },
  { hanzi: "踢足球", pinyin: "tī zúqiú", meaning: "to play football", tag: "activity" },
  { hanzi: "打篮球", pinyin: "dǎ lánqiú", meaning: "to play basketball", tag: "activity" },
  { hanzi: "听音乐", pinyin: "tīng yīnyuè", meaning: "to listen to music", tag: "activity" },
  { hanzi: "画画", pinyin: "huàhuà", meaning: "to draw / paint", tag: "activity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Zhōumò wǒ dǎsuàn ",
    after: " gōngyuán.",
    answer: "qù",
    gloss: "周末我打算去公园。(Zhōumò wǒ dǎsuàn qù gōngyuán.) — This weekend I plan to go to the park.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["周末", "我打算", "去动物园。"],
    sentence: "周末我打算去动物园。",
    gloss: "Zhōumò wǒ dǎsuàn qù dòngwùyuán. — This weekend I plan to go to the zoo.",
  },
];

export const funSpeaking: Skill = {
  id: "g8-ma-ls-fun",
  code: "LS.5",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Fun activities and making plans",
  description: "Naming fun places and leisure activities, and expressing weekend plans — oral vocabulary and expressions.",
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
        prompt: "Match each Mandarin leisure word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "打算 (dǎsuàn, 'to plan to') comes before the activity you intend to do.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, VOCAB.filter((v) => v.tag === "place")).slice(0, 3);
      const activities = shuffle(rng, VOCAB.filter((v) => v.tag === "activity")).slice(0, 4);
      const items = shuffle(rng, [...places, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Place or an Activity.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "place", label: "Place" },
          { id: "activity", label: "Activity" },
        ],
        correctBucket,
        hint: "Places are where you go; activities are what you do there.",
        explanation: [...places, ...activities].map((v) => `"${v.hanzi} (${v.pinyin})" is ${v.tag === "place" ? "a place" : "an activity"}.`).join(" "),
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
        hint: "Decide whether this word names a place or an activity.",
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
        hint: "This word means 'to go' and comes right before the destination.",
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
      hint: "State the time period first, then the plan, then the place.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
