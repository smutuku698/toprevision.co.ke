import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// Scale/mapCm pairs chosen so the real-world distance is always a whole number of kilometres.
const SCALE_OPTIONS: { scale: number; mapCmChoices: number[] }[] = [
  { scale: 25000, mapCmChoices: [4, 8, 12, 16, 20] },
  { scale: 50000, mapCmChoices: [2, 4, 6, 8, 10, 12] },
  { scale: 100000, mapCmChoices: [2, 3, 4, 5, 6, 7, 8, 9] },
];

const MARGINAL_INFO = [
  { element: "Legend / key", purpose: "Explains what each symbol or colour on the map represents" },
  { element: "Scale", purpose: "Shows the relationship between distance on the map and actual distance on the ground" },
  { element: "Title", purpose: "States the area or theme the map is showing" },
  { element: "North arrow", purpose: "Shows the direction of true or magnetic north, used for orientation" },
  { element: "Grid reference", purpose: "A system of numbered lines used to pinpoint exact locations on the map" },
] as const;

const REPRESENTATION_FACTS = [
  { text: "Contour lines join points of the same height above sea level", bucket: "relief" },
  { text: "Contour lines drawn very close together show a steep slope", bucket: "relief" },
  { text: "Spot heights are dots marked with a specific altitude value at one point", bucket: "relief" },
  { text: "Colour shading (layer tinting) uses different colours to show different height ranges", bucket: "relief" },
  { text: "A blue line on a topographical map usually represents a river or stream", bucket: "features" },
  { text: "A black square with cross-hatching usually represents a built-up settlement area", bucket: "features" },
] as const;

const BUCKET_LABEL: Record<string, string> = { relief: "Method of showing relief (height/slope)", features: "Symbol for a physical/human feature" };

const APPLICATIONS = [
  { situation: "A farmer wants to find the shortest, flattest route to transport produce to the market", use: "Use the map's contour lines to choose a route avoiding steep slopes" },
  { situation: "A county government is planning where to build a new health centre", use: "Use the map's settlement and road symbols to pick an accessible, central location" },
  { situation: "A hiking group wants to know how far they will walk and how steep the terrain will be", use: "Use the scale to calculate distance and the contour lines to judge the slope" },
  { situation: "A land surveyor needs to confirm the exact boundary of a plot", use: "Use the grid reference system to pinpoint exact coordinates" },
] as const;

export const mapReading: Skill = {
  id: "g8-ss-nhbe-map-reading",
  code: "NHBE.1",
  subjectId: "social-studies",
  strandId: "g8-ss-nhbe",
  grade: 8,
  title: "Map reading and interpretation",
  description: "Calculating actual distance and area from a topographical map's scale, interpreting marginal information, and methods of representing physical features on a map.",
  generate(rng) {
    const branch = randChoice(rng, ["scale-distance", "area", "marginal", "representation", "application"] as const);

    if (branch === "scale-distance") {
      const { scale, mapCmChoices } = randChoice(rng, SCALE_OPTIONS);
      const mapCm = randChoice(rng, mapCmChoices);
      const direction = randChoice(rng, ["forward", "reverse"] as const);
      const actualCm = mapCm * scale;
      const km = actualCm / 100000;
      if (direction === "forward") {
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
      return {
        kind: "fill-blank",
        prompt: `On a topographical map with a scale of 1:${scale.toLocaleString()}, a road that is actually ${km} km long is drawn on the map.`,
        before: "The length of the road on the map is",
        after: "cm.",
        correctAnswer: String(mapCm),
        inputMode: "numeric",
        hint: "Convert the actual distance to centimetres, then divide by the scale.",
        explanation: `${km}\\text{ km} = ${actualCm.toLocaleString()}\\text{ cm}. Map length = ${actualCm.toLocaleString()} \\div ${scale.toLocaleString()} = ${mapCm}\\text{ cm}.`,
      };
    }

    if (branch === "area") {
      const rows = randInt(rng, 4, 6);
      const cols = randInt(rng, 4, 6);
      const totalSquares = rows * cols;
      // Randomly fill a plausible number of squares to represent a farm/forest plot on the grid.
      const filledCount = randInt(rng, Math.floor(totalSquares * 0.3), Math.floor(totalSquares * 0.6));
      const allCells: [number, number][] = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) allCells.push([r, c]);
      const filled = shuffle(rng, allCells).slice(0, filledCount) as [number, number][];
      const squareKm2 = randChoice(rng, [1, 2, 4]);
      const areaKm2 = filled.length * squareKm2;
      return {
        kind: "fill-blank",
        prompt: `Each grid square on this map section represents ${squareKm2} km² of land. The shaded squares show a forest reserve.`,
        visual: { type: "grid-shape", rows, cols, filled },
        before: "The total area of the forest reserve is",
        after: "km².",
        correctAnswer: String(areaKm2),
        inputMode: "numeric",
        hint: `Count the shaded squares, then multiply by the area each square represents (${squareKm2} km²).`,
        explanation: `There are ${filled.length} shaded squares × ${squareKm2} km² each = ${areaKm2} km².`,
      };
    }

    if (branch === "marginal") {
      const chosen = shuffle(rng, [...MARGINAL_INFO]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.element, label: m.element })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.element, label: m.purpose })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.element] = m.element;
      return {
        kind: "click-match",
        prompt: "Match each piece of marginal information on a topographical map to what it tells the reader.",
        tokens,
        targets,
        correctMap,
        hint: "Marginal information is everything printed around the edge of the map that helps you interpret it correctly.",
        explanation: chosen.map((m) => `${m.element}: ${m.purpose}.`).join(" "),
      };
    }

    if (branch === "application") {
      const a = randChoice(rng, APPLICATIONS);
      const others = APPLICATIONS.filter((x) => x.use !== a.use).map((x) => x.use);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, a.use, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${a.situation}. Applying critical thinking, how should they use a topographical map to help?`,
        choices,
        correctIndex,
        hint: "Think about which specific map feature (contours, symbols, scale, or grid) best solves this real problem.",
        explanation: `${a.use} — this is the most useful way to apply map interpretation skills here.`,
      };
    }

    // representation
    const chosen = shuffle(rng, REPRESENTATION_FACTS).slice(0, 6);
    const buckets = Array.from(new Set(chosen.map((f) => f.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
    const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
    return {
      kind: "categorize",
      prompt: "Sort each statement into how physical features are represented on a topographical map.",
      items,
      buckets,
      correctBucket,
      hint: "Relief (height and slope) is shown differently from specific physical or human features like rivers and settlements.",
      explanation: chosen.map((f) => `"${f.text}" — ${BUCKET_LABEL[f.bucket].toLowerCase()}.`).join(" "),
    };
  },
};
