import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WORD_RELATIONS: { word: string; related: string; relation: "antonym" | "synonym"; wrongs: string[] }[] = [
  { word: "honest", related: "dishonest", relation: "antonym", wrongs: ["disshonest", "dishonnest", "dishonnest y"] },
  { word: "responsible", related: "irresponsible", relation: "antonym", wrongs: ["irresponsable", "iresponsible", "irresponsibel"] },
  { word: "experienced", related: "inexperienced", relation: "antonym", wrongs: ["inexperiensed", "unexperienced", "inexperiancedd"] },
  { word: "careful", related: "careless", relation: "antonym", wrongs: ["carelesss", "carelless", "carelless s"] },
  { word: "competent", related: "incompetent", relation: "antonym", wrongs: ["incompotent", "imcompetent", "incompetant"] },
  { word: "punctual", related: "unpunctual", relation: "antonym", wrongs: ["unpunctuall", "unpunctal", "impunctual"] },
  { word: "job", related: "occupation", relation: "synonym", wrongs: ["occupasion", "ocupation", "occupattion"] },
  { word: "skilled", related: "proficient", relation: "synonym", wrongs: ["proficeint", "profficient", "proffcient"] },
  { word: "boss", related: "supervisor", relation: "synonym", wrongs: ["supervisior", "supervizor", "superviser"] },
  { word: "coworker", related: "colleague", relation: "synonym", wrongs: ["collegue", "colegue", "collaegue"] },
  { word: "career", related: "profession", relation: "synonym", wrongs: ["proffession", "profesion", "professsion"] },
  { word: "employer", related: "recruiter", relation: "synonym", wrongs: ["recruter", "recruitor", "recuriter"] },
];

const NUMBER_ITEMS: { digit: number; correct: string; wrongs: string[] }[] = [
  { digit: 40, correct: "forty", wrongs: ["fourty", "fortey", "forety"] },
  { digit: 80, correct: "eighty", wrongs: ["eigthy", "eightey", "eighy"] },
  { digit: 90, correct: "ninety", wrongs: ["ninty", "ninetey", "niney"] },
  { digit: 18, correct: "eighteen", wrongs: ["eightteen", "eighteeen", "eightean"] },
  { digit: 12, correct: "twelve", wrongs: ["twelv", "twelfe", "twelw"] },
  { digit: 30, correct: "thirty", wrongs: ["thirtey", "thirdy", "thirtty"] },
];

const NUMBER_SENTENCES: { before: string; after: string; digit: number; correctAnswer: string }[] = [
  { before: "The county hospital now employs", after: "trained nurses across its wards.", digit: 40, correctAnswer: "forty" },
  { before: "The factory has", after: "trained electricians on its staff.", digit: 80, correctAnswer: "eighty" },
  { before: "Only", after: "candidates passed the accountancy exam out of one hundred.", digit: 90, correctAnswer: "ninety" },
  { before: "The firm has been operating for", after: "years and now trains new architects every year.", digit: 18, correctAnswer: "eighteen" },
  { before: "The construction firm has recruited", after: "new engineers this quarter alone.", digit: 12, correctAnswer: "twelve" },
  { before: "The tailoring workshop has trained", after: "apprentices since it opened.", digit: 30, correctAnswer: "thirty" },
];

const NUMBER_SENTENCE_PAIRS: { correct: string; wrong: string }[] = [
  { correct: "The clinic now has forty trained nurses on its staff.", wrong: "The clinic now has fourty trained nurses on its staff." },
  { correct: "The construction firm employs eighty skilled electricians.", wrong: "The construction firm employs eigthy skilled electricians." },
  { correct: "Ninety percent of the graduates found jobs within a year.", wrong: "Ninty percent of the graduates found jobs within a year." },
  { correct: "The law firm has operated for eighteen years.", wrong: "The law firm has operated for eightteen years." },
];

export const spellingAntonymsSynonymsNumbers: Skill = {
  id: "g7-eng-w-spelling-antonyms-synonyms-numbers",
  code: "W.11",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Spelling: Antonyms, Synonyms and Numbers",
  description: "Spell antonyms, synonyms, and numbers-in-words correctly in sentences about different professions.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-relation", "mc-number", "mc-sentence", "match", "fill", "categorize"] as const);
    const hint = "Check every letter of a tricky word carefully — antonyms, synonyms, and numbers written as words are commonly misspelt.";

    if (branch === "mc-relation") {
      const entry = randChoice(rng, WORD_RELATIONS);
      const choices = shuffle(rng, [entry.related, ...shuffle(rng, entry.wrongs).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correctly spelt ${entry.relation} of "${entry.word}"?`,
        choices,
        correctIndex: choices.indexOf(entry.related),
        layout: "row",
        hint,
        explanation: `The correctly spelt ${entry.relation} of "${entry.word}" is "${entry.related}".`,
      };
    }

    if (branch === "mc-number") {
      const entry = randChoice(rng, NUMBER_ITEMS);
      const choices = shuffle(rng, [entry.correct, ...shuffle(rng, entry.wrongs).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correct spelling of the number ${entry.digit} in words?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint,
        explanation: `The number ${entry.digit} is spelt "${entry.correct}".`,
      };
    }

    if (branch === "mc-sentence") {
      const entry = randChoice(rng, NUMBER_SENTENCE_PAIRS);
      const choices = shuffle(rng, [entry.correct, entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence spells the number in words correctly?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correctly spelt sentence is: "${entry.correct}"`,
      };
    }

    if (branch === "match") {
      const synonymsOnly = shuffle(rng, WORD_RELATIONS.filter((w) => w.relation === "synonym")).slice(0, 4);
      const tokens = shuffle(rng, synonymsOnly.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, synonymsOnly.map((w) => ({ id: w.word, label: w.related })));
      const correctMap: Record<string, string> = {};
      for (const w of synonymsOnly) correctMap[w.word] = w.word;
      return {
        kind: "click-match",
        prompt: "Match each profession-related word to its correctly spelt synonym.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: synonymsOnly.map((w) => `"${w.word}" and "${w.related}" are synonyms.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, NUMBER_SENTENCES);
      return {
        kind: "fill-blank",
        prompt: `Fill in the number ${entry.digit}, spelt correctly in words.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const chosen = shuffle(rng, NUMBER_ITEMS).slice(0, 3);
    const items = shuffle(
      rng,
      chosen.flatMap((n, i) => [
        { id: `correct${i}`, label: n.correct, bucket: "correct" },
        { id: `wrong${i}`, label: randChoice(rng, n.wrongs), bucket: "wrong" },
      ])
    );
    const correctBucket: Record<string, string> = {};
    for (const it of items) correctBucket[it.id] = it.bucket;
    return {
      kind: "categorize",
      prompt: "Sort each spelling of a number word into Correct spelling or Misspelt.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "correct", label: "Correct spelling" },
        { id: "wrong", label: "Misspelt" },
      ],
      correctBucket,
      hint,
      explanation: chosen.map((n) => `The correct spelling of ${n.digit} is "${n.correct}".`).join(" "),
    };
  },
};
