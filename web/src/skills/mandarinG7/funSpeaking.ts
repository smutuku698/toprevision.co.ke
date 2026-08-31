import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { pinyinAccepted, clusteredDistractors } from "../mandarin/mandarinUtils";

const VOCAB: { hanzi: string; pinyin: string; meaning: string; tag: "frequency" | "activity" }[] = [
  { hanzi: "周末", pinyin: "zhōumò", meaning: "weekend", tag: "frequency" },
  { hanzi: "每天", pinyin: "měitiān", meaning: "every day", tag: "frequency" },
  { hanzi: "每个星期", pinyin: "měi gè xīngqī", meaning: "every week", tag: "frequency" },
  { hanzi: "每个月", pinyin: "měi gè yuè", meaning: "every month", tag: "frequency" },
  { hanzi: "放假的时候", pinyin: "fàngjià de shíhòu", meaning: "during the holidays", tag: "frequency" },
  { hanzi: "唱歌", pinyin: "chànggē", meaning: "sing", tag: "activity" },
  { hanzi: "听音乐", pinyin: "tīng yīnyuè", meaning: "listen to music", tag: "activity" },
  { hanzi: "看电影", pinyin: "kàn diànyǐng", meaning: "watch movies", tag: "activity" },
  { hanzi: "看电视", pinyin: "kàn diànshì", meaning: "watch TV", tag: "activity" },
  { hanzi: "看书", pinyin: "kànshū", meaning: "read books", tag: "activity" },
  { hanzi: "画画", pinyin: "huàhuà", meaning: "draw", tag: "activity" },
  { hanzi: "旅游", pinyin: "lǚyóu", meaning: "travel", tag: "activity" },
  { hanzi: "打球", pinyin: "dǎqiú", meaning: "play ball", tag: "activity" },
  { hanzi: "玩电脑游戏", pinyin: "wán diànnǎo yóuxì", meaning: "play computer games", tag: "activity" },
  { hanzi: "休息", pinyin: "xiūxi", meaning: "rest", tag: "activity" },
  { hanzi: "运动", pinyin: "yùndòng", meaning: "exercise", tag: "activity" },
  { hanzi: "逛街", pinyin: "guàngjiē", meaning: "go window-shopping", tag: "activity" },
  { hanzi: "和朋友聊天", pinyin: "hé péngyǒu liáotiān", meaning: "chat with friends", tag: "activity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  {
    before: "Wǒ ",
    after: " tīng yīnyuè.",
    answer: "zhōumò",
    gloss: "我周末听音乐。(Wǒ zhōumò tīng yīnyuè.) — I listen to music on weekends.",
  },
  {
    before: "Fàngjià de shíhòu, wǒ hé péngyǒu ",
    after: "。",
    answer: "liáotiān",
    gloss: "放假的时候，我和朋友聊天。(Fàngjià de shíhòu, wǒ hé péngyǒu liáotiān.) — During the holidays, I chat with friends.",
  },
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  {
    chunks: ["周末", "我喜欢看电影", "和打球。"],
    sentence: "周末我喜欢看电影和打球。",
    gloss: "Zhōumò wǒ xǐhuan kàn diànyǐng hé dǎqiú. — On weekends I like watching movies and playing ball.",
  },
];

export const funSpeaking: Skill = {
  id: "g7-ma-ls-fun",
  code: "LS.5",
  subjectId: "mandarin",
  strandId: "g7-ma-listening-speaking",
  grade: 7,
  title: "Fun and enjoyment: leisure activities",
  description: "Leisure activities and how often you do them — oral vocabulary and expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "mc", "fill", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.hanzi, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.hanzi] = v.hanzi;

      return {
        kind: "click-match",
        prompt: "Match each leisure word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words tell you when; others tell you what activity.",
        explanation: chosen.map((v) => `"${v.hanzi} (${v.pinyin})" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const frequency = shuffle(rng, VOCAB.filter((v) => v.tag === "frequency")).slice(0, 4);
      const activity = shuffle(rng, VOCAB.filter((v) => v.tag === "activity")).slice(0, 4);
      const items = shuffle(rng, [...frequency, ...activity]);
      const correctBucket: Record<string, string> = {};
      for (const v of items) correctBucket[v.hanzi] = v.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Time/Frequency word or a Leisure Activity.",
        items: items.map((v) => ({ id: v.hanzi, label: `${v.hanzi} (${v.pinyin})` })),
        buckets: [
          { id: "frequency", label: "Time/Frequency" },
          { id: "activity", label: "Leisure Activity" },
        ],
        correctBucket,
        hint: "A frequency word answers \"when?\"; an activity word answers \"what?\".",
        explanation: [...frequency, ...activity]
          .map((v) => `"${v.hanzi} (${v.pinyin})" is a ${v.tag === "frequency" ? "time/frequency word" : "leisure activity"}.`)
          .join(" "),
      };
    }

    if (branch === "mc") {
      const correct = randChoice(rng, VOCAB);
      const distractors = clusteredDistractors(rng, VOCAB, correct, 3, (a, b) => a.hanzi === b.hanzi);
      const choices = shuffle(rng, [correct.meaning, ...distractors.map((d) => d.meaning)]);

      return {
        kind: "multiple-choice",
        prompt: `What does "${correct.hanzi} (${correct.pinyin})" mean?`,
        choices,
        correctIndex: choices.indexOf(correct.meaning),
        layout: "list",
        hint: "Check whether this word tells you when something happens or what the activity is.",
        explanation: `"${correct.hanzi} (${correct.pinyin})" means "${correct.meaning}".`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing pinyin word to complete the sentence (tone marks optional).",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: pinyinAccepted(item.answer),
        inputMode: "text",
        hint: "The sentence names either when the activity happens, or the activity itself.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
    const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

    return {
      kind: "ordering",
      prompt: "Arrange the hanzi phrases to describe a leisure-time preference.",
      instruction: "Click the pieces in the correct order.",
      items,
      correctOrder,
      hint: "State when first, then what you like, then the second activity.",
      explanation: `The correct sentence is: "${set.sentence}" — ${set.gloss}`,
    };
  },
};
