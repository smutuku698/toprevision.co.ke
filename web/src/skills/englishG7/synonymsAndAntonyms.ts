import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface WordEntry {
  word: string;
  synonym: string;
  antonym: string;
  contextSentence: string; // the word used in a family-themed sentence
}

const WORD_ENTRIES: WordEntry[] = [
  { word: "happy", synonym: "joyful", antonym: "sad", contextSentence: "Grandmother was happy when all her grandchildren gathered for the holiday." },
  { word: "kind", synonym: "caring", antonym: "cruel", contextSentence: "My aunt is kind to every child who visits her home." },
  { word: "honest", synonym: "truthful", antonym: "dishonest", contextSentence: "Father always said an honest family is a strong family." },
  { word: "generous", synonym: "giving", antonym: "selfish", contextSentence: "Uncle Otieno is generous, sharing his harvest with every relative in the village." },
  { word: "patient", synonym: "tolerant", antonym: "impatient", contextSentence: "Mother stayed patient while teaching her youngest son to tie his shoelaces." },
  { word: "brave", synonym: "courageous", antonym: "cowardly", contextSentence: "My big sister was brave when she spoke up for our family at the meeting." },
  { word: "hardworking", synonym: "industrious", antonym: "lazy", contextSentence: "Grandfather remained hardworking on the farm well into his seventies." },
  { word: "respectful", synonym: "polite", antonym: "rude", contextSentence: "The twins are always respectful when greeting their elders at home." },
  { word: "strict", synonym: "firm", antonym: "lenient", contextSentence: "Our father is strict about finishing homework before playing outside." },
];

const SENTENCE_USE: { sentence: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    sentence: "Just as their mother is famously honest, the twins are equally ______, always telling the truth even when it is difficult.",
    correct: "truthful",
    distractors: ["dishonest", "shy", "forgetful"],
    explanation: "'Truthful' is a synonym of 'honest', matching the comparison set up by 'just as'.",
  },
  {
    sentence: "Unlike his hardworking elder sister, young Kevin is quite ______ around the house and avoids chores whenever he can.",
    correct: "lazy",
    distractors: ["industrious", "generous", "cheerful"],
    explanation: "'Lazy' is an antonym of 'hardworking', matching the contrast set up by 'unlike'.",
  },
  {
    sentence: "While Baba is very strict about bedtime, Mama is far more ______ and often lets the children stay up a little later.",
    correct: "lenient",
    distractors: ["firm", "generous", "honest"],
    explanation: "'Lenient' is an antonym of 'strict', matching the contrast between the two parents.",
  },
  {
    sentence: "Grandmother's neighbours describe her the same way her own mother was once described: wonderfully ______ toward every visitor.",
    correct: "caring",
    distractors: ["cruel", "impatient", "rude"],
    explanation: "'Caring' is a synonym of 'kind', matching the repeated family trait being described.",
  },
  {
    sentence: "Unlike her selfish cousin, Amina is remarkably ______, always sharing whatever she has with her siblings.",
    correct: "giving",
    distractors: ["selfish", "cowardly", "lazy"],
    explanation: "'Giving' is a synonym of 'generous', matching the contrast set up by 'unlike'.",
  },
  {
    sentence: "Their grandfather faced hardship the same courageous way his own father did — he has always been ______.",
    correct: "brave",
    distractors: ["cowardly", "impatient", "rude"],
    explanation: "'Brave' is a synonym of 'courageous', matching the family trait being passed down.",
  },
];

const CATEGORIZE_LABEL = (a: string, b: string) => `'${a}' and '${b}'`;

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it useful to use synonyms when writing a description of your family members?",
    correct: "Synonyms let a writer avoid repeating the same word, making the description more varied and interesting",
    distractors: [
      "Synonyms make a sentence exactly opposite in meaning",
      "Synonyms are only useful when writing formal letters",
      "Using synonyms is required only in poems, never in ordinary writing",
    ],
  },
  {
    q: "Why is it useful to know antonyms of words that describe a person's character?",
    correct: "Antonyms let a writer clearly contrast different family members' personalities",
    distractors: [
      "Antonyms always sound exactly the same as the original word",
      "Antonyms are only needed when writing about strangers, not family",
      "Knowing antonyms replaces the need to know synonyms",
    ],
  },
  {
    q: "Why should you check that you have spelled a synonym or antonym correctly before using it in writing?",
    correct: "Correct spelling helps the reader understand your meaning clearly and avoids confusion",
    distractors: [
      "Spelling has no effect on how a reader understands a sentence",
      "Only antonyms need to be spelled correctly, not synonyms",
      "Correct spelling is only checked by teachers during examinations",
    ],
  },
  {
    q: "What is the best way to check that a word you found in a thesaurus is truly a correct synonym before using it?",
    correct: "Look up its meaning in a dictionary and see if it fits naturally into your sentence",
    distractors: [
      "Choose the longest word listed, since longer words are always more correct",
      "Use the first word listed without checking its meaning",
      "Assume any word listed near it in the thesaurus must be correct",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Everyone in the family calls Aunt Naliaka generous because she is always ", after: " with her time and food. (Give a synonym of 'generous'.)", correctAnswer: "giving" },
  { before: "My little brother is the opposite of patient; he is always very ", after: " while waiting for dinner. (Give an antonym of 'patient'.)", correctAnswer: "impatient" },
  { before: "Unlike his honest twin sister, Otieno is sometimes ", after: " about where he has been after school. (Give an antonym of 'honest'.)", correctAnswer: "dishonest" },
  { before: "My grandfather is respected because he is so ", after: " to visitors and elders alike. (Give a synonym of 'respectful'.)", correctAnswer: "polite" },
  { before: "Although their father is strict about bedtime, their mother is more ", after: " and allows a little extra time. (Give an antonym of 'strict'.)", correctAnswer: "lenient" },
  { before: "My cousin never gives up on chores; she is truly ", after: ". (Give a synonym of 'hardworking'.)", correctAnswer: "industrious" },
];

export const synonymsAndAntonyms: Skill = {
  id: "g7-eng-r-synonyms-and-antonyms",
  code: "R.5",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Vocabulary: Synonyms and Antonyms",
  description: "Identify, spell, and use synonyms and antonyms correctly in sentences describing family relationships and character traits.",
  generate(rng) {
    const branch = randChoice(rng, ["synonym-mc", "antonym-mc", "match", "categorize", "fill", "use-sentence", "concept"] as const);
    const hint = "A synonym means nearly the same as a word. An antonym means the opposite of a word.";

    if (branch === "synonym-mc") {
      const entry = randChoice(rng, WORD_ENTRIES);
      const others = shuffle(rng, WORD_ENTRIES.filter((e) => e.word !== entry.word)).slice(0, 2);
      const choices = shuffle(rng, [entry.synonym, entry.antonym, ...others.map((o) => o.synonym)]);
      return {
        kind: "multiple-choice",
        passage: entry.contextSentence,
        prompt: `In this sentence, which word is closest in meaning (a synonym) to "${entry.word}"?`,
        choices,
        correctIndex: choices.indexOf(entry.synonym),
        layout: "list",
        hint: "A synonym means nearly the same thing — be careful not to pick the opposite word by mistake.",
        explanation: `"${entry.synonym}" is a synonym of "${entry.word}". "${entry.antonym}" is its antonym, not its synonym.`,
      };
    }

    if (branch === "antonym-mc") {
      const entry = randChoice(rng, WORD_ENTRIES);
      const others = shuffle(rng, WORD_ENTRIES.filter((e) => e.word !== entry.word)).slice(0, 2);
      const choices = shuffle(rng, [entry.antonym, entry.synonym, ...others.map((o) => o.antonym)]);
      return {
        kind: "multiple-choice",
        passage: entry.contextSentence,
        prompt: `Which word means the OPPOSITE (an antonym) of "${entry.word}" as used in this sentence?`,
        choices,
        correctIndex: choices.indexOf(entry.antonym),
        layout: "list",
        hint: "An antonym means the opposite — be careful not to pick a word that means nearly the same thing instead.",
        explanation: `"${entry.antonym}" is an antonym of "${entry.word}". "${entry.synonym}" is its synonym, not its antonym.`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, WORD_ENTRIES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.word, label: e.word })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.word, label: e.synonym })));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.word] = e.word;
      return {
        kind: "click-match",
        prompt: "Match each word to its synonym.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((e) => `"${e.word}" and "${e.synonym}" are synonyms.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const synPairs = shuffle(rng, WORD_ENTRIES).slice(0, 2);
      const antPairs = shuffle(rng, WORD_ENTRIES.filter((e) => !synPairs.includes(e))).slice(0, 2);
      const items = shuffle(rng, [
        ...synPairs.map((e, i) => ({ id: `s${i}`, label: CATEGORIZE_LABEL(e.word, e.synonym), bucket: "synonym" as const })),
        ...antPairs.map((e, i) => ({ id: `a${i}`, label: CATEGORIZE_LABEL(e.word, e.antonym), bucket: "antonym" as const })),
      ]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each word pair into Synonym pair or Antonym pair.",
        items: items.map((it) => ({ id: it.id, label: it.label })),
        buckets: [
          { id: "synonym", label: "Synonym pair" },
          { id: "antonym", label: "Antonym pair" },
        ],
        correctBucket,
        hint,
        explanation: items.map((it) => `${it.label} is a${it.bucket === "antonym" ? "n" : ""} ${it.bucket} pair.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence correctly.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "use-sentence") {
      const entry = randChoice(rng, SENTENCE_USE);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Choose the word that best completes this sentence: "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Look for comparison words like 'just as' or contrast words like 'unlike' — they tell you whether a synonym or antonym is needed.",
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
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
  },
};
