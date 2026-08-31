import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "李明：今天天气怎么样？\n" +
  "(Lǐ Míng: Jīntiān tiānqì zěnmeyàng?)\n" +
  "安娜：今天是晴天，很暖和。你打算做什么？\n" +
  "(Ānnà: Jīntiān shì qíngtiān, hěn nuǎnhuo. Nǐ dǎsuàn zuò shénme?)\n" +
  "李明：我打算去钓鱼。可是明天可能下雨。\n" +
  "(Lǐ Míng: Wǒ dǎsuàn qù diàoyú. Kěshì míngtiān kěnéng xiàyǔ.)\n" +
  "安娜：下雨天我喜欢在家看书。\n" +
  "(Ānnà: Xiàyǔtiān wǒ xǐhuan zài jiā kàn shū.)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "今天天气怎么样？(What's the weather like today?)",
    correct: "晴天，很暖和 (Sunny, and warm)",
    distractors: ["下雨 (Raining)", "下雪 (Snowing)", "刮风 (Windy)"],
    explanation: "安娜说 \"今天是晴天，很暖和\" — Ana says today is sunny and warm.",
  },
  {
    q: "李明今天打算做什么？(What does Li Ming plan to do today?)",
    correct: "去钓鱼 (Go fishing)",
    distractors: ["去游泳 (Go swimming)", "去爬山 (Go climb a mountain)", "在家看书 (Stay home and read)"],
    explanation: "李明说 \"我打算去钓鱼\" — Li Ming says he plans to go fishing.",
  },
  {
    q: "下雨天安娜喜欢做什么？(What does Ana like to do on a rainy day?)",
    correct: "在家看书 (Stay home and read)",
    distractors: ["去公园 (Go to the park)", "去钓鱼 (Go fishing)", "骑自行车 (Ride a bicycle)"],
    explanation: "安娜说 \"下雨天我喜欢在家看书\" — Ana says she likes to stay home and read on rainy days.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "今天是晴天。(Today is sunny.)", isTrue: true },
  { text: "李明打算去游泳。(Li Ming plans to go swimming.)", isTrue: false },
  { text: "明天可能下雨。(It might rain tomorrow.)", isTrue: true },
  { text: "安娜不喜欢下雨天看书。(Ana doesn't like reading on rainy days.)", isTrue: false },
];

export const environmentReading: Skill = {
  id: "ma-r-environment",
  code: "R.8",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: weather and environment",
  description: "Read a short Mandarin dialogue about the weather and answer comprehension questions.",
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
      hint: "Look at what each speaker says about the weather in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
