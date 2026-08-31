import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";
import { name, place } from "./shared";

type Tag = "facility" | "phrase";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: Tag }[] = [
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "library", tag: "facility" },
  { hanzi: "教室", pinyin: "jiàoshì", meaning: "classroom", tag: "facility" },
  { hanzi: "体育馆", pinyin: "tǐyùguǎn", meaning: "gymnasium", tag: "facility" },
  { hanzi: "操场", pinyin: "cāochǎng", meaning: "playground / field", tag: "facility" },
  { hanzi: "办公室", pinyin: "bàngōngshì", meaning: "office", tag: "facility" },
  { hanzi: "教师休息室", pinyin: "jiàoshī xiūxíshì", meaning: "teachers' lounge", tag: "facility" },
  { hanzi: "餐厅", pinyin: "cāntīng", meaning: "dining hall / cafeteria", tag: "facility" },
  { hanzi: "你去哪儿？", pinyin: "nǐ qù nǎr?", meaning: "where are you going?", tag: "phrase" },
  { hanzi: "老师去哪儿了？", pinyin: "lǎoshī qù nǎr le?", meaning: "where did the teacher go?", tag: "phrase" },
  { hanzi: "老师在……吗？", pinyin: "lǎoshī zài……ma?", meaning: "is the teacher at…?", tag: "phrase" },
  { hanzi: "同学去操场了", pinyin: "tóngxué qù cāochǎng le", meaning: "the classmate went to the field", tag: "phrase" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Lǎoshī zài ", after: " ma?", answer: "túshūguǎn", gloss: "老师在图书馆吗？— Is the teacher at the library?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "jiàoshì", gloss: "老师在教室吗？— Is the teacher at the classroom?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "tǐyùguǎn", gloss: "老师在体育馆吗？— Is the teacher at the gymnasium?" },
  { before: "Lǎoshī zài ", after: " ma?", answer: "bàngōngshì", gloss: "老师在办公室吗？— Is the teacher at the office?" },
  { before: "Tóngxué qù ", after: " le.", answer: "cāntīng", gloss: "同学去餐厅了。— The classmate went to the dining hall." },
  { before: "Tóngxué qù ", after: " le.", answer: "cāochǎng", gloss: "同学去操场了。— The classmate went to the field." },
  { before: "Tóngxué qù ", after: " le.", answer: "jiàoshī xiūxíshì", gloss: "同学去教师休息室了。— The classmate went to the teachers' lounge." },
  { before: "Nǐ ", after: " nǎr?", answer: "qù", gloss: "你去哪儿？— Where are you going?" },
  { before: "Lǎoshī qù nǎr ", after: "?", answer: "le", gloss: "老师去哪儿了？— Where did the teacher go?" },
  { before: "Lǎoshī zài túshūguǎn ", after: "?", answer: "ma", gloss: "老师在图书馆吗？— Is the teacher at the library?" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["老师在", "图书馆", "吗？"], sentence: "老师在图书馆吗？", gloss: "Lǎoshī zài túshūguǎn ma? — Is the teacher at the library?" },
  { chunks: ["老师在", "体育馆", "吗？"], sentence: "老师在体育馆吗？", gloss: "Lǎoshī zài tǐyùguǎn ma? — Is the teacher at the gymnasium?" },
  { chunks: ["老师在", "办公室", "吗？"], sentence: "老师在办公室吗？", gloss: "Lǎoshī zài bàngōngshì ma? — Is the teacher at the office?" },
  { chunks: ["同学去", "操场", "了。"], sentence: "同学去操场了。", gloss: "Tóngxué qù cāochǎng le. — The classmate went to the field." },
  { chunks: ["同学去", "餐厅", "了。"], sentence: "同学去餐厅了。", gloss: "Tóngxué qù cāntīng le. — The classmate went to the dining hall." },
  { chunks: ["同学去", "教室", "了。"], sentence: "同学去教室了。", gloss: "Tóngxué qù jiàoshì le. — The classmate went to the classroom." },
  { chunks: ["你去", "哪儿？"], sentence: "你去哪儿？", gloss: "Nǐ qù nǎr? — Where are you going?" },
  { chunks: ["老师去", "哪儿", "了？"], sentence: "老师去哪儿了？", gloss: "Lǎoshī qù nǎr le? — Where did the teacher go?" },
  { chunks: ["老师在", "教师休息室", "吗？"], sentence: "老师在教师休息室吗？", gloss: "Lǎoshī zài jiàoshī xiūxíshì ma? — Is the teacher at the teachers' lounge?" },
  { chunks: ["同学去", "图书馆", "了。"], sentence: "同学去图书馆了。", gloss: "Tóngxué qù túshūguǎn le. — The classmate went to the library." },
];

const MATCH_OPENERS = [
  "Match each school-surroundings word to its correct English meaning.",
  "Pair up every expression below with what it means in English.",
  "Connect each term to its correct translation.",
  "Find the right English meaning for each item shown.",
  "Look at each word and match it to its meaning.",
];
const MATCH_CLOSERS = [
  "Say each one aloud in your head as you match it.",
  "Match every item before you check your answers.",
  "Think about the pinyin pronunciation as you decide.",
  "Take your time with each pair.",
];

const CATEGORIZE_OPENERS = [
  "Sort each item below into the correct group.",
  "Decide which category each expression belongs to.",
  "Group these words by whether they name a place or ask/state a location.",
  "Place each item into its matching bucket.",
  "Look at each expression and choose the right category for it.",
];
const CATEGORIZE_CLOSERS = [
  "Think about whether it names a place or forms a question.",
  "Some are school facilities, others are location questions.",
  "Use what you know about each expression's purpose.",
  "Check each one carefully before moving on.",
];

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence.",
  "Complete the sentence below with the correct pinyin word.",
  "Type the missing word (tone marks optional) to finish the sentence.",
  "One word is missing from this spoken sentence — fill it in.",
  "Read the sentence and supply the missing pinyin word.",
];
const FILL_CLOSERS = [
  "Tone marks are optional if you can't type them.",
  "Think about what makes the sentence grammatically complete.",
  "Sound the sentence out before you answer.",
  "Check the surrounding words for clues.",
];

const ORDER_OPENERS = [
  "Arrange the hanzi pieces to form a correct spoken sentence.",
  "Put the words in the right order to make a complete sentence.",
  "Reorder the chunks below into a correct Mandarin sentence.",
  "Rebuild the sentence by placing each piece in order.",
  "Click the pieces in the order a fluent speaker would say them.",
];
const ORDER_CLOSERS = [
  "Say the sentence in your head as you order the pieces.",
  "Think about which part comes first when asking about a place.",
  "Check the meaning of each chunk before deciding its place.",
  "The subject usually comes first, then the location.",
];

const MC_OPENERS: ((n: string, p: string, hanzi: string, pinyin: string) => string)[] = [
  (n, p, hanzi, pinyin) => `${n}, a Grade 6 learner in ${p}, is asked by a classmate "${hanzi} (${pinyin})" between lessons.`,
  (n, p, hanzi, pinyin) => `${n} is helping a new student find their way around school in ${p} and points, saying "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `During a listening exercise about the school compound, ${n} hears the words "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `${n}'s teacher in ${p} asks the class to explain the meaning of "${hanzi} (${pinyin})".`,
  (n, p, hanzi, pinyin) => `While practising directions around campus, ${n} reads the sign "${hanzi} (${pinyin})".`,
];
const MC_CLOSERS = [
  "What does this mean in English?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should the class understand this to mean?",
];

export const surroundingsSpeaking: Skill = {
  id: "g6-ma-ls-surroundings",
  code: "LS.3",
  subjectId: "mandarin",
  strandId: "g6-ma-listening-speaking",
  grade: 6,
  title: "My surroundings",
  description: "School facility words and location questions — oral vocabulary for describing and asking about the school compound.",
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
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "在 (zài) means 'at/in a place'; 去 (qù) means 'to go to a place'.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const facilities = shuffle(rng, VOCAB.filter((v) => v.tag === "facility")).slice(0, 4);
      const phrases = shuffle(rng, VOCAB.filter((v) => v.tag === "phrase")).slice(0, 3);
      const items = shuffle(rng, [...facilities, ...phrases]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "facility", label: "School Facility" },
          { id: "phrase", label: "Question / Location Phrase" },
        ],
        correctBucket,
        hint: "A facility names a single place; a phrase is a whole spoken question or sentence about a place.",
        explanation: [...facilities, ...phrases]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "facility" ? "school facility" : "question/location phrase"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));
      const n = name(rng);
      const p = place(rng);
      const scenario = randChoice(rng, MC_OPENERS)(n, p, correct.hanzi, correct.pinyin);

      return {
        kind: "multiple-choice",
        prompt: `${scenario} ${randChoice(rng, MC_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether this names a place or asks/states where someone is or went.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "老师在……吗？asks if the teacher is at a place; 同学去……了 says a classmate went to a place.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Say who or what is being asked about first, then the place, then the question marker.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
