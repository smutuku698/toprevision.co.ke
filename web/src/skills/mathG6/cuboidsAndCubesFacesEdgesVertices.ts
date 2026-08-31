import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 3.3(a): identify vertices, faces and edges in cuboids and cubes. A cuboid/cube always has
// 6 faces, 12 edges and 8 vertices — fixed facts, used exactly as given in the design.
// 31 real-world Kenyan objects (8 cube, 23 cuboid) — over the 30+ floor for this round.
const CUBE_CUBOID_OBJECTS = [
  { label: "A playing dice", shape: "cube" },
  { label: "A Rubik's cube puzzle", shape: "cube" },
  { label: "An ice cube from a freezer tray", shape: "cube" },
  { label: "A sugar cube dropped into tea", shape: "cube" },
  { label: "A cube-shaped storage stool", shape: "cube" },
  { label: "A cube-shaped concrete building block", shape: "cube" },
  { label: "A cube-shaped wooden toy block for toddlers", shape: "cube" },
  { label: "A cube-shaped planter box for flowers", shape: "cube" },
  { label: "A matchbox", shape: "cuboid" },
  { label: "A brick used to build a wall", shape: "cuboid" },
  { label: "A closed exercise book", shape: "cuboid" },
  { label: "A shipping container at Mombasa port", shape: "cuboid" },
  { label: "A cardboard packing box", shape: "cuboid" },
  { label: "A tissue box on a table", shape: "cuboid" },
  { label: "A freight container loaded onto a lorry", shape: "cuboid" },
  { label: "A biscuit packet", shape: "cuboid" },
  { label: "A carton of milk", shape: "cuboid" },
  { label: "A gift box wrapped for a birthday", shape: "cuboid" },
  { label: "A wooden crate for transporting fruit", shape: "cuboid" },
  { label: "A school locker", shape: "cuboid" },
  { label: "A refrigerator in a kitchen", shape: "cuboid" },
  { label: "A microwave oven", shape: "cuboid" },
  { label: "A washing machine", shape: "cuboid" },
  { label: "A briefcase", shape: "cuboid" },
  { label: "A travel suitcase", shape: "cuboid" },
  { label: "A loaf of sliced bread", shape: "cuboid" },
  { label: "A bar of soap", shape: "cuboid" },
  { label: "A classroom building block (a whole classroom)", shape: "cuboid" },
  { label: "A shoebox", shape: "cuboid" },
  { label: "A cereal box", shape: "cuboid" },
  { label: "A chalk duster (blackboard eraser)", shape: "cuboid" },
] as const;

// Fixed geometric facts — a cuboid/cube always has these counts, so this stays under 30.
const FACE_EDGE_VERTEX_FACTS = [
  { part: "faces", term: "Face", meaning: "The flat surfaces on the outside of the solid" },
  { part: "edges", term: "Edge", meaning: "The straight lines where two faces meet" },
  { part: "vertices", term: "Vertex", meaning: "The corner points where edges meet" },
] as const;

function faceLabels(l: number, w: number, h: number) {
  return [
    { id: "front", label: `Front (${w}×${h})` },
    { id: "back", label: `Back (${w}×${h})` },
    { id: "left", label: `Left side (${l}×${h})` },
    { id: "right", label: `Right side (${l}×${h})` },
    { id: "top", label: `Top (${w}×${l})` },
    { id: "bottom", label: `Bottom (${w}×${l})` },
  ];
}

export const cuboidsAndCubesFacesEdgesVertices: Skill = {
  id: "g6-math-g-cuboids-cubes-vertices",
  code: "G.5",
  subjectId: "math",
  strandId: "g6-math-geometry",
  grade: 6,
  title: "Cuboids and cubes: faces, edges, vertices",
  description: "Identify and count the vertices, faces, and edges of cuboids and cubes, and recognize real-world cuboid and cube objects.",
  generate(rng) {
    const branch = randChoice(rng, ["rotate-click-face", "count-fact", "sort-objects", "identify-cube", "part-match"] as const);

    if (branch === "rotate-click-face") {
      const l = randInt(rng, 4, 12);
      const w = randInt(rng, 4, 12);
      const h = randInt(rng, 4, 12);
      const faces = faceLabels(l, w, h);
      const askId = randChoice(rng, ["front", "back", "left", "right", "top", "bottom"] as const);
      const askLabel: Record<string, string> = { front: "FRONT", back: "BACK", left: "LEFT", right: "RIGHT", top: "TOP", bottom: "BOTTOM" };
      return {
        kind: "solid-rotate",
        shape: "cuboid",
        length: l,
        width: w,
        height: h,
        faces,
        askId,
        correctFaceId: askId,
        prompt: `This storage crate is shaped like a cuboid. Rotate it and click the ${askLabel[askId]} face.`,
        hint: "Drag to spin the crate around until you can clearly see the requested face, then click it.",
        explanation: `The ${askLabel[askId]} face is one of the cuboid's 6 flat faces.`,
      };
    }

    if (branch === "count-fact") {
      const obj = randChoice(rng, CUBE_CUBOID_OBJECTS);
      const part = randChoice(rng, ["faces", "edges", "vertices"] as const);
      const answer: Record<typeof part, number> = { faces: 6, edges: 12, vertices: 8 } as const;
      return {
        kind: "fill-blank",
        prompt: `${obj.label} is shaped like a ${obj.shape}. How many ${part} does it have?`,
        before: `Number of ${part} =`,
        after: "",
        correctAnswer: String(answer[part]),
        inputMode: "numeric",
        hint: "Every cuboid and cube has the same fixed number of faces, edges, and vertices.",
        explanation: `A ${obj.shape} always has 6 faces, 12 edges, and 8 vertices — so the answer is ${answer[part]}.`,
      };
    }

    if (branch === "sort-objects") {
      const chosen = shuffle(rng, CUBE_CUBOID_OBJECTS).slice(0, 6);
      const items = chosen.map((o, i) => ({ id: `o${i}`, label: o.label }));
      const buckets = [
        { id: "cube", label: "Cube (all edges equal)" },
        { id: "cuboid", label: "Cuboid (not all edges equal)" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((o, i) => (correctBucket[`o${i}`] = o.shape));
      return {
        kind: "categorize",
        prompt: "Sort each real-world object by whether it is shaped like a cube or a cuboid.",
        items,
        buckets,
        correctBucket,
        hint: "A cube has all edges the same length. A cuboid's length, width and height are not all equal.",
        explanation: chosen.map((o) => `${o.label} — ${o.shape}.`).join(" "),
      };
    }

    if (branch === "identify-cube") {
      const cubeObj = randChoice(rng, CUBE_CUBOID_OBJECTS.filter((o) => o.shape === "cube"));
      const cuboidDistractors = shuffle(rng, CUBE_CUBOID_OBJECTS.filter((o) => o.shape === "cuboid")).slice(0, 3);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        cubeObj.label,
        cuboidDistractors.map((o) => o.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Which of these real-world objects is shaped like a cube (all edges the same length), not a cuboid?",
        choices,
        correctIndex,
        layout: "list",
        hint: "A cube looks the same width, height and depth. A cuboid is longer in one direction than the others.",
        explanation: `${cubeObj.label} is a cube — all its edges are the same length. The others are cuboids, with unequal length, width and height.`,
      };
    }

    // part-match: match face/edge/vertex terms to their meanings (fixed 3-term vocabulary)
    const tokens = FACE_EDGE_VERTEX_FACTS.map((f, i) => ({ id: `t${i}`, label: f.term }));
    const targets = shuffle(rng, FACE_EDGE_VERTEX_FACTS.map((f, i) => ({ id: `m${i}`, label: f.meaning })));
    const correctMap: Record<string, string> = {};
    FACE_EDGE_VERTEX_FACTS.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
    return {
      kind: "click-match",
      prompt: "Match each part of a solid shape to its meaning.",
      tokens,
      targets,
      correctMap,
      hint: "A face is flat, an edge is a line, a vertex is a corner point.",
      explanation: "Face — a flat surface. Edge — a line where two faces meet. Vertex — a corner point where edges meet.",
    };
  },
};
