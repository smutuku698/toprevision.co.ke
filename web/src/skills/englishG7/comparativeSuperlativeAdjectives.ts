import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ADJ_FORMS: { base: string; comparative: string; superlative: string; rule: string }[] = [
  { base: "old", comparative: "older", superlative: "oldest", rule: "add -er / -est" },
  { base: "young", comparative: "younger", superlative: "youngest", rule: "add -er / -est" },
  { base: "tall", comparative: "taller", superlative: "tallest", rule: "add -er / -est" },
  { base: "short", comparative: "shorter", superlative: "shortest", rule: "add -er / -est" },
  { base: "kind", comparative: "kinder", superlative: "kindest", rule: "add -er / -est" },
  { base: "strong", comparative: "stronger", superlative: "strongest", rule: "add -er / -est" },
  { base: "big", comparative: "bigger", superlative: "biggest", rule: "double the final consonant, then add -er / -est" },
  { base: "fit", comparative: "fitter", superlative: "fittest", rule: "double the final consonant, then add -er / -est" },
  { base: "happy", comparative: "happier", superlative: "happiest", rule: "change y to i, then add -er / -est" },
  { base: "busy", comparative: "busier", superlative: "busiest", rule: "change y to i, then add -er / -est" },
  { base: "healthy", comparative: "healthier", superlative: "healthiest", rule: "change y to i, then add -er / -est" },
  { base: "friendly", comparative: "friendlier", superlative: "friendliest", rule: "change y to i, then add -er / -est" },
  { base: "careful", comparative: "more careful", superlative: "most careful", rule: "use more / most before longer adjectives" },
  { base: "generous", comparative: "more generous", superlative: "most generous", rule: "use more / most before longer adjectives" },
  { base: "patient", comparative: "more patient", superlative: "most patient", rule: "use more / most before longer adjectives" },
  { base: "hardworking", comparative: "more hardworking", superlative: "most hardworking", rule: "use more / most before longer adjectives" },
  { base: "good", comparative: "better", superlative: "best", rule: "use the irregular form" },
  { base: "bad", comparative: "worse", superlative: "worst", rule: "use the irregular form" },
  { base: "far", comparative: "farther", superlative: "farthest", rule: "use the irregular form" },
] as const;

const DEGREE_SENTENCES: { text: string; degree: "positive" | "comparative" | "superlative" }[] = [
  { text: "My grandmother is wise.", degree: "positive" },
  { text: "My uncle is taller than my father.", degree: "comparative" },
  { text: "Of all my cousins, Amina is the most generous.", degree: "superlative" },
  { text: "Baba is strong.", degree: "positive" },
  { text: "My sister is younger than me.", degree: "comparative" },
  { text: "Grandfather is the oldest person in our family.", degree: "superlative" },
  { text: "Aunt Naliaka is patient with the little ones.", degree: "positive" },
  { text: "My brother is busier than I am this term.", degree: "comparative" },
  { text: "Mum is the most hardworking person I know.", degree: "superlative" },
  { text: "Our cousin Otieno is fit.", degree: "positive" },
  { text: "This year the harvest is better than last year's.", degree: "comparative" },
  { text: "Grandmother tells the best stories in the whole family.", degree: "superlative" },
];

const IDENTIFY_MC: { sentence: string; target: string; correct: string; distractors: string[] }[] = [
  { sentence: "My father is kind.", target: "kind", correct: "Positive adjective", distractors: ["Comparative adjective", "Superlative adjective", "Adverb"] },
  { sentence: "My older brother is stronger than me.", target: "stronger", correct: "Comparative adjective", distractors: ["Positive adjective", "Superlative adjective", "Adverb"] },
  { sentence: "Grandmother is the healthiest person in our homestead.", target: "healthiest", correct: "Superlative adjective", distractors: ["Positive adjective", "Comparative adjective", "Adverb"] },
  { sentence: "My little sister is friendly to visitors.", target: "friendly", correct: "Positive adjective", distractors: ["Comparative adjective", "Superlative adjective", "Adverb"] },
  { sentence: "Of the whole family, Uncle Kiptoo is the most careful driver.", target: "most careful", correct: "Superlative adjective", distractors: ["Positive adjective", "Comparative adjective", "Adverb"] },
  { sentence: "My cousin is more patient than her younger brother.", target: "more patient", correct: "Comparative adjective", distractors: ["Positive adjective", "Superlative adjective", "Adverb"] },
];

const ERROR_MC: { correct: string; wrong: string[]; note: string }[] = [
  {
    correct: "My father is stronger than my uncle.",
    wrong: [
      "My father is more stronger than my uncle.",
      "My father is strongerer than my uncle.",
      "My father is the stronger than my uncle.",
    ],
    note: "A short adjective forms its comparative with -er alone — never add 'more' as well, and never double the -er ending.",
  },
  {
    correct: "Grandmother tells the best stories in the family.",
    wrong: [
      "Grandmother tells the goodest stories in the family.",
      "Grandmother tells the most best stories in the family.",
      "Grandmother tells the bestest stories in the family.",
    ],
    note: "'Good' is irregular — its superlative is simply 'best', not 'goodest' or 'bestest', and it never takes 'most' as well.",
  },
  {
    correct: "Amina is the most generous person in our family.",
    wrong: [
      "Amina is the generousest person in our family.",
      "Amina is the more generous person in our family.",
      "Amina is the most generousest person in our family.",
    ],
    note: "Longer adjectives like 'generous' form the superlative with 'most', not by adding '-est' to the word.",
  },
  {
    correct: "This harvest is worse than last year's.",
    wrong: [
      "This harvest is more bad than last year's.",
      "This harvest is badder than last year's.",
      "This harvest is worser than last year's.",
    ],
    note: "'Bad' is irregular — its comparative is simply 'worse', not 'badder', 'worser', or 'more bad'.",
  },
  {
    correct: "My cousin is busier than her brother this term.",
    wrong: [
      "My cousin is busyer than her brother this term.",
      "My cousin is more busy than her brother this term.",
      "My cousin is busiest than her brother this term.",
    ],
    note: "For adjectives ending in a consonant + y, change the y to i before adding -er — 'busy' becomes 'busier', not 'busyer' or 'more busy'.",
  },
];

const CONSTRUCT_FILL: { before: string; base: string; after: string; degree: "comparative" | "superlative"; correctAnswer: string }[] = [
  { before: "My grandfather is ", base: "old", after: " than my father.", degree: "comparative", correctAnswer: "older" },
  { before: "Of all my relatives, Aunt Chebet is the ", base: "generous", after: " one.", degree: "superlative", correctAnswer: "most generous" },
  { before: "This year's harvest is ", base: "good", after: " than last year's.", degree: "comparative", correctAnswer: "better" },
  { before: "My little brother is the ", base: "young", after: " child in our family.", degree: "superlative", correctAnswer: "youngest" },
  { before: "My mother is ", base: "busy", after: " than my aunt this week.", degree: "comparative", correctAnswer: "busier" },
  { before: "Grandmother is the ", base: "wise", after: " person I know.", degree: "superlative", correctAnswer: "wisest" },
  { before: "My uncle is ", base: "patient", after: " than my cousin when teaching the little ones.", degree: "comparative", correctAnswer: "more patient" },
  { before: "Of all the cousins, Otieno is the ", base: "fit", after: " footballer.", degree: "superlative", correctAnswer: "fittest" },
];

export const comparativeSuperlativeAdjectives: Skill = {
  id: "g7-eng-g-comparative-superlative-adjectives",
  code: "G.5",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Comparative and Superlative Adjectives",
  description: "Identify and correctly use comparative and superlative adjectives when comparing family members and everyday things.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify-mc", "error-mc", "fill", "match"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, DEGREE_SENTENCES).slice(0, 6);
      const buckets = [
        { id: "positive", label: "Positive (plain, no comparison)" },
        { id: "comparative", label: "Comparative (compares two)" },
        { id: "superlative", label: "Superlative (compares three or more)" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.degree));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by the degree of the adjective it uses: positive, comparative, or superlative.",
        items,
        buckets,
        correctBucket,
        hint: "Comparative adjectives often appear with 'than' and compare two things. Superlative adjectives often follow 'the' and compare three or more.",
        explanation: chosen.map((s) => `"${s.text}" uses a ${s.degree} adjective.`).join(" "),
      };
    }

    if (branch === "identify-mc") {
      const entry = randChoice(rng, IDENTIFY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What kind of adjective is "${entry.target}" in this sentence? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check whether the sentence compares two things (comparative), three or more things (superlative), or makes no comparison at all (positive).",
        explanation: `"${entry.target}" is a ${entry.correct.toLowerCase()} in this sentence: "${entry.sentence}"`,
      };
    }

    if (branch === "error-mc") {
      const entry = randChoice(rng, ERROR_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence uses the comparative or superlative adjective correctly?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Watch out for doubled comparisons (using 'more' and '-er' together) and irregular adjectives that do not simply add -er or -est.",
        explanation: entry.note,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ADJ_FORMS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: a.base })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: `${a.comparative} / ${a.superlative}` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a, i) => (correctMap[`a${i}`] = `a${i}`));
      return {
        kind: "click-match",
        prompt: "Match each adjective to its comparative and superlative forms.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the adjective is short (add -er/-est), ends in y (change to i), ends in one vowel + consonant (double the consonant), is long (use more/most), or is irregular.",
        explanation: chosen.map((a) => `"${a.base}" → "${a.comparative}" → "${a.superlative}" (${a.rule}).`).join(" "),
      };
    }

    const entry = randChoice(rng, CONSTRUCT_FILL);
    return {
      kind: "fill-blank",
      prompt: `Fill in the correct ${entry.degree} form of the adjective "${entry.base}".`,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: entry.degree === "comparative" ? "This sentence compares two family members, so you need the comparative form." : "This sentence picks out one family member from a larger group, so you need the superlative form.",
      explanation: `"${entry.correctAnswer}" is the correct ${entry.degree} form of "${entry.base}": "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
