import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "妈妈：我们去超市买东西吧。",
  "(Māma: Wǒmen qù chāoshì mǎi dōngxi ba.)",
  "我：好，我们买什么？",
  "(Wǒ: Hǎo, wǒmen mǎi shénme?)",
  "妈妈：买两斤牛肉和一斤鸡肉。",
  "(Māma: Mǎi liǎng jīn niúròu hé yì jīn jīròu.)",
  "我：面包店有新鲜的面包吗？",
  "(Wǒ: Miànbāodiàn yǒu xīnxiān de miànbāo ma?)",
  "妈妈：有，我们也去面包店买蛋糕。",
  "(Māma: Yǒu, wǒmen yě qù miànbāodiàn mǎi dàngāo.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "妈妈想买多少牛肉？(How much beef does mom want to buy?)",
    correct: "两斤 (two jin)",
    distractors: ["一斤 (one jin)", "三斤 (three jin)", "半斤 (half a jin)"],
    explanation: "妈妈说 \"买两斤牛肉\" — Mom says to buy two jin of beef.",
  },
  {
    q: "他们要去哪儿买蛋糕？(Where will they go to buy cake?)",
    correct: "面包店 (the bakery)",
    distractors: ["超市 (the supermarket)", "蔬菜店 (the vegetable store)", "肉店 (the butcher)"],
    explanation: "妈妈说 \"我们也去面包店买蛋糕\" — Mom says they'll also go to the bakery to buy cake.",
  },
  {
    q: "他们买多少鸡肉？(How much chicken do they buy?)",
    correct: "一斤 (one jin)",
    distractors: ["两斤 (two jin)", "三斤 (three jin)", "四斤 (four jin)"],
    explanation: "妈妈说 \"一斤鸡肉\" — Mom says one jin of chicken.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "妈妈和\"我\"要去超市。(Mom and the narrator are going to the supermarket.)", isTrue: true },
  { text: "他们买三斤牛肉。(They buy three jin of beef.)", isTrue: false },
  { text: "面包店有新鲜的面包。(The bakery has fresh bread.)", isTrue: true },
  { text: "他们不去面包店。(They don't go to the bakery.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "东西", meaning: "things, stuff" },
  { phrase: "新鲜", meaning: "fresh" },
  { phrase: "斤", meaning: "jin (a unit of about 500 grams)" },
  { phrase: "也", meaning: "also" },
  { phrase: "买什么", meaning: "what to buy" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ: Miànbāodiàn yǒu xīnxiān de ",
    after: " ma?",
    answer: "miànbāo",
    gloss: "我：面包店有新鲜的面包吗？(Wǒ: Miànbāodiàn yǒu xīnxiān de miànbāo ma?) — Me: Does the bakery have fresh bread?",
  },
];

export const foodsReading: Skill = {
  id: "g7-ma-r-foods",
  code: "R.6",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: shopping for food",
  description: "Read a short Mandarin dialogue about a food-shopping trip and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering", "fill-blank"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Check the exact quantities and shops named in the dialogue.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each phrase from the dialogue to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.filter((_, i) => i % 2 === 0).map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these lines from the dialogue in the order they were spoken.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Mom suggests the trip first, then they decide what to buy, then they discuss the bakery.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing pinyin word from this line of the dialogue (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "The narrator is asking whether the bakery has this fresh item.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what each speaker says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
