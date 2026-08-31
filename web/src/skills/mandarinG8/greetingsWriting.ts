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
  { before: "Nín hǎo, wǒ ", after: " Wáng.", answer: "xìng", gloss: "您好，我姓王。 (Hello, my surname is Wang.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我是肯尼亚人，", "很高兴", "认识您。"], sentence: "我是肯尼亚人，很高兴认识您。", gloss: "I am Kenyan, pleased to meet you." },
];

export const greetingsWriting: Skill = {
  id: "g8-ma-w-greetings",
  code: "W.1",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Formal greetings and introductions",
  description: "Guided writing — spelling, word order, and vocabulary for formal greetings.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "match", "categorize"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to form a correct Mandarin sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "State who you are first, then greet the other person.",
        explanation: `The correct sentence is: "${set.sentence}" — meaning "${set.gloss}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: "Match each formal greeting expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Greetings differ by time of day; questions ask for a name, country, or age.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const greetings = shuffle(rng, VOCAB.filter((v) => v.tag === "greeting")).slice(0, 3);
      const questions = shuffle(rng, VOCAB.filter((v) => v.tag === "question")).slice(0, 3);
      const chosen = shuffle(rng, [...greetings, ...questions]);
      const correctBucket: Record<string, string> = {};
      for (const v of greetings) correctBucket[v.hanzi] = "greeting";
      for (const v of questions) correctBucket[v.hanzi] = "question";

      return {
        kind: "categorize",
        prompt: "Sort each expression as a greeting or a question.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "question", label: "Question" },
        ],
        correctBucket,
        hint: "Questions end with 吗/呢 or a question word, and usually end in '？'.",
        explanation: [...greetings, ...questions].map((v) => `"${v.hanzi}" is a ${correctBucket[v.hanzi]}.`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing pinyin word to complete the sentence (tone marks optional).",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: pinyinAccepted(item.answer),
      inputMode: "text",
      hint: "Think about how you introduce your surname formally.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
