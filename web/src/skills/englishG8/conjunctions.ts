import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FUNCTIONS: { conj: string; desc: string }[] = [
  { conj: "because", desc: "introduces the reason for something" },
  { conj: "that", desc: "introduces a clause that gives more information, such as after a reporting verb or describing a noun" },
  { conj: "when", desc: "introduces the time at which something happens" },
  { conj: "if", desc: "introduces a condition that must be true" },
  { conj: "unless", desc: "introduces a negative condition, meaning 'if...not'" },
  { conj: "since", desc: "introduces a reason, or the point in time from which something started" },
] as const;

const SCENARIO_ITEMS: { text: string; func: "reason" | "time" | "condition" }[] = [
  { text: "The people trusted the leader because she always kept her promises.", func: "reason" },
  { text: "The elders praised the chief since he refused to give up during the struggle.", func: "reason" },
  { text: "The whole village gathered when the freedom fighter returned home.", func: "time" },
  { text: "The elders will only bless the journey when the rains stop.", func: "time" },
  { text: "If the youth unite, they can bring real change to the community.", func: "condition" },
  { text: "The heroine's plan would fail unless everyone played their part.", func: "condition" },
];

const FILL_SENTENCES: { before: string; conj: string; after: string }[] = [
  { before: "The villagers admired the hero ", conj: "because", after: " he risked his life to protect them." },
  { before: "The elder said ", conj: "that", after: " the freedom fighter had shown great courage." },
  { before: "The community celebrates the heroine every year ", conj: "when", after: " independence day arrives." },
  { before: "", conj: "If", after: " a leader shows courage, the people will follow willingly." },
  { before: "The plan would have failed ", conj: "unless", after: " the heroine had acted quickly." },
  { before: "The nation has honoured her story ", conj: "since", after: " the day she led the protest." },
];

const SINCE_EXAMPLES: { sentence: string; meaning: "a reason" | "a point in time" }[] = [
  { sentence: "Since she was known for her bravery, the community chose her as their representative.", meaning: "a reason" },
  { sentence: "The museum has displayed the hero's story since 1963.", meaning: "a point in time" },
  { sentence: "Since the roads were blocked, the messenger took a longer route.", meaning: "a reason" },
  { sentence: "He has led the youth group since he was a young man.", meaning: "a point in time" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why do we join sentences together using conjunctions?",
    correct: "To show the relationship between two ideas, such as reason, time, or condition, in one smooth sentence",
    distractors: [
      "To make every sentence exactly the same length",
      "To avoid ever using a full stop",
      "Conjunctions have no real purpose in a sentence",
    ],
  },
  {
    q: "How can one join two simple sentences into one using a conjunction?",
    correct: "By using a joining word such as 'because', 'when', or 'if' to connect the two clauses",
    distractors: [
      "By writing them as two completely separate paragraphs",
      "By repeating the subject twice with no joining word",
      "By replacing the verb in the second sentence with a noun",
    ],
  },
  {
    q: "Which conjunction introduces a condition that must be met for something to happen?",
    correct: "if",
    distractors: ["because", "when", "that"],
  },
  {
    q: "Which conjunction means the same as 'if...not'?",
    correct: "unless",
    distractors: ["since", "that", "when"],
  },
];

export const conjunctions: Skill = {
  id: "g8-eng-g-conjunctions",
  code: "G.9",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Conjunctions",
  description: "Identify and use the conjunctions because, that, when, if, unless, and since correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "since-mc", "concept"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, FUNCTIONS.map((f) => ({ id: f.conj, label: f.conj })));
      const targets = shuffle(rng, FUNCTIONS.map((f) => ({ id: f.conj, label: f.desc })));
      const correctMap: Record<string, string> = {};
      for (const f of FUNCTIONS) correctMap[f.conj] = f.conj;
      return {
        kind: "click-match",
        prompt: "Match each conjunction to its function.",
        tokens,
        targets,
        correctMap,
        hint: "These six conjunctions each show a specific relationship: reason, extra information, time, condition, or negative condition.",
        explanation: FUNCTIONS.map((f) => `"${f.conj}" ${f.desc}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIO_ITEMS);
      const buckets = [
        { id: "reason", label: "Shows a reason" },
        { id: "time", label: "Shows a time" },
        { id: "condition", label: "Shows a condition" },
      ];
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.func));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by the function its conjunction performs: reason, time, or condition.",
        items,
        buckets,
        correctBucket,
        hint: "Find the conjunction in each sentence, then ask: does it explain why, when, or under what condition something happens?",
        explanation: chosen.map((c) => `"${c.text}" — the conjunction shows a ${c.func}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_SENTENCES);
      return {
        kind: "fill-blank",
        prompt: "Fill in the conjunction (because, that, when, if, unless, or since) that best completes the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.conj,
        inputMode: "text",
        hint: "Read the whole sentence and decide whether it needs a word showing reason, extra information, time, or condition.",
        explanation: `"${entry.conj}" is the conjunction that fits here: "${entry.before}${entry.conj}${entry.after}"`,
      };
    }

    if (branch === "since-mc") {
      const entry = randChoice(rng, SINCE_EXAMPLES);
      const choices = shuffle(rng, ["a reason", "a point in time"]);
      return {
        kind: "multiple-choice",
        prompt: `In this sentence, does "since" show a reason or a point in time? "${entry.sentence}"`,
        choices,
        correctIndex: choices.indexOf(entry.meaning),
        layout: "row",
        hint: "'Since' can mean 'because' (a reason) or 'from that time onward' (a point in time) — check what makes sense in context.",
        explanation: `Here, "since" shows ${entry.meaning}: "${entry.sentence}"`,
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
      hint: "Think about which of the six conjunctions shows the relationship being asked about.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
