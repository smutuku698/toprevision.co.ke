import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POEM =
  "Kelvin leaps and swings with the moving door,\nCounting coins before the engine's roar.\nHe shouts each stage with a grin so wide,\n\"Kisumu! Kisumu! Come on, climb inside!\"\nThrough mud and dust his matatu flies,\nWhile tired travellers rest their eyes.\nYet gentle still, he helps the old and lame,\nAnd calls each regular rider by name.";

const IDENTIFY_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which human character is described in this poem?",
    correct: "Kelvin, a matatu conductor",
    distractors: ["A tired traveller with no name given", "A driving instructor", "A market trader in Kisumu"],
    explanation: "The poem names 'Kelvin' directly and describes him counting coins, shouting stages, and helping riders — the work of a matatu conductor.",
  },
];

const ADJECTIVE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which adjective best describes Kelvin, based on the lines \"he helps the old and lame, and calls each regular rider by name\"?",
    correct: "Caring",
    distractors: ["Lazy", "Rude", "Forgetful"],
    explanation: "Helping vulnerable passengers and remembering riders by name shows Kelvin is caring and attentive toward the people he serves.",
  },
  {
    q: "Which adjective best describes Kelvin, based on the lines \"Kelvin leaps and swings with the moving door... He shouts each stage with a grin so wide\"?",
    correct: "Energetic",
    distractors: ["Sleepy", "Nervous", "Silent"],
    explanation: "Leaping, swinging, and shouting cheerfully while the matatu moves shows Kelvin has a lively, energetic manner at work.",
  },
];

const TRAIT_MATCH: { line: string; trait: string }[] = [
  { line: "Kelvin leaps and swings with the moving door", trait: "Energetic and lively" },
  { line: "He shouts each stage with a grin so wide", trait: "Cheerful and enthusiastic" },
  { line: "he helps the old and lame", trait: "Caring and kind" },
  { line: "calls each regular rider by name", trait: "Attentive and friendly" },
];

const ACTION_CATEGORY: { text: string; category: "energy" | "kindness" }[] = [
  { text: "Kelvin leaps and swings with the moving door", category: "energy" },
  { text: "His matatu flies through mud and dust", category: "energy" },
  { text: "He helps the old and lame", category: "kindness" },
  { text: "He calls each regular rider by name", category: "kindness" },
];

const APPRECIATE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why might a poet choose to describe an ordinary human character like Kelvin in a travel-themed poem?",
    correct: "To show that ordinary people we meet while travelling have their own personalities and stories worth noticing",
    distractors: [
      "Because matatu conductors are the only people worth writing poems about",
      "To criticise all conductors for being unkind to passengers",
      "Because the poem needed a character with a short name",
    ],
    explanation: "By giving Kelvin distinct traits — energy, cheerfulness, and kindness — the poem invites readers to notice the humanity in people they might otherwise overlook while travelling.",
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Kelvin leaps and swings with the moving door,\nCounting coins before the engine's", after: ".", correctAnswer: "roar" },
  { before: "Through mud and dust his matatu flies,\nWhile tired travellers rest their", after: ".", correctAnswer: "eyes" },
  { before: "Yet gentle still, he helps the old and lame,\nAnd calls each regular rider by", after: ".", correctAnswer: "name" },
];

export const poetryHumanCharacters: Skill = {
  id: "g7-eng-r-poetry-human-characters",
  code: "R.23",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Intensive Reading: Poetry — Human Characters",
  description: "Identify human characters in poems, use adjectives to describe their traits, and appreciate the importance of human characters in poetry.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "adjective", "match", "categorize", "appreciate", "fill"] as const);
    const hint = "Look at what the character does and says in the poem to work out what kind of person they are.";

    if (branch === "identify") {
      const entry = randChoice(rng, IDENTIFY_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "adjective") {
      const entry = randChoice(rng, ADJECTIVE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, TRAIT_MATCH.map((t, i) => ({ id: `t${i}`, label: t.line })));
      const targets = shuffle(rng, TRAIT_MATCH.map((t, i) => ({ id: `t${i}`, label: t.trait })));
      const correctMap: Record<string, string> = {};
      TRAIT_MATCH.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each line from the poem to the trait it reveals about Kelvin.",
        passage: POEM,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TRAIT_MATCH.map((t) => `"${t.line}" shows he is ${t.trait.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ACTION_CATEGORY);
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each line from the poem as showing Energy or showing Kindness.",
        passage: POEM,
        items,
        buckets: [
          { id: "energy", label: "Shows Energy" },
          { id: "kindness", label: "Shows Kindness" },
        ],
        correctBucket,
        hint: "Some lines show how lively Kelvin is; others show how he treats his passengers.",
        explanation: chosen.map((c) => `"${c.text}" shows ${c.category === "energy" ? "energy" : "kindness"}.`).join(" "),
      };
    }

    if (branch === "appreciate") {
      const entry = randChoice(rng, APPRECIATE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about why a poet would spend a whole poem describing someone we might otherwise ignore.",
        explanation: entry.explanation,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word from the poem.",
      passage: POEM,
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint: "Look for the exact word in the poem above, and notice how it rhymes.",
      explanation: `The line reads: "...${entry.correctAnswer}${entry.after}"`,
    };
  },
};
