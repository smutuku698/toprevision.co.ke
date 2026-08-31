import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Reading R.7 "My Body" — focus: vocabulary development and fluency reading
// body-part and grooming vocabulary aloud. KIQ: "What strategies can you use to read fluently?"

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
  { before: "我", after: "。", answer: "shuā yá", gloss: "我刷牙。— I brush my teeth." },
  { before: "我", after: "。", answer: "xǐ liǎn", gloss: "我洗脸。— I wash my face." },
  { before: "我", after: "。", answer: "xǐ shǒu", gloss: "我洗手。— I wash my hands." },
  { before: "我", after: "。", answer: "xǐzǎo", gloss: "我洗澡。— I bathe." },
  { before: "我", after: "。", answer: "shū tóufa", gloss: "我梳头发。— I comb my hair." },
  { before: "我", after: "。", answer: "biān tóufa", gloss: "我编头发。— I braid my hair." },
  { before: "我", after: "。", answer: "jiǎn tóufa", gloss: "我剪头发。— I cut my hair." },
  { before: "他", after: "。", answer: "shuā yá", gloss: "他刷牙。— He brushes his teeth." },
  { before: "她", after: "。", answer: "xǐ liǎn", gloss: "她洗脸。— She washes her face." },
  { before: "他", after: "。", answer: "xǐzǎo", gloss: "他洗澡。— He bathes." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "刷牙", "。"], sentence: "我刷牙。", gloss: "Wǒ shuā yá. — I brush my teeth." },
  { chunks: ["我", "洗脸", "。"], sentence: "我洗脸。", gloss: "Wǒ xǐ liǎn. — I wash my face." },
  { chunks: ["我", "洗手", "。"], sentence: "我洗手。", gloss: "Wǒ xǐ shǒu. — I wash my hands." },
  { chunks: ["我", "洗澡", "。"], sentence: "我洗澡。", gloss: "Wǒ xǐzǎo. — I bathe." },
  { chunks: ["我", "梳头发", "。"], sentence: "我梳头发。", gloss: "Wǒ shū tóufa. — I comb my hair." },
  { chunks: ["我", "编头发", "。"], sentence: "我编头发。", gloss: "Wǒ biān tóufa. — I braid my hair." },
  { chunks: ["我", "剪头发", "。"], sentence: "我剪头发。", gloss: "Wǒ jiǎn tóufa. — I cut my hair." },
  { chunks: ["他", "刷牙", "。"], sentence: "他刷牙。", gloss: "Tā shuā yá. — He brushes his teeth." },
  { chunks: ["她", "洗脸", "。"], sentence: "她洗脸。", gloss: "Tā xǐ liǎn. — She washes her face." },
  { chunks: ["他", "洗澡", "。"], sentence: "他洗澡。", gloss: "Tā xǐzǎo. — He bathes." },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} reads a grooming word aloud fluently, without hesitating:",
  "Reading a personal-hygiene poster, {name} pauses on",
  "{name} reads a body-part word aloud to the class:",
  "Building reading fluency, {name} sounds out",
  "{name} is practising smooth reading and comes across",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this sentence aloud fluently and needs the missing word.",
  "Help {name} read this sentence about grooming smoothly by filling the gap.",
  "{name} reads this sentence aloud but one word is missing.",
  "To keep the reading fluent, {name} needs to supply the missing word.",
  "{name} is practising fluent reading — type the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this sentence aloud fluently, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the sentence reads smoothly aloud.",
  "{name} wrote this sentence about grooming in pieces. Put them in order.",
  "To read this sentence aloud without pausing, {name} first needs the pieces in order.",
  "{name} is practising fluent reading — arrange the pieces into the correct sentence.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a grooming-routine list aloud, sorting words by type.",
  "Help {name} sort these words while reading through a hygiene checklist.",
  "{name} is practising comprehension by sorting body parts, items, and activities.",
  "As {name} reads each word aloud, sort it into the correct group.",
  "{name} is organizing a grooming-vocabulary reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each item into its correct group.",
  "Read each item and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the items below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading grooming words aloud and matching each to its meaning.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practising reading these words and connecting them to their meanings.",
  "As {name} reads each word aloud, match it to what it means.",
  "{name} is reviewing body and grooming vocabulary by matching words to meanings.",
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

export const bodyReading: Skill = {
  id: "g6-ma-r-body",
  code: "R.7",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: my body, fluently",
  description: "Build vocabulary and reading fluency with body-part and personal-grooming words and sentences.",
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
        hint: "Think about whether it names a body part, a grooming item, or a grooming activity.",
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
        hint: "This sentence follows the pattern [pronoun] [grooming activity]。",
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
        hint: "The pronoun (我/他/她) comes first, then the grooming activity, then 。",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const buckets: { id: Tag; label: string }[] = [
        { id: "body-part", label: "Body Part" },
        { id: "item", label: "Grooming Item" },
        { id: "activity", label: "Grooming Activity" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of chosen) correctBucket[v.hanzi] = v.tag;
      const prompt = `${withName(rng, CATEGORIZE_OPENERS, learnerName)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`;

      return {
        kind: "categorize",
        prompt,
        items: shuffle(rng, chosen).map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets,
        correctBucket,
        hint: "A body part is what you groom; an item is what you groom it with; an activity is the action itself.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${buckets.find((b) => b.id === v.tag)!.label.toLowerCase()}.`).join(" "),
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
      hint: "Read each word aloud smoothly, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
