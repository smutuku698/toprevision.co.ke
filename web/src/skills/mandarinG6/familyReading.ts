import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

type Tag = "family" | "number" | "phrase";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
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
  { hanzi: "多大了？", pinyin: "duō dà le?", meaning: "how old (are you)?", tag: "phrase" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Bàba jīnnián ", after: " suì.", answer: "wǔshí", gloss: "爸爸今年五十岁。— Dad is fifty years old this year." },
  { before: "Māma jīnnián ", after: " suì.", answer: "sìshí", gloss: "妈妈今年四十岁。— Mom is forty years old this year." },
  { before: "Gēge jīnnián ", after: " suì.", answer: "sānshí", gloss: "哥哥今年三十岁。— Older brother is thirty years old this year." },
  { before: "Jiějie jīnnián ", after: " suì.", answer: "liùshí", gloss: "姐姐今年六十岁。— Older sister is sixty years old this year." },
  { before: "Dìdi jīnnián ", after: " suì.", answer: "sānshí", gloss: "弟弟今年三十岁。— Younger brother is thirty years old this year." },
  { before: "Mèimei jīnnián ", after: " suì.", answer: "sìshí", gloss: "妹妹今年四十岁。— Younger sister is forty years old this year." },
  { before: "Bàba jīnnián ", after: " suì.", answer: "qīshí", gloss: "爸爸今年七十岁。— Dad is seventy years old this year." },
  { before: "Māma jīnnián ", after: " suì.", answer: "bāshí", gloss: "妈妈今年八十岁。— Mom is eighty years old this year." },
  { before: "", after: ", nín duō dà le?", answer: "Bàba", gloss: "爸爸，您多大了？— Dad, how old are you?" },
  { before: "", after: ", nín duō dà le?", answer: "Māma", gloss: "妈妈，您多大了？— Mom, how old are you?" },
  { before: "Nín jīnnián yìbǎi suì. ", after: "", answer: "Duō dà le?", gloss: "您多大了？您今年一百岁。— How old are you? You are one hundred years old this year." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["爸爸", "今年", "五十岁。"], sentence: "爸爸今年五十岁。", gloss: "Bàba jīnnián wǔshí suì. — Dad is fifty this year." },
  { chunks: ["妈妈", "今年", "四十岁。"], sentence: "妈妈今年四十岁。", gloss: "Māma jīnnián sìshí suì. — Mom is forty this year." },
  { chunks: ["哥哥", "今年", "三十岁。"], sentence: "哥哥今年三十岁。", gloss: "Gēge jīnnián sānshí suì. — Older brother is thirty this year." },
  { chunks: ["姐姐", "今年", "三十岁。"], sentence: "姐姐今年三十岁。", gloss: "Jiějie jīnnián sānshí suì. — Older sister is thirty this year." },
  { chunks: ["弟弟", "今年", "三十岁。"], sentence: "弟弟今年三十岁。", gloss: "Dìdi jīnnián sānshí suì. — Younger brother is thirty this year." },
  { chunks: ["妹妹", "今年", "三十岁。"], sentence: "妹妹今年三十岁。", gloss: "Mèimei jīnnián sānshí suì. — Younger sister is thirty this year." },
  { chunks: ["爸爸", "今年", "七十岁。"], sentence: "爸爸今年七十岁。", gloss: "Bàba jīnnián qīshí suì. — Dad is seventy this year." },
  { chunks: ["妈妈", "今年", "八十岁。"], sentence: "妈妈今年八十岁。", gloss: "Māma jīnnián bāshí suì. — Mom is eighty this year." },
  { chunks: ["爸爸，", "您", "多大了？"], sentence: "爸爸，您多大了？", gloss: "Bàba, nín duō dà le? — Dad, how old are you?" },
  { chunks: ["妈妈，", "您", "多大了？"], sentence: "妈妈，您多大了？", gloss: "Māma, nín duō dà le? — Mom, how old are you?" },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} is reading a family register at a steady pace and spots the word",
  "Reading down a family word list quickly but clearly, {name} reaches",
  "{name} is reading a family tree aloud without slowing down and comes to",
  "While reading a family-and-ages chart at a good speed, {name} sees",
  "{name} reads through a list of family words, keeping up the pace, and pauses on",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this family sentence at a steady pace and one word is missing.",
  "Help {name} keep up their reading speed by filling in the missing pinyin word.",
  "{name} reads this sentence quickly but stumbles on a missing word.",
  "To read this sentence smoothly and quickly, {name} needs the missing word.",
  "{name} is reading a family-ages sentence aloud — type the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this sentence at a good pace, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the sentence can be read smoothly and quickly.",
  "{name} wrote this family sentence in pieces before practicing reading speed. Put them in order.",
  "To read this sentence fluently and quickly, {name} first needs the pieces in order.",
  "{name} is timing their reading speed — arrange the pieces into the correct sentence first.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a family word list quickly and sorting words as they go.",
  "Help {name} sort these words while reading through a family register at speed.",
  "{name} is practicing fast, accurate reading by sorting family words and numbers.",
  "As {name} reads each word aloud at a steady pace, sort it into the correct group.",
  "{name} is organizing a family reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each word into its correct group.",
  "Read each word and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the words below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading family words aloud at a steady pace and matching each to its meaning.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practicing quick word recognition by connecting words to their meanings.",
  "As {name} reads each family word aloud, match it to what it means.",
  "{name} is reviewing family vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], name: string): string {
  return randChoice(rng, pool).replace("{name}", name);
}

export const familyReading: Skill = {
  id: "g6-ma-r-family",
  code: "R.2",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: family words and numbers at a steady pace",
  description: "Build word recognition and reading speed with family-member vocabulary and the numbers 30-100.",
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
        hint: "Recognizing a word instantly (without sounding it out letter by letter) is what lets you read at a good pace.",
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
        hint: "Read the whole sentence through once first so the missing word is easier to spot.",
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
        hint: "The family member usually comes first, then the time word, then the age.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const buckets: { id: Tag; label: string }[] = [
        { id: "family", label: "Family member" },
        { id: "number", label: "Number" },
        { id: "phrase", label: "Question phrase" },
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
        hint: "Family members are people; numbers are counting words; the question phrase asks for an age.",
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
      hint: "Recognize each word by sight first, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
