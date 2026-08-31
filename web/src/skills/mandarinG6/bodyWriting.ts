import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.7 "My Body" — focus: vocabulary development and sentence structures
// for writing about body parts and grooming, including the KICD design's own worked example
// sentences (我们用水洗澡/我应该刷牙/我需要洗澡).
// KIQ: "Why should we write sentences correctly? What is the importance of journaling in communication?"

type Tag = "body-part" | "item" | "activity" | "structure";

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
  { hanzi: "我们用水洗澡", pinyin: "wǒmen yòng shuǐ xǐzǎo", meaning: "we use water to bathe", tag: "structure" },
  { hanzi: "我应该刷牙", pinyin: "wǒ yīnggāi shuā yá", meaning: "I should brush my teeth", tag: "structure" },
  { hanzi: "我需要洗澡", pinyin: "wǒ xūyào xǐ zǎo", meaning: "I need to bathe", tag: "structure" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "我", after: "。", answer: "shuā yá", gloss: "我刷牙。— I brush my teeth." },
  { before: "我", after: "。", answer: "xǐ liǎn", gloss: "我洗脸。— I wash my face." },
  { before: "我", after: "。", answer: "xǐ shǒu", gloss: "我洗手。— I wash my hands." },
  { before: "我", after: "。", answer: "xǐzǎo", gloss: "我洗澡。— I bathe." },
  { before: "我", after: "。", answer: "shū tóufa", gloss: "我梳头发。— I comb my hair." },
  { before: "我", after: "。", answer: "biān tóufa", gloss: "我编头发。— I braid my hair." },
  { before: "我", after: "。", answer: "jiǎn tóufa", gloss: "我剪头发。— I cut my hair." },
  { before: "我们用水", after: "。", answer: "xǐzǎo", gloss: "我们用水洗澡。— We use water to bathe." },
  { before: "我应该", after: "。", answer: "shuā yá", gloss: "我应该刷牙。— I should brush my teeth." },
  { before: "我需要", after: "。", answer: "xǐzǎo", gloss: "我需要洗澡。— I need to bathe." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我", "刷牙", "。"], sentence: "我刷牙。", gloss: "Wǒ shuā yá. — I brush my teeth." },
  { chunks: ["我", "洗脸", "。"], sentence: "我洗脸。", gloss: "Wǒ xǐ liǎn. — I wash my face." },
  { chunks: ["我", "洗手", "。"], sentence: "我洗手。", gloss: "Wǒ xǐ shǒu. — I wash my hands." },
  { chunks: ["我", "洗澡", "。"], sentence: "我洗澡。", gloss: "Wǒ xǐzǎo. — I bathe." },
  { chunks: ["我", "梳头发", "。"], sentence: "我梳头发。", gloss: "Wǒ shū tóufa. — I comb my hair." },
  { chunks: ["我", "编头发", "。"], sentence: "我编头发。", gloss: "Wǒ biān tóufa. — I braid my hair." },
  { chunks: ["我", "剪头发", "。"], sentence: "我剪头发。", gloss: "Wǒ jiǎn tóufa. — I cut my hair." },
  { chunks: ["我们", "用水", "洗澡", "。"], sentence: "我们用水洗澡。", gloss: "Wǒmen yòng shuǐ xǐzǎo. — We use water to bathe." },
  { chunks: ["我", "应该", "刷牙", "。"], sentence: "我应该刷牙。", gloss: "Wǒ yīnggāi shuā yá. — I should brush my teeth." },
  { chunks: ["我", "需要", "洗澡", "。"], sentence: "我需要洗澡。", gloss: "Wǒ xūyào xǐzǎo. — I need to bathe." },
];

const MATCH_OPENERS = [
  "Match each body, item, or activity word to its correct English meaning",
  "Pair every written word below with the meaning it stands for",
  "Connect each grooming word to the English meaning it matches",
  "Work out what each body-related word means, then match it",
  "Line up each written word below with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your journal entry stays accurate.",
  "before using it in a written sentence.",
  "to make sure your spelling reflects the right meaning.",
  "so a reader knows exactly what you mean.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a Body Part, an Item, or an Activity",
  "Group these written words under Body Part, Item, or Activity",
  "Decide whether each item is a Body Part, an Item, or an Activity, then sort it",
  "Classify each expression as a Body Part, a Grooming Item, or an Activity",
  "Organize these words into Body Part, Item, or Activity groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a clear grooming-routine journal entry.",
  "so your written sentence stays organized.",
  "before writing about your daily routine.",
  "to check your spelling matches the right category.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const MC_OPENERS = [
  "A learner journaling about their grooming routine writes the sentence",
  "In a diary entry about daily habits, a learner writes",
  "While writing about personal hygiene, a learner includes the sentence",
  "A learner's journal entry about their morning routine reads",
  "Writing a sentence about their daily habits, a learner includes",
];
const MC_CLOSERS = [
  "What does this sentence mean?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should a reader understand this sentence to mean?",
];
const MC_PROMPTS_TEMPLATE = composePrompts(MC_OPENERS, MC_CLOSERS);

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence",
  "Type the missing pinyin word that completes this sentence correctly",
  "Complete the sentence by filling in the missing pinyin word",
  "Write the correct pinyin word in the blank to finish the sentence",
  "Supply the missing pinyin word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional).",
  "to keep your journal entry accurate.",
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
  "for a clear journal entry.",
  "so a reader can follow it clearly.",
  "before writing it into your diary.",
  "to keep the sentence coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const bodyWriting: Skill = {
  id: "g6-ma-w-body",
  code: "W.7",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing about grooming and daily routine",
  description: "Vocabulary development and sentence structures for writing about body parts, grooming, and daily routine.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB.filter((v) => v.tag !== "structure")).slice(0, 6);
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
        hint: "洗脸/洗手/洗澡 all start with 洗 (to wash) but each names a different body part or action.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const bodyParts = shuffle(rng, VOCAB.filter((v) => v.tag === "body-part")).slice(0, 3);
      const items = shuffle(rng, VOCAB.filter((v) => v.tag === "item")).slice(0, 3);
      const activities = shuffle(rng, VOCAB.filter((v) => v.tag === "activity")).slice(0, 3);
      const chosen = shuffle(rng, [...bodyParts, ...items, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const v of chosen) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "body-part", label: "Body Part" },
          { id: "item", label: "Grooming Item" },
          { id: "activity", label: "Activity" },
        ],
        correctBucket,
        hint: "A body part is what you groom; an item is what you groom it with; an activity is the action itself.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "body-part" ? "body part" : v.tag === "item" ? "grooming item" : "activity"}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const structures = VOCAB.filter((v) => v.tag === "structure");
      const correct = randChoice(rng, structures);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_PROMPTS_TEMPLATE)} "${correct.hanzi} (${correct.pinyin})".`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "应该 means 'should', 需要 means 'need to', and 我们 means 'we' — look for these structure words.",
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
        hint: "Simple sentences follow [pronoun] [activity]。; some add 应该 (should) or 需要 (need to) before the activity.",
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
      hint: "The pronoun comes first, then an optional structure word (应该/需要), then the activity, then 。",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
