import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type Climate = "equatorial" | "highland" | "semi-arid" | "arid";

interface ClimateInfo {
  climate: Climate;
  label: string;
  rainfall: "very high" | "moderate and reliable" | "moderate with a dry season" | "very low and unreliable";
  activity: string;
  wrongActivity: string;
  weatherDays: ("sunny" | "cloudy" | "rainy" | "stormy")[];
  rainRank: number; // 1 = driest, 4 = wettest
}

const CLIMATES: readonly ClimateInfo[] = [
  {
    climate: "equatorial",
    label: "Equatorial (tropical rainforest) climate",
    rainfall: "very high",
    activity: "growing crops that need year-round rainfall, such as bananas and cocoa, often with two rainy seasons",
    wrongActivity: "nomadic pastoralism moving long distances in search of scarce pasture",
    weatherDays: ["rainy", "cloudy", "rainy", "cloudy", "rainy", "cloudy", "rainy"],
    rainRank: 4,
  },
  {
    climate: "highland",
    label: "Highland (temperate) climate",
    rainfall: "moderate and reliable",
    activity: "growing tea, coffee, and keeping dairy cattle, which need cool temperatures and reliable rainfall",
    wrongActivity: "growing desert-adapted crops that need almost no rainfall",
    weatherDays: ["cloudy", "cloudy", "rainy", "cloudy", "sunny", "cloudy", "rainy"],
    rainRank: 3,
  },
  {
    climate: "semi-arid",
    label: "Semi-arid (savanna) climate",
    rainfall: "moderate with a dry season",
    activity: "keeping livestock on grassland, with some crop farming during the short wet season",
    wrongActivity: "growing rainforest crops that need rain every month of the year",
    weatherDays: ["sunny", "sunny", "cloudy", "rainy", "sunny", "sunny", "cloudy"],
    rainRank: 2,
  },
  {
    climate: "arid",
    label: "Arid (desert) climate",
    rainfall: "very low and unreliable",
    activity: "nomadic pastoralism, moving herds long distances in search of scarce water and pasture",
    wrongActivity: "growing crops that need rain every month, such as bananas",
    weatherDays: ["sunny", "sunny", "sunny", "sunny", "sunny", "sunny", "sunny"],
    rainRank: 1,
  },
] as const;

function activityMc(rng: () => number): ScenarioMC {
  const c = randChoice(rng, CLIMATES);
  const name = g6SsName(rng);
  const place = g6SsPlace(rng);
  const prompts = [
    `${name}'s family lives in an area with a ${c.label.toLowerCase()} (${c.rainfall} rainfall). Which economic activity best suits this climate?`,
    `A community near ${place} experiences ${c.rainfall} rainfall, typical of a ${c.label.toLowerCase()}. What activity would be most suitable there?`,
  ];
  const others = shuffle(rng, CLIMATES.filter((o) => o.climate !== c.climate)).slice(0, 3);
  return {
    prompt: randChoice(rng, prompts),
    correct: c.activity.charAt(0).toUpperCase() + c.activity.slice(1),
    wrong: others.map((o) => o.wrongActivity.charAt(0).toUpperCase() + o.wrongActivity.slice(1)),
    explanation: `A ${c.label.toLowerCase()} has ${c.rainfall} rainfall, so ${c.activity} is the best match.`,
  };
}

function weatherMc(rng: () => number): ScenarioMC {
  const c = randChoice(rng, CLIMATES);
  const others = shuffle(rng, CLIMATES.filter((o) => o.climate !== c.climate)).slice(0, 3);
  return {
    prompt: "This chart shows one week's weather pattern for a region in Eastern Africa. Which climatic region does this pattern best match?",
    correct: c.label,
    wrong: others.map((o) => o.label),
    explanation: `${c.label} typically has ${c.rainfall} rainfall, which matches the pattern shown.`,
  };
}

export const climaticRegions: Skill = {
  id: "g6-ss-env-climatic-regions",
  code: "E.3",
  subjectId: "social-studies",
  strandId: "g6-ss-environments",
  grade: 6,
  title: "Climatic regions in Eastern Africa",
  description: "Identifying Eastern Africa's climatic regions, their characteristics, and how climate shapes human activities.",
  generate(rng) {
    const branch = randChoice(rng, ["activity-mc", "weather-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "activity-mc") {
      const q = activityMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Match the amount and reliability of rainfall to the activity that needs it.",
        explanation: q.explanation,
      };
    }

    if (branch === "weather-mc") {
      const c = randChoice(rng, CLIMATES);
      const q = weatherMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        visual: { type: "weather", days: c.weatherDays.map((condition, i) => ({ label: `Day ${i + 1}`, condition })) },
        choices,
        correctIndex,
        hint: "Look at how often it rains across the week.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "A climate with very high, year-round rainfall near the Equator is called", after: ".", correct: "equatorial" }),
        () => ({ before: "High-altitude areas such as the Kenyan highlands have a cooler", after: "climate with reliable rainfall.", correct: "highland" }),
        () => ({ before: "A climate with moderate rainfall and a clear dry season, common across much of Eastern Africa, is called", after: ".", correct: "semi-arid" }),
        () => ({ before: "Northern Kenya and much of Somalia have a very dry,", after: "climate.", correct: "arid" }),
        () => ({ before: `${name} learns that tea and coffee grow best in a`, after: "climate, which is cool with reliable rainfall.", correct: "highland" }),
        () => ({ before: "In an arid climate, the most common economic activity is nomadic", after: ", since crops cannot rely on rainfall.", correct: "pastoralism" }),
        () => ({ before: "A savanna climate is another name for a", after: "climate.", correct: "semi-arid" }),
        () => ({ before: "Two rainy seasons a year and very high rainfall are typical of an", after: "climate.", correct: "equatorial" }),
        () => ({ before: "The driest of Eastern Africa's climatic regions is the", after: "climate.", correct: "arid" }),
        () => ({ before: "Dairy farming thrives in the cool, reliably wet", after: "climate of the highlands.", correct: "highland" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about Eastern Africa's climatic regions.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Match the rainfall description to the climate name.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...CLIMATES]);
      const tokens = chosen.map((c) => ({ id: c.climate, label: c.label }));
      const targets = shuffle(rng, chosen).map((c) => ({ id: c.climate, label: `Rainfall is ${c.rainfall}` }));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.climate] = c.climate;
      return {
        kind: "click-match",
        prompt: "Match each climatic region to its rainfall pattern.",
        tokens,
        targets,
        correctMap,
        hint: "Equatorial climates get the most rain; arid climates get the least.",
        explanation: chosen.map((c) => `${c.label}: rainfall is ${c.rainfall}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...CLIMATES]);
      const items = chosen.map((c) => ({ id: c.climate, label: c.activity.charAt(0).toUpperCase() + c.activity.slice(1) }));
      const buckets = chosen.map((c) => ({ id: c.climate, label: c.label }));
      const correctBucket: Record<string, string> = {};
      for (const c of chosen) correctBucket[c.climate] = c.climate;
      return {
        kind: "categorize",
        prompt: "Match each economic activity to the climatic region it best suits.",
        items,
        buckets,
        correctBucket,
        hint: "Think about how much rainfall each activity needs.",
        explanation: chosen.map((c) => `${c.activity} suits the ${c.label.toLowerCase()}.`).join(" "),
      };
    }

    // ordering — driest to wettest, a genuine ranking from the rainfall data.
    const ranked = [...CLIMATES].sort((a, b) => a.rainRank - b.rainRank);
    const items = shuffle(rng, ranked).map((c) => ({ id: c.climate, label: c.label }));
    return {
      kind: "ordering",
      prompt: "Arrange these climatic regions of Eastern Africa from driest to wettest.",
      items,
      correctOrder: ranked.map((c) => c.climate),
      instruction: "Driest first, wettest last.",
      hint: "Arid gets the least rain; equatorial gets the most.",
      explanation: `From driest to wettest: ${ranked.map((c) => c.label).join(", ")}.`,
    };
  },
};
