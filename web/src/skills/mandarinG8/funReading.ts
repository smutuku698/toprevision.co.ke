import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "学生甲：周末你打算做什么？",
  "(Xuéshēng jiǎ: Zhōumò nǐ dǎsuàn zuò shénme?)",
  "学生乙：我打算去公园骑自行车。你呢？",
  "(Xuéshēng yǐ: Wǒ dǎsuàn qù gōngyuán qí zìxíngchē. Nǐ ne?)",
  "学生甲：我想去电影院看电影。",
  "(Xuéshēng jiǎ: Wǒ xiǎng qù diànyǐngyuàn kàn diànyǐng.)",
  "学生乙：听起来很有意思！我们一起去公园吧。",
  "(Xuéshēng yǐ: Tīng qǐlai hěn yǒu yìsi! Wǒmen yìqǐ qù gōngyuán ba.)",
  "学生甲：好，没问题！",
  "(Xuéshēng jiǎ: Hǎo, méi wèntí!)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "学生乙周末打算做什么？(What does Student B plan to do this weekend?)",
    correct: "去公园骑自行车 (Go to the park to ride a bicycle)",
    distractors: ["去电影院看电影 (Go to the cinema to watch a movie)", "去商场买东西 (Go shopping at the mall)", "在家画画 (Draw at home)"],
    explanation: "学生乙说 \"我打算去公园骑自行车\" — Student B says they plan to go to the park to ride a bicycle.",
  },
  {
    q: "学生甲一开始想做什么？(What did Student A first want to do?)",
    correct: "去电影院看电影 (Go to the cinema to watch a movie)",
    distractors: ["去公园骑自行车 (Go to the park to ride a bicycle)", "去动物园 (Go to the zoo)", "踢足球 (Play football)"],
    explanation: "学生甲说 \"我想去电影院看电影\" — Student A says they want to watch a movie at the cinema.",
  },
  {
    q: "最后他们决定一起做什么？(What do they finally decide to do together?)",
    correct: "一起去公园 (Go to the park together)",
    distractors: ["一起去电影院 (Go to the cinema together)", "一起去动物园 (Go to the zoo together)", "都留在家里 (Both stay home)"],
    explanation: "学生乙说 \"我们一起去公园吧\"，学生甲同意 \"好，没问题\" — they agree to go to the park together.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "学生乙打算去公园骑自行车。(Student B plans to ride a bicycle at the park.)", isTrue: true },
  { text: "学生甲不想看电影。(Student A does not want to watch a movie.)", isTrue: false },
  { text: "他们最后决定一起去公园。(They finally decide to go to the park together.)", isTrue: true },
  { text: "学生甲觉得学生乙的计划很无聊。(Student A thinks Student B's plan is boring.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "打算", meaning: "to plan to" },
  { phrase: "听起来很有意思", meaning: "that sounds interesting" },
  { phrase: "一起", meaning: "together" },
  { phrase: "没问题", meaning: "no problem" },
  { phrase: "你呢？", meaning: "and you?" },
];

export const funReading: Skill = {
  id: "g8-ma-r-fun",
  code: "R.5",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: fun activities and making plans",
  description: "Read a short Mandarin dialogue about weekend plans and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

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
        hint: "Reread the dialogue carefully and check each speaker's plans and the final decision.",
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
        hint: "Student A asks about plans first, then Student B answers and asks back, then they agree on the park.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
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
      hint: "Look at what each student says about their weekend plans.",
      explanation: q.explanation,
    };
  },
};
