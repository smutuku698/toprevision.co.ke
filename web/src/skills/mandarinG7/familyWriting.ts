import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "family" | "profession" }[] = [
  { hanzi: "爸爸", pinyin: "bàba", meaning: "dad", tag: "family" },
  { hanzi: "妈妈", pinyin: "māma", meaning: "mom", tag: "family" },
  { hanzi: "哥哥", pinyin: "gēge", meaning: "older brother", tag: "family" },
  { hanzi: "弟弟", pinyin: "dìdi", meaning: "younger brother", tag: "family" },
  { hanzi: "姐姐", pinyin: "jiějie", meaning: "older sister", tag: "family" },
  { hanzi: "妹妹", pinyin: "mèimei", meaning: "younger sister", tag: "family" },
  { hanzi: "外公", pinyin: "wàigōng", meaning: "maternal grandpa", tag: "family" },
  { hanzi: "外婆", pinyin: "wàipó", meaning: "maternal grandma", tag: "family" },
  { hanzi: "奶奶", pinyin: "nǎinai", meaning: "paternal grandma", tag: "family" },
  { hanzi: "爷爷", pinyin: "yéye", meaning: "paternal grandpa", tag: "family" },
  { hanzi: "老师", pinyin: "lǎoshī", meaning: "teacher", tag: "profession" },
  { hanzi: "医生", pinyin: "yīshēng", meaning: "doctor", tag: "profession" },
  { hanzi: "司机", pinyin: "sījī", meaning: "driver", tag: "profession" },
  { hanzi: "警察", pinyin: "jǐngchá", meaning: "police officer", tag: "profession" },
  { hanzi: "护士", pinyin: "hùshi", meaning: "nurse", tag: "profession" },
  { hanzi: "农民", pinyin: "nóngmín", meaning: "farmer", tag: "profession" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ bàba shì ", after: "。", answer: "yīshēng", gloss: "我爸爸是医生。(My dad is a doctor.)" },
  { before: "Wǒmen jiā yǒu sì ", after: " rén.", answer: "kǒu", gloss: "我们家有四口人。(There are four people in our family.)" },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我们家有四口人：", "爸爸、妈妈、哥哥", "和我。"], sentence: "我们家有四口人：爸爸、妈妈、哥哥和我。", gloss: "There are four people in our family: dad, mom, older brother, and me." },
];

export const familyWriting: Skill = {
  id: "g7-ma-w-family",
  code: "W.2",
  subjectId: "mandarin",
  strandId: "g7-ma-writing",
  grade: 7,
  title: "Nuclear family and professions",
  description: "Guided writing — spelling, word order, and vocabulary for describing your nuclear family and their professions.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "match", "categorize", "mc"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to introduce a nuclear family in writing.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "State the total count of family members first, then list them.",
        explanation: `The correct sentence is: "${set.sentence}" — meaning "${set.gloss}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: "Match each family title or profession to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "外公/外婆 are on your mother's side; 爷爷/奶奶 are on your father's side.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const family = shuffle(rng, VOCAB.filter((v) => v.tag === "family")).slice(0, 3);
      const professions = shuffle(rng, VOCAB.filter((v) => v.tag === "profession")).slice(0, 3);
      const chosen = shuffle(rng, [...family, ...professions]);
      const correctBucket: Record<string, string> = {};
      for (const v of family) correctBucket[v.hanzi] = "family";
      for (const v of professions) correctBucket[v.hanzi] = "profession";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Family Member or a Profession.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "family", label: "Family Member" },
          { id: "profession", label: "Profession" },
        ],
        correctBucket,
        hint: "Family members are relatives; professions are jobs.",
        explanation: [...family, ...professions].map((v) => `"${v.hanzi}" is a ${correctBucket[v.hanzi] === "family" ? "family member" : "profession"}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, [correct.hanzi, ...distractors.map((d) => d.hanzi)]);

      return {
        kind: "multiple-choice",
        prompt: `Which hanzi word correctly means "${correct.meaning}"?`,
        choices,
        correctIndex: choices.indexOf(correct.hanzi),
        layout: "list",
        hint: "Match the meaning to the exact character, not just a similar-looking one.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" is the word that means "${correct.meaning}".`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing pinyin word to complete the sentence (tone marks optional).",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: pinyinAccepted(item.answer),
      inputMode: "text",
      hint: "The sentence describes a family member's job, or counts family members with the measure word for people.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
