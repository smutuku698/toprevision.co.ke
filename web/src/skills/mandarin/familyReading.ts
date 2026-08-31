import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "安娜：你有爸爸妈妈吗？他们做什么工作？\n" +
  "(Ānnà: Nǐ yǒu bàba māma ma? Tāmen zuò shénme gōngzuò?)\n" +
  "李明：我爸爸是医生，在医院工作。我妈妈是老师，在学校工作。\n" +
  "(Lǐ Míng: Wǒ bàba shì yīshēng, zài yīyuàn gōngzuò. Wǒ māma shì lǎoshī, zài xuéxiào gōngzuò.)\n" +
  "安娜：我家有三口人。我爸爸妈妈都是老师。\n" +
  "(Ānnà: Wǒ jiā yǒu sān kǒu rén. Wǒ bàba māma dōu shì lǎoshī.)\n" +
  "李明：真好！你叔叔做什么工作？\n" +
  "(Lǐ Míng: Zhēn hǎo! Nǐ shūshu zuò shénme gōngzuò?)\n" +
  "安娜：我叔叔是警察，在派出所工作。\n" +
  "(Ānnà: Wǒ shūshu shì jǐngchá, zài pàichūsuǒ gōngzuò.)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "李明的爸爸做什么工作？(What is Li Ming's dad's job?)",
    correct: "医生 (Doctor)",
    distractors: ["老师 (Teacher)", "警察 (Police officer)", "农民 (Farmer)"],
    explanation: "李明说 \"我爸爸是医生\" — Li Ming says his dad is a doctor.",
  },
  {
    q: "安娜家有几口人？(How many people are in Ana's family?)",
    correct: "三口人 (Three people)",
    distractors: ["两口人 (Two people)", "四口人 (Four people)", "五口人 (Five people)"],
    explanation: "安娜说 \"我家有三口人\" — Ana says her family has three people.",
  },
  {
    q: "安娜的叔叔在哪儿工作？(Where does Ana's uncle work?)",
    correct: "派出所 (Police station)",
    distractors: ["医院 (Hospital)", "学校 (School)", "商场 (Mall)"],
    explanation: "安娜说 \"我叔叔是警察，在派出所工作\" — Ana says her uncle is a police officer, working at the police station.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "李明的爸爸是医生。(Li Ming's dad is a doctor.)", isTrue: true },
  { text: "安娜的爸爸妈妈都是医生。(Both of Ana's parents are doctors.)", isTrue: false },
  { text: "安娜的叔叔是警察。(Ana's uncle is a police officer.)", isTrue: true },
  { text: "李明的妈妈在医院工作。(Li Ming's mom works at the hospital.)", isTrue: false },
];

export const familyReading: Skill = {
  id: "ma-r-family",
  code: "R.2",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: family and professions",
  description: "Read a short Mandarin dialogue about family members' jobs and answer comprehension questions.",
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
      hint: "Look at what each speaker says about their family in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
