import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.9 "Getting Around" — focus: handwriting (legibility, neatness) and
// paragraph writing (organisation, coherence) for school-location sentences. The "order" branch
// reorders a QUESTION and its ANSWER as a two-sentence paragraph — the sub-strand's own
// paragraph-coherence focus — rather than single-sentence word chunks (already covered by the
// Listening&Speaking and Reading files for this theme).
// KIQ: "What role does handwriting play in communication?"

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
  { before: "教室在图书馆", after: "。", answer: "pángbiān", gloss: "教室在图书馆旁边。— The classroom is beside the library." },
  { before: "教室在体育馆", after: "。", answer: "qiánmiàn", gloss: "教室在体育馆前面。— The classroom is in front of the gym." },
  { before: "教室在操场", after: "。", answer: "hòumiàn", gloss: "教室在操场后面。— The classroom is behind the field." },
  { before: "教室在办公室", after: "。", answer: "duìmiàn", gloss: "教室在办公室对面。— The classroom is opposite the office." },
  { before: "教室在餐厅", after: "。", answer: "pángbiān", gloss: "教室在餐厅旁边。— The classroom is beside the dining hall." },
  { before: "教室在洗手间", after: "。", answer: "pángbiān", gloss: "教室在洗手间旁边。— The classroom is next to the restroom." },
  { before: "教室在图书馆", after: "。", answer: "qiánmiàn", gloss: "教室在图书馆前面。— The classroom is in front of the library." },
  { before: "教室在体育馆", after: "。", answer: "hòumiàn", gloss: "教室在体育馆后面。— The classroom is behind the gym." },
  { before: "教室在操场", after: "。", answer: "duìmiàn", gloss: "教室在操场对面。— The classroom is opposite the field." },
  { before: "教室在办公室", after: "。", answer: "pángbiān", gloss: "教室在办公室旁边。— The classroom is beside the office." },
];

const QUESTION = { hanzi: "教室在哪儿？", pinyin: "jiàoshì zài nǎr?" };
const PARAGRAPH_SETS: { answer: string; pinyin: string; gloss: string }[] = [
  { answer: "教室在图书馆旁边。", pinyin: "Jiàoshì zài túshūguǎn pángbiān.", gloss: "The classroom is beside the library." },
  { answer: "教室在体育馆前面。", pinyin: "Jiàoshì zài tǐyùguǎn qiánmiàn.", gloss: "The classroom is in front of the gym." },
  { answer: "教室在操场后面。", pinyin: "Jiàoshì zài cāochǎng hòumiàn.", gloss: "The classroom is behind the field." },
  { answer: "教室在办公室对面。", pinyin: "Jiàoshì zài bàngōngshì duìmiàn.", gloss: "The classroom is opposite the office." },
  { answer: "教室在餐厅旁边。", pinyin: "Jiàoshì zài cāntīng pángbiān.", gloss: "The classroom is beside the dining hall." },
  { answer: "教室在洗手间旁边。", pinyin: "Jiàoshì zài xǐshǒujiān pángbiān.", gloss: "The classroom is next to the restroom." },
  { answer: "教室在图书馆前面。", pinyin: "Jiàoshì zài túshūguǎn qiánmiàn.", gloss: "The classroom is in front of the library." },
  { answer: "教室在体育馆后面。", pinyin: "Jiàoshì zài tǐyùguǎn hòumiàn.", gloss: "The classroom is behind the gym." },
  { answer: "教室在操场对面。", pinyin: "Jiàoshì zài cāochǎng duìmiàn.", gloss: "The classroom is opposite the field." },
  { answer: "教室在办公室旁边。", pinyin: "Jiàoshì zài bàngōngshì pángbiān.", gloss: "The classroom is beside the office." },
];

const MATCH_OPENERS = [
  "Match each word below to its correct English meaning",
  "Pair every facility or location word with what it means in English",
  "Connect each expression to its correct translation",
  "Find the right English meaning for each item shown",
  "Read each word carefully, then match it to its meaning",
];
const MATCH_CLOSERS = [
  "so your directions stay accurate.",
  "before writing it into a paragraph.",
  "to make sure your spelling reflects the right meaning.",
  "so a reader recognizes each word correctly.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each word below as a School Facility or a Location Word",
  "Group these written words under School Facility or Location Word",
  "Decide whether each item is a School Facility or a Location Word, then sort it",
  "Classify each expression as a School Facility or a Location Word",
  "Organize these words into School Facility or Location Word groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a clear paragraph about school locations.",
  "so your written directions stay organized.",
  "before drafting sentences about the school.",
  "to check you recognize each word correctly.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const MC_OPENERS = [
  "Writing neatly in a school-map paragraph, a learner includes the word",
  "A learner's handwritten paragraph about the school layout uses",
  "While writing legibly about school facilities, a learner includes",
  "A learner writing directions to a visitor uses the word",
  "In a neatly written paragraph about the school, a learner uses",
];
const MC_CLOSERS = [
  "What does this word mean?",
  "What is the correct English meaning?",
  "Which English meaning matches it?",
  "What should a reader understand this word to mean?",
];
const MC_PROMPTS = composePrompts(MC_OPENERS, MC_CLOSERS);

const FILL_OPENERS = [
  "Fill in the missing pinyin word to complete the sentence",
  "Type the missing pinyin word that completes this sentence correctly",
  "Complete the sentence by filling in the missing pinyin word",
  "Write the correct pinyin word in the blank to finish the sentence",
  "Supply the missing pinyin word so the sentence reads correctly",
];
const FILL_CLOSERS = [
  "(tone marks optional).",
  "to keep your paragraph accurate.",
  "so the sentence is spelled correctly.",
  "before checking your written work.",
];
const FILL_PROMPTS = composePrompts(FILL_OPENERS, FILL_CLOSERS);

const ORDER_OPENERS = [
  "Arrange these two sentences into a coherent, well-organized paragraph",
  "Put the question and its answer in the correct order for a clear paragraph",
  "Sequence these two sentences so the paragraph reads coherently",
  "Reorder these two sentences to write a logically organized paragraph",
  "Work out which sentence comes first, then arrange them for a clear paragraph",
];
const ORDER_CLOSERS = [
  "so a reader can follow it clearly.",
  "for neat, well-organized handwriting practice.",
  "before copying it neatly into your notebook.",
  "to keep the paragraph coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const gettingAroundWriting: Skill = {
  id: "g6-ma-w-getting-around",
  code: "W.9",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing a paragraph about school locations",
  description: "Handwriting legibility and neatness, plus organizing a question-and-answer pair into a coherent written paragraph.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB.filter((v) => v.tag !== "question")).slice(0, 6);
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
        hint: "Write each character neatly and check it against its meaning before moving on.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const facilities = shuffle(rng, VOCAB.filter((v) => v.tag === "facility")).slice(0, 4);
      const locations = shuffle(rng, VOCAB.filter((v) => v.tag === "location"));
      const items = shuffle(rng, [...facilities, ...locations]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "facility", label: "School Facility" },
          { id: "location", label: "Location Word" },
        ],
        correctBucket,
        hint: "A facility names a place; a location word tells you where it is relative to another place.",
        explanation: [...facilities, ...locations].map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "facility" ? "school facility" : "location word"}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, Array.from(new Set([correct.meaning, ...distractors.map((d) => d.meaning)])));

      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, MC_PROMPTS)} "${correct.hanzi} (${correct.pinyin})".`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Think about whether it names a place, tells its location, or asks a question.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
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
        hint: "This sentence follows the pattern 教室在 [facility] [location]。",
        explanation: item.gloss,
      };
    }

    const answer = randChoice(rng, PARAGRAPH_SETS);
    const parts = [
      { id: "q", label: `${QUESTION.hanzi} (${QUESTION.pinyin})` },
      { id: "a", label: `${answer.answer} (${answer.pinyin})` },
    ];
    const items = shuffle(rng, parts);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the sentences in the correct order.",
      items,
      correctOrder: ["q", "a"],
      hint: "A coherent paragraph asks the question first, then gives the answer — not the other way around.",
      explanation: `${QUESTION.hanzi} ${answer.answer} — ${QUESTION.pinyin} ${answer.gloss}`,
    };
  },
};
