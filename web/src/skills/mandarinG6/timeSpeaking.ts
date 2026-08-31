import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "month" | "event";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "一月", pinyin: "yī yuè", meaning: "January", tag: "month" },
  { hanzi: "二月", pinyin: "èr yuè", meaning: "February", tag: "month" },
  { hanzi: "三月", pinyin: "sān yuè", meaning: "March", tag: "month" },
  { hanzi: "四月", pinyin: "sì yuè", meaning: "April", tag: "month" },
  { hanzi: "五月", pinyin: "wǔ yuè", meaning: "May", tag: "month" },
  { hanzi: "六月", pinyin: "liù yuè", meaning: "June", tag: "month" },
  { hanzi: "七月", pinyin: "qī yuè", meaning: "July", tag: "month" },
  { hanzi: "八月", pinyin: "bā yuè", meaning: "August", tag: "month" },
  { hanzi: "九月", pinyin: "jiǔ yuè", meaning: "September", tag: "month" },
  { hanzi: "十月", pinyin: "shí yuè", meaning: "October", tag: "month" },
  { hanzi: "十一月", pinyin: "shíyī yuè", meaning: "November", tag: "month" },
  { hanzi: "十二月", pinyin: "shí'èr yuè", meaning: "December", tag: "month" },
  { hanzi: "圣诞节", pinyin: "Shèngdàn jié", meaning: "Christmas", tag: "event" },
  { hanzi: "复活节", pinyin: "Fùhuó jié", meaning: "Easter", tag: "event" },
  { hanzi: "情人节", pinyin: "Qíngrén jié", meaning: "Valentine's Day", tag: "event" },
  { hanzi: "母亲节", pinyin: "Mǔqīn jié", meaning: "Mother's Day", tag: "event" },
  { hanzi: "元旦节", pinyin: "Yuándàn jié", meaning: "New Year's Day", tag: "event" },
  { hanzi: "放假", pinyin: "fàngjià", meaning: "school holiday / break", tag: "event" },
  { hanzi: "开学", pinyin: "kāixué", meaning: "school starts", tag: "event" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "", after: " yuè shì Shèngdàn jié.", answer: "Shí'èr", gloss: "十二月是圣诞节。— December is Christmas." },
  { before: "Yī yuè shì ", after: ".", answer: "Yuándàn jié", gloss: "一月是元旦节。— January is New Year's Day." },
  { before: "", after: " yuè shì Qíngrén jié.", answer: "Èr", gloss: "二月是情人节。— February is Valentine's Day." },
  { before: "Sì yuè shì ", after: ".", answer: "Fùhuó jié", gloss: "四月是复活节。— April is Easter." },
  { before: "", after: " yuè shì Mǔqīn jié.", answer: "Wǔ", gloss: "五月是母亲节。— May is Mother's Day." },
  { before: "Shí'èr yuè ", after: ".", answer: "fàngjià", gloss: "十二月放假。— December is school holiday." },
  { before: "", after: " yuè kāixué.", answer: "Yī", gloss: "一月开学。— School starts in January." },
  { before: "Bā yuè ", after: ".", answer: "fàngjià", gloss: "八月放假。— August is school holiday." },
  { before: "", after: " yuè kāixué.", answer: "Jiǔ", gloss: "九月开学。— School starts in September." },
  { before: "Sān yuè ", after: ".", answer: "fàngjià", gloss: "三月放假。— March is school holiday." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["十二月", "是", "圣诞节。"], sentence: "十二月是圣诞节。", gloss: "Shí'èr yuè shì Shèngdàn jié. — December is Christmas." },
  { chunks: ["一月", "是", "元旦节。"], sentence: "一月是元旦节。", gloss: "Yī yuè shì Yuándàn jié. — January is New Year's Day." },
  { chunks: ["二月", "是", "情人节。"], sentence: "二月是情人节。", gloss: "Èr yuè shì Qíngrén jié. — February is Valentine's Day." },
  { chunks: ["四月", "是", "复活节。"], sentence: "四月是复活节。", gloss: "Sì yuè shì Fùhuó jié. — April is Easter." },
  { chunks: ["五月", "是", "母亲节。"], sentence: "五月是母亲节。", gloss: "Wǔ yuè shì Mǔqīn jié. — May is Mother's Day." },
  { chunks: ["一月开学，", "十二月", "放假。"], sentence: "一月开学，十二月放假。", gloss: "Yī yuè kāixué, shí'èr yuè fàngjià. — School starts in January, holiday in December." },
  { chunks: ["三月", "放假，", "九月开学。"], sentence: "三月放假，九月开学。", gloss: "Sān yuè fàngjià, jiǔ yuè kāixué. — March is holiday, school starts in September." },
  { chunks: ["八月", "放假，", "十月开学。"], sentence: "八月放假，十月开学。", gloss: "Bā yuè fàngjià, shí yuè kāixué. — August is holiday, school starts in October." },
  { chunks: ["六月", "放假，", "七月开学。"], sentence: "六月放假，七月开学。", gloss: "Liù yuè fàngjià, qī yuè kāixué. — June is holiday, school starts in July." },
  { chunks: ["十一月", "放假，", "十二月", "是圣诞节。"], sentence: "十一月放假，十二月是圣诞节。", gloss: "Shíyī yuè fàngjià, shí'èr yuè shì Shèngdàn jié. — November is holiday, December is Christmas." },
];

const MATCH_OPENERS = [
  "Match each month or event word to its correct English meaning.",
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
  "Group these words by whether they name a month or a seasonal event.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about whether it names a month of the year or an event.",
  "Some are months, others are holidays or school events.",
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
  "Think about which part comes first when naming a month.",
  "Check the meaning of each chunk before deciding its place.",
  "The month usually comes first in these sentences.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, is giving an oral talk about the school calendar and says "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} is marking a Mandarin class calendar in ${p} and writes "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `While listening to an audio clip about the year, ${n} hears the words "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher in ${p} asks the class to explain the meaning of "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During a speaking practice about seasons and events, ${n} says "${hanzi} (${pinyin})" out loud.`,
];
const MC_CLOSERS = [
  "What does this mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const timeSpeaking: Skill = {
  id: "g6-ma-ls-time",
  code: "LS.4",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "Time — months and seasonal events",
  description: "The twelve months and seasonal school/calendar events — oral vocabulary for speaking about time.",
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
        hint: "Month names are built from a number plus 月 (yuè); events use their own names.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const months = shuffle(rng, VOCAB.filter((v) => v.tag === "month")).slice(0, 5);
      const events = shuffle(rng, VOCAB.filter((v) => v.tag === "event")).slice(0, 4);
      const items = shuffle(rng, [...months, ...events]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "month", label: "Month" },
          { id: "event", label: "Seasonal Event" },
        ],
        correctBucket,
        hint: "Months always end in 月 (yuè); events and holidays have their own distinct names.",
        explanation: [...months, ...events]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "month" ? "month" : "seasonal event"}.`)
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
        hint: "Think about whether this names a month of the year or a seasonal event.",
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
        hint: "……月是…… states which event falls in a month; ……月放假/开学 says school breaks or starts that month.",
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
      hint: "State the month first, then what happens in it.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
