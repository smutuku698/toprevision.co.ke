import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors, composePrompts } from "../mandarin/mandarinUtils";

// Grade 6 Mandarin Writing W.3 "Surroundings" — focus: vocabulary development and paragraph
// writing (organisation, coherence) about school facilities and locations. KIQ: "Why is clarity
// important in written communication?"

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "room" | "field" }[] = [
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "library", tag: "room" },
  { hanzi: "教室", pinyin: "jiàoshì", meaning: "classroom", tag: "room" },
  { hanzi: "办公室", pinyin: "bàngōngshì", meaning: "office", tag: "room" },
  { hanzi: "教师休息室", pinyin: "jiàoshī xiūxíshì", meaning: "teachers' lounge", tag: "room" },
  { hanzi: "餐厅", pinyin: "cāntīng", meaning: "dining hall / cafeteria", tag: "room" },
  { hanzi: "体育馆", pinyin: "tǐyùguǎn", meaning: "gymnasium", tag: "field" },
  { hanzi: "操场", pinyin: "cāochǎng", meaning: "playground / field", tag: "field" },
];

// "Wǒ yào qù ___。" (我要去…… — I want to go to …) with the destination blanked for all seven
// facilities, plus three entries blanking the verb "qù" (去) instead, for variety.
const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ yào qù ", after: "。", answer: "túshūguǎn", gloss: "我要去图书馆。— I want to go to the library." },
  { before: "Wǒ yào qù ", after: "。", answer: "jiàoshì", gloss: "我要去教室。— I want to go to the classroom." },
  { before: "Wǒ yào qù ", after: "。", answer: "bàngōngshì", gloss: "我要去办公室。— I want to go to the office." },
  { before: "Wǒ yào qù ", after: "。", answer: "jiàoshī xiūxíshì", gloss: "我要去教师休息室。— I want to go to the teachers' lounge." },
  { before: "Wǒ yào qù ", after: "。", answer: "cāntīng", gloss: "我要去餐厅。— I want to go to the dining hall." },
  { before: "Wǒ yào qù ", after: "。", answer: "tǐyùguǎn", gloss: "我要去体育馆。— I want to go to the gymnasium." },
  { before: "Wǒ yào qù ", after: "。", answer: "cāochǎng", gloss: "我要去操场。— I want to go to the field." },
  { before: "Wǒ yào ", after: " túshūguǎn。", answer: "qù", gloss: "我要去图书馆。— I want to go to the library." },
  { before: "Wǒ yào ", after: " bàngōngshì。", answer: "qù", gloss: "我要去办公室。— I want to go to the office." },
  { before: "Wǒ yào ", after: " tǐyùguǎn。", answer: "qù", gloss: "我要去体育馆。— I want to go to the gymnasium." },
];

// "我要去 X。" as ordering chunks, one per facility.
const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我要去", "图书馆", "。"], sentence: "我要去图书馆。", gloss: "Wǒ yào qù túshūguǎn. — I want to go to the library." },
  { chunks: ["我要去", "教室", "。"], sentence: "我要去教室。", gloss: "Wǒ yào qù jiàoshì. — I want to go to the classroom." },
  { chunks: ["我要去", "办公室", "。"], sentence: "我要去办公室。", gloss: "Wǒ yào qù bàngōngshì. — I want to go to the office." },
  { chunks: ["我要去", "教师休息室", "。"], sentence: "我要去教师休息室。", gloss: "Wǒ yào qù jiàoshī xiūxíshì. — I want to go to the teachers' lounge." },
  { chunks: ["我要去", "餐厅", "。"], sentence: "我要去餐厅。", gloss: "Wǒ yào qù cāntīng. — I want to go to the dining hall." },
  { chunks: ["我要去", "体育馆", "。"], sentence: "我要去体育馆。", gloss: "Wǒ yào qù tǐyùguǎn. — I want to go to the gymnasium." },
  { chunks: ["我要去", "操场", "。"], sentence: "我要去操场。", gloss: "Wǒ yào qù cāochǎng. — I want to go to the field." },
];

const MATCH_OPENERS = [
  "Match each school facility to its correct English meaning",
  "Pair every written location word below with the meaning it stands for",
  "Connect each facility name to the English meaning it matches",
  "Work out what each school location means, then match it",
  "Line up each written facility word with its correct English meaning",
];
const MATCH_CLOSERS = [
  "so your writing about school stays clear.",
  "before using it in a written paragraph.",
  "to make sure your vocabulary is accurate.",
  "so a reader recognizes exactly which place you mean.",
];
const MATCH_PROMPTS = composePrompts(MATCH_OPENERS, MATCH_CLOSERS);

const CATEGORIZE_OPENERS = [
  "Sort each facility below as an Indoor Room or an Open-Air Field",
  "Group these written location words under Indoor Room or Open-Air Field",
  "Decide whether each facility is an Indoor Room or an Open-Air Field, then sort it",
  "Classify each school location as an Indoor Room or an Open-Air Field",
  "Organize these facility words into Indoor Room or Open-Air Field groups",
];
const CATEGORIZE_CLOSERS = [
  "to plan a clearly organized paragraph.",
  "so your writing about the school stays coherent.",
  "before describing where things happen at school.",
  "to check your vocabulary is accurate.",
];
const CATEGORIZE_PROMPTS = composePrompts(CATEGORIZE_OPENERS, CATEGORIZE_CLOSERS);

const MC_OPENERS = [
  "A learner is writing about where to go after class and needs the exact word for",
  "To keep a paragraph about school clear, which written word means",
  "Which facility name correctly means",
  "A pupil drafting directions around school must correctly spell the word for",
  "For clarity in written Mandarin, which word means",
];
const MC_CLOSERS = ['?', ", exactly?", " in their writing?", " when naming this place?"];

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
  "Arrange the hanzi pieces to form a correctly written sentence",
  "Put these hanzi phrases in the right order to build a clear sentence",
  "Sequence the hanzi chunks so the written sentence makes sense",
  "Reorder these pieces to write a grammatically correct sentence",
  "Work out the correct word order, then arrange the hanzi pieces",
];
const ORDER_CLOSERS = [
  "for a clearly organized paragraph.",
  "so a reader can follow it clearly.",
  "before writing it into a description of school.",
  "to keep the sentence coherent.",
];
const ORDER_PROMPTS = composePrompts(ORDER_OPENERS, ORDER_CLOSERS);

export const surroundingsWriting: Skill = {
  id: "g6-ma-w-surroundings",
  code: "W.3",
  subjectId: "mandarin",
  strandId: "g6-ma-writing",
  grade: 6,
  title: "Writing about school facilities",
  description: "Vocabulary development and paragraph organisation for describing school facilities and locations.",
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
        hint: "Most facility names end in 室/馆/厅/场 — a hint about what kind of space it is.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const rooms = shuffle(rng, VOCAB.filter((v) => v.tag === "room")).slice(0, 4);
      const fields = shuffle(rng, VOCAB.filter((v) => v.tag === "field")).slice(0, 2);
      const items = shuffle(rng, [...rooms, ...fields]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "room", label: "Indoor Room" },
          { id: "field", label: "Open-Air Field" },
        ],
        correctBucket,
        hint: "体育馆 and 操场 are large open-air spaces for sport; the rest are indoor rooms.",
        explanation: items.map((v) => `"${v.hanzi} (${v.pinyin})" is ${v.tag === "room" ? "an indoor room" : "an open-air field"}.`).join(" "),
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
        hint: "Check whether the meaning names an indoor room or an open-air field.",
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
        hint: "This sentence follows the pattern 我要去……(I want to go to …).",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Say who wants to go (我要), then the action (去), then the place.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
