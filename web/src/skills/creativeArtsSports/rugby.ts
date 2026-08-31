import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TYPES = [
  { label: "Spin pass", bucket: "pass", reason: "A spin pass is a type of pass in rugby, thrown with a spiral rotation for accuracy over distance." },
  { label: "Pop pass", bucket: "pass", reason: "A pop pass is a type of pass in rugby — a short, soft pass usually to a nearby teammate." },
  { label: "Basic pass", bucket: "pass", reason: "A basic pass is the fundamental sideways or backward pass used to move the ball along the line in rugby." },
  { label: "Place kick", bucket: "kick", reason: "A place kick is a type of kick in rugby where the ball is kicked from a stationary position on the ground." },
  { label: "Drop kick", bucket: "kick", reason: "A drop kick is a type of kick in rugby where the ball is dropped and kicked just as it bounces off the ground." },
];

const ADVANCE_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "In rugby, in which direction must the ball be passed by hand?",
    correct: "Sideways or backward, never forward",
    distractors: ["Only forward", "In any direction", "Only overhead"],
  },
  {
    q: "What are the two main ways a team can advance the ball in rugby, other than running with it?",
    correct: "Passing and kicking",
    distractors: ["Passing and tackling", "Kicking and scrumming only", "Throwing and heading"],
  },
  {
    q: "Which pass would a player use for a short, quick exchange with a nearby teammate running alongside?",
    correct: "A pop pass",
    distractors: ["A spin pass", "A place kick", "A drop kick"],
  },
  {
    q: "Which kick is typically used to restart or score after a try, from a stationary position?",
    correct: "A place kick",
    distractors: ["A drop kick", "A spin pass", "A pop pass"],
  },
];

const CLASSIFY_PROMPTS = [
  "Sort each Rugby skill into Pass or Kick.",
  "Decide whether each Rugby skill below is a pass or a kick, and sort it.",
  "Classify each of these Rugby skills as Pass or Kick.",
  "Which of these Rugby skills are passes, and which are kicks? Sort them.",
  "Sort each Rugby technique into Pass or Kick.",
] as const;

export const rugby: Skill = {
  id: "cas-rugby",
  code: "C.5",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Rugby",
  description: "Distinguish types of passes and kicks used to advance the ball in Rugby.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "advance"] as const);

    if (branch === "classify") {
      const ordered = shuffle(rng, TYPES);
      const items = ordered.map((t) => ({ id: t.label, label: t.label }));
      const correctBucket: Record<string, string> = {};
      for (const t of ordered) correctBucket[t.label] = t.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CLASSIFY_PROMPTS),
        items,
        buckets: [
          { id: "pass", label: "Pass" },
          { id: "kick", label: "Kick" },
        ],
        correctBucket,
        hint: "A pass is thrown by hand; a kick is struck with the foot.",
        explanation: TYPES.map((t) => t.reason).join(" "),
      };
    }

    const q = randChoice(rng, ADVANCE_QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "A rugby team advances the ball by running, passing backward/sideways, or kicking.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
