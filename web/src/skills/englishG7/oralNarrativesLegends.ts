import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Long ago, when a great famine dried up every river in the land, a young herdsman named Otieno set out alone to find the source of the Nyando river, said to be guarded by a spirit as tall as a fig tree. For seven days he walked without food, sharing his last handful of millet with a starving old woman he met on the path. At the river's source, the spirit tested his kindness by demanding his walking stick, his cloak, and finally his own name. Otieno gave up all three without complaint, and the spirit, moved by his selflessness, released the river to flow again, saving his family and the whole village from starvation. To this day, elders tell children the story of Otieno whenever a young person forgets to share with their family.";

const HEROIC_ACT_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which of Otieno's actions in the legend shows heroism?",
    correct: "He walked seven days without food, alone, to save his village from famine",
    distractors: [
      "He refused to leave his homestead during the famine",
      "He asked the spirit to give the river only to his own family",
      "He argued with the old woman instead of helping her",
    ],
    explanation: "The passage says Otieno 'set out alone' and 'walked without food' for seven days on a dangerous journey to save his village — a clearly heroic, self-sacrificing act.",
  },
];

const LESSON_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What lesson does this legend teach?",
    correct: "Selflessness and sharing what little we have can bring great rewards to our whole community",
    distractors: [
      "It is best to keep what little food we have only for ourselves",
      "Spirits should never be trusted under any circumstance",
      "Long journeys are always too dangerous to attempt",
    ],
    explanation: "Otieno shares his last food and gives up his possessions and even his name without complaint, and this selflessness is what moves the spirit to save the village.",
  },
];

const MORAL_MATCH: { lesson: string; realLife: string }[] = [
  { lesson: "Share what you have, even when it's little", realLife: "Splitting your lunch with a hungry classmate" },
  { lesson: "Selflessness can inspire good outcomes for others", realLife: "Helping a family member without expecting anything in return" },
  { lesson: "Courage means continuing even when a task is difficult", realLife: "Continuing to study for a hard exam despite wanting to give up" },
];

const GENRE_ITEMS: { text: string; category: "legend" | "trickster" | "dilemma" }[] = [
  { text: "Features a heroic character performing courageous deeds", category: "legend" },
  { text: "Often explains the origin of a place, river, or community custom", category: "legend" },
  { text: "Features a clever character who deceives others, often for selfish gain", category: "trickster" },
  { text: "The clever character's success depends on trickery rather than courage", category: "trickster" },
  { text: "Ends with an open question left for listeners to debate", category: "dilemma" },
];

const FAMILY_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why did Otieno's sacrifice matter especially to his family?",
    correct: "Because releasing the river directly saved his family, along with the whole village, from starvation",
    distractors: [
      "Because his family did not depend on the river at all",
      "Because his family had already moved away from the village",
      "Because the spirit gave the river only to strangers, not his family",
    ],
    explanation: "The passage says the river was released 'saving his family and the whole village from starvation' — his family's survival is directly tied to his sacrifice.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "For seven days he walked without food, sharing his last handful of", after: "with a starving old woman he met on the path.", correctAnswer: "millet" },
  { before: "At the river's source, the spirit tested his kindness by demanding his walking stick, his cloak, and finally his own", after: ".", correctAnswer: "name" },
  { before: "the spirit, moved by his selflessness, released the river to flow again, saving his family and the whole village from", after: ".", correctAnswer: "starvation" },
];

export const oralNarrativesLegends: Skill = {
  id: "g7-eng-r-oral-narratives-legends",
  code: "R.20",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Oral Narratives — Legends",
  description: "Identify heroic characters in legends, explain their moral lessons, discuss why legends matter to communities, and relate legend characters to family and real life.",
  generate(rng) {
    const branch = randChoice(rng, ["heroic", "lesson", "match", "genre", "family", "fill"] as const);
    const hint = "A legend centres on a heroic character whose brave or selfless act benefits the whole community.";

    if (branch === "heroic") {
      const entry = randChoice(rng, HEROIC_ACT_MC);
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

    if (branch === "lesson") {
      const entry = randChoice(rng, LESSON_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what Otieno's willingness to give things up made possible for others.",
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, MORAL_MATCH.map((m, i) => ({ id: `l${i}`, label: m.lesson })));
      const targets = shuffle(rng, MORAL_MATCH.map((m, i) => ({ id: `l${i}`, label: m.realLife })));
      const correctMap: Record<string, string> = {};
      MORAL_MATCH.forEach((_, i) => (correctMap[`l${i}`] = `l${i}`));
      return {
        kind: "click-match",
        prompt: "Match each lesson from the legend to a real-life example of it.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Think about how each lesson from Otieno's story could apply to everyday life today.",
        explanation: MORAL_MATCH.map((m) => `"${m.lesson}" — like ${m.realLife.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "genre") {
      const chosen = shuffle(rng, GENRE_ITEMS);
      const items = chosen.map((c, i) => ({ id: `g${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`g${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each feature by the type of oral narrative it best describes.",
        items,
        buckets: [
          { id: "legend", label: "Legend" },
          { id: "trickster", label: "Trickster Tale" },
          { id: "dilemma", label: "Dilemma Tale" },
        ],
        correctBucket,
        hint: "A legend's hero acts with courage; a trickster tale's hero acts with cunning; a dilemma tale ends unresolved.",
        explanation: chosen.map((c) => `"${c.text}" describes a ${c.category === "legend" ? "legend" : c.category === "trickster" ? "trickster tale" : "dilemma tale"}.`).join(" "),
      };
    }

    if (branch === "family") {
      const entry = randChoice(rng, FAMILY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Reread the final result of Otieno's sacrifice and who it affected.",
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word from the legend.",
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
