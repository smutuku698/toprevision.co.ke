import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "安娜：你每天几点起床？\n" +
  "(Ānnà: Nǐ měitiān jǐ diǎn qǐchuáng?)\n" +
  "李明：我每天早上七点起床，然后吃早饭，洗澡。\n" +
  "(Lǐ Míng: Wǒ měitiān zǎoshang qī diǎn qǐchuáng, ránhòu chī zǎofàn, xǐzǎo.)\n" +
  "安娜：你每天洗衣服吗？\n" +
  "(Ānnà: Nǐ měitiān xǐ yīfu ma?)\n" +
  "李明：不，我每个星期日洗衣服。晚上我做作业，然后睡觉。\n" +
  "(Lǐ Míng: Bù, wǒ měige xīngqīrì xǐ yīfu. Wǎnshang wǒ zuò zuòyè, ránhòu shuìjiào.)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "李明每天几点起床？(What time does Li Ming get up every day?)",
    correct: "七点 (Seven o'clock)",
    distractors: ["六点 (Six o'clock)", "八点 (Eight o'clock)", "九点 (Nine o'clock)"],
    explanation: "李明说 \"我每天早上七点起床\" — Li Ming says he gets up at seven every morning.",
  },
  {
    q: "李明什么时候洗衣服？(When does Li Ming wash clothes?)",
    correct: "每个星期日 (Every Sunday)",
    distractors: ["每天 (Every day)", "每个星期六 (Every Saturday)", "从不 (Never)"],
    explanation: "李明说 \"我每个星期日洗衣服\" — Li Ming says he washes clothes every Sunday.",
  },
  {
    q: "李明晚上做什么？(What does Li Ming do in the evening?)",
    correct: "做作业，然后睡觉 (Homework, then sleep)",
    distractors: ["看电影 (Watch a movie)", "做饭 (Cook)", "打扫 (Clean)"],
    explanation: "李明说 \"晚上我做作业，然后睡觉\" — Li Ming says he does homework then sleeps in the evening.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "李明每天早上七点起床。(Li Ming gets up at 7am every day.)", isTrue: true },
  { text: "李明每天洗衣服。(Li Ming washes clothes every day.)", isTrue: false },
  { text: "李明晚上做作业。(Li Ming does homework in the evening.)", isTrue: true },
  { text: "安娜从不问李明的时间表。(Ana never asks about Li Ming's schedule.)", isTrue: false },
];

export const routineReading: Skill = {
  id: "ma-r-routine",
  code: "R.4",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: daily routine",
  description: "Read a short Mandarin dialogue about a daily schedule and answer comprehension questions.",
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
      hint: "Look at what each speaker says about their schedule in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
