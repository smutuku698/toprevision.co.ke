import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

const LINES = [
  "学生：老师，现在几点？",
  "(Xuésheng: Lǎoshī, xiànzài jǐ diǎn?)",
  "老师：现在三点一刻。",
  "(Lǎoshī: Xiànzài sān diǎn yí kè.)",
  "学生：中文课几点开始？",
  "(Xuésheng: Zhōngwén kè jǐ diǎn kāishǐ?)",
  "老师：中文课四点开始。",
  "(Lǎoshī: Zhōngwén kè sì diǎn kāishǐ.)",
  "学生：谢谢老师！",
  "(Xuésheng: Xièxie lǎoshī!)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string; visual?: VisualSpec }[] = [
  {
    q: "现在几点？看上面的钟。(What time is it now? Look at the clock above.)",
    correct: "三点一刻 (Quarter past three)",
    distractors: ["四点 (Four o'clock)", "两点半 (Half past two)", "差一刻四点 (Quarter to four)"],
    explanation: "老师说 \"现在三点一刻\" — the teacher says it is quarter past three, and the clock shows 3:15.",
    visual: { type: "clock", hour: 3, minute: 15 },
  },
  {
    q: "中文课几点开始？(What time does Mandarin class start?)",
    correct: "四点 (Four o'clock)",
    distractors: ["三点一刻 (Quarter past three)", "五点 (Five o'clock)", "三点半 (Half past three)"],
    explanation: "老师说 \"中文课四点开始\" — the teacher says Mandarin class starts at four o'clock.",
  },
  {
    q: "谁问现在几点？(Who asks what time it is?)",
    correct: "学生 (The student)",
    distractors: ["老师 (The teacher)", "两个人都问 (Both people ask)", "没有人问 (No one asks)"],
    explanation: "学生先问 \"现在几点？\" — the student is the one who asks the time.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "中文课四点开始。(Mandarin class starts at four o'clock.)", isTrue: true },
  { text: "现在是两点半。(It is now half past two.)", isTrue: false },
  { text: "学生谢谢老师。(The student thanks the teacher.)", isTrue: true },
  { text: "中文课三点一刻开始。(Mandarin class starts at quarter past three.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "现在", meaning: "now" },
  { phrase: "几点", meaning: "what time" },
  { phrase: "开始", meaning: "to begin / start" },
  { phrase: "一刻", meaning: "a quarter hour" },
  { phrase: "谢谢", meaning: "thank you" },
];

export const timeReading: Skill = {
  id: "g8-ma-r-time",
  code: "R.4",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: telling time",
  description: "Read a short Mandarin dialogue about the time and a class schedule, then answer comprehension questions.",
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
        hint: "Reread the times the teacher gives carefully.",
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
        hint: "The student first asks the time, then asks when class starts, then thanks the teacher.",
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
      visual: q.visual,
      hint: "Look at the times given in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
