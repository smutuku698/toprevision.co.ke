import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STATEMENTS: { label: string; bucket: "serve" | "volley" }[] = [
  { label: "Ball tossed upward before being struck with an open palm", bucket: "serve" },
  { label: "Struck from behind the end line to send the ball over the net to start a rally", bucket: "serve" },
  { label: "Hit using the fingertips of both hands above the head", bucket: "volley" },
  { label: "Used to keep the ball in play and set it up for a teammate", bucket: "volley" },
];

const TERMS = [
  { id: "overarm-serve", label: "Overarm serve", meaning: "A serve where the ball is tossed up and struck with an open palm above the head, from behind the end line" },
  { id: "toss", label: "Toss", meaning: "Releasing the ball upward with the non-hitting hand before striking it" },
  { id: "contact-point", label: "Contact point", meaning: "The spot where the hand meets the ball, ideally slightly in front of and above the hitting shoulder" },
  { id: "volleying", label: "Volleying", meaning: "Hitting the ball with the fingertips of both hands above the head, to keep it in play or set it up for a teammate" },
  { id: "follow-through", label: "Follow-through", meaning: "Continuing the arm's motion after contact, to add control and power to the shot" },
];

const SERVE_STEPS = [
  { id: "stance", label: "Stand facing the net, ball held in the non-hitting hand" },
  { id: "toss", label: "Toss the ball upward in front of the hitting shoulder" },
  { id: "draw-back", label: "Draw the hitting arm back, ready to strike" },
  { id: "strike", label: "Strike the ball with an open palm above the head" },
  { id: "follow-through", label: "Follow through with the hitting arm" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "How can you identify an overarm serve in a game of Volleyball?", correct: "The ball is tossed up and struck with an open palm above the head, from behind the end line", distractors: ["The ball is rolled along the ground to a teammate", "The ball is struck from below the waist with a closed fist", "The ball is thrown by hand directly over the net"] },
  { q: "How is the volleying skill performed in Volleyball?", correct: "By hitting the ball upward with the fingertips of both hands, above the head", distractors: ["By catching and throwing the ball with both hands", "By kicking the ball with the foot", "By striking the ball only with one closed fist"] },
  { q: "Why does the volley pass make a game of Volleyball more interesting?", correct: "It keeps rallies going by controlling the ball precisely and setting up attacking shots", distractors: ["It ends the rally immediately every time it is used", "It has no effect on how the game is played", "It is only used at the very start of a match"] },
  { q: "What does 'appraising' a teammate's serving or volleying effort mean?", correct: "Giving fair, constructive feedback on how well the skill was performed", distractors: ["Ignoring how the skill was performed", "Only criticising mistakes without any positive feedback", "Replacing the teammate immediately"] },
  { q: "What is the 'contact point' when serving overarm?", correct: "The spot, slightly in front of and above the hitting shoulder, where the hand meets the ball", distractors: ["The point where the ball lands on the opponent's side", "The exact centre of the court", "The point where the ball crosses the net"] },
];

const CATEGORIZE_PROMPTS = [
  "Sort each description into Overarm serve or Volleying.",
  "Which category does each description below belong to? Sort them.",
  "Classify each description as Overarm serve or Volleying.",
  "Decide whether each description is the serve or the volley, and sort it.",
  "Sort these descriptions by which skill they describe.",
] as const;

const MATCH_PROMPTS = [
  "Match each Volleyball term to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each Volleyball term to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the correct order for executing an overarm serve in Volleyball.",
  "Put these overarm serve steps in the order they occur.",
  "Order these steps, from first to last.",
  "Sort these steps into the correct sequence for an overarm serve.",
  "Place these overarm serve steps in the order you would perform them.",
] as const;

export const volleyball: Skill = {
  id: "g8-cas-volleyball",
  code: "C.9",
  subjectId: "creative-arts-sports",
  strandId: "g8-cas-creating-performing",
  grade: 8,
  title: "Volleyball",
  description: "Identifying and executing the overarm serve, the volleying skill, and appraising performance.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "terms-match", "serve-order", "theory-mc"] as const);

    if (branch === "categorize") {
      const items = shuffle(rng, STATEMENTS);
      const correctBucket: Record<string, string> = {};
      for (const s of items) correctBucket[s.label] = s.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((s) => ({ id: s.label, label: s.label })),
        buckets: [
          { id: "serve", label: "Overarm serve" },
          { id: "volley", label: "Volleying" },
        ],
        correctBucket,
        hint: "The serve starts the rally from behind the end line; volleying keeps the ball in play during the rally.",
        explanation: items.map((s) => `"${s.label}" describes ${s.bucket === "serve" ? "the overarm serve" : "volleying"}.`).join(" "),
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
        hint: "The toss happens before contact; the follow-through happens after it.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "serve-order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, SERVE_STEPS),
        correctOrder: SERVE_STEPS.map((s) => s.id),
        hint: "The ball must be tossed before it can be struck, and struck before the arm follows through.",
        explanation: `The order is: ${SERVE_STEPS.map((s) => s.label).join(" → ")}.`,
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
      hint: "The overarm serve starts the rally; volleying keeps it going.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
