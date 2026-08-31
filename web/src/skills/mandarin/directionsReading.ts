import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "安娜：请问，图书馆在哪儿？\n" +
  "(Ānnà: Qǐngwèn, túshūguǎn zài nǎr?)\n" +
  "李明：一直走，然后往右拐，图书馆就在你左边。\n" +
  "(Lǐ Míng: Yìzhí zǒu, ránhòu wǎng yòu guǎi, túshūguǎn jiù zài nǐ zuǒbiān.)\n" +
  "安娜：离这儿远吗？\n" +
  "(Ānnà: Lí zhèr yuǎn ma?)\n" +
  "李明：不远，很近，走五分钟就到了。\n" +
  "(Lǐ Míng: Bù yuǎn, hěn jìn, zǒu wǔ fēnzhōng jiù dào le.)\n" +
  "安娜：谢谢你！\n" +
  "(Ānnà: Xièxie nǐ!)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "图书馆怎么走？(How do you get to the library?)",
    correct: "一直走，然后往右拐 (Go straight, then turn right)",
    distractors: ["一直走，然后往左拐 (Go straight, then turn left)", "往右拐，然后一直走 (Turn right, then go straight)", "往后走 (Walk backward)"],
    explanation: "李明说 \"一直走，然后往右拐\" — Li Ming says go straight, then turn right.",
  },
  {
    q: "图书馆离这儿远不远？(Is the library far from here?)",
    correct: "不远，很近 (Not far, very near)",
    distractors: ["很远 (Very far)", "非常远 (Extremely far)", "不知道 (Not sure)"],
    explanation: "李明说 \"不远，很近，走五分钟就到了\" — Li Ming says it's not far, very near, five minutes on foot.",
  },
  {
    q: "走到图书馆要多长时间？(How long does it take to walk to the library?)",
    correct: "五分钟 (Five minutes)",
    distractors: ["十分钟 (Ten minutes)", "半小时 (Half an hour)", "一小时 (An hour)"],
    explanation: "李明说 \"走五分钟就到了\" — Li Ming says it takes five minutes on foot.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "安娜要去图书馆。(Ana wants to go to the library.)", isTrue: true },
  { text: "图书馆在右边。(The library is on the right.)", isTrue: false },
  { text: "图书馆离这儿很近。(The library is very near here.)", isTrue: true },
  { text: "走到图书馆要一小时。(It takes an hour to walk to the library.)", isTrue: false },
];

export const directionsReading: Skill = {
  id: "ma-r-directions",
  code: "R.9",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: asking for directions",
  description: "Read a short Mandarin dialogue about giving directions and answer comprehension questions.",
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
      hint: "Look at what each speaker says about directions in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
