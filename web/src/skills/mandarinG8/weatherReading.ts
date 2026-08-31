import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "老师：同学们，今天天气怎么样？",
  "(Lǎoshī: Tóngxuémen, jīntiān tiānqì zěnmeyàng?)",
  "学生：今天是晴天，可是刮风。",
  "(Xuésheng: Jīntiān shì qíngtiān, kěshì guāfēng.)",
  "老师：很好。我们今天要谈保护环境。",
  "(Lǎoshī: Hěn hǎo. Wǒmen jīntiān yào tán bǎohù huánjìng.)",
  "学生：我们可以少用塑料袋，多种树。",
  "(Xuésheng: Wǒmen kěyǐ shǎo yòng sùliàodài, duō zhòngshù.)",
  "老师：说得对！不要乱扔垃圾也很重要。",
  "(Lǎoshī: Shuō de duì! Bú yào luàn rēng lājī yě hěn zhòngyào.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "今天天气怎么样？(What is the weather like today?)",
    correct: "晴天，刮风 (Sunny and windy)",
    distractors: ["下雨 (Raining)", "下雪 (Snowing)", "阴天 (Cloudy)"],
    explanation: "学生说 \"今天是晴天，可是刮风\" — the student says it is sunny but windy today.",
  },
  {
    q: "他们今天要谈什么？(What are they going to talk about today?)",
    correct: "保护环境 (Protecting the environment)",
    distractors: ["天气预报 (The weather forecast)", "运动比赛 (A sports competition)", "考试 (An exam)"],
    explanation: "老师说 \"我们今天要谈保护环境\" — the teacher says they will talk about protecting the environment.",
  },
  {
    q: "学生提出了什么建议？(What suggestion does the student make?)",
    correct: "少用塑料袋，多种树 (Use fewer plastic bags, plant more trees)",
    distractors: ["多开车 (Drive more)", "多用垃圾 (Use more rubbish)", "不去学校 (Don't go to school)"],
    explanation: "学生说 \"我们可以少用塑料袋，多种树\" — the student suggests using fewer plastic bags and planting more trees.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "今天是晴天，刮风。(Today is sunny and windy.)", isTrue: true },
  { text: "他们今天要谈天气预报。(They will talk about the weather forecast today.)", isTrue: false },
  { text: "学生建议多种树。(The student suggests planting more trees.)", isTrue: true },
  { text: "老师说乱扔垃圾没关系。(The teacher says littering doesn't matter.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "天气怎么样？", meaning: "What is the weather like?" },
  { phrase: "保护环境", meaning: "protect the environment" },
  { phrase: "塑料袋", meaning: "plastic bag" },
  { phrase: "乱扔垃圾", meaning: "litter / throw rubbish carelessly" },
  { phrase: "说得对", meaning: "that's right / well said" },
];

export const weatherReading: Skill = {
  id: "g8-ma-r-weather",
  code: "R.8",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: weather and environment",
  description: "Read a short Mandarin classroom dialogue about weather and protecting the environment, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the weather and the students' suggestions.",
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
        hint: "The teacher first asks about the weather, then introduces the topic, then the student suggests ideas.",
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
      hint: "Look at what the teacher and student say about weather and the environment.",
      explanation: q.explanation,
    };
  },
};
