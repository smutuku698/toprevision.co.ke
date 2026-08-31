import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "greeting" | "question" }[] = [
  { hanzi: "您好", pinyin: "nín hǎo", meaning: "Hello (formal, to one person)", tag: "greeting" },
  { hanzi: "你们好", pinyin: "nǐmen hǎo", meaning: "Hello (to a group)", tag: "greeting" },
  { hanzi: "早上好", pinyin: "zǎoshang hǎo", meaning: "Good morning", tag: "greeting" },
  { hanzi: "下午好", pinyin: "xiàwǔ hǎo", meaning: "Good afternoon", tag: "greeting" },
  { hanzi: "晚上好", pinyin: "wǎnshang hǎo", meaning: "Good evening", tag: "greeting" },
  { hanzi: "晚安", pinyin: "wǎn ān", meaning: "Good night", tag: "greeting" },
  { hanzi: "再见", pinyin: "zàijiàn", meaning: "Goodbye", tag: "greeting" },
  { hanzi: "谢谢", pinyin: "xièxie", meaning: "Thank you", tag: "greeting" },
  { hanzi: "幸会", pinyin: "xìnghuì", meaning: "Pleased to meet you", tag: "greeting" },
  { hanzi: "您贵姓？", pinyin: "nín guì xìng?", meaning: "What is your (honourable) surname?", tag: "question" },
  { hanzi: "你叫什么名字？", pinyin: "nǐ jiào shénme míngzi?", meaning: "What is your name?", tag: "question" },
  { hanzi: "你是哪国人？", pinyin: "nǐ shì nǎ guó rén?", meaning: "Which country are you from?", tag: "question" },
  { hanzi: "你几岁了？", pinyin: "nǐ jǐ suì le?", meaning: "How old are you?", tag: "question" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Nín hǎo, wǒ ",
    after: " Wáng.",
    answer: "xìng",
    gloss: "您好，我姓王。(Nín hǎo, wǒ xìng Wáng.) — Hello, my surname is Wang.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["我是肯尼亚人，", "很高兴", "认识您。"],
    sentence: "我是肯尼亚人，很高兴认识您。",
    gloss: "Wǒ shì Kěnníyà rén, hěn gāoxìng rènshi nín. — I am Kenyan, pleased to meet you.",
  },
];

export const greetingsSpeaking: Skill = {
  id: "g8-ma-ls-greetings",
  code: "LS.1",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Formal greetings and introductions",
  description: "Formal Mandarin greetings, self-introduction, and polite personal questions — oral vocabulary and expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: "Match each Mandarin greeting expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Formal greetings use 您 (nín) instead of 你 (nǐ) to show respect.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const greetings = shuffle(rng, VOCAB.filter((v) => v.tag === "greeting")).slice(0, 4);
      const questions = shuffle(rng, VOCAB.filter((v) => v.tag === "question")).slice(0, 3);
      const items = shuffle(rng, [...greetings, ...questions]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each expression as a Greeting or a Personal Question.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "question", label: "Personal Question" },
        ],
        correctBucket,
        hint: "Greetings are said when meeting someone; questions ask for information back and usually end in 吗/呢 or a question word.",
        explanation: [...greetings, ...questions]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "greeting" ? "greeting" : "personal question"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.meaning !== correct.meaning)).slice(0, 3);
      const choices = shuffle(rng, [correct.meaning, ...distractors.map((d) => d.meaning)]);

      return {
        kind: "multiple-choice",
        prompt: `What does "${correct.hanzi} (${correct.pinyin})" mean?`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether this is said as a greeting or asked as a question.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing pinyin word to complete the sentence (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This word introduces your surname when you say it out loud.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi words to form a correct spoken sentence.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "State who you are first, then say you are pleased to meet the person.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
