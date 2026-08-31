import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Flutter kicks", bucket: "backstroke", reason: "Flutter kicks are a component of backstroke technique." },
  { label: "Arm action", bucket: "backstroke", reason: "Arm action is a component of backstroke technique." },
  { label: "Breathing in a supine (face-up) position", bucket: "backstroke", reason: "Breathing while supine is a component of backstroke technique." },
  { label: "Coordination", bucket: "backstroke", reason: "Coordination between kicks, arms, and breathing is a component of backstroke technique." },
  { label: "Wash technique", bucket: "painting", reason: "Wash is a painting technique used to compose a swimmer in water." },
  { label: "Brush stroke technique", bucket: "painting", reason: "Brush stroke is a painting technique used to compose a swimmer in water." },
  { label: "Body position and balance", bucket: "painting", reason: "Body position and balance is what the painting composition should emphasise." },
  { label: "Entering feet-first", bucket: "entry", reason: "A pencil dive is entered feet-first, not head-first." },
  { label: "Water safety awareness", bucket: "entry", reason: "Water safety awareness is emphasised throughout the swimming sub-strand." },
];

const BUCKET_LABEL: Record<string, string> = {
  backstroke: "Backstroke technique component",
  painting: "Painting technique for this sub-strand",
  entry: "Water entry / safety fact",
};

const QUESTIONS: { q: string; correct: string; distractors: string[]; tier?: "evaluate" }[] = [
  {
    q: "A learner performs a pencil dive by entering the water head-first. Evaluate this technique.",
    correct: "This is incorrect — a pencil dive is a feet-first water entry, not head-first",
    distractors: ["This is correct — a pencil dive is always a head-first entry", "This is correct — either head-first or feet-first is acceptable for a pencil dive", "This is incorrect — a pencil dive should not enter the water at all"],
    tier: "evaluate",
  },
  {
    q: "While swimming backstroke, a learner keeps their face turned to the side and holds their breath the entire length. Evaluate this breathing approach.",
    correct: "This is a weak technique — backstroke breathing should happen while supine (face-up) rather than avoided altogether",
    distractors: ["This is correct — backstroke breathing should always be held for the whole length", "This is correct — backstroke swimmers should never breathe with their face up", "This has no effect on backstroke technique at all"],
    tier: "evaluate",
  },
  { q: "What does 'supine position' mean in the context of backstroke breathing?", correct: "Lying face-up in the water", distractors: ["Lying face-down in the water", "Standing upright at the poolside", "Floating on one's side"] },
  { q: "What is the purpose of flutter kicks in backstroke?", correct: "To provide propulsion while keeping the body balanced in the supine position", distractors: ["To help the swimmer enter the water at the start", "To control breathing rhythm only", "To decorate the swimmer's painted composition"] },
  { q: "Why is coordination important when performing backstroke?", correct: "It links the flutter kicks, arm action, and breathing into one smooth, efficient stroke", distractors: ["Coordination is not needed for backstroke, only for pencil dives", "Coordination only matters for painting a swimmer, not for swimming itself", "Coordination refers only to how fast a swimmer enters the water"] },
  { q: "When painting a composition of a swimmer in water, which two elements should be emphasised, per the design?", correct: "Body position and balance", distractors: ["Only the colour of the swimming costume", "Only the size of the swimming pool", "Only the number of swimmers shown"] },
  { q: "Which painting techniques are suggested for composing a swimmer in water?", correct: "Wash and brush stroke techniques", distractors: ["Only stencil printing", "Only block printing with dabbing", "Only pencil sketching with no colour"] },
  { q: "Why are water safety skills important, per the design's key inquiry question?", correct: "They help prevent accidents and injury while learners practise swimming skills", distractors: ["Water safety skills are only relevant to professional swimmers", "Water safety has no connection to learning backstroke or diving", "Water safety is only about the colour of the pool"] },
  { q: "How can drawing or painting be used to enhance water safety awareness, per the design's key inquiry question?", correct: "By visually depicting correct body position, balance, and safe practices in the water", distractors: ["Drawing has no connection to water safety awareness", "Only written essays can teach water safety, never drawing", "Painting is only for decoration and never for teaching safety"] },
  { q: "What should learners do after observing each other's backstroke practice, per the design's suggested learning experiences?", correct: "Give each other feedback on the execution of the backstroke skill", distractors: ["Avoid commenting on each other's technique entirely", "Only the teacher may comment, never other learners", "Feedback should only be given on the painted composition, never the swimming"] },
];

// Condensed from the design's own "Suggested Learning Experiences" sequence for this
// sub-strand: the painting comes first, then technique is observed and demonstrated,
// then drilled, then applied in water games, then reviewed.
const LESSON_STAGES: { id: string; label: string }[] = [
  { id: "paint", label: "Paint a composition of a swimmer in water and give feedback" },
  { id: "watch", label: "Watch a demonstration of backstroke and the pencil dive" },
  { id: "demonstrate", label: "Demonstrate the pencil dive and backstroke components" },
  { id: "drill", label: "Practise drills focusing on coordination" },
  { id: "games", label: "Engage in water games and give feedback on execution" },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "A pencil dive is correctly entered ___-first, not head-first.", after: "", answers: ["feet", "Feet"], explanation: "A pencil dive is entered feet-first." },
  { before: "Lying face-up in the water, as used for backstroke breathing, is called the ___ position.", after: "", answers: ["supine", "Supine"], explanation: "Supine means lying face-up in the water." },
  { before: "The backstroke component that provides propulsion while keeping the body balanced is called ___ kicks.", after: "", answers: ["flutter", "Flutter"], explanation: "Flutter kicks provide propulsion in backstroke." },
  { before: "The backstroke component that links kicks, arm action, and breathing into one smooth stroke is called ___.", after: "", answers: ["coordination", "Coordination"], explanation: "Coordination links the parts of a backstroke together." },
  { before: "A painting composition of a swimmer should emphasise body position and ___.", after: "", answers: ["balance", "Balance"], explanation: "Body position and balance should be emphasised." },
  { before: "The painting technique using thin, translucent layers of colour is called a ___.", after: "", answers: ["wash", "Wash"], explanation: "Wash is a painting technique used for the swimmer composition." },
  { before: "Alongside wash, the other suggested painting technique for a swimmer composition is ___ stroke technique.", after: "", answers: ["brush", "Brush"], explanation: "Brush stroke is the other suggested painting technique." },
  { before: "Skills that help prevent accidents and injury in the water are together called water ___.", after: "", answers: ["safety", "Safety"], explanation: "Water safety skills help prevent accidents and injury." },
  { before: "In backstroke, arm ___ works together with flutter kicks and breathing.", after: "", answers: ["action", "Action"], explanation: "Arm action is a backstroke component." },
  { before: "After observing a classmate's backstroke practice, learners should give each other ___.", after: "", answers: ["feedback", "Feedback"], explanation: "Learners give each other feedback on backstroke execution." },
];

const MATCH_PROMPTS = [
  "Match each item to its correct description.",
  "Pair each item below with its correct description.",
  "Match each item to what it describes.",
  "Connect each item to its correct description.",
  "For each item below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about swimming.",
  "Fill in the blank with the correct word.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these stages of a Swimming lesson in the order they typically happen.",
  "Put these Swimming lesson stages in the order they occur.",
  "Order these stages, from first to last.",
  "Sort these lesson stages into the correct sequence.",
  "Place these stages in the order a class would follow them.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct category.",
  "Which category does each item below belong to? Sort them.",
  "Classify each item into its correct category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the category they belong to.",
] as const;

export const swimming: Skill = {
  id: "g7-cas-swimming",
  code: "C.8",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Swimming (Optional)",
  description: "Painting a swimmer's body position and balance, and the technique of a feet-first pencil dive and backstroke.",
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
        hint: "Backstroke components describe the swimming technique; painting techniques describe the artwork; entry/safety facts cover the pencil dive.",
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
        hint: "Think about whether the fact belongs to backstroke technique, the painting, or water entry/safety.",
        explanation: f.explanation,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the stages in order, from first to last.",
        items: shuffle(rng, LESSON_STAGES),
        correctOrder: LESSON_STAGES.map((s) => s.id),
        hint: "The composition is painted first, then technique is watched and demonstrated, then drilled, then applied in games.",
        explanation: `A Swimming lesson progresses in this order: ${LESSON_STAGES.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const backPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "backstroke")).slice(0, 3);
      const paintPicks = CATEGORIZE_ITEMS.filter((c) => c.bucket === "painting");
      const entryPicks = CATEGORIZE_ITEMS.filter((c) => c.bucket === "entry");
      const items = shuffle(rng, [...backPicks, ...paintPicks, ...entryPicks]);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["backstroke", "painting", "entry"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Backstroke components describe the swimming technique itself; painting techniques describe how the artwork is made; entry/safety facts cover the pencil dive and water safety.",
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
      hint: q.tier === "evaluate"
        ? "Check the described technique carefully against the correct feet-first entry and supine breathing rules — is it actually right?"
        : "Think about whether the fact belongs to backstroke technique, the painting composition, or water entry/safety.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
