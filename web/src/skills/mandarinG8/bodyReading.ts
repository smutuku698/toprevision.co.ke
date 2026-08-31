import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "护士：你怎么了？",
  "(Hùshi: Nǐ zěnme le?)",
  "凯文：我头疼，还有点儿发烧。",
  "(Kǎiwén: Wǒ tóuténg, hái yǒudiǎnr fāshāo.)",
  "护士：你咳嗽吗？",
  "(Hùshi: Nǐ késou ma?)",
  "凯文：不咳嗽，但是我肚子也疼。",
  "(Kǎiwén: Bù késou, dànshì wǒ dùzi yě téng.)",
  "护士：好的，你去看医生，吃点儿药，多喝水。",
  "(Hùshi: Hǎo de, nǐ qù kàn yīshēng, chī diǎnr yào, duō hē shuǐ.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "凯文有什么症状？(What symptoms does Kevin have?)",
    correct: "头疼和发烧 (Headache and fever)",
    distractors: ["咳嗽和发烧 (Cough and fever)", "牙疼 (Toothache)", "只有咳嗽 (Only a cough)"],
    explanation: "凯文说 \"我头疼，还有点儿发烧\" — Kevin says he has a headache and a slight fever.",
  },
  {
    q: "凯文咳嗽吗？(Does Kevin have a cough?)",
    correct: "不咳嗽 (No, he does not)",
    distractors: ["咳嗽 (Yes, he does)", "护士没有问 (The nurse did not ask)", "咳嗽得很厉害 (He coughs badly)"],
    explanation: "凯文说 \"不咳嗽\" — Kevin says he does not have a cough.",
  },
  {
    q: "护士建议凯文做什么？(What does the nurse suggest Kevin do?)",
    correct: "看医生，吃药，多喝水 (See a doctor, take medicine, drink more water)",
    distractors: ["马上回家睡觉 (Go straight home to sleep)", "去学校上课 (Go to class at school)", "什么都不用做 (Do nothing at all)"],
    explanation: "护士说 \"你去看医生，吃点儿药，多喝水\" — the nurse tells Kevin to see a doctor, take some medicine, and drink more water.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "凯文头疼，还有点儿发烧。(Kevin has a headache and a slight fever.)", isTrue: true },
  { text: "凯文咳嗽得很厉害。(Kevin has a bad cough.)", isTrue: false },
  { text: "凯文肚子也疼。(Kevin's stomach also hurts.)", isTrue: true },
  { text: "护士让凯文不要喝水。(The nurse tells Kevin not to drink water.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "你怎么了？", meaning: "What's wrong with you?" },
  { phrase: "有点儿", meaning: "a little / somewhat" },
  { phrase: "吃点儿药", meaning: "take some medicine" },
  { phrase: "多喝水", meaning: "drink more water" },
  { phrase: "看医生", meaning: "see a doctor" },
];

export const bodyReading: Skill = {
  id: "g8-ma-r-body",
  code: "R.7",
  subjectId: "mandarin",
  strandId: "g8-ma-reading",
  grade: 8,
  title: "Reading: my body and how I feel",
  description: "Read a short Mandarin dialogue at the school clinic and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly which symptoms Kevin describes.",
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
        hint: "The nurse first asks what's wrong, then asks about a cough, then gives advice.",
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
      hint: "Look at exactly what Kevin says about how he feels.",
      explanation: q.explanation,
    };
  },
};
