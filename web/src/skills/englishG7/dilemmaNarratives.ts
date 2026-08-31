import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Three friends from the same village grew up to become a nurse, a farmer, and a teacher. One dry season, the county announced only enough clean water pipes to serve one of their three neighbourhoods. The nurse argued her clinic needed water most, to treat sick children safely. The farmer argued his irrigation would grow food for the whole region, preventing future hunger. The teacher argued her school served the most people daily and shaped the community's future. The county officials could not decide, so they left the choice to the village elders — and to you. Who among the three made the strongest case for the water pipes?";

const DILEMMA_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is the central dilemma posed at the end of this narrative?",
    correct: "Deciding which of the three professionals — the nurse, the farmer, or the teacher — most deserves the water pipes",
    distractors: [
      "Deciding whether the county should build any water pipes at all",
      "Deciding which neighbourhood should host the county offices",
      "Deciding whether the three friends should remain friends",
    ],
    explanation: "The narrative ends by asking 'Who among the three made the strongest case for the water pipes?' — this is the open choice the audience must debate.",
  },
];

const CLOSING_FORMULA_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What literary feature does the final question, 'Who among the three made the strongest case for the water pipes?', represent?",
    correct: "A traditional closing formula that invites the audience to debate and decide, typical of dilemma narratives",
    distractors: [
      "A moral stated directly and clearly by the narrator",
      "A detailed description of the story's setting",
      "A summary that reveals exactly how the story ends",
    ],
    explanation: "Dilemma narratives traditionally end with an open question posed to the audience instead of a clear resolution — this invites listeners to discuss and decide for themselves.",
  },
];

const MOTIVATION_MATCH: { role: string; reasoning: string }[] = [
  { role: "The nurse", reasoning: "Her clinic needs water most, to treat sick children safely" },
  { role: "The farmer", reasoning: "His irrigation would grow food for the whole region, preventing future hunger" },
  { role: "The teacher", reasoning: "Her school serves the most people daily and shapes the community's future" },
];

const REAL_LIFE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which real-life situation is most similar to the dilemma faced in this story?",
    correct: "A family council deciding which of several urgent needs to fund first with limited money",
    distractors: [
      "A group of friends deciding which movie to watch on a Saturday",
      "A student choosing what colour pen to use for homework",
      "A shopkeeper deciding what time to open the shop each morning",
    ],
    explanation: "Like the three professionals competing for limited water pipes, a family with limited money choosing between several urgent needs faces the same kind of difficult, reasoned trade-off.",
  },
];

const PROFESSION_CATEGORY: { text: string; category: "nurse" | "farmer" | "teacher" }[] = [
  { text: "Argues that sick children need to be treated safely", category: "nurse" },
  { text: "Argues that irrigation would prevent future hunger across the region", category: "farmer" },
  { text: "Argues that her school shapes the community's future", category: "teacher" },
  { text: "Works at a clinic in the village", category: "nurse" },
  { text: "Grows food for the whole region", category: "farmer" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "One dry season, the county announced only enough clean water pipes to serve one of their three", after: ".", correctAnswer: "neighbourhoods" },
  { before: "The farmer argued his irrigation would grow food for the whole region, preventing future", after: ".", correctAnswer: "hunger" },
  { before: "The county officials could not decide, so they left the choice to the village", after: " — and to you.", correctAnswer: "elders" },
];

export const dilemmaNarratives: Skill = {
  id: "g7-eng-r-dilemma-narratives",
  code: "R.26",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Dilemma Narratives",
  description: "Describe characters in a dilemma narrative, recognise the closing question as a feature of the genre, and relate the dilemma to real-life decision-making.",
  generate(rng) {
    const branch = randChoice(rng, ["dilemma", "closing", "match", "real-life", "categorize", "fill"] as const);
    const hint = "A dilemma narrative sets up competing, reasonable arguments and ends with an open question rather than a clear answer.";

    if (branch === "dilemma") {
      const entry = randChoice(rng, DILEMMA_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "closing") {
      const entry = randChoice(rng, CLOSING_FORMULA_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Notice that the story never tells us which friend the elders chose.",
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, MOTIVATION_MATCH.map((m, i) => ({ id: `m${i}`, label: m.role })));
      const targets = shuffle(rng, MOTIVATION_MATCH.map((m, i) => ({ id: `m${i}`, label: m.reasoning })));
      const correctMap: Record<string, string> = {};
      MOTIVATION_MATCH.forEach((_, i) => (correctMap[`m${i}`] = `m${i}`));
      return {
        kind: "click-match",
        prompt: "Match each character to their reasoning for why they deserve the water pipes.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Each character's profession shapes the argument they make.",
        explanation: MOTIVATION_MATCH.map((m) => `${m.role} — ${m.reasoning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "real-life") {
      const entry = randChoice(rng, REAL_LIFE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about situations where several good, reasonable needs compete for one limited resource.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PROFESSION_CATEGORY);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each statement by which character in the story it describes.",
        passage: STORY,
        items,
        buckets: [
          { id: "nurse", label: "The Nurse" },
          { id: "farmer", label: "The Farmer" },
          { id: "teacher", label: "The Teacher" },
        ],
        correctBucket,
        hint: "Each profession's argument relates directly to their daily work.",
        explanation: chosen.map((c) => `"${c.text}" describes the ${c.category}.`).join(" "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word from the story.",
      passage: STORY,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Look for the exact word in the passage above.",
      explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
    };
  },
};
