import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Population Distribution in Kenya".
// See curriculum-reference/grade-5/social-studies.json.

const HIGH_DENSITY_FACTORS = [
  { factor: "good, reliable rainfall", reason: "reliable rainfall supports farming and settlement, attracting more people" },
  { factor: "fertile soil", reason: "fertile soil supports farming, so more people settle to grow crops" },
  { factor: "being a major city or town", reason: "cities and towns offer jobs and services, attracting many people" },
  { factor: "cool highland climate", reason: "cool, well-watered highlands are comfortable and productive for farming" },
  { factor: "availability of schools and hospitals", reason: "areas with good services attract more residents" },
];

const LOW_DENSITY_FACTORS = [
  { factor: "low, unreliable rainfall", reason: "low rainfall makes farming difficult, so fewer people settle there" },
  { factor: "arid or semi-arid climate", reason: "harsh, dry conditions make it hard to grow food or find water" },
  { factor: "very hot temperatures", reason: "extreme heat makes daily life and farming more difficult" },
  { factor: "poor soil for farming", reason: "poor soil cannot support enough farming to feed many people" },
  { factor: "few roads or services", reason: "areas that are hard to reach attract fewer settlers" },
];

export const populationDistributionInKenya: Skill = {
  id: "g5-ss-people-population-distribution-in-kenya",
  code: "P.2",
  subjectId: "social-studies",
  strandId: "g5-ss-people",
  grade: 5,
  title: "Population Distribution in Kenya",
  description: "Explaining why some areas of Kenya have high or low population density, and the effects of population distribution.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const wantHigh = randChoice(rng, [true, false]);
      const f = wantHigh ? randChoice(rng, HIGH_DENSITY_FACTORS) : randChoice(rng, LOW_DENSITY_FACTORS);
      const choices = shuffle(rng, ["High population density", "Low population density"]);
      const correct = wantHigh ? "High population density" : "Low population density";
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "kind of population density this factor usually leads to")} Factor: "${f.factor}".`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: f.reason,
        explanation: `"${f.factor}" usually leads to ${correct.toLowerCase()} because ${f.reason}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...HIGH_DENSITY_FACTORS, ...LOW_DENSITY_FACTORS]).slice(0, 4);
      const tokens = chosen.map((f, i) => ({ id: `${i}`, label: f.factor }));
      const targets = shuffle(rng, chosen).map((f) => ({ id: `${chosen.indexOf(f)}`, label: f.reason.charAt(0).toUpperCase() + f.reason.slice(1) }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_f, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "population factor to why it has that effect"),
        tokens,
        targets,
        correctMap,
        hint: "Think about how each factor affects whether people want to settle in an area.",
        explanation: chosen.map((f) => `"${f.factor}" — ${f.reason}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const high = shuffle(rng, HIGH_DENSITY_FACTORS).slice(0, 4).map((f, i) => ({ id: `h${i}`, label: f.factor, bucket: "HIGH" }));
      const low = shuffle(rng, LOW_DENSITY_FACTORS).slice(0, 4).map((f, i) => ({ id: `l${i}`, label: f.factor, bucket: "LOW" }));
      const items = shuffle(rng, [...high, ...low]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it leads to high or low population density"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "HIGH", label: "Leads to High Density" },
          { id: "LOW", label: "Leads to Low Density" },
        ],
        correctBucket,
        hint: "Good rainfall, fertile soil, and cities attract people; harsh, dry conditions don't.",
        explanation: "Favourable conditions like rainfall and fertile soil attract more people; harsh conditions like drought push density lower.",
      };
    }

    if (branch === "fill-blank") {
      const templates = [
        () => ({ before: "How many people live in a given area is called population", after: ".", correct: "density" }),
        () => ({ before: "Areas with fertile soil and good rainfall usually have", after: "population density.", correct: "high" }),
        () => ({ before: "Arid and semi-arid areas of Kenya usually have", after: "population density.", correct: "low" }),
        () => ({ before: "Cities and towns attract many people because they offer jobs and", after: ".", correct: "services" }),
        () => ({ before: "High population density increases pressure on land and", after: ".", correct: "housing" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall what makes an area attract many or few people.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "move", label: "More people move into an area" },
      { id: "demand", label: "Demand for land and housing increases" },
      { id: "services", label: "More schools and hospitals are needed" },
      { id: "economy", label: "More economic activity takes place" },
    ]);
    const correctOrder = ["move", "demand", "services", "economy"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these effects of high population density in the order they typically happen"),
      instruction: "Arrange the effects in a sensible order.",
      items: steps,
      correctOrder,
      hint: "It starts with people moving in, and leads to more demand for services and economic activity.",
      explanation: "As more people move into an area, demand for land and housing rises, more schools and hospitals are needed, and economic activity grows.",
    };
  },
};
