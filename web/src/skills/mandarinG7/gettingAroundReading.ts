import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "医院在超市的对面。",
  "(Yīyuàn zài chāoshì de duìmiàn.)",
  "邮局在面包店的旁边。",
  "(Yóujú zài miànbāodiàn de pángbiān.)",
  "清真寺在教堂的附近。",
  "(Qīngzhēnsì zài jiàotáng de fùjìn.)",
  "肉店在饭店的前面。",
  "(Ròudiàn zài fàndiàn de qiánmiàn.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "医院在哪儿？(Where is the hospital?)",
    correct: "超市的对面 (opposite the supermarket)",
    distractors: ["面包店的旁边 (beside the bakery)", "教堂的附近 (near the church)", "饭店的前面 (in front of the restaurant)"],
    explanation: "文中说 \"医院在超市的对面\" — The text says the hospital is opposite the supermarket.",
  },
  {
    q: "邮局在哪儿？(Where is the post office?)",
    correct: "面包店的旁边 (beside the bakery)",
    distractors: ["超市的对面 (opposite the supermarket)", "教堂的附近 (near the church)", "饭店的前面 (in front of the restaurant)"],
    explanation: "文中说 \"邮局在面包店的旁边\" — The text says the post office is beside the bakery.",
  },
  {
    q: "肉店在哪儿？(Where is the butcher shop?)",
    correct: "饭店的前面 (in front of the restaurant)",
    distractors: ["超市的对面 (opposite the supermarket)", "面包店的旁边 (beside the bakery)", "教堂的附近 (near the church)"],
    explanation: "文中说 \"肉店在饭店的前面\" — The text says the butcher shop is in front of the restaurant.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "医院在超市的对面。(The hospital is opposite the supermarket.)", isTrue: true },
  { text: "邮局在教堂的附近。(The post office is near the church.)", isTrue: false },
  { text: "清真寺在教堂的附近。(The mosque is near the church.)", isTrue: true },
  { text: "肉店在饭店的后面。(The butcher shop is behind the restaurant.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "在哪儿", meaning: "where is it" },
  { phrase: "对面", meaning: "opposite" },
  { phrase: "附近", meaning: "near" },
  { phrase: "前面", meaning: "in front of" },
  { phrase: "旁边", meaning: "beside" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Ròudiàn zài fàndiàn de ",
    after: "。",
    answer: "qiánmiàn",
    gloss: "肉店在饭店的前面。(Ròudiàn zài fàndiàn de qiánmiàn.) — The butcher shop is in front of the restaurant.",
  },
];

export const gettingAroundReading: Skill = {
  id: "g7-ma-r-getting-around",
  code: "R.9",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: getting around the neighbourhood",
  description: "Read short Mandarin sentences describing where neighbourhood facilities are located, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering", "fill-blank"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Match each facility to the exact location word the passage gives it.",
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
        prompt: "Match each phrase from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the passage above.",
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
        prompt: "Put these lines from the passage in the order they appear.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The passage locates the hospital first, then the post office, then the mosque, then the butcher shop.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing pinyin word from this line of the passage (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This line places the butcher shop relative to the restaurant.",
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
      hint: "Match each facility named in the question to the sentence in the passage that places it.",
      explanation: q.explanation,
    };
  },
};
