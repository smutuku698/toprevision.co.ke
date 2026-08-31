import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { BODY_VOCAB, name, place } from "./shared";

// Sub-strand 2.7 Extensive Reading — Theme: Body Parts.
// Content: read a simple story/poem about body parts, build a vocabulary bank from the text,
// identify the main idea.

const PASSAGE_SKELETONS: ((n: string, p: string) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (n, p) => ({
    lines: [
      `${n} yaghsilu yadayhi qabla al-akl fi ${p}. (${n} washes his hands before eating in ${p}.)`,
      `Yunazzifu asnaanahu ba'da kulla wajba. (He cleans his teeth after every meal.)`,
      `Yamshi kathiran li yuqawwi rijlayhi. (He walks a lot to strengthen his legs.)`,
      `${n} ya'tani bijismihi kulla yawm. (${n} takes care of his body every day.)`,
    ],
    qa: [
      { q: `When does ${n} wash his hands, according to the passage?`, correct: "before eating", distractors: ["after eating", "only in the morning", "the passage does not say"], explanation: "'qabla al-akl' means 'before eating'." },
      { q: `Why does ${n} walk a lot, based on the passage?`, correct: "to strengthen his legs", distractors: ["to reach school faster", "because he has no bicycle", "the passage does not say"], explanation: "'li yuqawwi rijlayhi' means 'to strengthen his legs'." },
      { q: "What is the main idea of this passage?", correct: `${n} takes care of his body through daily habits`, distractors: ["a story about a football match", "a description of the weather", "a list of school subjects"], explanation: "The passage's lines all describe habits for taking care of the body, matching the last line's summary." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Fi qasida qaseera 'an al-jism, yaqra' ${n} fi ${p}. (In a short poem about the body, ${n} reads in ${p}.)`,
      `"Al-ayn tara, al-udhun tasma'." (The eye sees, the ear hears.)`,
      `"Al-yad taktubu, al-rijl tamshi." (The hand writes, the leg walks.)`,
      `${n} yulqi al-qasida bi ta'beer jayyid. (${n} recites the poem with good expression.)`,
    ],
    qa: [
      { q: "According to the poem, what does the eye do?", correct: "sees", distractors: ["hears", "writes", "walks"], explanation: "'Al-ayn tara' means 'the eye sees'." },
      { q: "According to the poem, what does the hand do?", correct: "writes", distractors: ["sees", "hears", "walks"], explanation: "'Al-yad taktubu' means 'the hand writes'." },
      { q: "What is the main idea of this short poem?", correct: "each body part has its own special job", distractors: ["a story about a family trip", "a description of school facilities", "instructions for cooking a meal"], explanation: "The poem lists what each body part does, showing each part has its own function." },
    ],
  }),
  (n, p) => ({
    lines: [
      `${n} yabni bank mufradaat 'an ajza' al-jism fi ${p}. (${n} builds a vocabulary bank about body parts in ${p}.)`,
      `Yaktubu: ras, yad, rijl, ayn, udhun. (He writes: head, hand, leg, eye, ear.)`,
      `Yarsumu jismahu wa yusammi kulla juz'. (He draws his body and names each part.)`,
      `Al-mu'allima turaji'u qa'imatahu. (The teacher reviews his list.)`,
    ],
    qa: [
      { q: `What does ${n} build in this passage?`, correct: "a vocabulary bank about body parts", distractors: ["a list of foods", "a map of the school", "a football team roster"], explanation: "'yabni bank mufradaat 'an ajza' al-jism' means 'builds a vocabulary bank about body parts'." },
      { q: `What does ${n} draw, according to the passage?`, correct: "his body, naming each part", distractors: ["a map of his town", "his family tree", "a weather chart"], explanation: "'Yarsumu jismahu wa yusammi kulla juz'' means 'he draws his body and names each part'." },
      { q: "What is the main idea of this passage?", correct: "building a word list to learn body-part vocabulary", distractors: ["a story about a sports competition", "a poem about food", "a description of a weather event"], explanation: "Every line describes building and reviewing a vocabulary list of body parts." },
    ],
  }),
  (n, p) => ({
    lines: [
      `Qissa qaseera: ${n} yashtaki min alam fi batnihi fi ${p}. (Short story: ${n} complains of a stomach ache in ${p}.)`,
      `Yadhhabu ila al-mustashfa ma'a ummihi. (He goes to the hospital with his mother.)`,
      `Al-tabib yafhasu wajhahu wa ayn ${n}. (The doctor examines ${n}'s face and eye.)`,
      `${n} yashfa ba'da yawmayn min al-raha. (${n} recovers after two days of rest.)`,
    ],
    qa: [
      { q: `What is ${n}'s problem at the start of the story?`, correct: "a stomach ache", distractors: ["a headache", "a sore leg", "the passage does not say"], explanation: "'alam fi batnihi' means 'a stomach ache' (batn = stomach)." },
      { q: "Who does the doctor examine, according to the story?", correct: `${n}'s face and eye`, distractors: [`${n}'s hand and leg`, `${n}'s ear only`, "the passage does not say"], explanation: `"Al-tabib yafhasu wajhahu wa ayn ${n}" means "the doctor examines his face and eye".` },
      { q: "What is the main idea of this short story?", correct: `${n} gets sick, sees a doctor, and recovers`, distractors: ["a story about a sports match", "a poem about the weather", "a description of a school building"], explanation: "The story follows a simple arc: illness, doctor visit, recovery — a body-care narrative." },
    ],
  }),
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'The eye' in a body-parts reading text is written as ", after: ".", correct: "al-ayn" },
  { before: "'He washes' in a body-parts reading text is written as ", after: ".", correct: "yaghsilu" },
  { before: "'Every day' in a body-parts reading text is written as ", after: ".", correct: "kulla yawm" },
  { before: "'Before' in a body-parts reading text is written as ", after: ".", correct: "qabla" },
  { before: "'A doctor' in a body-parts reading text is written as ", after: ".", correct: "tabib" },
  { before: "'He recovers' in a body-parts reading text is written as ", after: ".", correct: "yashfa" },
  { before: "'A vocabulary bank' in a body-parts reading text is written as ", after: ".", correct: "bank mufradaat" },
  { before: "'He draws' in a body-parts reading text is written as ", after: ".", correct: "yarsumu" },
];

const BODY_CATEGORY: { word: string; type: "Upper body" | "Lower body" }[] = [
  { word: "ras", type: "Upper body" }, { word: "yad", type: "Upper body" }, { word: "ayn", type: "Upper body" }, { word: "anf", type: "Upper body" }, { word: "fam", type: "Upper body" }, { word: "udhun", type: "Upper body" }, { word: "sha'r", type: "Upper body" }, { word: "asnaan", type: "Upper body" }, { word: "wajh", type: "Upper body" }, { word: "dhira'", type: "Upper body" },
  { word: "rijl", type: "Lower body" }, { word: "batn", type: "Lower body" },
];

export const bodyReading: Skill = {
  id: "g6-ar-r-body",
  code: "R.7",
  subjectId: "arabic",
  strandId: "g6-ar-reading",
  grade: 6,
  title: "Extensive reading: stories and poems (body parts)",
  description: "Read short stories and poems about body parts, build a vocabulary bank from the text, and identify the main idea.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const n = name(rng);
    const p = place(rng);
    const skeleton = randChoice(rng, PASSAGE_SKELETONS)(n, p);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, BODY_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        passage,
        prompt: randChoice(rng, [
          "Build your vocabulary bank: match each body-part word to its meaning.",
          "Match the word from the passage's theme to its meaning.",
          "Which meaning goes with which body-part word?",
          "Pair each body-part word with its correct meaning.",
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
        hint: "Think about the body-parts vocabulary used in the passage above.",
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
      const chosen2 = shuffle(rng, BODY_CATEGORY).slice(0, 7);
      const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "As you read, sort each body part: Upper body, or Lower body?",
          "Group these body parts by upper vs lower body.",
          "Which category does each body part belong to?",
          "Sort each body-part word into the correct category.",
          "Classify each body part from the reading text.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Upper body", label: "Upper body" },
          { id: "Lower body", label: "Lower body" },
        ],
        correctBucket,
        hint: "The leg and stomach are lower body; the rest listed here are upper body.",
        explanation: chosen2.map((c) => `"${c.word}" is part of the ${c.type.toLowerCase()}.`).join(" "),
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
