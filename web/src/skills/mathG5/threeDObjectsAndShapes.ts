import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { OBJECT_3D_EXAMPLES, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

// Purely descriptive at this grade — no vertex/face/edge counting, no nets (both Grade 6 only).
const SHAPE_2D_FACES: Record<string, string> = {
  cube: "squares (6 identical squares)",
  cuboid: "rectangles (opposite faces matching)",
  cylinder: "two circles and one curved rectangle (when unrolled)",
  sphere: "no flat faces at all — its surface is entirely curved",
  pyramid: "a square (or other polygon) base with triangle faces meeting at a point",
};

const SHAPE_NAMES = ["cube", "cuboid", "cylinder", "sphere", "pyramid"] as const;

export const threeDObjectsAndShapes: Skill = {
  id: "g5-math-g-3d-objects",
  code: "G.3",
  subjectId: "math",
  strandId: "g5-math-geometry",
  grade: 5,
  title: "3-D objects and the 2-D shapes within them",
  description: "Describe 3-D objects in the environment, and describe the 2-D shapes visible in them.",
  generate(rng) {
    const branch = randChoice(rng, ["solid-rotate", "identify-solid-mc", "faces-fill-blank", "object-shape-match", "categorize"] as const);

    if (branch === "solid-rotate") {
      const shape = randChoice(rng, ["cube", "cuboid"] as const);
      const length = randInt(rng, 3, 8);
      const width = shape === "cube" ? length : randInt(rng, 3, 7);
      const height = shape === "cube" ? length : randInt(rng, 3, 7);
      const faceNames = shape === "cube" ? ["top", "front", "side"] : ["top", "front", "side", "bottom"];
      const faces = faceNames.map((n) => ({ id: n, label: n[0].toUpperCase() + n.slice(1) }));
      const ask = randChoice(rng, faceNames);
      const prompts = [
        "Rotate the solid and click the face that is asked about.",
        "Spin the shape around, then click on the requested face.",
        "Turn the solid to find the correct face, then click it.",
        "Rotate this 3-D object and select the correct face.",
      ];
      return {
        kind: "solid-rotate",
        shape,
        length,
        width,
        height,
        faces,
        askId: ask,
        correctFaceId: ask,
        prompt: `${randChoice(rng, prompts)} Find the ${ask} face.`,
        hint: "Drag to rotate the solid until you can see the face that's asked for, then click it.",
        explanation: `The ${ask} face is the flat surface of the ${shape} in that position.`,
      };
    }

    if (branch === "identify-solid-mc") {
      const entry = randChoice(rng, OBJECT_3D_EXAMPLES);
      const object = entry.object.replace("{place}", place(rng));
      const correct = entry.shape;
      const wrong = shuffle(rng, SHAPE_NAMES.filter((s) => s !== correct)).slice(0, 3);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      const openers = [
        `Think about ${object}.`,
        `Picture ${object}.`,
        `Consider the shape of ${object}.`,
        `Look at ${object} in your mind.`,
      ];
      const closers = [
        " Which 3-D shape does it match?",
        " What 3-D shape is this?",
        " Which solid shape best describes it?",
        " Which 3-D object shape is this?",
      ];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Picture the overall shape of the object — flat sides, a round tube, a ball, a point at the top, or a perfect box.",
        explanation: `${object[0].toUpperCase()}${object.slice(1)} is shaped like a ${correct}.`,
      };
    }

    if (branch === "faces-fill-blank") {
      const shape = randChoice(rng, SHAPE_NAMES);
      const openers = [
        `A ${shape} is unfolded or looked at closely.`,
        `Look at the flat parts (or curved surface) of a ${shape}.`,
        `Consider the 2-D shapes that make up a ${shape}.`,
        `A ${shape}'s surface is examined.`,
      ];
      const closers = [
        " What 2-D shapes does it show?",
        " Which flat shapes can you see on it?",
        " What 2-D shapes make up its surface?",
        " Describe the 2-D shapes visible on it.",
      ];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "2-D shapes seen:",
        after: "",
        correctAnswer: SHAPE_2D_FACES[shape].split(" (")[0],
        acceptedAnswers: [SHAPE_2D_FACES[shape].split(" (")[0], SHAPE_2D_FACES[shape]],
        inputMode: "text",
        hint: "Think about what a flattened-out or closely examined version of this solid would look like.",
        explanation: `A ${shape} shows ${SHAPE_2D_FACES[shape]}.`,
      };
    }

    if (branch === "object-shape-match") {
      const chosen = shuffle(rng, [...OBJECT_3D_EXAMPLES])
        .filter((e, i, arr) => arr.findIndex((x) => x.shape === e.shape) === i)
        .slice(0, 5);
      const tokens = chosen.map((e, i) => ({ id: `o${i}`, label: e.object.replace("{place}", place(rng)) }));
      const targets = shuffle(rng, chosen.map((e, i) => ({ id: `s${i}`, label: e.shape })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`s${i}`] = `o${i}`));
      const prompts = [
        "Match each real-life object to its 3-D shape.",
        "Pair each object with the solid shape it resembles.",
        "Match each object to the correct 3-D shape name.",
        "Connect each real object to its matching solid shape.",
        "Match each item to the 3-D shape it looks like.",
        "Pair each object with its correct shape.",
        "Match each object card to its 3-D shape.",
        "Link each real-life object to its solid shape.",
        "Match every object to its correct 3-D shape.",
        "Connect each object with the shape it resembles.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Picture the overall shape of each object before matching.",
        explanation: chosen.map((e, i) => `${tokens[i].label} → ${e.shape}`).join("; ") + ".",
      };
    }

    // categorize: sort real objects by whether they have any flat faces at all.
    const chosen = shuffle(rng, [...OBJECT_3D_EXAMPLES]).slice(0, 6);
    const items = chosen.map((e, i) => ({ id: `o${i}`, label: e.object.replace("{place}", place(rng)) }));
    const buckets = [
      { id: "flat", label: "Has at least one flat face" },
      { id: "no-flat", label: "Has no flat faces (fully curved)" },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((e, i) => (correctBucket[`o${i}`] = e.shape === "sphere" ? "no-flat" : "flat"));
    const catPrompts = [
      "Sort each object by whether it has any flat faces.",
      "Group each object as having a flat face, or being fully curved.",
      "Classify each object: has flat faces, or none at all.",
      "Sort these objects into 'has flat faces' and 'fully curved'.",
      "Decide whether each object has a flat face, then sort it.",
      "Sort each object by whether it has a flat surface anywhere.",
      "Group these objects by whether they have flat faces.",
      "Classify each object by whether its surface is entirely curved.",
      "Sort each object based on whether it has at least one flat face.",
      "Which objects have flat faces? Sort them all.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "A sphere is the only shape here with no flat faces at all — everything else has at least one.",
      explanation: chosen.map((e, i) => `${items[i].label} (${e.shape}) ${e.shape === "sphere" ? "has no flat faces" : "has a flat face"}`).join("; ") + ".",
    };
  },
};
