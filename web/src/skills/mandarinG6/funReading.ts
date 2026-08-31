import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

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
  { hanzi: "我喜欢……", pinyin: "wǒ xǐhuān……", meaning: "I like…", tag: "preference" },
  { hanzi: "我爱……", pinyin: "wǒ ài……", meaning: "I love…", tag: "preference" },
  { hanzi: "我不喜欢……", pinyin: "wǒ bù xǐhuān……", meaning: "I don't like…", tag: "preference" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ xǐhuān ", after: ".", answer: "zúqiú", gloss: "我喜欢足球。— I like football." },
  { before: "Wǒ ài ", after: ".", answer: "lánqiú", gloss: "我爱篮球。— I love basketball." },
  { before: "Wǒ bù xǐhuān ", after: ".", answer: "wǎngqiú", gloss: "我不喜欢网球。— I don't like tennis." },
  { before: "Wǒ xǐhuān ", after: ".", answer: "pīngpāngqiú", gloss: "我喜欢乒乓球。— I like table tennis." },
  { before: "Wǒ ài ", after: ".", answer: "yǔmáoqiú", gloss: "我爱羽毛球。— I love badminton." },
  { before: "Wǒ bù xǐhuān ", after: ".", answer: "páiqiú", gloss: "我不喜欢排球。— I don't like volleyball." },
  { before: "Wǒ xǐhuān ", after: ".", answer: "pǎobù", gloss: "我喜欢跑步。— I like running." },
  { before: "Wǒ ài ", after: ".", answer: "yùndòng", gloss: "我爱运动。— I love to exercise." },
  { before: "Wǒ ", after: " zúqiú bǐsài.", answer: "xǐhuān", gloss: "我喜欢足球比赛。— I like football matches." },
  { before: "Wǒ ", after: " lánqiú.", answer: "ài", gloss: "我爱篮球。— I love basketball." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "喜欢", "足球。"], sentence: "我喜欢足球。", gloss: "Wǒ xǐhuān zúqiú. — I like football." },
  { chunks: ["我", "爱", "篮球。"], sentence: "我爱篮球。", gloss: "Wǒ ài lánqiú. — I love basketball." },
  { chunks: ["我", "不喜欢", "网球。"], sentence: "我不喜欢网球。", gloss: "Wǒ bù xǐhuān wǎngqiú. — I don't like tennis." },
  { chunks: ["我喜欢", "乒乓球", "比赛。"], sentence: "我喜欢乒乓球比赛。", gloss: "Wǒ xǐhuān pīngpāngqiú bǐsài. — I like table tennis matches." },
  { chunks: ["我爱", "羽毛球", "运动。"], sentence: "我爱羽毛球运动。", gloss: "Wǒ ài yǔmáoqiú yùndòng. — I love badminton exercise." },
  { chunks: ["我不喜欢", "排球", "比赛。"], sentence: "我不喜欢排球比赛。", gloss: "Wǒ bù xǐhuān páiqiú bǐsài. — I don't like volleyball matches." },
  { chunks: ["我", "喜欢", "跑步。"], sentence: "我喜欢跑步。", gloss: "Wǒ xǐhuān pǎobù. — I like running." },
  { chunks: ["我", "爱", "运动。"], sentence: "我爱运动。", gloss: "Wǒ ài yùndòng. — I love to exercise." },
  { chunks: ["我喜欢", "足球", "比赛。"], sentence: "我喜欢足球比赛。", gloss: "Wǒ xǐhuān zúqiú bǐsài. — I like football matches." },
  { chunks: ["我", "不喜欢", "跑步。"], sentence: "我不喜欢跑步。", gloss: "Wǒ bù xǐhuān pǎobù. — I don't like running." },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} is reading a sports sign-up sheet and uses the surrounding words as clues to figure out",
  "While reading a list of favourite games, using context clues, {name} reaches",
  "{name} reads a sentence about a sport and uses the words around it to guess the meaning of",
  "Reading a games-day notice aloud, {name} uses context to work out",
  "{name} is reading a note about sports and pauses on",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word, based on the sentence around it?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this sentence about sports aloud and uses the words around the gap as a clue.",
  "Help {name} use context clues to figure out the missing pinyin word.",
  "{name} reads this sentence about a favourite sport but one word is missing.",
  "Using the surrounding words as a clue, {name} needs to fill in the missing word.",
  "{name} is reading a sentence about sports aloud — use the context to type the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this sentence about a sport, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the sentence makes sense when read aloud.",
  "{name} wrote this sentence about a favourite game in pieces. Put them in order.",
  "To read this sentence about sports clearly, {name} first needs the pieces in order.",
  "{name} is practicing reading sentences about sports — arrange the pieces into the correct sentence.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a sports and games list, sorting words by type as they read.",
  "Help {name} sort these words while reading through a games-day programme.",
  "{name} is practicing comprehension by sorting sports, activities, and preference phrases.",
  "As {name} reads each word or phrase aloud, sort it into the correct group.",
  "{name} is organizing a sports reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each item into its correct group.",
  "Read each item and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the items below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading sports words aloud and matching each to its meaning using context clues.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practicing reading these words and connecting them to their meanings.",
  "As {name} reads each sports word aloud, match it to what it means.",
  "{name} is reviewing sports vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word or phrase to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], name: string): string {
  return randChoice(rng, pool).replace("{name}", name);
}

export const funReading: Skill = {
  id: "g6-ma-r-fun",
  code: "R.5",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: sports and games with context clues",
  description: "Use context clues to build comprehension of sports, games, and activity-preference vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "order", "categorize", "match"] as const);
    const name = randChoice(rng, LEARNERS);

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const prompt = `${withName(rng, MC_OPENERS, name)} "${correct.hanzi} (${correct.pinyin})". ${randChoice(rng, MC_CLOSERS)}`;

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Look at the words around it — a preference word like 喜欢/爱 signals a sport or activity is coming.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      const prompt = `${withName(rng, FILL_OPENERS, name)} ${randChoice(rng, FILL_CLOSERS)}`;

      return {
        kind: "fill-blank",
        prompt,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "Use the words before and after the gap as clues to what kind of word is missing.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);
      const prompt = `${withName(rng, ORDER_OPENERS, name)} ${randChoice(rng, ORDER_CLOSERS)}`;

      return {
        kind: "ordering",
        prompt,
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject 我 comes first, then the preference verb (喜欢/爱/不喜欢), then the sport or activity.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const buckets: { id: Tag; label: string }[] = [
        { id: "sport", label: "Sport / game" },
        { id: "activity", label: "Activity word" },
        { id: "preference", label: "Preference phrase" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of chosen) correctBucket[v.hanzi] = v.tag;
      const prompt = `${withName(rng, CATEGORIZE_OPENERS, name)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`;

      return {
        kind: "categorize",
        prompt,
        items: shuffle(rng, chosen).map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets,
        correctBucket,
        hint: "A sport names a specific game; an activity word names general exercise; a preference phrase says how much someone likes something.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${buckets.find((b) => b.id === v.tag)!.label.toLowerCase()}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, VOCAB).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.hanzi] = v.hanzi;
    const prompt = `${withName(rng, MATCH_OPENERS, name)} ${randChoice(rng, MATCH_CLOSERS)}`;

    return {
      kind: "click-match",
      prompt,
      tokens,
      targets,
      correctMap,
      hint: "Use context to sound out each word, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
