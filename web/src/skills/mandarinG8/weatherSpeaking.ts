import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "weather" | "environment" }[] = [
  { hanzi: "晴天", pinyin: "qíngtiān", meaning: "sunny day", tag: "weather" },
  { hanzi: "阴天", pinyin: "yīntiān", meaning: "cloudy day", tag: "weather" },
  { hanzi: "下雨", pinyin: "xiàyǔ", meaning: "to rain", tag: "weather" },
  { hanzi: "下雪", pinyin: "xiàxuě", meaning: "to snow", tag: "weather" },
  { hanzi: "刮风", pinyin: "guāfēng", meaning: "windy", tag: "weather" },
  { hanzi: "热", pinyin: "rè", meaning: "hot", tag: "weather" },
  { hanzi: "冷", pinyin: "lěng", meaning: "cold", tag: "weather" },
  { hanzi: "环境", pinyin: "huánjìng", meaning: "environment", tag: "environment" },
  { hanzi: "保护", pinyin: "bǎohù", meaning: "to protect", tag: "environment" },
  { hanzi: "垃圾", pinyin: "lājī", meaning: "rubbish / trash", tag: "environment" },
  { hanzi: "污染", pinyin: "wūrǎn", meaning: "pollution", tag: "environment" },
  { hanzi: "种树", pinyin: "zhòngshù", meaning: "to plant trees", tag: "environment" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Jīntiān ",
    after: ", suǒyǐ wǒ dài le yǔsǎn.",
    answer: "xiàyǔ",
    gloss: "今天下雨，所以我带了雨伞。(Jīntiān xiàyǔ, suǒyǐ wǒ dài le yǔsǎn.) — Today it is raining, so I brought an umbrella.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["我们", "应该", "保护环境。"],
    sentence: "我们应该保护环境。",
    gloss: "Wǒmen yīnggāi bǎohù huánjìng. — We should protect the environment.",
  },
];

export const weatherSpeaking: Skill = {
  id: "g8-ma-ls-weather",
  code: "LS.8",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Weather and environment",
  description: "Describing the weather and talking about protecting the environment — oral vocabulary and expressions.",
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
        prompt: "Match each Mandarin weather or environment word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "下 (xià) means 'to fall' — 下雨 is rain falling, 下雪 is snow falling.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const weather = shuffle(rng, VOCAB.filter((v) => v.tag === "weather")).slice(0, 4);
      const environment = shuffle(rng, VOCAB.filter((v) => v.tag === "environment")).slice(0, 3);
      const items = shuffle(rng, [...weather, ...environment]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as Weather or Environmental Care.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "weather", label: "Weather" },
          { id: "environment", label: "Environmental Care" },
        ],
        correctBucket,
        hint: "Weather describes the sky and temperature; environmental care words describe protecting nature.",
        explanation: [...weather, ...environment].map((v) => `"${v.hanzi} (${v.pinyin})" is ${v.tag === "weather" ? "weather" : "environmental care"}.`).join(" "),
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
        hint: "Decide whether this word describes the sky/temperature or caring for nature.",
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
        hint: "This word describes water falling from the sky.",
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
      hint: "应该 (yīnggāi, 'should') comes right before the verb it describes.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
