import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MISSPELT_WORDS: { correct: string; wrongs: string[] }[] = [
  { correct: "necessary", wrongs: ["neccessary", "necessery", "neccesary"] },
  { correct: "definitely", wrongs: ["definately", "definitly", "defenitely"] },
  { correct: "separate", wrongs: ["seperate", "separrate", "seperete"] },
  { correct: "occurred", wrongs: ["occured", "ocurred", "occureed"] },
  { correct: "embarrass", wrongs: ["embarass", "embarras", "emberrass"] },
  { correct: "accommodate", wrongs: ["accomodate", "acommodate", "accommadate"] },
  { correct: "rhythm", wrongs: ["rythm", "rhythem", "rithym"] },
  { correct: "government", wrongs: ["goverment", "govermment", "governmant"] },
  { correct: "tomorrow", wrongs: ["tommorow", "tomorow", "tommorrow"] },
  { correct: "beginning", wrongs: ["begining", "beggining", "beginnning"] },
];

const AFFIXES: { affix: string; type: "prefix" | "suffix"; meaning: string; example: string }[] = [
  { affix: "un-", type: "prefix", meaning: "not / the opposite of", example: "unable — not able" },
  { affix: "re-", type: "prefix", meaning: "again", example: "rewrite — to write again" },
  { affix: "dis-", type: "prefix", meaning: "not / the opposite of", example: "disagree — to not agree" },
  { affix: "-ful", type: "suffix", meaning: "full of", example: "hopeful — full of hope" },
  { affix: "-less", type: "suffix", meaning: "without", example: "hopeless — without hope" },
  { affix: "-ment", type: "suffix", meaning: "the result or action of", example: "agreement — the result of agreeing" },
];

const IE_WORDS = ["believe", "friend", "field", "piece", "niece", "chief", "relief"];
const EI_AFTER_C_WORDS = ["receive", "ceiling", "deceive", "perceive", "conceit"];

const REHAB_IE_SENTENCES: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Every counsellor at the rehabilitation centre must", after: "that each person deserves a second chance.", correctAnswer: "believe" },
  { before: "The centre will", after: "new residents into the programme every month.", correctAnswer: "receive" },
  { before: "A supportive", after: "visited him every week during his recovery.", correctAnswer: "friend" },
];

const KIQ_MC: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should words be spelt correctly in writing?",
    correct: "So the reader understands the intended word and meaning without confusion",
    distractors: ["Because spelling has no effect on meaning", "So the writing looks longer", "Because correct spelling is only needed in exams"],
  },
];

export const spelling: Skill = {
  id: "g8-eng-w-spelling",
  code: "W.6",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Mechanics of Writing: Spelling",
  description: "Spell commonly misspelt words correctly, use prefixes and suffixes accurately, and apply the 'i before e except after c' rule.",
  generate(rng) {
    const branch = randChoice(rng, ["misspelt-mc", "affix-match", "affix-fill", "ie-categorize", "ie-fill", "kiq-mc"] as const);
    const hint = "Watch for double letters, silent letters, and the 'i before e except after c' rule when spelling tricky words.";

    if (branch === "kiq-mc") {
      const entry = randChoice(rng, KIQ_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "misspelt-mc") {
      const entry = randChoice(rng, MISSPELT_WORDS);
      const choices = shuffle(rng, [entry.correct, ...shuffle(rng, entry.wrongs).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: "Which spelling is correct?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint: "This word is one that is very commonly misspelt — check every letter carefully, including doubled letters.",
        explanation: `The correct spelling is "${entry.correct}".`,
      };
    }

    if (branch === "affix-match") {
      const chosen = shuffle(rng, AFFIXES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.affix, label: a.affix })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.affix, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.affix] = a.affix;
      return {
        kind: "click-match",
        prompt: "Match each prefix or suffix to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "A prefix is added to the start of a word; a suffix is added to the end. Both change the word's meaning.",
        explanation: chosen.map((a) => `${a.affix} means "${a.meaning}" (${a.example}).`).join(" "),
      };
    }

    if (branch === "affix-fill") {
      const entry = randChoice(rng, [
        { before: "Add a prefix meaning 'not' to 'agree' to form a word meaning 'to not agree'.", after: "", correctAnswer: "disagree" },
        { before: "Add a suffix meaning 'without' to 'care' to form a word describing someone who acts without thinking.", after: "", correctAnswer: "careless" },
        { before: "Add a prefix meaning 'again' to 'write' to form a word meaning 'to write again'.", after: "", correctAnswer: "rewrite" },
        { before: "Add a suffix meaning 'full of' to 'hope' to form a word meaning 'full of hope'.", after: "", correctAnswer: "hopeful" },
        { before: "Add a suffix meaning 'the result of' to 'agree' to form a word meaning 'the result of agreeing'.", after: "", correctAnswer: "agreement" },
      ]);
      return {
        kind: "fill-blank",
        prompt: "Type the new word formed.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Attach the prefix or suffix directly to the base word — most simple base words need no spelling change.",
        explanation: `The word formed is "${entry.correctAnswer}".`,
      };
    }

    if (branch === "ie-categorize") {
      const ie = shuffle(rng, IE_WORDS).slice(0, 3);
      const ei = shuffle(rng, EI_AFTER_C_WORDS).slice(0, 3);
      const items = shuffle(rng, [
        ...ie.map((w) => ({ id: w, label: w, bucket: "ie" })),
        ...ei.map((w) => ({ id: w, label: w, bucket: "ei" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each word by its spelling pattern: 'ie' or 'ei' (after c).",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "ie", label: "'ie' spelling" },
          { id: "ei", label: "'ei' spelling (after c)" },
        ],
        correctBucket,
        hint: "'i before e, except after c' — so words spelt with 'c' right before the sound usually use 'ei' instead of 'ie'.",
        explanation: `'ie' spelling: ${ie.join(", ")}. 'ei' spelling (after c): ${ei.join(", ")}.`,
      };
    }

    const entry = randChoice(rng, REHAB_IE_SENTENCES);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word, spelt correctly.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Remember: 'i before e, except after c'.",
      explanation: `The correctly spelt word is "${entry.correctAnswer}" — ${entry.correctAnswer.includes("ei") ? "it follows 'c', so it uses 'ei'." : "it does not follow 'c', so it uses 'ie'."}`,
    };
  },
};
