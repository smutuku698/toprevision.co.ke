import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRACTICES = [
  { id: "gapping", label: "Gapping", detail: "Replanting new seeds or seedlings in spots where the original ones failed to germinate or grow" },
  { id: "thinning", label: "Thinning", detail: "Removing some of the weaker seedlings where too many came up close together, leaving the strongest ones spaced out" },
  { id: "weeding", label: "Weeding", detail: "Physically removing unwanted plants that compete with the crop for nutrients, water, and light" },
  { id: "earthing-up", label: "Earthing-up", detail: "Piling loose soil up around the base of a growing plant's stem to support it and cover developing roots or tubers" },
] as const;

const SCENARIO_ITEMS = [
  { desc: "Several bean seeds in a row failed to germinate, leaving empty gaps in the field.", practice: "gapping" },
  { desc: "Too many maize seeds germinated close together in one spot, so only the strongest few should remain.", practice: "thinning" },
  { desc: "Grass and other unwanted plants are competing with the young crop for water and nutrients.", practice: "weeding" },
  { desc: "A potato crop's developing tubers are being exposed to sunlight and turning green near the surface.", practice: "earthing-up" },
] as const;

const SCENARIOS = [
  {
    q: "A farmer notices several empty spots in a bean field where seeds never germinated. Which management practice should be carried out?",
    correct: "Gapping — replanting the empty spots with fresh seeds or seedlings",
    distractors: [
      "Thinning — removing extra seedlings from crowded spots",
      "Weeding — removing unwanted plants competing with the crop",
      "Earthing-up — piling soil around the base of the plants",
    ],
  },
  {
    q: "A maize field has many seedlings growing tightly bunched together in several spots, competing with each other for space. Which practice addresses this?",
    correct: "Thinning — removing the weaker seedlings so the remaining ones have room to grow",
    distractors: [
      "Gapping — replanting seeds in empty spots",
      "Weeding — removing unwanted plants from the field",
      "Earthing-up — covering the base of the stems with soil",
    ],
  },
];

const ORDER_STEPS = [
  { id: "gap", label: "Gap any spots where the original seeds failed to germinate" },
  { id: "thin", label: "Thin out crowded seedlings once they are large enough to identify the strongest ones" },
  { id: "weed", label: "Weed the field regularly as unwanted plants appear" },
  { id: "earth", label: "Earth-up around the stems once the crop is established and growing well" },
];

const FILL_ITEMS = [
  { before: "Replanting seeds or seedlings where the original ones failed to grow is called ", after: ".", correctAnswer: "gapping" },
  { before: "Piling soil around the base of a growing plant's stem is called ", after: ".", correctAnswer: "earthing-up" },
];

const MATCH_PROMPTS = [
  "Match each crop management practice to its description.",
  "Pair each practice with the description that explains it.",
  "Connect each crop management term to what it actually means.",
  "Match each practice below to the statement that describes it.",
  "Link each crop management practice to its correct description.",
  "Match each term to its explanation.",
];

const SORT_PROMPTS = [
  "Sort each field situation by the crop management practice it calls for.",
  "Decide which practice each field situation below calls for, and sort it there.",
  "Group these field situations under the practice that fixes them.",
  "Sort each situation into gapping, thinning, weeding, or earthing-up.",
  "Read each field situation and place it under the practice it needs.",
  "Classify each situation by the crop management practice that addresses it.",
];

const ORDER_PROMPTS = [
  "Arrange these crop management practices in the order they are typically needed as a crop grows.",
  "Put these crop management practices into the order a farmer typically carries them out.",
  "Sequence these practices correctly as a crop develops through the season.",
  "Arrange these actions into the order they would usually be needed.",
  "Order these management tasks the way they typically arise as a crop grows.",
  "Sort these practices into the sequence they are usually carried out.",
];

const FILL_PROMPTS = [
  "Fill in the missing crop management term.",
  "Complete the sentence with the correct crop management term.",
  "Which term correctly completes this sentence?",
  "Supply the missing term to finish the sentence.",
  "Work out the missing crop management term in this sentence.",
  "Type the term that correctly fills the gap.",
];

export const cropManagementPractices: Skill = {
  id: "g7-ag-f-crop-management-practices",
  code: "F.2",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-food-production",
  grade: 7,
  title: "Selected Crop Management Practices",
  description: "Carrying out crop management practices — gapping, thinning, weeding, and earthing-up — and why each one matters for healthy crop production.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Each practice fixes a different problem: gaps need refilling, crowding needs thinning, competitors need weeding, and exposed roots need earthing-up.";

    if (branch === "match") {
      const tokens = shuffle(rng, PRACTICES.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PRACTICES.map((p) => ({ id: p.id, label: p.detail })));
      const correctMap: Record<string, string> = {};
      for (const p of PRACTICES) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PRACTICES.map((p) => `${p.label}: ${p.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, SCENARIO_ITEMS);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.desc }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.practice));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: PRACTICES.map((p) => ({ id: p.id, label: p.label })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.desc}" calls for ${PRACTICES.find((p) => p.id === c.practice)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIOS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Gaps show up first, then crowding, then ongoing weed competition, and earthing-up happens once the crop is established.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
