import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 3.1 Floating and Sinking — classifying named test objects,
// the 3 named factors that affect floating/sinking (shape, weight, size), and 7 named applications in
// day-to-day life. See curriculum-reference/grade-5/science-and-technology.json.

const TEST_OBJECTS = [
  { id: "wood" as const, label: "Dry wood", floats: true },
  { id: "stone" as const, label: "Stone", floats: false },
  { id: "metal" as const, label: "A piece of metal", floats: false },
  { id: "plastic" as const, label: "Plastic", floats: true },
  { id: "cork" as const, label: "Cork", floats: true },
  { id: "buoy" as const, label: "A buoy", floats: true },
  { id: "feather" as const, label: "A feather", floats: true },
];

// The design's own factor-demonstration pairs (shape, weight, size) — used for Analyze-tier "what changed,
// and what happened as a result" reasoning, distinct from the plain material-identity pool above.
const FACTOR_DEMOS = [
  { item: "A normal, uncrushed bottle top placed gently on water", floats: true, factor: "shape" },
  { item: "The same bottle top, but crushed flat into a tight ball", floats: false, factor: "shape" },
  { item: "A lump of plasticine rolled into a tight, dense ball", floats: false, factor: "shape" },
  { item: "The same amount of plasticine, flattened out into a wide, boat-like shape", floats: true, factor: "shape" },
  { item: "A small closed container filled with sand", floats: false, factor: "weight" },
  { item: "An identical container, of the same size, filled with feathers or cotton wool instead", floats: true, factor: "weight" },
] as const;

const APPLICATIONS = [
  { id: "swimming", label: "Swimming", desc: "A person's body can float and move through water using their own effort" },
  { id: "diving", label: "Diving", desc: "A diver controls floating and sinking to move down into or back up from deep water" },
  { id: "lifesavers", label: "Use of lifesavers", desc: "A floating device such as a life jacket or ring buoy keeps a person afloat in an emergency" },
  { id: "transport", label: "Water transport", desc: "Boats and ships are built to float so they can carry people and goods across water" },
  { id: "floods", label: "Floods", desc: "Floating objects can be carried along by rising floodwaters, which is also a safety danger" },
  { id: "drowning", label: "Drowning", desc: "A person who cannot stay afloat and sinks under water is in serious danger" },
  { id: "surfing", label: "Surfing", desc: "A surfboard is shaped and sized to float and support a person's weight on top of waves" },
] as const;

const FLOAT_PROMPT_FRAMES: ((obj: string) => string)[] = [
  (o) => `${o} is placed gently on still water. What happens?`,
  (o) => `What happens when ${o.toLowerCase()} is placed on the surface of some water?`,
  (o) => `${o} is lowered slowly into a bucket of water. Does it float or sink?`,
  (o) => `If you place ${o.toLowerCase()} on water, what would you observe?`,
  (o) => `${o} is dropped into a basin of water. What is the result?`,
  (o) => `Predict what happens when ${o.toLowerCase()} is put into water.`,
  (o) => `${o} rests on top of a pond's surface — or does it? What actually happens?`,
  (o) => `A learner places ${o.toLowerCase()} into water during a class activity. What does the learner observe?`,
  (o) => `What is the outcome when ${o.toLowerCase()} is placed in water?`,
  (o) => `${o} is set down carefully onto water. Which happens — floating or sinking?`,
  (o) => `Think about ${o.toLowerCase()} in water. What would you expect to see?`,
  (o) => `${o} is tested in a container of water. What is the result?`,
];

const FACTOR_CLOSERS = [
  "What happens?",
  "What is the result?",
  "What would you observe?",
  "Does it float or sink?",
  "What is the outcome?",
  "What do you expect to happen?",
  "What would this test show?",
  "Which happens next — floating or sinking?",
  "What is the likely result?",
  "What does this demonstrate?",
  "What would you see happen?",
  "How does it behave in the water?",
] as const;

const FLOATER_MAKING_STEPS = [
  { id: "l1", label: "Collect lightweight, buoyant materials such as empty sealed plastic bottles" },
  { id: "l2", label: "Bundle or tie the buoyant materials firmly together" },
  { id: "l3", label: "Attach a strap or rope so the floater can be held or worn" },
  { id: "l4", label: "Test the floater in water to check it stays afloat with some weight on it" },
  { id: "l5", label: "Adjust the materials if the floater sinks or tips over, then test again" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} gently places a normal, uncrushed bottle top on water and it floats, then crushes an identical bottle top flat and drops it in, and it sinks. What changed to cause this?`,
      correct: "Crushing the bottle top changed its shape, so it could no longer trap air and displace enough water to float",
      wrong: ["The crushed bottle top became heavier in actual weight", "Nothing changed — the two bottle tops always behave the same way", "The water itself changed between the two tests"],
      explanation: "Shape is one of the three named factors affecting floating and sinking — changing an object's shape, without changing its material, can make it sink instead of float.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} rolls plasticine into a tight, dense ball in ${place(rng)} and it sinks, but the same amount of plasticine flattened into a wide, boat-like shape floats. What does this demonstrate?`,
    correct: "Shape affects whether an object floats or sinks, even when the amount of material stays exactly the same",
    wrong: ["The flattened plasticine weighs less than the ball of plasticine", "Plasticine always floats regardless of its shape", "This shows that weight is the only factor that matters"],
    explanation: "Both plasticine pieces have identical weight and material, but the wider, flatter shape floats while the compact ball sinks — a clear demonstration that shape is a genuine factor.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} fills two identical containers in ${place(rng)}: one with sand, the other with feathers. The sand-filled container sinks, but the feather-filled one floats. What factor does this demonstrate?`,
      correct: "Weight — the sand-filled container is much heavier than the feather-filled one, even though both containers are the same size",
      wrong: ["Shape, since the two containers are shaped completely differently", "Size, since the two containers are different sizes", "Temperature, since sand and feathers have different temperatures"],
      explanation: "The two containers are the same size and shape but hold very different weights — this isolates weight as the factor that determines floating or sinking here.",
    };
  },
  (rng) => ({
    prompt: `A boat builder in ${place(rng)} shapes a solid block of wood into a wide, hollow hull instead of leaving it as a solid block. Why does this change help the wood-based boat carry more weight while still floating?`,
    correct: "Changing the wood's shape into a wide, hollow hull lets it displace more water, helping it float with a heavier load",
    wrong: ["Hollowing out the wood makes the wood itself lighter in actual weight, which is the only reason it works", "Shape has no effect on how much weight a floating object can carry", "The hollow shape has nothing to do with how boats stay afloat"],
    explanation: "A wide, hollow shape allows an object to displace more water and support more weight while still floating — this is why boat hulls are shaped this way rather than left as solid blocks.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is caught in rising floodwaters in ${place(rng)} and grabs onto a large empty plastic drum floating nearby. Which application of floating and sinking is this?`,
      correct: "Use of a floating object as a lifesaver during a flood emergency",
      wrong: ["Surfing", "Water transport for carrying goods", "Diving to explore underwater"],
      explanation: "Using a floating object to stay above water during an emergency, such as a flood, is the lifesaver/lifesaving application of floating and sinking.",
    };
  },
  (rng) => ({
    prompt: `A ferry company in ${place(rng)} builds large steel ships that carry hundreds of passengers and tonnes of cargo across water, even though a solid block of steel would sink. What allows the ship to float?`,
    correct: "The ship's hollow, wide shape displaces enough water to float, despite being made of a material (steel) that sinks in solid block form",
    wrong: ["Steel always floats regardless of its shape", "Ships float only because they are painted a certain colour", "The ship's size has no effect on whether it floats"],
    explanation: "Even a material that sinks as a solid block, like steel, can float when shaped into a wide, hollow hull that displaces enough water — the same shape factor.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} wears a life jacket while learning to swim in a pool in ${place(rng)}. What is the life jacket's main purpose in terms of floating and sinking?`,
      correct: `It helps keep ${who} afloat in the water, reducing the risk of sinking or drowning`,
      wrong: ["It makes the swimmer swim faster through the water", "It has no connection to floating or sinking at all", "It is worn only for decoration, not safety"],
      explanation: "A life jacket is a lifesaver — a floating device designed to help a person stay afloat and avoid drowning.",
    };
  },
  (rng) => ({
    prompt: `A surfer in ${place(rng)} chooses a wide, flat surfboard rather than a narrow, thick block of the same material. Why does this shape choice matter for floating?`,
    correct: "A wider, flatter shape displaces more water and better supports the surfer's weight while floating on the surface",
    wrong: ["Surfboard shape has no effect on floating", "A narrow, thick block would always float better", "The surfboard's colour is what determines whether it floats"],
    explanation: "Surfing relies on a board shaped to float and support a person's weight — another everyday application of how shape affects floating.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} cannot swim and falls into deep water in ${place(rng)} with nothing to hold onto, and begins to sink below the surface. What danger does this situation directly represent?`,
      correct: `Drowning, since ${who} is sinking and unable to stay above the water without help`,
      wrong: ["Surfing", "Water transport", "Diving for sport"],
      explanation: "A person unable to stay afloat and sinking underwater without assistance is in danger of drowning — one of the named applications/dangers of floating and sinking.",
    };
  },
  (rng) => ({
    prompt: `A trader in ${place(rng)} transports sacks of maize across a lake using a large wooden canoe rather than carrying them by swimming. Which application of floating and sinking does this show?`,
    correct: "Water transport, since a floating vessel is used to carry goods across water",
    wrong: ["Diving", "Drowning", "Surfing"],
    explanation: "Using a boat or canoe, which floats, to carry people or goods across water is the water transport application.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} practises holding a breath and swimming down toward the bottom of a swimming pool in ${place(rng)}, then pushing back up to the surface. Which application of floating and sinking does this represent?`,
      correct: "Diving, since it involves deliberately controlling sinking down and floating back up",
      wrong: ["Surfing", "Water transport", "Use of lifesavers"],
      explanation: "Diving involves a person controlling their own floating and sinking to move down into and back up from water.",
    };
  },
  (rng) => ({
    prompt: `A school in ${place(rng)} builds a simple lifesaving floater from empty, tightly sealed plastic bottles bundled and tied together for a class project. Why must the bottles be sealed and empty rather than open or partly filled with water?`,
    correct: "Sealed, empty bottles trap air inside them, which makes the whole bundle light enough to float and support weight",
    wrong: ["Sealed bottles are simply easier to tie together, with no effect on floating", "Open or water-filled bottles would float even better than sealed empty ones", "Whether the bottles are sealed has no effect on the floater's performance"],
    explanation: "Sealed, empty bottles trap air, keeping the whole bundle light relative to its size — exactly the same weight/size relationship that makes objects float.",
  }),
];

export const floatingAndSinking: Skill = {
  id: "g5-sci-fe-floating-and-sinking",
  code: "FE.1",
  subjectId: "science",
  strandId: "g5-sci-fe",
  grade: 5,
  title: "Floating and sinking",
  description: "Classifying objects as floating or sinking, the three factors that affect this (shape, weight, size), and the seven named applications of floating and sinking in day-to-day life.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["object-identify", "object-categorize", "application-match", "floater-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "object-identify") {
      const target = randChoice(rng, TEST_OBJECTS);
      const label = target.floats ? "It floats" : "It sinks";
      const other = target.floats ? "It sinks" : "It floats";
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, FLOAT_PROMPT_FRAMES)(target.label),
        visual: { type: "float-sink-object", object: target.id, floats: target.floats },
        choices,
        correctIndex: choices.indexOf(label),
        layout: "list",
        explanation: `${target.label} ${target.floats ? "floats" : "sinks"} in water.`,
      };
    }

    if (branch === "object-categorize") {
      const items = TEST_OBJECTS.map((o) => ({ id: o.id, label: o.label }));
      const correctBucket: Record<string, string> = {};
      for (const o of TEST_OBJECTS) correctBucket[o.id] = o.floats ? "floats" : "sinks";
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it floats or sinks in water"),
        items: shuffle(rng, items),
        buckets: [
          { id: "floats", label: "Floats" },
          { id: "sinks", label: "Sinks" },
        ],
        correctBucket,
        hint: "Think about each material's typical density compared to water.",
        explanation: TEST_OBJECTS.map((o) => `${o.label} ${o.floats ? "floats" : "sinks"}.`).join(" "),
      };
    }

    if (branch === "application-match") {
      const chosen = shuffle(rng, APPLICATIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.desc })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "everyday application of floating and sinking to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Think about how floating or sinking is actually being used or experienced in each situation.",
        explanation: chosen.map((a) => `${a.label} — ${a.desc}.`).join(" "),
      };
    }

    if (branch === "floater-order") {
      const shuffled = shuffle(rng, FLOATER_MAKING_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of making a simple lifesaving floater"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: FLOATER_MAKING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Collect materials first, then assemble, then test, then adjust.",
        explanation: "Correct order: " + FLOATER_MAKING_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const usePlainReasoning = randChoice(rng, [true, false]);
      if (usePlainReasoning) {
        const q = randChoice(rng, REASONING_TEMPLATES)(rng);
        const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
        return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
      }
      const demo = randChoice(rng, FACTOR_DEMOS);
      const label = demo.floats ? "It floats" : "It sinks";
      const other = demo.floats ? "It sinks" : "It floats";
      const choices = shuffle(rng, [label, other]);
      return {
        kind: "multiple-choice",
        prompt: `${demo.item}. ${randChoice(rng, FACTOR_CLOSERS)}`,
        choices,
        correctIndex: choices.indexOf(label),
        layout: "list",
        explanation: `${demo.item} ${demo.floats ? "floats" : "sinks"} — this demonstrates how ${demo.factor} affects floating and sinking.`,
      };
    }

    const FILL_BLANKS = [
      { before: "Dry wood, plastic, cork, a buoy and a feather all ", after: " in water.", correctAnswer: "float" },
      { before: "A stone and a piece of solid metal both ", after: " in water.", correctAnswer: "sink" },
      { before: "The three factors that affect whether an object floats or sinks are shape, weight and ", after: ".", correctAnswer: "size" },
      { before: "Crushing a bottle top flat changes its ", after: ", which can make it sink instead of float.", correctAnswer: "shape" },
      { before: "A container filled with sand sinks, while an identical container filled with feathers floats — this shows the effect of ", after: ".", correctAnswer: "weight" },
      { before: "A floating device used to keep a person afloat in an emergency is called a ", after: ".", correctAnswer: "lifesaver" },
      { before: "Boats and ships are shaped to float so they can be used for water ", after: ".", correctAnswer: "transport" },
      { before: "A person who sinks and cannot stay above water is at risk of ", after: ".", correctAnswer: "drowning" },
      { before: "A surfboard is shaped and sized to float and support a person while ", after: ".", correctAnswer: "surfing" },
      { before: "A diver controls floating and sinking to move down into and back up from deep ", after: ".", correctAnswer: "water" },
      { before: "Floating objects can be carried along dangerously by rising water during ", after: ".", correctAnswer: "floods" },
      { before: "A wide, hollow shape helps a heavy material like steel ", after: " instead of sinking.", correctAnswer: "float" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about the factors (shape, weight, size) and the everyday uses of floating and sinking.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
