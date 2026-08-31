import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FANBOYS: { conj: string; func: string }[] = [
  { conj: "for", func: "gives a reason, similar to 'because'" },
  { conj: "and", func: "adds one idea to another" },
  { conj: "nor", func: "adds a second negative idea" },
  { conj: "but", func: "shows contrast between two ideas" },
  { conj: "or", func: "shows a choice or alternative" },
  { conj: "yet", func: "shows an unexpected contrast" },
  { conj: "so", func: "shows a result or consequence" },
] as const;

const CLASSIFY_SENTENCES: { text: string; type: "compound" | "simple" }[] = [
  { text: "The blender stopped working, so she returned it to the shop.", type: "compound" },
  { text: "You can request a refund, or you can ask for a replacement.", type: "compound" },
  { text: "The warranty had expired, but the shop still helped her.", type: "compound" },
  { text: "He read the label carefully, and he compared it with another brand.", type: "compound" },
  { text: "The shopkeeper and the customer discussed the faulty item.", type: "simple" },
  { text: "She inspected the product and returned it the same day.", type: "simple" },
  { text: "The manager checked the receipt and refunded the money.", type: "simple" },
  { text: "Consumers and retailers both have rights under the law.", type: "simple" },
];

const CONSTRUCT: { before: string; conj: string; after: string; relationship: string }[] = [
  { before: "The toy broke after only two days, ", conj: "so", after: " the mother returned it for a refund.", relationship: "a result" },
  { before: "You can exchange the item for a new one, ", conj: "or", after: " you can request your money back.", relationship: "a choice" },
  { before: "The label listed the correct price, ", conj: "but", after: " the cashier charged more at the till.", relationship: "a contrast" },
  { before: "She checked the warranty card carefully, ", conj: "for", after: " she wanted to know her rights as a buyer.", relationship: "a reason" },
  { before: "He complained politely, ", conj: "yet", after: " the shop still refused to help him.", relationship: "an unexpected contrast" },
  { before: "The customer read the receipt, ", conj: "and", after: " she noticed she had been overcharged.", relationship: "an addition" },
  { before: "The shop does not accept returned food items, ", conj: "nor", after: " does it refund shipping costs.", relationship: "a second negative idea" },
];

const COMMA_MC: { correct: string; wrong: string[] }[] = [
  {
    correct: "The phone stopped charging, so he took it back to the store.",
    wrong: [
      "The phone stopped charging so he took it back to the store.",
      "The phone stopped charging, he took it back to the store.",
      "The phone stopped charging so, he took it back to the store.",
    ],
  },
  {
    correct: "She wanted a refund, but the receipt was missing.",
    wrong: [
      "She wanted a refund but the receipt was missing.",
      "She wanted a refund, but, the receipt was missing.",
      "She wanted a refund the receipt was missing.",
    ],
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why do we join sentences using coordinating conjunctions?",
    correct: "To show how two related, complete ideas connect, such as addition, contrast, choice, or result",
    distractors: [
      "To make every sentence exactly the same length",
      "To avoid using a subject in the second clause",
      "Coordinating conjunctions have no real effect on meaning",
    ],
  },
  {
    q: "How do we correctly join two independent clauses into one compound sentence?",
    correct: "With a comma followed by a coordinating conjunction (for, and, nor, but, or, yet, so)",
    distractors: [
      "By placing a full stop between them and no conjunction",
      "By joining them with a comma alone and no conjunction",
      "By repeating the subject twice with no punctuation",
    ],
  },
  {
    q: "What makes a sentence a compound sentence rather than a simple sentence with a compound verb?",
    correct: "A compound sentence has two independent clauses, each with its own subject and verb, joined by a conjunction",
    distractors: [
      "A compound sentence always has more than ten words",
      "A compound sentence never uses a comma",
      "A compound sentence must begin with a conjunction",
    ],
  },
];

export const compoundSentences: Skill = {
  id: "g8-eng-g-compound-sentences",
  code: "G.13",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Compound Sentences",
  description: "Identify compound sentences and construct them using the coordinating conjunctions for, and, nor, but, or, yet, and so.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "construct", "comma-mc", "concept"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, FANBOYS.map((f) => ({ id: f.conj, label: f.conj })));
      const targets = shuffle(rng, FANBOYS.map((f) => ({ id: f.conj, label: f.func })));
      const correctMap: Record<string, string> = {};
      for (const f of FANBOYS) correctMap[f.conj] = f.conj;
      return {
        kind: "click-match",
        prompt: "Match each coordinating conjunction (FANBOYS) to what it shows when joining two clauses.",
        tokens,
        targets,
        correctMap,
        hint: "FANBOYS stands for: for, and, nor, but, or, yet, so — each shows a different relationship between two ideas.",
        explanation: FANBOYS.map((f) => `"${f.conj}" ${f.func}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const compoundPick = shuffle(rng, CLASSIFY_SENTENCES.filter((s) => s.type === "compound")).slice(0, 3);
      const simplePick = shuffle(rng, CLASSIFY_SENTENCES.filter((s) => s.type === "simple")).slice(0, 3);
      const chosen = shuffle(rng, [...compoundPick, ...simplePick]);
      const buckets = [
        { id: "compound", label: "Compound sentence (two independent clauses)" },
        { id: "simple", label: "Simple sentence (one clause, even with a compound subject/verb)" },
      ];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as a compound sentence or a simple sentence.",
        items,
        buckets,
        correctBucket,
        hint: "A compound sentence has two subjects AND two verbs, each forming its own complete clause, joined by a comma and a conjunction. A sentence with just two subjects or just two verbs sharing one clause is still simple.",
        explanation: chosen
          .map((c) =>
            c.type === "compound"
              ? `"${c.text}" is compound — it joins two independent clauses.`
              : `"${c.text}" is simple — it has only one independent clause, even though part of it is compound.`
          )
          .join(" "),
      };
    }

    if (branch === "construct") {
      const entry = randChoice(rng, CONSTRUCT);
      return {
        kind: "fill-blank",
        prompt: `Fill in the coordinating conjunction that shows ${entry.relationship} to join these two clauses.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.conj,
        inputMode: "text",
        hint: "Read both clauses and decide how the second idea relates to the first: reason, addition, contrast, choice, or result.",
        explanation: `"${entry.conj}" shows ${entry.relationship}, joining the two clauses correctly: "${entry.before}${entry.conj}${entry.after}"`,
      };
    }

    if (branch === "comma-mc") {
      const entry = randChoice(rng, COMMA_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence is correctly punctuated as a compound sentence?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "A compound sentence needs a comma placed right before the coordinating conjunction, with no comma after it.",
        explanation: `"${entry.correct}" is correct — a comma comes right before the coordinating conjunction, joining two independent clauses.`,
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
      hint: "Think about how a comma and a coordinating conjunction connect two complete, independent clauses.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
