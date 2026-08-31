import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type CompoundType = "closed" | "hyphenated" | "open";

const COMPOUNDS: { word: string; type: CompoundType; meaning: string }[] = [
  { word: "toothbrush", type: "closed", meaning: "a small brush used for cleaning teeth" },
  { word: "classroom", type: "closed", meaning: "a room where lessons are taught" },
  { word: "notebook", type: "closed", meaning: "a small book used for writing notes" },
  { word: "keyboard", type: "closed", meaning: "a set of keys used to type on a computer" },
  { word: "blackboard", type: "closed", meaning: "a dark board written on with chalk" },
  { word: "motorbike", type: "closed", meaning: "a two-wheeled vehicle powered by an engine" },
  { word: "textbook", type: "closed", meaning: "a book used for studying a school subject" },
  { word: "cupboard", type: "closed", meaning: "a piece of furniture with shelves used for storage" },
  { word: "waterfall", type: "closed", meaning: "a place where water drops suddenly from a height" },
  { word: "airport", type: "closed", meaning: "a place where aircraft take off and land" },
  { word: "mother-in-law", type: "hyphenated", meaning: "the mother of one's husband or wife" },
  { word: "runner-up", type: "hyphenated", meaning: "the competitor who finishes in second place" },
  { word: "passer-by", type: "hyphenated", meaning: "a person who is walking past a place by chance" },
  { word: "editor-in-chief", type: "hyphenated", meaning: "the person with final responsibility for a publication" },
  { word: "well-wisher", type: "hyphenated", meaning: "a person who wishes someone well" },
  { word: "post office", type: "open", meaning: "a building where letters and parcels are handled" },
  { word: "human rights", type: "open", meaning: "the basic freedoms every person is entitled to" },
  { word: "swimming pool", type: "open", meaning: "a pool built for people to swim in" },
  { word: "bus stop", type: "open", meaning: "a place where a bus stops to pick up passengers" },
  { word: "police officer", type: "open", meaning: "a person who works to enforce the law" },
  { word: "market day", type: "open", meaning: "the day set aside for buying and selling at a market" },
] as const;

const TYPE_LABEL: Record<CompoundType, string> = {
  closed: "Closed (written as one word)",
  hyphenated: "Hyphenated (joined with hyphens)",
  open: "Open (written as separate words)",
};

const PLURALS: { singular: string; plural: string; wrong: string[] }[] = [
  { singular: "mother-in-law", plural: "mothers-in-law", wrong: ["mother-in-laws", "mothers-in-laws"] },
  { singular: "brother-in-law", plural: "brothers-in-law", wrong: ["brother-in-laws", "brothers-in-laws"] },
  { singular: "sister-in-law", plural: "sisters-in-law", wrong: ["sister-in-laws", "sisters-in-laws"] },
  { singular: "passer-by", plural: "passers-by", wrong: ["passer-bys", "passers-bys"] },
  { singular: "runner-up", plural: "runners-up", wrong: ["runner-ups", "runners-ups"] },
  { singular: "editor-in-chief", plural: "editors-in-chief", wrong: ["editor-in-chiefs", "editors-in-chiefs"] },
  { singular: "well-wisher", plural: "well-wishers", wrong: ["well-wisher", "wells-wisher"] },
  { singular: "toothbrush", plural: "toothbrushes", wrong: ["toothbrushs", "teethbrush"] },
  { singular: "police officer", plural: "police officers", wrong: ["polices officer", "police officer's"] },
] as const;

const PLURAL_SENTENCES: { singular: string; plural: string; before: string; after: string }[] = [
  { singular: "sister-in-law", plural: "sisters-in-law", before: "Amina proudly introduced her three ", after: " at the family gathering." },
  { singular: "runner-up", plural: "runners-up", before: "The judges awarded medals to the two ", after: " in the singing contest." },
  { singular: "passer-by", plural: "passers-by", before: "Several ", after: " stopped to help push the stalled matatu." },
  { singular: "brother-in-law", plural: "brothers-in-law", before: "Both of Juma's ", after: " travelled from Kisumu for the wedding." },
  { singular: "well-wisher", plural: "well-wishers", before: "Many ", after: " sent messages congratulating the winning team." },
  { singular: "editor-in-chief", plural: "editors-in-chief", before: "The two newspapers sent their ", after: " to cover the human rights conference." },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should we use compound nouns when communicating?",
    correct: "They let us name a specific thing precisely with one established term instead of a long description",
    distractors: [
      "They make sentences longer and harder to understand",
      "They are only used in formal legal writing",
      "They replace the need for any other type of noun",
    ],
  },
  {
    q: "What is a compound noun?",
    correct: "A noun formed by joining two or more words together to name one single thing or idea",
    distractors: [
      "A noun that can only be written as one single word",
      "Any noun that has more than five letters",
      "A noun that names a feeling rather than a thing",
    ],
  },
  {
    q: "Which of these best describes an open compound noun like 'human rights'?",
    correct: "Two or more separate words that function together as one noun",
    distractors: [
      "A single word joined by a hyphen",
      "A word that has no clear meaning on its own",
      "A noun that is always plural and never singular",
    ],
  },
  {
    q: "Which word in this sentence is a compound noun? \"The passer-by helped push the stalled car to the roadside.\"",
    correct: "passer-by",
    distractors: ["helped", "stalled", "roadside"],
  },
];

export const compoundNouns: Skill = {
  id: "g8-eng-g-compound-nouns",
  code: "G.1",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Compound Nouns",
  description: "Identify compound nouns and use their correct singular and plural forms.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "plural-mc", "fill", "concept"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, COMPOUNDS).slice(0, 6);
      const buckets = [
        { id: "closed", label: TYPE_LABEL.closed },
        { id: "hyphenated", label: TYPE_LABEL.hyphenated },
        { id: "open", label: TYPE_LABEL.open },
      ];
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each compound noun by how it is written: closed, hyphenated, or open.",
        items,
        buckets,
        correctBucket,
        hint: "Closed compounds are one word, hyphenated ones use hyphens between the words, and open compounds are written as separate words.",
        explanation: chosen.map((c) => `"${c.word}" is ${TYPE_LABEL[c.type].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, COMPOUNDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.word, label: c.word })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.word, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.word] = c.word;
      return {
        kind: "click-match",
        prompt: "Match each compound noun to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "A compound noun's meaning is often related to, but more specific than, its separate parts.",
        explanation: chosen.map((c) => `"${c.word}" means ${c.meaning}.`).join(" "),
      };
    }

    if (branch === "plural-mc") {
      const entry = randChoice(rng, PLURALS);
      const choices = shuffle(rng, [entry.plural, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: `What is the correct plural form of "${entry.singular}"?`,
        choices,
        correctIndex: choices.indexOf(entry.plural),
        layout: "list",
        hint: entry.singular.includes("-")
          ? "In most hyphenated compound nouns, the main noun (the 'head' word) takes the plural ending, not the last word."
          : "This compound noun's plural ending is added to the main noun that names the thing being counted.",
        explanation: `The plural of "${entry.singular}" is "${entry.plural}". ${
          entry.singular.includes("-")
            ? "The head noun in the compound carries the plural marking, not the word that follows the hyphen."
            : "The plural ending attaches to the noun that names what there is more than one of."
        }`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, PLURAL_SENTENCES);
      return {
        kind: "fill-blank",
        prompt: `Fill in the plural form of "${entry.singular}" to complete the sentence.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.plural,
        inputMode: "text",
        hint: "Find the main noun inside the compound — that is the part that changes to show more than one.",
        explanation: `The plural of "${entry.singular}" is "${entry.plural}", giving: "${entry.before}${entry.plural}${entry.after}"`,
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
      hint: "Think about what a compound noun is made of and why a single precise term is useful in communication.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
