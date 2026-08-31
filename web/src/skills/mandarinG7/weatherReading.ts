import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "今天是晴天，很热。",
  "(Jīntiān shì qíngtiān, hěn rè.)",
  "夏天，我穿短裤和T恤。",
  "(Xiàtiān, wǒ chuān duǎnkù hé T-xù.)",
  "冬天很冷，我穿大衣和手套。",
  "(Dōngtiān hěn lěng, wǒ chuān dàyī hé shǒutào.)",
  "雨季常常下雨，我需要雨衣。",
  "(Yǔjì chángcháng xiàyǔ, wǒ xūyào yǔyī.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "今天天气怎么样？(What's the weather like today?)",
    correct: "晴天，很热 (sunny and hot)",
    distractors: ["雨天，很冷 (rainy and cold)", "阴天，很凉 (cloudy and cool)", "风天，很暖 (windy and warm)"],
    explanation: "文中说 \"今天是晴天，很热\" — The text says today is sunny and hot.",
  },
  {
    q: "夏天穿什么？(What do you wear in summer?)",
    correct: "短裤和T恤 (shorts and a T-shirt)",
    distractors: ["大衣和手套 (a coat and gloves)", "毛衣和围巾 (a sweater and a scarf)", "雨衣和靴子 (a raincoat and boots)"],
    explanation: "文中说 \"夏天，我穿短裤和T恤\" — The text says in summer, the narrator wears shorts and a T-shirt.",
  },
  {
    q: "雨季常常怎么样？(What often happens in the rainy season?)",
    correct: "下雨 (it rains)",
    distractors: ["刮风 (it's windy)", "下雪 (it snows)", "很热 (it's very hot)"],
    explanation: "文中说 \"雨季常常下雨\" — The text says it often rains in the rainy season.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "今天很热。(It's hot today.)", isTrue: true },
  { text: "冬天我穿短裤。(I wear shorts in winter.)", isTrue: false },
  { text: "雨季我需要雨衣。(I need a raincoat in the rainy season.)", isTrue: true },
  { text: "夏天很冷。(Summer is cold.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "常常", meaning: "often" },
  { phrase: "需要", meaning: "need" },
  { phrase: "下雨", meaning: "to rain" },
  { phrase: "穿", meaning: "to wear" },
  { phrase: "热", meaning: "hot" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Yǔjì chángcháng xiàyǔ, wǒ xūyào ",
    after: "。",
    answer: "yǔyī",
    gloss: "雨季常常下雨，我需要雨衣。(Yǔjì chángcháng xiàyǔ, wǒ xūyào yǔyī.) — It often rains in the rainy season, I need a raincoat.",
  },
];

export const weatherReading: Skill = {
  id: "g7-ma-r-weather",
  code: "R.8",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: weather, seasons, and clothing",
  description: "Read a short Mandarin passage about weather across the seasons and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering", "fill-blank"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Match each season to the clothing and temperature the passage actually gives it.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each phrase from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the passage above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.filter((_, i) => i % 2 === 0).map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the passage in the order they appear.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The passage moves from today's weather, to summer, to winter, to the rainy season.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing pinyin word from this line of the passage (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This is the clothing item you need when it rains often.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Match each season or day in the passage to its specific weather and clothing.",
      explanation: q.explanation,
    };
  },
};
