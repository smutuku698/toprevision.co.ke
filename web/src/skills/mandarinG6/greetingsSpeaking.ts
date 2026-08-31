import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "pronoun" | "greeting" | "introduction" | "number";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "我", pinyin: "wǒ", meaning: "I / me", tag: "pronoun" },
  { hanzi: "你", pinyin: "nǐ", meaning: "you (informal)", tag: "pronoun" },
  { hanzi: "您", pinyin: "nín", meaning: "you (formal)", tag: "pronoun" },
  { hanzi: "他", pinyin: "tā", meaning: "he / him", tag: "pronoun" },
  { hanzi: "她", pinyin: "tā", meaning: "she / her", tag: "pronoun" },
  { hanzi: "早上好", pinyin: "zǎoshang hǎo", meaning: "good morning", tag: "greeting" },
  { hanzi: "上午好", pinyin: "shàngwǔ hǎo", meaning: "good morning (late morning)", tag: "greeting" },
  { hanzi: "中午好", pinyin: "zhōngwǔ hǎo", meaning: "good midday", tag: "greeting" },
  { hanzi: "下午好", pinyin: "xiàwǔ hǎo", meaning: "good afternoon", tag: "greeting" },
  { hanzi: "晚上好", pinyin: "wǎnshang hǎo", meaning: "good evening", tag: "greeting" },
  { hanzi: "晚安", pinyin: "wǎn ān", meaning: "good night", tag: "greeting" },
  { hanzi: "我叫……", pinyin: "wǒ jiào……", meaning: "my name is…", tag: "introduction" },
  { hanzi: "我今年……岁", pinyin: "wǒ jīnnián……suì", meaning: "I am … years old this year", tag: "introduction" },
  { hanzi: "他是我的朋友", pinyin: "tā shì wǒ de péngyou", meaning: "he is my friend", tag: "introduction" },
  { hanzi: "你/您呢？", pinyin: "nǐ/nín ne?", meaning: "and you?", tag: "introduction" },
  { hanzi: "一", pinyin: "yī", meaning: "one", tag: "number" },
  { hanzi: "二", pinyin: "èr", meaning: "two", tag: "number" },
  { hanzi: "三", pinyin: "sān", meaning: "three", tag: "number" },
  { hanzi: "四", pinyin: "sì", meaning: "four", tag: "number" },
  { hanzi: "五", pinyin: "wǔ", meaning: "five", tag: "number" },
  { hanzi: "六", pinyin: "liù", meaning: "six", tag: "number" },
  { hanzi: "七", pinyin: "qī", meaning: "seven", tag: "number" },
  { hanzi: "八", pinyin: "bā", meaning: "eight", tag: "number" },
  { hanzi: "九", pinyin: "jiǔ", meaning: "nine", tag: "number" },
  { hanzi: "十", pinyin: "shí", meaning: "ten", tag: "number" },
  { hanzi: "十一", pinyin: "shíyī", meaning: "eleven", tag: "number" },
  { hanzi: "十二", pinyin: "shí'èr", meaning: "twelve", tag: "number" },
  { hanzi: "十三", pinyin: "shísān", meaning: "thirteen", tag: "number" },
  { hanzi: "十四", pinyin: "shísì", meaning: "fourteen", tag: "number" },
  { hanzi: "十五", pinyin: "shíwǔ", meaning: "fifteen", tag: "number" },
  { hanzi: "十六", pinyin: "shíliù", meaning: "sixteen", tag: "number" },
  { hanzi: "十七", pinyin: "shíqī", meaning: "seventeen", tag: "number" },
  { hanzi: "十八", pinyin: "shíbā", meaning: "eighteen", tag: "number" },
  { hanzi: "十九", pinyin: "shíjiǔ", meaning: "nineteen", tag: "number" },
  { hanzi: "二十", pinyin: "èrshí", meaning: "twenty", tag: "number" },
  { hanzi: "三十", pinyin: "sānshí", meaning: "thirty", tag: "number" },
  { hanzi: "四十", pinyin: "sìshí", meaning: "forty", tag: "number" },
  { hanzi: "五十", pinyin: "wǔshí", meaning: "fifty", tag: "number" },
];

const TONGUE_TWISTER = {
  hanzi: "四是四，十是十，十四是十四，四不是十，十不是四。",
  pinyin: "Sì shì sì, shí shì shí, shísì shì shísì, sì bùshì shí, shí bùshì sì.",
  meaning: "Four is four, ten is ten, fourteen is fourteen; four is not ten, ten is not four.",
};

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ ", after: " Amina, wǒ jīnnián shí'èr suì.", answer: "jiào", gloss: "我叫Amina，我今年十二岁。— My name is Amina, I am twelve years old this year." },
  { before: "Wǒ ", after: " Brian, wǒ jīnnián shísān suì.", answer: "jiào", gloss: "我叫Brian，我今年十三岁。— My name is Brian, I am thirteen years old this year." },
  { before: "Wǒ ", after: " Chebet, wǒ jīnnián shíyī suì.", answer: "jiào", gloss: "我叫Chebet，我今年十一岁。— My name is Chebet, I am eleven years old this year." },
  { before: "Wǒ jiào Dennis, wǒ jīnnián shísì ", after: ".", answer: "suì", gloss: "我叫Dennis，我今年十四岁。— My name is Dennis, I am fourteen years old this year." },
  { before: "Wǒ jiào Faith, wǒ jīnnián shí ", after: ".", answer: "suì", gloss: "我叫Faith，我今年十岁。— My name is Faith, I am ten years old this year." },
  { before: "Wǒ jiào Gideon, wǒ jīnnián shíwǔ ", after: ".", answer: "suì", gloss: "我叫Gideon，我今年十五岁。— My name is Gideon, I am fifteen years old this year." },
  { before: "", after: " hǎo, lǎoshī! Wǒ jiào Halima.", answer: "Zǎoshang", gloss: "早上好，老师！我叫Halima。— Good morning, teacher! My name is Halima." },
  { before: "", after: " hǎo! Wǒ jiào Ian, wǒ jīnnián shí'èr suì.", answer: "Wǎnshang", gloss: "晚上好！我叫Ian，我今年十二岁。— Good evening! My name is Ian, I am twelve years old this year." },
  { before: "", after: " jiào Joyce, wǒ jīnnián shísān suì.", answer: "Wǒ", gloss: "我叫Joyce，我今年十三岁。— My name is Joyce, I am thirteen years old this year." },
  { before: "Wǒ jiào Kevin, wǒ jīnnián shísì suì. Nǐ ", after: "?", answer: "ne", gloss: "我叫Kevin，我今年十四岁。你呢？— My name is Kevin, I am fourteen years old this year. And you?" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我叫Lilian，", "我今年", "十二岁。"], sentence: "我叫Lilian，我今年十二岁。", gloss: "Wǒ jiào Lilian, wǒ jīnnián shí'èr suì. — My name is Lilian, I am twelve years old this year." },
  { chunks: ["我叫Mohammed，", "我今年", "十三岁。"], sentence: "我叫Mohammed，我今年十三岁。", gloss: "Wǒ jiào Mohammed, wǒ jīnnián shísān suì. — My name is Mohammed, I am thirteen years old this year." },
  { chunks: ["我叫Naomi，", "我今年十一岁。", "你呢？"], sentence: "我叫Naomi，我今年十一岁。你呢？", gloss: "Wǒ jiào Naomi, wǒ jīnnián shíyī suì. Nǐ ne? — My name is Naomi, I am eleven this year. And you?" },
  { chunks: ["早上好，", "我叫Otieno，", "我今年十四岁。"], sentence: "早上好，我叫Otieno，我今年十四岁。", gloss: "Zǎoshang hǎo, wǒ jiào Otieno, wǒ jīnnián shísì suì. — Good morning, my name is Otieno, I am fourteen this year." },
  { chunks: ["晚上好，", "我叫Peris，", "我今年十岁。"], sentence: "晚上好，我叫Peris，我今年十岁。", gloss: "Wǎnshang hǎo, wǒ jiào Peris, wǒ jīnnián shí suì. — Good evening, my name is Peris, I am ten this year." },
  { chunks: ["我叫Wanjiru，", "我今年十五岁。", "您呢？"], sentence: "我叫Wanjiru，我今年十五岁。您呢？", gloss: "Wǒ jiào Wanjiru, wǒ jīnnián shíwǔ suì. Nín ne? — My name is Wanjiru, I am fifteen this year. And you (formal)?" },
  { chunks: ["下午好，", "我叫Amina，", "我今年十三岁。"], sentence: "下午好，我叫Amina，我今年十三岁。", gloss: "Xiàwǔ hǎo, wǒ jiào Amina, wǒ jīnnián shísān suì. — Good afternoon, my name is Amina, I am thirteen this year." },
  { chunks: ["他是我的朋友，", "他今年十六岁。"], sentence: "他是我的朋友，他今年十六岁。", gloss: "Tā shì wǒ de péngyou, tā jīnnián shíliù suì. — He is my friend, he is sixteen years old this year." },
  { chunks: ["中午好，", "我叫Brian，", "我今年十七岁。"], sentence: "中午好，我叫Brian，我今年十七岁。", gloss: "Zhōngwǔ hǎo, wǒ jiào Brian, wǒ jīnnián shíqī suì. — Good midday, my name is Brian, I am seventeen this year." },
  { chunks: ["晚安，", "我叫Chebet，", "我今年十八岁。"], sentence: "晚安，我叫Chebet，我今年十八岁。", gloss: "Wǎn ān, wǒ jiào Chebet, wǒ jīnnián shíbā suì. — Good night, my name is Chebet, I am eighteen this year." },
];

const MATCH_OPENERS = [
  "Match each Mandarin word below to its correct English meaning.",
  "Pair up every expression with what it means in English.",
  "Connect each term to its correct translation.",
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
  "Group these greeting words, numbers, and introduction phrases correctly.",
  "Place each item into its matching bucket.",
  "Look at each word and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about when and how each expression is used.",
  "Some are said as greetings, some are numbers, and some introduce someone.",
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
  "Think about which part comes first when introducing yourself.",
  "Check the meaning of each chunk before deciding its place.",
  "The subject usually comes first in these sentences.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, hears a classmate say "${hanzi} (${pinyin})" during Mandarin class.`,
  (n, p, hanzi, pinyin) => `While practising Mandarin greetings in ${p}, ${n} writes down the phrase "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n} is listening to a Mandarin audio clip and hears the words "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During a school visit in ${p}, ${n} greets a Chinese visitor by saying "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher points to a flashcard showing "${hanzi} (${pinyin})" on the board.`,
];
const MC_CLOSERS = [
  "What does this expression mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const greetingsSpeaking: Skill = {
  id: "g6-ma-ls-greetings",
  code: "LS.1",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "Greetings and introductions",
  description: "Basic Mandarin greetings, pronouns, self-introduction, and numbers 1-50 — oral vocabulary and expressions.",
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
        hint: "Formal 您 is used to show respect; 你 is casual. Numbers 11-19 follow the pattern 十 + digit.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const greetings = shuffle(rng, VOCAB.filter((v) => v.tag === "greeting")).slice(0, 3);
      const numbers = shuffle(rng, VOCAB.filter((v) => v.tag === "number")).slice(0, 4);
      const introductions = shuffle(rng, VOCAB.filter((v) => v.tag === "introduction")).slice(0, 3);
      const items = shuffle(rng, [...greetings, ...numbers, ...introductions]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "number", label: "Number" },
          { id: "introduction", label: "Introduction Phrase" },
        ],
        correctBucket,
        hint: "Greetings are said when meeting someone; numbers count things; introduction phrases give a name, age, or ask about the other person.",
        explanation: [...greetings, ...numbers, ...introductions]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "greeting" ? "greeting" : v.tag === "number" ? "number" : "introduction phrase"}.`)
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

      let explanation = `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`;
      if (correct.tag === "number" && ["四", "十", "十四"].includes(correct.hanzi)) {
        explanation += ` Fun fact: Mandarin has a tongue-twister using this number — "${TONGUE_TWISTER.hanzi}" (${TONGUE_TWISTER.pinyin}) — "${TONGUE_TWISTER.meaning}"`;
      }

      return {
        kind: "multiple-choice",
        prompt: `${scenario} ${randChoice(rng, MC_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether this is a greeting, a pronoun, a number, or an introduction phrase.",
        explanation,
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
        hint: "This sentence follows the pattern 我叫……, 我今年……岁 (my name is…, I am … years old this year).",
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
      hint: "State who you are first, then your age, then any question or extra detail.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
