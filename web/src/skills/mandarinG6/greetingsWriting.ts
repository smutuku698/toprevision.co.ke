import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.1 "Greetings" — focus: writing mechanics (spelling) and paragraph
// writing (organisation, coherence) for greetings, self-introductions, and numbers 1-50 (here
// numbers 1-10, the given vocabulary set). KIQ: "How can one ensure clarity when writing texts?"

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "pronoun" | "greeting" | "number" }[] = [
  { hanzi: "我", pinyin: "wǒ", meaning: "I/me", tag: "pronoun" },
  { hanzi: "你", pinyin: "nǐ", meaning: "you (informal)", tag: "pronoun" },
  { hanzi: "您", pinyin: "nín", meaning: "you (formal)", tag: "pronoun" },
  { hanzi: "他", pinyin: "tā", meaning: "he/him", tag: "pronoun" },
  { hanzi: "她", pinyin: "tā", meaning: "she/her", tag: "pronoun" },
  { hanzi: "早上好", pinyin: "zǎoshang hǎo", meaning: "good morning", tag: "greeting" },
  { hanzi: "上午好", pinyin: "shàngwǔ hǎo", meaning: "good morning (late morning)", tag: "greeting" },
  { hanzi: "中午好", pinyin: "zhōngwǔ hǎo", meaning: "good midday", tag: "greeting" },
  { hanzi: "下午好", pinyin: "xiàwǔ hǎo", meaning: "good afternoon", tag: "greeting" },
  { hanzi: "晚上好", pinyin: "wǎnshang hǎo", meaning: "good evening", tag: "greeting" },
  { hanzi: "晚安", pinyin: "wǎn ān", meaning: "good night", tag: "greeting" },
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
];

// "Wǒ jīnnián ___ suì." (我今年……岁 — I am … years old this year) with each number blanked.
const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ jīnnián ", after: " suì.", answer: "yī", gloss: "我今年一岁。— I am one year old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "èr", gloss: "我今年二岁。— I am two years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "sān", gloss: "我今年三岁。— I am three years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "sì", gloss: "我今年四岁。— I am four years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "wǔ", gloss: "我今年五岁。— I am five years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "liù", gloss: "我今年六岁。— I am six years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "qī", gloss: "我今年七岁。— I am seven years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "bā", gloss: "我今年八岁。— I am eight years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "jiǔ", gloss: "我今年九岁。— I am nine years old this year." },
  { before: "Wǒ jīnnián ", after: " suì.", answer: "shí", gloss: "我今年十岁。— I am ten years old this year." },
];

// "我叫 [name]，我今年 [number] 岁。" — name-plus-age self-introduction, varied by name and number.
const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我叫王芳，", "我今年", "一", "岁。"], sentence: "我叫王芳，我今年一岁。", gloss: "Wǒ jiào Wáng Fāng, wǒ jīnnián yī suì. — My name is Wang Fang, I am one year old this year." },
  { chunks: ["我叫李明，", "我今年", "二", "岁。"], sentence: "我叫李明，我今年二岁。", gloss: "Wǒ jiào Lǐ Míng, wǒ jīnnián èr suì. — My name is Li Ming, I am two years old this year." },
  { chunks: ["我叫陈丽，", "我今年", "三", "岁。"], sentence: "我叫陈丽，我今年三岁。", gloss: "Wǒ jiào Chén Lì, wǒ jīnnián sān suì. — My name is Chen Li, I am three years old this year." },
  { chunks: ["我叫张伟，", "我今年", "四", "岁。"], sentence: "我叫张伟，我今年四岁。", gloss: "Wǒ jiào Zhāng Wěi, wǒ jīnnián sì suì. — My name is Zhang Wei, I am four years old this year." },
  { chunks: ["我叫林娜，", "我今年", "五", "岁。"], sentence: "我叫林娜，我今年五岁。", gloss: "Wǒ jiào Lín Nà, wǒ jīnnián wǔ suì. — My name is Lin Na, I am five years old this year." },
  { chunks: ["我叫黄强，", "我今年", "六", "岁。"], sentence: "我叫黄强，我今年六岁。", gloss: "Wǒ jiào Huáng Qiáng, wǒ jīnnián liù suì. — My name is Huang Qiang, I am six years old this year." },
  { chunks: ["我叫刘洋，", "我今年", "七", "岁。"], sentence: "我叫刘洋，我今年七岁。", gloss: "Wǒ jiào Liú Yáng, wǒ jīnnián qī suì. — My name is Liu Yang, I am seven years old this year." },
  { chunks: ["我叫赵婷，", "我今年", "八", "岁。"], sentence: "我叫赵婷，我今年八岁。", gloss: "Wǒ jiào Zhào Tíng, wǒ jīnnián bā suì. — My name is Zhao Ting, I am eight years old this year." },
  { chunks: ["我叫周杰，", "我今年", "九", "岁。"], sentence: "我叫周杰，我今年九岁。", gloss: "Wǒ jiào Zhōu Jié, wǒ jīnnián jiǔ suì. — My name is Zhou Jie, I am nine years old this year." },
  { chunks: ["我叫吴敏，", "我今年", "十", "岁。"], sentence: "我叫吴敏，我今年十岁。", gloss: "Wǒ jiào Wú Mǐn, wǒ jīnnián shí suì. — My name is Wu Min, I am ten years old this year." },
];

const MATCH_OPENERS = [
  "Match each greeting, pronoun, or number to its correct English meaning",
  "Pair every written expression below with the meaning it stands for",
  "Connect each Mandarin word or phrase to the English meaning it matches",
  "Work out what each greeting, pronoun, or number means, then match it",
  "Line up each expression below with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your writing stays clear and unambiguous.",
  "before you use it in a written introduction.",
  "to make sure your spelling reflects the right meaning.",
  "so a reader can follow your writing without confusion.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a Pronoun, a Greeting, or a Number",
  "Group these written expressions under Pronoun, Greeting, or Number",
  "Decide whether each item is a Pronoun, a Greeting, or a Number, then sort it",
  "Classify each expression as a Pronoun, a Greeting, or a Number Word",
  "Organize these words into Pronoun, Greeting, or Number groups",
];
const CATEGORIZE_CLOSERS = [
  "to keep your writing well organized.",
  "so your paragraph stays clearly structured.",
  "before drafting a written introduction paragraph.",
  "to check you understand each word's role in a sentence.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const MC_OPENERS = [
  "Which written word correctly means",
  "A learner drafting a greeting needs the exact word that means",
  "To keep an introduction paragraph accurate, which word means",
  "Which of these words correctly spells out",
  "For clear written Mandarin, which expression means",
];
const MC_CLOSERS = ['?', ", exactly?", " in writing?", " when you write it down?"];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence",
  "Type the missing pinyin word that completes this sentence correctly",
  "Complete the sentence by filling in the missing pinyin word",
  "Write the correct pinyin word in the blank to finish the sentence",
  "Supply the missing pinyin word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional).",
  "to keep your writing accurate.",
  "so the sentence is spelled correctly.",
  "before checking your written work.",
];
const FILL_PROMPTS = composePrompts(FILL_OPENERS, FILL_CLOSERS);

const ORDER_OPENERS = [
  "Arrange the hanzi pieces to form a correctly written sentence",
  "Put these hanzi phrases in the right order to build a clear sentence",
  "Sequence the hanzi chunks so the written sentence makes sense",
  "Reorder these pieces to write a grammatically correct sentence",
  "Work out the correct word order, then arrange the hanzi pieces",
];
const ORDER_CLOSERS = [
  "for a well-organized introduction.",
  "so a reader can follow it clearly.",
  "before writing it into your paragraph.",
  "to keep the sentence coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const greetingsWriting: Skill = {
  id: "g6-ma-w-greetings",
  code: "W.1",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing greetings, introductions, and numbers",
  description: "Writing mechanics (spelling) and paragraph organisation for greetings, self-introductions, and numbers 1-10.",
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
        hint: "Time-of-day greetings all end in 好 (hǎo); pronouns swap for who is speaking or being spoken to.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const pronouns = shuffle(rng, VOCAB.filter((v) => v.tag === "pronoun")).slice(0, 3);
      const greetings = shuffle(rng, VOCAB.filter((v) => v.tag === "greeting")).slice(0, 3);
      const numbers = shuffle(rng, VOCAB.filter((v) => v.tag === "number")).slice(0, 3);
      const items = shuffle(rng, [...pronouns, ...greetings, ...numbers]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "pronoun", label: "Pronoun" },
          { id: "greeting", label: "Greeting" },
          { id: "number", label: "Number" },
        ],
        correctBucket,
        hint: "Pronouns name who is speaking or listening; greetings are said on meeting; numbers count.",
        explanation: items.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.hanzi, ...distractors.map((d) => d.hanzi)])));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_OPENERS)} "${correct.meaning}"${randChoice(rng, MC_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correct.hanzi),
        layout: "list",
        hint: "Check whether the meaning needs a pronoun, a time-of-day greeting, or a number.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" is the word that means "${correct.meaning}".`,
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
        hint: "This blank is the number word in 我今年……岁 (I am … years old this year).",
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
      hint: "State your name first with 我叫……, then give your age with 我今年……岁。",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
