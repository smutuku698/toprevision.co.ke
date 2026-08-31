import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const FACTORS_EFFECTS = [
  { text: "An area receives high, reliable rainfall suited to farming", bucket: "factor" },
  { text: "An area has fertile volcanic soils good for growing crops", bucket: "factor" },
  { text: "An area has a reliable year-round source of water", bucket: "factor" },
  { text: "An area is at a high, cool altitude that is comfortable to live in", bucket: "factor" },
  { text: "An area has towns offering jobs and services", bucket: "factor" },
  { text: "An area is well connected by roads and railways", bucket: "factor" },
  { text: "Housing and land become harder to find and more expensive", bucket: "effect" },
  { text: "Schools, hospitals, and water supplies come under more strain", bucket: "effect" },
  { text: "A larger workforce becomes available for businesses and farms", bucket: "effect" },
  { text: "A bigger local market develops for goods and services", bucket: "effect" },
] as const;

const FACTOR_REASONS = [
  { factor: "High, reliable rainfall", reason: "supports successful crop farming" },
  { factor: "Fertile volcanic soils", reason: "makes land more productive for growing food" },
  { factor: "A reliable year-round water source", reason: "supplies people, animals, and crops with water" },
  { factor: "A high, cool altitude", reason: "makes the climate more comfortable to live in" },
  { factor: "Towns offering jobs and services", reason: "attracts people looking for work and amenities" },
  { factor: "Good road and railway connections", reason: "makes it easier to trade and travel" },
] as const;

function makeDensityData(rng: () => number) {
  const regions = ["Highland farming areas", "Coastal towns", "Lakeside areas", "Arid northern areas"];
  const values = [randInt(rng, 250, 400), randInt(rng, 150, 260), randInt(rng, 180, 300), randInt(rng, 5, 25)];
  return regions.map((label, i) => ({ label, value: values[i] }));
}

function factorEffectMc(rng: () => number): ScenarioMC {
  const isFactor = rng() > 0.5;
  const pool = FACTORS_EFFECTS.filter((f) => f.bucket === (isFactor ? "factor" : "effect"));
  const target = randChoice(rng, pool);
  const wrongPool = FACTORS_EFFECTS.filter((f) => f.bucket !== target.bucket);
  return {
    prompt: isFactor
      ? "Which of these is a factor that influences population distribution (why people settle somewhere)?"
      : "Which of these is an effect of high population density (what happens once many people have settled there)?",
    correct: target.text,
    wrong: shuffle(rng, wrongPool.map((f) => f.text)).slice(0, 3),
    explanation: `"${target.text}" is ${target.bucket === "factor" ? "a factor influencing where people settle" : "an effect of high population density, something that happens after people have settled"}.`,
  };
}

export const populationDistribution: Skill = {
  id: "g6-ss-ppl-population-distribution",
  code: "P.2",
  subjectId: "social-studies",
  strandId: "g6-ss-people",
  grade: 6,
  title: "Population distribution in Eastern Africa",
  description: "Factors influencing where people settle in Eastern Africa, and the effects of high population density.",
  generate(rng) {
    const branch = randChoice(rng, ["factor-effect-mc", "chart-read", "chart-compare", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "factor-effect-mc") {
      const q = factorEffectMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "A factor explains why people move there; an effect describes what happens after they've settled.",
        explanation: q.explanation,
      };
    }

    if (branch === "chart-read" || branch === "chart-compare") {
      const data = makeDensityData(rng);
      const place = g6SsPlace(rng);
      if (branch === "chart-read") {
        const idx = randInt(rng, 0, data.length - 1);
        const target = data[idx];
        const others = data.filter((_, i) => i !== idx).map((d) => `${d.value} people per km²`);
        const choices = shuffle(rng, [`${target.value} people per km²`, ...others]);
        return {
          kind: "multiple-choice",
          prompt: `This chart shows population density in different parts of Eastern Africa (people per km²). According to the chart, what is the density of ${target.label.toLowerCase()}?`,
          visual: { type: "bar-chart", data },
          choices,
          correctIndex: choices.indexOf(`${target.value} people per km²`),
          hint: "Read the height of the bar for the requested region.",
          explanation: `${target.label} has a population density of ${target.value} people per km² on this chart.`,
        };
      }
      const highest = data.reduce((a, b) => (b.value > a.value ? b : a));
      const lowest = data.reduce((a, b) => (b.value < a.value ? b : a));
      const correctText = `${highest.label} is the most densely populated; ${lowest.label} is the least densely populated`;
      const wrongText1 = `${lowest.label} is the most densely populated; ${highest.label} is the least densely populated`;
      const wrongText2 = `All four regions shown have roughly the same population density`;
      const choices = shuffle(rng, [correctText, wrongText1, wrongText2]);
      return {
        kind: "multiple-choice",
        prompt: `This chart shows population density across four regions near ${place}'s area of Eastern Africa. Which statement correctly compares them?`,
        visual: { type: "bar-chart", data },
        choices,
        correctIndex: choices.indexOf(correctText),
        hint: "Find the tallest and shortest bars on the chart.",
        explanation: `${correctText} — arid areas like the northern region have too little water and rainfall to support dense settlement.`,
      };
    }

    if (branch === "fill-blank") {
      const templates = [
        () => ({ before: "Areas with fertile soils and reliable rainfall tend to have", after: "population density.", correct: "high" }),
        () => ({ before: "Arid areas with very little water tend to have", after: "population density.", correct: "low" }),
        () => ({ before: "As population density rises, land and housing become harder to find and more", after: ".", correct: "expensive" }),
        () => ({ before: "High population density puts extra strain on schools, hospitals, and", after: "supplies.", correct: "water" }),
        () => ({ before: "One positive effect of high population density is a larger available", after: "for businesses and farms.", correct: "workforce" }),
        () => ({ before: "A region's altitude, climate, soil fertility, and access to water are all examples of factors that influence population", after: ".", correct: "distribution" }),
        () => ({ before: "Towns that offer jobs and services tend to attract a", after: "population.", correct: "larger" }),
        () => ({ before: "The number of people living in a given area of land, usually measured per square kilometre, is called population", after: ".", correct: "density" }),
        () => ({ before: "Regions that are well connected by roads and railways tend to have", after: "population density than isolated regions.", correct: "higher" }),
        () => ({ before: "Highland farming areas in Kenya tend to have a", after: "population density than the arid north.", correct: "higher" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about population distribution in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Think about what attracts people to an area and what happens once many people have settled there.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...FACTOR_REASONS]);
      const tokens = chosen.map((f) => ({ id: f.factor, label: f.factor }));
      const targets = shuffle(rng, chosen).map((f) => ({ id: f.factor, label: f.reason.charAt(0).toUpperCase() + f.reason.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.factor] = f.factor;
      return {
        kind: "click-match",
        prompt: "Match each factor influencing population distribution to why it attracts settlement.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each factor actually provides to the people living there.",
        explanation: chosen.map((f) => `${f.factor}: ${f.reason}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...FACTORS_EFFECTS]).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `fe${i}`, label: f.text }));
      const buckets = [
        { id: "factor", label: "A factor influencing where people settle" },
        { id: "effect", label: "An effect of high population density" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`fe${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a factor influencing population distribution or an effect of high population density.",
        items,
        buckets,
        correctBucket,
        hint: "A factor happens before people settle; an effect happens after they've settled.",
        explanation: chosen.map((f) => `"${f.text}" is a${f.bucket === "effect" ? "n" : ""} ${f.bucket}.`).join(" "),
      };
    }

    // ordering — regions ranked from most to least densely populated, from the same fact set as the chart.
    const data = makeDensityData(rng);
    const ranked = [...data].sort((a, b) => b.value - a.value);
    const items = shuffle(rng, ranked).map((d) => ({ id: d.label, label: d.label }));
    return {
      kind: "ordering",
      prompt: "Arrange these Eastern African regions from most densely populated to least densely populated.",
      items,
      correctOrder: ranked.map((d) => d.label),
      instruction: "Most densely populated first, least densely populated last.",
      hint: "Fertile, well-watered areas support more people than arid areas.",
      explanation: `From most to least densely populated: ${ranked.map((d) => d.label).join(", ")}.`,
    };
  },
};
