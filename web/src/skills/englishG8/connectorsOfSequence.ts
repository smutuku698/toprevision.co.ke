import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SCENARIOS: { id: string; steps: { id: string; label: string }[] }[] = [
  {
    id: "return",
    steps: [
      { id: "r1", label: "First, keep the receipt as proof that you purchased the item from the shop." },
      { id: "r2", label: "Next, check the item carefully to confirm exactly what the fault is." },
      { id: "r3", label: "After that, return to the shop and explain the problem politely to the attendant." },
      { id: "r4", label: "Finally, ask for a replacement, repair, or refund as agreed with the shop." },
    ],
  },
  {
    id: "compare",
    steps: [
      { id: "c1", label: "First, list the item you want to buy and the shops nearby that sell it." },
      { id: "c2", label: "Next, visit or call each shop to find out its price for the item." },
      { id: "c3", label: "Then, compare the prices along with the quality and any warranty offered." },
      { id: "c4", label: "Finally, choose the shop that offers the best value for your money." },
    ],
  },
];

const POSITION_GROUPS: { id: string; label: string; connectors: string[] }[] = [
  { id: "begin", label: "Beginning", connectors: ["First", "To begin with", "Firstly"] },
  { id: "middle", label: "Middle", connectors: ["Next", "Then", "After that"] },
  { id: "end", label: "End", connectors: ["Finally", "Lastly", "In the end"] },
];

const MATCH_EXAMPLES: { connector: string; example: string }[] = [
  { connector: "First", example: "First, list the item you want to buy and compare shops nearby." },
  { connector: "Next", example: "Next, visit or call each shop to check its price." },
  { connector: "After that", example: "After that, return to the shop and explain the fault politely." },
  { connector: "Finally", example: "Finally, ask for a replacement, repair, or refund." },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "To return a faulty item,", after: "check that you still have the receipt as proof of purchase.", correctAnswer: "first", acceptedAnswers: ["first", "firstly"] },
  { before: "After explaining the problem to the shop attendant,", after: "ask politely for a replacement or refund.", correctAnswer: "finally", acceptedAnswers: ["finally", "lastly"] },
  { before: "A wise consumer checks the price tag first;", after: "they compare it with prices at other shops nearby.", correctAnswer: "then", acceptedAnswers: ["then", "next"] },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can a good paragraph be developed?",
    correct: "By connecting ideas in a clear, logical order using sequence connectors like first, next, and finally",
    distractors: ["By writing every sentence with no connection to the sentences around it", "By listing ideas in a random order for variety", "By avoiding connecting words so each sentence stands alone"],
  },
  {
    q: "Which word in this sentence is a connector of sequence: 'First, gather the receipts before comparing the shop prices'?",
    correct: "First",
    distractors: ["gather", "receipts", "comparing"],
  },
];

export const connectorsOfSequence: Skill = {
  id: "g8-eng-w-connectors-of-sequence",
  code: "W.4",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Paragraphing: Connectors of Sequence",
  description: "Identify time/step connectors of sequence (first, next, after that, finally) and use them to sequence ideas in a paragraph.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "fill", "mc"] as const);
    const hint = "Sequence connectors show the order of steps: first/firstly at the start, next/then/after that in the middle, and finally/lastly at the end.";

    if (branch === "order") {
      const scenario = randChoice(rng, SCENARIOS);
      const topic = scenario.id === "return" ? "returning a faulty item to a shop" : "comparing prices before buying an item";
      return {
        kind: "ordering",
        prompt: `Arrange these steps for ${topic} in the correct order.`,
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, scenario.steps),
        correctOrder: scenario.steps.map((s) => s.id),
        hint,
        explanation: scenario.steps.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(
        rng,
        POSITION_GROUPS.flatMap((g) => g.connectors.map((c) => ({ id: c, label: c, groupId: g.id })))
      );
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.groupId;
      return {
        kind: "categorize",
        prompt: "Sort each connector by where it usually appears in a sequenced paragraph.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: POSITION_GROUPS.map((g) => ({ id: g.id, label: g.label })),
        correctBucket,
        hint,
        explanation: POSITION_GROUPS.map((g) => `${g.label}: ${g.connectors.join(" / ")}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, MATCH_EXAMPLES.map((m) => ({ id: m.connector, label: m.connector })));
      const targets = shuffle(rng, MATCH_EXAMPLES.map((m) => ({ id: m.connector, label: m.example })));
      const correctMap: Record<string, string> = {};
      for (const m of MATCH_EXAMPLES) correctMap[m.connector] = m.connector;
      return {
        kind: "click-match",
        prompt: "Match each sequence connector to the step it introduces.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: MATCH_EXAMPLES.map((m) => `${m.connector}: "${m.example}"`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing sequence connector.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer}, ${entry.after}"`,
      };
    }

    const entry = randChoice(rng, KIQ_QUESTIONS);
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
