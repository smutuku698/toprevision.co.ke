import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Coach Simiyu blew his whistle and shouted, \"Run like the field is on fire!\" Startled, the players sprinted as if their legs had become springs. Juma, usually slow, surprised everyone: his legs were pistons pumping down the track. \"I didn't know I had that in me,\" he panted, grinning at his teammates. \"Neither did I,\" replied Coach Simiyu, \"but now the whole team knows.\"";

const SIMILE_ITEMS: { text: string; explanation: string }[] = [
  { text: "\"Run like the field is on fire!\"", explanation: "Compares running to fire using 'like,' showing how urgently the players should move" },
  { text: "the players sprinted as if their legs had become springs", explanation: "Compares their legs to springs using 'as if,' showing how bouncy and fast their strides became" },
];

const METAPHOR_ITEMS: { text: string; explanation: string }[] = [
  { text: "his legs were pistons pumping down the track", explanation: "Directly calls his legs 'pistons' (no 'like' or 'as'), showing how powerfully and mechanically fast he moved" },
];

const NEITHER_ITEMS: { text: string; explanation: string }[] = [
  { text: "Coach Simiyu blew his whistle and shouted", explanation: "A plain factual statement describing an action, with no comparison" },
  { text: "Juma, usually slow, surprised everyone", explanation: "A plain factual statement describing what happened, with no comparison" },
];

const DIALOGUE_ITEMS: { speaker: string; line: string; reveals: string }[] = [
  { speaker: "Juma", line: "\"I didn't know I had that in me,\" he panted, grinning at his teammates.", reveals: "His own surprise at discovering a hidden ability" },
  { speaker: "Coach Simiyu", line: "\"Neither did I,\" replied Coach Simiyu, \"but now the whole team knows.\"", reveals: "His pride in Juma and his encouragement, sharing the credit with the whole team" },
];

const EXPLAIN_MC: { text: string; q: string; correct: string; distractors: string[] }[] = [
  {
    text: "his legs were pistons pumping down the track",
    q: "What does the metaphor \"his legs were pistons pumping down the track\" suggest about Juma?",
    correct: "His legs moved powerfully and mechanically fast, like the moving parts of a machine",
    distractors: ["His legs were injured and moved slowly", "He stopped running partway through the race", "His legs felt weak and tired"],
  },
  {
    text: "Run like the field is on fire!",
    q: "What does the simile \"Run like the field is on fire!\" suggest Coach Simiyu wants from his players?",
    correct: "He wants them to sprint with urgency, as if escaping real danger",
    distractors: ["He wants them to stop running immediately", "He wants them to walk slowly and carefully", "He is warning them about an actual fire on the field"],
  },
];

const IMPORTANCE_MC: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Why do writers use dialogue, similes, and metaphors in a sports narrative like this one?",
    correct: "They make the action and the characters' feelings more vivid and engaging for the reader",
    distractors: [
      "They make the story longer without adding any real meaning",
      "They are only used to confuse the reader about what is happening",
      "They remove all emotion from the story's characters",
    ],
    explanation: "Dialogue lets characters speak for themselves, while similes and metaphors paint a vivid picture of the action — together they draw the reader more deeply into the scene.",
  },
];

const SENTENCE_FILLS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[]; hint: string }[] = [
  {
    before: "The sprinter crossed the finish line as fast as",
    after: ".",
    correctAnswer: "an arrow",
    acceptedAnswers: ["an arrow", "lightning", "a bullet"],
    hint: "Complete this simile with something known for great speed, using 'as fast as.'",
  },
  {
    before: "When Amina scored the winning goal, the crowd's roar was",
    after: ".",
    correctAnswer: "thunder",
    acceptedAnswers: ["thunder", "a thunderclap"],
    hint: "Complete this metaphor — directly compare the sound to something loud, without using 'like' or 'as.'",
  },
];

export const featuresOfStyle: Skill = {
  id: "g7-eng-r-features-of-style",
  code: "R.29",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Features of Style: Dialogue, Similes and Metaphors",
  description: "Identify dialogue, similes, and metaphors in a text, use these styles in guided contexts, and appreciate their importance in a work of art.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "fill", "dialogue-mc", "dialogue-match", "explain", "importance"] as const);
    const hint = "A simile compares using 'like' or 'as'; a metaphor states something IS another thing directly, without 'like' or 'as'; dialogue is the exact words a character speaks.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, [
        ...SIMILE_ITEMS.map((s) => ({ text: s.text, category: "simile" as const })),
        ...METAPHOR_ITEMS.map((m) => ({ text: m.text, category: "metaphor" as const })),
        ...NEITHER_ITEMS.map((n) => ({ text: n.text, category: "neither" as const })),
      ]);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each sentence from the story as a Simile, a Metaphor, or Neither.",
        passage: STORY,
        items,
        buckets: [
          { id: "simile", label: "Simile" },
          { id: "metaphor", label: "Metaphor" },
          { id: "neither", label: "Neither" },
        ],
        correctBucket,
        hint,
        explanation: chosen
          .map((c) => `"${c.text}" is ${c.category === "simile" ? "a simile (uses 'like' or 'as')" : c.category === "metaphor" ? "a metaphor (states one thing IS another, directly)" : "neither — a plain statement with no comparison"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, SENTENCE_FILLS);
      return {
        kind: "fill-blank",
        prompt: "Complete this original sentence with a fitting simile or metaphor.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint: entry.hint,
        explanation: `A fitting answer is "${entry.correctAnswer}" — for example: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "dialogue-mc") {
      const entry = randChoice(rng, DIALOGUE_ITEMS);
      const wrongEntries = DIALOGUE_ITEMS.filter((d) => d !== entry);
      const distractors = [
        wrongEntries.length > 0 ? wrongEntries[0].reveals : "It reveals nothing about the speaker",
        "It shows the speaker is angry at their teammates",
        "It shows the speaker wants to stop playing sports altogether",
      ];
      const choices = shuffle(rng, [entry.reveals, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `In the story, ${entry.speaker} says: ${entry.line} What does this line of dialogue reveal about ${entry.speaker}?`,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.reveals),
        layout: "list",
        hint: "Dialogue often reveals a character's feelings at that exact moment in the story.",
        explanation: `"${entry.line}" — ${entry.reveals.toLowerCase()}.`,
      };
    }

    if (branch === "dialogue-match") {
      const tokens = shuffle(rng, DIALOGUE_ITEMS.map((d, i) => ({ id: `dl${i}`, label: d.line })));
      const targets = shuffle(rng, DIALOGUE_ITEMS.map((d, i) => ({ id: `dl${i}`, label: d.reveals })));
      const correctMap: Record<string, string> = {};
      DIALOGUE_ITEMS.forEach((_, i) => (correctMap[`dl${i}`] = `dl${i}`));
      return {
        kind: "click-match",
        prompt: "Match each line of dialogue to what it reveals about the character who says it.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Think about each speaker's feelings at that moment in the scene.",
        explanation: DIALOGUE_ITEMS.map((d) => `${d.speaker}'s line — ${d.reveals.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "explain") {
      const entry = randChoice(rng, EXPLAIN_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what quality is being emphasised by this comparison.",
        explanation: `In "${entry.text}," the correct meaning is: ${entry.correct}.`,
      };
    }

    const entry = randChoice(rng, IMPORTANCE_MC);
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
  },
};
