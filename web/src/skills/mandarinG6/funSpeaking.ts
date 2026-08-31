import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "sport" | "activity" | "preference";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "足球", pinyin: "zúqiú", meaning: "football / soccer", tag: "sport" },
  { hanzi: "篮球", pinyin: "lánqiú", meaning: "basketball", tag: "sport" },
  { hanzi: "网球", pinyin: "wǎngqiú", meaning: "tennis", tag: "sport" },
  { hanzi: "乒乓球", pinyin: "pīngpāngqiú", meaning: "table tennis", tag: "sport" },
  { hanzi: "羽毛球", pinyin: "yǔmáoqiú", meaning: "badminton", tag: "sport" },
  { hanzi: "排球", pinyin: "páiqiú", meaning: "volleyball", tag: "sport" },
  { hanzi: "跑步", pinyin: "pǎobù", meaning: "running / jogging", tag: "activity" },
  { hanzi: "运动", pinyin: "yùndòng", meaning: "to exercise / sport", tag: "activity" },
  { hanzi: "比赛", pinyin: "bǐsài", meaning: "competition / match", tag: "activity" },
  { hanzi: "踢足球", pinyin: "tī zúqiú", meaning: "to play football (kick)", tag: "activity" },
  { hanzi: "打篮球", pinyin: "dǎ lánqiú", meaning: "to play basketball", tag: "activity" },
  { hanzi: "打排球", pinyin: "dǎ páiqiú", meaning: "to play volleyball", tag: "activity" },
  { hanzi: "我喜欢……", pinyin: "wǒ xǐhuān……", meaning: "I like…", tag: "preference" },
  { hanzi: "我爱……", pinyin: "wǒ ài……", meaning: "I love…", tag: "preference" },
  { hanzi: "我热爱……", pinyin: "wǒ rè'ài……", meaning: "I am passionate about…", tag: "preference" },
  { hanzi: "我不喜欢……", pinyin: "wǒ bù xǐhuān……", meaning: "I don't like…", tag: "preference" },
  { hanzi: "你最喜欢什么运动？", pinyin: "nǐ zuì xǐhuān shénme yùndòng?", meaning: "what sport do you like best?", tag: "preference" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ xǐhuān tī ", after: ".", answer: "zúqiú", gloss: "我喜欢踢足球。— I like playing football." },
  { before: "Wǒ ài dǎ ", after: ".", answer: "lánqiú", gloss: "我爱打篮球。— I love playing basketball." },
  { before: "Wǒ rè'ài dǎ ", after: ".", answer: "páiqiú", gloss: "我热爱打排球。— I'm passionate about volleyball." },
  { before: "Wǒ bù xǐhuān ", after: ".", answer: "pǎobù", gloss: "我不喜欢跑步。— I don't like running." },
  { before: "Wǒ xǐhuān ", after: ".", answer: "wǎngqiú", gloss: "我喜欢网球。— I like tennis." },
  { before: "Wǒ ài ", after: ".", answer: "yùndòng", gloss: "我爱运动。— I love exercising." },
  { before: "Wǒ rè'ài ", after: ".", answer: "pīngpāngqiú", gloss: "我热爱乒乓球。— I'm passionate about table tennis." },
  { before: "Wǒ bù xǐhuān ", after: ".", answer: "yǔmáoqiú", gloss: "我不喜欢羽毛球。— I don't like badminton." },
  { before: "Wǒ xǐhuān ", after: ".", answer: "bǐsài", gloss: "我喜欢比赛。— I like competitions." },
  { before: "Nǐ zuì xǐhuān shénme ", after: "?", answer: "yùndòng", gloss: "你最喜欢什么运动？— What sport do you like best?" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "喜欢", "踢足球。"], sentence: "我喜欢踢足球。", gloss: "Wǒ xǐhuān tī zúqiú. — I like playing football." },
  { chunks: ["我", "爱", "打篮球。"], sentence: "我爱打篮球。", gloss: "Wǒ ài dǎ lánqiú. — I love playing basketball." },
  { chunks: ["我", "热爱", "打排球。"], sentence: "我热爱打排球。", gloss: "Wǒ rè'ài dǎ páiqiú. — I'm passionate about volleyball." },
  { chunks: ["我", "不喜欢", "跑步。"], sentence: "我不喜欢跑步。", gloss: "Wǒ bù xǐhuān pǎobù. — I don't like running." },
  { chunks: ["我", "喜欢", "网球。"], sentence: "我喜欢网球。", gloss: "Wǒ xǐhuān wǎngqiú. — I like tennis." },
  { chunks: ["我", "爱", "运动。"], sentence: "我爱运动。", gloss: "Wǒ ài yùndòng. — I love exercising." },
  { chunks: ["我", "热爱", "乒乓球。"], sentence: "我热爱乒乓球。", gloss: "Wǒ rè'ài pīngpāngqiú. — I'm passionate about table tennis." },
  { chunks: ["我", "不喜欢", "羽毛球。"], sentence: "我不喜欢羽毛球。", gloss: "Wǒ bù xǐhuān yǔmáoqiú. — I don't like badminton." },
  { chunks: ["我", "喜欢", "比赛。"], sentence: "我喜欢比赛。", gloss: "Wǒ xǐhuān bǐsài. — I like competitions." },
  { chunks: ["你最喜欢", "什么", "运动？"], sentence: "你最喜欢什么运动？", gloss: "Nǐ zuì xǐhuān shénme yùndòng? — What sport do you like best?" },
];

const MATCH_OPENERS = [
  "Match each sport or activity word to its correct English meaning.",
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
  "Decide which category each item belongs to.",
  "Group these words by whether they name a sport, an activity, or a preference phrase.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about whether it names a game, a doing-word, or how someone feels about it.",
  "Some are sports, some are activities, and some say what someone likes.",
  "Use what you know about each word's purpose.",
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
  "Think about which part comes first when saying what you like.",
  "Check the meaning of each chunk before deciding its place.",
  "The subject and preference phrase usually come before the sport.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, tells the class about their favourite pastime and says "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During games time in ${p}, ${n} shouts "${hanzi} (${pinyin})" to a teammate.`,
  (n, p, hanzi, pinyin) => `While listening to a sports interview, ${n} hears the words "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher in ${p} asks the class to explain the meaning of "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} is writing a short speech about sport and reads out "${hanzi} (${pinyin})".`,
];
const MC_CLOSERS = [
  "What does this mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const funSpeaking: Skill = {
  id: "g6-ma-ls-fun",
  code: "LS.5",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "Fun and enjoyment — sports and games",
  description: "Sports, games, and preference expressions — oral vocabulary for talking about what you like to play.",
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
        hint: "打 (dǎ) is used with ball games held in the hand, like basketball and volleyball; 踢 (tī) is used for football, which is kicked.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const sports = shuffle(rng, VOCAB.filter((v) => v.tag === "sport")).slice(0, 4);
      const activities = shuffle(rng, VOCAB.filter((v) => v.tag === "activity")).slice(0, 4);
      const preferences = shuffle(rng, VOCAB.filter((v) => v.tag === "preference")).slice(0, 3);
      const items = shuffle(rng, [...sports, ...activities, ...preferences]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "sport", label: "Sport" },
          { id: "activity", label: "Activity" },
          { id: "preference", label: "Preference Phrase" },
        ],
        correctBucket,
        hint: "Sports are games/equipment; activities are doing-words; preference phrases say how much someone likes something.",
        explanation: [...sports, ...activities, ...preferences]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "sport" ? "sport" : v.tag === "activity" ? "activity" : "preference phrase"}.`)
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
        hint: "Think about whether this names a sport, describes an activity, or expresses a preference.",
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
        hint: "我喜欢/我爱/我热爱/我不喜欢…… comes before the sport or activity being described.",
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
      hint: "Say who first, then how much they like it, then the sport or activity.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
