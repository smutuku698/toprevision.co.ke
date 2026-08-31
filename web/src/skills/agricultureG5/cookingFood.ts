import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 2.5 Cooking Food — the 2 named methods (dry fat frying, deep frying)
// and safety when handling hot oils/equipment (explicitly cross-linked to burns/scald first aid). See
// curriculum-reference/grade-5/agriculture.json.

const METHODS = [
  { id: "dry-fat", label: "Dry fat frying", def: "Frying food in a small amount of fat or oil, just enough to coat the pan, such as frying an egg or chapati" },
  { id: "deep", label: "Deep frying", def: "Frying food fully submerged in a larger amount of hot oil, such as frying mandazi or chips" },
] as const;

const SAFETY_PRACTICES = [
  { text: "Keeping the pan handle turned inward, away from the edge of the stove", isSafe: true },
  { text: "Lowering food gently into hot oil to avoid splashing", isSafe: true },
  { text: "Keeping children and pets away from the cooking area while frying", isSafe: true },
  { text: "Using a dry cloth or oven glove to hold a hot pan handle", isSafe: true },
  { text: "Watching the oil closely and not leaving it unattended while heating", isSafe: true },
  { text: "Dropping wet food straight into very hot oil without draining it first", isSafe: false },
  { text: "Leaving the pan handle sticking out over the edge of the stove", isSafe: false },
  { text: "Walking away from hot oil on the stove to do something else", isSafe: false },
  { text: "Pouring water onto a pan of burning hot oil to cool it down quickly", isSafe: false },
] as const;

const DEEP_FRY_STEPS = [
  { id: "d1", label: "Heat enough oil in a deep pan until it reaches the right frying temperature" },
  { id: "d2", label: "Prepare the food to be fried and ensure it is properly drained if wet" },
  { id: "d3", label: "Carefully and gently lower the food into the hot oil" },
  { id: "d4", label: "Fry the food until it is fully cooked and golden" },
  { id: "d5", label: "Remove the food and drain off excess oil" },
  { id: "d6", label: "Serve the food while it is still warm" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} fries a chapati using just enough oil to lightly coat the bottom of the pan. Which cooking method is this?`,
      correct: "Dry fat frying",
      wrong: ["Deep frying", "Neither method — this is not a frying method at all", "Both methods at once"],
      explanation: "Frying with only a small amount of fat, just enough to coat the pan, is dry fat frying — as opposed to fully submerging food in oil.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} prepares mandazi by fully submerging the dough pieces in a deep pan of hot oil until golden. Which method is this?`,
    correct: "Deep frying",
    wrong: ["Dry fat frying", "Neither method — mandazi cannot be fried", "Boiling, not frying"],
    explanation: "Fully submerging food in a larger amount of hot oil is deep frying, distinct from dry fat frying's small amount of oil.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} always keeps a frying pan's handle turned inward, away from the stove's edge, while cooking. Why is this an important safety habit?`,
      correct: "It prevents the handle from being knocked or grabbed accidentally, which could spill hot oil or the pan",
      wrong: ["Handle direction has no effect on safety while frying", "Turning the handle outward is always the safer choice", "This habit only matters for appearance, not safety"],
      explanation: "Keeping a pan handle turned inward reduces the risk of it being bumped, which could cause a spill of hot oil or fat — a real burn/scald hazard.",
    };
  },
  (rng) => ({
    prompt: `A cook in ${place(rng)} accidentally spills a little water into a pan of very hot frying oil. What is the immediate danger?`,
    correct: "The water can cause the hot oil to splatter or spit violently, risking burns",
    wrong: ["Nothing happens — water and hot oil mix safely", "The oil instantly cools down safely", "Water always extinguishes hot oil without any risk"],
    explanation: "Water introduced into very hot oil can cause dangerous splattering, which is why water should never be used to try to cool or extinguish hot oil.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} lowers wet, undrained potato slices directly into hot deep-frying oil. What is likely to happen?`,
      correct: "The water on the potatoes can cause the hot oil to splatter dangerously",
      wrong: ["Nothing unusual happens; wet food fries exactly like dry food", "The oil instantly becomes safer with added water", "Wet food always fries faster with no added risk"],
      explanation: "Water on food dropped into hot oil causes rapid, dangerous splattering — food should be properly drained before frying, especially deep frying.",
    };
  },
  (rng) => ({
    prompt: `A parent in ${place(rng)} makes sure young children stay well away from the stove while frying food in hot oil. What safety principle does this reflect?`,
    correct: "Keeping people who could be accidentally burned away from a hazardous cooking process",
    wrong: ["Children are never at risk near hot oil", "This has no real safety purpose, only convenience", "Keeping children away actually increases the risk of burns"],
    explanation: "Frying involves hot oil and equipment that can cause serious burns — keeping children and pets away is a basic safety precaution.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} uses a dry cloth to lift a hot frying pan's handle rather than bare hands. What would happen if a wet or damp cloth were used instead?`,
      correct: "A damp cloth can transfer heat much faster, increasing the risk of a burn",
      wrong: ["A damp cloth would protect the hand better than a dry one", "There is no difference between a dry and a damp cloth here", "Damp cloths cannot conduct heat at all"],
      explanation: "A damp or wet cloth conducts heat faster than a dry one, so it offers less protection when handling a hot pan handle.",
    };
  },
  (rng) => ({
    prompt: `A cook in ${place(rng)} leaves a pan of oil heating on the stove while going outside to attend to something else. What is the main risk of this?`,
    correct: "Unattended hot oil can overheat and catch fire, or cause a burn if someone else approaches it unexpectedly",
    wrong: ["There is no risk at all in leaving hot oil unattended", "Oil cannot overheat regardless of how long it is left", "This is always the recommended safe practice"],
    explanation: "Hot oil left unattended can overheat, smoke or catch fire, and poses a burn risk to anyone who approaches it — it should always be watched closely.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} gently lowers food into hot oil using a slotted spoon, rather than dropping it in from a height. Why does this matter?`,
      correct: "Gently lowering food reduces splashing, which lowers the risk of hot oil burning someone nearby",
      wrong: ["It has no safety benefit, only a cosmetic one", "Dropping food from a height is always safer", "This technique has no effect on splashing at all"],
      explanation: "Gently lowering food into hot oil (rather than dropping it) reduces splashing, directly reducing burn risk — a key safe-frying technique.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} links this sub-strand's safety practices to first aid for burns and scalds learnt in Science and Technology. Why does this connection matter?`,
    correct: "Because frying involves real burn/scald risks, knowing both prevention (safety practice) and response (first aid) protects the cook",
    wrong: ["The connection is purely coincidental with no practical value", "First aid knowledge has no relevance to cooking at all", "Only one of the two subjects' knowledge is ever useful, never both together"],
    explanation: "This sub-strand explicitly links frying safety to first aid for burns/scalds — prevention and response knowledge work together for real safety.",
  }),
];

export const cookingFood: Skill = {
  id: "g5-ag-food-production-cooking-food",
  code: "FPP.5",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-food-production",
  grade: 5,
  title: "Cooking food",
  description: "Cooking by dry fat frying and deep frying, and safety practices when handling hot oils and equipment while frying.",
  generate(rng) {
    const branch = randChoice(rng, ["method-match", "safety-categorize", "deep-fry-order", "reasoning", "fill-blank"] as const);

    if (branch === "method-match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.id, label: m.def })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "frying method to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Think about how much oil is used — a small coating, or fully submerging the food.",
        explanation: METHODS.map((m) => `${m.label} — ${m.def}.`).join(" "),
      };
    }

    if (branch === "safety-categorize") {
      const chosen = shuffle(rng, SAFETY_PRACTICES).slice(0, 7);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.isSafe ? "safe" : "unsafe"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is a safe or unsafe practice when frying"),
        items,
        buckets: [
          { id: "safe", label: "Safe frying practice" },
          { id: "unsafe", label: "Unsafe frying practice" },
        ],
        correctBucket,
        hint: "Think about splashing, burns, unattended hot oil, and keeping people at a safe distance.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isSafe ? "a safe" : "an unsafe"} frying practice.`).join(" "),
      };
    }

    if (branch === "deep-fry-order") {
      const shuffled = shuffle(rng, DEEP_FRY_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of deep frying food safely"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: DEEP_FRY_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Heat the oil first, then prepare the food, then fry, drain, and serve.",
        explanation: "Correct order: " + DEEP_FRY_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Frying food in just enough oil to coat the pan is called ", after: ".", correctAnswer: "dry fat frying" },
      { before: "Frying food fully submerged in a larger amount of hot oil is called ", after: ".", correctAnswer: "deep frying" },
      { before: "A frying pan's handle should be turned ", after: ", away from the stove's edge.", correctAnswer: "inward" },
      { before: "Food should be properly drained before frying to avoid dangerous ", after: " of hot oil.", correctAnswer: "splattering", alsoAccept: ["splashing"] },
      { before: "Hot frying oil should never be left ", after: " on the stove.", correctAnswer: "unattended" },
      { before: "Pouring water onto burning hot oil is dangerous because it can cause the oil to ", after: ".", correctAnswer: "splatter", alsoAccept: ["splash"] },
      { before: "A dry cloth or oven glove should be used to handle a hot pan ", after: ".", correctAnswer: "handle" },
      { before: "This sub-strand's safety practices link to first aid for burns and ", after: " learnt in Science and Technology.", correctAnswer: "scalds", alsoAccept: ["scald"] },
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
      hint: "Think about dry fat frying, deep frying, and safety around hot oil.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
