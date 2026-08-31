import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill, VisualSpec } from "@/lib/types";

const REAL_OBJECTS: { object: string; solid: string; visual: VisualSpec }[] = [
  { object: "a die used in a board game", solid: "Cube", visual: { type: "solid", shape: "cube", side: 4 } },
  { object: "a matchbox", solid: "Cuboid", visual: { type: "solid", shape: "cuboid", length: 6, width: 4, height: 3 } },
  { object: "a tin of beans", solid: "Cylinder", visual: { type: "solid", shape: "cylinder", radius: 4, height: 8 } },
  { object: "an ice-cream cone", solid: "Cone", visual: { type: "solid", shape: "cone", radius: 4, height: 8 } },
  { object: "a football", solid: "Sphere", visual: { type: "solid", shape: "sphere", radius: 5 } },
  { object: "a tent with a triangular cross-section", solid: "Triangular prism", visual: { type: "solid", shape: "triangular-prism", base: 6, triHeight: 5, length: 10 } },
  { object: "the Great Pyramid of Giza", solid: "Square-based pyramid", visual: { type: "solid", shape: "pyramid", baseSide: 6, height: 8 } },
];

const FEV: Record<string, { faces: number; edges: number; vertices: number }> = {
  Cube: { faces: 6, edges: 12, vertices: 8 },
  Cuboid: { faces: 6, edges: 12, vertices: 8 },
  "Triangular prism": { faces: 5, edges: 9, vertices: 6 },
  "Square-based pyramid": { faces: 5, edges: 8, vertices: 5 },
};

// (half-base, height, slant) so the slant height comes out as a whole number.
const PYRAMID_TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]];
// (base, triHeight, hypotenuse) right-triangle cross-sections for a clean triangular-prism perimeter.
const PRISM_TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [20, 21, 29], [12, 16, 20]];

export const commonSolids: Skill = {
  id: "g8-math-ge-common-solids",
  code: "GE.4",
  subjectId: "math",
  strandId: "g8-math-geometry",
  grade: 8,
  title: "Common solids",
  description: "Identify common solids from real-life objects, count their faces/edges/vertices, and find the surface area of pyramids and triangular prisms.",
  generate(rng) {
    const branch = randChoice(rng, ["identify", "count-fev", "pyramid-sa", "prism-sa", "real-world-sort", "match-faces", "rotate-identify-face"] as const);

    if (branch === "rotate-identify-face") {
      const item = randChoice(rng, [
        { object: "matchbox", length: 6, width: 4, height: 3 },
        { object: "cereal box", length: 8, width: 5, height: 12 },
        { object: "brick", length: 9, width: 5, height: 4 },
      ] as const);
      const faceLabel = (dim1: number, dim2: number) => `${dim1}×${dim2} cm`;
      const faces = [
        { id: "front", label: faceLabel(item.width, item.height) },
        { id: "back", label: faceLabel(item.width, item.height) },
        { id: "left", label: faceLabel(item.length, item.height) },
        { id: "right", label: faceLabel(item.length, item.height) },
        { id: "top", label: faceLabel(item.width, item.length) },
        { id: "bottom", label: faceLabel(item.width, item.length) },
      ];
      return {
        kind: "solid-rotate",
        shape: "cuboid",
        length: item.length,
        width: item.width,
        height: item.height,
        faces,
        askId: "bottom",
        correctFaceId: "bottom",
        prompt: `This ${item.object} is shaped like a cuboid. Rotate it and click its BASE — the face it would rest flat on if placed on a table.`,
        hint: "The base is the bottom face — directly opposite the top.",
        explanation: `The base of the ${item.object} is its bottom face — the one it stands on.`,
      };
    }

    if (branch === "identify") {
      const item = randChoice(rng, REAL_OBJECTS);
      const distractorSolids = REAL_OBJECTS.map((o) => o.solid).filter((s) => s !== item.solid);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, item.solid, distractorSolids, 3);
      return {
        kind: "multiple-choice",
        prompt: `What solid shape is ${item.object}?`,
        visual: item.visual,
        choices,
        correctIndex,
        layout: "row",
        hint: "Look at the picture — is it curved, flat-faced, pointed, or box-like?",
        explanation: `${item.object[0].toUpperCase()}${item.object.slice(1)} is shaped like a ${item.solid.toLowerCase()}.`,
      };
    }

    if (branch === "count-fev") {
      const solidNames = Object.keys(FEV);
      const solid = randChoice(rng, solidNames);
      const measure = randChoice(rng, ["faces", "edges", "vertices"] as const);
      const answer = FEV[solid][measure];
      const example = REAL_OBJECTS.find((o) => o.solid === solid)!;
      return {
        kind: "fill-blank",
        prompt: `How many ${measure} does a ${solid.toLowerCase()} have?`,
        visual: example.visual,
        before: "",
        after: measure,
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: measure === "faces" ? "Count the flat surfaces." : measure === "edges" ? "Count the straight lines where two faces meet." : "Count the corner points.",
        explanation: `A ${solid.toLowerCase()} has ${FEV[solid].faces} faces, ${FEV[solid].edges} edges, and ${FEV[solid].vertices} vertices.`,
      };
    }

    if (branch === "pyramid-sa") {
      const [half, height, slant] = randChoice(rng, PYRAMID_TRIPLES);
      const baseSide = half * 2;
      const baseArea = baseSide * baseSide;
      const triangleArea = 0.5 * baseSide * slant;
      const sa = baseArea + 4 * triangleArea;
      return {
        kind: "fill-blank",
        prompt: `A square-based pyramid has base side ${baseSide} cm and slant height ${slant} cm (the height of each triangular face). Find its total surface area.`,
        visual: { type: "solid", shape: "pyramid", baseSide, height },
        before: "Surface area =",
        after: "cm²",
        correctAnswer: String(sa),
        inputMode: "numeric",
        hint: "Surface area = base area + 4 × (area of one triangular face).",
        explanation: `Base area $= ${baseSide}^2 = ${baseArea}$ cm². Each triangular face $= \\frac{1}{2} \\times ${baseSide} \\times ${slant} = ${triangleArea}$ cm². Total surface area $= ${baseArea} + 4 \\times ${triangleArea} = ${sa}$ cm².`,
      };
    }

    if (branch === "prism-sa") {
      const [base, triHeight, hyp] = randChoice(rng, PRISM_TRIPLES);
      const length = randInt(rng, 6, 20);
      const triangleArea = 0.5 * base * triHeight;
      const perimeter = base + triHeight + hyp;
      const sa = 2 * triangleArea + perimeter * length;
      return {
        kind: "fill-blank",
        prompt: `A triangular prism (a tent shape) has a right-triangle cross-section with legs ${base} cm and ${triHeight} cm (hypotenuse ${hyp} cm), and length ${length} cm. Find its total surface area.`,
        visual: { type: "solid", shape: "triangular-prism", base, triHeight, length },
        before: "Surface area =",
        after: "cm²",
        correctAnswer: String(sa),
        inputMode: "numeric",
        hint: "Surface area = 2 × (triangle area) + (triangle perimeter × length).",
        explanation: `Triangle area $= \\frac{1}{2} \\times ${base} \\times ${triHeight} = ${triangleArea}$ cm². Triangle perimeter $= ${base}+${triHeight}+${hyp} = ${perimeter}$ cm. Surface area $= 2 \\times ${triangleArea} + ${perimeter} \\times ${length} = ${sa}$ cm².`,
      };
    }

    if (branch === "real-world-sort") {
      const chosen = shuffle(rng, REAL_OBJECTS).slice(0, 6);
      const items = chosen.map((o, i) => ({ id: `o${i}`, label: o.object }));
      const bucketSolids = Array.from(new Set(chosen.map((o) => o.solid)));
      const buckets = bucketSolids.map((s) => ({ id: s, label: s }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((o, i) => (correctBucket[`o${i}`] = o.solid));
      return {
        kind: "categorize",
        prompt: "Sort each real-life object by the solid shape it matches.",
        items,
        buckets,
        correctBucket,
        hint: "Picture the object's overall shape.",
        explanation: chosen.map((o) => `${o.object} → ${o.solid}`).join("; ") + ".",
      };
    }

    // match-faces: match solid name to its number of faces
    const solidNames = shuffle(rng, Object.keys(FEV));
    const tokens = solidNames.map((s) => ({ id: `n-${s}`, label: s }));
    const targets = shuffle(rng, solidNames.map((s) => ({ id: `f-${s}`, label: `${FEV[s].faces} faces` })));
    const correctMap: Record<string, string> = {};
    for (const s of solidNames) correctMap[`f-${s}`] = `n-${s}`;
    return {
      kind: "click-match",
      prompt: "Match each solid to its number of faces.",
      tokens,
      targets,
      correctMap,
      hint: "Count the flat surfaces of each solid.",
      explanation: solidNames.map((s) => `${s} has ${FEV[s].faces} faces`).join("; ") + ".",
    };
  },
};
