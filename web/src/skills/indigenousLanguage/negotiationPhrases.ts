import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POLITE = [
  "Excuse me, may I add something here?",
  "Sorry to interrupt, but could I ask a quick question?",
  "If I may, I'd like to raise a point.",
  "Pardon me, may I come in on that?",
  "Could I just clarify something before you continue?",
  "I don't mean to cut in, but this is important.",
];

const RUDE = [
  "Stop talking, it's my turn now!",
  "That's wrong, be quiet.",
  "Whatever, just let me speak.",
  "I don't care what you think.",
  "Hurry up, you're wasting time.",
  "That doesn't matter, move on.",
];

export const negotiationPhrases: Skill = {
  id: "il-ls-negotiation-phrases",
  code: "LS.4",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "Safety in public places: negotiation and turn-taking",
  description: "Recognize polite ways to interrupt and take turns during a conversation or negotiation.",
  generate(rng) {
    const hint = "Polite interruptions acknowledge the other speaker (excuse me, pardon, if I may) before making a point.";

    if (rng() < 0.5) {
      const pool = [
        ...POLITE.map((label) => ({ label, category: "Polite interruption" })),
        ...RUDE.map((label) => ({ label, category: "Rude interruption" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Polite interruption", "Rude interruption"]);

      return {
        kind: "multiple-choice",
        prompt: `Is this a polite or a rude way to interrupt during a conversation: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" is a ${target.category.toLowerCase()}.`,
      };
    }

    const polite = shuffle(rng, POLITE).slice(0, 3);
    const rude = shuffle(rng, RUDE).slice(0, 3);
    const items = shuffle(rng, [
      ...polite.map((label) => ({ id: label, label, bucket: "polite" })),
      ...rude.map((label) => ({ id: label, label, bucket: "rude" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each phrase into Polite interruption or Rude interruption.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "polite", label: "Polite interruption" },
        { id: "rude", label: "Rude interruption" },
      ],
      correctBucket,
      hint,
      explanation: `Polite: ${polite.join(" / ")}. Rude: ${rude.join(" / ")}.`,
    };
  },
};
