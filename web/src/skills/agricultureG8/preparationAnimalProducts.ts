import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TERMS = [
  { id: "gutting", label: "Gutting", detail: "Removing the internal organs of a fish to prevent it from spoiling quickly" },
  { id: "scaling", label: "Scaling", detail: "Removing the scales from a fish's skin before cooking or further processing" },
  { id: "scalding", label: "Scalding", detail: "Dipping a poultry carcass briefly in hot water to loosen the feathers before plucking" },
  { id: "plucking", label: "Plucking", detail: "Removing feathers from a poultry carcass after scalding" },
  { id: "evisceration", label: "Evisceration", detail: "Removing the internal organs of a poultry carcass" },
  { id: "singeing", label: "Singeing", detail: "Passing a plucked carcass briefly over a flame to burn off fine remaining hairs/feathers" },
] as const;

const FISH_STEPS = [
  { id: "wash1", label: "Wash the fresh fish in clean water" },
  { id: "scale", label: "Scale the fish, removing scales from tail to head" },
  { id: "gut", label: "Gut the fish, removing the internal organs" },
  { id: "wash2", label: "Wash the gutted fish again thoroughly" },
  { id: "chill", label: "Chill or process the fish immediately to keep it fresh" },
];

const POULTRY_STEPS = [
  { id: "kill", label: "Slaughter the bird humanely, following ethical practice" },
  { id: "scald", label: "Scald the carcass in hot water to loosen the feathers" },
  { id: "pluck", label: "Pluck the feathers from the carcass" },
  { id: "singe", label: "Singe off any remaining fine hairs" },
  { id: "eviscerate", label: "Eviscerate the carcass, removing the internal organs" },
  { id: "wash", label: "Wash the dressed carcass thoroughly before storage or cooking" },
];

const PRACTICE_ITEMS = [
  { text: "Using clean water and clean equipment throughout processing", bucket: "fish" },
  { text: "Slaughtering the bird humanely and quickly to reduce suffering", bucket: "poultry" },
  { text: "Chilling the product soon after processing to slow spoilage", bucket: "fish" },
  { text: "Washing hands and surfaces before and after handling the carcass", bucket: "poultry" },
] as const;

const TERM_MATCH_PROMPTS = [
  "Match each term used in preparing fish or poultry to what it means.",
  "Pair each processing term below with its correct meaning.",
  "Connect each fish/poultry preparation term to its definition.",
  "Match each term to the description that explains it.",
  "Link each preparation term to what it actually involves.",
  "Match each word used in dressing fish or poultry to its meaning.",
];

const FISH_ORDER_PROMPTS = [
  "Arrange the correct order for processing fresh fish for household use.",
  "Put these steps for processing fresh fish into the right order.",
  "Sequence the process of preparing fresh fish correctly.",
  "Arrange these steps in the order someone should follow to process fish at home.",
  "Order these actions the way a household would carry them out when processing fish.",
  "Sort these steps into the order they should happen when preparing fresh fish.",
];

const POULTRY_ORDER_PROMPTS = [
  "Arrange the correct order for dressing a poultry carcass.",
  "Put these steps for dressing a poultry carcass into the right order.",
  "Sequence the process of dressing a poultry carcass correctly.",
  "Arrange these steps in the order someone should follow to dress a bird.",
  "Order these actions the way a household would carry them out when dressing poultry.",
  "Sort these steps into the order they should happen when dressing a poultry carcass.",
];

const HYGIENE_NOTE_PROMPTS = [
  "Sort each ethical/hygiene practice as especially important for fish processing or for poultry dressing.",
  "Decide whether each practice below matters most for fish processing or poultry dressing, and sort it.",
  "Group these ethical/hygiene practices under fish processing or poultry dressing.",
  "Read each practice and sort it as especially important for fish or for poultry preparation.",
  "Sort these practices into whichever process — fish processing or poultry dressing — they matter most for.",
  "Place each practice into the correct bucket — fish processing, or poultry dressing.",
];

const TERM_RECALL_PROMPTS = [
  (detail: string) => `Which term matches this description: "${detail}"?`,
  (detail: string) => `"${detail}" — which preparation term does this describe?`,
  (detail: string) => `Which fish/poultry preparation term is being described here: "${detail}"?`,
  (detail: string) => `Read this description: "${detail}." Which term is it?`,
  (detail: string) => `This describes one preparation step or term: "${detail}." Which one is it?`,
];

export const preparationAnimalProducts: Skill = {
  id: "g8-ag-f-preparation-animal-products",
  code: "F.4",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-food-production",
  grade: 8,
  title: "Preparation of Animal Products",
  description: "Processing fresh fish and dressing poultry carcass — key terms, the correct order of steps, and ethical/hygiene practices.",
  generate(rng) {
    const branch = randChoice(rng, ["term-match", "fish-order", "poultry-order", "hygiene-note", "term-recall"] as const);

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.detail })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Some terms apply to fish, some to poultry — think about what is being removed or loosened at each step.",
        explanation: chosen.map((t) => `${t.label}: ${t.detail}.`).join(" "),
      };
    }

    if (branch === "fish-order") {
      const items = shuffle(rng, FISH_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, FISH_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: FISH_STEPS.map((s) => s.id),
        hint: "Wash before and after removing the scales and organs, and chill it soon after.",
        explanation: FISH_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "poultry-order") {
      const items = shuffle(rng, POULTRY_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, POULTRY_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: POULTRY_STEPS.map((s) => s.id),
        hint: "Feathers must be loosened before plucking, and the carcass is cleaned last.",
        explanation: POULTRY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "hygiene-note") {
      const chosen = shuffle(rng, PRACTICE_ITEMS);
      const buckets = [
        { id: "fish", label: "Especially important for fish processing" },
        { id: "poultry", label: "Especially important for poultry dressing" },
      ];
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, HYGIENE_NOTE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Fish spoils fastest from bacteria and heat; poultry dressing starts with a live animal, so humane handling matters most there.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket === "fish" ? "especially important for fish processing" : "especially important for poultry dressing"}.`).join(" "),
      };
    }

    // term-recall
    const t = randChoice(rng, TERMS);
    const others = TERMS.filter((x) => x.id !== t.id).map((x) => x.label);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, t.label, others, 3);
    return {
      kind: "multiple-choice",
      prompt: randChoice(rng, TERM_RECALL_PROMPTS)(t.detail),
      choices,
      correctIndex,
      hint: "Match the description to the exact processing term it defines.",
      explanation: `${t.label}: ${t.detail}.`,
    };
  },
};
