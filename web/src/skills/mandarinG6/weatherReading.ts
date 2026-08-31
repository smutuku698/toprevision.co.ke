import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Reading R.8 "Weather and Environment" — focus: word recognition and fluency
// (expression) reading weather sentences aloud, including comparisons with 比.
// KIQ: "How can one effectively read texts for comprehension?"

type Tag = "adjective" | "noun" | "term";

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
  { hanzi: "天气", pinyin: "tiānqì", meaning: "weather", tag: "term" },
  { hanzi: "天气怎么样？", pinyin: "tiānqì zěnmeyàng?", meaning: "how's the weather?", tag: "term" },
  { hanzi: "比", pinyin: "bǐ", meaning: "compared to / than (comparison marker)", tag: "term" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "天气", after: "。", answer: "rè", gloss: "天气热。— The weather is hot." },
  { before: "天气", after: "。", answer: "lěng", gloss: "天气冷。— The weather is cold." },
  { before: "天气", after: "。", answer: "nuǎn", gloss: "天气暖。— The weather is warm." },
  { before: "天气", after: "。", answer: "liáng", gloss: "天气凉。— The weather is cool." },
  { before: "天气", after: "。", answer: "qíng", gloss: "天气晴。— The weather is sunny." },
  { before: "", after: "。", answer: "guāfēng", gloss: "刮风。— It's windy." },
  { before: "", after: "。", answer: "duōyún", gloss: "多云。— It's cloudy." },
  { before: "", after: "气怎么样？", answer: "tiān", gloss: "天气怎么样？— How's the weather?" },
  { before: "天", after: "怎么样？", answer: "qì", gloss: "天气怎么样？— How's the weather?" },
  { before: "天气", after: "？", answer: "zěnmeyàng", gloss: "天气怎么样？— How's the weather?" },
];

const COMPARISONS: { a: string; b: string; adj: string; pinyin: string; meaning: string }[] = [
  { a: "Mombasa", b: "Kisumu", adj: "暖", pinyin: "nuǎn", meaning: "warmer" },
  { a: "Nairobi", b: "Nakuru", adj: "冷", pinyin: "lěng", meaning: "colder" },
  { a: "Kisumu", b: "Eldoret", adj: "热", pinyin: "rè", meaning: "hotter" },
  { a: "Nyeri", b: "Kitale", adj: "凉", pinyin: "liáng", meaning: "cooler" },
  { a: "Mombasa", b: "Nairobi", adj: "热", pinyin: "rè", meaning: "hotter" },
  { a: "Nakuru", b: "Kisumu", adj: "冷", pinyin: "lěng", meaning: "colder" },
  { a: "Eldoret", b: "Nyeri", adj: "暖", pinyin: "nuǎn", meaning: "warmer" },
  { a: "Kitale", b: "Mombasa", adj: "凉", pinyin: "liáng", meaning: "cooler" },
  { a: "Nairobi", b: "Kisumu", adj: "冷", pinyin: "lěng", meaning: "colder" },
  { a: "Malindi", b: "Nyeri", adj: "热", pinyin: "rè", meaning: "hotter" },
];
const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = COMPARISONS.map((c) => ({
  chunks: [c.a, "比", c.b, c.adj, "。"],
  sentence: `${c.a}比${c.b}${c.adj}。`,
  gloss: `${c.a} bǐ ${c.b} ${c.pinyin}. — ${c.a} is ${c.meaning} than ${c.b}.`,
}));

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} reads a weather report aloud with clear expression:",
  "Reading a weather forecast, {name} pauses on",
  "{name} reads a weather word aloud to the class:",
  "Practising fluent reading, {name} sounds out",
  "{name} is reading a weather passage and comes across",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this weather sentence aloud and needs the missing word.",
  "Help {name} read this weather sentence smoothly by filling in the gap.",
  "{name} reads this sentence about weather aloud but one word is missing.",
  "To read this sentence aloud with good expression, {name} needs the missing word.",
  "{name} is practising fluent reading of weather sentences — fill in the missing pinyin.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this weather comparison aloud, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the comparison reads smoothly aloud.",
  "{name} wrote this weather comparison in pieces. Put them in order.",
  "To read this comparison aloud with expression, {name} first needs the pieces in order.",
  "{name} is practising reading weather comparisons aloud — arrange the pieces into order.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a weather report aloud, sorting words by type as they read.",
  "Help {name} sort these words while reading through a weather passage.",
  "{name} is practising comprehension by sorting weather adjectives, day-types, and terms.",
  "As {name} reads each word aloud, sort it into the correct group.",
  "{name} is organizing a weather-vocabulary reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each item into its correct group.",
  "Read each item and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the items below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading weather words aloud and matching each to its meaning.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practising reading these words and connecting them to their meanings.",
  "As {name} reads each weather word aloud, match it to what it means.",
  "{name} is reviewing weather vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word or phrase to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], learnerName: string): string {
  return randChoice(rng, pool).replace("{name}", learnerName);
}

export const weatherReading: Skill = {
  id: "g6-ma-r-weather",
  code: "R.8",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: weather with expression",
  description: "Word recognition and expressive fluency reading weather vocabulary and comparisons aloud.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "order", "categorize", "match"] as const);
    const learnerName = randChoice(rng, LEARNERS);

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const prompt = `${withName(rng, MC_OPENERS, learnerName)} "${correct.hanzi} (${correct.pinyin})". ${randChoice(rng, MC_CLOSERS)}`;

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether it describes weather directly, names a type of day, or is a general term like 天气/比.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      const prompt = `${withName(rng, FILL_OPENERS, learnerName)} ${randChoice(rng, FILL_CLOSERS)}`;

      return {
        kind: "fill-blank",
        prompt,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "Simple weather statements follow the pattern 天气 [adjective]。; the question phrase is 天气怎么样？",
        explanation: item.gloss,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);
      const prompt = `${withName(rng, ORDER_OPENERS, learnerName)} ${randChoice(rng, ORDER_CLOSERS)}`;

      return {
        kind: "ordering",
        prompt,
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The first place comes first, then 比, then the second place, then the weather adjective.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const adjectives = shuffle(rng, VOCAB.filter((v) => v.tag === "adjective")).slice(0, 4);
      const nouns = shuffle(rng, VOCAB.filter((v) => v.tag === "noun")).slice(0, 3);
      const terms = shuffle(rng, VOCAB.filter((v) => v.tag === "term"));
      const items = shuffle(rng, [...adjectives, ...nouns, ...terms]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;
      const prompt = `${withName(rng, CATEGORIZE_OPENERS, learnerName)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`;

      return {
        kind: "categorize",
        prompt,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "adjective", label: "Weather Adjective" },
          { id: "noun", label: "Type of Day" },
          { id: "term", label: "General Weather Term" },
        ],
        correctBucket,
        hint: "Adjectives describe the weather directly; nouns name a kind of day; terms are general weather words/phrases.",
        explanation: [...adjectives, ...nouns, ...terms]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "adjective" ? "weather adjective" : v.tag === "noun" ? "type of day" : "general weather term"}.`)
          .join(" "),
      };
    }

    const chosen = shuffle(rng, VOCAB).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.hanzi] = v.hanzi;
    const prompt = `${withName(rng, MATCH_OPENERS, learnerName)} ${randChoice(rng, MATCH_CLOSERS)}`;

    return {
      kind: "click-match",
      prompt,
      tokens,
      targets,
      correctMap,
      hint: "Read each word aloud with expression, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
