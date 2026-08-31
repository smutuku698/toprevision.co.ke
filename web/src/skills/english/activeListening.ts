import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const GOOD = [
  "Maintaining eye contact with the speaker",
  "Nodding to show you understand",
  "Paraphrasing what the speaker said",
  "Asking clarifying questions",
  "Waiting for the speaker to finish before responding",
  "Taking brief notes on key points",
];

const POOR = [
  "Interrupting the speaker frequently",
  "Checking your phone while someone is talking",
  "Planning your reply instead of listening",
  "Looking around the room instead of at the speaker",
  "Finishing the speaker's sentences for them",
  "Changing the subject abruptly",
];

export const activeListening: Skill = {
  id: "eng-ls-active-listening",
  code: "LS.2",
  subjectId: "english",
  strandId: "eng-listening-speaking",
  grade: 9,
  title: "Active listening habits",
  description: "Sort behaviors into good and poor active listening habits.",
  generate(rng) {
    const hint = "Good listening habits focus attention on the speaker; poor ones focus attention elsewhere.";

    if (rng() < 0.5) {
      const pool = [
        ...GOOD.map((label) => ({ label, category: "Good listening habit" })),
        ...POOR.map((label) => ({ label, category: "Poor listening habit" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Good listening habit", "Poor listening habit"]);

      return {
        kind: "multiple-choice",
        prompt: `Is this a good listening habit or a poor listening habit: "${target.label}"?`,
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
      prompt: "Sort each behavior into Good listening habit or Poor listening habit.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "good", label: "Good listening habit" },
        { id: "poor", label: "Poor listening habit" },
      ],
      correctBucket,
      hint: "Good listening habits focus attention on the speaker; poor ones focus attention elsewhere.",
      explanation: `Good habits: ${good.join(" / ")}. Poor habits: ${poor.join(" / ")}.`,
    };
  },
};
