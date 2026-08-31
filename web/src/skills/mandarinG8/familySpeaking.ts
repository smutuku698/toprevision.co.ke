import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "family" | "profession" }[] = [
  { hanzi: "叔叔", pinyin: "shūshu", meaning: "uncle (father's younger brother)", tag: "family" },
  { hanzi: "姑姑", pinyin: "gūgu", meaning: "aunt (father's sister)", tag: "family" },
  { hanzi: "舅舅", pinyin: "jiùjiu", meaning: "uncle (mother's brother)", tag: "family" },
  { hanzi: "阿姨", pinyin: "āyí", meaning: "aunt (mother's sister / polite term for an older woman)", tag: "family" },
  { hanzi: "堂弟", pinyin: "tángdì", meaning: "younger male cousin (father's brother's son)", tag: "family" },
  { hanzi: "表妹", pinyin: "biǎomèi", meaning: "younger female cousin (mother's side / father's sister's side)", tag: "family" },
  { hanzi: "家庭", pinyin: "jiātíng", meaning: "family", tag: "family" },
  { hanzi: "医生", pinyin: "yīshēng", meaning: "doctor", tag: "profession" },
  { hanzi: "护士", pinyin: "hùshi", meaning: "nurse", tag: "profession" },
  { hanzi: "老师", pinyin: "lǎoshī", meaning: "teacher", tag: "profession" },
  { hanzi: "农民", pinyin: "nóngmín", meaning: "farmer", tag: "profession" },
  { hanzi: "工程师", pinyin: "gōngchéngshī", meaning: "engineer", tag: "profession" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ shūshu ",
    after: " yīshēng.",
    answer: "shì",
    gloss: "我叔叔是医生。(Wǒ shūshu shì yīshēng.) — My uncle is a doctor.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["我姑姑是老师，", "我舅舅", "是工程师。"],
    sentence: "我姑姑是老师，我舅舅是工程师。",
    gloss: "Wǒ gūgu shì lǎoshī, wǒ jiùjiu shì gōngchéngshī. — My aunt is a teacher, my uncle is an engineer.",
  },
];

export const familySpeaking: Skill = {
  id: "g8-ma-ls-family",
  code: "LS.2",
  subjectId: "mandarin",
  strandId: "g8-ma-listening-speaking",
  grade: 8,
  title: "Extended family and professions",
  description: "Naming extended family members and their professions — oral vocabulary, tones, and intonation.",
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
        prompt: "Match each Mandarin family or profession word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "叔叔, 舅舅, 姑姑, and 阿姨 each refer to a specific side of the family.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const family = shuffle(rng, VOCAB.filter((v) => v.tag === "family")).slice(0, 4);
      const profession = shuffle(rng, VOCAB.filter((v) => v.tag === "profession")).slice(0, 4);
      const items = shuffle(rng, [...family, ...profession]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Family Member or a Profession.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "family", label: "Family Member" },
          { id: "profession", label: "Profession" },
        ],
        correctBucket,
        hint: "Family words name a relative; profession words name a job.",
        explanation: [...family, ...profession]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "family" ? "family member" : "profession"}.`)
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
        hint: "Decide whether the word names a relative or a job.",
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
        hint: "This small word links the subject to their profession, like 'is/am/are'.",
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
      hint: "Describe one relative's profession first, then the other's.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
