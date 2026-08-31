import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "weather" | "environment" }[] = [
  { hanzi: "晴天", pinyin: "qíngtiān", meaning: "sunny day", tag: "weather" },
  { hanzi: "下雨", pinyin: "xiàyǔ", meaning: "to rain", tag: "weather" },
  { hanzi: "刮风", pinyin: "guāfēng", meaning: "windy", tag: "weather" },
  { hanzi: "冷", pinyin: "lěng", meaning: "cold", tag: "weather" },
  { hanzi: "保护", pinyin: "bǎohù", meaning: "to protect", tag: "environment" },
  { hanzi: "垃圾", pinyin: "lājī", meaning: "rubbish / trash", tag: "environment" },
  { hanzi: "种树", pinyin: "zhòngshù", meaning: "to plant trees", tag: "environment" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒmen kěyǐ shǎo yòng sùliàodài, duō ",
    after: ".",
    answer: "zhòngshù",
    gloss: "我们可以少用塑料袋，多种树。(Wǒmen kěyǐ shǎo yòng sùliàodài, duō zhòngshù.) — We can use fewer plastic bags and plant more trees.",
  },
  {
    before: "Jīntiān shì qíngtiān, kěshì ",
    after: ".",
    answer: "guāfēng",
    gloss: "今天是晴天，可是刮风。(Jīntiān shì qíngtiān, kěshì guāfēng.) — Today is sunny, but windy.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我们", "应该", "保护环境。"], sentence: "我们应该保护环境。", gloss: "Wǒmen yīnggāi bǎohù huánjìng. — We should protect the environment." },
  { chunks: ["今天", "天气", "怎么样？"], sentence: "今天天气怎么样？", gloss: "Jīntiān tiānqì zěnmeyàng? — What is the weather like today?" },
];

export const weatherWriting: Skill = {
  id: "g8-ma-w-weather",
  code: "W.8",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing about weather and environment",
  description: "Guided writing — spelling, word order, and vocabulary for weather and protecting the environment.",
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
        hint: "应该 (yīnggāi, 'should') comes right before the verb.",
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
        prompt: "Match each weather or environment word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some of these describe the sky; others describe caring for nature.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const weather = shuffle(rng, VOCAB.filter((v) => v.tag === "weather"));
      const environment = shuffle(rng, VOCAB.filter((v) => v.tag === "environment")).slice(0, 3);
      const chosen = shuffle(rng, [...weather, ...environment]);
      const correctBucket: Record<string, string> = {};
      for (const v of weather) correctBucket[v.hanzi] = "weather";
      for (const v of environment) correctBucket[v.hanzi] = "environment";

      return {
        kind: "categorize",
        prompt: "Sort each word as Weather or Environmental Care.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "weather", label: "Weather" },
          { id: "environment", label: "Environmental Care" },
        ],
        correctBucket,
        hint: "Weather describes the sky and temperature; environmental care describes protecting nature.",
        explanation: [...weather, ...environment].map((v) => `"${v.hanzi}" is ${correctBucket[v.hanzi] === "weather" ? "weather" : "environmental care"}.`).join(" "),
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
      hint: "Think about weather words and ways to protect the environment.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
