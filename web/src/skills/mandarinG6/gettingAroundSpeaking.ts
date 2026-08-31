import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "facility" | "location" | "question";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "library", tag: "facility" },
  { hanzi: "教室", pinyin: "jiàoshì", meaning: "classroom", tag: "facility" },
  { hanzi: "体育馆", pinyin: "tǐyùguǎn", meaning: "gymnasium", tag: "facility" },
  { hanzi: "操场", pinyin: "cāochǎng", meaning: "playground / field", tag: "facility" },
  { hanzi: "办公室", pinyin: "bàngōngshì", meaning: "office", tag: "facility" },
  { hanzi: "餐厅", pinyin: "cāntīng", meaning: "dining hall / cafeteria", tag: "facility" },
  { hanzi: "洗手间", pinyin: "xǐshǒujiān", meaning: "restroom", tag: "facility" },
  { hanzi: "前面", pinyin: "qiánmiàn", meaning: "in front", tag: "location" },
  { hanzi: "后面", pinyin: "hòumiàn", meaning: "behind", tag: "location" },
  { hanzi: "旁边", pinyin: "pángbiān", meaning: "beside / next to", tag: "location" },
  { hanzi: "对面", pinyin: "duìmiàn", meaning: "opposite / across from", tag: "location" },
  { hanzi: "教室在哪儿？", pinyin: "jiàoshì zài nǎr?", meaning: "where is the classroom?", tag: "question" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "图书馆在", after: "。", answer: "qiánmiàn", gloss: "图书馆在前面。— The library is in front." },
  { before: "操场在", after: "。", answer: "hòumiàn", gloss: "操场在后面。— The field is behind." },
  { before: "教室在", after: "。", answer: "pángbiān", gloss: "教室在旁边。— The classroom is beside." },
  { before: "办公室在", after: "。", answer: "duìmiàn", gloss: "办公室在对面。— The office is opposite." },
  { before: "", after: "在前面。", answer: "tǐyùguǎn", gloss: "体育馆在前面。— The gym is in front." },
  { before: "", after: "在后面。", answer: "cāntīng", gloss: "餐厅在后面。— The dining hall is behind." },
  { before: "图书馆在教室", after: "。", answer: "hòumiàn", gloss: "图书馆在教室后面。— The library is behind the classroom." },
  { before: "操场在教室", after: "。", answer: "hòumiàn", gloss: "操场在教室后面。— The field is behind the classroom." },
  { before: "教室在洗手间", after: "。", answer: "pángbiān", gloss: "教室在洗手间旁边。— The classroom is next to the restroom." },
  { before: "图书馆在办公室", after: "。", answer: "qiánmiàn", gloss: "图书馆在办公室前面。— The library is in front of the office." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["图书馆", "在", "前面", "。"], sentence: "图书馆在前面。", gloss: "Túshūguǎn zài qiánmiàn. — The library is in front." },
  { chunks: ["操场", "在", "后面", "。"], sentence: "操场在后面。", gloss: "Cāochǎng zài hòumiàn. — The field is behind." },
  { chunks: ["教室", "在", "旁边", "。"], sentence: "教室在旁边。", gloss: "Jiàoshì zài pángbiān. — The classroom is beside." },
  { chunks: ["办公室", "在", "对面", "。"], sentence: "办公室在对面。", gloss: "Bàngōngshì zài duìmiàn. — The office is opposite." },
  { chunks: ["体育馆", "在", "前面", "。"], sentence: "体育馆在前面。", gloss: "Tǐyùguǎn zài qiánmiàn. — The gym is in front." },
  { chunks: ["餐厅", "在", "后面", "。"], sentence: "餐厅在后面。", gloss: "Cāntīng zài hòumiàn. — The dining hall is behind." },
  { chunks: ["图书馆", "在", "教室", "后面", "。"], sentence: "图书馆在教室后面。", gloss: "Túshūguǎn zài jiàoshì hòumiàn. — The library is behind the classroom." },
  { chunks: ["操场", "在", "教室", "后面", "。"], sentence: "操场在教室后面。", gloss: "Cāochǎng zài jiàoshì hòumiàn. — The field is behind the classroom." },
  { chunks: ["教室", "在", "洗手间", "旁边", "。"], sentence: "教室在洗手间旁边。", gloss: "Jiàoshì zài xǐshǒujiān pángbiān. — The classroom is next to the restroom." },
  { chunks: ["图书馆", "在", "办公室", "前面", "。"], sentence: "图书馆在办公室前面。", gloss: "Túshūguǎn zài bàngōngshì qiánmiàn. — The library is in front of the office." },
];

const MATCH_OPENERS = [
  "Match each word below to its correct English meaning.",
  "Pair up every facility or location word with what it means in English.",
  "Connect each expression to its correct translation.",
  "Find the right English meaning for each item shown.",
  "Read each word carefully, then match it to its meaning.",
];
const MATCH_CLOSERS = [
  "Say each word aloud in your head as you match it.",
  "Match every item before you check your answers.",
  "Think about the pinyin pronunciation as you decide.",
  "Take your time with each pair.",
];

const CATEGORIZE_OPENERS = [
  "Sort each word below into the correct group.",
  "Decide which category each expression belongs to.",
  "Group these facility names and location words correctly.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about whether it names a place, tells its location, or asks a question.",
  "Some name a school facility, some tell you where something is, and one asks a question.",
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
  "Think about which part comes first when giving a location.",
  "Check the meaning of each chunk before deciding its place.",
  "The facility name usually comes first, followed by 在 and its location.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, hears a classmate say "${hanzi} (${pinyin})" while giving directions.`,
  (n, p, hanzi, pinyin) => `While drawing a map of the school in ${p}, ${n} labels a spot "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} is listening to directions around school and hears "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During a school tour in ${p}, ${n} hears the guide say "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher points at a school map and says "${hanzi} (${pinyin})".`,
];
const MC_CLOSERS = [
  "What does this word mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const gettingAroundSpeaking: Skill = {
  id: "g6-ma-ls-getting-around",
  code: "LS.9",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "Getting around — school facilities and location",
  description: "Basic Mandarin school-facility vocabulary and location words (方位词) — oral vocabulary and expressions.",
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
        hint: "Facility words name a place; location words (方位词) tell you where something is relative to another place.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const facilities = shuffle(rng, VOCAB.filter((v) => v.tag === "facility")).slice(0, 4);
      const locations = shuffle(rng, VOCAB.filter((v) => v.tag === "location"));
      const items = shuffle(rng, [...facilities, ...locations]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "facility", label: "School Facility" },
          { id: "location", label: "Location Word (方位词)" },
        ],
        correctBucket,
        hint: "A facility names a place (library, gym); a location word tells you where something is (in front, behind).",
        explanation: [...facilities, ...locations].map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "facility" ? "school facility" : "location word"}.`).join(" "),
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
        hint: "Think about whether it names a place, or tells you the place's location.",
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
        hint: "This sentence follows the pattern [facility] 在 [location]。",
        explanation: item.gloss,
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
      hint: "Name the facility first, then 在, then (if needed) a second facility, then the location word.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
