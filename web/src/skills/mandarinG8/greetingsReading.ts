import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "玛丽：您好！您贵姓？",
  "(Mǎlì: Nín hǎo! Nín guì xìng?)",
  "陈老师：您好！我姓陈，我是中国人。您是哪国人？",
  "(Chén lǎoshī: Nín hǎo! Wǒ xìng Chén, wǒ shì Zhōngguó rén. Nín shì nǎ guó rén?)",
  "玛丽：我是肯尼亚人，我叫玛丽，很高兴认识您。",
  "(Mǎlì: Wǒ shì Kěnníyà rén, wǒ jiào Mǎlì, hěn gāoxìng rènshi nín.)",
  "陈老师：幸会，玛丽！你今年几岁了？",
  "(Chén lǎoshī: Xìnghuì, Mǎlì! Nǐ jīnnián jǐ suì le?)",
  "玛丽：我十四岁了。",
  "(Mǎlì: Wǒ shísì suì le.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "陈老师是哪国人？(Which country is Teacher Chen from?)",
    correct: "中国 (China)",
    distractors: ["肯尼亚 (Kenya)", "美国 (the USA)", "法国 (France)"],
    explanation: "陈老师说 \"我是中国人\" — Teacher Chen says \"I am Chinese.\"",
  },
  {
    q: "玛丽是哪国人？(Which country is Mary from?)",
    correct: "肯尼亚 (Kenya)",
    distractors: ["中国 (China)", "英国 (the UK)", "德国 (Germany)"],
    explanation: "玛丽说 \"我是肯尼亚人\" — Mary says \"I am Kenyan.\"",
  },
  {
    q: "玛丽今年几岁了？(How old is Mary this year?)",
    correct: "十四岁 (Fourteen years old)",
    distractors: ["十二岁 (Twelve)", "十五岁 (Fifteen)", "十三岁 (Thirteen)"],
    explanation: "玛丽说 \"我十四岁了\" — Mary says she is fourteen.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "玛丽先问陈老师的姓。(Mary asks for Teacher Chen's surname first.)", isTrue: true },
  { text: "陈老师是肯尼亚人。(Teacher Chen is Kenyan.)", isTrue: false },
  { text: "玛丽十四岁了。(Mary is fourteen years old.)", isTrue: true },
  { text: "陈老师问玛丽的年龄。(Teacher Chen asks Mary's age.)", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "您贵姓？", meaning: "What is your (honourable) surname?" },
  { phrase: "哪国人", meaning: "which country's person / where from" },
  { phrase: "很高兴认识您", meaning: "pleased to meet you" },
  { phrase: "几岁了", meaning: "how old" },
  { phrase: "幸会", meaning: "pleased to meet you" },
];

export const greetingsReading: Skill = {
  id: "g8-ma-r-greetings",
  code: "R.1",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: formal greetings and introductions",
  description: "Read a short Mandarin dialogue of a formal introduction and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

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
        hint: "Mary greets first and asks for the surname, then introduces herself, then Teacher Chen asks her age.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
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
