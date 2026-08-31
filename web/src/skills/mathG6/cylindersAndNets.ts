import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 3.3(b)/(c): faces and edges of a cylinder, and the plane shapes found in the nets of
// cuboids/cubes/cylinders. A cylinder always has 3 faces (2 flat circular + 1 curved), 2 edges
// and 0 vertices — fixed facts, used exactly as given in the design. solid-rotate doesn't
// support cylinders, so this content uses the static "solid" VisualSpec instead.
// 32 real-world Kenyan cylinder objects — over the 30+ floor for this round.
const CYLINDER_OBJECTS = [
  "A water storage tank",
  "An oil drum",
  "A length of PVC water pipe",
  "A tin of beans from a shop shelf",
  "A tin of tomato paste",
  "A vacuum flask (thermos) for tea",
  "A wooden rolling pin",
  "A candle",
  "A toilet paper roll",
  "A drinking straw",
  "A cooking gas cylinder",
  "A tree trunk's cross-section",
  "A traditional drum (ngoma)",
  "A soda can",
  "A tin of paint",
  "A milk churn carried to a dairy",
  "A factory chimney",
  "A concrete pillar holding up a veranda",
  "A torch (flashlight) body",
  "A cylindrical water bottle",
  "A drainage culvert pipe under a road",
  "A cylindrical stool",
  "A cylindrical flower vase",
  "A biscuit tin",
  "A honey jar",
  "A cylindrical yoghurt cup",
  "A grain storage bin (cylindrical silo)",
  "A firewood log's cross-section",
  "A rain-collecting cylindrical drum",
  "A cylindrical pencil holder",
  "A cylindrical water pump pipe",
  "A cylindrical school bell",
] as const;

const NON_CYLINDER_OBJECTS = [
  "A matchbox (a cuboid)",
  "A dice (a cube)",
  "A brick (a cuboid)",
  "A shipping container (a cuboid)",
  "A tissue box (a cuboid)",
  "A cereal box (a cuboid)",
  "An exercise book (a cuboid)",
  "A Rubik's cube (a cube)",
] as const;

// Fixed geometric facts and net facts — always true for these solids, so this stays under 30.
const NET_FACTS = [
  { solid: "A cube", net: "Six flat squares, all the same size" },
  { solid: "A cuboid", net: "Six flat rectangles, in three pairs of equal size" },
  { solid: "A cylinder", net: "Two flat circles plus one curved rectangle that wraps around them" },
] as const;

// Fixed 5-step procedure — a procedural sequence, not a content pool.
const CYLINDER_NET_STEPS = [
  { id: "s1", label: "Trace around each flat circular end of the cylinder" },
  { id: "s2", label: "Measure the circumference (distance around) of the circular end" },
  { id: "s3", label: "That circumference becomes the length of the curved rectangle" },
  { id: "s4", label: "The cylinder's height becomes the width of that rectangle" },
  { id: "s5", label: "Cut out the shape: two circles plus one rectangle" },
] as const;

export const cylindersAndNets: Skill = {
  id: "g6-math-g-cylinders-nets",
  code: "G.6",
  subjectId: "math",
  strandId: "g6-math-geometry",
  grade: 6,
  title: "Cylinders and nets",
  description: "Identify the faces and edges of a cylinder, describe the plane figures found in the nets of cuboids, cubes and cylinders, and recognize real-world cylinder objects.",
  generate(rng) {
    const branch = randChoice(rng, ["cylinder-count-fact", "identify-cylinder", "sort-cylinder", "net-match", "net-steps"] as const);

    if (branch === "cylinder-count-fact") {
      const obj = randChoice(rng, CYLINDER_OBJECTS);
      const radius = randInt(rng, 3, 15);
      const height = randInt(rng, 8, 40);
      const askPart = randChoice(rng, ["flat faces", "curved faces", "total faces", "edges", "vertices"] as const);
      const answers: Record<typeof askPart, number> = {
        "flat faces": 2,
        "curved faces": 1,
        "total faces": 3,
        edges: 2,
        vertices: 0,
      } as const;
      return {
        kind: "fill-blank",
        prompt: `${obj} is shaped like a cylinder. How many ${askPart} does it have?`,
        visual: { type: "solid", shape: "cylinder", radius, height },
        before: `Number of ${askPart} =`,
        after: "",
        correctAnswer: String(answers[askPart]),
        inputMode: "numeric",
        hint: "A cylinder has 2 flat circular faces and 1 curved face (3 faces in total), 2 edges, and 0 vertices — it has no sharp corners.",
        explanation: `A cylinder always has 2 flat circular faces, 1 curved face (3 faces total), 2 edges (where the curved surface meets each flat circle), and 0 vertices — so the answer is ${answers[askPart]}.`,
      };
    }

    if (branch === "identify-cylinder") {
      const cyl = randChoice(rng, CYLINDER_OBJECTS);
      const distractors = shuffle(rng, NON_CYLINDER_OBJECTS).slice(0, 3);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, cyl, [...distractors], 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these real-world objects is shaped like a cylinder?",
        choices,
        correctIndex,
        layout: "list",
        hint: "A cylinder has two flat circular ends joined by one curved surface — no flat rectangular or square faces, and no sharp corners.",
        explanation: `${cyl} is a cylinder. The other options have flat rectangular or square faces and sharp corners, which cylinders do not have.`,
      };
    }

    if (branch === "sort-cylinder") {
      const chosenCyl = shuffle(rng, CYLINDER_OBJECTS).slice(0, 4);
      const chosenNon = shuffle(rng, NON_CYLINDER_OBJECTS).slice(0, 3);
      const items = shuffle(rng, [
        ...chosenCyl.map((o, i) => ({ id: `c${i}`, label: o, bucket: "cylinder" as const })),
        ...chosenNon.map((o, i) => ({ id: `n${i}`, label: o, bucket: "not-cylinder" as const })),
      ]);
      const buckets = [
        { id: "cylinder", label: "Cylinder" },
        { id: "not-cylinder", label: "Not a cylinder (cuboid/cube)" },
      ];
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each real-world object by whether it is shaped like a cylinder.",
        items: items.map((it) => ({ id: it.id, label: it.label })),
        buckets,
        correctBucket,
        hint: "A cylinder has curved sides and flat circular ends — no flat rectangular faces or sharp corners.",
        explanation: items.map((it) => `${it.label} — ${it.bucket === "cylinder" ? "a cylinder" : "not a cylinder"}.`).join(" "),
      };
    }

    if (branch === "net-match") {
      const tokens = NET_FACTS.map((f, i) => ({ id: `t${i}`, label: f.solid }));
      const targets = shuffle(rng, NET_FACTS.map((f, i) => ({ id: `m${i}`, label: f.net })));
      const correctMap: Record<string, string> = {};
      NET_FACTS.forEach((_, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each 3-D solid to the plane shapes found when you unfold its net.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which faces are square, rectangular, or circular when the solid is opened flat.",
        explanation: NET_FACTS.map((f) => `${f.solid}'s net: ${f.net}.`).join(" "),
      };
    }

    // net-steps: order the steps for drawing a cylinder's net
    return {
      kind: "ordering",
      prompt: "Put these steps for drawing a cylinder's net in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, CYLINDER_NET_STEPS),
      correctOrder: CYLINDER_NET_STEPS.map((s) => s.id),
      hint: "You need the circle traced and its circumference measured before you can size the rectangle.",
      explanation: "Steps: (1) trace each circular end, (2) measure the circumference, (3) that becomes the rectangle's length, (4) the cylinder's height becomes the rectangle's width, (5) cut out two circles plus the rectangle.",
    };
  },
};
