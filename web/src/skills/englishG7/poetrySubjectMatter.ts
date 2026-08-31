import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POEM_TITLE = "I Am the Mara";

const POEM =
  "I Am the Mara\n\nI am the grass that feeds a million hooves,\nI am the plain where the wildebeest move.\nEvery July my rivers run red and wide\nWith crossings brave, and the crocodiles that hide.\nCome, stranger, walk my golden, endless floor,\nAnd hear the roar of lions at my door.";

const SUBJECT_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What is the subject matter of this poem?",
    correct: "The Maasai Mara and its wildlife, described as if the land itself is speaking",
    distractors: [
      "A classroom on the first day of school",
      "A football match between two rival towns",
      "A busy market in a city centre",
    ],
    explanation: "The poem describes grass, wildebeest, river crossings, crocodiles, and lions — all features of the Maasai Mara — spoken in the voice of the land itself.",
  },
];

const CLUE_MATCH: { clue: string; signals: string }[] = [
  { clue: `The title, "${POEM_TITLE}"`, signals: "Names the subject of the poem directly" },
  { clue: "The persona (\"I am the grass... I am the plain...\")", signals: "Lets the land itself speak, showing its pride and vastness" },
  { clue: "Word choice (\"hooves,\" \"wildebeest,\" \"crossings,\" \"crocodiles\")", signals: "Signals wildlife and safari imagery as the poem's focus" },
  { clue: "Repetition of \"I am\"", signals: "Emphasises the identity and grandeur of the place" },
];

const CLUE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which textual clue best signals that this poem is about the Mara's wildlife, rather than its people?",
    correct: "The specific word choices like 'hooves,' 'wildebeest,' and 'crocodiles'",
    distractors: [
      "The number of stanzas in the poem",
      "The fact that the poem uses rhyme",
      "The length of each line in the poem",
    ],
    explanation: "Words like 'hooves,' 'wildebeest,' and 'crocodiles' are specific vocabulary that point directly to wildlife, more than any other feature of the poem.",
  },
];

const WHY_POEM_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why might a poet choose a poem, rather than a plain paragraph, to describe a place like the Mara to tourists?",
    correct: "A poem's rhythm, imagery, and repetition can capture the place's atmosphere and stir emotion more memorably than a plain description",
    distractors: [
      "A poem is always shorter to type than a paragraph",
      "A poem is meant to hide the true facts about a place",
      "Poems can only be written about sad topics",
    ],
    explanation: "By giving the Mara its own voice and using vivid, repeated imagery, the poem creates an emotional, memorable impression that a plain factual paragraph would not.",
  },
];

const CLUE_CATEGORY: { text: string; category: "title" | "persona" | "word-choice" | "repetition" }[] = [
  { text: `"${POEM_TITLE}" as the poem's title`, category: "title" },
  { text: "\"I am the grass that feeds a million hooves\"", category: "persona" },
  { text: "The words \"wildebeest\" and \"crocodiles\"", category: "word-choice" },
  { text: "\"I am... I am...\" repeated across several lines", category: "repetition" },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "I am the grass that feeds a million", after: ",", correctAnswer: "hooves" },
  { before: "Every July my rivers run red and wide\nWith crossings brave, and the", after: "that hide.", correctAnswer: "crocodiles" },
  { before: "Come, stranger, walk my golden, endless floor,\nAnd hear the roar of", after: "at my door.", correctAnswer: "lions" },
];

export const poetrySubjectMatter: Skill = {
  id: "g7-eng-r-poetry-subject-matter",
  code: "R.30",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Poetry: Subject Matter and Ideas",
  description: "Identify the subject matter of a poem, analyse ideas through title, persona, word choice and repetition, and appreciate poetry's role in passing on information.",
  generate(rng) {
    const branch = randChoice(rng, ["subject", "match", "clue", "why-poem", "categorize", "fill"] as const);
    const hint = "Look at the poem's title, who is 'speaking,' the specific words chosen, and any repeated phrases.";

    if (branch === "subject") {
      const entry = randChoice(rng, SUBJECT_MC);
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

    if (branch === "match") {
      const tokens = shuffle(rng, CLUE_MATCH.map((c, i) => ({ id: `c${i}`, label: c.clue })));
      const targets = shuffle(rng, CLUE_MATCH.map((c, i) => ({ id: `c${i}`, label: c.signals })));
      const correctMap: Record<string, string> = {};
      CLUE_MATCH.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      return {
        kind: "click-match",
        prompt: "Match each textual clue in the poem to how it signals the poem's subject or idea.",
        passage: POEM,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CLUE_MATCH.map((c) => `${c.clue} — ${c.signals.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "clue") {
      const entry = randChoice(rng, CLUE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Some clues are about structure, others are about the actual meaning of the words used.",
        explanation: entry.explanation,
      };
    }

    if (branch === "why-poem") {
      const entry = randChoice(rng, WHY_POEM_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: POEM,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what a poem can do with rhythm and imagery that a plain paragraph cannot.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CLUE_CATEGORY);
      const items = chosen.map((c, i) => ({ id: `k${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`k${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each example by the type of textual clue it represents.",
        passage: POEM,
        items,
        buckets: [
          { id: "title", label: "Title" },
          { id: "persona", label: "Persona" },
          { id: "word-choice", label: "Word Choice" },
          { id: "repetition", label: "Repetition" },
        ],
        correctBucket,
        hint: "A title names the subject; a persona is who speaks; word choice is specific vocabulary; repetition is what returns again and again.",
        explanation: chosen.map((c) => `"${c.text}" is an example of ${c.category === "word-choice" ? "word choice" : c.category}.`).join(" "),
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
      hint: "Look for the exact word in the poem above, and notice how it fits the wildlife imagery.",
      explanation: `The line reads: "...${entry.correctAnswer}${entry.after}"`,
    };
  },
};
