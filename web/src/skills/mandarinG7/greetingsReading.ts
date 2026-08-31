import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "玛丽：大家好！我叫玛丽。",
  "(Mǎlì: Dàjiā hǎo! Wǒ jiào Mǎlì.)",
  "陈：吃了吗？你今天怎么样？",
  "(Chén: Chīle ma? Nǐ jīntiān zěnmeyàng?)",
  "玛丽：吃了，谢谢！我很好。你呢？",
  "(Mǎlì: Chīle, xièxie! Wǒ hěn hǎo. Nǐ ne?)",
  "陈：我也很好。你住在哪儿？",
  "(Chén: Wǒ yě hěn hǎo. Nǐ zhù zài nǎr?)",
  "玛丽：我住在内罗毕。你多大了？",
  "(Mǎlì: Wǒ zhù zài Nèiluóbì. Nǐ duō dà le?)",
  "陈：我十三岁了。",
  "(Chén: Wǒ shísān suì le.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "玛丽住在哪儿？(Where does Mary live?)",
    correct: "内罗毕 (Nairobi)",
    distractors: ["蒙巴萨 (Mombasa)", "北京 (Beijing)", "基苏木 (Kisumu)"],
    explanation: "玛丽说 \"我住在内罗毕\" — Mary says \"I live in Nairobi.\"",
  },
  {
    q: "陈多大了？(How old is Chen?)",
    correct: "十三岁 (Thirteen years old)",
    distractors: ["十二岁 (Twelve)", "十四岁 (Fourteen)", "十五岁 (Fifteen)"],
    explanation: "陈说 \"我十三岁了\" — Chen says he is thirteen.",
  },
  {
    q: "谁先说\"大家好\"？(Who says \"hello everyone\" first?)",
    correct: "玛丽 (Mary)",
    distractors: ["陈 (Chen)", "老师 (the teacher)", "妈妈 (mother)"],
    explanation: "对话的第一句是玛丽说的 \"大家好！我叫玛丽。\" — The first line of the dialogue is Mary's.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "玛丽先跟大家打招呼。(Mary greets everyone first.)", isTrue: true },
  { text: "陈问玛丽住在哪儿。(Chen asks Mary where she lives.)", isTrue: true },
  { text: "玛丽还没吃饭。(Mary hasn't eaten yet.)", isTrue: false },
  { text: "陈十三岁了。(Chen is thirteen years old.)", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "吃了吗", meaning: "have you eaten? (casual greeting)" },
  { phrase: "你住在哪儿", meaning: "where do you live" },
  { phrase: "你多大了", meaning: "how old are you" },
  { phrase: "你呢", meaning: "and you?" },
  { phrase: "谢谢", meaning: "thank you" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Chén: Chīle ma? Nǐ jīntiān ",
    after: "?",
    answer: "zěnmeyàng",
    gloss: "陈：吃了吗？你今天怎么样？(Chén: Chīle ma? Nǐ jīntiān zěnmeyàng?) — Chen: Have you eaten? How are you today?",
  },
];

export const greetingsReading: Skill = {
  id: "g7-ma-r-greetings",
  code: "R.1",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: casual greetings and introductions",
  description: "Read a short Mandarin dialogue of a casual, informal introduction and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering", "fill-blank"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check what each speaker actually says.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.filter((_, i) => i % 2 === 0).map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Mary greets everyone first, then Chen asks how she is, then they ask each other where they live and how old they are.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing pinyin word from this line of the dialogue (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "Chen is asking Mary how her day is going.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what each speaker says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
