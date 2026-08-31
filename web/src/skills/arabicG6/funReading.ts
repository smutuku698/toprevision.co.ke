import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SPORT_VOCAB, name, place } from "./shared";

// Sub-strand 2.5 Guided Reading: Fluency — Theme: Fun and Enjoyment.
// Content: identifying familiar words from a text, reading a short passage with proper intonation
// and stress, texts on sports and games focusing on long vowels (madda) and shaddah.

const PASSAGE_SKELETONS: ((n: string, p: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (n, p) => ({
    lines: [
      `${n} yuhibbu kurat al-qadam kathiran fi ${p}. (${n} likes football a lot in ${p}.)`,
      `Yal'abu ma'a asdiqa'ihi kulla masaa'. (He plays with his friends every evening.)`,
      `Yatadarrabu bijidd li yakuna la'iban jayyidan. (He practises hard to become a good player.)`,
      `Fareequhu faaza fi al-mubaraah al-akheera. (His team won the last match.)`,
    ],
    qa: [
      { q: `When does ${n} play football with friends, according to the passage?`, correct: "every evening", distractors: ["every morning", "once a week", "the passage does not say"], explanation: "'kulla masaa'' means 'every evening'." },
      { q: `Why does ${n} practise hard, based on the passage?`, correct: "to become a good player", distractors: ["to win money", "because the coach forces him", "the passage does not say"], explanation: "'li yakuna la'iban jayyidan' means 'to become a good player'." },
      { q: "What happened in the last match, according to the passage?", correct: "his team won", distractors: ["his team lost", "the match was cancelled", "the passage does not say"], explanation: "'Fareequhu faaza fi al-mubaraah al-akheera' means 'his team won the last match'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Sadeeqat ${n} tuhibbu al-sibaha fi ${p}. (${n}'s friend likes swimming in ${p}.)`,
      `Tasbahu fi al-masbah kulla sabt. (She swims in the pool every Saturday.)`,
      `Hiya sarie'a jiddan fi al-maa'. (She is very fast in the water.)`,
      `Tureedu al-mushaaraka fi musabaqa qareeban. (She wants to take part in a competition soon.)`,
    ],
    qa: [
      { q: "When does the friend swim, according to the passage?", correct: "every Saturday", distractors: ["every Sunday", "every day", "the passage does not say"], explanation: "'kulla sabt' means 'every Saturday'." },
      { q: "How is her speed in the water described?", correct: "very fast", distractors: ["quite slow", "average", "the passage does not say"], explanation: "'Hiya sarie'a jiddan fi al-maa'' means 'she is very fast in the water'." },
      { q: "What does she want to do soon, based on the passage?", correct: "take part in a competition", distractors: ["stop swimming", "change sports", "the passage does not say"], explanation: "'Tureedu al-mushaaraka fi musabaqa qareeban' means 'she wants to take part in a competition soon'." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} wa asdiqa'uhu yal'abuna al-shatranj fi ${p}. (${n} and his friends play chess in ${p}.)`,
      `Yufakkiruna bi'inaya qabla kulla haraka. (They think carefully before every move.)`,
      `Al-shatranj yuhassinu al-tafkeer al-mantiqi. (Chess improves logical thinking.)`,
      `${n} faaza fi mubaraatihi al-akheera. (${n} won his last game.)`,
    ],
    qa: [
      { q: "What do the friends do before every move, according to the passage?", correct: "think carefully", distractors: ["rush quickly", "guess randomly", "the passage does not say"], explanation: "'Yufakkiruna bi'inaya qabla kulla haraka' means 'they think carefully before every move'." },
      { q: "What does chess improve, according to the passage?", correct: "logical thinking", distractors: ["speed", "strength", "singing"], explanation: "'Al-shatranj yuhassinu al-tafkeer al-mantiqi' means 'chess improves logical thinking'." },
      { q: `What happened in ${n}'s last game, based on the passage?`, correct: "he won", distractors: ["he lost", "it was a draw", "the passage does not say"], explanation: `"${n} faaza fi mubaraatihi al-akheera" means "${n} won his last game".` },
    ],
  }),
  (n, p) => ({
    lines: [
      `Madrasat ${n} fi ${p} tunazzimu musabaqat sibaq kulla sana. (${n}'s school in ${p} organises a racing competition every year.)`,
      `Al-talamidh yatadarrabuna li shahr kaamil qablaha. (The students train for a whole month before it.)`,
      `${n} yushaariku fi sibaq al-jary al-tawil. (${n} takes part in the long-distance race.)`,
      `Al-faa'iz yahsulu 'ala jaa'iza jameela. (The winner receives a nice prize.)`,
    ],
    qa: [
      { q: "How often is the racing competition held, according to the passage?", correct: "every year", distractors: ["every month", "every week", "the passage does not say"], explanation: "'kulla sana' means 'every year'." },
      { q: "How long do the students train before the competition?", correct: "a whole month", distractors: ["a whole year", "one week", "the passage does not say"], explanation: "'li shahr kaamil qablaha' means 'for a whole month before it'." },
      { q: `Which race does ${n} take part in, according to the passage?`, correct: "the long-distance race", distractors: ["the swimming race", "the cycling race", "the passage does not say"], explanation: `"${n} yushaariku fi sibaq al-jary al-tawil" means "${n} takes part in the long-distance race".` },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yaqra'u nassan 'an kurat al-salla fi ${p}. (${n} reads a text about basketball in ${p}.)`,
      `Al-fareeq yatakawwanu min khamsa lai'been. (A team is made up of five players.)`,
      `Yajibu 'ala al-la'ibeen an ya'malu ma'an. (The players must work together.)`,
      `${n} yaqra'u bisawt waadih wa tanagum jayyid. (${n} reads with a clear voice and good intonation.)`,
    ],
    qa: [
      { q: "How many players make up a basketball team, according to the passage?", correct: "five", distractors: ["six", "eleven", "the passage does not say"], explanation: "'khamsa lai'been' means 'five players'." },
      { q: "What must the players do, according to the passage?", correct: "work together", distractors: ["play alone", "compete against each other", "the passage does not say"], explanation: "'Yajibu 'ala al-la'ibeen an ya'malu ma'an' means 'the players must work together'." },
      { q: `How does ${n} read this passage, according to the text?`, correct: "with a clear voice and good intonation", distractors: ["very quietly", "too fast to understand", "the passage does not say"], explanation: `"${n} yaqra'u bisawt waadih wa tanagum jayyid" means "${n} reads with a clear voice and good intonation".` },
    ],
  }),
];

export const funReading: Skill = {
  id: "g6-ar-r-fun",
  code: "R.5",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Guided reading: fluency (fun and enjoyment)",
  description: "Read short sports-and-games passages fluently with proper intonation and stress, and recognise familiar sport vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const n = name(rng);
    const p = place(rng);
    const skeleton = randChoice(rng, PASSAGE_SKELETONS)(n, p);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, SPORT_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Match each sport/game word to its meaning.",
          "Match the word from the passage's theme to its meaning.",
          "Which meaning goes with which sport word?",
          "Pair each sport word with its correct meaning.",
          "Match each word to what it means.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above for context clues.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
        { before: "'They won' in a sports reading text is written as ", after: ".", correct: "faaza" },
        { before: "'Every evening' in a sports reading text is written as ", after: ".", correct: "kulla masaa'" },
        { before: "'They practise' in a sports reading text is written as ", after: ".", correct: "yatadarrabuna" },
        { before: "'A competition' in a sports reading text is written as ", after: ".", correct: "musabaqa" },
        { before: "'A team' in a sports reading text is written as ", after: ".", correct: "fareeq" },
        { before: "'A prize' in a sports reading text is written as ", after: ".", correct: "jaa'iza" },
        { before: "'The players' in a sports reading text is written as ", after: ".", correct: "al-la'ibeen" },
        { before: "'Together' in a sports reading text is written as ", after: ".", correct: "ma'an" },
      ];
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: randChoice(rng, [
          "Fill in the missing word.",
          "Complete the sentence with the correct word.",
          "What word completes this reading fact?",
          "Fill the gap correctly.",
          "Complete this vocabulary fact.",
        ]),
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        inputMode: "text",
        hint: "Think about the sports vocabulary used in the passage above.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: randChoice(rng, [
          "Put these lines from the passage in the order they were written.",
          "Arrange the passage's lines in the correct reading order.",
          "Sequence this passage correctly.",
          "Order the lines as they appear in the passage.",
          "Which order makes this passage make sense?",
        ]),
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Read the passage above carefully to recall its order.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const SPORT_CATEGORY: { word: string; type: "Ball game" | "Other sport" }[] = [
        { word: "kurat al-qadam", type: "Ball game" }, { word: "kurat al-salla", type: "Ball game" }, { word: "kurat al-tawira", type: "Ball game" },
        { word: "sibaha", type: "Other sport" }, { word: "jary", type: "Other sport" }, { word: "qafz", type: "Other sport" },
        { word: "darraja", type: "Other sport" }, { word: "shatranj", type: "Other sport" }, { word: "habl al-qafz", type: "Other sport" }, { word: "sibaq", type: "Other sport" },
      ];
      const chosen2 = shuffle(rng, SPORT_CATEGORY).slice(0, 7);
      const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "As you read, sort each sport/game: Ball game, or Other sport?",
          "Group these sports by ball game vs other sport.",
          "Which category does each sport belong to?",
          "Sort each sport/game word into the correct category.",
          "Classify each sport or game from the reading text.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Ball game", label: "Ball game" },
          { id: "Other sport", label: "Other sport" },
        ],
        correctBucket,
        hint: "Football, basketball, and volleyball are ball games; the rest are not.",
        explanation: chosen2.map((c) => `"${c.word}" is a${c.type === "Other sport" ? "n" : ""} ${c.type.toLowerCase()}.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, [qa.correct, ...qa.distractors]);
    return {
      kind: "multiple-choice",
      passage,
      prompt: qa.q,
      choices,
      correctIndex: choices.indexOf(qa.correct),
      layout: "list",
      hint: "Reread the passage above carefully before answering.",
      explanation: qa.explanation,
    };
  },
};
