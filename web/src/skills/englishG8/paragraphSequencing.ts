import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CONNECTOR_GROUPS: { id: string; label: string; connectors: string[] }[] = [
  { id: "addition", label: "Addition", connectors: ["Moreover", "In addition", "Furthermore", "Also"] },
  { id: "contrast", label: "Contrast", connectors: ["However", "On the other hand", "Although", "Nevertheless"] },
  { id: "result", label: "Result", connectors: ["Therefore", "As a result", "Consequently", "Thus"] },
  { id: "sequence", label: "Sequence", connectors: ["Firstly", "Next", "Finally", "Secondly"] },
];

const CONNECTOR_EXAMPLES: { connector: string; example: string; groupId: string }[] = [
  { connector: "Firstly", example: "Firstly, uncollected garbage in the market blocks the drainage channels.", groupId: "sequence" },
  { connector: "Moreover", example: "Moreover, the smoke from the factory has caused breathing problems among nearby residents.", groupId: "addition" },
  { connector: "However", example: "However, a few companies have begun installing filters to reduce their emissions.", groupId: "contrast" },
  { connector: "Therefore", example: "Therefore, the county government introduced fines for illegal dumping.", groupId: "result" },
];

const PARAGRAPH_STEPS: { id: string; label: string }[] = [
  { id: "p1", label: "Firstly, pollution from factories and vehicles is filling the air in many towns with harmful smoke." },
  { id: "p2", label: "In addition, plastic waste thrown into rivers is killing fish and other water creatures." },
  { id: "p3", label: "However, some communities have started organising clean-up days to remove litter from public spaces." },
  { id: "p4", label: "Therefore, everyone has a role to play in reducing pollution and protecting the environment for future generations." },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  {
    before: "Factories in the industrial zone dump untreated waste into the river;",
    after: "the fish population has dropped sharply and families can no longer fish safely.",
    correctAnswer: "therefore",
    acceptedAnswers: ["therefore", "consequently", "as a result"],
  },
  {
    before: "The city introduced strict recycling laws;",
    after: "illegal dumping still continues in many estates.",
    correctAnswer: "however",
    acceptedAnswers: ["however", "nevertheless"],
  },
  {
    before: "Plastic bags clog the drainage systems during heavy rains;",
    after: "they also harm animals that mistake them for food.",
    correctAnswer: "moreover",
    acceptedAnswers: ["moreover", "furthermore", "additionally"],
  },
];

const KIQ_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to use conjunctions and connectors when writing a paragraph?",
    correct: "They link ideas smoothly and show how one idea relates to the next, such as addition, contrast, result, or sequence",
    distractors: ["They make a paragraph longer with no other purpose", "They allow a writer to avoid using full stops", "They are only needed in spoken language, not writing"],
  },
  {
    q: "What is the effect of a paragraph with no connecting words between its ideas?",
    correct: "The ideas feel disconnected and the reader struggles to follow the writer's reasoning",
    distractors: ["The paragraph automatically becomes easier to read", "The ideas are understood more clearly than before", "Connecting words have no real effect on a paragraph"],
  },
];

export const paragraphSequencing: Skill = {
  id: "g8-eng-w-paragraph-sequencing",
  code: "W.3",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Paragraphing: Sequencing of Ideas",
  description: "Use conjunctions and connectors (addition, contrast, result, sequence) to link and sequence ideas correctly in a paragraph.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "fill", "match", "order", "mc"] as const);
    const hint = "Connectors show how ideas relate: addition (moreover), contrast (however), result (therefore), or sequence (firstly, finally).";

    if (branch === "categorize") {
      const groups = shuffle(rng, CONNECTOR_GROUPS).slice(0, 2);
      const items = shuffle(
        rng,
        groups.flatMap((g) => shuffle(rng, g.connectors).slice(0, 3).map((c) => ({ id: c, label: c, groupId: g.id })))
      );
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.groupId;
      return {
        kind: "categorize",
        prompt: `Sort each connector into ${groups.map((g) => g.label).join(" or ")}.`,
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: groups.map((g) => ({ id: g.id, label: g.label })),
        correctBucket,
        hint,
        explanation: groups.map((g) => `${g.label}: ${items.filter((i) => i.groupId === g.id).map((i) => i.label).join(" / ")}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the connector that best completes the paragraph.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer}, ${entry.after}"`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CONNECTOR_EXAMPLES.map((c) => ({ id: c.connector, label: c.connector })));
      const targets = shuffle(rng, CONNECTOR_EXAMPLES.map((c) => ({ id: c.connector, label: c.example })));
      const correctMap: Record<string, string> = {};
      for (const c of CONNECTOR_EXAMPLES) correctMap[c.connector] = c.connector;
      return {
        kind: "click-match",
        prompt: "Match each connector to the sentence that correctly uses it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CONNECTOR_EXAMPLES.map((c) => `${c.connector}: "${c.example}"`).join(" "),
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the sentences into a well-sequenced paragraph about pollution, using the connectors as clues.",
        instruction: "Click the sentences in order, from first to last.",
        items: shuffle(rng, PARAGRAPH_STEPS),
        correctOrder: PARAGRAPH_STEPS.map((s) => s.id),
        hint: "'Firstly' signals the opening idea, 'in addition' adds a second point, 'however' introduces a contrast, and 'therefore' signals the concluding idea.",
        explanation: PARAGRAPH_STEPS.map((s) => s.label).join(" → "),
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
