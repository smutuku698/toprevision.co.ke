import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "facility" | "location" }[] = [
  { hanzi: "医院", pinyin: "yīyuàn", meaning: "hospital", tag: "facility" },
  { hanzi: "教堂", pinyin: "jiàotáng", meaning: "church", tag: "facility" },
  { hanzi: "清真寺", pinyin: "qīngzhēnsì", meaning: "mosque", tag: "facility" },
  { hanzi: "面包店", pinyin: "miànbāodiàn", meaning: "bakery", tag: "facility" },
  { hanzi: "超市", pinyin: "chāoshì", meaning: "supermarket", tag: "facility" },
  { hanzi: "邮局", pinyin: "yóujú", meaning: "post office", tag: "facility" },
  { hanzi: "饭店", pinyin: "fàndiàn", meaning: "restaurant", tag: "facility" },
  { hanzi: "肉店", pinyin: "ròudiàn", meaning: "butcher shop", tag: "facility" },
  { hanzi: "对面", pinyin: "duìmiàn", meaning: "opposite", tag: "location" },
  { hanzi: "后面", pinyin: "hòumiàn", meaning: "behind", tag: "location" },
  { hanzi: "附近", pinyin: "fùjìn", meaning: "near", tag: "location" },
  { hanzi: "前面", pinyin: "qiánmiàn", meaning: "in front of", tag: "location" },
  { hanzi: "旁边", pinyin: "pángbiān", meaning: "beside", tag: "location" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Yīyuàn zài chāoshì de ",
    after: "。",
    answer: "duìmiàn",
    gloss: "医院在超市的对面。(Yīyuàn zài chāoshì de duìmiàn.) — The hospital is opposite the supermarket.",
  },
  {
    before: "Yóujú zài miànbāodiàn de ",
    after: "。",
    answer: "pángbiān",
    gloss: "邮局在面包店的旁边。(Yóujú zài miànbāodiàn de pángbiān.) — The post office is beside the bakery.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["清真寺", "在教堂", "的附近。"],
    sentence: "清真寺在教堂的附近。",
    gloss: "Qīngzhēnsì zài jiàotáng de fùjìn. — The mosque is near the church.",
  },
];

export const gettingAroundSpeaking: Skill = {
  id: "g7-ma-ls-getting-around",
  code: "LS.9",
  subjectId: "mandarin",
  strandId: "g7-ma-listening-speaking",
  grade: 7,
  title: "Getting around: neighbourhood facilities",
  description: "Common neighbourhood facilities and location/direction words — oral vocabulary and expressions.",
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
        prompt: "Match each facility or location word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words name a place; others describe where one place is relative to another.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const facilities = shuffle(rng, VOCAB.filter((v) => v.tag === "facility")).slice(0, 4);
      const locations = shuffle(rng, VOCAB.filter((v) => v.tag === "location")).slice(0, 4);
      const items = shuffle(rng, [...facilities, ...locations]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Facility or a Location Word.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "facility", label: "Facility" },
          { id: "location", label: "Location Word" },
        ],
        correctBucket,
        hint: "A facility is a place; a location word describes its position relative to something else.",
        explanation: [...facilities, ...locations]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "facility" ? "facility" : "location word"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, [correct.meaning, ...distractors.map((d) => d.meaning)]);

      return {
        kind: "multiple-choice",
        prompt: `What does "${correct.hanzi} (${correct.pinyin})" mean?`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Decide whether this word names a place or describes a relative position.",
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
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "The pattern is: [place A] 在 [place B] 的 [location word].",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi phrases to describe a facility's location.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "State the facility first, then the reference place, then the location word.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
