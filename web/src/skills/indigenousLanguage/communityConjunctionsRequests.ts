import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CONJUNCTION_SENTENCES: { before: string; conjunction: string; after: string; distractors: string[] }[] = [
  { before: "I wanted to help clean the community library,", conjunction: "so", after: "I volunteered on Saturday.", distractors: ["book", "volunteer", "quickly"] },
  { before: "The volunteers were tired,", conjunction: "but", after: "they finished planting all the trees.", distractors: ["tired", "trees", "today"] },
  { before: "We collected clothes for the shelter", conjunction: "because", after: "many families needed warm clothing.", distractors: ["shelter", "clothing", "families"] },
  { before: "She joined the community clean-up", conjunction: "and", after: "helped sort the recycling.", distractors: ["community", "recycling", "carefully"] },
  { before: "Few people showed up,", conjunction: "although", after: "the notice was posted a week early.", distractors: ["notice", "week", "posted"] },
];

const POLITE = [
  "Excuse me, could you help me find a book on first aid?",
  "Would you mind showing me where the volunteer sign-up sheet is?",
  "May I ask how I can join the community clean-up?",
  "Thank you for your time, could you explain the library rules?",
  "Please could you tell me when the next community meeting is?",
  "I'd appreciate it if you could point me to the donation box.",
];

const IMPOLITE = [
  "Where's the book, hurry up!",
  "Just tell me now, I don't have time.",
  "You should already know the answer to that.",
  "Give me the sign-up sheet, now.",
  "Why is this taking so long?",
  "I don't want to wait, just do it.",
];

export const communityConjunctionsRequests: Skill = {
  id: "il-ls-community-conjunctions-requests",
  code: "LS.3",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "Serving the community: conjunctions and polite requests",
  description: "Choose the conjunction that completes a sentence about community service, and sort polite from impolite requests for help.",
  generate(rng) {
    if (rng() < 0.5) {
      const entry = randChoice(rng, CONJUNCTION_SENTENCES);
      const choices = shuffle(rng, [entry.conjunction, ...entry.distractors]);

      return {
        kind: "multiple-choice",
        prompt: "Which conjunction correctly completes this sentence?",
        choices,
        correctIndex: choices.indexOf(entry.conjunction),
        layout: "row",
        hint: "A conjunction joins two ideas — look at whether the second idea agrees with, contrasts with, or explains the first.",
        explanation: `"${entry.conjunction}" fits: "${entry.before} ${entry.conjunction} ${entry.after}"`,
      };
    }

    const polite = shuffle(rng, POLITE).slice(0, 3);
    const impolite = shuffle(rng, IMPOLITE).slice(0, 3);
    const items = shuffle(rng, [
      ...polite.map((label) => ({ id: label, label, bucket: "polite" })),
      ...impolite.map((label) => ({ id: label, label, bucket: "impolite" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each request for help as Polite or Impolite.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "polite", label: "Polite" },
        { id: "impolite", label: "Impolite" },
      ],
      correctBucket,
      hint: "Polite requests soften the ask with words like 'excuse me', 'could you', 'would you mind', or 'please'.",
      explanation: `Polite: ${polite.join(" / ")}. Impolite: ${impolite.join(" / ")}.`,
    };
  },
};
