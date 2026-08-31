import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "body-part" | "item" | "activity";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "脸", pinyin: "liǎn", meaning: "face", tag: "body-part" },
  { hanzi: "牙", pinyin: "yá", meaning: "tooth / teeth", tag: "body-part" },
  { hanzi: "手", pinyin: "shǒu", meaning: "hand", tag: "body-part" },
  { hanzi: "头发", pinyin: "tóufa", meaning: "hair", tag: "body-part" },
  { hanzi: "水", pinyin: "shuǐ", meaning: "water", tag: "item" },
  { hanzi: "梳子", pinyin: "shūzi", meaning: "comb", tag: "item" },
  { hanzi: "牙膏", pinyin: "yágāo", meaning: "toothpaste", tag: "item" },
  { hanzi: "牙刷", pinyin: "yáshuā", meaning: "toothbrush", tag: "item" },
  { hanzi: "剪刀", pinyin: "jiǎndāo", meaning: "scissors", tag: "item" },
  { hanzi: "刷牙", pinyin: "shuā yá", meaning: "brush teeth", tag: "activity" },
  { hanzi: "洗脸", pinyin: "xǐ liǎn", meaning: "wash face", tag: "activity" },
  { hanzi: "洗手", pinyin: "xǐ shǒu", meaning: "wash hands", tag: "activity" },
  { hanzi: "洗澡", pinyin: "xǐzǎo", meaning: "bathe / shower", tag: "activity" },
  { hanzi: "梳头发", pinyin: "shū tóufa", meaning: "comb hair", tag: "activity" },
  { hanzi: "编头发", pinyin: "biān tóufa", meaning: "braid hair", tag: "activity" },
  { hanzi: "剪头发", pinyin: "jiǎn tóufa", meaning: "cut hair", tag: "activity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ ", after: ", wǒ xǐ liǎn.", answer: "shuā yá", gloss: "我刷牙，我洗脸。— I brush my teeth, I wash my face." },
  { before: "Wǒ xǐ shǒu, wǒ ", after: ".", answer: "xǐzǎo", gloss: "我洗手，我洗澡。— I wash my hands, I bathe." },
  { before: "Wǒ ", after: ", wǒ biān tóufa.", answer: "shū tóufa", gloss: "我梳头发，我编头发。— I comb my hair, I braid my hair." },
  { before: "Wǒ jiǎn tóufa, wǒ ", after: ".", answer: "xǐzǎo", gloss: "我剪头发，我洗澡。— I cut my hair, I bathe." },
  { before: "Wǒ shuā yá, wǒ ", after: ".", answer: "xǐ shǒu", gloss: "我刷牙，我洗手。— I brush my teeth, I wash my hands." },
  { before: "Wǒ xǐ liǎn, wǒ ", after: ".", answer: "jiǎn tóufa", gloss: "我洗脸，我剪头发。— I wash my face, I cut my hair." },
  { before: "Wǒ ", after: ", wǒ xǐzǎo.", answer: "shū tóufa", gloss: "我梳头发，我洗澡。— I comb my hair, I bathe." },
  { before: "Wǒ biān tóufa, wǒ ", after: ".", answer: "xǐ shǒu", gloss: "我编头发，我洗手。— I braid my hair, I wash my hands." },
  { before: "Wǒ jiǎn tóufa, wǒ ", after: ".", answer: "shuā yá", gloss: "我剪头发，我刷牙。— I cut my hair, I brush my teeth." },
  { before: "Wǒ xǐ liǎn, wǒ ", after: ".", answer: "shū tóufa", gloss: "我洗脸，我梳头发。— I wash my face, I comb my hair." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我刷牙，", "我", "洗脸。"], sentence: "我刷牙，我洗脸。", gloss: "Wǒ shuā yá, wǒ xǐ liǎn. — I brush my teeth, I wash my face." },
  { chunks: ["我洗手，", "我", "洗澡。"], sentence: "我洗手，我洗澡。", gloss: "Wǒ xǐ shǒu, wǒ xǐzǎo. — I wash my hands, I bathe." },
  { chunks: ["我梳头发，", "我", "编头发。"], sentence: "我梳头发，我编头发。", gloss: "Wǒ shū tóufa, wǒ biān tóufa. — I comb my hair, I braid my hair." },
  { chunks: ["我剪头发，", "我", "洗澡。"], sentence: "我剪头发，我洗澡。", gloss: "Wǒ jiǎn tóufa, wǒ xǐzǎo. — I cut my hair, I bathe." },
  { chunks: ["我刷牙，", "我", "洗手。"], sentence: "我刷牙，我洗手。", gloss: "Wǒ shuā yá, wǒ xǐ shǒu. — I brush my teeth, I wash my hands." },
  { chunks: ["我洗脸，", "我", "剪头发。"], sentence: "我洗脸，我剪头发。", gloss: "Wǒ xǐ liǎn, wǒ jiǎn tóufa. — I wash my face, I cut my hair." },
  { chunks: ["我梳头发，", "我", "洗澡。"], sentence: "我梳头发，我洗澡。", gloss: "Wǒ shū tóufa, wǒ xǐzǎo. — I comb my hair, I bathe." },
  { chunks: ["我编头发，", "我", "洗手。"], sentence: "我编头发，我洗手。", gloss: "Wǒ biān tóufa, wǒ xǐ shǒu. — I braid my hair, I wash my hands." },
  { chunks: ["我剪头发，", "我", "刷牙。"], sentence: "我剪头发，我刷牙。", gloss: "Wǒ jiǎn tóufa, wǒ shuā yá. — I cut my hair, I brush my teeth." },
  { chunks: ["我洗脸，", "我", "梳头发。"], sentence: "我洗脸，我梳头发。", gloss: "Wǒ xǐ liǎn, wǒ shū tóufa. — I wash my face, I comb my hair." },
];

const MATCH_OPENERS = [
  "Match each body-part or grooming word to its correct English meaning.",
  "Pair up every word below with what it means in English.",
  "Connect each term to its correct translation.",
  "Find the right English meaning for each item shown.",
  "Look at each word and match it to its meaning.",
];
const MATCH_CLOSERS = [
  "Say each one aloud in your head as you match it.",
  "Match every item before you check your answers.",
  "Think about the pinyin pronunciation as you decide.",
  "Take your time with each pair.",
];

const CATEGORIZE_OPENERS = [
  "Sort each word below into the correct group.",
  "Decide which category each word belongs to.",
  "Group these words by whether they name a body part, a grooming item, or a grooming activity.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about whether it's a part of the body, a tool, or something you do.",
  "Some name body parts, some are tools, and some are actions.",
  "Use what you know about each word's meaning.",
  "Check each one carefully before moving on.",
];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence.",
  "Complete the sentence below with the correct pinyin word.",
  "Type the missing word (tone marks optional) to finish the sentence.",
  "One word is missing from this spoken sentence — fill it in.",
  "Read the sentence and supply the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Tone marks are optional if you can't type them.",
  "Think about what makes the sentence grammatically complete.",
  "Sound the sentence out before you answer.",
  "Check the surrounding words for clues.",
];

const ORDER_OPENERS = [
  "Arrange the hanzi pieces to form a correct spoken sentence.",
  "Put the words in the right order to make a complete sentence.",
  "Reorder the chunks below into a correct Mandarin sentence.",
  "Rebuild the sentence by placing each piece in order.",
  "Click the pieces in the order a fluent speaker would say them.",
];
const ORDER_CLOSERS = [
  "Say the sentence in your head as you order the pieces.",
  "Think about which grooming step comes first in a morning routine.",
  "Check the meaning of each chunk before deciding its place.",
  "我 (I) usually starts each part of the sentence.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, describes their morning routine and says "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `While packing a school bag in ${p}, ${n} names the item "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During a listening exercise about grooming, ${n} hears the words "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher in ${p} asks the class to explain the meaning of "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} acts out a grooming routine for the class and says "${hanzi} (${pinyin})".`,
];
const MC_CLOSERS = [
  "What does this mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const bodySpeaking: Skill = {
  id: "g6-ma-ls-body",
  code: "LS.7",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "My body — grooming",
  description: "Body parts, grooming items, and grooming activities — oral vocabulary for describing a daily routine.",
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
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "洗 (xǐ) means 'wash'; 梳/编/剪 all relate to hair but mean comb/braid/cut.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const bodyParts = shuffle(rng, VOCAB.filter((v) => v.tag === "body-part")).slice(0, 4);
      const itemsList = shuffle(rng, VOCAB.filter((v) => v.tag === "item")).slice(0, 4);
      const activities = shuffle(rng, VOCAB.filter((v) => v.tag === "activity")).slice(0, 4);
      const items = shuffle(rng, [...bodyParts, ...itemsList, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "body-part", label: "Body Part" },
          { id: "item", label: "Grooming Item" },
          { id: "activity", label: "Grooming Activity" },
        ],
        correctBucket,
        hint: "Body parts are parts of you; items are tools you use; activities are the actions you do with them.",
        explanation: [...bodyParts, ...itemsList, ...activities]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "body-part" ? "body part" : v.tag === "item" ? "grooming item" : "grooming activity"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const n = name(rng);
      const p = place(rng);
      const scenario = randChoice(rng, MC_OPENERS)(n, p, correct.hanzi, correct.pinyin);

      return {
        kind: "multiple-choice",
        prompt: `${scenario} ${randChoice(rng, MC_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether this names a body part, a grooming tool, or a grooming action.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "我…… , 我……。lists two grooming activities one after another.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Each clause starts with 我 (I) followed by the grooming action.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
