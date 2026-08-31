import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 3.2 Levers as simple machines — the parts/classification half
// (fulcrum/effort/load, and sorting all 12 named example tools into the 3 lever classes), split from
// leversInEverydayLife.ts for depth.
//
// Hotspot xPercent/yPercent values below are read directly off LeverDiagram's geometry in
// web/src/components/visuals/Visual.tsx (viewBox 0 0 220 130, barY=80) — keep the two in sync if that
// component's layout ever changes.
const LEVER_CLASS_SPOTS: Record<1 | 2 | 3, { fulcrum: number; effort: number; load: number }> = {
  1: { fulcrum: 50, effort: 86.4, load: 13.6 },
  2: { fulcrum: 11.4, load: 50, effort: 88.6 },
  3: { fulcrum: 11.4, effort: 50, load: 88.6 },
};

const LEVER_TOOLS = [
  { id: "see-saw", label: "See-saw", leverClass: 1, why: "The fulcrum (the central support) sits between the effort (a child pushing down) and the load (the other child)" },
  { id: "scissors", label: "Scissors", leverClass: 1, why: "The pivot screw (fulcrum) sits between where your fingers push (effort) and where the blades cut (load)" },
  { id: "pliers", label: "Pliers", leverClass: 1, why: "The pivot (fulcrum) sits between the handles (effort) and the gripping jaws (load)" },
  { id: "wheelbarrow", label: "Wheelbarrow", leverClass: 2, why: "The load (the heavy contents) sits between the wheel (fulcrum) and the handles you lift (effort)" },
  { id: "nutcracker", label: "Nutcracker", leverClass: 2, why: "The load (the nut) sits between the hinge (fulcrum) and where your hand squeezes (effort)" },
  { id: "bottle-opener", label: "Bottle opener", leverClass: 2, why: "The load (the bottle cap) sits between the rim it presses against (fulcrum) and where your hand lifts (effort)" },
  { id: "hole-punch", label: "Hole punch", leverClass: 2, why: "The load (the paper being punched) sits between the hinge (fulcrum) and where your hand presses down (effort)" },
  { id: "nail-clippers", label: "Nail clippers", leverClass: 2, why: "The load (the nail) sits between the pivot (fulcrum) and where your finger presses (effort)" },
  { id: "shovel", label: "Shovel", leverClass: 3, why: "The effort (your upper hand) sits between the fulcrum (your lower hand near the ground) and the load (the soil at the blade)" },
  { id: "fishing-rod", label: "Fishing rod", leverClass: 3, why: "The effort (the hand mid-way up the rod) sits between the fulcrum (the hand holding the base) and the load (the fish at the tip)" },
  { id: "kitchen-tongs", label: "Kitchen tongs", leverClass: 3, why: "The effort (your fingers squeezing) sits between the fulcrum (the joined end) and the load (the food being gripped)" },
  { id: "tweezers", label: "Tweezers", leverClass: 3, why: "The effort (your fingers squeezing) sits between the fulcrum (the joined end) and the load (whatever is being picked up)" },
] as const;

const PART_DEFINITIONS = [
  { id: "fulcrum", label: "Fulcrum (pivot)", def: "The fixed point on which the whole lever turns or balances" },
  { id: "effort", label: "Effort", def: "The force applied by a person to move the lever" },
  { id: "load", label: "Load", def: "The weight or resistance the lever is being used to move" },
] as const;

const KENYAN_PLACES = ["Nyeri", "Kisumu", "Nakuru", "Kericho", "Machakos", "Eldoret", "Kitale", "Mombasa", "Meru", "Nairobi", "Kakamega", "Nanyuki"] as const;
const KENYAN_NAMES = ["Josphine", "Erick", "Nyaboke", "Felix", "Anastacia", "Kiplangat", "Zena", "Brian", "Naomi", "Ondiek", "Ciru", "Salome"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} pushes down on one end of a see-saw in a ${place(rng)} playground while a friend sits on the other end, with the support in the middle. What class of lever is this see-saw?`,
      correct: "A first-class lever, because the fulcrum sits between the effort and the load",
      wrong: ["A second-class lever, because the load sits in the middle", "A third-class lever, because the effort sits in the middle", "Not a lever at all, because it has no fulcrum"],
      explanation: "In a see-saw, the central support (fulcrum) sits between the person pushing (effort) and the person on the other end (load) — the defining feature of a first-class lever.",
    };
  },
  (rng) => ({
    prompt: `A vendor near ${place(rng)} loads heavy vegetables into a wheelbarrow and lifts the handles to move it. Where does the load sit relative to the fulcrum (wheel) and effort (handles)?`,
    correct: "The load sits between the fulcrum and the effort — this makes it a second-class lever",
    wrong: ["The load sits beyond both the fulcrum and effort — this makes it a third-class lever", "The fulcrum sits between the load and effort — this makes it a first-class lever", "There is no load in a wheelbarrow, only effort"],
    explanation: "In a wheelbarrow, the wheel is the fulcrum, the vegetables are the load in the middle, and the handles are where effort is applied — the arrangement of a second-class lever.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} uses kitchen tongs in ${place(rng)} to pick up a piece of meat from a hot pan. The fulcrum is the joined end, the load is the meat at the tip, and the effort is applied by the fingers in between. What class of lever is this?`,
      correct: "A third-class lever, because the effort sits between the fulcrum and the load",
      wrong: ["A first-class lever, because the fulcrum sits in the middle", "A second-class lever, because the load sits in the middle", "Not a lever, because tongs only grip rather than lift"],
      explanation: "Kitchen tongs are a classic third-class lever: the effort (fingers squeezing) is applied between the fulcrum (joined end) and the load (the food at the tip).",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} uses a pair of scissors in ${place(rng)} to cut paper. Where is the fulcrum located, and what class of lever does this make the scissors?`,
    correct: "The fulcrum is the central pivot screw, located between the effort (handles) and the load (the paper at the blades) — a first-class lever",
    wrong: ["The fulcrum is at the blade tips, making it a third-class lever", "The fulcrum is at the handle ends, making it a second-class lever", "Scissors have no fulcrum at all"],
    explanation: "Scissors pivot around a central screw between the handles (effort) and the cutting blades (load), which makes them a first-class lever, just like pliers.",
  }),
  (rng) => ({
    prompt: `A fisherman near ${place(rng)} holds the base of a fishing rod with one hand (fulcrum) and applies force further up the rod with the other hand (effort), while the fish pulls at the tip (load). What class of lever is a fishing rod?`,
    correct: "A third-class lever",
    wrong: ["A first-class lever", "A second-class lever", "Not a lever, since it involves a fish"],
    explanation: "A fishing rod is a third-class lever, because the effort (the hand mid-way up the rod) sits between the fulcrum (the base) and the load (the fish at the tip).",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} squeezes a nutcracker in ${place(rng)} to crack open a hard nut placed between the hinge and the handle ends. Which part of the nutcracker is the load?`,
      correct: "The nut",
      wrong: ["The hinge", "The handles", "The hand squeezing the handles"],
      explanation: "The load is whatever the lever is being used to move or act on — in a nutcracker, that is the nut itself, positioned between the fulcrum (hinge) and the effort (hand).",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} identifies the fulcrum, effort and load on a bottle opener in ${place(rng)}. Which part is the fulcrum?`,
    correct: "The edge of the opener that presses against the bottle rim",
    wrong: ["The bottle cap itself", "The hand lifting the handle", "The bottle's contents"],
    explanation: "The fulcrum of a bottle opener is the point that stays fixed against the bottle rim while the handle end is lifted (effort) to pry the cap (load) off.",
  }),
];

export const leverPartsAndClasses: Skill = {
  id: "g6-sci-fe-lever-parts-classes",
  code: "FE.2a",
  subjectId: "science",
  strandId: "g6-sci-fe",
  grade: 6,
  title: "Lever parts and classes",
  description: "The parts of a lever (fulcrum, effort, load) and classifying levers into first, second and third class, using the 12 named everyday lever examples.",
  generate(rng) {
    const branch = randChoice(rng, ["class-diagram-identify", "part-hotspot", "part-definition-match", "tool-class-categorize", "reasoning", "fill-blank"] as const);

    if (branch === "class-diagram-identify") {
      const leverClass = randChoice(rng, [1, 2, 3] as const);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `Class ${leverClass} lever`, [1, 2, 3].filter((c) => c !== leverClass).map((c) => `Class ${c} lever`), 2);
      const exampleTool = randChoice(rng, LEVER_TOOLS.filter((t) => t.leverClass === leverClass));
      const CLASS_DIAGRAM_PROMPTS = [
        "Look at the position of the fulcrum (F), effort (E) and load (L) on this lever diagram. Which class of lever is shown?",
        "This diagram shows the fulcrum (F), effort (E) and load (L) of a lever. Which class is it?",
        "Study where F, E and L sit on this lever diagram, then name its class.",
        "Based on the arrangement of fulcrum, effort and load shown here, which lever class is this?",
        "Which class of lever does this diagram of the fulcrum, effort and load represent?",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, CLASS_DIAGRAM_PROMPTS),
        visual: { type: "lever-diagram", leverClass },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a class ${leverClass} lever. For example, ${exampleTool.label.toLowerCase()} is a class ${leverClass} lever: ${exampleTool.why}.`,
      };
    }

    if (branch === "part-hotspot") {
      const leverClass = randChoice(rng, [1, 2, 3] as const);
      const spots = LEVER_CLASS_SPOTS[leverClass];
      const ask = randChoice(rng, PART_DEFINITIONS);
      const spotMap = { fulcrum: spots.fulcrum, effort: spots.effort, load: spots.load };
      const wrongLabels = shuffle(rng, PART_DEFINITIONS.filter((p) => p.id !== ask.id).map((p) => p.label));
      const choices = shuffle(rng, [ask.label, ...wrongLabels]);
      return {
        kind: "hotspot",
        prompt: `On this class ${leverClass} lever, click where the ${ask.label.split(" ")[0].toLowerCase()} is, then confirm below.`,
        diagram: { type: "lever-diagram", leverClass },
        spots: (["fulcrum", "effort", "load"] as const).map((id) => ({
          id,
          xPercent: spotMap[id],
          yPercent: id === "fulcrum" ? 95 : 15,
          label: PART_DEFINITIONS.find((p) => p.id === id)!.label,
        })),
        askId: ask.id,
        choices,
        correctLabel: ask.label,
        hint: "F marks the fulcrum, E marks the effort, and L marks the load on the diagram.",
        explanation: `${ask.label}: ${ask.def}.`,
      };
    }

    if (branch === "part-definition-match") {
      const tokens = shuffle(rng, PART_DEFINITIONS.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PART_DEFINITIONS.map((p) => ({ id: p.id, label: p.def })));
      const correctMap: Record<string, string> = {};
      for (const p of PART_DEFINITIONS) correctMap[p.id] = p.id;
      const PART_MATCH_PROMPTS = [
        "Match each part of a lever to its definition.",
        "Which definition belongs to each lever part below? Match them up.",
        "Pair each lever part with what it actually does.",
        "Match each lever term to its correct definition.",
        "Connect each part of a lever with its meaning.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, PART_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what stays fixed, what force is applied, and what is being moved.",
        explanation: PART_DEFINITIONS.map((p) => `${p.label} — ${p.def}.`).join(" "),
      };
    }

    if (branch === "tool-class-categorize") {
      const chosen = shuffle(rng, LEVER_TOOLS).slice(0, 9);
      const items = chosen.map((t) => ({ id: t.id, label: t.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t) => (correctBucket[t.id] = `class${t.leverClass}`));
      const TOOL_CLASS_PROMPTS = [
        "Sort each everyday tool by its lever class.",
        "Which lever class does each everyday tool belong to? Sort them below.",
        "Decide which class each tool below belongs to, then sort it.",
        "Group these everyday tools by their lever class.",
        "For each tool, work out its lever class and sort it into the right group.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, TOOL_CLASS_PROMPTS),
        items,
        buckets: [
          { id: "class1", label: "Class 1 (fulcrum in the middle)" },
          { id: "class2", label: "Class 2 (load in the middle)" },
          { id: "class3", label: "Class 3 (effort in the middle)" },
        ],
        correctBucket,
        hint: "Picture where the fulcrum, effort and load sit for each tool.",
        explanation: chosen.map((t) => `${t.label} is a class ${t.leverClass} lever — ${t.why}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "The fixed point on which a lever turns or balances is called the ", after: ".", correctAnswer: "fulcrum" },
      { before: "The force applied by a person to move a lever is called the ", after: ".", correctAnswer: "effort" },
      { before: "The weight or resistance a lever is used to move is called the ", after: ".", correctAnswer: "load" },
      { before: "In a class 1 lever, the fulcrum sits between the effort and the ", after: ".", correctAnswer: "load" },
      { before: "In a class 2 lever, the load sits between the fulcrum and the ", after: ".", correctAnswer: "effort" },
      { before: "In a class 3 lever, the effort sits between the fulcrum and the ", after: ".", correctAnswer: "load" },
      { before: "A see-saw is an example of a class ", after: " lever.", correctAnswer: "1" },
      { before: "A wheelbarrow is an example of a class ", after: " lever.", correctAnswer: "2" },
      { before: "A pair of tweezers is an example of a class ", after: " lever.", correctAnswer: "3" },
      { before: "Scissors and pliers are both examples of class ", after: " levers.", correctAnswer: "1" },
      { before: "A nutcracker is an example of a class ", after: " lever.", correctAnswer: "2" },
      { before: "A fishing rod is an example of a class ", after: " lever.", correctAnswer: "3" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about the fulcrum, effort and load, and where each sits in the three lever classes.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
