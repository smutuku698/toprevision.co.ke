import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "family" | "number" | "question";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "爸爸", pinyin: "bàba", meaning: "dad", tag: "family" },
  { hanzi: "妈妈", pinyin: "māma", meaning: "mom", tag: "family" },
  { hanzi: "哥哥", pinyin: "gēge", meaning: "older brother", tag: "family" },
  { hanzi: "姐姐", pinyin: "jiějie", meaning: "older sister", tag: "family" },
  { hanzi: "弟弟", pinyin: "dìdi", meaning: "younger brother", tag: "family" },
  { hanzi: "妹妹", pinyin: "mèimei", meaning: "younger sister", tag: "family" },
  { hanzi: "多大了？", pinyin: "duō dà le?", meaning: "how old (are you)?", tag: "question" },
  { hanzi: "三十", pinyin: "sānshí", meaning: "thirty", tag: "number" },
  { hanzi: "四十", pinyin: "sìshí", meaning: "forty", tag: "number" },
  { hanzi: "五十", pinyin: "wǔshí", meaning: "fifty", tag: "number" },
  { hanzi: "六十", pinyin: "liùshí", meaning: "sixty", tag: "number" },
  { hanzi: "七十", pinyin: "qīshí", meaning: "seventy", tag: "number" },
  { hanzi: "八十", pinyin: "bāshí", meaning: "eighty", tag: "number" },
  { hanzi: "九十", pinyin: "jiǔshí", meaning: "ninety", tag: "number" },
  { hanzi: "一百", pinyin: "yìbǎi", meaning: "one hundred", tag: "number" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Tā shì wǒ ", after: ", tā jīnnián sìshí suì.", answer: "bàba", gloss: "他是我爸爸，他今年四十岁。— He is my dad, he is forty this year." },
  { before: "Tā shì wǒ ", after: ", tā jīnnián sānshí suì.", answer: "māma", gloss: "她是我妈妈，她今年三十岁。— She is my mom, she is thirty this year." },
  { before: "Tā shì wǒ ", after: ", tā jīnnián wǔshí suì.", answer: "gēge", gloss: "他是我哥哥，他今年五十岁。— He is my older brother, he is fifty this year." },
  { before: "Tā shì wǒ ", after: ", tā jīnnián liùshí suì.", answer: "jiějie", gloss: "她是我姐姐，她今年六十岁。— She is my older sister, she is sixty this year." },
  { before: "Tā shì wǒ ", after: ", tā jīnnián sānshí suì.", answer: "dìdi", gloss: "他是我弟弟，他今年三十岁。— He is my younger brother, he is thirty this year." },
  { before: "Tā shì wǒ ", after: ", tā jīnnián qīshí suì.", answer: "mèimei", gloss: "她是我妹妹，她今年七十岁。— She is my younger sister, she is seventy this year." },
  { before: "Tā shì wǒ bàba, tā jīnnián ", after: " suì.", answer: "bāshí", gloss: "他是我爸爸，他今年八十岁。— He is my dad, he is eighty this year." },
  { before: "Tā shì wǒ māma, tā jīnnián ", after: " suì.", answer: "jiǔshí", gloss: "她是我妈妈，她今年九十岁。— She is my mom, she is ninety this year." },
  { before: "Tā shì wǒ gēge, tā jīnnián ", after: " suì.", answer: "yìbǎi", gloss: "他是我哥哥，他今年一百岁。— He is my older brother, he is a hundred this year." },
  { before: "Tā shì wǒ dìdi. Tā ", after: "?", answer: "duō dà le", gloss: "他是我弟弟。他多大了？— He is my younger brother. How old is he?" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["他是我爸爸，", "他今年", "五十岁。"], sentence: "他是我爸爸，他今年五十岁。", gloss: "Tā shì wǒ bàba, tā jīnnián wǔshí suì. — He is my dad, he is fifty this year." },
  { chunks: ["她是我妈妈，", "她今年", "四十岁。"], sentence: "她是我妈妈，她今年四十岁。", gloss: "Tā shì wǒ māma, tā jīnnián sìshí suì. — She is my mom, she is forty this year." },
  { chunks: ["他是我哥哥，", "他今年", "三十岁。"], sentence: "他是我哥哥，他今年三十岁。", gloss: "Tā shì wǒ gēge, tā jīnnián sānshí suì. — He is my older brother, he is thirty this year." },
  { chunks: ["她是我姐姐，", "她今年", "六十岁。"], sentence: "她是我姐姐，她今年六十岁。", gloss: "Tā shì wǒ jiějie, tā jīnnián liùshí suì. — She is my older sister, she is sixty this year." },
  { chunks: ["他是我弟弟，", "他今年", "七十岁。"], sentence: "他是我弟弟，他今年七十岁。", gloss: "Tā shì wǒ dìdi, tā jīnnián qīshí suì. — He is my younger brother, he is seventy this year." },
  { chunks: ["她是我妹妹，", "她今年", "八十岁。"], sentence: "她是我妹妹，她今年八十岁。", gloss: "Tā shì wǒ mèimei, tā jīnnián bāshí suì. — She is my younger sister, she is eighty this year." },
  { chunks: ["他是我爸爸，", "他今年", "九十岁。"], sentence: "他是我爸爸，他今年九十岁。", gloss: "Tā shì wǒ bàba, tā jīnnián jiǔshí suì. — He is my dad, he is ninety this year." },
  { chunks: ["她是我妈妈，", "她今年", "一百岁。"], sentence: "她是我妈妈，她今年一百岁。", gloss: "Tā shì wǒ māma, tā jīnnián yìbǎi suì. — She is my mom, she is a hundred this year." },
  { chunks: ["他多大了？", "他是我哥哥，", "他今年五十岁。"], sentence: "他多大了？他是我哥哥，他今年五十岁。", gloss: "Tā duō dà le? Tā shì wǒ gēge, tā jīnnián wǔshí suì. — How old is he? He is my older brother, he is fifty this year." },
  { chunks: ["她多大了？", "她是我姐姐，", "她今年六十岁。"], sentence: "她多大了？她是我姐姐，她今年六十岁。", gloss: "Tā duō dà le? Tā shì wǒ jiějie, tā jīnnián liùshí suì. — How old is she? She is my older sister, she is sixty this year." },
];

const MATCH_OPENERS = [
  "Match each family word to its correct English meaning.",
  "Pair up every word below with what it means in English.",
  "Connect each term to its correct translation.",
  "Find the right English meaning for each item shown.",
  "Look at each word and match it to its meaning.",
];
const MATCH_CLOSERS = [
  "Say each word aloud in your head as you match it.",
  "Match every item before you check your answers.",
  "Think about the pinyin pronunciation as you decide.",
  "Take your time with each pair.",
];

const CATEGORIZE_OPENERS = [
  "Sort each word below into the correct group.",
  "Decide which category each item belongs to.",
  "Group these words by whether they name a family member or a number.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about what kind of word each one is.",
  "Some name a relative, others are counting words.",
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
  "Think about which part comes first when talking about a relative.",
  "Check the meaning of each chunk before deciding its place.",
  "The person being described usually comes first.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, is practising an oral presentation about family and says "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `While describing a family photo in ${p}, ${n} points and says "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} is listening to a classmate's family presentation and hears the word "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During a Mandarin oral test in ${p}, ${n} is asked to explain what "${hanzi} (${pinyin})" means.`,
  (n, p, hanzi, pinyin) => `${n}'s teacher writes "${hanzi} (${pinyin})" on the board during a lesson about family.`,
];
const MC_CLOSERS = [
  "What does this word mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const familySpeaking: Skill = {
  id: "g6-ma-ls-family",
  code: "LS.2",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "Family",
  description: "Family member words, the age question, and numbers 30-100 — oral vocabulary for describing family in a presentation.",
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
        hint: "哥哥/姐姐 are OLDER siblings; 弟弟/妹妹 are YOUNGER siblings.",
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
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "family", label: "Family Member" },
          { id: "number", label: "Number" },
        ],
        correctBucket,
        hint: "Family words name a relative; number words are used to say an age.",
        explanation: [...family, ...numbers]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "family" ? "family member word" : "number"}.`)
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
        hint: "Think about whether this word names a relative, asks a question, or is a number.",
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
        hint: "This sentence follows the pattern 他/她是我……，他/她今年……岁 (he/she is my…, he/she is … years old this year).",
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
      hint: "Name who the person is first, then give their age.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
