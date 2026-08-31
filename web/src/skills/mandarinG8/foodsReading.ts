import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "服务员：您好！请看菜单，您想点什么？",
  "(Fúwùyuán: Nín hǎo! Qǐng kàn càidān, nín xiǎng diǎn shénme?)",
  "顾客：我想要一碗面条和一杯茶，谢谢。",
  "(Gùkè: Wǒ xiǎng yào yì wǎn miàntiáo hé yì bēi chá, xièxie.)",
  "服务员：好的，还要别的吗？",
  "(Fúwùyuán: Hǎo de, hái yào bié de ma?)",
  "顾客：不用了，谢谢。多少钱？",
  "(Gùkè: Bú yòng le, xièxie. Duōshao qián?)",
  "服务员：一共二十块钱。",
  "(Fúwùyuán: Yígòng èrshí kuài qián.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "顾客点了什么食物？(What food does the customer order?)",
    correct: "面条 (Noodles)",
    distractors: ["米饭 (Rice)", "面包 (Bread)", "鸡蛋 (Eggs)"],
    explanation: "顾客说 \"我想要一碗面条\" — the customer orders a bowl of noodles.",
  },
  {
    q: "顾客点了什么饮料？(What drink does the customer order?)",
    correct: "茶 (Tea)",
    distractors: ["果汁 (Juice)", "牛奶 (Milk)", "咖啡 (Coffee)"],
    explanation: "顾客说 \"一杯茶\" — the customer orders a cup of tea.",
  },
  {
    q: "一共多少钱？(How much does it cost in total?)",
    correct: "二十块钱 (Twenty kuai)",
    distractors: ["十块钱 (Ten kuai)", "三十块钱 (Thirty kuai)", "五十块钱 (Fifty kuai)"],
    explanation: "服务员说 \"一共二十块钱\" — the waiter says it is twenty kuai in total.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "顾客点了一碗面条。(The customer orders a bowl of noodles.)", isTrue: true },
  { text: "顾客还想要别的东西。(The customer wants something else too.)", isTrue: false },
  { text: "服务员先让顾客看菜单。(The waiter first has the customer look at the menu.)", isTrue: true },
  { text: "一共是十块钱。(The total is ten kuai.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "菜单", meaning: "menu" },
  { phrase: "点", meaning: "to order (food)" },
  { phrase: "多少钱？", meaning: "how much money?" },
  { phrase: "还要别的吗？", meaning: "would you like anything else?" },
  { phrase: "一共", meaning: "in total" },
];

export const foodsReading: Skill = {
  id: "g8-ma-r-foods",
  code: "R.6",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: foods and drinks",
  description: "Read a short Mandarin dialogue about ordering food at a restaurant and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what the customer orders.",
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
        hint: "The waiter offers the menu first, then the customer orders, then asks for the bill.",
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
      hint: "Look at exactly what the customer orders in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
