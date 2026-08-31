import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const INFORMAL = [
  "Hey there!",
  "Can't wait to see you!",
  "Thanks a ton!",
  "Gonna be late.",
  "What's up?",
  "See ya later!",
  "That's awesome!",
  "No worries!",
  "Give me a shout.",
  "Catch you later.",
];

const FORMAL = [
  "Dear Sir/Madam,",
  "I would be grateful if you could assist me.",
  "Thank you very much for your assistance.",
  "I regret to inform you that I will be unable to attend.",
  "I look forward to your response.",
  "Please do not hesitate to contact me.",
  "Yours faithfully,",
  "I am writing to inquire about your services.",
  "Kindly confirm your availability.",
  "I appreciate your prompt attention to this matter.",
];

export const formalInformal: Skill = {
  id: "eng-w-formal-informal",
  code: "W.2",
  subjectId: "english",
  strandId: "eng-writing",
  grade: 9,
  title: "Formal vs. informal language",
  description: "Sort phrases into formal (letters, emails) and informal (chats with friends) language.",
  generate(rng) {
    const hint = "Formal language avoids contractions and slang — it's used in letters, emails, and official writing.";

    if (rng() < 0.5) {
      const pool = [
        ...FORMAL.map((label) => ({ label, category: "Formal" })),
        ...INFORMAL.map((label) => ({ label, category: "Informal" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Formal", "Informal"]);

      return {
        kind: "multiple-choice",
        prompt: `Is this phrase formal or informal: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" is ${target.category.toLowerCase()}.`,
      };
    }

    const formal = shuffle(rng, FORMAL).slice(0, 3);
    const informal = shuffle(rng, INFORMAL).slice(0, 3);
    const items = shuffle(rng, [
      ...formal.map((label) => ({ id: label, label, bucket: "formal" })),
      ...informal.map((label) => ({ id: label, label, bucket: "informal" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each phrase into Formal or Informal language.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "formal", label: "Formal" },
        { id: "informal", label: "Informal" },
      ],
      correctBucket,
      hint: "Formal language avoids contractions and slang — it's used in letters, emails, and official writing.",
      explanation: `Formal: ${formal.join(" / ")}. Informal: ${informal.join(" / ")}.`,
    };
  },
};
