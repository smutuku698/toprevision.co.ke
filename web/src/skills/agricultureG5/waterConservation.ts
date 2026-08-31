import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 1.2 Water Conservation — 3 named methods (mulching, cover cropping,
// shading) for household/kitchen gardening, and the design's own mulched-vs-un-mulched comparison experiment.
// See curriculum-reference/grade-5/agriculture.json.

const METHODS = [
  { id: "mulching", label: "Mulching", def: "Covering the soil around plants with dry grass, straw or leaves to reduce water loss from evaporation" },
  { id: "cover-cropping", label: "Cover cropping", def: "Growing a close, low-spreading crop that covers bare soil, protecting it and reducing water loss" },
  { id: "shading", label: "Shading", def: "Providing shade over young plants or nursery beds to reduce how much water is lost to evaporation" },
] as const;

const WATER_PRACTICES = [
  { text: "Covering vegetable beds with a layer of dry grass or straw", conserves: true },
  { text: "Watering the garden early in the morning or in the evening", conserves: true },
  { text: "Growing a low, spreading crop to cover bare soil between rows", conserves: true },
  { text: "Directing water straight to plant roots using a watering can", conserves: true },
  { text: "Shading a nursery bed of young seedlings from strong midday sun", conserves: true },
  { text: "Watering the garden in the hottest part of the midday sun", conserves: false },
  { text: "Leaving garden soil completely bare and exposed to the sun", conserves: false },
  { text: "Letting excess water run off unused down a slope", conserves: false },
  { text: "Removing mulch from around plants and leaving the soil bare", conserves: false },
  { text: "Watering with a wide, splashing hose that soaks the whole path, not just the plants", conserves: false },
] as const;

// The design's own suggested experiment: "mulch some crops and leave others un-mulched and compare moisture
// conservation" — condensed into an explicit step sequence for an ordering branch.
const EXPERIMENT_STEPS = [
  { id: "e1", label: "Choose two similar patches of crops growing in the same conditions" },
  { id: "e2", label: "Mulch one patch with dry grass or leaves, and leave the other patch bare" },
  { id: "e3", label: "Water both patches the same amount at the same time" },
  { id: "e4", label: "Leave both patches for several days without watering again" },
  { id: "e5", label: "Check and compare the soil moisture in each patch" },
  { id: "e6", label: "Share and discuss the results with peers" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} mulches half a vegetable bed with dry grass in ${place(rng)} and leaves the other half bare, watering both equally. A few days later, which half is likely to still be moist?`,
      correct: "The mulched half, since the mulch layer reduces water loss from evaporation",
      wrong: ["The bare half, since bare soil always holds more moisture", "Both halves would dry out at exactly the same rate", "Neither half would retain any moisture at all"],
      explanation: "This is the design's own mulched-vs-un-mulched comparison experiment — mulch reduces evaporation, so mulched soil stays moist longer than bare soil.",
    };
  },
  (rng) => ({
    prompt: `A gardener in ${place(rng)} waters the vegetable patch at 6am and again at 6pm, rather than at midday. Why choose these times?`,
    correct: "Cooler morning and evening temperatures mean less water is lost to evaporation before it soaks in",
    wrong: ["Plants cannot absorb water at all during midday", "Watering time has no effect on how much water is conserved", "Midday watering makes plants grow faster regardless of water loss"],
    explanation: "Watering during cooler parts of the day reduces evaporation, so more of the water actually reaches and benefits the plant roots — a water conservation practice.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} plants a low, spreading crop between rows of vegetables in a garden in ${place(rng)}, covering what would otherwise be bare soil. What water-conservation method is this?`,
      correct: "Cover cropping",
      wrong: ["Mulching", "Shading", "None of these — this has no effect on water conservation"],
      explanation: "Growing a close, spreading crop to cover bare soil and reduce water loss is cover cropping, distinct from mulching (which uses cut plant material, not a living crop).",
    };
  },
  (rng) => ({
    prompt: `A nursery bed of young seedlings in ${place(rng)} is covered with a light shade net during the hottest hours of the day. What is this shading meant to achieve?`,
    correct: "Reducing how much water is lost through evaporation from the soil and young seedlings",
    wrong: ["Making the seedlings grow in complete darkness permanently", "Increasing how quickly the soil dries out", "Preventing the seedlings from receiving any water at all"],
    explanation: "Shading reduces evaporation, helping conserve soil moisture around delicate young seedlings during the hottest, driest part of the day.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sets up an experiment: mulching some crops and leaving others completely un-mulched, then checking soil moisture after a week. What is the purpose of leaving some crops un-mulched?`,
      correct: "To compare the mulched crops against the un-mulched ones, showing whether mulching actually makes a difference",
      wrong: ["There is no purpose — every crop should always be mulched", "Leaving crops un-mulched always improves their water conservation", "The un-mulched crops are meant to fail on purpose"],
      explanation: "The design's own suggested experiment compares mulched vs un-mulched crops specifically to demonstrate mulching's effect on moisture conservation.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} notices that a mulched section of garden stays productive through a dry spell, while an unmulched section next to it wilts. What does this demonstrate about mulching?`,
    correct: "Mulching helps conserve soil moisture, which supports crops through periods with less rain",
    wrong: ["Mulching has no real effect on how crops survive dry spells", "Mulching makes crops need more water than usual", "Wilting is completely unrelated to soil moisture"],
    explanation: "Mulched soil retains moisture better, which is why mulched crops can better withstand a dry spell compared to unmulched crops.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sets a garden hose to spray a wide area, soaking the paths as well as the vegetable beds. What water conservation mistake is ${who} making?`,
      correct: "Wasting water by soaking areas where no plants are growing, instead of directing it to the roots",
      wrong: ["No mistake — watering everything equally is the most water-efficient method", "The mistake is using a hose instead of a bucket", "This actually conserves more water than a watering can would"],
      explanation: "Directing water precisely to plant roots (such as with a watering can) conserves far more water than broadly soaking paths and bare ground.",
    };
  },
  (rng) => ({
    prompt: `A community group in ${place(rng)} teaches households to use mulching, cover cropping and shading together in their kitchen gardens. Why combine all three methods rather than relying on just one?`,
    correct: "Each method reduces water loss in a different way, so combining them conserves more water overall",
    wrong: ["Combining methods actually wastes more water than using just one", "Only one of the three methods has any real effect; the others do nothing", "The three methods cancel each other out when used together"],
    explanation: "Mulching, cover cropping and shading each reduce evaporation through different means (covering, growing cover, blocking sun) — using them together compounds the water-saving benefit.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} presents findings to the class in ${place(rng)} after comparing mulched and un-mulched crops for a week, showing the mulched soil stayed visibly moist while the bare soil dried and cracked. What conclusion best fits this evidence?`,
      correct: "Mulching is an effective way to conserve soil moisture compared to leaving soil bare",
      wrong: ["Mulching has no measurable effect on soil moisture", "Bare soil always conserves moisture better than mulched soil", "The experiment's results cannot support any conclusion about mulching"],
      explanation: "Visible moisture retention in mulched soil versus cracking, dried bare soil is direct evidence that mulching conserves water effectively.",
    };
  },
  (rng) => ({
    prompt: `A backyard gardener in ${place(rng)} runs out of mulching material but still wants to reduce water loss from a vegetable bed. Which of the other two named methods could help, and how?`,
    correct: "Cover cropping — growing a spreading crop to cover the bare soil would also reduce water loss",
    wrong: ["Neither shading nor cover cropping can reduce water loss at all", "Only mulching can ever reduce water loss; no other method works", "Watering more heavily is the only real alternative"],
    explanation: "Cover cropping achieves a similar water-conserving effect to mulching by covering bare soil, even without mulch material.",
  }),
];

export const waterConservation: Skill = {
  id: "g5-ag-conservation-water-conservation",
  code: "CR.2",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-conservation",
  grade: 5,
  title: "Water conservation",
  description: "Conserving water in household and backyard gardening using mulching, cover cropping and shading, including the mulched-vs-un-mulched comparison experiment.",
  generate(rng) {
    const branch = randChoice(rng, ["method-match", "practice-categorize", "experiment-order", "reasoning", "reasoning2", "fill-blank"] as const);

    if (branch === "method-match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.def })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "water conservation method to what it actually does"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether it covers the soil with cut material, a living crop, or blocks the sun.",
        explanation: METHODS.map((m) => `${m.label} — ${m.def}.`).join(" "),
      };
    }

    if (branch === "practice-categorize") {
      const chosen = shuffle(rng, WATER_PRACTICES).slice(0, 7);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.conserves ? "conserves" : "wastes"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it conserves water or wastes water"),
        items,
        buckets: [
          { id: "conserves", label: "Conserves water" },
          { id: "wastes", label: "Wastes water" },
        ],
        correctBucket,
        hint: "Think about evaporation — practices that reduce it conserve water; practices that increase it waste water.",
        explanation: chosen.map((p) => `"${p.text}" ${p.conserves ? "conserves" : "wastes"} water.`).join(" "),
      };
    }

    if (branch === "experiment-order") {
      const shuffled = shuffle(rng, EXPERIMENT_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of the mulching-vs-un-mulched comparison experiment"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: EXPERIMENT_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Set up two similar patches first, treat them differently, then wait and compare.",
        explanation: "Correct order: " + EXPERIMENT_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning" || branch === "reasoning2") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Covering soil with dry grass or leaves to reduce evaporation is called ", after: ".", correctAnswer: "mulching" },
      { before: "Growing a close, spreading crop to protect bare soil and reduce water loss is called ", after: ".", correctAnswer: "cover cropping" },
      { before: "Providing shade over young seedlings to reduce evaporation is called ", after: ".", correctAnswer: "shading" },
      { before: "Watering a garden early morning or evening conserves water better than watering at ", after: ".", correctAnswer: "midday", alsoAccept: ["noon"] },
      { before: "In the mulching experiment, soil that was left un-mulched dried out faster because it had no ", after: " to reduce evaporation.", correctAnswer: "mulch" },
      { before: "Directing water straight to plant roots wastes less water than ", after: " a whole wide area.", correctAnswer: "soaking", alsoAccept: ["splashing", "spraying"] },
      { before: "Bare, exposed soil loses water faster than soil covered by mulch or a ", after: ".", correctAnswer: "cover crop" },
      { before: "The three named methods of conserving water in household gardening are mulching, shading and cover ", after: ".", correctAnswer: "cropping" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about mulching, cover cropping, shading, and the mulched-vs-un-mulched experiment.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
