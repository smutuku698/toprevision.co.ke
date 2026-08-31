import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Rule = "regular" | "y-ily" | "drop-e" | "no-adverb";

const RULE_LABEL: Record<Rule, string> = {
  regular: "Just add -ly",
  "y-ily": "Change 'y' to 'i' and add -ly",
  "drop-e": "Drop the final 'e' and add -ly",
  "no-adverb": "Already ends in -ly — has no separate adverb form",
};

const WORDS: { adj: string; adv: string; rule: Rule }[] = [
  { adj: "quick", adv: "quickly", rule: "regular" },
  { adj: "careful", adv: "carefully", rule: "regular" },
  { adj: "honest", adv: "honestly", rule: "regular" },
  { adj: "confident", adv: "confidently", rule: "regular" },
  { adj: "calm", adv: "calmly", rule: "regular" },
  { adj: "punctual", adv: "punctually", rule: "regular" },
  { adj: "polite", adv: "politely", rule: "regular" },
  { adj: "clear", adv: "clearly", rule: "regular" },
  { adj: "happy", adv: "happily", rule: "y-ily" },
  { adj: "easy", adv: "easily", rule: "y-ily" },
  { adj: "busy", adv: "busily", rule: "y-ily" },
  { adj: "heavy", adv: "heavily", rule: "y-ily" },
  { adj: "gentle", adv: "gently", rule: "drop-e" },
  { adj: "simple", adv: "simply", rule: "drop-e" },
  { adj: "possible", adv: "possibly", rule: "drop-e" },
  { adj: "true", adv: "truly", rule: "drop-e" },
  { adj: "whole", adv: "wholly", rule: "drop-e" },
  { adj: "friendly", adv: "in a friendly way", rule: "no-adverb" },
  { adj: "lovely", adv: "in a lovely manner", rule: "no-adverb" },
  { adj: "lonely", adv: "in a lonely way", rule: "no-adverb" },
] as const;

const FILL_SENTENCES: { before: string; adj: string; adv: string; after: string }[] = [
  { before: "During the interview, she answered every question ", adj: "honest", adv: "honestly", after: "." },
  { before: "He always completes his reports ", adj: "careful", adv: "carefully", after: ", checking every detail." },
  { before: "The intern arrived at the office ", adj: "punctual", adv: "punctually", after: " every single day." },
  { before: "She spoke ", adj: "confident", adv: "confidently", after: " about her career goals during the interview." },
  { before: "The new employee learned the software ", adj: "easy", adv: "easily", after: ", thanks to the training." },
  { before: "He handled the difficult client ", adj: "gentle", adv: "gently", after: ", keeping the meeting calm." },
];

const ERROR_MC: { adj: string; correct: string; wrong: string[] }[] = [
  { adj: "happy", correct: "happily", wrong: ["happyly", "happyily", "happied"] },
  { adj: "true", correct: "truly", wrong: ["truely", "truley", "truelly"] },
  { adj: "gentle", correct: "gently", wrong: ["gentley", "gentlely", "genttly"] },
  { adj: "whole", correct: "wholly", wrong: ["wholely", "wholey", "wholeley"] },
  { adj: "simple", correct: "simply", wrong: ["simpley", "simplely", "simpely"] },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why do we form adverbs from adjectives?",
    correct: "To describe how, when, or to what extent an action is done, rather than describing a noun",
    distractors: [
      "To turn a verb into a noun",
      "To make every sentence a question",
      "To join two independent clauses together",
    ],
  },
  {
    q: "What is the function of an adverb in a sentence?",
    correct: "It modifies a verb, an adjective, or another adverb, often showing manner",
    distractors: [
      "It always names a person, place, or thing",
      "It only ever describes a noun directly",
      "It replaces the subject of the sentence",
    ],
  },
  {
    q: "Which of these adjectives has no separate '-ly' adverb form, because it already ends in '-ly'?",
    correct: "friendly",
    distractors: ["quick", "careful", "honest"],
  },
  {
    q: "How would you correctly express the adverb meaning of 'friendly' in a sentence?",
    correct: "in a friendly way",
    distractors: ["friendlily", "friendly", "friendlyly"],
  },
];

export const adverbsFromAdjectives: Skill = {
  id: "g8-eng-g-adverbs-from-adjectives",
  code: "G.11",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Adverbs Formed from Adjectives",
  description: "Form and use adverbs from adjectives correctly, including irregular and exceptional cases.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "spelling-mc", "concept"] as const);

    if (branch === "match") {
      const pool = WORDS.filter((w) => w.rule !== "no-adverb");
      const chosen = shuffle(rng, pool).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.adj, label: w.adj })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.adj, label: w.adv })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.adj] = w.adj;
      return {
        kind: "click-match",
        prompt: "Match each adjective to its correct adverb form.",
        tokens,
        targets,
        correctMap,
        hint: "Watch for spelling changes: some adjectives just add -ly, others change 'y' to 'i', and others drop a final 'e'.",
        explanation: chosen.map((w) => `"${w.adj}" becomes "${w.adv}" (${RULE_LABEL[w.rule].toLowerCase()}).`).join(" "),
      };
    }

    if (branch === "categorize") {
      const rules: Rule[] = ["regular", "y-ily", "drop-e", "no-adverb"];
      const chosen = shuffle(rng, rules.flatMap((r) => shuffle(rng, WORDS.filter((w) => w.rule === r)).slice(0, 2)));
      const buckets = rules.map((r) => ({ id: r, label: RULE_LABEL[r] }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.adj }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.rule));
      return {
        kind: "categorize",
        prompt: "Sort each adjective by the spelling rule used to form its adverb.",
        items,
        buckets,
        correctBucket,
        hint: "Check the last letters of the adjective: does it end in a consonant, in 'y', in 'e', or already in '-ly'?",
        explanation: chosen.map((c) => `"${c.adj}" → "${c.adv}": ${RULE_LABEL[c.rule].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_SENTENCES);
      return {
        kind: "fill-blank",
        prompt: `Fill in the adverb form of "${entry.adj}" to complete the sentence.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.adv,
        inputMode: "text",
        hint: "Think about how this adjective's ending changes when '-ly' is added.",
        explanation: `The adverb form of "${entry.adj}" is "${entry.adv}": "${entry.before}${entry.adv}${entry.after}"`,
      };
    }

    if (branch === "spelling-mc") {
      const entry = randChoice(rng, ERROR_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
      return {
        kind: "multiple-choice",
        prompt: `Which is the correctly spelled adverb form of "${entry.adj}"?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check whether the adjective's final letter changes before '-ly' is added.",
        explanation: `The correct spelling is "${entry.correct}".`,
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
      hint: "Adverbs formed from adjectives usually describe how an action is done.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
