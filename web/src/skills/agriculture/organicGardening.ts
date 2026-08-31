import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

// Grade 9 F.1 "Organic Gardening" is about growing a short-season crop (vegetable, legume, or
// spice) using organic practices. The existing "garden-bed" VisualSpec (built for Grade 6's
// sunken-seedbed/shallow-pit/sunken-moist-bed/raised-moist-bed) has no organic-practice-specific
// variant, but "raised-moist-bed" and "sunken-moist-bed" both genuinely depict the kind of bed a
// learner would prepare to grow a crop this way — attached here as the generic growing-bed
// context for the sub-strand, not claimed to depict any single practice.
const GARDEN_BED_KINDS: VisualSpec[] = [
  { type: "garden-bed", kind: "raised-moist-bed" },
  { type: "garden-bed", kind: "sunken-moist-bed" },
];

const PRACTICES: { name: string; description: string }[] = [
  { name: "Organic manure", description: "using compost or animal manure instead of chemical fertiliser to feed the soil" },
  { name: "Organic pesticides", description: "using natural substances instead of synthetic chemicals to control pests" },
  { name: "Mechanical weed control", description: "removing weeds by hand-pulling or hoeing instead of using herbicides" },
  { name: "Organic foliar feed", description: "spraying a liquid feed made from animal wastes and plants such as Mexican sunflower onto the leaves" },
];

const IDENTIFY_PROMPTS: ((description: string) => string)[] = [
  (description) => `Which organic gardening practice involves ${description}?`,
  (description) => `Which organic gardening method involves ${description}?`,
  (description) => `Can you name the organic gardening practice that involves ${description}?`,
  (description) => `Which practice below involves ${description}?`,
  (description) => `Identify the organic gardening practice that involves ${description}.`,
  (description) => `Which technique involves ${description}?`,
];

const MATCH_PROMPTS = [
  "Match each organic gardening practice to what it involves.",
  "Pair each organic gardening practice with what it involves.",
  "Connect each practice to the description that explains it.",
  "Link each organic gardening method to what it actually involves.",
  "Match each practice below to its correct description.",
  "Pair each technique with what doing it actually involves.",
];

export const organicGardening: Skill = {
  id: "ag-f-organic-gardening",
  code: "F.1",
  subjectId: "agriculture-nutrition",
  strandId: "ag-food-production",
  grade: 9,
  title: "Organic gardening practices",
  description: "Match each organic gardening practice to what it involves.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify"] as const);

    if (branch === "identify") {
      const pool = shuffle(rng, PRACTICES);
      const correct = pool[0];
      const choices = shuffle(rng, pool.map((p) => p.name));

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS)(correct.description),
        choices,
        correctIndex: choices.indexOf(correct.name),
        layout: "list",
        visual: randChoice(rng, GARDEN_BED_KINDS),
        hint: "Organic gardening avoids synthetic chemicals, relying instead on natural materials and manual methods to grow healthy food.",
        explanation: `${correct.name} — ${correct.description}.`,
      };
    }

    const chosen = shuffle(rng, PRACTICES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.description })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.name] = p.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Organic gardening avoids synthetic chemicals, relying instead on natural materials and manual methods to grow healthy food.",
      explanation: chosen.map((p) => `${p.name} — ${p.description}.`).join(" "),
    };
  },
};
