import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DEMONSTRATIVES: { word: string; desc: string }[] = [
  { word: "this", desc: "near the speaker, singular" },
  { word: "these", desc: "near the speaker, plural" },
  { word: "that", desc: "far from the speaker, singular" },
  { word: "those", desc: "far from the speaker, plural" },
] as const;

const QUANTIFIER_COUNT: { word: string; type: "countable" | "uncountable" }[] = [
  { word: "many", type: "countable" },
  { word: "few", type: "countable" },
  { word: "several", type: "countable" },
  { word: "much", type: "uncountable" },
  { word: "little", type: "uncountable" },
] as const;

const FILL_QUANTIFIER: { before: string; quant: string; after: string }[] = [
  { before: "The gallery displayed ", quant: "many", after: " paintings from local artists this month." },
  { before: "The sculptor used very ", quant: "little", after: " clay to finish the small figure." },
  { before: "There wasn't ", quant: "much", after: " paint left after the mural was completed." },
  { before: "Only a ", quant: "few", after: " students finished their sculptures before the deadline." },
  { before: "The art teacher brought ", quant: "several", after: " brushes for the class to share." },
];

const DEMO_MC: { before: string; after: string; correct: string; distractors: string[]; note: string }[] = [
  { before: "", after: " painting on the wall right beside me is my favourite.", correct: "This", distractors: ["That", "These", "Those"], note: "'This' refers to something near the speaker and singular." },
  { before: "", after: " sculptures over there by the entrance were made by the senior students.", correct: "Those", distractors: ["This", "That", "These"], note: "'Those' refers to plural things far from the speaker." },
  { before: "", after: " brush I am holding needs to be cleaned before I use it again.", correct: "This", distractors: ["These", "That", "Those"], note: "'This' refers to something near the speaker and singular." },
  { before: "", after: " drawing you sent me from your desk looks wonderful.", correct: "That", distractors: ["This", "These", "Those"], note: "'That' refers to something singular but far from the speaker, not right here." },
  { before: "", after: " exhibitions we are setting up right here will open this weekend.", correct: "These", distractors: ["This", "That", "Those"], note: "'These' refers to plural things near the speaker." },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why do we use demonstratives?",
    correct: "To point out exactly which person or thing we mean, based on nearness and number",
    distractors: [
      "To show how many of something exists",
      "To join two sentences together",
      "To replace the subject of every sentence",
    ],
  },
  {
    q: "When do we use quantifiers like 'many' and 'much'?",
    correct: "When we want to show an approximate amount or number of something",
    distractors: [
      "When we want to point out exactly which item we mean",
      "When we want to show the exact time something happened",
      "When we want to describe how a person feels",
    ],
  },
  {
    q: "Which quantifier is used with uncountable nouns, such as 'clay' or 'paint'?",
    correct: "much",
    distractors: ["many", "several", "few"],
  },
  {
    q: "Which quantifier is used with countable nouns, such as 'paintings' or 'brushes'?",
    correct: "many",
    distractors: ["much", "little", "less"],
  },
];

export const demonstrativesQuantifiers: Skill = {
  id: "g8-eng-g-demonstratives-quantifiers",
  code: "G.10",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Demonstratives and Quantifiers",
  description: "Identify and use demonstratives and quantifiers correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "demo-mc", "concept"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, DEMONSTRATIVES.map((d) => ({ id: d.word, label: d.word })));
      const targets = shuffle(rng, DEMONSTRATIVES.map((d) => ({ id: d.word, label: d.desc })));
      const correctMap: Record<string, string> = {};
      for (const d of DEMONSTRATIVES) correctMap[d.word] = d.word;
      return {
        kind: "click-match",
        prompt: "Match each demonstrative to what it shows about nearness and number.",
        tokens,
        targets,
        correctMap,
        hint: "'This/these' point to things near the speaker; 'that/those' point to things farther away. Singular pairs with singular, plural with plural.",
        explanation: DEMONSTRATIVES.map((d) => `"${d.word}" is used for something ${d.desc}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, QUANTIFIER_COUNT);
      const buckets = [
        { id: "countable", label: "Used with countable nouns (paintings, brushes)" },
        { id: "uncountable", label: "Used with uncountable nouns (paint, clay)" },
      ];
      const items = chosen.map((c, i) => ({ id: `q${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`q${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each quantifier by whether it is used with countable or uncountable nouns.",
        items,
        buckets,
        correctBucket,
        hint: "Ask whether the noun that follows can be counted one by one (paintings) or not (clay, paint).",
        explanation: chosen.map((c) => `"${c.word}" is used with ${c.type} nouns.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_QUANTIFIER);
      return {
        kind: "fill-blank",
        prompt: "Fill in the quantifier that correctly matches the noun in the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.quant,
        inputMode: "text",
        hint: "Check whether the noun after the blank can be counted individually or not.",
        explanation: `"${entry.quant}" is correct here: "${entry.before}${entry.quant}${entry.after}"`,
      };
    }

    if (branch === "demo-mc") {
      const entry = randChoice(rng, DEMO_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which demonstrative correctly completes this sentence? "${entry.before}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Decide whether the noun is near or far from the speaker, and whether it is singular or plural.",
        explanation: entry.note,
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
      hint: "Demonstratives point out which thing; quantifiers show how much or how many.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
