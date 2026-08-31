import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TIME_ITEMS: { phrase: string; prep: "in" | "on" | "at" }[] = [
  { phrase: "December", prep: "in" },
  { phrase: "2024", prep: "in" },
  { phrase: "the morning", prep: "in" },
  { phrase: "the rainy season", prep: "in" },
  { phrase: "Monday", prep: "on" },
  { phrase: "12th August", prep: "on" },
  { phrase: "Christmas Day", prep: "on" },
  { phrase: "my birthday", prep: "on" },
  { phrase: "6 o'clock", prep: "at" },
  { phrase: "night", prep: "at" },
  { phrase: "the weekend", prep: "at" },
  { phrase: "sunrise", prep: "at" },
] as const;

const POSITION: { prep: string; meaning: string; example: string }[] = [
  { prep: "under", meaning: "below something, often covered by it", example: "The visitors sheltered under the acacia tree during the rain." },
  { prep: "beside", meaning: "next to something", example: "The tour guide stood beside the safari vehicle." },
  { prep: "between", meaning: "in the space separating exactly two things", example: "The lodge is located between the river and the forest." },
  { prep: "among", meaning: "in the middle of a group of more than two", example: "A lone giraffe walked among a group of zebras." },
  { prep: "opposite", meaning: "facing something from the other side", example: "The museum stands opposite the national park gate." },
  { prep: "across", meaning: "from one side of something to the other", example: "Tourists walked across the swinging bridge to reach the viewpoint." },
  { prep: "behind", meaning: "at the back of something", example: "The campsite is behind the ranger's station." },
  { prep: "in front of", meaning: "at the front, facing something", example: "Visitors take photos in front of the waterfall." },
] as const;

const FILL_PLACE: { before: string; prep: string; after: string }[] = [
  { before: "The tourists stopped ", prep: "near", after: " the watering hole to watch the elephants drink." },
  { before: "Our hotel room is ", prep: "opposite", after: " the swimming pool." },
  { before: "We saw a leopard resting ", prep: "under", after: " a large fig tree." },
  { before: "The campsite is located ", prep: "between", after: " two rocky hills." },
  { before: "A lone wildebeest wandered ", prep: "among", after: " the grazing zebras." },
  { before: "The tour bus drove ", prep: "across", after: " the river using the old bridge." },
];

const TIME_CHOICE: { before: string; after: string; correct: string; distractors: string[] }[] = [
  { before: "Our safari tour begins ", after: " dawn, before the animals move to the shade.", correct: "at", distractors: ["in", "on", "during"] },
  { before: "Many tourists visit the coast ", after: " December, during the holiday season.", correct: "in", distractors: ["on", "at", "since"] },
  { before: "The museum is closed ", after: " Mondays for cleaning.", correct: "on", distractors: ["in", "at", "for"] },
  { before: "The national park has welcomed visitors ", after: " over fifty years.", correct: "for", distractors: ["since", "during", "at"] },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How do we show the position of a person or thing in a sentence?",
    correct: "By using a preposition of position, such as 'under', 'beside', or 'between'",
    distractors: [
      "By repeating the noun twice",
      "By always placing the noun at the start of the sentence",
      "By using a conjunction instead of a noun",
    ],
  },
  {
    q: "Which preposition is generally used with clock times, such as '6 o'clock'?",
    correct: "at",
    distractors: ["in", "on", "during"],
  },
  {
    q: "Which preposition is generally used with days and specific dates, such as 'Monday' or '12th August'?",
    correct: "on",
    distractors: ["in", "at", "since"],
  },
  {
    q: "Which preposition is generally used with months, years, and seasons, such as 'December' or 'the rainy season'?",
    correct: "in",
    distractors: ["on", "at", "for"],
  },
];

export const simplePrepositions: Skill = {
  id: "g8-eng-g-simple-prepositions",
  code: "G.8",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Word Classes: Simple Prepositions",
  description: "Identify and use prepositions of position, time, and place correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "fill", "time-mc", "concept"] as const);

    if (branch === "categorize") {
      const inPick = shuffle(rng, TIME_ITEMS.filter((t) => t.prep === "in")).slice(0, 2);
      const onPick = shuffle(rng, TIME_ITEMS.filter((t) => t.prep === "on")).slice(0, 2);
      const atPick = shuffle(rng, TIME_ITEMS.filter((t) => t.prep === "at")).slice(0, 2);
      const chosen = shuffle(rng, [...inPick, ...onPick, ...atPick]);
      const buckets = [
        { id: "in", label: "in" },
        { id: "on", label: "on" },
        { id: "at", label: "at" },
      ];
      const items = chosen.map((c, i) => ({ id: `t${i}`, label: c.phrase }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`t${i}`] = c.prep));
      return {
        kind: "categorize",
        prompt: "Sort each time expression by the preposition that goes with it: in, on, or at.",
        items,
        buckets,
        correctBucket,
        hint: "'in' goes with months, years, seasons, and parts of the day; 'on' goes with days and dates; 'at' goes with clock times and a few fixed expressions like 'at night'.",
        explanation: chosen.map((c) => `"${c.prep} ${c.phrase}" is correct.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, POSITION).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.prep, label: p.prep })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.prep, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.prep] = p.prep;
      return {
        kind: "click-match",
        prompt: "Match each preposition of position to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Picture where one thing is compared to another: below, beside, between, facing, or crossing it.",
        explanation: chosen.map((p) => `"${p.prep}" means ${p.meaning}, as in: "${p.example}"`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_PLACE);
      return {
        kind: "fill-blank",
        prompt: "Fill in the preposition of place or position that best completes the sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.prep,
        inputMode: "text",
        hint: "Picture the scene described and think about exactly where the person or thing is.",
        explanation: `"${entry.prep}" is the preposition that fits here: "${entry.before}${entry.prep}${entry.after}"`,
      };
    }

    if (branch === "time-mc") {
      const entry = randChoice(rng, TIME_CHOICE);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which preposition correctly completes this sentence? "${entry.before}___${entry.after}"`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check whether the time expression is a clock time, a day/date, a month/year/season, or a duration.",
        explanation: `"${entry.correct}" is correct here: "${entry.before}${entry.correct}${entry.after}"`,
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
      hint: "Match the type of time or place expression to the preposition that usually goes with it.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
