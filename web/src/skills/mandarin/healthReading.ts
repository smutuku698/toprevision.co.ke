import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "安娜：你怎么了？你身体怎么样？\n" +
  "(Ānnà: Nǐ zěnme le? Nǐ shēntǐ zěnmeyàng?)\n" +
  "李明：我感觉不舒服，头疼，还有点发烧。\n" +
  "(Lǐ Míng: Wǒ gǎnjué bù shūfu, tóuténg, hái yǒudiǎn fāshāo.)\n" +
  "安娜：你应该去看病。\n" +
  "(Ānnà: Nǐ yīnggāi qù kànbìng.)\n" +
  "李明：好，我想去看医生，然后吃药。\n" +
  "(Lǐ Míng: Hǎo, wǒ xiǎng qù kàn yīshēng, ránhòu chī yào.)\n" +
  "安娜：希望你早点好起来！\n" +
  "(Ānnà: Xīwàng nǐ zǎodiǎn hǎo qǐlái!)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "李明怎么了？(What's wrong with Li Ming?)",
    correct: "头疼，还有点发烧 (Headache, and a bit of a fever)",
    distractors: ["胃疼 (Stomachache)", "牙疼 (Toothache)", "咳嗽 (Cough)"],
    explanation: "李明说 \"我感觉不舒服，头疼，还有点发烧\" — Li Ming says he feels unwell, with a headache and slight fever.",
  },
  {
    q: "安娜建议李明做什么？(What does Ana suggest Li Ming do?)",
    correct: "去看病 (Go see a doctor)",
    distractors: ["去睡觉 (Go to sleep)", "去上班 (Go to work)", "去公园 (Go to the park)"],
    explanation: "安娜说 \"你应该去看病\" — Ana says he should go see a doctor.",
  },
  {
    q: "李明打算做什么？(What does Li Ming plan to do?)",
    correct: "看医生，然后吃药 (See the doctor, then take medicine)",
    distractors: ["去学校 (Go to school)", "去商场 (Go to the mall)", "打扫房间 (Clean the room)"],
    explanation: "李明说 \"我想去看医生，然后吃药\" — Li Ming says he wants to see the doctor then take medicine.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "李明头疼，还发烧。(Li Ming has a headache and a fever.)", isTrue: true },
  { text: "安娜说李明应该去公园。(Ana says Li Ming should go to the park.)", isTrue: false },
  { text: "李明打算去看医生。(Li Ming plans to see the doctor.)", isTrue: true },
  { text: "李明感觉很好。(Li Ming feels great.)", isTrue: false },
];

export const healthReading: Skill = {
  id: "ma-r-health",
  code: "R.7",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: at the doctor's",
  description: "Read a short Mandarin dialogue about feeling unwell and answer comprehension questions.",
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
      hint: "Look at what each speaker says about feeling unwell in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
