import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const CLOCK_TIMES: { hour: number; minute: 0 | 15 | 30 | 45; text: string }[] = [
  { hour: 1, minute: 0, text: "一点 (yī diǎn)" },
  { hour: 6, minute: 0, text: "六点 (liù diǎn)" },
  { hour: 2, minute: 30, text: "两点半 (liǎng diǎn bàn)" },
  { hour: 7, minute: 30, text: "七点半 (qī diǎn bàn)" },
  { hour: 3, minute: 15, text: "三点一刻 (sān diǎn yí kè)" },
  { hour: 9, minute: 15, text: "九点一刻 (jiǔ diǎn yí kè)" },
  { hour: 3, minute: 45, text: "差一刻四点 (chà yí kè sì diǎn)" },
  { hour: 9, minute: 45, text: "差一刻十点 (chà yí kè shí diǎn)" },
  { hour: 12, minute: 0, text: "十二点 (shí’èr diǎn)" },
];

const DAY_MONTH_WORDS: { word: string; meaning: string }[] = [
  { word: "星期一 (xīngqīyī)", meaning: "Monday" },
  { word: "星期三 (xīngqīsān)", meaning: "Wednesday" },
  { word: "星期五 (xīngqīwǔ)", meaning: "Friday" },
  { word: "星期六 (xīngqīliù)", meaning: "Saturday" },
  { word: "星期日 (xīngqīrì)", meaning: "Sunday" },
  { word: "一月 (yīyuè)", meaning: "January" },
  { word: "十二月 (shí’èr yuè)", meaning: "December" },
  { word: "今天 (jīntiān)", meaning: "Today" },
  { word: "明天 (míngtiān)", meaning: "Tomorrow" },
];

const WEEKDAYS = ["星期一 (xīngqīyī)", "星期二 (xīngqī’èr)", "星期三 (xīngqīsān)", "星期四 (xīngqīsì)", "星期五 (xīngqīwǔ)"];
const WEEKEND = ["星期六 (xīngqīliù)", "星期日 (xīngqīrì)"];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Sān diǎn ", after: ".", answer: "yí kè", gloss: "三点一刻。(Sān diǎn yí kè.) — Quarter past three." },
  { before: "Liù diǎn ", after: ".", answer: "bàn", gloss: "六点半。(Liù diǎn bàn.) — Half past six." },
  { before: "Xiànzài jǐ ", after: "？", answer: "diǎn", gloss: "现在几点？(Xiànzài jǐ diǎn?) — What time is it now?" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["现在", "几点", "？"], sentence: "现在几点？", gloss: "Xiànzài jǐ diǎn? — What time is it now?" },
  { chunks: ["现在", "是", "三点一刻。"], sentence: "现在是三点一刻。", gloss: "Xiànzài shì sān diǎn yí kè. — It is now quarter past three." },
];

export const timeSpeaking: Skill = {
  id: "g8-ma-ls-time",
  code: "LS.4",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Telling time",
  description: "Tell the time in Mandarin from a clock face, and practise days and months.",
  generate(rng) {
    const branch = randChoice(rng, ["clock", "fill", "match", "categorize", "order"] as const);

    if (branch === "clock") {
      const correct = randChoice(rng, CLOCK_TIMES);
      const distractors = shuffle(rng, CLOCK_TIMES.filter((t) => t.text !== correct.text)).slice(0, 3);
      const choices = shuffle(rng, [correct.text, ...distractors.map((d) => d.text)]);

      return {
        kind: "multiple-choice",
        prompt: "看这个钟。现在几点？(Look at the clock. What time is it?)",
        visual: { type: "clock", hour: correct.hour, minute: correct.minute },
        choices,
        correctIndex: choices.indexOf(correct.text),
        layout: "list",
        hint: "Look at where the short (hour) hand and long (minute) hand are pointing.",
        explanation: `The clock shows ${correct.hour}:${String(correct.minute).padStart(2, "0")}, which in Mandarin is "${correct.text}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing pinyin word to complete the time expression (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "一刻 (yí kè) is a quarter hour; 半 (bàn) is half an hour; 点 (diǎn) is o'clock.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "categorize") {
      const weekdayItems = shuffle(rng, WEEKDAYS).slice(0, 3);
      const weekendItems = [...WEEKEND];
      const items = shuffle(rng, [...weekdayItems, ...weekendItems]);
      const correctBucket: Record<string, string> = {};
      for (const d of weekdayItems) correctBucket[d] = "weekday";
      for (const d of weekendItems) correctBucket[d] = "weekend";

      return {
        kind: "categorize",
        prompt: "Sort each day as a Weekday or a Weekend day.",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "weekday", label: "Weekday" },
          { id: "weekend", label: "Weekend" },
        ],
        correctBucket,
        hint: "The school week runs 星期一 (Monday) to 星期五 (Friday); 星期六 and 星期日 are the weekend.",
        explanation: `Weekdays: ${weekdayItems.join(", ")}. Weekend: ${weekendItems.join(", ")}.`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi words to form a correct spoken sentence about time.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Time questions usually start with 现在 (xiànzài, 'now').",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    const chosen = shuffle(rng, DAY_MONTH_WORDS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
    const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
    const correctMap: Record<string, string> = {};
    for (const w of chosen) correctMap[w.word] = w.word;

    return {
      kind: "click-match",
      prompt: "Match each Mandarin day or month to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "星期 (xīngqī) means 'week' — the number after it tells you which day.",
      explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
    };
  },
};
