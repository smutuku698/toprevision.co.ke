import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; group: "errand" | "leisure" }[] = [
  { hanzi: "车站", pinyin: "chēzhàn", meaning: "station", group: "errand" },
  { hanzi: "派出所", pinyin: "pàichūsuǒ", meaning: "police station", group: "errand" },
  { hanzi: "学校", pinyin: "xuéxiào", meaning: "school", group: "leisure" },
  { hanzi: "邮局", pinyin: "yóujú", meaning: "post office", group: "errand" },
  { hanzi: "医院", pinyin: "yīyuàn", meaning: "hospital", group: "errand" },
  { hanzi: "银行", pinyin: "yínháng", meaning: "bank", group: "errand" },
  { hanzi: "商场", pinyin: "shāngchǎng", meaning: "shopping mall", group: "leisure" },
  { hanzi: "图书馆", pinyin: "túshūguǎn", meaning: "library", group: "leisure" },
  { hanzi: "公园", pinyin: "gōngyuán", meaning: "park", group: "leisure" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Xuéxiào pángbiān yǒu yí gè ",
    after: ".",
    answer: "gōngyuán",
    gloss: "学校旁边有一个公园。(Xuéxiào pángbiān yǒu yí gè gōngyuán.) — There is a park next to the school.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["医院", "在银行和邮局", "中间。"],
    sentence: "医院在银行和邮局中间。",
    gloss: "Yīyuàn zài yínháng hé yóujú zhōngjiān. — The hospital is between the bank and the post office.",
  },
];

export const surroundingsSpeaking: Skill = {
  id: "g8-ma-ls-surroundings",
  code: "LS.3",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Places in my surroundings",
  description: "Naming places around town, and using non-verbal cues in interactive speaking.",
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
        prompt: "Match each Mandarin place name to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Say each place name out loud, paying attention to the tone on each syllable.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const errand = shuffle(rng, VOCAB.filter((v) => v.group === "errand")).slice(0, 4);
      const leisure = shuffle(rng, VOCAB.filter((v) => v.group === "leisure")).slice(0, 4);
      const items = shuffle(rng, [...errand, ...leisure]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.group;

      return {
        kind: "categorize",
        prompt: "Sort each place as somewhere for Everyday Errands or Leisure & Learning.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "errand", label: "Everyday Errands" },
          { id: "leisure", label: "Leisure & Learning" },
        ],
        correctBucket,
        hint: "Think about whether you go there to get something done, or to relax and learn.",
        explanation: [...errand, ...leisure]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a place for ${v.group === "errand" ? "everyday errands" : "leisure & learning"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.meaning !== correct.meaning)).slice(0, 3);
      const choices = shuffle(rng, [correct.meaning, ...distractors.map((d) => d.meaning)]);

      return {
        kind: "multiple-choice",
        prompt: `What does "${correct.hanzi} (${correct.pinyin})" mean?`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Picture the place and what you would do there.",
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
        answer: undefined,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This place has trees, benches, and open space to relax in.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi words to form a correct spoken sentence.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "Name the place first, then describe its location using 在...中间 (between...).",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
