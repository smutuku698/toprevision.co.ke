import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted } from "../mandarin/mandarinUtils";

const LINES = [
  "周末我喜欢看电影和打球。",
  "(Zhōumò wǒ xǐhuan kàn diànyǐng hé dǎqiú.)",
  "我每天听音乐。",
  "(Wǒ měitiān tīng yīnyuè.)",
  "放假的时候，我和朋友聊天，还去旅游。",
  "(Fàngjià de shíhòu, wǒ hé péngyǒu liáotiān, hái qù lǚyóu.)",
  "我每个星期看书。",
  "(Wǒ měi gè xīngqī kànshū.)",
];
const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "\"我\"周末喜欢做什么？(What does the narrator like to do on weekends?)",
    correct: "看电影和打球 (watch movies and play ball)",
    distractors: ["看书 (read books)", "听音乐 (listen to music)", "画画 (draw)"],
    explanation: "文中说 \"周末我喜欢看电影和打球\" — The text says on weekends the narrator likes movies and ball games.",
  },
  {
    q: "\"我\"每天做什么？(What does the narrator do every day?)",
    correct: "听音乐 (listen to music)",
    distractors: ["看电视 (watch TV)", "旅游 (travel)", "运动 (exercise)"],
    explanation: "文中说 \"我每天听音乐\" — The text says \"I listen to music every day.\"",
  },
  {
    q: "放假的时候，\"我\"做什么？(What does the narrator do during the holidays?)",
    correct: "和朋友聊天，还去旅游 (chat with friends and travel)",
    distractors: ["打球 (play ball)", "看书 (read books)", "画画 (draw)"],
    explanation: "文中说 \"放假的时候，我和朋友聊天，还去旅游\" — The text says during the holidays the narrator chats with friends and travels.",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "\"我\"周末看电影。(The narrator watches movies on weekends.)", isTrue: true },
  { text: "\"我\"每天旅游。(The narrator travels every day.)", isTrue: false },
  { text: "\"我\"每个星期看书。(The narrator reads books every week.)", isTrue: true },
  { text: "放假的时候，\"我\"一个人待在家里。(During the holidays, the narrator stays home alone.)", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "喜欢", meaning: "to like" },
  { phrase: "还", meaning: "also, in addition" },
  { phrase: "周末", meaning: "weekend" },
  { phrase: "每个星期", meaning: "every week" },
  { phrase: "放假的时候", meaning: "during the holidays" },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ měi gè xīngqī ",
    after: "。",
    answer: "kànshū",
    gloss: "我每个星期看书。(Wǒ měi gè xīngqī kànshū.) — I read books every week.",
  },
];

export const funReading: Skill = {
  id: "g7-ma-r-fun",
  code: "R.5",
  subjectId: "mandarin",
  strandId: "g7-ma-reading",
  grade: 7,
  title: "Reading: fun and enjoyment",
  description: "Read a short Mandarin passage about leisure activities and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering", "fill-blank"] as const);

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
        hint: "Match each activity to the specific frequency word the passage pairs it with.",
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
        prompt: "Put these lines from the passage in the order they appear.",
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder,
        hint: "The passage moves from weekends, to daily habits, to holidays, to weekly habits.",
        explanation: `The correct order is:\n${withIds.map((w) => w.label).join("\n")}`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: "Fill in the missing pinyin word from this line of the passage (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "This is the weekly activity mentioned at the end of the passage.",
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
      hint: "Match each activity in the passage to the frequency word right next to it.",
      explanation: q.explanation,
    };
  },
};
