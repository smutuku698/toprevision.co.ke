import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.8 "Weather and Environment" — focus: vocabulary development and
// simple written descriptions of weather conditions. KIQ: "How can we clearly communicate
// through written communication?"

type Tag = "adjective" | "noun" | "term";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "热", pinyin: "rè", meaning: "hot", tag: "adjective" },
  { hanzi: "冷", pinyin: "lěng", meaning: "cold", tag: "adjective" },
  { hanzi: "暖", pinyin: "nuǎn", meaning: "warm", tag: "adjective" },
  { hanzi: "凉", pinyin: "liáng", meaning: "cool", tag: "adjective" },
  { hanzi: "晴天", pinyin: "qíngtiān", meaning: "sunny day", tag: "noun" },
  { hanzi: "雨天", pinyin: "yǔtiān", meaning: "rainy day", tag: "noun" },
  { hanzi: "风天", pinyin: "fēngtiān", meaning: "windy day", tag: "noun" },
  { hanzi: "阴天", pinyin: "yīntiān", meaning: "overcast day", tag: "noun" },
  { hanzi: "天气", pinyin: "tiānqì", meaning: "weather", tag: "term" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "天气", after: "。", answer: "rè", gloss: "天气热。— The weather is hot." },
  { before: "天气", after: "。", answer: "lěng", gloss: "天气冷。— The weather is cold." },
  { before: "天气", after: "。", answer: "nuǎn", gloss: "天气暖。— The weather is warm." },
  { before: "天气", after: "。", answer: "liáng", gloss: "天气凉。— The weather is cool." },
  { before: "", after: " — a sunny day", answer: "qíngtiān", gloss: "晴天 — a sunny day." },
  { before: "", after: " — a rainy day", answer: "yǔtiān", gloss: "雨天 — a rainy day." },
  { before: "", after: " — a windy day", answer: "fēngtiān", gloss: "风天 — a windy day." },
  { before: "", after: " — an overcast day", answer: "yīntiān", gloss: "阴天 — an overcast day." },
  { before: "", after: " (yǔtiān, a rainy day)", answer: "雨天", gloss: "雨天 (yǔtiān) — a rainy day. Write the hanzi." },
  { before: "", after: " (fēngtiān, a windy day)", answer: "风天", gloss: "风天 (fēngtiān) — a windy day. Write the hanzi." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["晴天", "，", "天气", "热", "。"], sentence: "晴天，天气热。", gloss: "Qíngtiān, tiānqì rè. — On a sunny day, the weather is hot." },
  { chunks: ["雨天", "，", "天气", "凉", "。"], sentence: "雨天，天气凉。", gloss: "Yǔtiān, tiānqì liáng. — On a rainy day, the weather is cool." },
  { chunks: ["风天", "，", "天气", "冷", "。"], sentence: "风天，天气冷。", gloss: "Fēngtiān, tiānqì lěng. — On a windy day, the weather is cold." },
  { chunks: ["阴天", "，", "天气", "暖", "。"], sentence: "阴天，天气暖。", gloss: "Yīntiān, tiānqì nuǎn. — On an overcast day, the weather is warm." },
  { chunks: ["晴天", "，", "天气", "暖", "。"], sentence: "晴天，天气暖。", gloss: "Qíngtiān, tiānqì nuǎn. — On a sunny day, the weather is warm." },
  { chunks: ["雨天", "，", "天气", "冷", "。"], sentence: "雨天，天气冷。", gloss: "Yǔtiān, tiānqì lěng. — On a rainy day, the weather is cold." },
  { chunks: ["风天", "，", "天气", "凉", "。"], sentence: "风天，天气凉。", gloss: "Fēngtiān, tiānqì liáng. — On a windy day, the weather is cool." },
  { chunks: ["阴天", "，", "天气", "热", "。"], sentence: "阴天，天气热。", gloss: "Yīntiān, tiānqì rè. — On an overcast day, the weather is hot." },
  { chunks: ["天气", "热", "。"], sentence: "天气热。", gloss: "Tiānqì rè. — The weather is hot." },
  { chunks: ["天气", "冷", "。"], sentence: "天气冷。", gloss: "Tiānqì lěng. — The weather is cold." },
];

const MATCH_OPENERS = [
  "Match each weather word below to its correct English meaning",
  "Pair every written weather term with the meaning it stands for",
  "Connect each weather word to the English meaning it matches",
  "Work out what each weather-related word means, then match it",
  "Line up each written word below with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your weather description stays accurate.",
  "before using it in a written sentence.",
  "to make sure your spelling reflects the right meaning.",
  "so a reader knows exactly what you mean.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a Weather Adjective or a Type of Day",
  "Group these written words under Weather Adjective or Type of Day",
  "Decide whether each item is a Weather Adjective or a Type of Day, then sort it",
  "Classify each expression as a Weather Adjective or a Day-Type Word",
  "Organize these words into Weather Adjective or Type of Day groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a clear weather description.",
  "so your written sentence stays organized.",
  "before writing about the weather.",
  "to check your spelling matches the right category.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const MC_OPENERS = [
  "A learner writing a weather journal entry uses the word",
  "In a written weather report, a learner includes the word",
  "While describing the weather in writing, a learner writes",
  "A learner's diary entry about the weather mentions",
  "Writing a sentence about today's weather, a learner uses",
];
const MC_CLOSERS = [
  "What does this word mean?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should a reader understand this word to mean?",
];
const MC_PROMPTS = composePrompts(MC_OPENERS, MC_CLOSERS);

const FILL_OPENERS = [
  "Fill in the missing word to complete the sentence",
  "Type the missing word that completes this sentence correctly",
  "Complete the sentence by filling in the missing word",
  "Write the correct word in the blank to finish the sentence",
  "Supply the missing word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional for pinyin answers).",
  "to keep your weather description accurate.",
  "so the sentence is spelled correctly.",
  "before checking your written work.",
];
const FILL_PROMPTS = composePrompts(FILL_OPENERS, FILL_CLOSERS);

const ORDER_OPENERS = [
  "Arrange the hanzi pieces to form a correctly written sentence",
  "Put these hanzi words in the right order to build a clear sentence",
  "Sequence the hanzi chunks so the written sentence makes sense",
  "Reorder these pieces to write a grammatically correct sentence",
  "Work out the correct word order, then arrange the hanzi pieces",
];
const ORDER_CLOSERS = [
  "for a clear weather description.",
  "so a reader can follow it clearly.",
  "before writing it into your journal.",
  "to keep the sentence coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const weatherWriting: Skill = {
  id: "g6-ma-w-weather",
  code: "W.8",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing weather descriptions",
  description: "Vocabulary development and simple written descriptions of weather conditions and types of days.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "晴天/雨天/风天/阴天 name a TYPE of day; 热/冷/暖/凉 describe what the weather is like.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const adjectives = shuffle(rng, VOCAB.filter((v) => v.tag === "adjective"));
      const nouns = shuffle(rng, VOCAB.filter((v) => v.tag === "noun"));
      const items = shuffle(rng, [...adjectives, ...nouns]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "adjective", label: "Weather Adjective" },
          { id: "noun", label: "Type of Day" },
        ],
        correctBucket,
        hint: "An adjective describes the weather directly; a noun names a kind of day.",
        explanation: items.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "adjective" ? "weather adjective" : "type of day"}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_PROMPTS)} "${correct.hanzi} (${correct.pinyin})".`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether it describes weather directly or names a type of day.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "A simple weather sentence follows 天气 [adjective]。; day-type words like 晴天 name a type of day.",
        explanation: item.gloss,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "If naming a type of day first, add a comma before describing the weather.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
