import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "今天是十二月二十五号，是圣诞节。",
  "(Jīntiān shì shí'èr yuè èrshíwǔ hào, shì Shèngdàn Jié.)",
  "我们一家人在一起吃饭，很开心。",
  "(Wǒmen yì jiā rén zài yìqǐ chīfàn, hěn kāixīn.)",
  "五月一号是劳动节。",
  "(Wǔ yuè yī hào shì Láodòng Jié.)",
  "一月一号是新年。",
  "(Yī yuè yī hào shì Xīnnián.)",
  "我的生日是六月十号。",
  "(Wǒ de shēngrì shì liù yuè shí hào.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "十二月二十五号是什么节日？(What holiday is December 25th?)",
    correct: "圣诞节 (Christmas)",
    distractors: ["新年 (New Year)", "情人节 (Valentine's Day)", "劳动节 (Labour Day)"],
    explanation: "文中说 \"十二月二十五号，是圣诞节\" — The text says December 25th is Christmas.",
  },
  {
    q: "劳动节是几月几号？(What month and day is Labour Day?)",
    correct: "五月一号 (May 1st)",
    distractors: ["一月一号 (January 1st)", "六月十号 (June 10th)", "十二月二十五号 (December 25th)"],
    explanation: "文中说 \"五月一号是劳动节\" — The text says May 1st is Labour Day.",
  },
  {
    q: "\"我\"的生日是几月几号？(What month and day is the narrator's birthday?)",
    correct: "六月十号 (June 10th)",
    distractors: ["五月一号 (May 1st)", "一月一号 (January 1st)", "十二月二十五号 (December 25th)"],
    explanation: "文中说 \"我的生日是六月十号\" — The text says \"my birthday is June 10th.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "十二月二十五号是圣诞节。(December 25th is Christmas.)", isTrue: true },
  { text: "新年是五月一号。(New Year is May 1st.)", isTrue: false },
  { text: "\"我\"的生日是六月十号。(The narrator's birthday is June 10th.)", isTrue: true },
  { text: "一家人在圣诞节一起吃饭。(The family eats together on Christmas.)", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "圣诞节", meaning: "Christmas" },
  { phrase: "劳动节", meaning: "Labour Day" },
  { phrase: "新年", meaning: "New Year" },
  { phrase: "生日", meaning: "birthday" },
  { phrase: "开心", meaning: "happy" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǔ yuè yī hào shì ",
    after: "。",
    answer: "Láodòng Jié",
    gloss: "五月一号是劳动节。(Wǔ yuè yī hào shì Láodòng Jié.) — May 1st is Labour Day.",
  },
];

export const timeReading: Skill = {
  id: "g7-ma-r-time",
  code: "R.4",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: dates and holidays",
  description: "Read a short Mandarin passage about dates and named holidays, then answer comprehension questions.",
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
        hint: "Reread the passage carefully and check each date against the holiday it names.",
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
        hint: "The passage opens with Christmas, then moves through Labour Day and New Year, ending on the narrator's own birthday.",
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
        hint: "This line names the holiday that falls on May 1st.",
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
      hint: "Match each date mentioned in the passage to the holiday or event it names.",
      explanation: q.explanation,
    };
  },
};
