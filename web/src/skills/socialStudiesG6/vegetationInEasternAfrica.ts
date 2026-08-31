import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type Vegetation = "rainforest" | "savanna" | "desert-scrub" | "montane" | "mangrove";

interface VegInfo {
  type: Vegetation;
  label: string;
  characteristic: string;
  conservation: string;
}

const VEGETATION: readonly VegInfo[] = [
  { type: "rainforest", label: "Tropical rainforest", characteristic: "a dense, tall, evergreen canopy that thrives on very high rainfall near the Equator", conservation: "protecting forest reserves from illegal logging" },
  { type: "savanna", label: "Savanna grassland and woodland", characteristic: "open grassland with scattered drought-resistant trees such as acacia", conservation: "avoiding overgrazing by controlling how many animals graze the land at once" },
  { type: "desert-scrub", label: "Desert (semi-desert) scrub", characteristic: "sparse, thorny, drought-resistant shrubs that survive on very little rainfall", conservation: "avoiding bush burning, which destroys the little vegetation that survives" },
  { type: "montane", label: "Highland (montane) vegetation", characteristic: "bamboo forest and moorland grasses found on cool, high mountain slopes", conservation: "protecting mountain water catchment areas from clearing" },
  { type: "mangrove", label: "Mangrove and swamp vegetation", characteristic: "salt-tolerant trees with roots standing in water, found along the coast", conservation: "replanting mangroves to protect the shoreline from erosion" },
] as const;

function characteristicMc(rng: () => number): ScenarioMC {
  const v = randChoice(rng, VEGETATION);
  const others = shuffle(rng, VEGETATION.filter((o) => o.type !== v.type)).slice(0, 3);
  return {
    prompt: `Which characteristic best describes ${v.label.toLowerCase()}?`,
    correct: v.characteristic.charAt(0).toUpperCase() + v.characteristic.slice(1),
    wrong: others.map((o) => o.characteristic.charAt(0).toUpperCase() + o.characteristic.slice(1)),
    explanation: `${v.label} has ${v.characteristic}.`,
  };
}

// Mount Kenya's real vegetation zonation from base to summit — a genuine, verifiable sequence.
const MOUNTAIN_ZONES = [
  { id: "z1", label: "Farmland and savanna at the mountain's base" },
  { id: "z2", label: "Montane (highland) forest on the lower slopes" },
  { id: "z3", label: "Bamboo forest higher up the slopes" },
  { id: "z4", label: "Moorland grasses near the summit" },
] as const;

export const vegetationInEasternAfrica: Skill = {
  id: "g6-ss-env-vegetation-in-eastern-africa",
  code: "E.4",
  subjectId: "social-studies",
  strandId: "g6-ss-environments",
  grade: 6,
  title: "Vegetation in Eastern Africa",
  description: "Identifying Eastern Africa's vegetation types, their characteristics, and how to conserve them.",
  generate(rng) {
    const branch = randChoice(rng, ["characteristic-mc", "fill-blank", "click-match", "categorize-conserve", "ordering"] as const);

    if (branch === "characteristic-mc") {
      const q = characteristicMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about how much rainfall the area gets and where in Eastern Africa the vegetation type is found.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Dense, tall, evergreen forest that grows where rainfall is very high is called", after: ".", correct: "rainforest" }),
        () => ({ before: "Open grassland with scattered acacia trees is called", after: ".", correct: "savanna" }),
        () => ({ before: "Sparse, thorny shrubs that survive on very little rain make up", after: "vegetation.", correct: "desert" }),
        () => ({ before: `${name} climbs a mountain and finds bamboo forest, which is typical of`, after: "vegetation.", correct: "montane" }),
        () => ({ before: "Salt-tolerant trees standing in water along the coast make up", after: "vegetation.", correct: "mangrove" }),
        () => ({ before: "Grasses found on cool, high mountain slopes above the bamboo zone are called", after: ".", correct: "moorland" }),
        () => ({ before: "Planting new trees to replace lost forest cover is called", after: ".", correct: "afforestation" }),
        () => ({ before: "Allowing too many animals to graze the same land, which destroys savanna grass, is called", after: ".", correct: "overgrazing" }),
        () => ({ before: "Deliberately setting fire to bushland, which destroys desert-scrub vegetation, is called", after: ".", correct: "bush burning" }),
        () => ({ before: "Replanting coastal trees with roots in salty water helps protect the shoreline from", after: ".", correct: "erosion" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about vegetation in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Match the description to the vegetation type or conservation practice.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...VEGETATION]);
      const tokens = chosen.map((v) => ({ id: v.type, label: v.label }));
      const targets = shuffle(rng, chosen).map((v) => ({ id: v.type, label: v.conservation.charAt(0).toUpperCase() + v.conservation.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.type] = v.type;
      return {
        kind: "click-match",
        prompt: "Match each vegetation type to the best way to conserve it.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the biggest threat each vegetation type faces.",
        explanation: chosen.map((v) => `${v.label}: best conserved by ${v.conservation}.`).join(" "),
      };
    }

    if (branch === "categorize-conserve") {
      // Critical-thinking/Evaluate branch — Core Competencies box names "Critical thinking and problem
      // solving" for this sub-strand, so every draw of this branch requires judging a described action
      // against a specific vegetation type, not bare recall.
      const place = g6SsPlace(rng);
      const actions = [
        { id: "a1", label: `Farmers near ${place} plant new trees in a cleared savanna woodland`, bucket: "protective" },
        { id: "a2", label: "Herders let their cattle graze the same small patch of savanna grass all year round", bucket: "harmful" },
        { id: "a3", label: "A community group replants mangrove seedlings along an eroding coastline", bucket: "protective" },
        { id: "a4", label: "Charcoal burners clear a montane forest slope without replanting it", bucket: "harmful" },
        { id: "a5", label: "A county government protects a mountain water catchment area from clearing", bucket: "protective" },
        { id: "a6", label: "Herders set fire to desert scrubland to clear it for grazing", bucket: "harmful" },
        { id: "a7", label: "A school plants indigenous trees to restore a cleared forest reserve", bucket: "protective" },
        { id: "a8", label: "Loggers cut down rainforest trees without a replanting plan", bucket: "harmful" },
      ] as const;
      const chosen = shuffle(rng, actions).slice(0, 6);
      const items = chosen.map((a) => ({ id: a.id, label: a.label }));
      const buckets = [
        { id: "protective", label: "Protects vegetation" },
        { id: "harmful", label: "Harms vegetation" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a) => (correctBucket[a.id] = a.bucket));
      return {
        kind: "categorize",
        prompt: "Judge each described action: does it protect or harm the vegetation involved?",
        items,
        buckets,
        correctBucket,
        hint: "An action that replaces, restores, or limits use of vegetation protects it; one that clears or overuses it harms it.",
        explanation: chosen.map((a) => `"${a.label}" ${a.bucket === "protective" ? "protects" : "harms"} the vegetation.`).join(" "),
      };
    }

    // ordering — Mount Kenya's real vegetation zonation from base to summit.
    return {
      kind: "ordering",
      prompt: "Arrange these vegetation zones on a mountain such as Mount Kenya, from the base to the summit.",
      items: shuffle(rng, MOUNTAIN_ZONES),
      correctOrder: MOUNTAIN_ZONES.map((z) => z.id),
      instruction: "Base of the mountain first, summit last.",
      hint: "It gets colder and windier the higher you climb, so tall forest gives way to shorter, hardier vegetation.",
      explanation: `From base to summit: ${MOUNTAIN_ZONES.map((z) => z.label).join(", ")}.`,
    };
  },
};
