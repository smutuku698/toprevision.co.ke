import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TYPES = [
  { label: "Overhead pass", bucket: "pass", reason: "An overhead pass is thrown from above the head, useful for passing over a defender." },
  { label: "Bounce pass", bucket: "pass", reason: "A bounce pass is thrown so it bounces once on the floor before reaching a teammate, useful for passing under a defender's arms." },
  { label: "Chest pass", bucket: "pass", reason: "A chest pass is thrown quickly from chest height directly to a teammate's chest." },
  { label: "High dribble", bucket: "dribble", reason: "A high dribble bounces the ball around waist height, used for moving quickly in open space." },
  { label: "Low dribble", bucket: "dribble", reason: "A low dribble bounces the ball close to the ground, used for tighter ball control near a defender." },
];

const LOGO_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main purpose of designing a logo for a basketball team?",
    correct: "To create a recognisable visual identity that represents the team",
    distractors: ["To make the ball bounce higher", "To replace the need for a team name", "To slow down the opposing team"],
  },
  {
    q: "Which quality makes a logo design effective?",
    correct: "It is simple, memorable, and clearly represents what it stands for",
    distractors: ["It uses as many colours and details as possible", "It is only readable up close", "It changes meaning every time it is viewed"],
  },
  {
    q: "How can a poster or logo be made an effective means of communication?",
    correct: "By using clear images, bold text, and a simple layout that quickly conveys the message",
    distractors: ["By filling every space with small text", "By using no images at all", "By making the message as complicated as possible"],
  },
  {
    q: "Why is it important to combine passing and dribbling in Basketball?",
    correct: "It keeps the ball moving and creates scoring opportunities while making it harder for defenders to predict play",
    distractors: ["It has no tactical benefit", "It slows the game down unnecessarily", "Only one skill is ever needed, not both"],
  },
];

const CLASSIFY_PROMPTS = [
  "Sort each Basketball skill into Pass or Dribble.",
  "Decide whether each Basketball skill below is a pass or a dribble, and sort it.",
  "Classify each of these Basketball skills as Pass or Dribble.",
  "Which of these Basketball skills are passes, and which are dribbles? Sort them.",
  "Sort each Basketball technique into Pass or Dribble.",
] as const;

export const basketballLogo: Skill = {
  id: "cas-basketball-logo",
  code: "C.9",
  subjectId: "creative-arts-sports",
  strandId: "cas-creating-performing",
  grade: 9,
  title: "Basketball and Logo Design",
  description: "Types of passes and dribbling in Basketball, and principles of effective logo design.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "logo"] as const);

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
          { id: "dribble", label: "Dribble" },
        ],
        correctBucket,
        hint: "A pass sends the ball to a teammate; a dribble bounces the ball while a player moves with it.",
        explanation: TYPES.map((t) => t.reason).join(" "),
      };
    }

    const q = randChoice(rng, LOGO_QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "An effective logo or poster communicates its message clearly and simply at a glance.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
