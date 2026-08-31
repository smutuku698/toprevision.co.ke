import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Larks head knot", bucket: "knot", reason: "The larks head knot is one of the 4 basic macrame knots used to weave a handball goal net." },
  { label: "Half hitch knot", bucket: "knot", reason: "The half hitch knot is one of the 4 basic macrame knots used to weave a handball goal net." },
  { label: "Square knot", bucket: "knot", reason: "The square knot is one of the 4 basic macrame knots used to weave a handball goal net." },
  { label: "Spiral/half knot", bucket: "knot", reason: "The spiral/half knot is one of the 4 basic macrame knots used to weave a handball goal net." },
  { label: "Side pass", bucket: "pass", reason: "The side pass is one of the 3 named passing skills in handball." },
  { label: "Jump pass", bucket: "pass", reason: "The jump pass is one of the 3 named passing skills in handball." },
  { label: "Flick pass", bucket: "pass", reason: "The flick pass is one of the 3 named passing skills in handball." },
  { label: "High dribble", bucket: "skill", reason: "High dribbling is one of the dribbling variants practised in handball." },
  { label: "Low dribble", bucket: "skill", reason: "Low dribbling is one of the dribbling variants practised in handball." },
  { label: "Jump shot", bucket: "skill", reason: "The jump shot is a shooting skill practised in handball, using drills." },
];

const BUCKET_LABEL: Record<string, string> = {
  knot: "Macrame knot used to weave the net",
  pass: "Handball passing skill",
  skill: "Handball dribbling/shooting skill",
};

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "A player needs to change the ball's direction sideways with a short, quick motion, without a big backswing. Which pass fits this description best?", correct: "Side pass", distractors: ["Jump pass", "Flick pass", "Jump shot"] },
  { q: "A player releases the ball while airborne, having jumped to gain height over a defender. Which pass is this?", correct: "Jump pass", distractors: ["Side pass", "Flick pass", "High dribble"] },
  { q: "A player uses a quick wrist motion to send the ball a short distance to a nearby teammate. Which pass is this?", correct: "Flick pass", distractors: ["Jump pass", "Side pass", "Low dribble"] },
  { q: "A defender is closely marking the ball, so the attacker keeps the ball close to the ground while moving. Which dribbling type is this?", correct: "Low dribble", distractors: ["High dribble", "Jump pass", "Jump shot"] },
  { q: "A player dribbles the ball at chest height while moving quickly across open space. Which dribbling type is this?", correct: "High dribble", distractors: ["Low dribble", "Side pass", "Flick pass"] },
  { q: "A player jumps into the air before shooting toward the goal to get past a defender's reach. Which skill is this?", correct: "Jump shot", distractors: ["Side pass", "Low dribble", "Flick pass"] },
  { q: "Which macrame knot is typically used first, to attach cord to the frame when starting to weave a net?", correct: "Larks head knot", distractors: ["Half hitch knot", "Square knot", "Spiral/half knot"] },
  { q: "Which macrame knot is created by tying a series of half hitches, often used for a twisting effect in weaving?", correct: "Half hitch knot", distractors: ["Larks head knot", "Square knot", "Spiral/half knot"] },
  { q: "Which macrame knot is commonly used to create a flat, secure section of a woven net?", correct: "Square knot", distractors: ["Larks head knot", "Half hitch knot", "Spiral/half knot"] },
  { q: "Which macrame knot naturally twists into a spiral shape as it is repeated?", correct: "Spiral/half knot", distractors: ["Larks head knot", "Half hitch knot", "Square knot"] },
  { q: "According to the design's key inquiry question, how does playing handball enhance health?", correct: "Through physical activity that builds fitness, coordination, and teamwork", distractors: ["Only by teaching macrame knot-tying skills", "Handball has no effect on health, only on entertainment", "Only by improving eyesight for reading fingering charts"] },
  { q: "What should the net's finishing observe, once a handball goal net has been woven?", correct: "The knots used, the size of the net, and a neat finish", distractors: ["Only the colour of the cord used", "Only how quickly it was woven", "Nothing — finishing quality does not matter for a goal net"] },
];

// Condensed from the design's own "Suggested Learning Experiences" sequence for this
// sub-strand: knots are learned and practised, then the net is woven and fixed, then
// game skills are learned, then applied together in a mini game.
const UNIT_STAGES: { id: string; label: string }[] = [
  { id: "observe-knots", label: "Observe demonstrations of the 4 basic macrame knots" },
  { id: "practise-knots", label: "Practise tying the knots" },
  { id: "weave-net", label: "Weave the goal net and fix it onto the goal posts" },
  { id: "learn-skills", label: "Watch demonstrations of passing, dribbling, and shooting" },
  { id: "mini-game", label: "Apply passing, dribbling, and shooting skills in a mini game" },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "The macrame knot typically used first, to attach cord to the frame, is the ___ ___ knot.", after: "", answers: ["larks head", "Larks head"], explanation: "The larks head knot is typically used first to attach cord to the frame." },
  { before: "The macrame knot made by tying a series of half hitches is called the ___ ___ knot.", after: "", answers: ["half hitch", "Half hitch"], explanation: "The half hitch knot is made by tying a series of half hitches." },
  { before: "The macrame knot commonly used to create a flat, secure section of a net is the ___ knot.", after: "", answers: ["square", "Square"], explanation: "The square knot creates a flat, secure section." },
  { before: "The macrame knot that naturally twists as it is repeated is the ___/half knot.", after: "", answers: ["spiral", "Spiral"], explanation: "The spiral/half knot naturally twists as it is repeated." },
  { before: "A pass with a short, quick sideways motion and no big backswing is called a ___ pass.", after: "", answers: ["side", "Side"], explanation: "The side pass is a short, quick sideways pass." },
  { before: "A pass released while the player is airborne, having jumped over a defender, is called a ___ pass.", after: "", answers: ["jump", "Jump"], explanation: "The jump pass is released while airborne." },
  { before: "A pass using a quick wrist motion over a short distance is called a ___ pass.", after: "", answers: ["flick", "Flick"], explanation: "The flick pass uses a quick wrist motion." },
  { before: "Dribbling with the ball kept close to the ground, used against close marking, is called a ___ dribble.", after: "", answers: ["low", "Low"], explanation: "Low dribbling keeps the ball close to the ground." },
  { before: "Dribbling with the ball at chest height while moving through open space is called a ___ dribble.", after: "", answers: ["high", "High"], explanation: "High dribbling keeps the ball at chest height." },
  { before: "The shooting skill where a player jumps before releasing the ball toward the goal is called the ___ shot.", after: "", answers: ["jump", "Jump"], explanation: "The jump shot is released while the player is airborne." },
];

const MATCH_PROMPTS = [
  "Match each term to its correct description.",
  "Pair each term below with its correct description.",
  "Match each term to what it describes.",
  "Connect each term to its correct description.",
  "For each term below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about handball.",
  "Fill in the blank with the correct word.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these stages of the Handball unit in the order they typically happen.",
  "Put these Handball unit stages in the order they occur.",
  "Order these stages, from first to last.",
  "Sort these Handball unit stages into the correct sequence.",
  "Place these stages in the order a class would follow them.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct handball category.",
  "Which handball category does each item below belong to? Sort them.",
  "Classify each item into its correct handball category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the handball category they belong to.",
] as const;

export const handball: Skill = {
  id: "g7-cas-handball",
  code: "C.4",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Handball",
  description: "Weaving a handball goal net with macrame knots, and the passing, dribbling, and shooting skills of handball.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CATEGORIZE_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.reason })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.label] = c.label;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Knots weave the net; passes and dribbles/shots are game skills.",
        explanation: chosen.map((c) => c.reason).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: f.before,
        after: f.after,
        correctAnswer: f.answers[0],
        acceptedAnswers: f.answers,
        inputMode: "text",
        hint: "Think about whether the question is about a knot, a pass, a dribble, or a shot.",
        explanation: f.explanation,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the stages in order, from first to last.",
        items: shuffle(rng, UNIT_STAGES),
        correctOrder: UNIT_STAGES.map((s) => s.id),
        hint: "Knots are learned and practised first, then the net is built, then game skills are learned and finally applied together.",
        explanation: `The Handball unit progresses in this order: ${UNIT_STAGES.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const picks: typeof CATEGORIZE_ITEMS = [];
      for (const bucket of ["knot", "pass", "skill"]) {
        picks.push(...shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === bucket)).slice(0, 3));
      }
      const items = shuffle(rng, picks);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["knot", "pass", "skill"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Knots are used to weave the goal net; passes move the ball to a teammate; dribbling/shooting skills are used to advance and score.",
        explanation: items.map((c) => c.reason).join(" "),
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
      hint: "Match the situation described to the pass, dribble, or knot that best fits how it is normally used in a handball game.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
