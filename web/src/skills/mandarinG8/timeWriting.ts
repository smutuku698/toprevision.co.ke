import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const HOUR_WORDS = ["一", "两", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

function hourWord(h: number): string {
  return h === 2 ? "两" : HOUR_WORDS[(h - 1) % 12];
}

function clockBody(hour: number, minute: number): string {
  if (minute === 45) {
    const nextH = (hour % 12) + 1;
    return `差一刻${hourWord(nextH)}点`;
  }
  const heures = `${hourWord(hour)}点`;
  if (minute === 0) return heures;
  if (minute === 15) return `${heures}一刻`;
  return `${heures}半`; // minute === 30
}

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "", after: " jǐ diǎn?", answer: "Xiànzài", gloss: "现在几点？(Xiànzài jǐ diǎn?) — What time is it now?" },
  { before: "Sān diǎn ", after: ", jiù shì sān diǎn shíwǔ fēn.", answer: "yí kè", gloss: "三点一刻，就是三点十五分。— Quarter past three is 3:15." },
  { before: "Liù diǎn ", after: ", jiù shì liù diǎn sānshí fēn.", answer: "bàn", gloss: "六点半，就是六点三十分。— Half past six is 6:30." },
  { before: "Chà yí kè sì diǎn, jiù shì sān diǎn ", after: " fēn.", answer: "sìshíwǔ", gloss: "差一刻四点，就是三点四十五分。— Quarter to four is 3:45." },
  { before: "Jīntiān shì xīngqīsān, míngtiān shì ", after: ".", answer: "xīngqīsì", gloss: "今天是星期三，明天是星期四。— Today is Wednesday, tomorrow is Thursday." },
  { before: "Yì nián de zuìhòu yí gè yuè shì ", after: ".", answer: "shí’èr yuè", gloss: "一年的最后一个月是十二月。— The last month of the year is December." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["现在", "几点", "？"], sentence: "现在几点？", gloss: "Xiànzài jǐ diǎn? — What time is it now?" },
  { chunks: ["现在", "是", "三点一刻。"], sentence: "现在是三点一刻。", gloss: "Xiànzài shì sān diǎn yí kè. — It is now quarter past three." },
  { chunks: ["中文课", "四点", "开始。"], sentence: "中文课四点开始。", gloss: "Zhōngwén kè sì diǎn kāishǐ. — Mandarin class starts at four o'clock." },
  { chunks: ["今天", "是", "星期五。"], sentence: "今天是星期五。", gloss: "Jīntiān shì xīngqīwǔ. — Today is Friday." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct way to ask 'What time is it now?'",
    correct: "现在几点？",
    distractors: ["现在几点吗？", "几点现在？", "现在什么时候？"],
    explanation: "几点 already forms a question, so 吗 is not added; the correct order is 现在 + 几点 + ？",
  },
  {
    prompt: "Which is the correct way to say 'half past six'?",
    correct: "六点半",
    distractors: ["六半点", "半六点", "六点一半"],
    explanation: "半 (bàn, 'half') comes directly after 点 (diǎn, 'o'clock'): 六点半.",
  },
  {
    prompt: "Which is the correct way to say 'quarter to four'?",
    correct: "差一刻四点",
    distractors: ["四点差一刻一", "一刻差四点", "四点一刻差"],
    explanation: "差 (chà, 'before/to') comes first, followed by 一刻 (a quarter) and then the upcoming hour: 差一刻四点.",
  },
  {
    prompt: "Which day comes immediately after 星期四 (Thursday)?",
    correct: "星期五 (Friday)",
    distractors: ["星期三 (Wednesday)", "星期六 (Saturday)", "星期日 (Sunday)"],
    explanation: "The days in order are 星期一 to 星期日 — 星期五 follows 星期四.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "一点", meaning: "one o'clock" },
  { term: "两点半", meaning: "half past two" },
  { term: "三点一刻", meaning: "a quarter past three" },
  { term: "差一刻四点", meaning: "a quarter to four" },
  { term: "十二点", meaning: "twelve o'clock" },
  { term: "现在", meaning: "now" },
  { term: "开始", meaning: "to begin" },
  { term: "今天", meaning: "today" },
  { term: "明天", meaning: "tomorrow" },
];

export const timeWriting: Skill = {
  id: "g8-ma-w-time",
  code: "W.4",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing the time",
  description: "Write Mandarin time expressions: read an analog clock, fill in missing words, order sentences, and match time phrases to their meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["clock", "fill", "order", "choice", "match"] as const);

    if (branch === "clock") {
      const hour = randInt(rng, 1, 11);
      const minute = randChoice(rng, [0, 15, 30, 45] as const);
      const body = clockBody(hour, minute);

      return {
        kind: "fill-blank",
        prompt: "Look at the clock and complete the Mandarin sentence for the time shown.",
        visual: { type: "clock", hour, minute },
        before: "现在是",
        after: "。",
        correctAnswer: body,
        acceptedAnswers: [body],
        inputMode: "text",
        hint: "Read the hour hand first, then check the minute hand for 一刻, 半, or 差一刻.",
        explanation: `The clock shows ${hour}:${String(minute).padStart(2, "0")}, which in Mandarin is "现在是${body}。"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to form a correct Mandarin sentence about time or date.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Questions about time usually start with 现在.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Watch the exact word order of Mandarin time expressions.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each Mandarin time expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "一刻 adds 15 minutes, 半 adds 30, and 差一刻 subtracts 15 from the next hour.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing pinyin word to complete the sentence (tone marks optional).",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: pinyinAccepted(item.answer),
      inputMode: "text",
      hint: "Think carefully about time and date expressions.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
