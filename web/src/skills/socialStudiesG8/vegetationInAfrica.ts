import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const VEGETATION_REGIONS = [
  { region: "Tropical rainforest", characteristic: "Dense, tall evergreen trees forming a thick canopy, found where rainfall is high all year" },
  { region: "Savanna grassland", characteristic: "Open grassland scattered with drought-resistant trees like acacia, found where rainfall has a wet and dry season" },
  { region: "Desert vegetation", characteristic: "Sparse, drought-resistant plants such as cacti and thorny shrubs adapted to very low rainfall" },
  { region: "Mediterranean vegetation", characteristic: "Small evergreen shrubs and trees with thick, waxy leaves adapted to hot, dry summers" },
  { region: "Mountain vegetation", characteristic: "Vegetation changes with altitude, from forest at the base to grassland and bare rock near the peak" },
] as const;

const RAINFALL_ORDER = [
  { region: "Tropical rainforest", id: "tropical-rainforest" },
  { region: "Mountain vegetation", id: "mountain" },
  { region: "Savanna grassland", id: "savanna" },
  { region: "Mediterranean vegetation", id: "mediterranean" },
  { region: "Desert vegetation", id: "desert" },
] as const;

const CONSERVATION_METHODS = [
  { method: "Afforestation", meaning: "Planting new trees in an area that previously had no forest" },
  { method: "Reforestation", meaning: "Replanting trees in an area where forest has been cleared or destroyed" },
  { method: "Controlled grazing", meaning: "Limiting the number of livestock and rotating grazing areas to prevent overgrazing" },
  { method: "Creating protected areas", meaning: "Setting aside national parks and reserves where vegetation cannot be cleared" },
] as const;

const CARE_STATEMENTS = [
  { text: "Cutting down forests faster than new trees can grow", bucket: "harm" },
  { text: "Overgrazing livestock on the same grassland without giving it time to recover", bucket: "harm" },
  { text: "Clearing vegetation along riverbanks, causing soil erosion", bucket: "harm" },
  { text: "Planting trees in schools and along roadsides", bucket: "conserve" },
  { text: "Practising controlled, rotational grazing", bucket: "conserve" },
  { text: "Protecting water catchment areas from clearing", bucket: "conserve" },
] as const;

const BUCKET_LABEL: Record<string, string> = { harm: "Harms vegetation", conserve: "Helps conserve vegetation" };

export const vegetationInAfrica: Skill = {
  id: "g8-ss-nhbe-vegetation",
  code: "NHBE.3",
  subjectId: "social-studies",
  strandId: "g8-ss-nhbe",
  grade: 8,
  title: "Vegetation in Africa",
  description: "Major vegetation regions of Africa and their characteristics, factors influencing vegetation distribution, and methods of conserving vegetation.",
  generate(rng) {
    const branch = randChoice(rng, ["name-region", "match", "factors", "conserve-classify"] as const);

    if (branch === "name-region") {
      const r = randChoice(rng, VEGETATION_REGIONS);
      const others = VEGETATION_REGIONS.filter((v) => v.region !== r.region).map((v) => v.region);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, r.region, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which major vegetation region of Africa is described as: "${r.characteristic}"?`,
        choices,
        correctIndex,
        hint: "Think about rainfall amount and how it shapes the type of plants that can survive.",
        explanation: `${r.region}: ${r.characteristic}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, VEGETATION_REGIONS.map((v) => ({ id: v.region, label: v.region })));
      const targets = shuffle(rng, VEGETATION_REGIONS.map((v) => ({ id: v.region, label: v.characteristic })));
      const correctMap: Record<string, string> = {};
      for (const v of VEGETATION_REGIONS) correctMap[v.region] = v.region;
      return {
        kind: "click-match",
        prompt: "Match each vegetation region to its characteristic.",
        tokens,
        targets,
        correctMap,
        hint: "Each region's plant life is shaped mainly by how much rainfall and heat it receives.",
        explanation: VEGETATION_REGIONS.map((v) => `${v.region}: ${v.characteristic}.`).join(" "),
      };
    }

    if (branch === "factors") {
      const items = shuffle(rng, RAINFALL_ORDER.map((r) => ({ id: r.id, label: r.region })));
      return {
        kind: "ordering",
        prompt: "Rainfall is a key factor influencing vegetation distribution. Arrange these vegetation regions from the highest average rainfall to the lowest.",
        instruction: "Drag to reorder from highest rainfall to lowest rainfall.",
        items,
        correctOrder: RAINFALL_ORDER.map((r) => r.id),
        hint: "Rainforests need constant heavy rain; deserts survive on almost none.",
        explanation: RAINFALL_ORDER.map((r, i) => `${i + 1}. ${r.region}.`).join(" "),
      };
    }

    // conserve-classify — mixes conservation-methods questions with harm/conserve statements for topical breadth.
    const useMethod = randChoice(rng, [true, false]);
    if (useMethod) {
      const chosen = shuffle(rng, [...CONSERVATION_METHODS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.method, label: c.method })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.method, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.method] = c.method;
      return {
        kind: "click-match",
        prompt: "Match each vegetation conservation method to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some methods restore lost vegetation, others prevent further loss.",
        explanation: chosen.map((c) => `${c.method}: ${c.meaning}.`).join(" "),
      };
    }
    const chosen = shuffle(rng, CARE_STATEMENTS).slice(0, 6);
    const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each practice into whether it harms or helps conserve vegetation.",
      items,
      buckets,
      correctBucket,
      hint: "Practices that remove vegetation faster than it can regrow cause harm; deliberate protection or replanting helps conserve it.",
      explanation: chosen.map((c) => `"${c.text}" — ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
    };
  },
};
