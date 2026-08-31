import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "family" | "profession" }[] = [
  { hanzi: "叔叔", pinyin: "shūshu", meaning: "uncle (father's younger brother)", tag: "family" },
  { hanzi: "姑姑", pinyin: "gūgu", meaning: "aunt (father's sister)", tag: "family" },
  { hanzi: "舅舅", pinyin: "jiùjiu", meaning: "uncle (mother's brother)", tag: "family" },
  { hanzi: "阿姨", pinyin: "āyí", meaning: "aunt (mother's sister / polite term for an older woman)", tag: "family" },
  { hanzi: "哥哥", pinyin: "gēge", meaning: "older brother", tag: "family" },
  { hanzi: "妹妹", pinyin: "mèimei", meaning: "younger sister", tag: "family" },
  { hanzi: "医生", pinyin: "yīshēng", meaning: "doctor", tag: "profession" },
  { hanzi: "护士", pinyin: "hùshi", meaning: "nurse", tag: "profession" },
  { hanzi: "老师", pinyin: "lǎoshī", meaning: "teacher", tag: "profession" },
  { hanzi: "工程师", pinyin: "gōngchéngshī", meaning: "engineer", tag: "profession" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wǒ jiā yǒu wǔ kǒu ", after: ".", answer: "rén", gloss: "我家有五口人。(Wǒ jiā yǒu wǔ kǒu rén.) — My family has five people." },
  {
    before: "Wǒ yǒu yí gè gēge hé yí gè ",
    after: ".",
    answer: "mèimei",
    gloss: "我有一个哥哥和一个妹妹。(Wǒ yǒu yí gè gēge hé yí gè mèimei.) — I have one older brother and one younger sister.",
  },
  {
    before: "Wǒ bàba shì ",
    after: ", wǒ māma shì hùshi.",
    answer: "gōngchéngshī",
    gloss: "我爸爸是工程师，我妈妈是护士。(Wǒ bàba shì gōngchéngshī, wǒ māma shì hùshi.) — My dad is an engineer, my mom is a nurse.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["我家", "有", "五口人。"], sentence: "我家有五口人。", gloss: "Wǒ jiā yǒu wǔ kǒu rén. — My family has five people." },
  {
    chunks: ["我", "有一个哥哥", "和一个妹妹。"],
    sentence: "我有一个哥哥和一个妹妹。",
    gloss: "Wǒ yǒu yí gè gēge hé yí gè mèimei. — I have one older brother and one younger sister.",
  },
];

export const familyWriting: Skill = {
  id: "g8-ma-w-family",
  code: "W.2",
  subjectId: "mandarin",
  strandId: "g8-ma-writing",
  grade: 8,
  title: "Writing about extended family and professions",
  description: "Guided writing — spelling, word order, and vocabulary for extended family members and their jobs.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "match", "categorize"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the hanzi phrases to form a correct Mandarin sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Chinese word order is usually Subject + Verb + Object, just like English.",
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
        prompt: "Match each family or profession word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "叔叔, 舅舅, 姑姑, and 阿姨 each refer to a specific side of the family.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const family = shuffle(rng, VOCAB.filter((v) => v.tag === "family")).slice(0, 3);
      const profession = shuffle(rng, VOCAB.filter((v) => v.tag === "profession")).slice(0, 3);
      const chosen = shuffle(rng, [...family, ...profession]);
      const correctBucket: Record<string, string> = {};
      for (const v of family) correctBucket[v.hanzi] = "family";
      for (const v of profession) correctBucket[v.hanzi] = "profession";

      return {
        kind: "categorize",
        prompt: "Sort each word as a Family Member or a Profession.",
        items: chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "family", label: "Family Member" },
          { id: "profession", label: "Profession" },
        ],
        correctBucket,
        hint: "Family words name a relative; profession words name a job.",
        explanation: [...family, ...profession].map((v) => `"${v.hanzi}" is a ${correctBucket[v.hanzi]}.`).join(" "),
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
      hint: "Think about the family and profession words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
