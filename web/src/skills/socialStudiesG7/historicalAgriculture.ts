import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const REGION_LABEL: Record<string, string> = {
  "rift-valley": "The Rift Valley of Eastern Africa",
  egypt: "Egypt",
  nubia: "Nubia",
};

const REGION_FACTS = [
  { text: "Early communities here kept cattle and cultivated sorghum and finger millet", region: "rift-valley" },
  { text: "Volcanic soils and a favourable climate supported some of the earliest crop growing and livestock keeping in Africa", region: "rift-valley" },
  { text: "Grassland here supported cattle herding alongside crop growing in mixed farming systems", region: "rift-valley" },
  { text: "Wheat and barley were the main crops grown on the fertile floodplain created by the Nile's annual flooding", region: "egypt" },
  { text: "Farmers used basin irrigation, trapping the Nile's floodwater in diked fields to soak the soil", region: "egypt" },
  { text: "The shaduf, a hand-operated lever with a bucket on one end, was used to lift river water onto higher fields", region: "egypt" },
  { text: "Grain surpluses grown here were stored in granaries and used to feed workers who built the pyramids", region: "egypt" },
  { text: "Situated south of Egypt along the Nile, farmers here grew crops similar to Egypt's and kept cattle, sheep, and goats", region: "nubia" },
  { text: "Agricultural surplus produced here was traded with Egypt along the Nile River", region: "nubia" },
  { text: "Farmers here also relied on the Nile's flooding, though on a narrower strip of fertile land than Egypt", region: "nubia" },
] as const;

const REGION_DESCRIPTIONS = [
  { region: "rift-valley", desc: "A region of Eastern Africa with volcanic soils and grassland where early communities kept cattle and grew sorghum and millet" },
  { region: "egypt", desc: "A region along the lower Nile where farmers depended on the river's annual flooding and used the shaduf and basin irrigation" },
  { region: "nubia", desc: "A region south of Egypt along the Nile that grew crops similar to Egypt's and traded agricultural surplus with its northern neighbour" },
] as const;

const CONTRIBUTIONS = [
  "Surplus food production allowed some people to specialise in non-farming activities like crafts, trade, and administration",
  "The need to record harvests and taxes contributed to the early development of writing and record-keeping",
  "Observing the Nile's annual flooding pattern helped develop one of the earliest calendar systems",
  "Organising large-scale irrigation projects encouraged cooperation and the growth of organised government",
  "Stored food surpluses supported growing towns and cities, which could not have existed on hunting and gathering alone",
  "Trading agricultural surplus along the Nile linked communities and encouraged long-distance trade networks",
  "Tools and techniques developed for irrigation, such as the shaduf, spread and influenced farming elsewhere",
  "Reliable food production gave rulers the resources needed to build monuments and support large workforces",
] as const;

const IRRIGATION_STEPS = [
  { id: "flood", label: "The Nile River floods and rises each year" },
  { id: "divert", label: "Floodwater is diverted through channels into diked basins along the riverbank" },
  { id: "soak", label: "The water is retained in the basins so the soil can soak up moisture and fertile silt" },
  { id: "drain", label: "Excess water is drained back into the river or passed on to the next basin" },
  { id: "plant", label: "Once the soil is moist and fertile, farmers plough and plant their crops" },
] as const;

export const historicalAgriculture: Skill = {
  id: "g7-ss-nhbe-historical-agriculture",
  code: "NHBE.2",
  subjectId: "social-studies",
  strandId: "g7-ss-nhbe",
  grade: 7,
  title: "Historical development of agriculture",
  description: "Early areas of agriculture in Africa (the Rift Valley, Egypt, Nubia), crops and animals kept, irrigation methods along the Nile, and agriculture's contribution to world civilisation.",
  generate(rng) {
    const branch = randChoice(rng, ["region-facts", "region-match", "contribution", "irrigation-order"] as const);

    if (branch === "region-facts") {
      const chosen = shuffle(rng, REGION_FACTS).slice(0, 6);
      const regionIds = Array.from(new Set(chosen.map((f) => f.region)));
      const buckets = regionIds.map((r) => ({ id: r, label: REGION_LABEL[r] }));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.region));
      return {
        kind: "categorize",
        prompt: "Sort each fact about early agriculture in Africa into the region it describes.",
        items,
        buckets,
        correctBucket,
        hint: "Egypt and Nubia both depended on the Nile, but the Rift Valley of Eastern Africa relied on volcanic soils and rainfall instead.",
        explanation: chosen.map((f) => `"${f.text}" — describes ${REGION_LABEL[f.region]}.`).join(" "),
      };
    }

    if (branch === "region-match") {
      const chosen = shuffle(rng, [...REGION_DESCRIPTIONS]);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.region, label: REGION_LABEL[r.region] })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.region, label: r.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((r) => (correctMap[r.region] = r.region));
      return {
        kind: "click-match",
        prompt: "Match each region where early agriculture was practised in Africa to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about each region's location relative to the Nile River and Eastern Africa's Rift Valley.",
        explanation: chosen.map((r) => `${REGION_LABEL[r.region]}: ${r.desc}.`).join(" "),
      };
    }

    if (branch === "contribution") {
      const correct = randChoice(rng, CONTRIBUTIONS);
      const others = CONTRIBUTIONS.filter((c) => c !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of the following best describes a contribution of Nile valley agriculture to world civilisation?",
        choices,
        correctIndex,
        hint: "Think about what became possible once Nile valley farmers could reliably produce more food than they needed.",
        explanation: `${correct} — this is one of the key contributions of Nile valley agriculture to world civilisation.`,
      };
    }

    // irrigation-order
    const items = shuffle(rng, IRRIGATION_STEPS.map((s) => ({ id: s.id, label: s.label })));
    return {
      kind: "ordering",
      prompt: "Ancient Egyptian farmers used basin irrigation to grow crops along the Nile. Arrange the steps of basin irrigation in the correct order.",
      instruction: "Order the steps from what happens first to what happens last.",
      items,
      correctOrder: IRRIGATION_STEPS.map((s) => s.id),
      hint: "Everything begins with the Nile's annual flood and ends with planting once the soil is fertile.",
      explanation: IRRIGATION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
    };
  },
};
