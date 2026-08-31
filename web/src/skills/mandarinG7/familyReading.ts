import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "妹妹：你们家有几口人？",
  "(Mèimei: Nǐmen jiā yǒu jǐ kǒu rén?)",
  "大卫：我们家有四口人：爸爸、妈妈、哥哥和我。",
  "(Dàwèi: Wǒmen jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ.)",
  "妹妹：爸爸做什么工作？",
  "(Mèimei: Bàba zuò shénme gōngzuò?)",
  "大卫：爸爸是医生，妈妈是老师。",
  "(Dàwèi: Bàba shì yīshēng, māma shì lǎoshī.)",
  "妹妹：哥哥呢？",
  "(Mèimei: Gēge ne?)",
  "大卫：哥哥是学生，他很聪明。",
  "(Dàwèi: Gēge shì xuéshēng, tā hěn cōngmíng.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "大卫家有几口人？(How many people are in David's family?)",
    correct: "四口人 (Four people)",
    distractors: ["三口人 (Three)", "五口人 (Five)", "六口人 (Six)"],
    explanation: "大卫说 \"我们家有四口人\" — David says there are four people in his family.",
  },
  {
    q: "大卫的爸爸做什么工作？(What is David's dad's job?)",
    correct: "医生 (doctor)",
    distractors: ["老师 (teacher)", "警察 (police officer)", "司机 (driver)"],
    explanation: "大卫说 \"爸爸是医生\" — David says his dad is a doctor.",
  },
  {
    q: "大卫的妈妈做什么工作？(What is David's mom's job?)",
    correct: "老师 (teacher)",
    distractors: ["护士 (nurse)", "农民 (farmer)", "医生 (doctor)"],
    explanation: "大卫说 \"妈妈是老师\" — David says his mom is a teacher.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "妹妹先问大卫家有几口人。(The younger sister asks first how many people are in David's family.)", isTrue: true },
  { text: "大卫的爸爸是警察。(David's dad is a police officer.)", isTrue: false },
  { text: "大卫的妈妈是老师。(David's mom is a teacher.)", isTrue: true },
  { text: "大卫的哥哥是医生。(David's older brother is a doctor.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "你们家有几口人", meaning: "how many people are in your family" },
  { phrase: "做什么工作", meaning: "what work do (they) do" },
  { phrase: "学生", meaning: "student" },
  { phrase: "聪明", meaning: "smart, clever" },
  { phrase: "呢", meaning: "and...? (asking the same question about someone else)" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Dàwèi: Bàba shì yīshēng, māma shì ",
    after: "。",
    answer: "lǎoshī",
    gloss: "大卫：爸爸是医生，妈妈是老师。(Dàwèi: Bàba shì yīshēng, māma shì lǎoshī.) — David: Dad is a doctor, mom is a teacher.",
  },
];

export const familyReading: Skill = {
  id: "g7-ma-r-family",
  code: "R.2",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: nuclear family and professions",
  description: "Read a short Mandarin dialogue introducing a nuclear family's members and jobs, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering", "fill-blank"] as const);

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
        hint: "Match each family member to the job the dialogue actually gives them.",
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
        hint: "The younger sister asks about family size first, then jobs, then specifically asks about the older brother.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing pinyin word from this line of the dialogue (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "David is naming his mom's profession.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
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
      hint: "Look at what each speaker says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
