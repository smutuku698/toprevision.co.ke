import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.2 "Family" — focus: character recognition (including distinguishing
// visually similar-looking characters, an explicit KICD design point) and simple descriptive texts
// about family members. KIQ: "How can we effectively articulate our ideas in writing?"

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "family" | "number" }[] = [
  { hanzi: "爸爸", pinyin: "bàba", meaning: "dad", tag: "family" },
  { hanzi: "妈妈", pinyin: "māma", meaning: "mom", tag: "family" },
  { hanzi: "哥哥", pinyin: "gēge", meaning: "older brother", tag: "family" },
  { hanzi: "姐姐", pinyin: "jiějie", meaning: "older sister", tag: "family" },
  { hanzi: "弟弟", pinyin: "dìdi", meaning: "younger brother", tag: "family" },
  { hanzi: "妹妹", pinyin: "mèimei", meaning: "younger sister", tag: "family" },
  { hanzi: "三十", pinyin: "sānshí", meaning: "thirty", tag: "number" },
  { hanzi: "四十", pinyin: "sìshí", meaning: "forty", tag: "number" },
  { hanzi: "五十", pinyin: "wǔshí", meaning: "fifty", tag: "number" },
  { hanzi: "六十", pinyin: "liùshí", meaning: "sixty", tag: "number" },
  { hanzi: "七十", pinyin: "qīshí", meaning: "seventy", tag: "number" },
  { hanzi: "八十", pinyin: "bāshí", meaning: "eighty", tag: "number" },
  { hanzi: "九十", pinyin: "jiǔshí", meaning: "ninety", tag: "number" },
  { hanzi: "一百", pinyin: "yìbǎi", meaning: "one hundred", tag: "number" },
];

// Real KICD look-alike character confusion pairs: a taught family character next to characters
// that LOOK visually similar but are genuinely different, unrelated words — a plausible,
// nameable distractor rather than a random draw, per RIGOR-STANDARDS.md.
interface LookalikeSet {
  correct: string;
  pinyin: string;
  word: string;
  meaning: string;
  distractors: { hanzi: string; pinyin: string; meaning: string }[];
}
const LOOKALIKE_SETS: LookalikeSet[] = [
  {
    correct: "爸",
    pinyin: "bà",
    word: "爸爸",
    meaning: "dad",
    distractors: [
      { hanzi: "把", pinyin: "bǎ", meaning: "(grammar word marking an object, e.g. 把书 'the book')" },
      { hanzi: "吧", pinyin: "ba", meaning: "(suggestion particle, e.g. 'let's...')" },
      { hanzi: "芭", pinyin: "bā", meaning: "(as in 芭蕾, 'ballet')" },
    ],
  },
  {
    correct: "哥",
    pinyin: "gē",
    word: "哥哥",
    meaning: "older brother",
    distractors: [
      { hanzi: "可", pinyin: "kě", meaning: "can / may" },
      { hanzi: "何", pinyin: "hé", meaning: "what / which" },
    ],
  },
  {
    correct: "妹",
    pinyin: "mèi",
    word: "妹妹",
    meaning: "younger sister",
    distractors: [
      { hanzi: "末", pinyin: "mò", meaning: "end / tip" },
      { hanzi: "未", pinyin: "wèi", meaning: "not yet" },
    ],
  },
];
const ALL_LOOKALIKE_DISTRACTORS = LOOKALIKE_SETS.flatMap((s) => s.distractors);

// "X 今年 ___ 岁。" (X is __ years old this year) — the taught number word blanked; plus two
// entries blanking the taught family word instead.
const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Māma jīnnián ", after: " suì.", answer: "sānshí", gloss: "妈妈今年三十岁。— Mom is thirty years old this year." },
  { before: "Bàba jīnnián ", after: " suì.", answer: "sìshí", gloss: "爸爸今年四十岁。— Dad is forty years old this year." },
  { before: "Gēge jīnnián ", after: " suì.", answer: "wǔshí", gloss: "哥哥今年五十岁。— Older brother is fifty years old this year." },
  { before: "Jiějie jīnnián ", after: " suì.", answer: "liùshí", gloss: "姐姐今年六十岁。— Older sister is sixty years old this year." },
  { before: "Dìdi jīnnián ", after: " suì.", answer: "qīshí", gloss: "弟弟今年七十岁。— Younger brother is seventy years old this year." },
  { before: "Mèimei jīnnián ", after: " suì.", answer: "bāshí", gloss: "妹妹今年八十岁。— Younger sister is eighty years old this year." },
  { before: "Māma jīnnián ", after: " suì.", answer: "jiǔshí", gloss: "妈妈今年九十岁。— Mom is ninety years old this year." },
  { before: "Bàba jīnnián ", after: " suì.", answer: "yìbǎi", gloss: "爸爸今年一百岁。— Dad is one hundred years old this year." },
  { before: "", after: " jīnnián wǔshí suì.", answer: "bàba", gloss: "爸爸今年五十岁。— Dad is fifty years old this year." },
  { before: "", after: " jīnnián liùshí suì.", answer: "māma", gloss: "妈妈今年六十岁。— Mom is sixty years old this year." },
];

// "X 今年 NUM 岁。" as ordering chunks, varying the family member and the number.
const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["妈妈", "今年", "三十", "岁。"], sentence: "妈妈今年三十岁。", gloss: "Māma jīnnián sānshí suì. — Mom is thirty years old this year." },
  { chunks: ["爸爸", "今年", "四十", "岁。"], sentence: "爸爸今年四十岁。", gloss: "Bàba jīnnián sìshí suì. — Dad is forty years old this year." },
  { chunks: ["哥哥", "今年", "五十", "岁。"], sentence: "哥哥今年五十岁。", gloss: "Gēge jīnnián wǔshí suì. — Older brother is fifty years old this year." },
  { chunks: ["姐姐", "今年", "六十", "岁。"], sentence: "姐姐今年六十岁。", gloss: "Jiějie jīnnián liùshí suì. — Older sister is sixty years old this year." },
  { chunks: ["弟弟", "今年", "七十", "岁。"], sentence: "弟弟今年七十岁。", gloss: "Dìdi jīnnián qīshí suì. — Younger brother is seventy years old this year." },
  { chunks: ["妹妹", "今年", "八十", "岁。"], sentence: "妹妹今年八十岁。", gloss: "Mèimei jīnnián bāshí suì. — Younger sister is eighty years old this year." },
  { chunks: ["妈妈", "今年", "九十", "岁。"], sentence: "妈妈今年九十岁。", gloss: "Māma jīnnián jiǔshí suì. — Mom is ninety years old this year." },
  { chunks: ["爸爸", "今年", "一百", "岁。"], sentence: "爸爸今年一百岁。", gloss: "Bàba jīnnián yìbǎi suì. — Dad is one hundred years old this year." },
  { chunks: ["哥哥", "今年", "三十", "岁。"], sentence: "哥哥今年三十岁。", gloss: "Gēge jīnnián sānshí suì. — Older brother is thirty years old this year." },
  { chunks: ["姐姐", "今年", "四十", "岁。"], sentence: "姐姐今年四十岁。", gloss: "Jiějie jīnnián sìshí suì. — Older sister is forty years old this year." },
];

const MATCH_OPENERS = [
  "Match each family word or number to its correct English meaning",
  "Pair every written family term or number below with its meaning",
  "Connect each character group to the English meaning it matches",
  "Work out what each family word or number means, then match it",
  "Line up each written term below with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your family description stays accurate.",
  "before you write it into a paragraph.",
  "to make sure your character choice reflects the right meaning.",
  "so a reader recognizes each character correctly.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a Family Member or a Number",
  "Group these written terms under Family Member or Number",
  "Decide whether each item is a Family Member or a Number, then sort it",
  "Classify each character group as a Family Member or a Number Word",
  "Organize these words into Family Member or Number groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a clear family description.",
  "so your written paragraph stays organized.",
  "before drafting sentences about your family.",
  "to check you recognize each character correctly.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const LOOKALIKE_OPENERS = [
  "Several characters look similar on paper — which one correctly means",
  "A learner is writing about family and must pick the right character for",
  "These characters are easy to mix up when handwriting — which one means",
  "To describe a family member accurately, which character means",
  "Look closely at the strokes: which character correctly means",
];
const LOOKALIKE_CLOSERS = ['?', ", not a look-alike character?", " when writing about family?", " and not a similar-looking word?"];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence",
  "Type the missing pinyin word that completes this sentence correctly",
  "Complete the sentence by filling in the missing pinyin word",
  "Write the correct pinyin word in the blank to finish the sentence",
  "Supply the missing pinyin word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional).",
  "to keep your family description accurate.",
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
  "for a clear family description.",
  "so a reader can follow it clearly.",
  "before writing it into your paragraph.",
  "to keep the sentence coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const familyWriting: Skill = {
  id: "g6-ma-w-family",
  code: "W.2",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing about family members",
  description: "Character recognition — including distinguishing look-alike characters — and simple descriptive writing about family members.",
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
        hint: "Family titles are written as a doubled character, e.g. 妹妹 (younger sister) doubles 妹.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const family = shuffle(rng, VOCAB.filter((v) => v.tag === "family")).slice(0, 4);
      const numbers = shuffle(rng, VOCAB.filter((v) => v.tag === "number")).slice(0, 4);
      const items = shuffle(rng, [...family, ...numbers]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "family", label: "Family Member" },
          { id: "number", label: "Number" },
        ],
        correctBucket,
        hint: "Family words name a relative; number words count something, like an age.",
        explanation: items.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "family" ? "family member" : "number"}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const set = randChoice(rng, LOOKALIKE_SETS);
      const ownDistractors = shuffle(rng, set.distractors);
      const otherDistractors = shuffle(rng, ALL_LOOKALIKE_DISTRACTORS.filter((d) => !set.distractors.some((sd) => sd.hanzi === d.hanzi)));
      const distractors = [...ownDistractors, ...otherDistractors].slice(0, 3);
      const choices = shuffle(rng, Array.from(new Set([set.correct, ...distractors.map((d) => d.hanzi)])));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, LOOKALIKE_OPENERS)} "${set.meaning}"${randChoice(rng, LOOKALIKE_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(set.correct),
        layout: "list",
        hint: "The other characters are real, different words that just look similar in handwriting — check the exact strokes.",
        explanation: `"${set.correct} (${set.pinyin})" is the character used in ${set.word}, meaning "${set.meaning}". The others are unrelated look-alike characters: ${set.distractors.map((d) => `${d.hanzi} (${d.pinyin}) means "${d.meaning}"`).join("; ")}.`,
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
        hint: "This sentence follows the pattern X 今年……岁 (X is … years old this year).",
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
      hint: "Name the family member first, then say 今年 (this year), then give the number of years and 岁。",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
