import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "part" | "symptom" }[] = [
  { hanzi: "头", pinyin: "tóu", meaning: "head", tag: "part" },
  { hanzi: "眼睛", pinyin: "yǎnjing", meaning: "eyes", tag: "part" },
  { hanzi: "耳朵", pinyin: "ěrduo", meaning: "ears", tag: "part" },
  { hanzi: "鼻子", pinyin: "bízi", meaning: "nose", tag: "part" },
  { hanzi: "嘴", pinyin: "zuǐ", meaning: "mouth", tag: "part" },
  { hanzi: "手", pinyin: "shǒu", meaning: "hand", tag: "part" },
  { hanzi: "脚", pinyin: "jiǎo", meaning: "foot", tag: "part" },
  { hanzi: "肚子", pinyin: "dùzi", meaning: "stomach / belly", tag: "part" },
  { hanzi: "头疼", pinyin: "tóuténg", meaning: "headache", tag: "symptom" },
  { hanzi: "发烧", pinyin: "fāshāo", meaning: "fever", tag: "symptom" },
  { hanzi: "咳嗽", pinyin: "késou", meaning: "cough", tag: "symptom" },
  { hanzi: "胃疼", pinyin: "wèiténg", meaning: "stomachache", tag: "symptom" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ ",
    after: " téng.",
    answer: "tóu",
    gloss: "我头疼。(Wǒ tóu téng.) — My head hurts / I have a headache.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["我", "肚子", "疼。"],
    sentence: "我肚子疼。",
    gloss: "Wǒ dùzi téng. — My stomach hurts.",
  },
];

export const bodySpeaking: Skill = {
  id: "g8-ma-ls-body",
  code: "LS.7",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "My body and how I feel",
  description: "Naming body parts and common symptoms, and describing how you feel — oral vocabulary and expressions.",
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
        prompt: "Match each Mandarin body or symptom word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "疼 (téng) means 'ache/pain' — it attaches to a body part to describe where it hurts.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const parts = shuffle(rng, VOCAB.filter((v) => v.tag === "part")).slice(0, 4);
      const symptoms = shuffle(rng, VOCAB.filter((v) => v.tag === "symptom")).slice(0, 3);
      const items = shuffle(rng, [...parts, ...symptoms]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Body Part or a Symptom.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "part", label: "Body Part" },
          { id: "symptom", label: "Symptom" },
        ],
        correctBucket,
        hint: "Body parts are things on your body; symptoms describe how you feel when you are unwell.",
        explanation: [...parts, ...symptoms].map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "part" ? "body part" : "symptom"}.`).join(" "),
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
        hint: "Decide whether this word names a body part or a symptom.",
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
        hint: "This body part word goes right before 疼 (téng, 'ache').",
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
      hint: "The pattern is Subject + Body Part + 疼 (téng).",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
