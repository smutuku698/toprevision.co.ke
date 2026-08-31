import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "It was 1962, a decade before Kaguru's village had ever seen electricity, when a young teacher named Mr. Owuor arrived carrying a strange wooden box with wires. He set it on a stool outside the mud-walled school and connected it to two large batteries. That evening, as the sun sank behind the hills, he switched it on, and a crackling voice filled the air — a radio, broadcasting news from the capital. The elders gathered in stunned silence, some stepping back in fear, others leaning closer in wonder. Children who had never heard a voice without a body pressed forward to peer behind the box, searching for the hidden speaker. Mr. Owuor laughed gently and explained how sound could travel invisibly through the air on waves no eye could see. By the time the broadcast ended, old Mzee Ratemo declared that the world was changing faster than the rains, and that Kaguru would never be quite the same again.";

const EPISODES = [
  { id: "arrive", label: "Mr. Owuor arrives in the village carrying the wooden box with wires" },
  { id: "connect", label: "He sets the box on a stool and connects it to two batteries" },
  { id: "switch", label: "As the sun sets, he switches the box on" },
  { id: "voice", label: "A crackling voice fills the air, broadcasting news from the capital" },
  { id: "react", label: "Elders step back in fear while children press forward in wonder" },
  { id: "explain", label: "Mr. Owuor explains how sound travels invisibly through the air" },
  { id: "declare", label: "Mzee Ratemo declares that the world is changing and Kaguru will never be the same" },
];

const SETTING_CLUES: { text: string; category: "time" | "place" }[] = [
  { text: "It was 1962, a decade before the village had ever seen electricity", category: "time" },
  { text: "outside the mud-walled school", category: "place" },
  { text: "That evening, as the sun sank behind the hills", category: "time" },
  { text: "in Kaguru's village", category: "place" },
  { text: "connected it to two large batteries (since there was no power line)", category: "place" },
  { text: "By the time the broadcast ended", category: "time" },
];

const COMPARE_PAIRS: { then: string; now: string }[] = [
  { then: "Villagers had never heard a voice without a body", now: "Today, radios and phones playing voices are common household items" },
  { then: "The radio was powered by two large batteries", now: "Today, most devices connect directly to an electricity supply" },
  { then: "Children searched behind the box for a hidden speaker", now: "Today, children learn how radios and speakers work early in school" },
  { then: "Mr. Owuor had to personally explain how sound travels through the air", now: "Today, this kind of information is easy to find and widely known" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "In what time period is this story set?",
    correct: "1962, before the village had electricity",
    distractors: ["The present day, with electricity already installed", "A time far in the future", "During the rainy season of an unspecified year"],
    explanation: "The story opens with 'It was 1962, a decade before Kaguru's village had ever seen electricity,' clearly stating the time period.",
  },
  {
    q: "Where does this story take place?",
    correct: "Outside a mud-walled school in the village of Kaguru",
    distractors: ["Inside a large city radio station", "On a hilltop far from any village", "Inside a modern classroom with electricity"],
    explanation: "The passage states Mr. Owuor 'set it on a stool outside the mud-walled school' in Kaguru's village.",
  },
  {
    q: "What does Mzee Ratemo's closing comment suggest about how the village viewed this moment?",
    correct: "Change was arriving faster than the village was used to, and it would reshape daily life",
    distractors: ["The village had already experienced this kind of change many times before", "Mzee Ratemo believed nothing about the village would change", "The village rejected the new technology completely"],
    explanation: "Mzee Ratemo declares 'the world was changing faster than the rains, and that Kaguru would never be quite the same again,' showing this was a striking, unfamiliar shift for the village — an inference from his words, not a stated fact.",
  },
];

export const shortStorySetting: Skill = {
  id: "g8-eng-r-short-story-setting",
  code: "R.4",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Story - Setting (Class Reader)",
  description: "Identify the time and place setting of a short story, order its episodes chronologically, and appreciate differences in culture and setting.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "mc"] as const);
    const hint = "Look for clues about when and where the story happens, and how that setting shapes what the characters experience.";

    if (branch === "order") {
      const items = shuffle(rng, EPISODES);
      return {
        kind: "ordering",
        prompt: "Arrange the episodes of the story in chronological order.",
        instruction: "Click them in order.",
        passage: STORY,
        items,
        correctOrder: EPISODES.map((e) => e.id),
        hint: "The story moves from Mr. Owuor's arrival, through switching on the radio, to the villagers' reactions and Mzee Ratemo's closing remark.",
        explanation: EPISODES.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SETTING_CLUES);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each detail from the story as a clue about Time or a clue about Place.",
        passage: STORY,
        items,
        buckets: [
          { id: "time", label: "Time clue" },
          { id: "place", label: "Place clue" },
        ],
        correctBucket,
        hint: "Time clues tell you when something happens; place clues tell you where.",
        explanation: chosen.map((c) => `"${c.text}" is a ${c.category === "time" ? "time" : "place"} clue.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, COMPARE_PAIRS.map((p, i) => ({ id: `t${i}`, label: p.then })));
      const targets = shuffle(rng, COMPARE_PAIRS.map((p, i) => ({ id: `t${i}`, label: p.now })));
      const correctMap: Record<string, string> = {};
      COMPARE_PAIRS.forEach((_, i) => (correctMap[`t${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each detail from the story's setting to how that situation is different today.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint: "Think about how the village's experience of new technology in 1962 compares with how familiar such technology is today.",
        explanation: COMPARE_PAIRS.map((p) => `"${p.then}" — ${p.now}.`).join(" "),
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
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
