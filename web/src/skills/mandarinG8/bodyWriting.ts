import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "part" | "symptom" }[] = [
  { hanzi: "头", pinyin: "tóu", meaning: "head", tag: "part" },
  { hanzi: "眼睛", pinyin: "yǎnjing", meaning: "eyes", tag: "part" },
  { hanzi: "手", pinyin: "shǒu", meaning: "hand", tag: "part" },
  { hanzi: "脚", pinyin: "jiǎo", meaning: "foot", tag: "part" },
  { hanzi: "肚子", pinyin: "dùzi", meaning: "stomach / belly", tag: "part" },
  { hanzi: "发烧", pinyin: "fāshāo", meaning: "fever", tag: "symptom" },
  { hanzi: "咳嗽", pinyin: "késou", meaning: "cough", tag: "symptom" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ tóuténg, hái yǒudiǎnr ",
    after: ".",
    answer: "fāshāo",
    gloss: "我头疼，还有点儿发烧。(Wǒ tóuténg, hái yǒudiǎnr fāshāo.) — I have a headache, and also a slight fever.",
  },
  {
    before: "Nǐ qù kàn yīshēng, duō hē ",
    after: ".",
    answer: "shuǐ",
    gloss: "你去看医生，多喝水。(Nǐ qù kàn yīshēng, duō hē shuǐ.) — Go see a doctor, and drink more water.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "肚子", "疼。"], sentence: "我肚子疼。", gloss: "Wǒ dùzi téng. — My stomach hurts." },
  { chunks: ["你", "怎么", "了？"], sentence: "你怎么了？", gloss: "Nǐ zěnme le? — What's wrong with you?" },
];

export const bodyWriting: Skill = {
  id: "g8-ma-w-body",
  code: "W.7",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing about my body and how I feel",
  description: "Guided writing — spelling, word order, and vocabulary for body parts and symptoms.",
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
        hint: "The pattern for aches is Subject + Body Part + 疼 (téng).",
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
        prompt: "Match each body or symptom word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some of these name a body part, and some describe feeling unwell.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const parts = shuffle(rng, VOCAB.filter((v) => v.tag === "part")).slice(0, 4);
      const symptoms = shuffle(rng, VOCAB.filter((v) => v.tag === "symptom"));
      const chosen = shuffle(rng, [...parts, ...symptoms]);
      const correctBucket: Record<string, string> = {};
      for (const v of parts) correctBucket[v.hanzi] = "part";
      for (const v of symptoms) correctBucket[v.hanzi] = "symptom";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Body Part or a Symptom.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "part", label: "Body Part" },
          { id: "symptom", label: "Symptom" },
        ],
        correctBucket,
        hint: "Body parts are things on your body; symptoms describe feeling unwell.",
        explanation: [...parts, ...symptoms].map((v) => `"${v.hanzi}" is a ${correctBucket[v.hanzi] === "part" ? "body part" : "symptom"}.`).join(" "),
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
      hint: "Think about symptoms and health advice you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
