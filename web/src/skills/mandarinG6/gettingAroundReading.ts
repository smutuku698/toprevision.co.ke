import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Reading R.9 "Getting Around" — focus: vocabulary development and reading
// strategies for comprehending school-facility location sentences.
// KIQ: "What strategies can one apply to ensure comprehension of texts?"

type Tag = "facility" | "location" | "question";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "library", tag: "facility" },
  { hanzi: "教室", pinyin: "jiàoshì", meaning: "classroom", tag: "facility" },
  { hanzi: "体育馆", pinyin: "tǐyùguǎn", meaning: "gymnasium", tag: "facility" },
  { hanzi: "操场", pinyin: "cāochǎng", meaning: "playground / field", tag: "facility" },
  { hanzi: "办公室", pinyin: "bàngōngshì", meaning: "office", tag: "facility" },
  { hanzi: "餐厅", pinyin: "cāntīng", meaning: "dining hall / cafeteria", tag: "facility" },
  { hanzi: "洗手间", pinyin: "xǐshǒujiān", meaning: "restroom", tag: "facility" },
  { hanzi: "前面", pinyin: "qiánmiàn", meaning: "in front", tag: "location" },
  { hanzi: "后面", pinyin: "hòumiàn", meaning: "behind", tag: "location" },
  { hanzi: "旁边", pinyin: "pángbiān", meaning: "beside / next to", tag: "location" },
  { hanzi: "对面", pinyin: "duìmiàn", meaning: "opposite / across from", tag: "location" },
  { hanzi: "教室在哪儿？", pinyin: "jiàoshì zài nǎr?", meaning: "where is the classroom?", tag: "question" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "图书馆在", after: "。", answer: "qiánmiàn", gloss: "图书馆在前面。— The library is in front." },
  { before: "操场在", after: "。", answer: "hòumiàn", gloss: "操场在后面。— The field is behind." },
  { before: "教室在", after: "。", answer: "pángbiān", gloss: "教室在旁边。— The classroom is beside." },
  { before: "办公室在", after: "。", answer: "duìmiàn", gloss: "办公室在对面。— The office is opposite." },
  { before: "", after: "在前面。", answer: "tǐyùguǎn", gloss: "体育馆在前面。— The gym is in front." },
  { before: "", after: "在后面。", answer: "cāntīng", gloss: "餐厅在后面。— The dining hall is behind." },
  { before: "图书馆在教室", after: "。", answer: "hòumiàn", gloss: "图书馆在教室后面。— The library is behind the classroom." },
  { before: "操场在教室", after: "。", answer: "hòumiàn", gloss: "操场在教室后面。— The field is behind the classroom." },
  { before: "教室在洗手间", after: "。", answer: "pángbiān", gloss: "教室在洗手间旁边。— The classroom is next to the restroom." },
  { before: "图书馆在办公室", after: "。", answer: "qiánmiàn", gloss: "图书馆在办公室前面。— The library is in front of the office." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["图书馆", "在", "前面", "。"], sentence: "图书馆在前面。", gloss: "Túshūguǎn zài qiánmiàn. — The library is in front." },
  { chunks: ["操场", "在", "后面", "。"], sentence: "操场在后面。", gloss: "Cāochǎng zài hòumiàn. — The field is behind." },
  { chunks: ["教室", "在", "旁边", "。"], sentence: "教室在旁边。", gloss: "Jiàoshì zài pángbiān. — The classroom is beside." },
  { chunks: ["办公室", "在", "对面", "。"], sentence: "办公室在对面。", gloss: "Bàngōngshì zài duìmiàn. — The office is opposite." },
  { chunks: ["体育馆", "在", "前面", "。"], sentence: "体育馆在前面。", gloss: "Tǐyùguǎn zài qiánmiàn. — The gym is in front." },
  { chunks: ["餐厅", "在", "后面", "。"], sentence: "餐厅在后面。", gloss: "Cāntīng zài hòumiàn. — The dining hall is behind." },
  { chunks: ["图书馆", "在", "教室", "后面", "。"], sentence: "图书馆在教室后面。", gloss: "Túshūguǎn zài jiàoshì hòumiàn. — The library is behind the classroom." },
  { chunks: ["操场", "在", "教室", "后面", "。"], sentence: "操场在教室后面。", gloss: "Cāochǎng zài jiàoshì hòumiàn. — The field is behind the classroom." },
  { chunks: ["教室", "在", "洗手间", "旁边", "。"], sentence: "教室在洗手间旁边。", gloss: "Jiàoshì zài xǐshǒujiān pángbiān. — The classroom is next to the restroom." },
  { chunks: ["图书馆", "在", "办公室", "前面", "。"], sentence: "图书馆在办公室前面。", gloss: "Túshūguǎn zài bàngōngshì qiánmiàn. — The library is in front of the office." },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} reads a school map label and uses reading strategies to work out",
  "While reading a location sentence, {name} pauses on",
  "{name} reads a school-map sentence and comes across",
  "Reading a set of directions, {name} uses context to work out",
  "{name} is reading a note about the school layout and pauses on",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word, based on the sentence around it?",
  "What is the best English meaning for this word?",
];

const FILL_OPENERS = [
  "{name} is reading this location sentence aloud and uses the words around the gap as a clue.",
  "Help {name} use reading strategies to figure out the missing pinyin word.",
  "{name} reads this sentence about the school layout but one word is missing.",
  "Using the surrounding words as a clue, {name} needs to fill in the missing word.",
  "{name} is reading a location sentence aloud — use context to type the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this location sentence, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the sentence makes sense when read aloud.",
  "{name} wrote this sentence about the school layout in pieces. Put them in order.",
  "To read this sentence clearly, {name} first needs the pieces in order.",
  "{name} is practicing reading location sentences — arrange the pieces into the correct sentence.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a school map, sorting words by type as they read.",
  "Help {name} sort these words while reading through a school-layout description.",
  "{name} is practicing comprehension by sorting facilities, locations, and questions.",
  "As {name} reads each word or phrase aloud, sort it into the correct group.",
  "{name} is organizing a school-layout reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each item into its correct group.",
  "Read each item and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the items below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading school-facility words aloud and matching each to its meaning.",
  "Help {name} match each word read aloud to its correct English meaning.",
  "{name} is practicing reading these words and connecting them to their meanings.",
  "As {name} reads each word aloud, match it to what it means.",
  "{name} is reviewing school-facility vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word or phrase to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], learnerName: string): string {
  return randChoice(rng, pool).replace("{name}", learnerName);
}

export const gettingAroundReading: Skill = {
  id: "g6-ma-r-getting-around",
  code: "R.9",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: finding your way around school",
  description: "Vocabulary development and reading strategies for comprehending school-facility location sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "fill", "order", "categorize", "match"] as const);
    const learnerName = randChoice(rng, LEARNERS);

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const prompt = `${withName(rng, MC_OPENERS, learnerName)} "${correct.hanzi} (${correct.pinyin})". ${randChoice(rng, MC_CLOSERS)}`;

      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether it names a place, tells its location, or asks a question about location.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      const prompt = `${withName(rng, FILL_OPENERS, learnerName)} ${randChoice(rng, FILL_CLOSERS)}`;

      return {
        kind: "fill-blank",
        prompt,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This sentence follows the pattern [facility] 在 [location]。",
        explanation: item.gloss,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);
      const prompt = `${withName(rng, ORDER_OPENERS, learnerName)} ${randChoice(rng, ORDER_CLOSERS)}`;

      return {
        kind: "ordering",
        prompt,
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Name the facility first, then 在, then (if needed) a second facility, then the location word.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const facilities = shuffle(rng, VOCAB.filter((v) => v.tag === "facility")).slice(0, 5);
      const locations = shuffle(rng, VOCAB.filter((v) => v.tag === "location"));
      const items = shuffle(rng, [...facilities, ...locations]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;
      const prompt = `${withName(rng, CATEGORIZE_OPENERS, learnerName)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`;

      return {
        kind: "categorize",
        prompt,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "facility", label: "School Facility" },
          { id: "location", label: "Location Word" },
        ],
        correctBucket,
        hint: "A facility names a place; a location word tells you where something is relative to another place.",
        explanation: [...facilities, ...locations].map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "facility" ? "school facility" : "location word"}.`).join(" "),
      };
    }

    const chosen = shuffle(rng, VOCAB).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.hanzi] = v.hanzi;
    const prompt = `${withName(rng, MATCH_OPENERS, learnerName)} ${randChoice(rng, MATCH_CLOSERS)}`;

    return {
      kind: "click-match",
      prompt,
      tokens,
      targets,
      correctMap,
      hint: "Read each word aloud, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
