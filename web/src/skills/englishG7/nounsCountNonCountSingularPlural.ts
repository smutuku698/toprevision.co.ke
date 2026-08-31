import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COUNT_NONCOUNT: { word: string; type: "count" | "noncount" }[] = [
  { word: "germ", type: "count" },
  { word: "vaccine", type: "count" },
  { word: "tablet", type: "count" },
  { word: "bandage", type: "count" },
  { word: "injection", type: "count" },
  { word: "nurse", type: "count" },
  { word: "clinic", type: "count" },
  { word: "mosquito", type: "count" },
  { word: "symptom", type: "count" },
  { word: "health", type: "noncount" },
  { word: "hygiene", type: "noncount" },
  { word: "nutrition", type: "noncount" },
  { word: "information", type: "noncount" },
  { word: "advice", type: "noncount" },
  { word: "oxygen", type: "noncount" },
  { word: "sleep", type: "noncount" },
] as const;

const PLURALS: { singular: string; plural: string; wrong: string[] }[] = [
  { singular: "tooth", plural: "teeth", wrong: ["tooths", "teeths"] },
  { singular: "foot", plural: "feet", wrong: ["foots", "feets"] },
  { singular: "child", plural: "children", wrong: ["childs", "childrens"] },
  { singular: "person", plural: "people", wrong: ["persons", "peoples"] },
  { singular: "mouse", plural: "mice", wrong: ["mouses", "mices"] },
  { singular: "bacterium", plural: "bacteria", wrong: ["bacteriums", "bacterias"] },
  { singular: "diagnosis", plural: "diagnoses", wrong: ["diagnosises", "diagnosis's"] },
  { singular: "virus", plural: "viruses", wrong: ["virus's", "viri"] },
  { singular: "clinic", plural: "clinics", wrong: ["clinices", "clinic's"] },
  { singular: "nurse", plural: "nurses", wrong: ["nurse's", "nursies"] },
] as const;

const PLURAL_SENTENCES: { singular: string; plural: string; before: string; after: string }[] = [
  { singular: "child", plural: "children", before: "The clinic vaccinated forty ", after: " during the health camp." },
  { singular: "tooth", plural: "teeth", before: "The dentist checked all of Amani's ", after: " for cavities." },
  { singular: "person", plural: "people", before: "Over a hundred ", after: " attended the free health screening in Kitale." },
  { singular: "bacterium", plural: "bacteria", before: "Harmful ", after: " can spread quickly in unclean water." },
  { singular: "foot", plural: "feet", before: "The nurse advised patients to wash their ", after: " daily to prevent infection." },
  { singular: "diagnosis", plural: "diagnoses", before: "The laboratory confirmed both ", after: " with a blood test." },
];

const NONCOUNT_ERROR_MC: { correct: string; wrong: string; note: string }[] = [
  {
    correct: "The community health worker gave the villagers useful information about malaria prevention.",
    wrong: "The community health worker gave the villagers useful informations about malaria prevention.",
    note: "'Information' is a non-count noun — it has no plural form, so we never write 'informations'.",
  },
  {
    correct: "The nurse offered good advice about washing hands before every meal.",
    wrong: "The nurse offered a good advice about washing hands before every meal.",
    note: "'Advice' is non-count — we cannot say 'an advice' or 'advices'; instead we say 'advice', 'some advice', or 'a piece of advice'.",
  },
  {
    correct: "How much oxygen does a patient need during surgery?",
    wrong: "How many oxygens does a patient need during surgery?",
    note: "'Oxygen' is non-count, so it takes the quantifier 'much', not 'many', and never takes a plural form.",
  },
  {
    correct: "Good hygiene helps prevent the spread of disease in schools.",
    wrong: "Good hygienes help prevent the spread of disease in schools.",
    note: "'Hygiene' is non-count — it has no plural form and always pairs with a singular verb.",
  },
];

const QUANTIFIER_PAIRS: { noun: string; phrase: string }[] = [
  { noun: "advice", phrase: "a piece of advice" },
  { noun: "information", phrase: "a piece of information" },
  { noun: "medicine", phrase: "a dose of medicine" },
  { noun: "water", phrase: "a glass of water" },
  { noun: "equipment", phrase: "a piece of equipment" },
];

export const nounsCountNonCountSingularPlural: Skill = {
  id: "g7-eng-g-nouns-count-noncount-singular-plural",
  code: "G.2",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Word Classes: Nouns (Count, Non-Count, Singular, Plural)",
  description: "Identify count and non-count nouns and use their correct singular and plural forms in science and health contexts.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "fill", "error-mc", "match"] as const);

    if (branch === "categorize") {
      const countPick = shuffle(rng, COUNT_NONCOUNT.filter((c) => c.type === "count")).slice(0, 3);
      const noncountPick = shuffle(rng, COUNT_NONCOUNT.filter((c) => c.type === "noncount")).slice(0, 3);
      const chosen = shuffle(rng, [...countPick, ...noncountPick]);
      const buckets = [
        { id: "count", label: "Count noun (can be counted: one, two, three...)" },
        { id: "noncount", label: "Non-count noun (cannot be counted individually)" },
      ];
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each noun as count or non-count.",
        items,
        buckets,
        correctBucket,
        hint: "Ask: can I put a number in front of this word and make it plural, like 'two germs'? If not, it is non-count.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.type === "count" ? "count" : "non-count"} noun.`).join(" "),
      };
    }

    if (branch === "fill") {
      const useSentence = rng() < 0.5;
      if (useSentence) {
        const entry = randChoice(rng, PLURAL_SENTENCES);
        return {
          kind: "fill-blank",
          prompt: `Fill in the plural form of "${entry.singular}" to complete the sentence.`,
          before: entry.before,
          after: entry.after,
          correctAnswer: entry.plural,
          inputMode: "text",
          hint: "This noun does not simply add -s to form its plural.",
          explanation: `The plural of "${entry.singular}" is "${entry.plural}": "${entry.before}${entry.plural}${entry.after}"`,
        };
      }
      const entry = randChoice(rng, PLURALS);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correct plural form of "${entry.singular}".`,
        before: "One ",
        after: `, but many ${entry.plural.length ? "___" : ""}.`.replace("___", "").trim() === "" ? "" : `, but many `,
        correctAnswer: entry.plural,
        inputMode: "text",
        hint: "Some of these nouns form their plural in an irregular way — not just by adding -s.",
        explanation: `The plural of "${entry.singular}" is "${entry.plural}".`,
      };
    }

    if (branch === "error-mc") {
      const entry = randChoice(rng, NONCOUNT_ERROR_MC);
      const choices = shuffle(rng, [entry.correct, entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence correctly uses the non-count noun?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Non-count nouns have no plural form and cannot follow 'a' or 'an', or the quantifier 'many'.",
        explanation: entry.note,
      };
    }

    const chosen = shuffle(rng, QUANTIFIER_PAIRS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((q, i) => ({ id: `q${i}`, label: q.noun })));
    const targets = shuffle(rng, chosen.map((q, i) => ({ id: `q${i}`, label: q.phrase })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((q, i) => (correctMap[`q${i}`] = `q${i}`));
    return {
      kind: "click-match",
      prompt: "Match each non-count noun to the phrase we use to count it.",
      tokens,
      targets,
      correctMap,
      hint: "Since non-count nouns cannot be counted directly, we use a quantity word like 'a piece of', 'a dose of', or 'a glass of' before them.",
      explanation: chosen.map((q) => `We say "${q.phrase}", not "a ${q.noun}" or "${q.noun}s".`).join(" "),
    };
  },
};
