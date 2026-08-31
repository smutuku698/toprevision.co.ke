import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "安娜：你家有什么宠物？\n" +
  "(Ānnà: Nǐ jiā yǒu shénme chǒngwù?)\n" +
  "李明：我家有一只猫和一只狗。猫很可爱，狗很友好。\n" +
  "(Lǐ Míng: Wǒ jiā yǒu yì zhī māo hé yì zhī gǒu. Māo hěn kě'ài, gǒu hěn yǒuhǎo.)\n" +
  "安娜：肯尼亚有很多野生动物，比如狮子、大象和长颈鹿。\n" +
  "(Ānnà: Kěnníyà yǒu hěn duō yěshēng dòngwù, bǐrú shīzi, dàxiàng hé chángjǐnglù.)\n" +
  "李明：水牛大不大？\n" +
  "(Lǐ Míng: Shuǐniú dà bu dà?)\n" +
  "安娜：水牛很大，也很凶猛。\n" +
  "(Ānnà: Shuǐniú hěn dà, yě hěn xiōngměng.)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "李明家有什么宠物？(What pets does Li Ming have?)",
    correct: "一只猫和一只狗 (A cat and a dog)",
    distractors: ["两只兔子 (Two rabbits)", "一只羊 (A sheep)", "一只鸡 (A chicken)"],
    explanation: "李明说 \"我家有一只猫和一只狗\" — Li Ming says his family has a cat and a dog.",
  },
  {
    q: "水牛怎么样？(What is the buffalo like?)",
    correct: "很大，也很凶猛 (Very big and also fierce)",
    distractors: ["很小，很友好 (Very small and friendly)", "很可爱 (Very adorable)", "很温柔 (Very gentle)"],
    explanation: "安娜说 \"水牛很大，也很凶猛\" — Ana says the buffalo is very big and also fierce.",
  },
  {
    q: "肯尼亚有哪些野生动物？(What wild animals does Kenya have?)",
    correct: "狮子、大象和长颈鹿 (Lions, elephants and giraffes)",
    distractors: ["猫和狗 (Cats and dogs)", "牛和羊 (Cows and sheep)", "只有大象 (Only elephants)"],
    explanation: "安娜说肯尼亚有狮子、大象和长颈鹿等野生动物 — Ana says Kenya has wild animals like lions, elephants, and giraffes.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "李明的狗很友好。(Li Ming's dog is friendly.)", isTrue: true },
  { text: "安娜说肯尼亚没有野生动物。(Ana says Kenya has no wild animals.)", isTrue: false },
  { text: "水牛很大。(The buffalo is very big.)", isTrue: true },
  { text: "李明家没有宠物。(Li Ming's family has no pets.)", isTrue: false },
];

export const surroundingsReading: Skill = {
  id: "ma-r-surroundings",
  code: "R.3",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: animals around me",
  description: "Read a short Mandarin dialogue about pets and wild animals and answer comprehension questions.",
  generate(rng) {
    if (rng() < 0.45) {
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
        hint: "Reread the dialogue carefully and check what each speaker actually says.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
      hint: "Look at what each speaker says about animals in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
