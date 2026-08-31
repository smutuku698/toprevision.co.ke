import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "游客：请问，车站在哪儿？",
  "(Yóukè: Qǐngwèn, chēzhàn zài nǎr?)",
  "路人：一直走，然后往右拐，车站就在银行旁边。",
  "(Lùrén: Yìzhí zǒu, ránhòu wǎng yòu guǎi, chēzhàn jiù zài yínháng pángbiān.)",
  "游客：远不远？",
  "(Yóukè: Yuǎn bu yuǎn?)",
  "路人：不远，走路大概十分钟。",
  "(Lùrén: Bù yuǎn, zǒulù dàgài shí fēnzhōng.)",
  "游客：太好了，谢谢你！",
  "(Yóukè: Tài hǎo le, xièxie nǐ!)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "车站在哪儿？(Where is the station?)",
    correct: "在银行旁边 (Next to the bank)",
    distractors: ["在公园旁边 (Next to the park)", "在学校对面 (Across from the school)", "在商场里 (Inside the mall)"],
    explanation: "路人说 \"车站就在银行旁边\" — the passerby says the station is right next to the bank.",
  },
  {
    q: "游客应该往哪个方向拐？(Which direction should the tourist turn?)",
    correct: "右 (Right)",
    distractors: ["左 (Left)", "后 (Backward)", "不用拐 (No need to turn)"],
    explanation: "路人说 \"往右拐\" — the passerby says to turn right.",
  },
  {
    q: "走到车站大概要多长时间？(About how long does it take to walk to the station?)",
    correct: "大概十分钟 (About ten minutes)",
    distractors: ["大概一个小时 (About one hour)", "大概五分钟 (About five minutes)", "大概二十分钟 (About twenty minutes)"],
    explanation: "路人说 \"走路大概十分钟\" — the passerby says it takes about ten minutes to walk.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "车站在银行旁边。(The station is next to the bank.)", isTrue: true },
  { text: "游客应该往左拐。(The tourist should turn left.)", isTrue: false },
  { text: "走到车站大概十分钟。(It takes about ten minutes to walk to the station.)", isTrue: true },
  { text: "车站很远。(The station is very far.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "请问", meaning: "excuse me / may I ask" },
  { phrase: "往右拐", meaning: "turn right" },
  { phrase: "远不远？", meaning: "is it far or not?" },
  { phrase: "大概", meaning: "approximately / about" },
  { phrase: "太好了", meaning: "great! / that's wonderful" },
];

export const gettingAroundReading: Skill = {
  id: "g8-ma-r-getting-around",
  code: "R.9",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: getting around",
  description: "Read a short Mandarin dialogue asking for and giving directions, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the directions and distance the passerby gives.",
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
        hint: "The tourist asks for the station first, then asks how far it is, then thanks the passerby.",
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
      hint: "Look at the directions and distance given by the passerby.",
      explanation: q.explanation,
    };
  },
};
