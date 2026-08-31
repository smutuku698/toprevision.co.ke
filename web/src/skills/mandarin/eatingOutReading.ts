import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "服务员：您好，请问点菜吗？\n" +
  "(Fúwùyuán: Nín hǎo, qǐngwèn diǎncài ma?)\n" +
  "安娜：我想要一份炒饭和一碗汤。\n" +
  "(Ānnà: Wǒ xiǎng yào yí fèn chǎofàn hé yì wǎn tāng.)\n" +
  "服务员：好的，请问还要别的吗？\n" +
  "(Fúwùyuán: Hǎo de, qǐngwèn hái yào bié de ma?)\n" +
  "安娜：不用了，谢谢。请给我一双筷子。\n" +
  "(Ānnà: Bú yòng le, xièxie. Qǐng gěi wǒ yì shuāng kuàizi.)\n" +
  "服务员：好的，请慢用！多少钱？\n" +
  "(Fúwùyuán: Hǎo de, qǐng màn yòng!)\n" +
  "安娜：多少钱？\n" +
  "(Ānnà: Duōshao qián?)\n" +
  "服务员：一共二十块。\n" +
  "(Fúwùyuán: Yígòng èrshí kuài.)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "安娜点了什么？(What did Ana order?)",
    correct: "一份炒饭和一碗汤 (Fried rice and a bowl of soup)",
    distractors: ["一杯茶 (A cup of tea)", "一块蛋糕 (A piece of cake)", "两碗面条 (Two bowls of noodles)"],
    explanation: "安娜说 \"我想要一份炒饭和一碗汤\" — Ana says she wants a fried rice and a bowl of soup.",
  },
  {
    q: "安娜要什么餐具？(What tableware does Ana ask for?)",
    correct: "一双筷子 (A pair of chopsticks)",
    distractors: ["一把叉子 (A fork)", "一个勺子 (A spoon)", "一个盘子 (A plate)"],
    explanation: "安娜说 \"请给我一双筷子\" — Ana says please give her a pair of chopsticks.",
  },
  {
    q: "一共多少钱？(How much does it cost in total?)",
    correct: "二十块 (Twenty kuai)",
    distractors: ["十块 (Ten kuai)", "三十块 (Thirty kuai)", "五十块 (Fifty kuai)"],
    explanation: "服务员说 \"一共二十块\" — The waiter says it's twenty kuai in total.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "安娜点了炒饭和汤。(Ana ordered fried rice and soup.)", isTrue: true },
  { text: "安娜要一把叉子。(Ana asks for a fork.)", isTrue: false },
  { text: "一共二十块钱。(It costs twenty kuai in total.)", isTrue: true },
  { text: "安娜不需要餐具。(Ana doesn't need any tableware.)", isTrue: false },
];

export const eatingOutReading: Skill = {
  id: "ma-r-eating-out",
  code: "R.6",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: ordering at a restaurant",
  description: "Read a short Mandarin restaurant dialogue and answer comprehension questions.",
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
      hint: "Look at what each speaker says in the restaurant dialogue above.",
      explanation: q.explanation,
    };
  },
};
