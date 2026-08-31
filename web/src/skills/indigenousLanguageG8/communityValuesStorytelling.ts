import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PROVERBS: { proverb: string; meaning: string; value: string }[] = [
  {
    proverb: "Unity is strength; division is weakness.",
    meaning: "When people work together, they can achieve much more than when they are divided",
    value: "Unity",
  },
  {
    proverb: "One finger cannot pick up a stone.",
    meaning: "Some tasks are too big for one person alone and need teamwork",
    value: "Unity",
  },
  {
    proverb: "He who does not respect a big person will one day be respected by no one.",
    meaning: "Showing respect to others, especially elders, earns you respect in return",
    value: "Respect",
  },
  {
    proverb: "A visitor is a guest for two days; on the third day, give him a hoe.",
    meaning: "Everyone is expected to work hard and contribute, not depend on others forever",
    value: "Hard work",
  },
  {
    proverb: "The hand that gives is always above the one that receives.",
    meaning: "Working hard so that you are able to help others is honourable",
    value: "Hard work",
  },
  {
    proverb: "A tree does not make a forest.",
    meaning: "A community achieves more when its members stand together rather than alone",
    value: "Unity",
  },
];

const STORY_STEPS: { id: string; label: string }[] = [
  { id: "recall", label: "Recall the main characters and setting of the story" },
  { id: "retell", label: "Retell the events of the story in the order they happened" },
  { id: "expression", label: "Use expression and non-verbal cues to keep listeners engaged" },
  { id: "lesson", label: "Include the key lesson or moral the story teaches" },
  { id: "connect", label: "Explain how the lesson relates to community values today" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  {
    before: "The proverb \"One finger cannot pick up a",
    after: "\" teaches the value of unity and teamwork.",
    answer: "stone",
  },
  {
    before: "The proverb \"Unity is strength;",
    after: "is weakness\" reminds us that a divided community is a weak community.",
    answer: "division",
  },
  {
    before: "Sharing proverbs and wise sayings with children helps to pass down",
    after: "from one generation to the next.",
    answer: "culture",
  },
  {
    before: "A good storyteller always retells the events of a story in the order in which they",
    after: ", so that listeners can follow easily.",
    answer: "happened",
    accepted: ["occurred", "took place"],
  },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to pass down culture, such as proverbs and stories, from one generation to another?",
    correct: "So that traditional wisdom and community values are not lost over time",
    distractors: [
      "So that only elders are allowed to know about their community's history",
      "Because proverbs are only useful during festivals",
      "Because it prevents any change from happening in the community",
    ],
  },
  {
    q: "What does the proverb 'One finger cannot pick up a stone' teach us?",
    correct: "That people need to work together to accomplish difficult tasks",
    distractors: [
      "That it is best to work completely alone",
      "That stones should never be picked up",
      "That fingers are more useful than hands",
    ],
  },
  {
    q: "Which community value is being demonstrated when neighbours come together to help harvest a sick farmer's crops?",
    correct: "Unity",
    distractors: ["Greed", "Laziness", "Dishonesty"],
  },
  {
    q: "When retelling a story, why is it important to keep the events in the correct order?",
    correct: "So that listeners can follow and understand the story clearly",
    distractors: [
      "So that the story becomes longer",
      "Because the order of events does not matter",
      "So that listeners forget the moral of the story",
    ],
  },
  {
    q: "What does the proverb 'A visitor is a guest for two days; on the third day, give him a hoe' teach us about hard work?",
    correct: "That everyone is expected to contribute and work, not depend on others forever",
    distractors: [
      "That visitors should never be given any work",
      "That hard work is only for farmers",
      "That guests should stay forever without contributing",
    ],
  },
];

export const communityValuesStorytelling: Skill = {
  id: "g8-il-ls-community-values",
  code: "LS.5",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Common community values: storytelling",
  description: "Explain proverbs and wise sayings about unity, respect, and hard work, and retell short stories that teach community values.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Proverbs carry lessons about unity, respect, and hard work — passing them on through storytelling keeps a community's culture alive.";

    if (branch === "match") {
      const chosen = shuffle(rng, PROVERBS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.proverb, label: p.proverb })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.proverb, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.proverb] = p.proverb;
      return {
        kind: "click-match",
        prompt: "Match each proverb to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.proverb}" — ${p.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PROVERBS);
      const bucketNames = Array.from(new Set(chosen.map((p) => p.value)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.proverb }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.value));
      return {
        kind: "categorize",
        prompt: "Sort each proverb by the community value it mainly teaches.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the proverb is mostly about working together, respecting others, or working hard.",
        explanation: chosen.map((p) => `"${p.proverb}" — mainly teaches ${p.value.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, STORY_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of retelling a story well in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: STORY_STEPS.map((s) => s.id),
        hint: "Start by recalling the characters and setting, then retell events in order, use expression, and end with the lesson.",
        explanation: STORY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
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
