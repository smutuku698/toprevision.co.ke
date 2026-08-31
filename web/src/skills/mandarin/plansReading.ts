import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "李明：周末你打算做什么？\n" +
  "(Lǐ Míng: Zhōumò nǐ dǎsuàn zuò shénme?)\n" +
  "安娜：我打算跟朋友去公园看动物。你呢？\n" +
  "(Ānnà: Wǒ dǎsuàn gēn péngyou qù gōngyuán kàn dòngwù. Nǐ ne?)\n" +
  "李明：我要去商场，然后骑自行车。\n" +
  "(Lǐ Míng: Wǒ yào qù shāngchǎng, ránhòu qí zìxíngchē.)\n" +
  "安娜：听起来很好玩！\n" +
  "(Ānnà: Tīng qǐlái hěn hǎowán!)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "安娜周末打算做什么？(What does Ana plan to do on the weekend?)",
    correct: "跟朋友去公园看动物 (Go to the park with a friend to see animals)",
    distractors: ["去商场买东西 (Go shopping at the mall)", "骑自行车 (Ride a bicycle)", "看电影 (Watch a movie)"],
    explanation: "安娜说 \"我打算跟朋友去公园看动物\" — Ana says she plans to go to the park with a friend to see animals.",
  },
  {
    q: "李明打算去哪儿？(Where does Li Ming plan to go?)",
    correct: "商场 (The mall)",
    distractors: ["公园 (The park)", "动物园 (The zoo)", "学校 (School)"],
    explanation: "李明说 \"我要去商场\" — Li Ming says he wants to go to the mall.",
  },
  {
    q: "李明去商场以后做什么？(What does Li Ming do after the mall?)",
    correct: "骑自行车 (Ride a bicycle)",
    distractors: ["游泳 (Swim)", "爬山 (Climb a mountain)", "做饭 (Cook)"],
    explanation: "李明说 \"然后骑自行车\" — Li Ming says afterward he rides a bicycle.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "安娜打算去公园。(Ana plans to go to the park.)", isTrue: true },
  { text: "李明打算去动物园。(Li Ming plans to go to the zoo.)", isTrue: false },
  { text: "安娜跟朋友一起去公园。(Ana goes to the park with a friend.)", isTrue: true },
  { text: "李明周末什么都不做。(Li Ming does nothing on the weekend.)", isTrue: false },
];

export const plansReading: Skill = {
  id: "ma-r-plans",
  code: "R.5",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: weekend plans",
  description: "Read a short Mandarin dialogue about weekend plans and answer comprehension questions.",
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
      hint: "Look at what each speaker says about their weekend plans in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
