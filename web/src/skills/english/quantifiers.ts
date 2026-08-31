import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const COUNTABLE_NOUNS = ["books", "students", "chairs", "mangoes", "questions", "friends", "trees", "cars"];
const UNCOUNTABLE_NOUNS = ["water", "rice", "information", "furniture", "advice", "homework", "money", "sugar"];

const QUANTIFIERS = ["many", "much", "few", "little"] as const;

export const quantifiers: Skill = {
  id: "eng-g-quantifiers",
  code: "G.6",
  subjectId: "english",
  strandId: "eng-grammar",
  grade: 9,
  title: "Quantifiers: many, much, few, little",
  description: "Choose the quantifier that matches whether a noun is countable or uncountable.",
  generate(rng) {
    if (rng() < 0.4) {
      const chosen = [
        ...shuffle(rng, COUNTABLE_NOUNS).slice(0, 3).map((n) => ({ noun: n, bucket: "Countable" })),
        ...shuffle(rng, UNCOUNTABLE_NOUNS).slice(0, 3).map((n) => ({ noun: n, bucket: "Uncountable" })),
      ];
      const items = shuffle(rng, chosen).map((c, i) => ({ id: `n${i}`, label: c.noun, bucket: c.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each noun as Countable or Uncountable.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Countable", label: "Countable" },
          { id: "Uncountable", label: "Uncountable" },
        ],
        correctBucket,
        hint: "Countable nouns can be counted one by one (a book, two books). Uncountable nouns can't be split into individual units this way.",
        explanation: items.map((it) => `"${it.label}" is ${it.bucket.toLowerCase()}.`).join(" "),
      };
    }

    const countable = rng() < 0.5;
    const noun = randChoice(rng, countable ? COUNTABLE_NOUNS : UNCOUNTABLE_NOUNS);
    const positiveSense = rng() < 0.5;

    let correct: (typeof QUANTIFIERS)[number];
    let sentence: string;
    if (positiveSense) {
      correct = countable ? "many" : "much";
      sentence = `How ___ ${noun} do you have?`;
    } else {
      correct = countable ? "few" : "little";
      sentence = `There is very ___ ${noun} left.`;
    }

    const choices = shuffle(rng, [...QUANTIFIERS]);

    return {
      kind: "multiple-choice",
      prompt: `Complete the sentence with the correct quantifier: "${sentence}"`,
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "row",
      hint: "Countable nouns (you can count them) pair with many/few. Uncountable nouns pair with much/little.",
      explanation: `"${noun}" is a${countable ? "" : "n"} ${countable ? "countable" : "uncountable"} noun, and the sentence needs a word meaning "${
        positiveSense ? "a large amount" : "a small amount"
      }", so the correct quantifier is "${correct}": "${sentence.replace("___", correct)}"`,
    };
  },
};
