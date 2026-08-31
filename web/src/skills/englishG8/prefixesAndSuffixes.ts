import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PREFIXES: { affix: string; meaning: string; example: string }[] = [
  { affix: "un-", meaning: "not", example: "unqualified — not qualified" },
  { affix: "re-", meaning: "again", example: "retrain — to train again" },
  { affix: "pre-", meaning: "before", example: "pre-interview — before the interview" },
  { affix: "mis-", meaning: "wrongly", example: "misinformed — informed wrongly" },
  { affix: "dis-", meaning: "not / the opposite of", example: "disqualify — to make not qualified" },
  { affix: "sub-", meaning: "under / below", example: "subordinate — a person under someone else in rank" },
];

const SUFFIXES: { affix: string; meaning: string; example: string }[] = [
  { affix: "-able", meaning: "capable of being", example: "employable — capable of being employed" },
  { affix: "-ment", meaning: "the act, state, or result of", example: "employment — the state of being employed" },
  { affix: "-ness", meaning: "the quality or state of", example: "readiness — the quality of being ready" },
  { affix: "-tion", meaning: "the act or process of", example: "application — the act of applying" },
  { affix: "-ist", meaning: "a person who practises or is skilled in", example: "scientist — a person skilled in science" },
  { affix: "-er / -or", meaning: "a person who does an action, often an occupation", example: "teacher — a person who teaches; actor — a person who acts" },
];

const CATEGORIZE_WORDS: { word: string; type: "prefix" | "suffix" }[] = [
  { word: "unqualified", type: "prefix" },
  { word: "misinformed", type: "prefix" },
  { word: "disqualify", type: "prefix" },
  { word: "retrain", type: "prefix" },
  { word: "employment", type: "suffix" },
  { word: "readiness", type: "suffix" },
  { word: "scientist", type: "suffix" },
  { word: "employable", type: "suffix" },
];

const BUILD_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Add a suffix meaning 'a person who does this job' to 'teach' to form the word for someone whose career is teaching.", after: "", correctAnswer: "teacher" },
  { before: "Add a suffix meaning 'a person who does this job' to 'act' to form the word for someone whose career is acting in films.", after: "", correctAnswer: "actor" },
  { before: "Add a prefix meaning 'not' to 'qualified' to describe a candidate who does not meet the job requirements.", after: "", correctAnswer: "unqualified" },
  { before: "Add a prefix meaning 'again' to 'train' to describe workers learning new skills for a changing career.", after: "", correctAnswer: "retrain" },
  { before: "Add a suffix meaning 'the state of' to 'employ' to form the word for having a job.", after: "", correctAnswer: "employment" },

];

const TEXT_MC: { sentence: string; correct: string; distractors: string[]; question: string }[] = [
  {
    sentence: "The candidate was unqualified for the engineering interview.",
    question: "Which word in this sentence contains a prefix meaning 'not'?",
    correct: "unqualified",
    distractors: ["candidate", "engineering", "interview"],
  },
  {
    sentence: "After months of retraining, she became a certified electrician.",
    question: "Which word in this sentence contains a prefix meaning 'again'?",
    correct: "retraining",
    distractors: ["months", "became", "certified"],
  },
  {
    sentence: "The scientist's readiness for the research career impressed the panel.",
    question: "Which word in this sentence contains a suffix meaning 'the quality of'?",
    correct: "readiness",
    distractors: ["scientist's", "research", "panel"],
  },
];

export const prefixesAndSuffixes: Skill = {
  id: "g8-eng-w-prefixes-and-suffixes",
  code: "W.11",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Mechanics of Writing: Prefixes and Suffixes",
  description: "Identify prefixes and suffixes in career-related words, and use them correctly to build and understand meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "fill", "categorize", "mc"] as const);
    const hint = "A prefix at the start of a word changes its meaning (un-, re-, pre-, mis-, dis-, sub-); a suffix at the end often shows a quality, action, or occupation (-able, -ment, -ness, -tion, -ist, -er/-or).";

    if (branch === "match") {
      const pool = shuffle(rng, [...PREFIXES, ...SUFFIXES]).slice(0, 5);
      const tokens = shuffle(rng, pool.map((a) => ({ id: a.affix, label: a.affix })));
      const targets = shuffle(rng, pool.map((a) => ({ id: a.affix, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of pool) correctMap[a.affix] = a.affix;
      return {
        kind: "click-match",
        prompt: "Match each prefix or suffix to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: pool.map((a) => `${a.affix} means "${a.meaning}" (${a.example}).`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, BUILD_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Type the new career-related word formed.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Attach the prefix to the start, or the suffix to the end, of the base word.",
        explanation: `The word formed is "${entry.correctAnswer}".`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORIZE_WORDS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each career-related word by whether it contains a prefix or a suffix.",
        items,
        buckets: [
          { id: "prefix", label: "Contains a prefix" },
          { id: "suffix", label: "Contains a suffix" },
        ],
        correctBucket,
        hint: "A prefix is added before the base word; a suffix is added after it.",
        explanation: chosen.map((c) => `"${c.word}" contains a ${c.type}.`).join(" "),
      };
    }

    const entry = randChoice(rng, TEXT_MC);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: `${entry.question} Sentence: "${entry.sentence}"`,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
