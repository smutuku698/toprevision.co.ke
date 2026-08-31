import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SKILLS_BANK = [
  { label: "Overhead pass", bucket: "passes" },
  { label: "Chest pass", bucket: "passes" },
  { label: "Landing", bucket: "footwork" },
  { label: "Pivoting", bucket: "footwork" },
  { label: "Dodging", bucket: "dodging-marking" },
  { label: "Marking", bucket: "dodging-marking" },
] as const;

const BUCKET_LABEL: Record<string, string> = { passes: "Pass", footwork: "Footwork skill", "dodging-marking": "Dodging & marking skill" };

const TERMS = [
  { id: "overhead", label: "Overhead pass", meaning: "Ball released from above the head with both hands, useful for passing over a defender" },
  { id: "chest", label: "Chest pass", meaning: "Ball pushed out from chest height with both hands, for a fast, accurate short pass" },
  { id: "landing", label: "Landing", meaning: "Controlling the body's balance immediately after catching the ball while airborne" },
  { id: "pivoting", label: "Pivoting", meaning: "Turning on one grounded foot while the other foot moves, to change the direction you are facing" },
  { id: "dodging", label: "Dodging", meaning: "A sudden change of direction or speed used to lose a marking defender" },
  { id: "marking", label: "Marking", meaning: "Staying close to an opponent to prevent them from receiving a pass or shooting" },
];

const CHEST_PASS_STEPS = [
  { id: "grip", label: "Grip the ball with both hands at chest height, fingers spread around it" },
  { id: "step", label: "Step towards the target with one foot" },
  { id: "push", label: "Push the ball forward, extending both arms fully" },
  { id: "follow", label: "Follow through with the hands and fingers pointing towards the target" },
  { id: "receive", label: "The receiver catches the ball and lands with balance and control" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "How is an overhead pass executed in Netball?", correct: "The ball is released from above the head with both hands", distractors: ["The ball is bounced once before release", "The ball is pushed only with one hand from the hip", "The ball is thrown underarm from waist height"] },
  { q: "How is a chest pass executed in Netball?", correct: "The ball is pushed out from chest height using both hands", distractors: ["The ball is thrown overhead with one hand", "The ball is rolled along the ground", "The ball is bounced to a teammate from above the head"] },
  { q: "What footwork options does a player have immediately after landing with the ball in Netball?", correct: "They can pivot on their landing foot, or pass or shoot before taking a second step", distractors: ["They must always take at least two more full steps", "They may run freely in any direction with the ball", "They must immediately sit down"] },
  { q: "Why is dodging an important skill in a game of Netball?", correct: "It helps an attacking player lose their marking defender and get free to receive a pass", distractors: ["It has no effect on receiving a pass", "It is only useful for goal shooters, never other positions", "It is a defensive skill, not an attacking one"] },
  { q: "What is the purpose of marking a player in Netball?", correct: "To stay close to an opponent so they cannot easily receive a pass or shoot", distractors: ["To physically block the opponent from moving at all", "To help the opponent's team score", "To signal the umpire for a foul"] },
  { q: "Why does teamwork matter when applying passing and footwork skills in a Netball game?", correct: "Coordinated movement and accurate passing help the team keep possession and create scoring chances", distractors: ["Teamwork has no effect on how well passes work", "Passing is always more effective without any teammate coordination", "Only the goal shooter's skill affects the outcome of a game"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each Netball skill into Pass, Footwork skill, or Dodging & marking skill.",
  "Which category does each Netball skill below belong to? Sort them.",
  "Classify each Netball skill into its correct category.",
  "Decide which category each skill fits, and sort it.",
  "Sort these Netball skills by the category they belong to.",
] as const;

const MATCH_PROMPTS = [
  "Match each Netball skill to how it is executed.",
  "Pair each skill below with how it is performed.",
  "Match each skill to its correct description.",
  "Connect each Netball skill to how it is executed.",
  "For each skill below, choose its matching description.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the correct order for executing a chest pass in Netball.",
  "Put these chest pass steps in the order they occur.",
  "Order these chest pass steps, from first to last.",
  "Sort these steps into the correct sequence for a chest pass.",
  "Place these chest pass steps in the order you would perform them.",
] as const;

export const netball: Skill = {
  id: "g8-cas-netball",
  code: "C.5",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Netball",
  description: "Overhead and chest passes, footwork after landing and pivoting, and dodging and marking.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "chest-pass-order", "theory-mc"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, SKILLS_BANK);
      const correctBucket: Record<string, string> = {};
      for (const s of items) correctBucket[s.label] = s.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((s) => ({ id: s.label, label: s.label })),
        buckets: [
          { id: "passes", label: BUCKET_LABEL.passes },
          { id: "footwork", label: BUCKET_LABEL.footwork },
          { id: "dodging-marking", label: BUCKET_LABEL["dodging-marking"] },
        ],
        correctBucket,
        hint: "Passes move the ball; footwork controls the body; dodging and marking are about losing or staying with an opponent.",
        explanation: items.map((s) => `${s.label} is a ${BUCKET_LABEL[s.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "terms-match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Overhead and chest passes differ in hand position; dodging loses a defender, marking stays close to one.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "chest-pass-order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, CHEST_PASS_STEPS),
        correctOrder: CHEST_PASS_STEPS.map((s) => s.id),
        hint: "Grip and stance come first, then the push and follow-through, then the receiver's landing.",
        explanation: `The order is: ${CHEST_PASS_STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Overhead and chest passes are executed differently; dodging helps attackers, marking helps defenders.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
