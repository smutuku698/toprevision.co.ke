import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 5.0 Traditional Foods, sub-strand 5.4 Creative Writing:
// Narrative Compositions (120-160 words). Tested as knowledge ABOUT narrative structure and devices.
// See curriculum-reference/grade-5/english.json.

type Part = "orientation" | "complication" | "resolution";
const PART_LABEL: Record<Part, string> = {
  orientation: "Orientation (beginning) — sets the scene: who, where, when",
  complication: "Complication (middle) — a problem happens and events build up",
  resolution: "Resolution (ending) — the problem is solved; a feeling or lesson",
};

const SENTENCES: { text: string; part: Part }[] = [
  { text: "On the morning of the harvest festival, Grandmother lit the fire to boil the muthokoi.", part: "orientation" },
  { text: "Halfway through cooking, she realised the sack of maize and beans had been left out in the rain.", part: "complication" },
  { text: "In the end, the neighbours each brought a handful of grain, and the pot was full again.", part: "resolution" },
  { text: "It was Saturday, and the whole family had gathered in the village to prepare pilau.", part: "orientation" },
  { text: "Just as the rice went in, the gas cylinder hissed and went out.", part: "complication" },
  { text: "Uncle borrowed a jiko from next door, and the pilau was ready before the guests arrived.", part: "resolution" },
  { text: "My aunt owned the busiest chapati stall at the ${place} market.", part: "orientation" },
  { text: "One day her flour supplier did not come, and the queue kept growing.", part: "complication" },
  { text: "She finally used millet flour instead, and customers loved the new taste so much they kept asking for it.", part: "resolution" },
  { text: "Every December, we visited the coast and Mother cooked fish in coconut sauce.", part: "orientation" },
  { text: "That year a storm kept the fishing boats in the harbour for three days.", part: "complication" },
  { text: "We cooked githeri instead, and it became our new holiday tradition.", part: "resolution" },
];

const DEVICES: { device: string; flat: string; better: string }[] = [
  { device: "Dialogue", flat: "Grandmother said the porridge was ready.", better: "\"Come quickly, the porridge is ready!\" called Grandmother from the doorway." },
  { device: "Sensory description", flat: "The kitchen smelled nice.", better: "The kitchen was thick with the smell of frying onions and warm cardamom." },
  { device: "Suspense", flat: "She opened the pot and the food was fine.", better: "Her hand trembled as she lifted the lid, afraid of what she would find inside." },
  { device: "A twist", flat: "The meal was good and everyone was happy.", better: "The 'burnt' pot turned out to be the tastiest githeri anyone had eaten all year." },
  { device: "Showing feelings", flat: "I was sad.", better: "My throat tightened and I stared hard at my plate so no one would see my eyes." },
];

export const narrativeCompositions: Skill = {
  id: "g5-eng-writing-narrative-compositions",
  code: "W.5",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Narrative Compositions: Structure and Devices",
  description: "Identify the parts of a narrative (orientation, complication, resolution), order story events, and recognise devices (dialogue, description, suspense, a twist) that make a story interesting.",
  generate(rng) {
    const p = (s: string) => s.replace("${place}", "Kisumu");
    const branch = randChoice(rng, ["mc-part", "fill-part", "sort-parts", "match", "order-events", "reason-device"] as const);

    if (branch === "mc-part") {
      const s = randChoice(rng, SENTENCES);
      const wrong = shuffle(rng, (["orientation", "complication", "resolution"] as Part[]).filter((x) => x !== s.part)).map((x) => PART_LABEL[x]);
      const { choices, correctIndex } = mcFromCluster(rng, PART_LABEL[s.part], wrong, 2);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the part of a narrative this sentence belongs to")}\n"${p(s.text)}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Beginning sets the scene. Middle introduces a problem. Ending solves it.",
        explanation: `This belongs in the ${PART_LABEL[s.part].toLowerCase()}.`,
      };
    }

    if (branch === "fill-part") {
      const s = randChoice(rng, SENTENCES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the part name — "orientation", "complication" or "resolution"`),
        before: `"${p(s.text)}"\nThis sentence is part of the `,
        after: ".",
        correctAnswer: s.part,
        acceptedAnswers: [s.part, s.part === "orientation" ? "beginning" : s.part === "complication" ? "middle" : "ending"],
        inputMode: "text",
        hint: "Orientation = beginning, complication = middle (the problem), resolution = ending (the solution).",
        explanation: `It is the ${s.part} — ${PART_LABEL[s.part].split("—")[1].trim()}.`,
      };
    }

    if (branch === "sort-parts") {
      // pick one full 3-sentence story so the three parts are clearly contrasted
      const starts = [0, 3, 6, 9];
      const base = randChoice(rng, starts);
      const trio = SENTENCES.slice(base, base + 3);
      const items = shuffle(rng, trio.map((s, i) => ({ id: `s${i}`, label: p(s.text) })));
      const correctBucket: Record<string, string> = {};
      trio.forEach((s, i) => (correctBucket[`s${i}`] = s.part));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which part of the story each sentence is"),
        items,
        buckets: [
          { id: "orientation", label: "Beginning (orientation)" },
          { id: "complication", label: "Middle (complication)" },
          { id: "resolution", label: "Ending (resolution)" },
        ],
        correctBucket,
        hint: "One sentence sets the scene, one presents a problem, one solves it.",
        explanation: "A narrative moves from orientation (scene) to complication (problem and rising events) to resolution (solution and feeling).",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, DEVICES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((d) => ({ id: d.device, label: d.device })));
      const targets = shuffle(rng, pool.map((d) => ({ id: d.device, label: d.better })));
      const correctMap: Record<string, string> = {};
      pool.forEach((d) => (correctMap[d.device] = d.device));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "story device to a sentence that uses it"),
        tokens,
        targets,
        correctMap,
        hint: "Dialogue has speech marks. Suspense makes you worried about what comes next. A twist surprises you.",
        explanation: pool.map((d) => `${d.device}: "${d.better}"`).join("  "),
      };
    }

    if (branch === "order-events") {
      const starts = [0, 3, 6, 9];
      const base = randChoice(rng, starts);
      const trio = SENTENCES.slice(base, base + 3); // already in orientation/complication/resolution order
      const items = trio.map((s, i) => ({ id: `s${i}`, label: p(s.text) }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the sentences to tell the story in order"),
        instruction: "Click the sentences in the correct story order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "Scene first, then the problem, then how it is solved.",
        explanation: `Correct order:\n1. ${p(trio[0].text)}\n2. ${p(trio[1].text)}\n3. ${p(trio[2].text)}`,
      };
    }

    // reason — Evaluate: which rewrite makes a flat sentence more interesting, and which device is it?
    const d = randChoice(rng, DEVICES);
    const { choices, correctIndex } = mcFromCluster(rng, d.better, shuffle(rng, DEVICES.filter((x) => x.device !== d.device)).slice(0, 3).map((x) => x.better), 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `A pupil wrote a flat sentence: "${d.flat}"`, `Which rewrite uses the device "${d.device}" to make it more interesting?`),
      choices,
      correctIndex,
      layout: "list",
      hint: `"${d.device}" means ${d.device === "Dialogue" ? "showing the exact words characters speak" : d.device === "Sensory description" ? "using the five senses" : d.device === "Suspense" ? "making the reader worry about what happens next" : d.device === "A twist" ? "a surprising turn the reader did not expect" : "showing a feeling through actions instead of naming it"}.`,
      explanation: `"${d.better}" uses ${d.device.toLowerCase()} — a much stronger version than simply stating "${d.flat}"`,
    };
  },
};
