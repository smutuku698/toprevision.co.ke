import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "这是大卫。",
  "(Zhè shì Dàwèi.)",
  "大卫很高，也很帅。",
  "(Dàwèi hěn gāo, yě hěn shuài.)",
  "他的头发很黑，不长。",
  "(Tā de tóufǎ hěn hēi, bù cháng.)",
  "老师矮不矮？老师很矮，但是很好看。",
  "(Lǎoshī ǎi bu ǎi? Lǎoshī hěn ǎi, dànshì hěn hǎokàn.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "大卫高不高？(Is David tall?)",
    correct: "大卫很高 (David is tall)",
    distractors: ["大卫很矮 (David is short — the opposite)", "大卫不高 (David is not tall — a negation mix-up)", "大卫很胖 (David is fat — a different attribute)"],
    explanation: "文中说 \"大卫很高\" — The text says David is tall.",
  },
  {
    q: "大卫的头发长不长？(Is David's hair long?)",
    correct: "不长 (not long)",
    distractors: ["很长 (long)", "很黑 (dark — that's the hair's color, not its length)", "很白 (light-colored — not stated)"],
    explanation: "文中说 \"他的头发很黑，不长\" — The text says his hair is dark, not long. 黑 describes color, 长/不长 describes length — don't mix up the two attributes.",
  },
  {
    q: "老师矮不矮？(Is the teacher short?)",
    correct: "老师很矮 (the teacher is short)",
    distractors: ["老师很高 (the teacher is tall — the opposite)", "老师不矮 (the teacher is not short — a negation mix-up)", "老师很瘦 (the teacher is thin — a different attribute)"],
    explanation: "文中说 \"老师很矮\" — The text says the teacher is short.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "大卫很高。(David is tall.)", isTrue: true },
  { text: "大卫的头发很长。(David's hair is long.)", isTrue: false },
  { text: "老师很矮，但是很好看。(The teacher is short, but good-looking.)", isTrue: true },
  { text: "大卫不帅。(David is not handsome.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "头发", meaning: "hair" },
  { phrase: "但是", meaning: "but" },
  { phrase: "也", meaning: "also" },
  { phrase: "矮不矮", meaning: "is (he/she) short or not (question form)" },
  { phrase: "这是", meaning: "this is" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Lǎoshī ǎi bu ǎi? Lǎoshī hěn ǎi, dànshì hěn ",
    after: "。",
    answer: "hǎokàn",
    gloss: "老师矮不矮？老师很矮，但是很好看。(Lǎoshī ǎi bu ǎi? Lǎoshī hěn ǎi, dànshì hěn hǎokàn.) — Is the teacher short? The teacher is short, but very good-looking.",
  },
];

export const bodyReading: Skill = {
  id: "g7-ma-r-body",
  code: "R.7",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: describing physical attributes",
  description: "Read short Mandarin descriptions of physical attributes and answer comprehension questions.",
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
        hint: "Watch for 不 (not) and 很 (very) — they flip the meaning of the same attribute word.",
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
        hint: "The passage introduces David by name first, then describes his height, then his hair, then moves on to the teacher.",
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
        hint: "Even though the teacher is short, the passage says she is very... this.",
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
      hint: "Watch carefully for 很 (very) versus 不 (not) attached to each attribute.",
      explanation: q.explanation,
    };
  },
};
