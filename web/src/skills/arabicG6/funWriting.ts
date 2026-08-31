import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SPORT_VOCAB, name, place } from "./shared";

// Sub-strand 3.5 Guided Writing: Sequencing Ideas — Theme: Fun and Enjoyment.
// Content: features of a well-developed paragraph (neat/legible, well sequenced, well paragraphed,
// correct spelling), rearranging jumbled sentences into a coherent paragraph on sports and games.

const PARAGRAPH_SETS: ((n: string, p: string) => { sentences: string[] })[] = [
  (n, p) => ({
    sentences: [
      `${n} yuhibbu al-riyada kathiran fi ${p}.`,
      `Kulla masaa', yal'abu kurat al-qadam ma'a asdiqa'ihi.`,
      `Yatadarrabu bijidd kay yakuna la'iban jayyidan.`,
      `Al-usbu' al-madi, faaza fareequhu fi al-mubaraah.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Sadeeqat ${n} tuhibbu al-sibaha fi ${p}.`,
      `Tadhhabu ila al-masbah kulla sabt sabahan.`,
      `Hiya sarie'a jiddan fi al-maa'.`,
      `Tureedu al-mushaaraka fi musabaqa al-sana al-qadima.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Madrasat ${n} fi ${p} tunazzimu yawm riyadi kulla sana.`,
      `Al-talamidh yatadarrabuna li usbu'ayn qablahu.`,
      `Fi dhalika al-yawm, yatanafasu al-talamidh fi al-jary wa al-qafz.`,
      `Al-faa'izuna yahsuluna 'ala jawa'iz jameela.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `${n} wa asdiqa'uhu yal'abuna al-shatranj ba'da al-madrasa.`,
      `Yufakkiruna bi'inaya qabla kulla haraka fi al-lu'ba.`,
      `Al-lu'ba tuhassinu qudratahum 'ala al-tafkeer.`,
      `${n} faaza fi thalath mubarayat al-usbu' al-madi.`,
    ],
  }),
  (n, p) => ({
    sentences: [
      `Fi ${p}, tuhibbu al-'a'ila lu'bat kurat al-salla.`,
      `Kulla ahad, yadhhabuna ila al-mal'ab ma'an.`,
      `${n} yatadarrabu 'ala al-tasdeed kulla marra.`,
      `Al-'a'ila tushajji'u ba'daha al-ba'd bifarah.`,
    ],
  }),
];

const FEATURE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "Which of these is a feature of a well-developed paragraph?", correct: "Ideas are arranged in a logical, sequenced order", distractors: ["Every sentence is written in a different language", "Sentences appear in random order", "It has no full stops anywhere"], explanation: "A well-developed paragraph sequences its ideas logically, alongside neat handwriting and correct spelling." },
  { q: "Why should a paragraph about a sports match keep events in the order they happened?", correct: "So the reader can follow what happened first, next, and last", distractors: ["So the paragraph looks longer", "So every sentence uses the same word", "It doesn't matter what order the sentences are in"], explanation: "Sequencing ideas logically helps a reader follow the story clearly." },
  { q: "What should you check for after writing a paragraph, besides sequencing?", correct: "Correct spelling and neat, legible handwriting", distractors: ["Using as many long words as possible", "Removing all punctuation", "Writing every sentence backwards"], explanation: "The source names neat/legible writing and correct spelling as paragraph features, alongside good sequencing." },
  { q: "A paragraph about a game jumps between the ending and the beginning at random. What is wrong with it?", correct: "It is not well sequenced", distractors: ["It uses too much vocabulary", "It is too short", "It has too many full stops"], explanation: "Jumbling the order of events breaks logical sequencing, a key paragraph feature." },
  { q: "What makes a paragraph 'well paragraphed'?", correct: "Related sentences are grouped together around one idea", distractors: ["Every sentence is its own paragraph", "It has no spaces between words", "It repeats the same sentence many times"], explanation: "Being 'well paragraphed' means related sentences about one idea stay grouped together." },
  { q: "What is one way to fix a paragraph that reads in a confusing order?", correct: "Read it back and reorder any sentence that is out of place", distractors: ["Add random new words with no meaning", "Delete the first sentence entirely", "Change the topic halfway through"], explanation: "Rereading and reordering out-of-place sentences is how you fix poor sequencing." },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'They won' in a paragraph about sports is written as ", after: ".", correct: "faaza" },
  { before: "'Every evening' in a paragraph about sports is written as ", after: ".", correct: "kulla masaa'" },
  { before: "'They practise' in a paragraph about sports is written as ", after: ".", correct: "yatadarrabuna" },
  { before: "'A competition' in a paragraph about sports is written as ", after: ".", correct: "musabaqa" },
  { before: "'A prize' in a paragraph about sports is written as ", after: ".", correct: "jaa'iza" },
  { before: "'Together' in a paragraph about sports is written as ", after: ".", correct: "ma'an" },
  { before: "'Football' in Arabic is written as ", after: ".", correct: "kurat al-qadam" },
  { before: "'Swimming' in Arabic is written as ", after: ".", correct: "sibaha" },
];

export const funWriting: Skill = {
  id: "g6-ar-w-fun",
  code: "W.5",
  subjectId: "arabic",
  strandId: "g6-ar-writing",
  grade: 6,
  title: "Guided writing: sequencing ideas (fun and enjoyment)",
  description: "Organise sentences about sports and games into a well-sequenced paragraph, and practise correct spelling of sport vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["ordering", "features", "fill", "match", "categorize"] as const);

    if (branch === "ordering") {
      const n = name(rng);
      const p = place(rng);
      const set = randChoice(rng, PARAGRAPH_SETS)(n, p);
      const withIds = set.sentences.map((s, i) => ({ id: `${i}-${s}`, label: s }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Arrange these jumbled sentences into a well-sequenced paragraph.",
          "Put these sentences in the order that makes a coherent paragraph.",
          "Sequence these sentences to form a logical paragraph.",
          "Rearrange the jumbled sentences into the correct paragraph order.",
          "Which order turns these sentences into a clear paragraph?",
        ]),
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Start with who/what the paragraph is about, then when it happens, then what they do, then the result.",
        explanation: `A well-sequenced paragraph reads:\n${set.sentences.join("\n")}`,
      };
    }

    if (branch === "features") {
      const q = randChoice(rng, FEATURE_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about neatness, spelling, and whether ideas follow a logical order.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, [
          "Fill in the missing word for your paragraph.",
          "Complete the sentence with the correct Arabic word.",
          "What word completes this sentence correctly?",
          "Fill the gap with the correctly spelled word.",
          "Complete this sports-paragraph fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the sport vocabulary you have practised writing.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SPORT_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each sport/game word to its meaning before using it in your paragraph.",
          "Match the word to what it means.",
          "Which meaning goes with which sport word?",
          "Pair each sport word with its correct meaning.",
          "Match each word to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Recall the sport vocabulary you've practised.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    const SPORT_CATEGORY: { word: string; type: "Ball game" | "Other sport" }[] = [
      { word: "kurat al-qadam", type: "Ball game" }, { word: "kurat al-salla", type: "Ball game" }, { word: "kurat al-tawira", type: "Ball game" },
      { word: "sibaha", type: "Other sport" }, { word: "jary", type: "Other sport" }, { word: "qafz", type: "Other sport" },
      { word: "darraja", type: "Other sport" }, { word: "shatranj", type: "Other sport" }, { word: "habl al-qafz", type: "Other sport" }, { word: "sibaq", type: "Other sport" },
    ];
    const chosen = shuffle(rng, SPORT_CATEGORY).slice(0, 7);
    const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
    return {
      kind: "categorize",
      prompt: randChoice(rng, [
        "Before writing, sort each sport/game: Ball game, or Other sport?",
        "Group these sports the way you would plan a paragraph.",
        "Sort each sport word into the correct category.",
        "Classify each sport before using it in your writing.",
        "Which category does each sport belong to?",
      ]),
      items: shuffle(rng, items),
      buckets: [
        { id: "Ball game", label: "Ball game" },
        { id: "Other sport", label: "Other sport" },
      ],
      correctBucket,
      hint: "Football, basketball, and volleyball are ball games; the rest are not.",
      explanation: chosen.map((c) => `"${c.word}" is a${c.type === "Other sport" ? "n" : ""} ${c.type.toLowerCase()}.`).join(" "),
    };
  },
};
