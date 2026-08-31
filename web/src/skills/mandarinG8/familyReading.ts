import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "安东：你家有几口人？你爸爸妈妈做什么工作？",
  "(Āndōng: Nǐ jiā yǒu jǐ kǒu rén? Nǐ bàba māma zuò shénme gōngzuò?)",
  "凯特：我家有五口人。我爸爸是工程师，我妈妈是护士。",
  "(Kǎitè: Wǒ jiā yǒu wǔ kǒu rén. Wǒ bàba shì gōngchéngshī, wǒ māma shì hùshi.)",
  "安东：你还有兄弟姐妹吗？",
  "(Āndōng: Nǐ hái yǒu xiōngdì jiěmèi ma?)",
  "凯特：我有一个哥哥和一个妹妹。我叔叔是医生，他在医院工作。",
  "(Kǎitè: Wǒ yǒu yí gè gēge hé yí gè mèimei. Wǒ shūshu shì yīshēng, tā zài yīyuàn gōngzuò.)",
  "安东：你们家真热闹！",
  "(Āndōng: Nǐmen jiā zhēn rènao!)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "凯特家有几口人？(How many people are in Kate's family?)",
    correct: "五口人 (Five people)",
    distractors: ["三口人 (Three people)", "四口人 (Four people)", "六口人 (Six people)"],
    explanation: "凯特说 \"我家有五口人\" — Kate says her family has five people.",
  },
  {
    q: "凯特的爸爸做什么工作？(What is Kate's dad's job?)",
    correct: "工程师 (Engineer)",
    distractors: ["医生 (Doctor)", "护士 (Nurse)", "老师 (Teacher)"],
    explanation: "凯特说 \"我爸爸是工程师\" — Kate says her dad is an engineer.",
  },
  {
    q: "凯特的叔叔在哪儿工作？(Where does Kate's uncle work?)",
    correct: "医院 (Hospital)",
    distractors: ["学校 (School)", "银行 (Bank)", "商场 (Mall)"],
    explanation: "凯特说 \"我叔叔是医生，他在医院工作\" — Kate says her uncle is a doctor who works at the hospital.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "凯特的妈妈是护士。(Kate's mom is a nurse.)", isTrue: true },
  { text: "凯特没有兄弟姐妹。(Kate has no siblings.)", isTrue: false },
  { text: "凯特有一个哥哥和一个妹妹。(Kate has one older brother and one younger sister.)", isTrue: true },
  { text: "凯特的叔叔是老师。(Kate's uncle is a teacher.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "兄弟姐妹", meaning: "siblings" },
  { phrase: "哥哥", meaning: "older brother" },
  { phrase: "妹妹", meaning: "younger sister" },
  { phrase: "热闹", meaning: "lively" },
  { phrase: "工程师", meaning: "engineer" },
];

export const familyReading: Skill = {
  id: "g8-ma-r-family",
  code: "R.2",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: extended family and professions",
  description: "Read a short Mandarin dialogue about a family's size, siblings, and jobs, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what Kate says about her family.",
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
        hint: "Anton first asks about family size and jobs, then about siblings, then reacts to Kate's answer.",
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
      hint: "Look at what Kate says about her family in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
