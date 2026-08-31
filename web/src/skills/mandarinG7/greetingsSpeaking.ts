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
  {
    before: "Dàjiā hǎo, wǒ ",
    after: " Mǎlì.",
    answer: "jiào",
    gloss: "大家好，我叫玛丽。(Dàjiā hǎo, wǒ jiào Mǎlì.) — Hello everyone, my name is Mary.",
  },
  {
    before: "Wǒ jīnnián shísān ",
    after: " le.",
    answer: "suì",
    gloss: "我今年十三岁了。(Wǒ jīnnián shísān suì le.) — I am thirteen years old this year.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["大家好，", "我叫玛丽，", "我住在内罗毕。"],
    sentence: "大家好，我叫玛丽，我住在内罗毕。",
    gloss: "Dàjiā hǎo, wǒ jiào Mǎlì, wǒ zhù zài Nèiluóbì. — Hello everyone, I'm Mary, I live in Nairobi.",
  },
];

export const greetingsSpeaking: Skill = {
  id: "g7-ma-ls-greetings",
  code: "LS.1",
  subjectId: "mandarin",
  strandId: "g7-ma-listening-speaking",
  grade: 7,
  title: "Casual greetings and introductions",
  description: "Informal Mandarin greetings and self-introduction (name, age, place of residence) — oral vocabulary and expressions.",
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
        prompt: "Match each casual Mandarin expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Greetings are said when meeting someone; personal questions ask for a name, age, or place of residence.",
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
        prompt: "Sort each expression as a Casual Greeting or a Personal Question.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "greeting", label: "Casual Greeting" },
          { id: "question", label: "Personal Question" },
        ],
        correctBucket,
        hint: "Greetings check in on how someone is doing; personal questions ask for specific information back (name, age, address).",
        explanation: [...greetings, ...questions]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "greeting" ? "casual greeting" : "personal question"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, [correct.meaning, ...distractors.map((d) => d.meaning)]);

      return {
        kind: "multiple-choice",
        prompt: `What does "${correct.hanzi} (${correct.pinyin})" mean?`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether this checks in on someone's wellbeing or asks for specific personal information.",
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
        hint: "This is part of the self-introduction pattern: 大家好，我叫...，我今年...岁。",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi phrases to form a correct spoken self-introduction.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Greet everyone first, then say your name, then say where you live.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
