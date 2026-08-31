import { randChoice, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES } from "./readingShared";

// Theme 4 (Emergency Rescue Services) "Intensive Reading — Visuals" sub-strand: predicting events
// from visuals, creating images from text, assessing the relevance of visuals. Reuses the existing
// generic bar-chart/line-graph/pie-chart VisualSpecs the same way englishG7/independentReadingVisuals.ts
// does for its near-identical "reading visuals" sub-strand.

const YEARS = ["2021", "2022", "2023", "2024", "2025"] as const;
const RESCUE_TYPES = ["road accidents", "fire incidents", "flood rescues", "medical emergencies"] as const;
const REGIONS = ["Central Region", "Coast Region", "Rift Valley Region", "Nyanza Region", "Western Region", "Eastern Region"] as const;

// Non-visual "described picture" prediction scenarios — the theme's own "predict events from visuals"
// and "create images from text" outcomes, for learners without an actual photo/illustration.
type DescribedScene = { description: string; correct: string; wrong: string[] };
const DESCRIBED_SCENES: DescribedScene[] = [
  { description: "A picture shows an ambulance parked with its back doors open, a paramedic kneeling beside a person lying on the road, and a small crowd standing at a distance.", correct: "A road accident has just happened and emergency responders are treating a casualty.", wrong: ["A wedding celebration is taking place on the road.", "The ambulance is being repaired at a garage.", "Children are playing a game near the road."] },
  { description: "A picture shows thick black smoke rising from a building, firefighters aiming a hose at the flames, and people watching from behind a guard rail.", correct: "A fire is being put out by firefighters while bystanders watch from a safe distance.", wrong: ["A factory is producing steam as part of normal operations.", "A bonfire is being lit for a festival.", "Clouds are gathering before a storm."] },
  { description: "A picture shows a warden standing beside a chevron road sign at a sharp bend, with reflectors visible along a guard rail in the background.", correct: "The picture illustrates road-safety features that warn and protect drivers at a dangerous bend.", wrong: ["The picture shows a tourist attraction with no safety purpose.", "The picture shows farming equipment on a farm.", "The picture shows decorations for a festival."] },
  { description: "A picture shows a rescue helicopter hovering above flood water, lowering a rope to a family stranded on a rooftop.", correct: "Flying doctors or a rescue team are airlifting people trapped by a flood.", wrong: ["A helicopter is delivering mail to a rural village.", "A family is enjoying a boat ride during a holiday.", "A helicopter is filming a nature documentary."] },
  { description: "A picture shows a nurse in an intensive care unit adjusting an oxygen mask on an unconscious patient, with medical monitors beeping nearby.", correct: "A critically ill patient is receiving urgent medical care in a hospital.", wrong: ["A patient is relaxing during a routine check-up.", "A nurse is cleaning equipment after work hours.", "A doctor is giving a health talk to healthy visitors."] },
];

export const readingFromVisuals: Skill = {
  id: "g6-eng-reading-visuals",
  code: "R.3",
  subjectId: "english",
  strandId: "g6-eng-reading",
  grade: 6,
  title: "Reading from Visuals",
  description: "Predict events from visuals, read and interpret data charts about emergency rescue services, create mental images from described scenes, and assess the relevance of visuals in a text.",
  generate(rng) {
    const branch = randChoice(rng, ["barchart", "linegraph", "piechart", "predict-scene", "relevance-mc"] as const);

    if (branch === "barchart") {
      const rescueType = randChoice(rng, RESCUE_TYPES);
      const chosenRegions = shuffle(rng, [...REGIONS]).slice(0, 4);
      const counts = sampleDistinctInts(rng, 20, 300, 4);
      const data = chosenRegions.map((label, i) => ({ label, value: counts[i] }));
      const maxIdx = counts.indexOf(Math.max(...counts));
      const minIdx = counts.indexOf(Math.min(...counts));
      const askMax = rng() < 0.5;
      const askedIdx = askMax ? maxIdx : minIdx;
      const correct = chosenRegions[askedIdx];
      const distractors = chosenRegions.filter((_, i) => i !== askedIdx);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `A safety report includes a bar chart showing the number of ${rescueType} recorded in each region last year. According to the chart, which region recorded the ${askMax ? "most" : "fewest"} ${rescueType}?`,
        visual: { type: "bar-chart", data },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Compare the height of each bar to find the region with the largest or smallest count.",
        explanation: `${correct} recorded the ${askMax ? "highest" : "lowest"} number of ${rescueType} (${counts[askedIdx]}), matching what the bar chart shows.`,
      };
    }

    if (branch === "linegraph") {
      const region = randChoice(rng, REGIONS);
      const base = 40;
      const deltas = shuffle(rng, [3, 5, 7, 10]).slice(0, 4);
      const values = [base];
      for (const d of deltas) values.push(values[values.length - 1] - d);
      const points = YEARS.map((label, i) => ({ label, value: values[i] }));
      const maxDeltaIdx = deltas.indexOf(Math.max(...deltas));
      const fromYear = YEARS[maxDeltaIdx];
      const toYear = YEARS[maxDeltaIdx + 1];
      const yearPairs = YEARS.slice(0, 4).map((y, i) => `${y}-${YEARS[i + 1]}`);
      const correct = `${fromYear}-${toYear}`;
      const distractors = yearPairs.filter((p) => p !== correct);
      const choices = shuffle(rng, [correct, ...shuffle(rng, distractors).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: `A road-safety report includes a line graph tracking the number of road accidents per month in ${region} from ${YEARS[0]} to ${YEARS[YEARS.length - 1]}, after new guard rails and reflectors were installed. Between which two consecutive years did accidents drop the most?`,
        visual: { type: "line-graph", points },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Look for the steepest downward slope between two neighbouring points on the line graph.",
        explanation: `Accidents fell from ${values[maxDeltaIdx]} in ${fromYear} to ${values[maxDeltaIdx + 1]} in ${toYear}, a drop of ${deltas[maxDeltaIdx]} — the steepest decline on the graph.`,
      };
    }

    if (branch === "piechart") {
      const place = randChoice(rng, KENYAN_PLACES);
      const chosenTypes = shuffle(rng, [...RESCUE_TYPES]);
      const values = shuffle(rng, [40, 30, 20, 10]);
      const slices = chosenTypes.map((label, i) => ({ label, value: values[i] }));
      const maxIdx = values.indexOf(Math.max(...values));
      const minIdx = values.indexOf(Math.min(...values));
      const askMax = rng() < 0.5;
      const askedIdx = askMax ? maxIdx : minIdx;
      const correct = chosenTypes[askedIdx];
      const distractors = chosenTypes.filter((_, i) => i !== askedIdx);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `A Red Cross report for ${place} includes a pie chart showing the proportion of emergency calls by type last year. Which type made up the ${askMax ? "LARGEST" : "SMALLEST"} share of calls?`,
        visual: { type: "pie-chart", slices },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: `The ${askMax ? "largest" : "smallest"} slice of a pie chart represents the ${askMax ? "largest" : "smallest"} share of the whole.`,
        explanation: `${correct} made up ${values[askedIdx]}% of emergency calls, the ${askMax ? "largest" : "smallest"} share shown in the pie chart.`,
      };
    }

    if (branch === "predict-scene") {
      const scene = randChoice(rng, DESCRIBED_SCENES);
      const choices = shuffle(rng, [scene.correct, ...scene.wrong]);
      return {
        kind: "multiple-choice",
        prompt: `${scene.description} What is most likely happening in this picture?`,
        choices,
        correctIndex: choices.indexOf(scene.correct),
        layout: "list",
        hint: "Picture the scene in your mind and think about what the details (people, equipment, setting) suggest is happening.",
        explanation: `The people, equipment and setting described in the picture all point to: ${scene.correct}`,
      };
    }

    const name = randChoice(rng, KENYAN_NAMES);
    const isRelevant = rng() > 0.5;
    const scenario = isRelevant
      ? `${name} is reading a leaflet about ambulance response times, next to a bar chart comparing response times across different towns.`
      : `${name} is reading a leaflet about ambulance response times, next to an unrelated photograph of a mountain landscape.`;
    const choices = shuffle(rng, ["relevant — it directly illustrates facts from the text", "not relevant — it does not connect to the text's topic"]);
    return {
      kind: "multiple-choice",
      prompt: `${scenario} Is this visual relevant to the text?`,
      choices,
      correctIndex: choices.indexOf(isRelevant ? "relevant — it directly illustrates facts from the text" : "not relevant — it does not connect to the text's topic"),
      layout: "list",
      hint: "A relevant visual should directly support or illustrate what the text is describing.",
      explanation: isRelevant ? "A bar chart of response times directly supports the leaflet's topic, so it is relevant." : "A photograph of a mountain landscape has no connection to ambulance response times, so it is not relevant.",
    };
  },
};
