import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const THROW_PHASES: { id: string; label: string }[] = [
  { id: "carry", label: "Carry" },
  { id: "approach", label: "Approach run" },
  { id: "crossover", label: "Cross over" },
  { id: "release", label: "Release" },
  { id: "followthrough", label: "Follow through" },
];

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "General shape", bucket: "appearance", reason: "Shape is a feature to observe about a javelin's appearance." },
  { label: "Length", bucket: "appearance", reason: "Length is a feature to observe about a javelin's appearance." },
  { label: "Thickness", bucket: "appearance", reason: "Thickness is a feature to observe about a javelin's appearance." },
  { label: "Weight", bucket: "appearance", reason: "Weight is a feature to observe about a javelin's appearance." },
  { label: "Sanding", bucket: "finishing", reason: "Sanding is a finishing technique used when carving a javelin." },
  { label: "Texturing", bucket: "finishing", reason: "Texturing is a finishing technique used when carving a javelin." },
  { label: "Varnishing", bucket: "finishing", reason: "Varnishing is a finishing technique used when carving a javelin." },
  { label: "Carry", bucket: "phase", reason: "Carry is the first phase of a javelin throw." },
  { label: "Approach run", bucket: "phase", reason: "Approach run is the second phase of a javelin throw." },
  { label: "Cross over", bucket: "phase", reason: "Cross over is the third phase of a javelin throw." },
  { label: "Release", bucket: "phase", reason: "Release is the fourth phase of a javelin throw." },
  { label: "Follow through", bucket: "phase", reason: "Follow through is the final phase of a javelin throw." },
];

const BUCKET_LABEL: Record<string, string> = {
  appearance: "Javelin appearance feature",
  finishing: "Javelin finishing technique",
  phase: "Javelin throw phase",
};

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "Which of these is a safe, environmentally-conscious way to select material for carving a javelin?", correct: "Choosing suitable found materials from the environment rather than buying new, unsustainable materials", distractors: ["Using any sharp metal object found lying around, regardless of safety", "Only using materials imported from another country", "Choosing the heaviest material available regardless of its shape"] },
  { q: "Why must safety be observed while carving a javelin?", correct: "Carving tools are sharp and can injure the carver or others nearby if handled carelessly", distractors: ["Safety is only required during the actual throw, never during carving", "Carving is never dangerous once the shape has been sketched", "Safety only matters if the javelin will be used in a competition"] },
  { q: "What is the correct first step before carving out a javelin's shape?", correct: "Sketching the image of the javelin onto the material", distractors: ["Sanding the finished javelin", "Practising the approach run", "Varnishing the surface"] },
  { q: "During the approach run phase of a javelin throw, what is the athlete doing?", correct: "Building up speed by running toward the throwing line before the throw", distractors: ["Releasing the javelin into the air", "Standing still while gripping the javelin", "Slowing down after the javelin has landed"] },
  { q: "What happens during the follow through phase of a javelin throw?", correct: "The body continues its motion naturally after release to control balance and reduce injury risk", distractors: ["The athlete grips the javelin for the very first time", "The athlete begins the approach run", "The javelin is sanded and varnished"] },
  { q: "Why is the cross over phase important in a javelin throw?", correct: "It transfers the athlete's running speed into position for a powerful release", distractors: ["It is only used to slow the athlete down completely", "It happens after the javelin has already been released", "It is the finishing technique applied to the javelin itself"] },
  { q: "Which finishing technique gives a carved javelin a smooth surface by removing rough patches?", correct: "Sanding", distractors: ["Texturing", "Varnishing", "Approach run"] },
  { q: "Which finishing technique protects a carved javelin's surface with a protective coating?", correct: "Varnishing", distractors: ["Sanding", "Cross over", "Follow through"] },
  { q: "A carver wants to add a raised or patterned surface to part of a javelin. Which finishing technique achieves this?", correct: "Texturing", distractors: ["Varnishing", "Release", "Carry"] },
  { q: "During the carry phase of a javelin throw, what is the athlete doing?", correct: "Holding the javelin in a ready position before starting the approach run", distractors: ["Releasing the javelin at maximum speed", "Applying varnish to the javelin's surface", "Sanding the javelin's shaft"] },
  { q: "What should a learner do after completing a javelin carving, according to the design's practice of giving feedback?", correct: "Display it and give feedback on their own and others' carved javelins", distractors: ["Discard it immediately without showing anyone", "Only judge their own work, ignoring others'", "Skip feedback entirely and move straight to throwing"] },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "One feature to observe about a javelin's appearance, alongside length, thickness, and weight, is its general ___.", after: "", answers: ["shape", "Shape"], explanation: "General shape is one of the 4 javelin appearance features." },
  { before: "Two other features to observe about a javelin's appearance, alongside shape and length, are thickness and ___.", after: "", answers: ["weight", "Weight"], explanation: "Weight is one of the 4 javelin appearance features." },
  { before: "The finishing technique that smooths a carved javelin's surface by removing rough patches is called ___.", after: "", answers: ["sanding", "Sanding"], explanation: "Sanding smooths a carved javelin's surface." },
  { before: "The finishing technique that protects a carved javelin's surface with a coating is called ___.", after: "", answers: ["varnishing", "Varnishing"], explanation: "Varnishing protects a carved javelin's surface." },
  { before: "The finishing technique that adds a raised or patterned surface to a javelin is called ___.", after: "", answers: ["texturing", "Texturing"], explanation: "Texturing adds a raised or patterned surface." },
  { before: "The first phase of a javelin throw, where the athlete holds the javelin in a ready position, is called ___.", after: "", answers: ["carry", "Carry"], explanation: "Carry is the first phase of a javelin throw." },
  { before: "The phase of a javelin throw where the athlete builds up speed by running is called the ___ ___.", after: "", answers: ["approach run", "Approach run"], explanation: "Approach run is the second phase of a javelin throw." },
  { before: "The phase of a javelin throw that transfers running speed into position for release is called ___ ___.", after: "", answers: ["cross over", "Cross over"], explanation: "Cross over is the third phase of a javelin throw." },
  { before: "The phase of a javelin throw where the javelin actually leaves the athlete's hand is called ___.", after: "", answers: ["release", "Release"], explanation: "Release is the fourth phase of a javelin throw." },
  { before: "The final phase of a javelin throw, where the body's motion continues to control balance, is called ___ ___.", after: "", answers: ["follow through", "Follow through"], explanation: "Follow through is the final phase of a javelin throw." },
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
  "Complete this sentence about javelin.",
  "Fill in the blank with the correct word.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these phases of a javelin throw in the order they happen.",
  "Put these javelin throw phases in the order they occur.",
  "Order these javelin throw phases, from first to last.",
  "Sort these throw phases into the correct sequence.",
  "Place these javelin throw phases in the order an athlete performs them.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct javelin category.",
  "Which javelin category does each item below belong to? Sort them.",
  "Classify each item into its correct javelin category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the javelin category they belong to.",
] as const;

export const athletics: Skill = {
  id: "g7-cas-athletics",
  code: "C.2",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Athletics — Javelin",
  description: "Carving a javelin from found materials, its appearance features and finishing techniques, and the five phases of a javelin throw.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "mc", "match", "fill-blank"] as const);

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
        hint: "Appearance features describe what the javelin looks like; finishing techniques are carving steps; phases happen during the throw itself.",
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
        hint: "Think about whether the term describes the javelin's look, a finishing step, or a throw phase.",
        explanation: f.explanation,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the phases in order, from first to last.",
        items: shuffle(rng, THROW_PHASES),
        correctOrder: THROW_PHASES.map((p) => p.id),
        hint: "An athlete first carries the javelin, then builds up speed, then transfers that speed into the throw itself.",
        explanation: `The five phases of a javelin throw, in order: ${THROW_PHASES.map((p) => p.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const picks: typeof CATEGORIZE_ITEMS = [];
      for (const bucket of ["appearance", "finishing", "phase"]) {
        picks.push(...shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === bucket)).slice(0, bucket === "phase" ? 3 : 2));
      }
      const items = shuffle(rng, picks);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["appearance", "finishing", "phase"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Appearance features describe what the javelin looks like; finishing techniques are carving steps; phases happen during the throw itself.",
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
      hint: "Think about which stage of carving or throwing the question is describing, and what safety or sustainability means at that stage.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
