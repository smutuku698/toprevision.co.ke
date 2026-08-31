import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "奥廷诺：放学以后，我走路回家。",
  "(Àotíngnuò: Fàngxué yǐhòu, wǒ zǒulù huí jiā.)",
  "奥廷诺：我先经过邮局，然后经过银行。",
  "(Àotíngnuò: Wǒ xiān jīngguò yóujú, ránhòu jīngguò yínháng.)",
  "奥廷诺：接着我去图书馆还书。",
  "(Àotíngnuò: Jiēzhe wǒ qù túshūguǎn huán shū.)",
  "奥廷诺：然后我经过公园，公园旁边有一条河。",
  "(Àotíngnuò: Ránhòu wǒ jīngguò gōngyuán, gōngyuán pángbiān yǒu yì tiáo hé.)",
  "奥廷诺：最后，我到家了。",
  "(Àotíngnuò: Zuìhòu, wǒ dào jiā le.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "奥廷诺的路是从哪儿开始的？(Where does Otieno's route begin?)",
    correct: "放学以后，从学校 (After school, from the school)",
    distractors: ["从商场 (From the mall)", "从图书馆 (From the library)", "从公园 (From the park)"],
    explanation: "奥廷诺说 \"放学以后，我走路回家\" — Otieno says he walks home after school.",
  },
  {
    q: "奥廷诺在图书馆做什么？(What does Otieno do at the library?)",
    correct: "还书 (Return a book)",
    distractors: ["买东西 (Buy things)", "看电影 (Watch a movie)", "踢足球 (Play football)"],
    explanation: "奥廷诺说 \"接着我去图书馆还书\" — Otieno says he goes to the library to return a book.",
  },
  {
    q: "奥廷诺先经过邮局和银行中的哪个？(Which does Otieno pass first, the post office or the bank?)",
    correct: "邮局 (Post office)",
    distractors: ["银行 (Bank)", "公园 (Park)", "图书馆 (Library)"],
    explanation: "奥廷诺说 \"我先经过邮局，然后经过银行\" — Otieno says he passes the post office first, then the bank.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "奥廷诺放学以后走路回家。(Otieno walks home after school.)", isTrue: true },
  { text: "奥廷诺在银行还书。(Otieno returns a book at the bank.)", isTrue: false },
  { text: "公园旁边有一条河。(There is a river next to the park.)", isTrue: true },
  { text: "奥廷诺最先经过银行。(Otieno passes the bank first.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "放学以后", meaning: "after school" },
  { phrase: "经过", meaning: "to pass by" },
  { phrase: "还书", meaning: "to return a book" },
  { phrase: "旁边", meaning: "next to / beside" },
  { phrase: "最后", meaning: "finally / lastly" },
];

export const surroundingsReading: Skill = {
  id: "g8-ma-r-surroundings",
  code: "R.3",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: places in my surroundings",
  description: "Read a short Mandarin passage describing a walk through a neighbourhood and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage carefully and follow Otieno's route step by step.",
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
        prompt: "Match each phrase from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the passage above.",
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
        prompt: "Put these lines from the passage in the order they happen.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "Otieno leaves school, passes the post office and bank, stops at the library, walks by the park and river, then reaches home.",
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
      hint: "Follow Otieno's route through the neighbourhood, one place at a time.",
      explanation: q.explanation,
    };
  },
};
