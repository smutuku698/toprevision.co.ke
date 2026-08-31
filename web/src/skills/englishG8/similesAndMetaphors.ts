import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Long before independence, a young woman named Wangari organised secret night meetings under a fig tree, her voice as steady as a drumbeat calling villagers to gather. Colonial officers patrolled the roads like hawks circling for prey, but Wangari moved through the forest paths quietly, a shadow slipping between the trees. Her courage was a fire that spread from homestead to homestead, lighting resolve in people who had once felt powerless. When soldiers finally surrounded her village, Wangari stood before them, her spine an iron rod that refused to bend. She was arrested and imprisoned for two years, yet news of her defiance travelled like wildfire across the region, inspiring others to organise their own resistance. When she was finally released, the whole village turned out to welcome her, and elders said her name would be remembered as long as the fig tree still stood over the meeting ground.";

const SIMILE_ITEMS = [
  { text: "her voice as steady as a drumbeat", explanation: "Compares her voice to a drumbeat using 'as... as,' showing it was rhythmic and unwavering" },
  { text: "Colonial officers patrolled the roads like hawks circling for prey", explanation: "Compares the officers to hawks using 'like,' showing they were watchful and predatory" },
  { text: "news of her defiance travelled like wildfire across the region", explanation: "Compares the spreading news to wildfire using 'like,' showing how fast and uncontrollably it spread" },
];

const METAPHOR_ITEMS = [
  { text: "a shadow slipping between the trees", explanation: "Directly calls her 'a shadow' (no 'like' or 'as'), showing how quietly and invisibly she moved" },
  { text: "Her courage was a fire that spread from homestead to homestead", explanation: "Directly calls her courage 'a fire' (no 'like' or 'as'), showing how it ignited and spread among people" },
  { text: "her spine an iron rod that refused to bend", explanation: "Directly calls her spine 'an iron rod' (no 'like' or 'as'), showing her firmness and refusal to give in" },
];

const EXPLAIN_QUESTIONS: { text: string; q: string; correct: string; distractors: string[] }[] = [
  {
    text: "Colonial officers patrolled the roads like hawks circling for prey",
    q: "What does the simile \"like hawks circling for prey\" suggest about the colonial officers?",
    correct: "They were watchful, threatening, and constantly searching for someone to catch",
    distractors: ["They were friendly and welcoming to villagers", "They rarely patrolled the roads at all", "They were afraid of the villagers"],
  },
  {
    text: "Her courage was a fire that spread from homestead to homestead",
    q: "What does the metaphor \"her courage was a fire\" suggest about its effect on others?",
    correct: "Her courage inspired and energised other people, spreading quickly like flames",
    distractors: ["Her courage destroyed the homesteads she visited", "Her courage remained hidden and had no effect on others", "Her courage frightened people away from her"],
  },
  {
    text: "her spine an iron rod that refused to bend",
    q: "What does the metaphor \"her spine an iron rod\" suggest about Wangari when soldiers surrounded her?",
    correct: "She stood firm and unshakeable, refusing to give in despite the danger",
    distractors: ["She physically could not move due to injury", "She immediately surrendered out of fear", "She fainted from the shock of being surrounded"],
  },
];

const SENTENCE_FILLS = [
  { before: "The little boy ran across the field as fast as", after: ".", correctAnswer: "a cheetah", hint: "Complete this simile with something known for great speed, using 'as fast as'." },
  { before: "After the long drought, the news of rain was", after: "to the thirsty farmers.", correctAnswer: "music", hint: "Complete this metaphor — think of something joyful and welcome, directly compared without 'like' or 'as'." },
];

export const similesAndMetaphors: Skill = {
  id: "g8-eng-r-similes-and-metaphors",
  code: "R.18",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Similes and Metaphors",
  description: "List, explain, and use similes and metaphors from a short story, appreciating their importance in communication.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "explain", "fill", "list"] as const);
    const hint = "A simile compares using 'like' or 'as'; a metaphor states something IS another thing, without 'like' or 'as'.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, [
        ...SIMILE_ITEMS.map((s) => ({ text: s.text, category: "simile" as const })),
        ...METAPHOR_ITEMS.map((m) => ({ text: m.text, category: "metaphor" as const })),
      ]);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each phrase from the story as a Simile or a Metaphor.",
        passage: STORY,
        items,
        buckets: [
          { id: "simile", label: "Simile" },
          { id: "metaphor", label: "Metaphor" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is a ${c.category === "simile" ? "simile (uses 'like' or 'as')" : "metaphor (states one thing IS another, directly)"}.`).join(" "),
      };
    }

    if (branch === "explain") {
      const entry = randChoice(rng, EXPLAIN_QUESTIONS);
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

    if (branch === "fill") {
      const entry = randChoice(rng, SENTENCE_FILLS);
      return {
        kind: "fill-blank",
        prompt: "Complete this original sentence with a fitting simile or metaphor.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: [entry.correctAnswer, entry.correctAnswer.replace("a ", ""), entry.correctAnswer.replace("an ", "")],
        inputMode: "text",
        hint: entry.hint,
        explanation: `A fitting answer is "${entry.correctAnswer}" — for example: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const chosen = shuffle(rng, [...SIMILE_ITEMS, ...METAPHOR_ITEMS]).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((c, i) => ({ id: `m${i}`, label: c.text })));
    const targets = shuffle(rng, chosen.map((c, i) => ({ id: `m${i}`, label: c.explanation })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((_, i) => (correctMap[`m${i}`] = `m${i}`));
    return {
      kind: "click-match",
      prompt: "Match each simile or metaphor from the story to what it means.",
      passage: STORY,
      tokens,
      targets,
      correctMap,
      hint,
      explanation: chosen.map((c) => `"${c.text}" — ${c.explanation.toLowerCase()}.`).join(" "),
    };
  },
};
