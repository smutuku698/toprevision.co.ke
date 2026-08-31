import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "老板：你好！你要买什么？",
  "(Lǎobǎn: Nǐ hǎo! Nǐ yào mǎi shénme?)",
  "明：我要买水果。苹果多少钱？",
  "(Míng: Wǒ yào mǎi shuǐguǒ. Píngguǒ duōshǎo qián?)",
  "老板：苹果十先令一个。",
  "(Lǎobǎn: Píngguǒ shí xiānlìng yí gè.)",
  "明：好，我买五个。",
  "(Míng: Hǎo, wǒ mǎi wǔ gè.)",
  "老板：一共五十先令。",
  "(Lǎobǎn: Yígòng wǔshí xiānlìng.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "明要买什么？(What does Ming want to buy?)",
    correct: "水果 (fruit)",
    distractors: ["蔬菜 (vegetables)", "药 (medicine)", "衣服 (clothes)"],
    explanation: "明说 \"我要买水果\" — Ming says \"I want to buy fruit.\"",
  },
  {
    q: "一个苹果多少钱？(How much is one apple?)",
    correct: "十先令 (ten shillings)",
    distractors: ["五先令 (five shillings)", "二十先令 (twenty shillings)", "五十先令 (fifty shillings)"],
    explanation: "老板说 \"苹果十先令一个\" — The shopkeeper says apples are ten shillings each.",
  },
  {
    q: "明买了五个苹果，一共多少钱？(Ming buys five apples — how much in total?)",
    correct: "五十先令 (fifty shillings)",
    distractors: ["十先令 (ten shillings)", "二十五先令 (twenty-five shillings)", "一百先令 (one hundred shillings)"],
    explanation: "五个苹果，每个十先令：5 × 10 = 五十先令 — Five apples at ten shillings each comes to fifty shillings total, as the shopkeeper confirms.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "老板先问明要买什么。(The shopkeeper asks first what Ming wants to buy.)", isTrue: true },
  { text: "明买了五个苹果。(Ming buys five apples.)", isTrue: true },
  { text: "苹果一个二十先令。(One apple costs twenty shillings.)", isTrue: false },
  { text: "明总共付五十先令。(Ming pays fifty shillings in total.)", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "你要买什么", meaning: "what do you want to buy" },
  { phrase: "多少钱", meaning: "how much money" },
  { phrase: "一共", meaning: "altogether, in total" },
  { phrase: "老板", meaning: "shopkeeper" },
  { phrase: "先令", meaning: "shilling" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Lǎobǎn: Píngguǒ shí xiānlìng yí ",
    after: "。",
    answer: "gè",
    gloss: "老板：苹果十先令一个。(Lǎobǎn: Píngguǒ shí xiānlìng yí gè.) — Shopkeeper: Apples are ten shillings each.",
  },
];

export const surroundingsReading: Skill = {
  id: "g7-ma-r-surroundings",
  code: "R.3",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: my surroundings, at the market",
  description: "Read a short Mandarin marketplace dialogue and answer comprehension questions, including a price calculation.",
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
        hint: "Check the price and quantity mentioned in the dialogue carefully.",
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
        hint: "The shopkeeper greets first, then Ming asks the price, then the shopkeeper answers, then Ming decides how many to buy.",
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
        hint: "This word means \"each/one\" — it comes right after the price.",
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
      hint: "Look at what each speaker says in the dialogue above — one question requires a small calculation.",
      explanation: q.explanation,
    };
  },
};
