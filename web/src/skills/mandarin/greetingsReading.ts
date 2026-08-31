import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGE =
  "安娜：您好！您贵姓？\n" +
  "(Ānnà: Nín hǎo! Nín guì xìng?)\n" +
  "王老师：您好！我姓王，我是中国人。您是哪国人？\n" +
  "(Wáng lǎoshī: Nín hǎo! Wǒ xìng Wáng, wǒ shì Zhōngguó rén. Nín shì nǎ guó rén?)\n" +
  "安娜：我是肯尼亚人，我叫安娜，我会说英语和斯瓦希里语。\n" +
  "(Ānnà: Wǒ shì Kěnníyà rén, wǒ jiào Ānnà, wǒ huì shuō Yīngyǔ hé Sīwǎxīlǐyǔ.)\n" +
  "王老师：幸会，安娜！\n" +
  "(Wáng lǎoshī: Xìnghuì, Ānnà!)";

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "王老师是哪国人？(Which country is Teacher Wang from?)",
    correct: "中国 (China)",
    distractors: ["肯尼亚 (Kenya)", "美国 (the USA)", "法国 (France)"],
    explanation: "王老师说 \"我是中国人\" — Teacher Wang says \"I am Chinese.\"",
  },
  {
    q: "安娜会说什么语言？(What languages can Ana speak?)",
    correct: "英语和斯瓦希里语 (English and Swahili)",
    distractors: ["法语和德语 (French and German)", "只有中文 (Only Chinese)", "英语和法语 (English and French)"],
    explanation: "安娜说 \"我会说英语和斯瓦希里语\" — Ana says she can speak English and Swahili.",
  },
  {
    q: "王老师姓什么？(What is Teacher Wang's surname?)",
    correct: "王 (Wang)",
    distractors: ["安 (An)", "肯 (Ken)", "李 (Li)"],
    explanation: "王老师说 \"我姓王\" — Teacher Wang says \"my surname is Wang.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "安娜先问王老师的姓。(Ana asks for Teacher Wang's surname first.)", isTrue: true },
  { text: "王老师是肯尼亚人。(Teacher Wang is Kenyan.)", isTrue: false },
  { text: "安娜是肯尼亚人。(Ana is Kenyan.)", isTrue: true },
  { text: "王老师不认识安娜。(Teacher Wang refuses to meet Ana.)", isTrue: false },
];

export const greetingsReading: Skill = {
  id: "ma-r-greetings",
  code: "R.1",
  subjectId: "mandarin",
  strandId: "ma-reading",
  grade: 9,
  title: "Reading: formal greetings and introductions",
  description: "Read a short Mandarin dialogue of a formal introduction and answer comprehension questions.",
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
      hint: "Look at what each speaker says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
