import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

type Tag = "month" | "holiday" | "phrase";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
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
  { hanzi: "十一月", pinyin: "shíyī yuè", meaning: "November", tag: "month" },
  { hanzi: "十二月", pinyin: "shí'èr yuè", meaning: "December", tag: "month" },
  { hanzi: "圣诞节", pinyin: "Shèngdàn jié", meaning: "Christmas", tag: "holiday" },
  { hanzi: "复活节", pinyin: "Fùhuó jié", meaning: "Easter", tag: "holiday" },
  { hanzi: "情人节", pinyin: "Qíngrén jié", meaning: "Valentine's Day", tag: "holiday" },
  { hanzi: "母亲节", pinyin: "Mǔqīn jié", meaning: "Mother's Day", tag: "holiday" },
  { hanzi: "元旦节", pinyin: "Yuándàn jié", meaning: "New Year's Day", tag: "holiday" },
  { hanzi: "放假", pinyin: "fàngjià", meaning: "school holiday / break", tag: "phrase" },
  { hanzi: "开学", pinyin: "kāixué", meaning: "school starts", tag: "phrase" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "", after: " fàngjià.", answer: "Bā yuè", gloss: "八月放假。— August, school holiday." },
  { before: "", after: " fàngjià.", answer: "Shí'èr yuè", gloss: "十二月放假。— December, school holiday." },
  { before: "", after: " fàngjià.", answer: "Sì yuè", gloss: "四月放假。— April, school holiday." },
  { before: "Shèngdàn jié shì ", after: ".", answer: "shí'èr yuè", gloss: "圣诞节是十二月。— Christmas is in December." },
  { before: "Fùhuó jié shì ", after: ".", answer: "sì yuè", gloss: "复活节是四月。— Easter is in April." },
  { before: "Qíngrén jié shì ", after: ".", answer: "èr yuè", gloss: "情人节是二月。— Valentine's Day is in February." },
  { before: "Mǔqīn jié shì ", after: ".", answer: "wǔ yuè", gloss: "母亲节是五月。— Mother's Day is in May." },
  { before: "Yuándàn jié shì ", after: ".", answer: "yī yuè", gloss: "元旦节是一月。— New Year's Day is in January." },
  { before: "Jiǔ yuè ", after: ".", answer: "kāixué", gloss: "九月开学。— September, school starts." },
  { before: "Yī yuè ", after: ".", answer: "kāixué", gloss: "一月开学。— January, school starts." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["圣诞节", "是", "十二月。"], sentence: "圣诞节是十二月。", gloss: "Shèngdàn jié shì shí'èr yuè. — Christmas is in December." },
  { chunks: ["复活节", "是", "四月。"], sentence: "复活节是四月。", gloss: "Fùhuó jié shì sì yuè. — Easter is in April." },
  { chunks: ["情人节", "是", "二月。"], sentence: "情人节是二月。", gloss: "Qíngrén jié shì èr yuè. — Valentine's Day is in February." },
  { chunks: ["母亲节", "是", "五月。"], sentence: "母亲节是五月。", gloss: "Mǔqīn jié shì wǔ yuè. — Mother's Day is in May." },
  { chunks: ["元旦节", "是", "一月。"], sentence: "元旦节是一月。", gloss: "Yuándàn jié shì yī yuè. — New Year's Day is in January." },
  { chunks: ["八月放假，", "九月", "开学。"], sentence: "八月放假，九月开学。", gloss: "Bā yuè fàngjià, jiǔ yuè kāixué. — August is the break, school starts in September." },
  { chunks: ["十二月放假，", "一月", "开学。"], sentence: "十二月放假，一月开学。", gloss: "Shí'èr yuè fàngjià, yī yuè kāixué. — December is the break, school starts in January." },
  { chunks: ["四月放假，", "五月", "开学。"], sentence: "四月放假，五月开学。", gloss: "Sì yuè fàngjià, wǔ yuè kāixué. — April is the break, school starts in May." },
  { chunks: ["圣诞节是十二月，", "元旦节", "是一月。"], sentence: "圣诞节是十二月，元旦节是一月。", gloss: "Shèngdàn jié shì shí'èr yuè, Yuándàn jié shì yī yuè. — Christmas is in December, New Year's Day is in January." },
  { chunks: ["情人节是二月，", "母亲节", "是五月。"], sentence: "情人节是二月，母亲节是五月。", gloss: "Qíngrén jié shì èr yuè, Mǔqīn jié shì wǔ yuè. — Valentine's Day is in February, Mother's Day is in May." },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} is reading a class calendar aloud, taking a short pause at each comma, and reaches",
  "While reading a list of months and holidays with natural pauses, {name} reaches",
  "{name} reads a school-terms notice, pausing between clauses, and sees",
  "Reading the holiday calendar aloud with clear pausing, {name} comes to",
  "{name} is reading a note about the school year and pauses on",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this sentence about the school year aloud, pausing at the right spot, and one word is missing.",
  "Help {name} keep the natural pause in this sentence by filling in the missing pinyin word.",
  "{name} reads this sentence with clear pauses but stumbles on a missing word.",
  "To read this sentence clearly, {name} needs the missing word.",
  "{name} is reading a sentence about months and holidays aloud — type the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this sentence with a natural pause in the right place, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the sentence can be read with the correct pausing.",
  "{name} wrote this sentence about the calendar in pieces before reading it aloud. Put them in order.",
  "To read this sentence clearly, pausing where it makes sense, {name} first needs the pieces in order.",
  "{name} is practicing where to pause when reading aloud — arrange the pieces into the correct sentence.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a class calendar aloud, pausing between items, and sorting words as they go.",
  "Help {name} sort these words while reading through a list of months and holidays.",
  "{name} is practicing pausing correctly by sorting months, holidays, and school-term words.",
  "As {name} reads each word aloud, pausing naturally, sort it into the correct group.",
  "{name} is organizing a calendar reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each item into its correct group.",
  "Read each item and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the items below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading months and holidays aloud, pausing naturally, and matching each to its meaning.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practicing reading these words and connecting them to their meanings.",
  "As {name} reads each word aloud, match it to what it means.",
  "{name} is reviewing calendar vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], name: string): string {
  return randChoice(rng, pool).replace("{name}", name);
}

export const timeReading: Skill = {
  id: "g6-ma-r-time",
  code: "R.4",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: months and seasonal events with natural pauses",
  description: "Practice pronunciation and reading with natural pauses for months and seasonal events like holidays.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "order", "categorize", "match"] as const);
    const name = randChoice(rng, LEARNERS);

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const prompt = `${withName(rng, MC_OPENERS, name)} "${correct.hanzi} (${correct.pinyin})". ${randChoice(rng, MC_CLOSERS)}`;

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "A short pause after a comma helps you keep the meaning of each part clear as you read.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      const prompt = `${withName(rng, FILL_OPENERS, name)} ${randChoice(rng, FILL_CLOSERS)}`;

      return {
        kind: "fill-blank",
        prompt,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "Read the whole sentence through once, pausing where a comma or full stop would be, before you guess.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);
      const prompt = `${withName(rng, ORDER_OPENERS, name)} ${randChoice(rng, ORDER_CLOSERS)}`;

      return {
        kind: "ordering",
        prompt,
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "A holiday or month name usually comes first, followed by 是 and the month, or 放假/开学 with the correct month.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOCAB).slice(0, 9);
      const buckets: { id: Tag; label: string }[] = [
        { id: "month", label: "Month" },
        { id: "holiday", label: "Holiday" },
        { id: "phrase", label: "School-term word" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const v of chosen) correctBucket[v.hanzi] = v.tag;
      const prompt = `${withName(rng, CATEGORIZE_OPENERS, name)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`;

      return {
        kind: "categorize",
        prompt,
        items: shuffle(rng, chosen).map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets,
        correctBucket,
        hint: "Months name a point in the calendar; holidays name a celebration; the school-term words describe breaks and starts.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" is a ${buckets.find((b) => b.id === v.tag)!.label.toLowerCase()}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, VOCAB).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.hanzi] = v.hanzi;
    const prompt = `${withName(rng, MATCH_OPENERS, name)} ${randChoice(rng, MATCH_CLOSERS)}`;

    return {
      kind: "click-match",
      prompt,
      tokens,
      targets,
      correctMap,
      hint: "Read each word aloud with a natural pause, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
