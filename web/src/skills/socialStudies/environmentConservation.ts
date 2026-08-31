import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ITEMS: { text: string; bucket: "cause" | "effect" | "measure" }[] = [
  { text: "Cutting down forests for farmland or fuel", bucket: "cause" },
  { text: "Overgrazing by livestock", bucket: "cause" },
  { text: "Dumping waste into rivers", bucket: "cause" },
  { text: "Poor farming methods, like ploughing along a slope", bucket: "cause" },
  { text: "Overexploitation of natural resources such as minerals and forests", bucket: "cause" },
  { text: "Uncontrolled charcoal burning", bucket: "cause" },
  { text: "Soil erosion and loss of fertile topsoil", bucket: "effect" },
  { text: "Loss of biodiversity and habitats", bucket: "effect" },
  { text: "Increased flooding as bare land absorbs less water", bucket: "effect" },
  { text: "Desertification of previously productive land", bucket: "effect" },
  { text: "Pollution of rivers and reduced access to clean water", bucket: "effect" },
  { text: "Afforestation and re-planting trees", bucket: "measure" },
  { text: "Terracing farmland on slopes", bucket: "measure" },
  { text: "Proper waste disposal and recycling", bucket: "measure" },
  { text: "Enforcing environmental conservation laws", bucket: "measure" },
  { text: "Practising sustainable farming methods, like contour ploughing", bucket: "measure" },
  { text: "Creating community awareness campaigns on conservation", bucket: "measure" },
];

const CAUSE_EFFECT_PAIRS: { cause: string; effect: string }[] = [
  { cause: "Cutting down forests for farmland or fuel", effect: "Loss of habitat and biodiversity" },
  { cause: "Overgrazing by livestock", effect: "Loss of vegetation cover and accelerated soil erosion" },
  { cause: "Dumping waste into rivers", effect: "Water pollution that harms aquatic life and human health" },
  { cause: "Ploughing along a slope instead of across it", effect: "Rainwater washes away fertile topsoil faster" },
  { cause: "Removing vegetation cover from large areas of land", effect: "Bare land absorbs less water, increasing flood risk" },
  { cause: "Overexploitation of natural resources such as minerals and forests", effect: "Depletion of resources that future generations depend on" },
  { cause: "Uncontrolled charcoal burning", effect: "Deforestation and reduced tree cover in the affected area" },
  { cause: "Industrial and vehicle emissions", effect: "Air pollution that affects human and environmental health" },
];

const AFFORESTATION_STEPS = [
  { id: "site", label: "Identify a suitable site for planting" },
  { id: "nursery", label: "Prepare tree seedlings in a nursery" },
  { id: "plant", label: "Plant the seedlings at the right spacing and season" },
  { id: "protect", label: "Protect young trees from fire, animals, and drought" },
  { id: "monitor", label: "Monitor and maintain the growing trees" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The process by which land loses its productive quality due to human or natural factors is called environmental ", after: ".", correctAnswer: "degradation", accepted: ["degradation"], explanation: "Environmental degradation is the process by which land loses its productive quality due to human or natural factors." },
  { before: "Planting trees on land that previously had few or none is called ", after: ".", correctAnswer: "afforestation", accepted: ["afforestation"], explanation: "Afforestation is planting trees on land that previously had few or no trees, helping restore cover and prevent erosion." },
  { before: "Building stepped platforms across a slope to reduce soil erosion is called ", after: ".", correctAnswer: "terracing", accepted: ["terracing"], explanation: "Terracing builds stepped platforms across a slope, slowing water flow and reducing soil erosion." },
  { before: "The variety of plant and animal life in an area or ecosystem is called ", after: ".", correctAnswer: "biodiversity", accepted: ["biodiversity"], explanation: "Biodiversity is the variety of plant and animal life found in an area or ecosystem." },
  { before: "The wearing away of fertile topsoil by water, wind, or poor land use is called soil ", after: ".", correctAnswer: "erosion", accepted: ["erosion"], explanation: "Soil erosion is the wearing away of fertile topsoil by water, wind, or poor land-use practices." },
  { before: "Using resources in a way that meets today's needs without harming future generations' ability to meet theirs is called ", after: " development.", correctAnswer: "sustainable", accepted: ["sustainable"], explanation: "Sustainable development meets present needs without compromising the ability of future generations to meet their own needs." },
  { before: "The clearing of forests, often for farmland, settlement, or fuel, is called ", after: ".", correctAnswer: "deforestation", accepted: ["deforestation"], explanation: "Deforestation is the clearing of forests, often for farmland, settlement, or fuel." },
  { before: "The process by which fertile land turns into desert-like conditions is called ", after: ".", correctAnswer: "desertification", accepted: ["desertification"], explanation: "Desertification is the process by which fertile land turns into desert-like, unproductive conditions." },
] as const;

export const environmentConservation: Skill = {
  id: "ss-nhbe-environment-conservation",
  code: "NHBE.4",
  subjectId: "social-studies",
  strandId: "ss-nhbe",
  grade: 9,
  title: "Management and conservation of the environment",
  description: "Causes and effects of environmental degradation, and measures used to manage and conserve the environment.",
  generate(rng) {
    const hint = "Causes lead to degradation, effects are the resulting harm, and measures are deliberate actions to fix or prevent it.";
    const bucketLabel: Record<string, string> = { cause: "Cause", effect: "Effect", measure: "Conservation measure" };
    const branch = randChoice(rng, ["mc", "categorize", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CAUSE_EFFECT_PAIRS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `c${i}`, label: p.cause })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `c${i}`, label: p.effect })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`c${i}`] = `c${i}`));
      return {
        kind: "click-match",
        prompt: "Match each cause of environmental degradation to its direct effect.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what naturally happens to land, water, or habitats when each cause takes place.",
        explanation: chosen.map((p) => `${p.cause} → ${p.effect}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about environmental management and conservation.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [fb.correctAnswer.toLowerCase(), ...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe environmental degradation and conservation measures.",
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, AFFORESTATION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps of an afforestation (tree-planting) conservation project in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: AFFORESTATION_STEPS.map((s) => s.id),
        hint: "You need seedlings before you can plant them, and young trees need protection before they can be left to grow unattended.",
        explanation: AFFORESTATION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "mc") {
      const target = randChoice(rng, ITEMS);
      const otherBuckets = (["cause", "effect", "measure"] as const).filter((b) => b !== target.bucket);
      const choices = shuffle(rng, [bucketLabel[target.bucket], ...otherBuckets.map((b) => bucketLabel[b])]);

      return {
        kind: "multiple-choice",
        prompt: `Is "${target.text}" a cause, an effect, or a conservation measure?`,
        choices,
        correctIndex: choices.indexOf(bucketLabel[target.bucket]),
        layout: "list",
        hint,
        explanation: `"${target.text}" is a${target.bucket === "effect" ? "n" : ""} ${bucketLabel[target.bucket].toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, ITEMS).slice(0, 6);
    const items = chosen.map((it, i) => ({ id: `i${i}`, label: it.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((it, i) => (correctBucket[`i${i}`] = it.bucket));

    return {
      kind: "categorize",
      prompt: "Sort each statement: is it a cause of environmental degradation, an effect of it, or a conservation measure?",
      items,
      buckets: [
        { id: "cause", label: "Cause" },
        { id: "effect", label: "Effect" },
        { id: "measure", label: "Conservation measure" },
      ],
      correctBucket,
      hint,
      explanation: chosen.map((it) => `"${it.text}" is a${it.bucket === "effect" ? "n" : ""} ${it.bucket === "measure" ? "conservation measure" : it.bucket}.`).join(" "),
    };
  },
};
