import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Tilth = "fine" | "medium" | "coarse";

const TILTH_LABEL: Record<Tilth, string> = {
  fine: "Fine tilth (for small seeds)",
  medium: "Medium tilth (for medium-sized seeds)",
  coarse: "Coarse tilth (for tubers, suckers, and cuttings)",
};

const MATERIAL_ITEMS: { text: string; bucket: Tilth }[] = [
  { text: "Kale (sukuma wiki) seeds", bucket: "fine" },
  { text: "Onion seeds", bucket: "fine" },
  { text: "Maize seeds", bucket: "medium" },
  { text: "Bean seeds", bucket: "medium" },
  { text: "Banana sucker", bucket: "coarse" },
  { text: "Cassava cutting", bucket: "coarse" },
  { text: "Arrowroot tuber", bucket: "coarse" },
];

const TILTH_DESCRIPTIONS = [
  { id: "fine", label: TILTH_LABEL.fine, detail: "Soil broken into very small, crumbly particles so tiny seeds can make good contact with it" },
  { id: "medium", label: TILTH_LABEL.medium, detail: "Soil broken into moderately sized particles, neither too fine nor too rough" },
  { id: "coarse", label: TILTH_LABEL.coarse, detail: "Soil left in larger clods, since big planting materials do not need fine soil contact to establish" },
] as const;

const SCENARIOS = [
  {
    q: "Amina is planting onion seeds, which are very tiny. What kind of tilth should she prepare?",
    correct: "Fine tilth, so the small seeds make close contact with the soil and can germinate well",
    distractors: [
      "Coarse tilth, since bigger soil clods hold more water for tiny seeds",
      "Medium tilth, since it works equally well for every seed size",
      "Tilth does not matter at all for seed germination",
    ],
  },
  {
    q: "Otieno is establishing a banana sucker, a large planting material. Why does the planting site not need to be broken into fine tilth?",
    correct: "A large sucker already has enough stored energy and mass to establish itself without needing fine soil contact",
    distractors: [
      "Bananas never grow properly in fine tilth soil under any condition",
      "Fine tilth is only ever needed for planting trees",
      "Large planting materials cannot survive being planted in soil at all",
    ],
  },
];

const PREP_STEPS = [
  { id: "clear", label: "Clear the site of weeds, stones, and debris" },
  { id: "dig", label: "Dig or till the soil to loosen it" },
  { id: "break", label: "Break large clods down to the tilth needed for the planting material" },
  { id: "level", label: "Level the site so water and seeds distribute evenly" },
  { id: "plant", label: "Plant the chosen material at the correct depth and spacing" },
];

const FILL_ITEMS = [
  { before: "The fineness or coarseness of prepared soil particles is called ", after: ".", correctAnswer: "tilth" },
  { before: "Large planting materials such as tubers, suckers, and cuttings are best planted in ", after: " tilth.", correctAnswer: "coarse" },
];

const SORT_PROMPTS = [
  "Sort each planting material by the tilth it needs.",
  "Decide which tilth each planting material below needs, and sort it there.",
  "Group these planting materials under the tilth that suits them.",
  "Sort each item into fine, medium, or coarse tilth.",
  "Read each planting material and place it under the tilth it requires.",
  "Classify each planting material by the soil tilth it needs to establish well.",
];

const MATCH_PROMPTS = [
  "Match each type of tilth to its description.",
  "Pair each tilth level with the description that explains it.",
  "Connect each tilth type to what it actually means.",
  "Match each tilth below to the statement that describes it.",
  "Link each type of soil tilth to its correct description.",
  "Match each tilth category to its explanation.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for preparing a planting site and establishing a crop, in the correct order.",
  "Put these planting-site preparation steps into a sensible order.",
  "Sequence the steps for preparing a site and establishing a crop correctly.",
  "Arrange these actions into the order a careful farmer would follow them.",
  "Order these site-preparation tasks the way they should actually happen.",
  "Sort these steps into the order needed to prepare a site and plant a crop.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word correctly completes this sentence?",
  "Supply the missing word to finish the sentence.",
  "Work out the missing word in this sentence.",
  "Type the word that correctly fills the gap.",
];

export const preparingPlantingSite: Skill = {
  id: "g7-ag-f-preparing-planting-site",
  code: "F.1",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-food-production",
  grade: 7,
  title: "Preparing Planting Site and Establishing Crop",
  description: "Choosing the appropriate soil tilth — fine, medium, or coarse — for a selected planting material, and preparing a planting site to establish it.",
  generate(rng) {
    const branch = randChoice(rng, ["sort", "match", "scenario", "order", "fill"] as const);
    const hint = "Smaller planting materials need finer soil to make close contact with; larger materials like tubers and suckers can establish in coarser soil.";

    if (branch === "sort") {
      const chosen = shuffle(rng, MATERIAL_ITEMS);
      const items = chosen.map((c, i) => ({ id: `m${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`m${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: (["fine", "medium", "coarse"] as Tilth[]).map((t) => ({ id: t, label: TILTH_LABEL[t] })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" needs ${TILTH_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, TILTH_DESCRIPTIONS.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TILTH_DESCRIPTIONS.map((t) => ({ id: t.id, label: t.detail })));
      const correctMap: Record<string, string> = {};
      for (const t of TILTH_DESCRIPTIONS) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TILTH_DESCRIPTIONS.map((t) => `${t.label}: ${t.detail}.`).join(" "),
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
      const items = shuffle(rng, PREP_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: PREP_STEPS.map((s) => s.id),
        hint: "The site must be cleared and dug before it can be broken to the right tilth, levelled, and planted.",
        explanation: PREP_STEPS.map((s) => s.label).join(" → "),
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
