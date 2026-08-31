import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FICTION_EXAMPLES = [
  "A folktale about a clever hare and a hyena",
  "A novel about a made-up detective solving a mystery",
  "A poem imagining a conversation between two rivers",
  "A short story about a boy who discovers a hidden cave",
];

const NON_FICTION_EXAMPLES = [
  "A biography of a Kenyan engineer",
  "A newspaper article about a new hospital opening",
  "A how-to guide for repairing a bicycle puncture",
  "An encyclopedia entry about the veterinary profession",
];

const NON_FICTION_TYPES: { name: string; purpose: string }[] = [
  { name: "Biography", purpose: "Gives a true account of someone's life, often showing the career path they followed" },
  { name: "News article", purpose: "Reports on a recent, real event, usually found in a newspaper or online" },
  { name: "How-to guide", purpose: "Gives step-by-step instructions explaining how to do or make something" },
  { name: "Encyclopedia entry", purpose: "Gives a short, factual summary of a topic, place, person, or profession" },
];

const CAREER_SCENARIOS: { text: string; correct: string; distractors: string[] }[] = [
  {
    text: "Maria wants to learn what a typical day is like for a wildlife veterinarian before deciding on a career. Which non-fiction text would help her most?",
    correct: "A biography or interview article about a working veterinarian",
    distractors: ["A novel about a made-up detective", "A poem about the ocean", "A folktale about talking animals"],
  },
  {
    text: "Kevin wants to find out how to safely wire a simple electrical circuit as part of exploring engineering as a career. Which text should he choose?",
    correct: "A how-to guide explaining how to wire a circuit step by step",
    distractors: ["A short story about a robot", "A poem about electricity", "A folktale about a lightning spirit"],
  },
  {
    text: "Naliaka wants a short, factual overview of what a pharmacist does before researching further. Which text is most suitable?",
    correct: "An encyclopedia entry about the pharmacy profession",
    distractors: ["A novel set in a hospital", "A poem about medicine", "A folktale about a healer"],
  },
  {
    text: "Brian read that a well-known Kenyan pilot recently made the news for a daring rescue flight. Which text type reported this?",
    correct: "A news article",
    distractors: ["A folktale", "A poem", "A made-up short story"],
  },
];

const SELECTION_STEPS = [
  { id: "topic", label: "Decide what career or topic you want to learn about" },
  { id: "reliable", label: "Check that the source is reliable and up to date" },
  { id: "skim", label: "Skim the headings or table of contents to see if it covers what you need" },
  { id: "level", label: "Check the reading level matches your own" },
  { id: "read", label: "Read closely and note the useful facts" },
];

const FILL_ITEMS = [
  { before: "Step-by-step instructions explaining how to do or make something are found in a", after: "guide.", correctAnswer: "how-to" },
  { before: "A true account of someone's life, often showing the career path they followed, is called a", after: ".", correctAnswer: "biography" },
  { before: "A report on a recent, real event, usually found in a newspaper, is called a news", after: ".", correctAnswer: "article" },
];

export const nonFictionReading: Skill = {
  id: "g8-eng-r-non-fiction-reading",
  code: "R.21",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Extensive Reading: Non-fiction",
  description: "Distinguish fiction from non-fiction, match non-fiction types to their purpose, and choose non-fiction texts to explore careers.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "order", "fill", "mc"] as const);
    const hint = "Fiction is imagined; non-fiction gives real, factual information — think about which type of non-fiction text matches the reader's need.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, [
        ...FICTION_EXAMPLES.map((t) => ({ text: t, bucket: "Fiction" })),
        ...NON_FICTION_EXAMPLES.map((t) => ({ text: t, bucket: "Non-fiction" })),
      ]).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each text into Fiction or Non-fiction.",
        items,
        buckets: [
          { id: "Fiction", label: "Fiction" },
          { id: "Non-fiction", label: "Non-fiction" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "Fiction" ? "fiction (imagined)" : "non-fiction (factual)"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, NON_FICTION_TYPES.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, NON_FICTION_TYPES.map((t) => ({ id: t.name, label: t.purpose })));
      const correctMap: Record<string, string> = {};
      for (const t of NON_FICTION_TYPES) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each type of non-fiction text to its purpose.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: NON_FICTION_TYPES.map((t) => `${t.name} — ${t.purpose.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SELECTION_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for choosing a non-fiction text to research a career in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: SELECTION_STEPS.map((s) => s.id),
        hint: "Start with your topic, then judge the source and its structure, then check the level, then read closely.",
        explanation: SELECTION_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    if (rng() < 0.6) {
      const s = randChoice(rng, CAREER_SCENARIOS);
      const choices = shuffle(rng, [s.correct, ...s.distractors]);
      return {
        kind: "multiple-choice",
        prompt: s.text,
        choices,
        correctIndex: choices.indexOf(s.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${s.correct}", since non-fiction texts give real, factual information useful for researching a career.`,
      };
    }

    const correct = "It gives real, factual information about different professions and what they involve";
    const choices = shuffle(rng, [
      correct,
      "It only tells made-up stories with no real information",
      "It is useful only for people who already know their career choice",
      "It replaces the need to ever speak to someone in that career",
    ]);
    return {
      kind: "multiple-choice",
      prompt: "What is the importance of reading non-fiction widely when exploring possible careers?",
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "list",
      hint,
      explanation: "Non-fiction gives real, factual information, which makes it especially useful for learning about careers before choosing one.",
    };
  },
};
