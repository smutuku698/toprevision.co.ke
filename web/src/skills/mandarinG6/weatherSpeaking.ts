import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "adjective" | "noun" | "question" | "structure";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "热", pinyin: "rè", meaning: "hot", tag: "adjective" },
  { hanzi: "冷", pinyin: "lěng", meaning: "cold", tag: "adjective" },
  { hanzi: "暖", pinyin: "nuǎn", meaning: "warm", tag: "adjective" },
  { hanzi: "凉", pinyin: "liáng", meaning: "cool", tag: "adjective" },
  { hanzi: "晴", pinyin: "qíng", meaning: "sunny / clear", tag: "adjective" },
  { hanzi: "刮风", pinyin: "guāfēng", meaning: "windy", tag: "adjective" },
  { hanzi: "多云", pinyin: "duōyún", meaning: "cloudy", tag: "adjective" },
  { hanzi: "晴天", pinyin: "qíngtiān", meaning: "sunny day", tag: "noun" },
  { hanzi: "雨天", pinyin: "yǔtiān", meaning: "rainy day", tag: "noun" },
  { hanzi: "风天", pinyin: "fēngtiān", meaning: "windy day", tag: "noun" },
  { hanzi: "阴天", pinyin: "yīntiān", meaning: "overcast day", tag: "noun" },
  { hanzi: "天气怎么样？", pinyin: "tiānqì zěnmeyàng?", meaning: "how's the weather?", tag: "question" },
  { hanzi: "比", pinyin: "bǐ", meaning: "compared to / than (comparison marker)", tag: "structure" },
];

const PLACE_FILLS: { place: string; hanzi: string; pinyin: string; meaning: string }[] = [
  { place: "Nairobi", hanzi: "冷", pinyin: "lěng", meaning: "cold" },
  { place: "Mombasa", hanzi: "热", pinyin: "rè", meaning: "hot" },
  { place: "Kisumu", hanzi: "暖", pinyin: "nuǎn", meaning: "warm" },
  { place: "Nakuru", hanzi: "凉", pinyin: "liáng", meaning: "cool" },
  { place: "Eldoret", hanzi: "晴", pinyin: "qíng", meaning: "sunny" },
  { place: "Malindi", hanzi: "热", pinyin: "rè", meaning: "hot" },
  { place: "Nyeri", hanzi: "冷", pinyin: "lěng", meaning: "cold" },
  { place: "Kitale", hanzi: "凉", pinyin: "liáng", meaning: "cool" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  ...PLACE_FILLS.map((p) => ({
    before: `${p.place} `,
    after: "。",
    answer: p.pinyin,
    gloss: `${p.place}${p.hanzi}。— ${p.place} is ${p.meaning}.`,
  })),
  { before: "Mombasa ", after: " Kisumu nuǎn。", answer: "bǐ", gloss: "Mombasa比Kisumu暖。— Mombasa is warmer than Kisumu." },
  { before: "Nairobi ", after: " Nakuru lěng。", answer: "bǐ", gloss: "Nairobi比Nakuru冷。— Nairobi is colder than Nakuru." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  ...PLACE_FILLS.map((p) => ({
    chunks: [p.place, p.hanzi, "。"],
    sentence: `${p.place}${p.hanzi}。`,
    gloss: `${p.place} ${p.pinyin}. — ${p.place} is ${p.meaning}.`,
  })),
  { chunks: ["Mombasa", "比", "Kisumu", "暖", "。"], sentence: "Mombasa比Kisumu暖。", gloss: "Mombasa bǐ Kisumu nuǎn. — Mombasa is warmer than Kisumu." },
  { chunks: ["Nairobi", "比", "Nakuru", "冷", "。"], sentence: "Nairobi比Nakuru冷。", gloss: "Nairobi bǐ Nakuru lěng. — Nairobi is colder than Nakuru." },
];

const MATCH_OPENERS = [
  "Match each weather word below to its correct English meaning.",
  "Pair up every weather term with what it means in English.",
  "Connect each expression to its correct translation.",
  "Find the right English meaning for each weather word shown.",
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
  "Decide which category each weather word belongs to.",
  "Group these adjectives, nouns, and other weather words correctly.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about whether it describes weather, names a kind of day, or asks/compares.",
  "Some describe weather, some name a type of day, and some ask or compare.",
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
  "Check the place name for a clue about the weather.",
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
  "Think about which part comes first when describing weather.",
  "Check the meaning of each chunk before deciding its place.",
  "The place name usually comes first, then 比 if you are comparing.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, hears the weather report say "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `While describing today's weather in ${p}, ${n} uses the word "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} is listening to a Mandarin weather clip and hears "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During a Mandarin lesson in ${p}, ${n} points to a weather flashcard showing "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher asks the class what "${hanzi} (${pinyin})" means.`,
];
const MC_CLOSERS = [
  "What does this word mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const weatherSpeaking: Skill = {
  id: "g6-ma-ls-weather",
  code: "LS.8",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "Weather and environment",
  description: "Basic Mandarin weather adjectives, day-type nouns, and simple comparisons using 比 — oral vocabulary and expressions.",
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
        hint: "晴天/雨天/风天/阴天 name a TYPE of day; 热/冷/暖/凉/晴/刮风/多云 describe what the weather is like.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const adjectives = shuffle(rng, VOCAB.filter((v) => v.tag === "adjective")).slice(0, 4);
      const nouns = shuffle(rng, VOCAB.filter((v) => v.tag === "noun")).slice(0, 3);
      const other = shuffle(rng, VOCAB.filter((v) => v.tag === "question" || v.tag === "structure"));
      const items = shuffle(rng, [...adjectives, ...nouns, ...other]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag === "question" || v.tag === "structure" ? "other" : v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "adjective", label: "Weather Adjective" },
          { id: "noun", label: "Type of Day" },
          { id: "other", label: "Question or Comparison Word" },
        ],
        correctBucket,
        hint: "Adjectives describe the weather directly; nouns name a kind of day; the rest ask about or compare weather.",
        explanation: [...adjectives, ...nouns, ...other]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "adjective" ? "weather adjective" : v.tag === "noun" ? "type of day" : "question/comparison word"}.`)
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
        hint: "Think about whether it describes weather directly, names a kind of day, or is a question/comparison word.",
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
        hint: "A simple weather sentence follows the pattern [Place] [weather adjective]。; a comparison uses [Place A] 比 [Place B] [adjective]。",
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
      hint: "State the place first, then (if comparing) 比 and the second place, then the weather adjective.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
