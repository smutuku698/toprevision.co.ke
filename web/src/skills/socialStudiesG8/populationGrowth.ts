import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CAUSES_EFFECTS = [
  { text: "Improved healthcare has lowered infant mortality rates", bucket: "cause" },
  { text: "High birth rates remain common in many African communities", bucket: "cause" },
  { text: "People are living longer due to better nutrition and medicine", bucket: "cause" },
  { text: "Rural-to-urban migration adds to city populations", bucket: "cause" },
  { text: "Increased pressure on land, housing, and social services in cities", bucket: "effect" },
  { text: "A larger workforce that can boost a country's economic production", bucket: "effect" },
  { text: "Greater strain on schools, hospitals, and water supplies", bucket: "effect" },
  { text: "Growing demand for food, sometimes leading to food insecurity", bucket: "effect" },
] as const;

const MIGRATION_TYPES = [
  { type: "Rural-urban migration", meaning: "Movement from the countryside to towns and cities in search of jobs" },
  { type: "International migration", meaning: "Movement of people across national borders to another country" },
  { type: "Seasonal migration", meaning: "Temporary movement, such as pastoralists moving with livestock in search of pasture" },
  { type: "Forced migration", meaning: "Movement caused by conflict, disaster, or persecution, such as refugees fleeing war" },
] as const;

const BUCKET_LABEL: Record<string, string> = { cause: "A cause of population growth", effect: "An effect of population growth" };

// KES-free, whole-number bars for a small Kenyan town's age-group population (in thousands) — always sums cleanly.
function makePyramidData(rng: () => number) {
  const groups = ["0–14 years", "15–34 years", "35–54 years", "55+ years"];
  const values = [randInt(rng, 40, 60), randInt(rng, 30, 45), randInt(rng, 15, 28), randInt(rng, 5, 15)];
  return groups.map((label, i) => ({ label, value: values[i] }));
}

export const populationGrowth: Skill = {
  id: "g8-ss-pr-population-growth",
  code: "PR.4",
  subjectId: "social-studies",
  strandId: "g8-ss-pr",
  grade: 8,
  title: "Population growth in Africa",
  description: "Causes and effects of population growth, types and effects of migration, and reading Kenyan demographic trends from a population chart.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "migration", "pyramid-read", "pyramid-total", "pyramid-compare"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, CAUSES_EFFECTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a cause or an effect of population growth in Africa.",
        items,
        buckets,
        correctBucket,
        hint: "A cause makes the population grow; an effect is what happens because it has grown.",
        explanation: chosen.map((c) => `"${c.text}" — ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "migration") {
      const tokens = shuffle(rng, MIGRATION_TYPES.map((m) => ({ id: m.type, label: m.type })));
      const targets = shuffle(rng, MIGRATION_TYPES.map((m) => ({ id: m.type, label: m.meaning })));
      const correctMap: Record<string, string> = {};
      for (const m of MIGRATION_TYPES) correctMap[m.type] = m.type;
      return {
        kind: "click-match",
        prompt: "Match each type of migration to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about why and how far people move — for jobs, across borders, with the seasons, or to escape danger.",
        explanation: MIGRATION_TYPES.map((m) => `${m.type}: ${m.meaning}.`).join(" "),
      };
    }

    const data = makePyramidData(rng);
    if (branch === "pyramid-read") {
      const idx = randInt(rng, 0, data.length - 1);
      const target = data[idx];
      const others = data.filter((_, i) => i !== idx).map((d) => `${d.value} thousand`);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `${target.value} thousand`, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `This chart shows a Kenyan town's population by age group (in thousands). According to the chart, what is the population aged ${target.label}?`,
        visual: { type: "bar-chart", data },
        choices,
        correctIndex,
        hint: "Read the height of the bar for the requested age group.",
        explanation: `The bar for ${target.label} shows a population of ${target.value} thousand people.`,
      };
    }

    if (branch === "pyramid-total") {
      const total = data.reduce((sum, d) => sum + d.value, 0);
      return {
        kind: "fill-blank",
        prompt: "This chart shows a Kenyan town's population by age group (in thousands).",
        visual: { type: "bar-chart", data },
        before: "The total population shown across all age groups is",
        after: "thousand.",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add up the value of every bar on the chart.",
        explanation: `${data.map((d) => d.value).join(" + ")} = ${total} thousand.`,
      };
    }

    // pyramid-compare — data is constructed so the 0–14 group always outnumbers the 55+ group.
    const correctText = "A young, fast-growing population with many children and fewer elderly people";
    const wrongText = "An ageing population with more elderly people than children";
    const choices = shuffle(rng, [correctText, wrongText]);
    return {
      kind: "multiple-choice",
      prompt: "This chart shows a Kenyan town's population by age group (in thousands). What does this pattern demonstrate about the town's demographic trend?",
      visual: { type: "bar-chart", data },
      choices,
      correctIndex: choices.indexOf(correctText),
      hint: "Compare the size of the youngest age group's bar to the oldest age group's bar.",
      explanation: `The 0–14 years bar (${data[0].value} thousand) is much taller than the 55+ years bar (${data[data.length - 1].value} thousand), showing a young, fast-growing population — typical of Kenya's demographic trend, driven by a high birth rate.`,
    };
  },
};
