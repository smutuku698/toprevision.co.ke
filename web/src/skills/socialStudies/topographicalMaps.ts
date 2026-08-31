import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Scale/mapCm pairs are chosen so the resulting real-world distance is always a whole number
// of kilometres, avoiding decimal-formatting ambiguity in the fill-blank answer check.
const SCALE_OPTIONS: { scale: number; mapCmChoices: number[] }[] = [
  { scale: 25000, mapCmChoices: [4, 8, 12, 16] },
  { scale: 50000, mapCmChoices: [2, 4, 6, 8, 10, 12] },
  { scale: 100000, mapCmChoices: [2, 3, 4, 5, 6, 7, 8, 9] },
];

const ACTIVITY_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Contour lines drawn very close together on a topographical map show what kind of land?",
    choices: ["Steep slopes", "Flat land", "A river", "A settlement"],
    correctIndex: 0,
    explanation: "Closely spaced contour lines mean the elevation changes quickly over a short distance — that is a steep slope.",
  },
  {
    prompt: "A cross-section drawn from a topographical map is mainly used to show what?",
    choices: ["The shape of the land's surface along a straight line", "The population living along that line", "The colours used on the original map", "The map's scale"],
    correctIndex: 0,
    explanation: "A cross-section turns the contour lines along a chosen line into a side-view profile, showing hills, valleys, and slopes.",
  },
  {
    prompt: "Why would a planner want to enlarge part of a topographical map before analysing it?",
    choices: ["To study fine details of human activities or relief in that specific area more clearly", "To make the whole country fit onto a single small sheet", "To remove the need for a scale entirely", "To change the actual ground distances the map represents"],
    correctIndex: 0,
    explanation: "Enlarging part of a map makes fine details — like closely spaced buildings or contour lines — clearer to study, without changing the real distances they represent.",
  },
  {
    prompt: "Widely spaced contour lines on a topographical map most likely indicate what kind of land?",
    choices: ["Gently sloping or fairly flat land", "A vertical cliff", "A deep, narrow gorge", "An area with no elevation at all"],
    correctIndex: 0,
    explanation: "Widely spaced contour lines mean elevation changes slowly over distance, indicating gently sloping or fairly flat land.",
  },
];

const SYMBOLS: { name: string; meaning: string }[] = [
  { name: "Contour line", meaning: "A line joining points of equal elevation, used to show the shape of the land" },
  { name: "Spot height", meaning: "A dot marked with a number showing the exact elevation at that single point" },
  { name: "Triangulation station", meaning: "A marked point used by surveyors as a reference for measuring elevation and position" },
  { name: "Grid reference", meaning: "Numbered lines on a map used to describe the exact location of a point" },
  { name: "Settlement symbol", meaning: "Dots or blocks showing where buildings or a built-up area are located" },
  { name: "Forest symbol", meaning: "A tree-shaped symbol showing an area covered by forest or woodland" },
  { name: "Marsh/swamp symbol", meaning: "A symbol showing an area of waterlogged, low-lying ground" },
  { name: "Quarry symbol", meaning: "A symbol showing a site where rock, sand, or minerals are extracted" },
];

const FEATURES: { text: string; kind: "physical" | "human" }[] = [
  { text: "Contour lines showing hills and valleys", kind: "physical" },
  { text: "Rivers and water bodies", kind: "physical" },
  { text: "Areas of forest or natural vegetation", kind: "physical" },
  { text: "Rock outcrops and escarpments", kind: "physical" },
  { text: "Roads and railway lines", kind: "human" },
  { text: "Settlements and built-up areas", kind: "human" },
  { text: "Cultivated farmland", kind: "human" },
  { text: "Quarries and mining sites", kind: "human" },
];

const CROSS_SECTION_STEPS = [
  { id: "line", label: "Draw a straight line between the two points on the map" },
  { id: "note", label: "Note the elevation where the line crosses each contour" },
  { id: "transfer", label: "Transfer each contour's elevation to a graph at the correct horizontal position" },
  { id: "plot", label: "Plot each elevation as a point on the graph" },
  { id: "join", label: "Join the points smoothly to show the land's surface profile" },
] as const;

export const topographicalMaps: Skill = {
  id: "ss-nhbe-topographical-maps",
  code: "NHBE.1",
  subjectId: "social-studies",
  strandId: "ss-nhbe",
  grade: 9,
  title: "Topographical maps",
  description: "Reading scale, distance, and human activity from a topographical map.",
  generate(rng) {
    const branch = randChoice(rng, ["scale", "reading", "symbols", "features", "cross-section"] as const);

    if (branch === "symbols") {
      const chosen = shuffle(rng, SYMBOLS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.name })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.name] = s.name;
      return {
        kind: "click-match",
        prompt: "Match each topographical map feature to what it shows.",
        tokens,
        targets,
        correctMap,
        hint: "Topographical maps use specific symbols and markings to show both relief and human activity.",
        explanation: chosen.map((s) => `${s.name} — ${s.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "features") {
      const chosen = shuffle(rng, FEATURES).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: "Sort each feature shown on a topographical map as a physical feature or a human activity.",
        items,
        buckets: [
          { id: "physical", label: "Physical feature" },
          { id: "human", label: "Human activity" },
        ],
        correctBucket,
        hint: "Physical features exist naturally on the land; human activities are things people have built or done on it.",
        explanation: chosen.map((f) => `"${f.text}" is a ${f.kind === "physical" ? "physical feature" : "human activity"}.`).join(" "),
      };
    }

    if (branch === "cross-section") {
      const items = shuffle(rng, CROSS_SECTION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for drawing a cross-section from a topographical map, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: CROSS_SECTION_STEPS.map((s) => s.id),
        hint: "You need the line drawn first, then read the contour elevations, then transfer, plot, and join them.",
        explanation: CROSS_SECTION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "scale") {
      const { scale, mapCmChoices } = randChoice(rng, SCALE_OPTIONS);
      const mapCm = randChoice(rng, mapCmChoices);
      const actualCm = mapCm * scale;
      const km = actualCm / 100000;
      return {
        kind: "fill-blank",
        prompt: `On a topographical map with a scale of 1:${scale.toLocaleString()}, a road measures ${mapCm} cm.`,
        before: "The actual distance covered by the road is",
        after: "km.",
        correctAnswer: String(km),
        inputMode: "numeric",
        hint: "Actual distance = map distance × scale, then convert centimetres to kilometres (1 km = 100,000 cm).",
        explanation: `Actual distance = ${mapCm} \\times ${scale.toLocaleString()} = ${actualCm.toLocaleString()}\\text{ cm} = ${km}\\text{ km}.`,
      };
    }

    const q = randChoice(rng, ACTIVITY_QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about how contour spacing shows slope, and what a cross-section is used for.",
      explanation: q.explanation,
    };
  },
};
