import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "holiday" | "greeting-formula" }[] = [
  { hanzi: "圣诞节", pinyin: "Shèngdàn Jié", meaning: "Christmas", tag: "holiday" },
  { hanzi: "情人节", pinyin: "Qíngrén Jié", meaning: "Valentine's Day", tag: "holiday" },
  { hanzi: "新年", pinyin: "Xīnnián", meaning: "New Year", tag: "holiday" },
  { hanzi: "劳动节", pinyin: "Láodòng Jié", meaning: "Labour Day", tag: "holiday" },
  { hanzi: "独立日", pinyin: "Dúlì Rì", meaning: "Independence Day", tag: "holiday" },
  { hanzi: "自治日", pinyin: "Zìzhì Rì", meaning: "Madaraka Day (self-rule day)", tag: "holiday" },
  { hanzi: "生日快乐", pinyin: "Shēngrì kuàilè", meaning: "Happy Birthday", tag: "greeting-formula" },
  { hanzi: "劳动节愉快", pinyin: "Láodòng Jié yúkuài", meaning: "Happy Labour Day", tag: "greeting-formula" },
  { hanzi: "新年快乐", pinyin: "Xīnnián kuàilè", meaning: "Happy New Year", tag: "greeting-formula" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ de shēngrì shì liù yuè shí ",
    after: "。",
    answer: "hào",
    gloss: "我的生日是六月十号。(Wǒ de shēngrì shì liù yuè shí hào.) — My birthday is June 10th.",
  },
  {
    before: "Yī yuè yī hào shì ",
    after: "。",
    answer: "Xīnnián",
    gloss: "一月一号是新年。(Yī yuè yī hào shì Xīnnián.) — January 1st is New Year.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["今天是", "十二月二十五号，", "是圣诞节。"],
    sentence: "今天是十二月二十五号，是圣诞节。",
    gloss: "Jīntiān shì shí'èr yuè èrshíwǔ hào, shì Shèngdàn Jié. — Today is December 25th, it's Christmas.",
  },
];

export const timeSpeaking: Skill = {
  id: "g7-ma-ls-time",
  code: "LS.4",
  subjectId: "mandarin",
  strandId: "g7-ma-listening-speaking",
  grade: 7,
  title: "Time: dates and holidays",
  description: "Dates, named holidays, and holiday greeting formulas — oral vocabulary and expressions.",
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
        prompt: "Match each holiday or greeting formula to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "A greeting formula is said on a holiday; a holiday name is the date itself.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const holidays = shuffle(rng, VOCAB.filter((v) => v.tag === "holiday")).slice(0, 4);
      const formulas = shuffle(rng, VOCAB.filter((v) => v.tag === "greeting-formula"));
      const items = shuffle(rng, [...holidays, ...formulas]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each expression as a Holiday Name or a Holiday Greeting.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "holiday", label: "Holiday Name" },
          { id: "greeting-formula", label: "Holiday Greeting" },
        ],
        correctBucket,
        hint: "A holiday greeting usually ends in 快乐 (happy) or 愉快 (pleasant).",
        explanation: [...holidays, ...formulas]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "holiday" ? "holiday name" : "holiday greeting"}.`)
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
        hint: "Decide if this names a specific holiday or is a greeting said on one.",
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
        hint: "Dates in Mandarin go year (年), month (月), day (号/日) — from largest to smallest unit.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi phrases to state a date and the holiday it is.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "State that it is today, then give the date, then name the holiday.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
