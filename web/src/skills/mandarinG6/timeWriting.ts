import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.4 "Time" — focus: Chinese characters (strokes and stroke order) for
// months, and sentence sequencing. KIQ: "How does sequence enhance written communication?"

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "month" | "holiday" }[] = [
  { hanzi: "一月", pinyin: "yī yuè", meaning: "January", tag: "month" },
  { hanzi: "二月", pinyin: "èr yuè", meaning: "February", tag: "month" },
  { hanzi: "三月", pinyin: "sān yuè", meaning: "March", tag: "month" },
  { hanzi: "四月", pinyin: "sì yuè", meaning: "April", tag: "month" },
  { hanzi: "五月", pinyin: "wǔ yuè", meaning: "May", tag: "month" },
  { hanzi: "六月", pinyin: "liù yuè", meaning: "June", tag: "month" },
  { hanzi: "七月", pinyin: "qī yuè", meaning: "July", tag: "month" },
  { hanzi: "八月", pinyin: "bā yuè", meaning: "August", tag: "month" },
  { hanzi: "九月", pinyin: "jiǔ yuè", meaning: "September", tag: "month" },
  { hanzi: "十月", pinyin: "shí yuè", meaning: "October", tag: "month" },
  { hanzi: "十一月", pinyin: "shí yī yuè", meaning: "November", tag: "month" },
  { hanzi: "十二月", pinyin: "shí èr yuè", meaning: "December", tag: "month" },
  { hanzi: "圣诞节", pinyin: "Shèngdàn jié", meaning: "Christmas", tag: "holiday" },
  { hanzi: "复活节", pinyin: "Fùhuó jié", meaning: "Easter", tag: "holiday" },
  { hanzi: "母亲节", pinyin: "Mǔqīn jié", meaning: "Mother's Day", tag: "holiday" },
  { hanzi: "元旦节", pinyin: "Yuándàn jié", meaning: "New Year's Day", tag: "holiday" },
  { hanzi: "情人节", pinyin: "Qíngrén jié", meaning: "Valentine's Day", tag: "holiday" },
];

const MONTHS = VOCAB.filter((v) => v.tag === "month");

// "X 在 Y。" (X is in Y) linking each holiday to the month it falls in — both slots get blanked
// across the pool, so the taught month word AND the taught holiday word each get practised.
const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Yuándàn jié zài ", after: "。", answer: "yī yuè", gloss: "元旦节在一月。— New Year's Day is in January." },
  { before: "", after: " zài yī yuè。", answer: "yuándàn jié", gloss: "元旦节在一月。— New Year's Day is in January." },
  { before: "Qíngrén jié zài ", after: "。", answer: "èr yuè", gloss: "情人节在二月。— Valentine's Day is in February." },
  { before: "", after: " zài èr yuè。", answer: "qíngrén jié", gloss: "情人节在二月。— Valentine's Day is in February." },
  { before: "Fùhuó jié zài ", after: "。", answer: "sì yuè", gloss: "复活节在四月。— Easter is in April." },
  { before: "", after: " zài sì yuè。", answer: "fùhuó jié", gloss: "复活节在四月。— Easter is in April." },
  { before: "Mǔqīn jié zài ", after: "。", answer: "wǔ yuè", gloss: "母亲节在五月。— Mother's Day is in May." },
  { before: "", after: " zài wǔ yuè。", answer: "mǔqīn jié", gloss: "母亲节在五月。— Mother's Day is in May." },
  { before: "Shèngdàn jié zài ", after: "。", answer: "shí èr yuè", gloss: "圣诞节在十二月。— Christmas is in December." },
  { before: "", after: " zài shí èr yuè。", answer: "shèngdàn jié", gloss: "圣诞节在十二月。— Christmas is in December." },
];

// Sequencing months in calendar order directly practises the theme's "sequence enhances written
// communication" idea — every contiguous 4-month window of the 12 months, 9 windows total.
const MONTH_WINDOWS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // start index of each 4-month run

const MATCH_OPENERS = [
  "Match each month or holiday to its correct English meaning",
  "Pair every written time word below with the meaning it stands for",
  "Connect each month or holiday character group to the meaning it matches",
  "Work out what each month or holiday means, then match it",
  "Line up each written time word below with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your written calendar stays accurate.",
  "before using it in a written sentence.",
  "to make sure your character choice is correct.",
  "so a reader knows exactly which month or holiday you mean.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a Month or a Holiday",
  "Group these written time words under Month or Holiday",
  "Decide whether each item is a Month or a Holiday, then sort it",
  "Classify each character group as a Month or a Holiday",
  "Organize these words into Month or Holiday groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a clearly sequenced paragraph.",
  "so your written calendar stays organized.",
  "before writing about dates and celebrations.",
  "to check you recognize each character correctly.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const MC_OPENERS = [
  "A learner is handwriting a calendar entry and needs the exact characters for",
  "To keep a written date accurate, which word means",
  "Which month or holiday name correctly means",
  "A pupil practising stroke order must correctly write the word for",
  "For accuracy in written Mandarin, which word means",
];
const MC_CLOSERS = ['?', ", exactly?", " in their writing?", " when writing the date?"];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence",
  "Type the missing pinyin word that completes this sentence correctly",
  "Complete the sentence by filling in the missing pinyin word",
  "Write the correct pinyin word in the blank to finish the sentence",
  "Supply the missing pinyin word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional).",
  "to keep your writing accurate.",
  "so the sentence is spelled correctly.",
  "before checking your written work.",
];
const FILL_PROMPTS = composePrompts(FILL_OPENERS, FILL_CLOSERS);

const ORDER_OPENERS = [
  "Arrange these months into their correct calendar sequence",
  "Put these months back into the right order",
  "Sequence these months correctly, from earliest to latest",
  "Reorder these months so they read in calendar order",
  "Work out the correct sequence, then arrange these months",
];
const ORDER_CLOSERS = [
  "to keep a written calendar clear.",
  "so a reader can follow the timeline.",
  "before writing dates into a paragraph.",
  "to keep the sequence coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const timeWriting: Skill = {
  id: "g6-ma-w-time",
  code: "W.4",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing months and holidays in sequence",
  description: "Character writing (strokes and stroke order) for months and holidays, and sequencing dates correctly in writing.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Months are built from a number plus 月 (yuè); holidays end in 节 (jié).",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const months = shuffle(rng, VOCAB.filter((v) => v.tag === "month")).slice(0, 5);
      const holidays = shuffle(rng, VOCAB.filter((v) => v.tag === "holiday")).slice(0, 3);
      const items = shuffle(rng, [...months, ...holidays]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "month", label: "Month" },
          { id: "holiday", label: "Holiday" },
        ],
        correctBucket,
        hint: "Months name a point in the calendar (月); holidays name a celebration (节).",
        explanation: items.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.hanzi, ...distractors.map((d) => d.hanzi)])));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_OPENERS)} "${correct.meaning}"${randChoice(rng, MC_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correct.hanzi),
        layout: "list",
        hint: "Check whether the meaning is a calendar month or a named holiday.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" is the word that means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This sentence follows the pattern X 在 Y。(X is in Y.)",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const start = randChoice(rng, MONTH_WINDOWS);
    const window = MONTHS.slice(start, start + 4);
    const items = shuffle(rng, window.map((m) => ({ id: m.hanzi, label: `${m.hanzi} (${m.pinyin})` })));
    const correctOrder = window.map((m) => m.hanzi);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the months in the correct order.",
      items,
      correctOrder,
      hint: "Months are numbered in order: 一月 is first, 十二月 is last.",
      explanation: `The correct calendar order is: ${window.map((m) => `${m.hanzi} (${m.meaning})`).join(" → ")}`,
    };
  },
};
