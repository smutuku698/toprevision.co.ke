import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "greeting" | "question" }[] = [
  { hanzi: "吃了吗", pinyin: "chīle ma", meaning: "Have you eaten? (casual greeting)", tag: "greeting" },
  { hanzi: "你今天怎么样", pinyin: "nǐ jīntiān zěnmeyàng", meaning: "How are you today?", tag: "greeting" },
  { hanzi: "你最近怎么样", pinyin: "nǐ zuìjìn zěnmeyàng", meaning: "How have you been recently?", tag: "greeting" },
  { hanzi: "最近好吗", pinyin: "zuìjìn hǎo ma", meaning: "Have things been good recently?", tag: "greeting" },
  { hanzi: "大家好", pinyin: "dàjiā hǎo", meaning: "Hello everyone", tag: "greeting" },
  { hanzi: "你叫什么名字", pinyin: "nǐ jiào shénme míngzi", meaning: "What is your name?", tag: "question" },
  { hanzi: "你多大了", pinyin: "nǐ duō dà le", meaning: "How old are you?", tag: "question" },
  { hanzi: "你住在哪儿", pinyin: "nǐ zhù zài nǎr", meaning: "Where do you live?", tag: "question" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Dàjiā hǎo, wǒ ", after: " Mǎlì.", answer: "jiào", gloss: "大家好，我叫玛丽。(Hello everyone, my name is Mary.)" },
  { before: "Wǒ jīnnián shísān ", after: " le.", answer: "suì", gloss: "我今年十三岁了。(I am thirteen years old this year.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["大家好，", "我叫玛丽，", "我住在内罗毕。"], sentence: "大家好，我叫玛丽，我住在内罗毕。", gloss: "Hello everyone, I'm Mary, I live in Nairobi." },
];

export const greetingsWriting: Skill = {
  id: "g7-ma-w-greetings",
  code: "W.1",
  subjectId: "mandarin",
  strandId: "g7-ma-writing",
  grade: 7,
  title: "Casual greetings and introductions",
  description: "Guided writing — spelling, word order, and vocabulary for casual greetings and self-introduction.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "match", "categorize", "mc"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to form a correct Mandarin self-introduction.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Greet everyone first, then say your name, then say where you live.",
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
        prompt: "Match each casual greeting expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Greetings check in on how someone is doing; questions ask for a name, age, or address.",
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
        prompt: "Sort each expression as a greeting or a personal question.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "question", label: "Question" },
        ],
        correctBucket,
        hint: "Questions end with a question word (什么/多大/哪儿) and a '？'.",
        explanation: [...greetings, ...questions].map((v) => `"${v.hanzi}" is a ${correctBucket[v.hanzi]}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, [correct.hanzi, ...distractors.map((d) => d.hanzi)]);

      return {
        kind: "multiple-choice",
        prompt: `Which hanzi expression correctly means "${correct.meaning}"?`,
        choices,
        correctIndex: choices.indexOf(correct.hanzi),
        layout: "list",
        hint: "Match the meaning to the exact wording, not just a similar-sounding phrase.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" is the expression that means "${correct.meaning}".`,
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
      hint: "Think about how you introduce your name or age informally.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
