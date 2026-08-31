import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { VOLUME_OBJECT_CONTEXTS, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

export const volumeOfCubesAndCuboids: Skill = {
  id: "g5-math-m-volume",
  code: "M.4",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Volume of cubes and cuboids",
  description: "Identify the cubic centimetre as a unit of volume, derive and use v = l × w × h for a cuboid and v = s × s × s for a cube, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["unit-mc", "stacked-cubes-derive", "cuboid-compute", "cube-derive-mc", "cube-compute", "missing-dimension-mc", "click-match", "ordering"] as const);

    if (branch === "unit-mc") {
      const prompts = [
        "Which unit is used to measure volume, such as how much space a box takes up?",
        "What unit do we use for volume?",
        "Which of these is a unit for measuring volume, not area?",
        "To measure how much space a cuboid fills, which unit is used?",
        "Which unit correctly measures volume?",
        "Volume is measured using which unit?",
        "Which unit tells us how much space something fills?",
        "When filling a box with 1 cm by 1 cm by 1 cm cubes, what unit describes the total?",
        "Which unit is correct for the volume of a matchbox?",
        "Which of these units measures volume rather than length or area?",
        "Pick the correct unit for measuring the volume of a storage tin.",
        "Which unit should be used to state the volume of a wooden crate?",
      ];
      const wrong = ["cm", "cm²", "cm³ of water"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "cm³", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "row",
        hint: "Volume is a 'cubed' unit — think of filling a shape with 1 cm × 1 cm × 1 cm cubes.",
        explanation: "cm³ (cubic centimetres) measures volume. cm measures length only, cm² measures area (a flat surface), and 'cm³ of water' is not itself a unit name.",
      };
    }

    if (branch === "stacked-cubes-derive") {
      const l = randInt(rng, 2, 6);
      const w = randInt(rng, 2, 5);
      const h = randInt(rng, 2, 5);
      const total = l * w * h;
      const prompts = [
        `A box is packed with 1 cm cubes: ${l} cubes along the length, ${w} cubes along the width, and stacked ${h} layers high. How many 1 cm³ cubes fill it in total?`,
        `1 cm cubes are arranged in a cuboid: ${l} across the length, ${w} across the width, and ${h} layers tall. Find the total number of cubes — this is the volume in cm³.`,
        `A cuboid is built from 1 cm cubes: ${l} in a row along the length, ${w} rows across the width, ${h} layers deep. What is the total count of cubes, in cm³?`,
        `Counting 1 cm cubes layer by layer: each layer has ${l} × ${w} cubes, and there are ${h} layers. What is the total number of cubes?`,
        `A shape is built with 1 cm cubes: ${l} long, ${w} wide, ${h} layers high. How many unit cubes make it up, giving the volume in cm³?`,
        `Every layer of this cuboid has ${l} rows of ${w} unit cubes, and there are ${h} such layers. Find the total number of cubes.`,
        `This cuboid is filled with 1 cm³ cubes: ${l} along one edge, ${w} along another, and ${h} layers stacked up. What is the total volume in cm³?`,
        `To find the volume, count the cubes: ${l} × ${w} cubes make one layer, and there are ${h} layers. What is the total, in cm³?`,
        `A wooden box is exactly filled by unit cubes arranged ${l} by ${w} by ${h}. How many unit cubes does it take, and so what is the volume in cm³?`,
        `Stacking 1 cm cubes ${h} layers high, with each layer being ${l} cubes by ${w} cubes, how many cubes are used altogether?`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, prompts),
        visual: { type: "solid", shape: "cuboid", length: l, width: w, height: h },
        before: "Total unit cubes =",
        after: "cm³",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Count the cubes in one layer (length × width), then multiply by the number of layers (height) — this is exactly why v = l × w × h.",
        explanation: `One layer has ${l} × ${w} = ${l * w} cubes. With ${h} layers, the total is ${l * w} × ${h} = ${total} cm³. This is why the volume formula v = l × w × h works: it counts every unit cube without counting one by one.`,
      };
    }

    if (branch === "cuboid-compute") {
      const obj = randChoice(rng, VOLUME_OBJECT_CONTEXTS).replace("{place}", place(rng));
      const l = randInt(rng, 4, 20);
      const w = randInt(rng, 3, 16);
      const h = randInt(rng, 2, 14);
      const volume = l * w * h;
      const openers = [
        `${obj[0].toUpperCase()}${obj.slice(1)} measures ${l} cm long, ${w} cm wide, and ${h} cm high.`,
        `A cuboid shape for ${obj} has length ${l} cm, width ${w} cm, and height ${h} cm.`,
        `${obj[0].toUpperCase()}${obj.slice(1)} has these dimensions: length ${l} cm, width ${w} cm, height ${h} cm.`,
        `The cuboid shape of ${obj} is ${l} cm by ${w} cm by ${h} cm.`,
        `${obj[0].toUpperCase()}${obj.slice(1)} is ${l} cm long, ${w} cm wide and ${h} cm tall.`,
      ];
      const closers = ["What is its volume?", "Find its volume.", "Work out the volume of this cuboid.", "Calculate the volume."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        visual: { type: "solid", shape: "cuboid", length: l, width: w, height: h },
        before: "Volume =",
        after: "cm³",
        correctAnswer: String(volume),
        inputMode: "numeric",
        hint: "Volume of a cuboid = length × width × height.",
        explanation: `Volume = ${l} × ${w} × ${h} = ${volume} cm³.`,
      };
    }

    if (branch === "cube-derive-mc") {
      const s = randInt(rng, 2, 12);
      const correct = s * s * s;
      // Misconceptions: computing s x s only (area, forgetting the third dimension), and s x 3 (confusing cubing with multiplying by 3).
      const wrongArea = s * s;
      const wrongTriple = s * 3;
      const candidates = [wrongArea, wrongTriple];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(correct), candidates.map(String), candidates.length);
      const openers = [
        `A cube has every side measuring ${s} cm.`,
        `Each edge of a cube is ${s} cm long.`,
        `A cube-shaped object has sides of ${s} cm.`,
        `Consider a cube with side length ${s} cm.`,
      ];
      const closers = [" What is its volume, using v = s × s × s?", " Find its volume by cubing the side length.", " Work out the volume correctly.", " What is the correct volume?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "row",
        hint: "Volume of a cube = side × side × side — multiply the side length by itself three times, not twice, and not by 3.",
        explanation: `${s} × ${s} × ${s} = ${correct} cm³. Multiplying the side by itself only twice gives the area (a flat measurement), and multiplying by 3 confuses 'cubing' with simple multiplication.`,
      };
    }

    if (branch === "cube-compute") {
      const obj = randChoice(rng, VOLUME_OBJECT_CONTEXTS).replace("{place}", place(rng));
      const s = randInt(rng, 3, 15);
      const volume = s * s * s;
      const openers = [
        `${obj[0].toUpperCase()}${obj.slice(1)} is a cube with each side measuring ${s} cm.`,
        `A cube-shaped ${obj} has sides of ${s} cm.`,
        `${obj[0].toUpperCase()}${obj.slice(1)} is cube-shaped, ${s} cm on every side.`,
        `The cube shape of ${obj} measures ${s} cm along each edge.`,
        `${obj[0].toUpperCase()}${obj.slice(1)} is a cube measuring ${s} cm by ${s} cm by ${s} cm.`,
      ];
      const closers = ["What is its volume?", "Find its volume.", "Work out the volume of this cube.", "Calculate the volume."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        visual: { type: "solid", shape: "cube", side: s },
        before: "Volume =",
        after: "cm³",
        correctAnswer: String(volume),
        inputMode: "numeric",
        hint: "Volume of a cube = side × side × side.",
        explanation: `Volume = ${s} × ${s} × ${s} = ${volume} cm³.`,
      };
    }

    if (branch === "missing-dimension-mc") {
      const l = randInt(rng, 5, 15);
      const w = randInt(rng, 4, 12);
      const h = randInt(rng, 3, 10);
      const volume = l * w * h;
      // Misconceptions: dividing by only one of the two known dimensions, or subtracting instead of dividing.
      const wrongDivideOne = Math.max(1, Math.round(volume / l));
      const wrongSubtract = Math.max(1, h - 2);
      const candidates = [...new Set([wrongDivideOne, wrongSubtract])].filter((v) => v !== h);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, String(h), candidates.map(String), Math.min(2, candidates.length));
      const prompts = [
        `A cuboid has volume ${volume} cm³, length ${l} cm, and width ${w} cm. What is its height?`,
        `A box's volume is ${volume} cm³. Its length is ${l} cm and width is ${w} cm. Find the height.`,
        `Given a cuboid of volume ${volume} cm³, length ${l} cm and width ${w} cm, what is the height?`,
        `A cuboid measuring ${l} cm by ${w} cm has a volume of ${volume} cm³. Find its height.`,
        `Find the missing height of a cuboid with volume ${volume} cm³, length ${l} cm, and width ${w} cm.`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices: choices.map((c) => `${c} cm`),
        correctIndex,
        layout: "row",
        hint: "Rearrange: height = volume ÷ (length × width).",
        explanation: `Height = ${volume} ÷ (${l} × ${w}) = ${volume} ÷ ${l * w} = ${h} cm. Dividing by only one dimension, or subtracting instead, gives the wrong distractors.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctCuboids(rng, 4);
      const tokens = chosen.map((c, i) => ({ id: `c${i}`, label: `${c.l} × ${c.w} × ${c.h} cm` }));
      const targets = shuffle(rng, chosen.map((c, i) => ({ id: `c${i}`, label: `${c.l * c.w * c.h} cm³` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`c${i}`] = `c${i}`));
      const prompts = [
        "Match each cuboid's dimensions to its volume.",
        "Pair each length-width-height set with its volume.",
        "Match each cuboid to its volume in cm³.",
        "Click to match each set of dimensions to its volume.",
        "Find the correct volume for each cuboid's dimensions.",
        "Match each cuboid card to its volume value.",
        "Pair up each cuboid with its calculated volume.",
        "Connect each length × width × height set to its volume.",
        "Match every cuboid's size to its volume.",
        "Line up each cuboid with the volume it fills.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Multiply length × width × height for each cuboid.",
        explanation: chosen.map((c) => `${c.l} × ${c.w} × ${c.h} = ${c.l * c.w * c.h} cm³`).join("; ") + ".",
      };
    }

    // ordering
    const chosen = pickDistinctCuboids(rng, 4);
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: `${c.l} × ${c.w} × ${c.h} cm` }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => chosen[a].l * chosen[a].w * chosen[a].h - chosen[b].l * chosen[b].w * chosen[b].h);
    const prompts = [
      "Arrange these cuboids from smallest to largest volume.",
      "Order these cuboids by volume, smallest first.",
      "Put these cuboids in order of volume, smallest to largest.",
      "Rank these cuboids from smallest to largest volume.",
      "Sort these cuboids into order by volume, smallest first.",
      "Sequence these cuboids from smallest volume to largest.",
      "Line up these cuboids from the smallest volume to the largest.",
      "Place these cuboids in order, starting with the smallest volume.",
      "Which cuboid has the smallest volume? Order them all from there.",
      "Arrange these boxes from smallest to largest volume.",
    ];
    return {
      kind: "ordering",
      prompt: randChoice(rng, prompts),
      instruction: "Click them in order, smallest volume first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `c${i}`),
      hint: "Multiply length × width × height for each cuboid before comparing.",
      explanation: `In order: ${sortedIdx.map((i) => `${chosen[i].l} × ${chosen[i].w} × ${chosen[i].h} cm (${chosen[i].l * chosen[i].w * chosen[i].h} cm³)`).join(", ")}.`,
    };
  },
};

function pickDistinctCuboids(rng: RNG, count: number): { l: number; w: number; h: number }[] {
  const seen = new Set<string>();
  const result: { l: number; w: number; h: number }[] = [];
  while (result.length < count) {
    const l = randInt(rng, 3, 15);
    const w = randInt(rng, 2, 12);
    const h = randInt(rng, 2, 10);
    const key = `${l}x${w}x${h}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ l, w, h });
    }
  }
  return result;
}
