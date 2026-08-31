import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GOOD = [
  "Changing the tone of voice for different characters",
  "Making eye contact and reacting to the audience",
  "Using pauses to build suspense at key moments",
  "Involving the audience with a call-and-response song",
  "Using gestures to show actions in the story",
  "Building up to a clear, memorable ending",
];

const POOR = [
  "Speaking in one flat tone the whole time",
  "Rushing through the story without pausing",
  "Ignoring the audience's reactions completely",
  "Forgetting key details and losing the plot",
  "Reading the story silently instead of telling it aloud",
  "Ending abruptly without any resolution",
];

export const storytellingLegends: Skill = {
  id: "il-ls-storytelling-legends",
  code: "LS.8",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "Indigenous literature: characteristics of a good storyteller",
  description: "Sort storytelling techniques into effective and ineffective habits for retelling a legend.",
  generate(rng) {
    const hint = "A good storyteller keeps the audience engaged with voice, pauses, gestures, and eye contact.";

    if (rng() < 0.5) {
      const pool = [
        ...GOOD.map((label) => ({ label, category: "Good storytelling technique" })),
        ...POOR.map((label) => ({ label, category: "Poor storytelling technique" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Good storytelling technique", "Poor storytelling technique"]);

      return {
        kind: "multiple-choice",
        prompt: `Is this a good or poor storytelling technique: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" is a ${target.category.toLowerCase()}.`,
      };
    }

    const good = shuffle(rng, GOOD).slice(0, 3);
    const poor = shuffle(rng, POOR).slice(0, 3);
    const items = shuffle(rng, [
      ...good.map((label) => ({ id: label, label, bucket: "good" })),
      ...poor.map((label) => ({ id: label, label, bucket: "poor" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each technique into Good storytelling or Poor storytelling.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "good", label: "Good storytelling" },
        { id: "poor", label: "Poor storytelling" },
      ],
      correctBucket,
      hint,
      explanation: `Good: ${good.join(" / ")}. Poor: ${poor.join(" / ")}.`,
    };
  },
};
