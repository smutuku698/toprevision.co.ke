import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CLIMATE_REGIONS = [
  {
    region: "Desert",
    characteristic: "Very low rainfall (under 250mm a year) and extreme temperature swings between day and night",
    rainfall: [3, 2, 1, 1, 2, 3, 2, 2, 1, 2, 3, 2],
  },
  {
    region: "Semi-desert",
    characteristic: "Low, unreliable rainfall supporting only scattered thorny bushes and short grass",
    rainfall: [10, 8, 15, 20, 25, 15, 10, 8, 12, 20, 25, 15],
  },
  {
    region: "Tropical",
    characteristic: "High temperatures all year with a distinct wet season and a dry season",
    rainfall: [60, 80, 150, 220, 180, 60, 20, 15, 40, 120, 160, 90],
  },
  {
    region: "Mediterranean",
    characteristic: "Hot, dry summers and mild, wet winters",
    rainfall: [90, 80, 60, 30, 10, 2, 1, 2, 15, 50, 85, 95],
  },
  {
    region: "Mountain",
    characteristic: "Temperature falls as altitude increases, with heavier rainfall on windward slopes",
    rainfall: [80, 90, 130, 160, 140, 90, 70, 75, 100, 150, 170, 110],
  },
] as const;

const FACTORS = [
  { text: "Altitude — higher places are generally cooler than lowland areas", region: "Mountain" },
  { text: "Distance from the equator (latitude) — areas near the equator tend to be hot all year", region: "Tropical" },
  { text: "Ocean currents — cold currents flowing along a coast can reduce rainfall and create desert conditions", region: "Desert" },
  { text: "Distance from the sea (continentality) — places far inland receive less rainfall", region: "Semi-desert" },
  { text: "Wind belts and pressure systems bring dry, sinking air over the subtropics for much of the year", region: "Mediterranean" },
] as const;

const HUMAN_ACTIVITY_EFFECTS = [
  { text: "Farmers in tropical regions plan planting around the reliable wet season", bucket: "tropical" },
  { text: "Pastoralists in semi-desert regions move livestock seasonally to find pasture and water", bucket: "semi-desert" },
  { text: "Farmers in Mediterranean climates grow drought-resistant crops like olives and grapes suited to dry summers", bucket: "mediterranean" },
  { text: "People in desert regions build homes with thick walls to stay cool during extreme heat", bucket: "desert" },
] as const;

const REGION_KEY: Record<string, string> = { tropical: "Tropical", "semi-desert": "Semi-desert", mediterranean: "Mediterranean", desert: "Desert" };

const STRESS_STRATEGIES = [
  "Talk about your feelings with a trusted family member, friend, or counsellor",
  "Focus on practical actions you can take to help your household recover",
  "Maintain a normal routine, such as regular meals and sleep, as much as possible",
  "Stay informed through reliable sources instead of panicking over rumours",
] as const;

export const weatherAndClimate: Skill = {
  id: "g8-ss-nhbe-weather-climate",
  code: "NHBE.2",
  subjectId: "social-studies",
  strandId: "g8-ss-nhbe",
  grade: 8,
  title: "Weather and climate",
  description: "Major climatic regions of Africa (desert, semi-desert, tropical, Mediterranean, mountain), factors influencing climate, effects of climate on human activities, and managing disaster-related stress.",
  generate(rng) {
    const branch = randChoice(rng, ["read-graph", "name-region", "factors", "human-activity", "stress"] as const);

    if (branch === "read-graph") {
      const r = randChoice(rng, CLIMATE_REGIONS);
      const points = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((label, i) => ({ label, value: r.rainfall[i] }));
      const others = CLIMATE_REGIONS.filter((c) => c.region !== r.region).map((c) => c.region);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, r.region, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "This graph shows monthly rainfall (mm) for one climatic region in Africa. Which climatic region does it most likely show?",
        visual: { type: "line-graph", points },
        choices,
        correctIndex,
        hint: `Recall the characteristic: ${r.characteristic.toLowerCase()}.`,
        explanation: `This rainfall pattern matches the ${r.region} climate: ${r.characteristic.toLowerCase()}.`,
      };
    }

    if (branch === "name-region") {
      const r = randChoice(rng, CLIMATE_REGIONS);
      return {
        kind: "fill-blank",
        prompt: `Which climatic region of Africa is characterised by: ${r.characteristic.toLowerCase()}?`,
        before: "",
        after: "",
        correctAnswer: r.region,
        inputMode: "text",
        hint: "Match the description to one of: Desert, Semi-desert, Tropical, Mediterranean, or Mountain.",
        explanation: `${r.region} climate: ${r.characteristic}.`,
      };
    }

    if (branch === "factors") {
      const chosen = shuffle(rng, [...FACTORS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((f, i) => ({ id: `f${i}`, label: f.text })));
      const targets = shuffle(rng, chosen.map((f, i) => ({ id: `f${i}`, label: `Best shown by the ${f.region} climate` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((f, i) => (correctMap[`f${i}`] = `f${i}`));
      return {
        kind: "click-match",
        prompt: "Match each factor influencing climate to the climatic region it best explains.",
        tokens,
        targets,
        correctMap,
        hint: "Each factor — altitude, latitude, ocean currents, distance from the sea, or wind belts — shapes a particular type of climate.",
        explanation: chosen.map((f) => `${f.text} — this factor explains the ${f.region} climate.`).join(" "),
      };
    }

    if (branch === "human-activity") {
      const chosen = shuffle(rng, HUMAN_ACTIVITY_EFFECTS).slice(0, 4);
      const buckets = Array.from(new Set(chosen.map((h) => h.bucket))).map((b) => ({ id: b, label: REGION_KEY[b] }));
      const items = chosen.map((h, i) => ({ id: `h${i}`, label: h.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((h, i) => (correctBucket[`h${i}`] = h.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each human activity into the climatic region it best matches.",
        items,
        buckets,
        correctBucket,
        hint: "Think about how people adapt farming, herding, and housing to the climate they live in.",
        explanation: chosen.map((h) => `"${h.text}" — matches the ${REGION_KEY[h.bucket]} climate.`).join(" "),
      };
    }

    // stress
    const correct = randChoice(rng, STRESS_STRATEGIES);
    const others = STRESS_STRATEGIES.filter((s) => s !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "A family's farm has just been affected by a severe drought. Which of these is a positive way of managing the stress caused by this climate-related disaster?",
      choices,
      correctIndex,
      hint: "Positive coping involves seeking support and taking practical action, not avoidance or panic.",
      explanation: `${correct} — this is a healthy, positive way to manage stress caused by a climate-related disaster.`,
    };
  },
};
