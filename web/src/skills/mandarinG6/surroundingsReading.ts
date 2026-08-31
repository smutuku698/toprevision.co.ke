import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

type Tag = "place" | "phrase";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "library", tag: "place" },
  { hanzi: "教室", pinyin: "jiàoshì", meaning: "classroom", tag: "place" },
  { hanzi: "体育馆", pinyin: "tǐyùguǎn", meaning: "gymnasium", tag: "place" },
  { hanzi: "操场", pinyin: "cāochǎng", meaning: "playground / field", tag: "place" },
  { hanzi: "办公室", pinyin: "bàngōngshì", meaning: "office", tag: "place" },
  { hanzi: "教师休息室", pinyin: "jiàoshī xiūxíshì", meaning: "teachers' lounge", tag: "place" },
  { hanzi: "餐厅", pinyin: "cāntīng", meaning: "dining hall / cafeteria", tag: "place" },
  { hanzi: "你去哪儿？", pinyin: "nǐ qù nǎr?", meaning: "where are you going?", tag: "phrase" },
  { hanzi: "老师去哪儿了？", pinyin: "lǎoshī qù nǎr le?", meaning: "where did the teacher go?", tag: "phrase" },
  { hanzi: "老师在……吗？", pinyin: "lǎoshī zài……ma?", meaning: "is the teacher at…?", tag: "phrase" },
  { hanzi: "同学去操场了", pinyin: "tóngxué qù cāochǎng le", meaning: "the classmate went to the field", tag: "phrase" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Lǎoshī zài ", after: " ma?", answer: "túshūguǎn", gloss: "老师在图书馆吗？— Is the teacher at the library?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "jiàoshì", gloss: "老师在教室吗？— Is the teacher in the classroom?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "tǐyùguǎn", gloss: "老师在体育馆吗？— Is the teacher at the gymnasium?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "cāochǎng", gloss: "老师在操场吗？— Is the teacher at the field?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "bàngōngshì", gloss: "老师在办公室吗？— Is the teacher in the office?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "jiàoshī xiūxíshì", gloss: "老师在教师休息室吗？— Is the teacher in the teachers' lounge?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "cāntīng", gloss: "老师在餐厅吗？— Is the teacher in the dining hall?" },
  { before: "Nǐ ", after: " nǎr?", answer: "qù", gloss: "你去哪儿？— Where are you going?" },
  { before: "Tóngxué qù ", after: " le.", answer: "cāochǎng", gloss: "同学去操场了。— The classmate went to the field." },
  { before: "Tóngxué qù ", after: " le.", answer: "túshūguǎn", gloss: "同学去图书馆了。— The classmate went to the library." },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["你", "去", "哪儿？"], sentence: "你去哪儿？", gloss: "Nǐ qù nǎr? — Where are you going?" },
  { chunks: ["老师", "去哪儿", "了？"], sentence: "老师去哪儿了？", gloss: "Lǎoshī qù nǎr le? — Where did the teacher go?" },
  { chunks: ["老师", "在图书馆", "吗？"], sentence: "老师在图书馆吗？", gloss: "Lǎoshī zài túshūguǎn ma? — Is the teacher at the library?" },
  { chunks: ["老师", "在教室", "吗？"], sentence: "老师在教室吗？", gloss: "Lǎoshī zài jiàoshì ma? — Is the teacher in the classroom?" },
  { chunks: ["老师", "在体育馆", "吗？"], sentence: "老师在体育馆吗？", gloss: "Lǎoshī zài tǐyùguǎn ma? — Is the teacher at the gymnasium?" },
  { chunks: ["老师", "在操场", "吗？"], sentence: "老师在操场吗？", gloss: "Lǎoshī zài cāochǎng ma? — Is the teacher at the field?" },
  { chunks: ["老师", "在办公室", "吗？"], sentence: "老师在办公室吗？", gloss: "Lǎoshī zài bàngōngshì ma? — Is the teacher in the office?" },
  { chunks: ["老师", "在教师休息室", "吗？"], sentence: "老师在教师休息室吗？", gloss: "Lǎoshī zài jiàoshī xiūxíshì ma? — Is the teacher in the teachers' lounge?" },
  { chunks: ["老师", "在餐厅", "吗？"], sentence: "老师在餐厅吗？", gloss: "Lǎoshī zài cāntīng ma? — Is the teacher in the dining hall?" },
  { chunks: ["同学", "去", "操场了。"], sentence: "同学去操场了。", gloss: "Tóngxué qù cāochǎng le. — The classmate went to the field." },
];

const LEARNERS = ["Wanjiru", "Otieno", "Amina", "Kiptoo", "Njoki", "Baraka", "Achieng", "Mutiso", "Naliaka", "Cherotich"];

const MC_OPENERS = [
  "{name} is reading a school map aloud, using rising and falling intonation, and spots",
  "While reading a list of school facilities with clear phrasing, {name} reaches",
  "{name} reads a note about where people have gone, pausing between phrases, and sees",
  "Reading the school directory aloud with expression, {name} comes to",
  "{name} is reading a sign around the school and pauses on",
];
const MC_CLOSERS = [
  "What does it mean?",
  "What is the correct English meaning?",
  "Which meaning matches this word or phrase?",
  "What is the best English meaning for this word or phrase?",
];

const FILL_OPENERS = [
  "{name} is reading this sentence about the school aloud, grouping the words into phrases, and one word is missing.",
  "Help {name} keep the right intonation by filling in the missing pinyin word.",
  "{name} reads this sentence with clear phrasing but stumbles on a missing word.",
  "To read this sentence clearly, {name} needs the missing word.",
  "{name} is reading a sentence about school facilities aloud — type the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Type the missing pinyin word.",
  "Complete the sentence below.",
  "Enter the correct pinyin to fill the gap.",
  "Write the missing word in pinyin (tone marks optional).",
];

const ORDER_OPENERS = [
  "{name} wants to read this sentence with clear phrasing, but the pieces are jumbled.",
  "Help {name} arrange these pieces so the sentence can be read with the right intonation.",
  "{name} wrote this sentence about the school in pieces before reading it aloud. Put them in order.",
  "To read this sentence clearly and with expression, {name} first needs the pieces in order.",
  "{name} is practicing phrasing for reading aloud — arrange the pieces into the correct sentence.",
];
const ORDER_CLOSERS = [
  "Arrange the pieces into the correct sentence.",
  "Click the pieces in the correct reading order.",
  "Put the words in the order they should be read.",
  "Reorder the pieces to form a correct sentence.",
];

const CATEGORIZE_OPENERS = [
  "{name} is reading a school facilities list aloud, grouping words as they read.",
  "Help {name} sort these words while reading through a school map.",
  "{name} is practicing clear phrasing by sorting place names and location questions.",
  "As {name} reads each word or phrase aloud, sort it into the correct group.",
  "{name} is organizing a school-surroundings reading list by type.",
];
const CATEGORIZE_CLOSERS = [
  "Sort each item into its correct group.",
  "Read each item and place it in the right category.",
  "Drag each item into the correct bucket.",
  "Sort the items below by type.",
];

const MATCH_OPENERS = [
  "{name} is reading school-facility words aloud, with clear intonation, and matching each to its meaning.",
  "Help {name} match each word or phrase read aloud to its correct English meaning.",
  "{name} is practicing reading these words and connecting them to their meanings.",
  "As {name} reads each word aloud, match it to what it means.",
  "{name} is reviewing school-surroundings vocabulary by matching words to meanings.",
];
const MATCH_CLOSERS = [
  "Match each word to its meaning.",
  "Connect each word to its correct English meaning.",
  "Match the Mandarin word or phrase to what it means in English.",
  "Pair each word with its meaning.",
];

function withName(rng: () => number, pool: string[], name: string): string {
  return randChoice(rng, pool).replace("{name}", name);
}

export const surroundingsReading: Skill = {
  id: "g6-ma-r-surroundings",
  code: "R.3",
  subjectId: "mandarin",
  strandId: "g6-ma-reading",
  grade: 6,
  title: "Reading: school facilities with clear intonation",
  description: "Build vocabulary and fluency — intonation and phrasing — reading about school facilities and locations.",
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
        hint: "Group the syllables into one phrase in your mind before deciding what it means.",
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
        hint: "Read the whole sentence through once, grouping it into phrases, before you guess the missing word.",
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
        hint: "The subject usually comes first, then the location phrase, then the question or statement ending.",
        explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOCAB).slice(0, 7);
      const buckets: { id: Tag; label: string }[] = [
        { id: "place", label: "Place / location noun" },
        { id: "phrase", label: "Question or sentence about location" },
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
        hint: "A place noun names a location; a phrase is a full question or statement about where someone is or went.",
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
      hint: "Read each word or phrase with the right phrasing, then find its meaning on the right.",
      explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
    };
  },
};
