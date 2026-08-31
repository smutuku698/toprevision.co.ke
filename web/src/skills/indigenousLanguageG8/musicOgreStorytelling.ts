import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORYTELLER_TRAITS: { trait: string; description: string }[] = [
  { trait: "Expressive voice", description: "Changing tone and pitch to build suspense at exciting moments" },
  { trait: "Eye contact", description: "Looking around at listeners to keep them engaged" },
  { trait: "Use of gestures", description: "Using hand and body movements to act out parts of the story" },
  { trait: "Clear sequencing", description: "Telling events in the order they happened so listeners can follow" },
  { trait: "Audience engagement", description: "Asking listeners questions like 'What do you think happened next?'" },
];

const OGRE_FEATURE_ITEMS: { text: string; bucket: string }[] = [
  { text: "A cunning ogre who threatens or tries to trick people", bucket: "Typical feature of an ogre narrative" },
  { text: "A clever hero who outwits the ogre using quick thinking", bucket: "Typical feature of an ogre narrative" },
  { text: "A moral lesson at the end of the story", bucket: "Typical feature of an ogre narrative" },
  { text: "A warning about the dangers of straying off alone or disobeying advice", bucket: "Typical feature of an ogre narrative" },
  { text: "A detailed weather forecast for the coming week", bucket: "Not typically found in an ogre narrative" },
  { text: "A shopping list for the local market", bucket: "Not typically found in an ogre narrative" },
];

const KATANA_STORY_STEPS: { id: string; label: string }[] = [
  { id: "warn", label: "Katana's mother warns him never to wander into the forest alone" },
  { id: "disobey", label: "Katana disobeys and wanders into the forest by himself" },
  { id: "meet", label: "A cunning ogre meets Katana and tries to trick him" },
  { id: "outwit", label: "Katana thinks quickly and tricks the ogre instead" },
  { id: "escape", label: "Katana escapes safely and learns to heed his mother's advice" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  {
    before: "A good storyteller changes their tone and pace to build",
    after: "at exciting moments in the story.",
    answer: "suspense",
  },
  {
    before: "In many ogre narratives, a clever hero manages to",
    after: "the ogre using quick thinking rather than strength.",
    answer: "outwit",
    accepted: ["outsmart", "trick"],
  },
  {
    before: "Ogre narratives are passed down from generation to generation to help preserve a community's",
    after: ".",
    answer: "culture",
  },
  {
    before: "In the story, Katana's mother warned him never to wander into the forest",
    after: ".",
    answer: "alone",
  },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Which of these best describes a good storyteller?",
    correct: "Someone who uses tone, gestures, and eye contact to keep listeners engaged",
    distractors: [
      "Someone who reads in a flat voice without looking up",
      "Someone who rushes through the story without pausing",
      "Someone who ignores the audience's reactions completely",
    ],
  },
  {
    q: "Why are ogre narratives important in many communities?",
    correct: "They preserve culture and teach moral lessons to younger generations",
    distractors: [
      "They are only meant to frighten young children",
      "They replace the need for any other kind of story",
      "They have no connection to a community's traditions",
    ],
  },
  {
    q: "In the story of Katana, what lesson does the ogre narrative teach?",
    correct: "That it is wise to heed a parent's warning and to think cleverly in danger",
    distractors: [
      "That greed always leads to great wealth",
      "That ogres are always kind and helpful",
      "That strength is more important than cleverness",
    ],
  },
  {
    q: "How can a storyteller make a storytelling session more captivating?",
    correct: "By varying their voice, using gestures, and involving the audience with questions",
    distractors: [
      "By speaking in a flat, unchanging voice throughout",
      "By avoiding all eye contact with listeners",
      "By skipping over important events in the story",
    ],
  },
  {
    q: "What typically happens to the ogre by the end of a traditional ogre narrative?",
    correct: "The clever hero outwits the ogre, teaching listeners a moral lesson",
    distractors: [
      "The ogre becomes the ruler of the village",
      "The story ends without any resolution",
      "The hero joins the ogre instead of escaping",
    ],
  },
];

export const musicOgreStorytelling: Skill = {
  id: "g8-il-ls-music",
  code: "LS.8",
  subjectId: "indigenous-language",
  strandId: "g8-il-listening-speaking",
  grade: 8,
  title: "Indigenous music: storytelling through an ogre narrative",
  description: "Explain the characteristics of a good storyteller and retell an ogre narrative that preserves community culture.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A captivating storyteller varies their voice, uses gestures, keeps events in order, and engages the audience with a moral lesson.";

    if (branch === "match") {
      const chosen = shuffle(rng, STORYTELLER_TRAITS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.trait, label: t.trait })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.trait, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.trait] = t.trait;
      return {
        kind: "click-match",
        prompt: "Match each characteristic of a good storyteller to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.trait} — ${t.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, OGRE_FEATURE_ITEMS);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `o${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`o${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each item into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "Ogre narratives typically feature a cunning ogre, a clever hero, and a moral lesson.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, KATANA_STORY_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the events of the ogre narrative about Katana in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: KATANA_STORY_STEPS.map((s) => s.id),
        hint: "The story begins with a warning, then disobedience, meeting the ogre, outwitting it, and finally escaping safely.",
        explanation: KATANA_STORY_STEPS.map((s) => s.label).join(" → "),
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
