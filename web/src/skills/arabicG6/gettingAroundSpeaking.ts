import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { POSITION_VOCAB, SCHOOL_VOCAB, name, place } from "./shared";

// Sub-strand 1.9 Language Use — Theme: Getting Around.
// Content: recognise objects from an oral text, describe positions of objects relative to others
// (next to, opposite, in front of, near, across), worked examples "behind the library, near the
// staffroom".

const LOCATE_TEMPLATES: ((n: string, p: string, pos: { word: string; meaning: string }, sch1: { word: string; meaning: string }, sch2: { word: string; meaning: string }) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p, pos, sch1, sch2) => ({
    prompt: `${n} in ${p} tells a visitor "al-maktaba ${pos.word} al-fasl." Where is the library?`,
    correct: `${pos.meaning} the classroom`,
    distractors: [`inside the classroom`, `nowhere near the classroom`, `the sentence does not say`],
    explanation: `"al-maktaba ${pos.word} al-fasl" means "the library is ${pos.meaning} the classroom".`,
  }),
  (n, p, pos, sch1, sch2) => ({
    prompt: `${n} in ${p} says "al-mal'ab ${pos.word} al-maktab." What is being described?`,
    correct: `the playground's position ${pos.meaning} the office`,
    distractors: [`the playground's size`, `the playground's colour`, `the office's opening hours`],
    explanation: `"al-mal'ab ${pos.word} al-maktab" describes the playground's position — ${pos.meaning} the office.`,
  }),
  (n, p, pos, sch1, sch2) => ({
    prompt: `A new student in ${p} asks ${n} where the staffroom is, and ${n} answers "ghurfat al-mu'allimeen ${pos.word} al-bawwaba." What does ${n} mean?`,
    correct: `the staffroom is ${pos.meaning} the gate`,
    distractors: [`the staffroom is inside the gate`, `there is no staffroom`, `the gate is closed`],
    explanation: `"ghurfat al-mu'allimeen ${pos.word} al-bawwaba" means "the staffroom is ${pos.meaning} the gate".`,
  }),
  (n, p, pos, sch1, sch2) => ({
    prompt: `${n} in ${p} describes the school layout: "al-hadiqa ${pos.word} al-mat'am." What is ${n} describing?`,
    correct: `where the garden is ${pos.meaning} the dining hall`,
    distractors: [`what the garden looks like`, `what time lunch is served`, `who works in the dining hall`],
    explanation: `"al-hadiqa ${pos.word} al-mat'am" describes the garden's position — ${pos.meaning} the dining hall.`,
  }),
  (n, p, pos, sch1, sch2) => ({
    prompt: `${n} in ${p} hears an oral text saying "al-hammam ${pos.word} al-mamarr." Which object's position is being described?`,
    correct: `the washroom, ${pos.meaning} the corridor`,
    distractors: [`the classroom, ${pos.meaning} the corridor`, `the corridor's colour`, `the mamarr's length`],
    explanation: `"al-hammam ${pos.word} al-mamarr" means "the washroom is ${pos.meaning} the corridor".`,
  }),
];

const WORKED_EXAMPLE_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  { q: "In the worked example 'khalf al-maktaba, qareeb min ghurfat al-mu'allimeen' (behind the library, near the staffroom), what TWO position relationships are given?", correct: "behind one place, and near another place", distractors: ["above one place, and under another", "inside one place, and outside another", "before one place, and after another"], explanation: "'khalf' (behind) and 'qareeb min' (near) are the two position words used in this worked example." },
  { q: "Which position word means 'behind' in the worked example describing where something is located?", correct: "khalf", distractors: ["amaam", "fawq", "taht"], explanation: "'khalf' means 'behind' — as used in 'khalf al-maktaba' (behind the library)." },
  { q: "If someone says an object is 'near the staffroom', which Arabic phrase would they use?", correct: "qareeb min ghurfat al-mu'allimeen", distractors: ["ba'eed 'an ghurfat al-mu'allimeen", "fawq ghurfat al-mu'allimeen", "khalf ghurfat al-mu'allimeen"], explanation: "'qareeb min' means 'near' — the opposite would be 'ba'eed 'an' (far from)." },
];

const CATEGORY_ITEMS: { word: string; bucket: "Near/adjacent" | "Facing/opposite" }[] = [
  { word: "bijaanib", bucket: "Near/adjacent" },
  { word: "qareeb min", bucket: "Near/adjacent" },
  { word: "khalf", bucket: "Near/adjacent" },
  { word: "amaam", bucket: "Facing/opposite" },
  { word: "muqabil", bucket: "Facing/opposite" },
  { word: "'abra", bucket: "Facing/opposite" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["A visitor asks where the library is", "You say 'al-maktaba khalf al-fasl' (the library is behind the classroom)", "You add 'qareeb min al-maktab' (near the office)", "The visitor thanks you and walks there"] },
  { lines: ["A new student can't find the staffroom", "You point and say 'ghurfat al-mu'allimeen amaam al-mal'ab' (the staffroom is in front of the playground)", "You mention it is 'bijaanib al-bawwaba' (next to the gate)", "The student finds it easily"] },
];

export const gettingAroundSpeaking: Skill = {
  id: "g6-ar-ls-getting-around",
  code: "LS.9",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Language use: describing positions of objects",
  description: "Recognise objects from an oral text and describe the positions of school facilities relative to each other.",
  generate(rng) {
    const branch = randChoice(rng, ["locate", "worked", "match", "categorize", "ordering"] as const);

    if (branch === "locate") {
      const n = name(rng);
      const p = place(rng);
      const pos = randChoice(rng, POSITION_VOCAB);
      const [sch1, sch2] = shuffle(rng, [...SCHOOL_VOCAB]).slice(0, 2);
      const tmpl = randChoice(rng, LOCATE_TEMPLATES);
      const q = tmpl(n, p, pos, sch1, sch2);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, [
          "Listen to the description and work out the position.",
          "What position is being described here?",
          "Read the situation and choose the correct position.",
          "Choose the meaning that matches this description.",
          "Where is the object located, based on this sentence?",
        ]) + " " + q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Match the position word (next to, opposite, in front of, near, across, behind) to its meaning.",
        explanation: q.explanation,
      };
    }

    if (branch === "worked") {
      const q = randChoice(rng, WORKED_EXAMPLE_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.q,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Recall the worked example: behind the library, near the staffroom.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, POSITION_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.word })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.word, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.word] = s.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each position word to its meaning.",
          "Match the spoken position word to what it means.",
          "Which meaning goes with which position word?",
          "Pair each position word with its correct meaning.",
          "Match each word you hear to its meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((s) => `"${s.word}" means "${s.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen2 = shuffle(rng, CATEGORY_ITEMS).slice(0, 5);
      const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "Sort each position word: Near/adjacent, or Facing/opposite?",
          "Group these position words by category.",
          "Sort each position word into the correct category.",
          "Which category does each position word belong to?",
          "Classify each position word below.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Near/adjacent", label: "Near/adjacent" },
          { id: "Facing/opposite", label: "Facing/opposite" },
        ],
        correctBucket,
        hint: "Next to/near/behind describe closeness; in front of/opposite/across describe facing.",
        explanation: chosen2.map((c) => `"${c.word}" describes a ${c.bucket.toLowerCase()} relationship.`).join(" "),
      };
    }

    const set = randChoice(rng, ORDER_SETS);
    const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
    const items = shuffle(rng, withIds);
    return {
      kind: "ordering",
      prompt: randChoice(rng, [
        "Put these lines of the exchange in the order they would naturally be said.",
        "Arrange the exchange in a sensible order.",
        "Order the lines as they would appear in a conversation.",
        "Sequence this exchange correctly.",
        "Which order makes this exchange make sense?",
      ]),
      instruction: "Click the lines in the correct order.",
      items,
      correctOrder: withIds.map((w) => w.id),
      hint: "A question comes first, then the position description, then extra detail, then a closing.",
      explanation: `A natural order is:\n${set.lines.join("\n")}`,
    };
  },
};
