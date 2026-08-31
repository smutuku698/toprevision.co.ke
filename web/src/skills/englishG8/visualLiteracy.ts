import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VISUAL_PURPOSES: { visual: string; purpose: string }[] = [
  { visual: "Bar chart", purpose: "Comparing amounts or counts across different categories" },
  { visual: "Line graph", purpose: "Showing how something changes over a period of time" },
  { visual: "Map", purpose: "Showing the location of places and the distance or direction between them" },
  { visual: "Diagram", purpose: "Showing the parts of something and how they fit together" },
  { visual: "Table", purpose: "Organising facts and figures neatly into rows and columns" },
  { visual: "Pictograph", purpose: "Using small pictures or icons to represent a count of something" },
];

const CONSERVANCIES = ["Amani", "Tsavo Ridge", "Mara North", "Baringo Hills", "Samburu East"] as const;
const ANIMALS = ["elephant", "giraffe", "zebra", "buffalo"] as const;

const YEARS = ["2020", "2021", "2022", "2023", "2024"] as const;
const TREND_ANIMALS = ["rhino", "cheetah", "wild dog"] as const;

const WEATHER_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const OTHER_CONDITIONS = ["cloudy", "rainy", "stormy"] as const;

const SCHEDULE_CONTEXTS = [
  { activity: "morning game drive", place: "the ranger station" },
  { activity: "guided bird walk", place: "the visitor centre" },
  { activity: "watering-hole viewing session", place: "the lodge noticeboard" },
] as const;

const VISUAL_CATEGORY_ITEMS: { desc: string; category: string }[] = [
  { desc: "A bar chart comparing the number of elephants counted in five conservancies", category: "Comparing categories" },
  { desc: "A line graph showing a rhino population's count each year from 2020 to 2024", category: "Showing change over time" },
  { desc: "A map showing the footpaths and gates around a national park", category: "Showing location" },
  { desc: "A labelled diagram showing the parts of a giraffe's digestive system", category: "Showing parts or structure" },
  { desc: "A table listing each ranger's name, station, and years of service", category: "Organising data" },
  { desc: "A pictograph using small elephant icons to show how many were spotted each week", category: "Comparing categories" },
];

function fmtTime(hour: number, minute: number): string {
  const period = hour < 12 ? "a.m." : "p.m.";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = minute.toString().padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

export const visualLiteracy: Skill = {
  id: "g8-eng-r-visual-literacy",
  code: "R.13",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Visuals",
  description: "Identify different visuals, connect them to written text, and interpret charts, graphs, forecasts and schedules for meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "barchart", "linegraph", "weather", "clock", "categorize"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, VISUAL_PURPOSES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.visual, label: v.visual })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.visual, label: v.purpose })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.visual] = v.visual;
      return {
        kind: "click-match",
        prompt: "Match each type of visual to what it is best used for.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what kind of information each visual is designed to show at a glance.",
        explanation: chosen.map((v) => `${v.visual} — ${v.purpose.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "barchart") {
      const animal = randChoice(rng, ANIMALS);
      const chosenParks = shuffle(rng, [...CONSERVANCIES]).slice(0, 4);
      const counts = sampleDistinctInts(rng, 8, 60, 4);
      const data = chosenParks.map((label, i) => ({ label, value: counts[i] }));
      const maxIdx = counts.indexOf(Math.max(...counts));
      const minIdx = counts.indexOf(Math.min(...counts));
      const askMax = rng() < 0.5;
      const askedIdx = askMax ? maxIdx : minIdx;
      const correct = chosenParks[askedIdx];
      const distractors = chosenParks.filter((_, i) => i !== askedIdx);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `A wildlife report includes a bar chart showing how many ${animal}s were counted in each conservancy during the last census. According to the chart, which conservancy recorded the ${askMax ? "most" : "fewest"} ${animal}s?`,
        visual: { type: "bar-chart", data },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Read the height of each bar and compare them — the bar chart lets you compare counts across conservancies at a glance.",
        explanation: `${correct} recorded ${askMax ? "the highest" : "the lowest"} count of ${animal}s (${counts[askedIdx]}), which the passage's bar chart shows connects directly to the written report.`,
      };
    }

    if (branch === "linegraph") {
      const animal = randChoice(rng, TREND_ANIMALS);
      const base = randInt(rng, 20, 40);
      const deltas = shuffle(rng, [3, 5, 8, 11]).slice(0, 4);
      const values = [base];
      for (const d of deltas) values.push(values[values.length - 1] + d);
      const points = YEARS.map((label, i) => ({ label, value: values[i] }));
      const maxDeltaIdx = deltas.indexOf(Math.max(...deltas));
      const fromYear = YEARS[maxDeltaIdx];
      const toYear = YEARS[maxDeltaIdx + 1];
      const askIncrease = rng() < 0.7;

      if (askIncrease) {
        const yearPairs = YEARS.slice(0, 4).map((y, i) => `${y}-${YEARS[i + 1]}`);
        const correct = `${fromYear}-${toYear}`;
        const distractors = yearPairs.filter((p) => p !== correct);
        const choices = shuffle(rng, [correct, ...shuffle(rng, distractors).slice(0, 3)]);
        return {
          kind: "multiple-choice",
          prompt: `A conservation report includes a line graph tracking the ${animal} population from 2020 to 2024. Between which two consecutive years did the population increase the most?`,
          visual: { type: "line-graph", points },
          choices,
          correctIndex: choices.indexOf(correct),
          layout: "list",
          hint: "Look for the steepest upward slope between two neighbouring points on the line graph.",
          explanation: `The population rose from ${values[maxDeltaIdx]} in ${fromYear} to ${values[maxDeltaIdx + 1]} in ${toYear}, an increase of ${deltas[maxDeltaIdx]} — the steepest rise on the graph.`,
        };
      }

      const lastYear = YEARS[YEARS.length - 1];
      const lastValue = values[values.length - 1];
      return {
        kind: "fill-blank",
        prompt: "Read the line graph and complete the sentence.",
        before: `According to the line graph, the ${animal} population reached `,
        after: ` by the year ${lastYear}.`,
        correctAnswer: String(lastValue),
        inputMode: "numeric",
        visual: { type: "line-graph", points },
        hint: "Find the point on the graph directly above the final year and read its value.",
        explanation: `The line graph's last point, at ${lastYear}, sits at ${lastValue} — connecting the visual directly to the fact stated in the report.`,
      };
    }

    if (branch === "weather") {
      const sunnyIdx = randInt(rng, 0, 4);
      const days = WEATHER_DAY_LABELS.map((label, i) => ({
        label,
        condition: i === sunnyIdx ? ("sunny" as const) : randChoice(rng, OTHER_CONDITIONS),
      }));
      const correctDay = WEATHER_DAY_LABELS[sunnyIdx];
      const distractors = WEATHER_DAY_LABELS.filter((d) => d !== correctDay);
      const choices = shuffle(rng, [correctDay, ...shuffle(rng, distractors).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: "A wildlife documentary crew is planning a five-day filming trip and checks this forecast strip. For the clearest light and best filming conditions, which day should they schedule the sunrise game drive?",
        visual: { type: "weather", days },
        choices,
        correctIndex: choices.indexOf(correctDay),
        layout: "row",
        hint: "Clear, sunny skies give the best light for filming — look for the day with the sun icon.",
        explanation: `${correctDay} is the only day the forecast strip shows as sunny, making it the best choice for filming in clear light — the visual gives the crew information the written itinerary alone would not.`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VISUAL_CATEGORY_ITEMS).slice(0, 5);
      const categories = Array.from(new Set(chosen.map((c) => c.category)));
      const buckets = categories.map((c) => ({ id: c, label: c }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.desc }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each visual by what it mainly helps a reader do.",
        items,
        buckets,
        correctBucket,
        hint: "Ask yourself: does this visual compare amounts, show change over time, show a location, or show the parts of something?",
        explanation: chosen.map((c) => `"${c.desc}" mainly helps with: ${c.category.toLowerCase()}.`).join(" "),
      };
    }

    // clock branch
    const ctx = randChoice(rng, SCHEDULE_CONTEXTS);
    const hour = randInt(rng, 5, 9);
    const minute = randChoice(rng, [0, 15, 30, 45]);
    const correct = fmtTime(hour, minute);
    const otherHours = sampleDistinctInts(rng, 5, 9, 3, [hour]);
    const distractors = otherHours.map((h) => fmtTime(h, randChoice(rng, [0, 15, 30, 45])));
    const choices = shuffle(rng, [correct, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt: `A notice at ${ctx.place} gives the departure time for the ${ctx.activity} using the clock shown below, instead of writing it out in words. What time does the notice show?`,
      visual: { type: "clock", hour, minute },
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "row",
      hint: "Read the short hour hand first, then the long minute hand, to find the exact time.",
      explanation: `The clock's hour hand and minute hand show ${correct} — connecting a visual on a real noticeboard to the information a reader needs.`,
    };
  },
};
