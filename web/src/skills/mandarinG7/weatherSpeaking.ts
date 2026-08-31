import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "weather-season" | "clothing" }[] = [
  { hanzi: "晴天", pinyin: "qíngtiān", meaning: "sunny day", tag: "weather-season" },
  { hanzi: "雨天", pinyin: "yǔtiān", meaning: "rainy day", tag: "weather-season" },
  { hanzi: "风天", pinyin: "fēngtiān", meaning: "windy day", tag: "weather-season" },
  { hanzi: "阴天", pinyin: "yīntiān", meaning: "cloudy day", tag: "weather-season" },
  { hanzi: "春天", pinyin: "chūntiān", meaning: "spring", tag: "weather-season" },
  { hanzi: "夏天", pinyin: "xiàtiān", meaning: "summer", tag: "weather-season" },
  { hanzi: "秋天", pinyin: "qiūtiān", meaning: "autumn", tag: "weather-season" },
  { hanzi: "冬天", pinyin: "dōngtiān", meaning: "winter", tag: "weather-season" },
  { hanzi: "旱季", pinyin: "hànjì", meaning: "dry season", tag: "weather-season" },
  { hanzi: "雨季", pinyin: "yǔjì", meaning: "rainy season", tag: "weather-season" },
  { hanzi: "T恤", pinyin: "T-xù", meaning: "T-shirt", tag: "clothing" },
  { hanzi: "短裤", pinyin: "duǎnkù", meaning: "shorts", tag: "clothing" },
  { hanzi: "毛衣", pinyin: "máoyī", meaning: "sweater", tag: "clothing" },
  { hanzi: "外套", pinyin: "wàitào", meaning: "jacket", tag: "clothing" },
  { hanzi: "大衣", pinyin: "dàyī", meaning: "coat", tag: "clothing" },
  { hanzi: "雨衣", pinyin: "yǔyī", meaning: "raincoat", tag: "clothing" },
  { hanzi: "帽子", pinyin: "màozi", meaning: "hat", tag: "clothing" },
  { hanzi: "手套", pinyin: "shǒutào", meaning: "gloves", tag: "clothing" },
  { hanzi: "围巾", pinyin: "wéijīn", meaning: "scarf", tag: "clothing" },
  { hanzi: "靴子", pinyin: "xuēzi", meaning: "boots", tag: "clothing" },
  { hanzi: "凉鞋", pinyin: "liángxié", meaning: "sandals", tag: "clothing" },
  { hanzi: "太阳镜", pinyin: "tàiyángjìng", meaning: "sunglasses", tag: "clothing" },
  { hanzi: "游泳衣", pinyin: "yóuyǒngyī", meaning: "swimsuit", tag: "clothing" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Jīntiān shì ",
    after: "，hěn rè.",
    answer: "qíngtiān",
    gloss: "今天是晴天，很热。(Jīntiān shì qíngtiān, hěn rè.) — Today is sunny, it's hot.",
  },
  {
    before: "Dōngtiān hěn lěng, wǒ chuān dàyī hé ",
    after: "。",
    answer: "shǒutào",
    gloss: "冬天很冷，我穿大衣和手套。(Dōngtiān hěn lěng, wǒ chuān dàyī hé shǒutào.) — Winter is cold, I wear a coat and gloves.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["夏天，", "我穿短裤", "和T恤。"],
    sentence: "夏天，我穿短裤和T恤。",
    gloss: "Xiàtiān, wǒ chuān duǎnkù hé T-xù. — In summer, I wear shorts and a T-shirt.",
  },
];

export const weatherSpeaking: Skill = {
  id: "g7-ma-ls-weather",
  code: "LS.8",
  subjectId: "mandarin",
  strandId: "g7-ma-listening-speaking",
  grade: 7,
  title: "Weather, seasons, and clothing",
  description: "Weather patterns, seasons, and matching clothing — oral vocabulary and expressions.",
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
        prompt: "Match each weather, season, or clothing word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words name a weather condition or season; others name an item of clothing.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const weatherSeason = shuffle(rng, VOCAB.filter((v) => v.tag === "weather-season")).slice(0, 4);
      const clothing = shuffle(rng, VOCAB.filter((v) => v.tag === "clothing")).slice(0, 4);
      const items = shuffle(rng, [...weatherSeason, ...clothing]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Weather/Season word or a Clothing Item.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "weather-season", label: "Weather / Season" },
          { id: "clothing", label: "Clothing Item" },
        ],
        correctBucket,
        hint: "A weather/season word describes the sky or time of year; a clothing item is something you wear.",
        explanation: [...weatherSeason, ...clothing]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "weather-season" ? "weather/season word" : "clothing item"}.`)
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
        hint: "Decide whether this describes the weather/season or names something you wear.",
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
        hint: "Match the missing word to the weather or the clothing that fits it.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi phrases to describe seasonal clothing.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "State the season first, then what you wear.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
