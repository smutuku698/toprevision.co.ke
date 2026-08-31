import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.5 "Fun" — focus: writing mechanics (spelling, word order) for
// sentences about sports and games. KIQ: "What role does handwriting play in communication?"

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "sport" | "feeling" | "phrase" }[] = [
  { hanzi: "足球", pinyin: "zúqiú", meaning: "football / soccer", tag: "sport" },
  { hanzi: "篮球", pinyin: "lánqiú", meaning: "basketball", tag: "sport" },
  { hanzi: "网球", pinyin: "wǎngqiú", meaning: "tennis", tag: "sport" },
  { hanzi: "乒乓球", pinyin: "pīngpāngqiú", meaning: "table tennis", tag: "sport" },
  { hanzi: "羽毛球", pinyin: "yǔmáoqiú", meaning: "badminton", tag: "sport" },
  { hanzi: "排球", pinyin: "páiqiú", meaning: "volleyball", tag: "sport" },
  { hanzi: "打篮球", pinyin: "dǎ lánqiú", meaning: "to play basketball", tag: "phrase" },
  { hanzi: "喜欢", pinyin: "xǐhuān", meaning: "like", tag: "feeling" },
  { hanzi: "不喜欢", pinyin: "bù xǐhuān", meaning: "don't like", tag: "feeling" },
  { hanzi: "爱", pinyin: "ài", meaning: "love", tag: "feeling" },
  { hanzi: "不爱", pinyin: "bù ài", meaning: "don't love", tag: "feeling" },
];

// "Wǒ [feeling] [sport]。" — the feeling word or the sport word is blanked in turn, using 我 (wǒ,
// "I"), already taught in the Greetings theme, as the fixed subject.
const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ ", after: " zúqiú。", answer: "xǐhuān", gloss: "我喜欢足球。— I like football." },
  { before: "Wǒ ", after: " wǎngqiú。", answer: "bù xǐhuān", gloss: "我不喜欢网球。— I don't like tennis." },
  { before: "Wǒ ", after: " lánqiú。", answer: "ài", gloss: "我爱篮球。— I love basketball." },
  { before: "Wǒ ", after: " páiqiú。", answer: "bù ài", gloss: "我不爱排球。— I don't love volleyball." },
  { before: "Wǒ ", after: " yǔmáoqiú。", answer: "xǐhuān", gloss: "我喜欢羽毛球。— I like badminton." },
  { before: "Wǒ ", after: " pīngpāngqiú。", answer: "bù xǐhuān", gloss: "我不喜欢乒乓球。— I don't like table tennis." },
  { before: "Wǒ ", after: " dǎ lánqiú。", answer: "ài", gloss: "我爱打篮球。— I love playing basketball." },
  { before: "Wǒ xǐhuān ", after: "。", answer: "zúqiú", gloss: "我喜欢足球。— I like football." },
  { before: "Wǒ bù xǐhuān ", after: "。", answer: "wǎngqiú", gloss: "我不喜欢网球。— I don't like tennis." },
  { before: "Wǒ ài ", after: "。", answer: "lánqiú", gloss: "我爱篮球。— I love basketball." },
];

// "我 [feeling] [sport]。" as ordering chunks, varying the feeling word and the sport.
const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "喜欢", "足球", "。"], sentence: "我喜欢足球。", gloss: "Wǒ xǐhuān zúqiú. — I like football." },
  { chunks: ["我", "不喜欢", "网球", "。"], sentence: "我不喜欢网球。", gloss: "Wǒ bù xǐhuān wǎngqiú. — I don't like tennis." },
  { chunks: ["我", "爱", "篮球", "。"], sentence: "我爱篮球。", gloss: "Wǒ ài lánqiú. — I love basketball." },
  { chunks: ["我", "不爱", "排球", "。"], sentence: "我不爱排球。", gloss: "Wǒ bù ài páiqiú. — I don't love volleyball." },
  { chunks: ["我", "喜欢", "羽毛球", "。"], sentence: "我喜欢羽毛球。", gloss: "Wǒ xǐhuān yǔmáoqiú. — I like badminton." },
  { chunks: ["我", "不喜欢", "乒乓球", "。"], sentence: "我不喜欢乒乓球。", gloss: "Wǒ bù xǐhuān pīngpāngqiú. — I don't like table tennis." },
  { chunks: ["我", "爱", "打篮球", "。"], sentence: "我爱打篮球。", gloss: "Wǒ ài dǎ lánqiú. — I love playing basketball." },
  { chunks: ["我", "不爱", "足球", "。"], sentence: "我不爱足球。", gloss: "Wǒ bù ài zúqiú. — I don't love football." },
  { chunks: ["我", "喜欢", "排球", "。"], sentence: "我喜欢排球。", gloss: "Wǒ xǐhuān páiqiú. — I like volleyball." },
  { chunks: ["我", "不喜欢", "篮球", "。"], sentence: "我不喜欢篮球。", gloss: "Wǒ bù xǐhuān lánqiú. — I don't like basketball." },
];

const MATCH_OPENERS = [
  "Match each sport or feeling word to its correct English meaning",
  "Pair every written sports word below with the meaning it stands for",
  "Connect each sport or feeling expression to the meaning it matches",
  "Work out what each sport or feeling word means, then match it",
  "Line up each written word below with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your handwriting stays accurate.",
  "before using it in a written sentence.",
  "to make sure your spelling reflects the right meaning.",
  "so a reader can tell exactly which sport or feeling you mean.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a Sport or a Feeling Word",
  "Group these written words under Sport or Feeling Word",
  "Decide whether each item is a Sport or a Feeling Word, then sort it",
  "Classify each expression as a Sport or a Feeling Word",
  "Organize these words into Sport or Feeling Word groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a well-organized sentence.",
  "so your written sentence stays clear.",
  "before writing about your favourite games.",
  "to check your spelling matches the right category.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const MC_OPENERS = [
  "A learner is writing about their favourite sport and needs the exact word for",
  "To keep handwriting legible and correct, which word means",
  "Which written word correctly means",
  "A pupil drafting a sentence about games must correctly spell the word for",
  "For accurate written Mandarin, which expression means",
];
const MC_CLOSERS = ['?', ", exactly?", " in their writing?", " when writing about sport?"];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence",
  "Type the missing pinyin word that completes this sentence correctly",
  "Complete the sentence by filling in the missing pinyin word",
  "Write the correct pinyin word in the blank to finish the sentence",
  "Supply the missing pinyin word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional).",
  "to keep your writing accurate.",
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
  "for a clear written sentence.",
  "so a reader can follow it clearly.",
  "before writing it into your notebook.",
  "to keep the word order correct.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const funWriting: Skill = {
  id: "g6-ma-w-fun",
  code: "W.5",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing about sports and games",
  description: "Writing mechanics — spelling and word order — for sentences about favourite sports and games.",
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
        hint: "Most ball sports end in 球 (qiú, 'ball'); feeling words go before the sport.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const sports = shuffle(rng, VOCAB.filter((v) => v.tag === "sport")).slice(0, 4);
      const feelings = shuffle(rng, VOCAB.filter((v) => v.tag === "feeling")).slice(0, 3);
      const items = shuffle(rng, [...sports, ...feelings]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "sport", label: "Sport" },
          { id: "feeling", label: "Feeling Word" },
        ],
        correctBucket,
        hint: "Sports name a game; feeling words say how you feel about it.",
        explanation: items.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "sport" ? "sport" : "feeling word"}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.hanzi, ...distractors.map((d) => d.hanzi)])));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_OPENERS)} "${correct.meaning}"${randChoice(rng, MC_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correct.hanzi),
        layout: "list",
        hint: "喜欢, 不喜欢, 爱, and 不爱 are easy to mix up — check the meaning carefully.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" is the word that means "${correct.meaning}".`,
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
        hint: "This sentence follows the pattern 我……(feeling)……(sport)。",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
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
      hint: "Start with 我 (I), then the feeling word, then the sport.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
