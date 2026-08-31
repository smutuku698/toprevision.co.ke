import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GRADABLE: { adj: string; comparative: string; superlative: string }[] = [
  { adj: "kind", comparative: "kinder", superlative: "kindest" },
  { adj: "friendly", comparative: "friendlier", superlative: "friendliest" },
  { adj: "generous", comparative: "more generous", superlative: "most generous" },
  { adj: "honest", comparative: "more honest", superlative: "most honest" },
  { adj: "quiet", comparative: "quieter", superlative: "quietest" },
  { adj: "patient", comparative: "more patient", superlative: "most patient" },
  { adj: "talkative", comparative: "more talkative", superlative: "most talkative" },
  { adj: "loyal", comparative: "more loyal", superlative: "most loyal" },
  { adj: "helpful", comparative: "more helpful", superlative: "most helpful" },
  { adj: "jealous", comparative: "more jealous", superlative: "most jealous" },
] as const;

const NON_GRADABLE: { adj: string; why: string }[] = [
  { adj: "unique", why: "something either is or is not one of a kind — it cannot be 'more' one of a kind" },
  { adj: "perfect", why: "something either has no faults at all or it is not perfect — there are no degrees" },
  { adj: "finished", why: "a task is either complete or it is not — it cannot be 'more finished'" },
  { adj: "married", why: "a person either is or is not married — there is no in-between" },
  { adj: "identical", why: "two things either match exactly or they do not" },
  { adj: "empty", why: "a container either has nothing in it or it does not" },
  { adj: "dead", why: "something is either dead or alive — there are no degrees of 'deadness'" },
] as const;

const ERROR_BANK: { correctSentence: string; wrongSentences: string[]; note: string }[] = [
  {
    correctSentence: "Her way of solving the problem was unique among her classmates.",
    wrongSentences: [
      "Her way of solving the problem was very unique among her classmates.",
      "Her way of solving the problem was more unique than her classmates.",
      "Her way of solving the problem was the most unique in her class.",
    ],
    note: "'unique' is non-gradable — something either is or is not one of a kind, so it cannot take 'very', a comparative, or a superlative.",
  },
  {
    correctSentence: "The group assignment is now completely finished.",
    wrongSentences: [
      "The group assignment is now very finished.",
      "The group assignment is now more finished than before.",
      "The group assignment is now the most finished it has ever been.",
    ],
    note: "'finished' is non-gradable — a task either is complete or it is not, so 'completely' fits it better than 'very' or a comparative/superlative form.",
  },
  {
    correctSentence: "The two friends' excuses for being late were identical.",
    wrongSentences: [
      "The two friends' excuses for being late were very identical.",
      "The two friends' excuses for being late were more identical than the others.",
      "The two friends' excuses for being late were the most identical of all.",
    ],
    note: "'identical' is non-gradable — two things either match exactly or they do not, so it cannot be graded.",
  },
];

const FILL_COMPARATIVE: { before: string; adj: string; form: string; after: string }[] = [
  { before: "Wanjiru is ", adj: "kind", form: "kinder", after: " than her younger brother." },
  { before: "Of all my classmates, Amani is the ", adj: "generous", form: "most generous", after: " with his time." },
  { before: "This year, our class has become ", adj: "talkative", form: "more talkative", after: " than last year." },
  { before: "She is the ", adj: "patient", form: "most patient", after: " listener among my friends." },
  { before: "He grew ", adj: "quiet", form: "quieter", after: " after his best friend moved away." },
  { before: "Of the two new students, Faith is the ", adj: "honest", form: "most honest", after: " about her feelings." },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "When is it necessary to describe a noun using an adjective?",
    correct: "When we want to give more detail about a person, place, or thing to make communication clearer",
    distractors: [
      "Only when writing formal letters",
      "Only when the noun is a proper noun",
      "Adjectives are never necessary in communication",
    ],
  },
  {
    q: "What is a gradable adjective?",
    correct: "An adjective whose quality can be intensified or compared, such as with 'very', 'more', or 'most'",
    distractors: [
      "An adjective that only describes people, never things",
      "An adjective that always ends in '-ful'",
      "An adjective that cannot be used with 'very'",
    ],
  },
  {
    q: "What is a non-gradable (absolute) adjective?",
    correct: "An adjective describing an all-or-nothing quality that cannot logically be intensified or compared",
    distractors: [
      "An adjective that describes colour only",
      "An adjective that can always take '-er' and '-est' endings",
      "An adjective that must always be paired with 'very'",
    ],
  },
];

export const gradableAdjectives: Skill = {
  id: "g8-eng-g-gradable-adjectives",
  code: "G.5",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Adjectives",
  description: "Identify gradable and non-gradable adjectives and use them correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "error", "fill", "concept"] as const);

    if (branch === "categorize") {
      const gradablePick = shuffle(rng, GRADABLE).slice(0, 3).map((g) => ({ adj: g.adj, type: "gradable" as const }));
      const nonGradablePick = shuffle(rng, NON_GRADABLE).slice(0, 3).map((n) => ({ adj: n.adj, type: "non-gradable" as const }));
      const chosen = shuffle(rng, [...gradablePick, ...nonGradablePick]);
      const buckets = [
        { id: "gradable", label: "Gradable (can be intensified or compared)" },
        { id: "non-gradable", label: "Non-gradable (an all-or-nothing quality)" },
      ];
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.adj }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each adjective as gradable or non-gradable.",
        items,
        buckets,
        correctBucket,
        hint: "Ask yourself: can this quality logically come in degrees, or is it all-or-nothing?",
        explanation: chosen
          .map((c) =>
            c.type === "gradable"
              ? `"${c.adj}" is gradable — its quality can vary in degree.`
              : `"${c.adj}" is non-gradable — ${NON_GRADABLE.find((n) => n.adj === c.adj)!.why}.`
          )
          .join(" "),
      };
    }

    if (branch === "match") {
      const useComparative = rng() < 0.5;
      const chosen = shuffle(rng, GRADABLE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((g) => ({ id: g.adj, label: g.adj })));
      const targets = shuffle(rng, chosen.map((g) => ({ id: g.adj, label: useComparative ? g.comparative : g.superlative })));
      const correctMap: Record<string, string> = {};
      for (const g of chosen) correctMap[g.adj] = g.adj;
      return {
        kind: "click-match",
        prompt: `Match each adjective to its correct ${useComparative ? "comparative" : "superlative"} form.`,
        tokens,
        targets,
        correctMap,
        hint: useComparative
          ? "Short adjectives usually add -er; longer adjectives use 'more' instead."
          : "Short adjectives usually add -est; longer adjectives use 'most' instead.",
        explanation: chosen
          .map((g) => `The ${useComparative ? "comparative" : "superlative"} of "${g.adj}" is "${useComparative ? g.comparative : g.superlative}".`)
          .join(" "),
      };
    }

    if (branch === "error") {
      const entry = randChoice(rng, ERROR_BANK);
      const choices = shuffle(rng, [entry.correctSentence, ...entry.wrongSentences]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence uses the underlined type of adjective correctly?",
        choices,
        correctIndex: choices.indexOf(entry.correctSentence),
        layout: "list",
        hint: "Non-gradable adjectives describe an all-or-nothing quality, so they cannot take 'very', 'more', or 'most'.",
        explanation: entry.note,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_COMPARATIVE);
      return {
        kind: "fill-blank",
        prompt: `Fill in the correct comparative or superlative form of "${entry.adj}" to complete the sentence.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.form,
        inputMode: "text",
        hint: entry.form.startsWith("more") || entry.form.startsWith("most")
          ? "Longer adjectives usually form comparisons with 'more' or 'most' rather than an ending."
          : "Short adjectives usually form comparisons by adding '-er' or '-est'.",
        explanation: `The correct form of "${entry.adj}" here is "${entry.form}": "${entry.before}${entry.form}${entry.after}"`,
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
      hint: "Think about whether the adjective's quality can vary in degree or whether it is a fixed, all-or-nothing state.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
