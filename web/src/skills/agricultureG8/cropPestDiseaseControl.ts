import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const PROBLEMS = [
  { id: "aphids", label: "Aphids", kind: "pest", crop: "kales/sukuma wiki, cabbages", symptom: "Curled, yellowing leaves with tiny sap-sucking insects clustered on the underside" },
  { id: "cutworms", label: "Cutworms", kind: "pest", crop: "tomatoes, cabbages", symptom: "Young seedlings cut off cleanly at the base overnight, near soil level" },
  { id: "diamondback-moth", label: "Diamondback moth larvae", kind: "pest", crop: "cabbages, kales", symptom: "Small holes or windows eaten through the leaf, leaving a thin transparent layer" },
  { id: "whiteflies", label: "Whiteflies", kind: "pest", crop: "tomatoes, kales", symptom: "Tiny white flying insects that scatter when the plant is disturbed, leaving sticky leaves" },
  { id: "blight", label: "Blight", kind: "disease", crop: "tomatoes", symptom: "Dark, water-soaked patches on leaves and stems that spread quickly in wet weather" },
  { id: "damping-off", label: "Damping off", kind: "disease", crop: "seedlings in the nursery", symptom: "Young seedlings collapse and rot at the base soon after germination" },
  { id: "powdery-mildew", label: "Powdery mildew", kind: "disease", crop: "cabbages, kales", symptom: "A white, powdery coating spreading across the surface of leaves" },
  { id: "bacterial-wilt", label: "Bacterial wilt", kind: "disease", crop: "tomatoes", symptom: "A healthy-looking plant wilts suddenly, even with enough soil moisture" },
] as const;

const CONTROL_ITEMS = [
  { text: "Rotating crops so the same vegetable family is not replanted on the same bed each season", bucket: "cultural" },
  { text: "Removing and destroying infected plants promptly", bucket: "cultural" },
  { text: "Introducing ladybirds that feed on aphids", bucket: "biological" },
  { text: "Using a parasitic wasp that attacks diamondback moth larvae", bucket: "biological" },
  { text: "Spraying a recommended pesticide at the correct dose and interval", bucket: "chemical" },
  { text: "Applying a fungicide to control a fungal leaf disease", bucket: "chemical" },
] as const;
const CONTROL_LABEL: Record<string, string> = { cultural: "Cultural control method", biological: "Biological control method", chemical: "Chemical control method" };

const SYMPTOM_MATCH_PROMPTS = [
  "Match each pest or disease to the symptom it causes on vegetable crops.",
  "Pair each pest or disease below with the symptom it produces.",
  "Connect each crop problem to the symptom that reveals it.",
  "Match each pest or disease to the correct description of what it does to the plant.",
  "Link each pest or disease to the sign a farmer would notice.",
  "Match each pest/disease to the statement describing its damage.",
];

const PEST_DISEASE_SORT_PROMPTS = [
  "Sort each problem as a pest or a disease affecting vegetable crops.",
  "Decide whether each problem below is a pest or a disease, and sort it.",
  "Group these crop problems under pest or disease.",
  "Read each name and sort it as a pest or a disease.",
  "Sort these vegetable crop problems into pest or disease.",
  "Place each problem into the correct category — pest, or disease.",
];

const CONTROL_SORT_PROMPTS = [
  "Sort each pest/disease control action as cultural, biological, or chemical control.",
  "Decide whether each control action below is cultural, biological, or chemical, and sort it.",
  "Group these control actions under cultural, biological, or chemical control.",
  "Read each action and sort it into cultural, biological, or chemical control.",
  "Sort these pest/disease control methods into their correct category.",
  "Place each control action into the right bucket — cultural, biological, or chemical.",
];

const CHART_COMPARE_PROMPTS = [
  (label: string) => `A farmer counted the number of plants showing ${label} damage before and after applying a control method. Based on the chart, was the control method effective?`,
  (label: string) => `The chart shows plants affected by ${label} before and after a control method was applied. Did the control method work?`,
  (label: string) => `After treating a ${label} outbreak, a farmer recorded affected plant counts. Looking at the chart, was the treatment effective?`,
  (label: string) => `This chart compares ${label}-affected plants before and after control. Was the control method a success?`,
  (label: string) => `A farmer tracked ${label} damage before and after acting on it. What does the chart suggest about the control method's effectiveness?`,
];

const IPM_ORDER_PROMPTS = [
  "Arrange the correct order of an integrated pest management (IPM) approach to a crop problem.",
  "Put these steps of an IPM approach into the right order.",
  "Sequence the integrated pest management process correctly.",
  "Arrange these steps in the order a farmer should follow an IPM approach.",
  "Order these actions the way a farmer would carry them out in an IPM approach.",
  "Sort these steps into the order they should happen in integrated pest management.",
];

const SYMPTOM_RECALL_PROMPTS = [
  (crop: string, symptom: string) => `A vegetable crop (${crop}) shows this symptom: "${symptom}." Which pest or disease is most likely responsible?`,
  (crop: string, symptom: string) => `On ${crop}, a farmer notices: "${symptom}." Which pest or disease is most likely the cause?`,
  (crop: string, symptom: string) => `"${symptom}" — seen on ${crop}. Which pest or disease is the likely culprit?`,
  (crop: string, symptom: string) => `A farmer growing ${crop} spots this sign: "${symptom}." What pest or disease is most likely responsible?`,
  (crop: string, symptom: string) => `This symptom appears on ${crop}: "${symptom}." Which pest or disease best explains it?`,
];

const IPM_STEPS = [
  { id: "scout", label: "Scout the field regularly to identify the pest or disease early" },
  { id: "identify", label: "Correctly identify the specific pest or disease and the crop it affects" },
  { id: "decide", label: "Decide whether the level of damage justifies control action" },
  { id: "choose", label: "Choose the least harmful effective method first — cultural or biological before chemical" },
  { id: "apply", label: "Apply the chosen control method correctly and safely" },
  { id: "monitor", label: "Monitor the crop afterwards to check the method worked" },
];

export const cropPestDiseaseControl: Skill = {
  id: "g8-ag-f-crop-pest-disease-control",
  code: "F.3",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-food-production",
  grade: 8,
  title: "Crop Pest and Disease Control",
  description: "Identifying pests and diseases on vegetable crops, distinguishing pests from diseases, cultural/biological/chemical control methods, and integrated pest management.",
  generate(rng) {
    const branch = randChoice(rng, ["symptom-match", "pest-disease-sort", "control-sort", "chart-compare", "ipm-order", "symptom-recall"] as const);

    if (branch === "symptom-match") {
      const chosen = shuffle(rng, PROBLEMS).slice(0, randInt(rng, 5, 6));
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.symptom })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, SYMPTOM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Pests leave physical damage from feeding; diseases usually change the plant's colour, texture, or health overall.",
        explanation: chosen.map((p) => `${p.label} (${p.crop}): ${p.symptom}.`).join(" "),
      };
    }

    if (branch === "pest-disease-sort") {
      const chosen = shuffle(rng, PROBLEMS).slice(0, 6);
      const buckets = [
        { id: "pest", label: "Pest" },
        { id: "disease", label: "Disease" },
      ];
      const items = chosen.map((p) => ({ id: p.id, label: p.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p) => (correctBucket[p.id] = p.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PEST_DISEASE_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "A pest is a living organism that feeds on or damages the plant directly; a disease is caused by pathogens like fungi or bacteria.",
        explanation: chosen.map((p) => `${p.label} is a ${p.kind} affecting ${p.crop}.`).join(" "),
      };
    }

    if (branch === "control-sort") {
      const chosen = shuffle(rng, CONTROL_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: CONTROL_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CONTROL_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Cultural = farming practice change; biological = using another living organism; chemical = a manufactured pesticide or fungicide.",
        explanation: chosen.map((c) => `"${c.text}" — ${CONTROL_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "chart-compare") {
      const p = randChoice(rng, PROBLEMS);
      const before = randInt(rng, 40, 80);
      const after = randInt(rng, 5, 20);
      const data = shuffle(rng, [
        { label: "Before control", value: before },
        { label: "After control", value: after },
      ]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, CHART_COMPARE_PROMPTS)(p.label),
        visual: { type: "bar-chart", data },
        choices: ["Yes — the number of affected plants fell sharply", "No — the number of affected plants increased", "The chart shows no change either way"],
        correctIndex: 0,
        hint: "Compare the height of the 'before' bar to the 'after' bar.",
        explanation: `Affected plants fell from ${before} to ${after} after control was applied, showing the method worked against ${p.label.toLowerCase()}.`,
      };
    }

    if (branch === "ipm-order") {
      const items = shuffle(rng, IPM_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, IPM_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: IPM_STEPS.map((s) => s.id),
        hint: "You must find and identify the problem before deciding how — or whether — to act.",
        explanation: IPM_STEPS.map((s) => s.label).join(" → "),
      };
    }

    // fallback: recall
    const p = randChoice(rng, PROBLEMS);
    const others = PROBLEMS.filter((x) => x.id !== p.id).map((x) => x.label);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, p.label, others, 3);
    return {
      kind: "multiple-choice",
      prompt: randChoice(rng, SYMPTOM_RECALL_PROMPTS)(p.crop, p.symptom),
      choices,
      correctIndex,
      hint: "Match the symptom described to the pest or disease known to cause it.",
      explanation: `${p.label}: ${p.symptom}.`,
    };
  },
};
