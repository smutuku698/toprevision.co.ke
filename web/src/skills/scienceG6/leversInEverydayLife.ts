import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 3.2 Levers as simple machines — the everyday-application half
// (demonstrating how each of the 12 named levers makes a specific job easier, and the design's own "make and
// use a beam balance" project), split from leverPartsAndClasses.ts for depth.

const JOB_TOOL_PAIRS: { job: string; tool: string; leverClass: 1 | 2 | 3 }[] = [
  { job: "Opening a bottle cap without hurting your fingers", tool: "Bottle opener", leverClass: 2 },
  { job: "Cutting a sheet of paper neatly", tool: "Scissors", leverClass: 1 },
  { job: "Cracking open a hard-shelled nut", tool: "Nutcracker", leverClass: 2 },
  { job: "Moving a heavy load of soil across a garden in one trip", tool: "Wheelbarrow", leverClass: 2 },
  { job: "Punching neat holes in paper for a file", tool: "Hole punch", leverClass: 2 },
  { job: "Trimming fingernails neatly and safely", tool: "Nail clippers", leverClass: 2 },
  { job: "Picking up a hot piece of food from a sizzling pan", tool: "Kitchen tongs", leverClass: 3 },
  { job: "Picking up a tiny splinter or a small bead", tool: "Tweezers", leverClass: 3 },
  { job: "Digging and lifting soil to plant seeds", tool: "Shovel", leverClass: 3 },
  { job: "Casting a line far out to catch fish", tool: "Fishing rod", leverClass: 3 },
  { job: "Gripping and bending a piece of wire firmly", tool: "Pliers", leverClass: 1 },
  { job: "Letting two children balance and play together outdoors", tool: "See-saw", leverClass: 1 },
];

const BEAM_BALANCE_STEPS = [
  { id: "b1", label: "Gather materials: a straight stick or ruler, string, and two small containers" },
  { id: "b2", label: "Find and mark the exact middle point of the stick" },
  { id: "b3", label: "Balance or tie the stick at its middle point on a fixed support so it can tip freely" },
  { id: "b4", label: "Hang one small container at each end of the stick" },
  { id: "b5", label: "Check that the empty beam balances evenly before use" },
  { id: "b6", label: "Place objects in each container and compare which side tips down" },
] as const;

const ADVANTAGE_FACTS = [
  { text: "A lever can let a person lift a load that would be too heavy to lift with bare hands alone", isTrue: true },
  { text: "A lever always makes an object lighter in actual weight, not just easier to move", isTrue: false },
  { text: "A lever can change the direction of a force, such as pushing down to lift something up", isTrue: true },
  { text: "Using a longer lever arm generally makes it easier to move a given load", isTrue: true },
  { text: "Levers only work on very small, lightweight objects", isTrue: false },
  { text: "A wheelbarrow lets one person move a load that might otherwise need two people to carry", isTrue: true },
  { text: "Scissors and pliers are both class 1 levers, with the fulcrum located between the effort and the load", isTrue: true },
  { text: "A wheelbarrow is a class 1 lever because its wheel sits exactly between the handles and the load", isTrue: false },
  { text: "Tweezers and kitchen tongs are both class 3 levers, with the effort applied between the fulcrum and the load", isTrue: true },
  { text: "A nutcracker is a class 2 lever, with the nut (the load) positioned between the hinge (fulcrum) and the hands (effort)", isTrue: true },
  { text: "A see-saw is a class 2 lever because the load always sits closer to the ground than the effort", isTrue: false },
  { text: "Class 3 levers such as a shovel or fishing rod are designed to increase the distance or speed of movement, not to reduce the effort needed", isTrue: true },
] as const;

const KENYAN_PLACES = ["Kericho", "Nyeri", "Kisumu", "Nakuru", "Machakos", "Eldoret", "Kitale", "Mombasa", "Meru", "Nairobi", "Bungoma", "Nanyuki"] as const;
const KENYAN_NAMES = ["Loice", "Mutinda", "Zawadi", "Kiplimo", "Faith", "Otieno", "Naserian", "Brian", "Consolata", "Hosea", "Rael", "Vitalis"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} needs to move a large pile of harvested maize cobs across a farm in ${place(rng)} in one trip, without making several tiring journeys by hand. Which lever tool would make this job easiest?`,
      correct: "A wheelbarrow",
      wrong: ["A pair of tweezers", "A nutcracker", "Scissors"],
      explanation: "A wheelbarrow is a class 2 lever designed exactly for moving a heavy load a distance in one trip, using far less effort than carrying it by hand.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} wants to remove a small splinter from a finger in ${place(rng)} without squeezing the skin with bare fingers. Which lever tool is best suited for this precise, delicate job?`,
    correct: "Tweezers",
    wrong: ["A shovel", "A wheelbarrow", "A nutcracker"],
    explanation: "Tweezers are a class 3 lever built for precise, delicate gripping — ideal for picking up something as small as a splinter.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is repairing a small toy radio in ${place(rng)} and needs to hold a tiny loose screw steady while tightening it, without dropping it or fumbling with bare fingers. Which lever tool suits this job best?`,
      correct: "Tweezers",
      wrong: ["A nutcracker", "A shovel", "Pliers"],
      explanation: "Tweezers are a class 3 lever built for light, precise gripping — just as useful for holding a tiny screw steady during a repair as for picking up a splinter or bead.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is threading a single tiny bead onto a bracelet string in ${place(rng)} and keeps dropping it or picking up two beads at once with bare fingers. Which lever tool would make this craft job easier?`,
      correct: "Tweezers",
      wrong: ["A hole punch", "A wheelbarrow", "A bottle opener"],
      explanation: "Tweezers give fine, controlled grip on something as small and slippery as a single bead — far more precise than bare fingers.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} builds a simple beam balance for a class project in ${place(rng)}, tying a stick at its exact middle point onto a fixed support. Why must the stick be tied at its exact middle, not off to one side?`,
      correct: "Tying it at the exact middle means the empty beam balances evenly, so any tipping afterwards is caused only by what is placed in the containers",
      wrong: ["The exact middle point makes the stick heavier overall", "It does not matter where the stick is tied, as long as it is somewhere near the middle", "Tying it off-centre would make the balance more accurate"],
      explanation: "A beam balance only gives a fair comparison if the empty stick balances evenly first — which requires the pivot point to be at the stick's exact middle.",
    };
  },
  (rng) => ({
    prompt: `A gardener in ${place(rng)} uses a shovel to dig and lift soil rather than scooping it out with bare hands. What advantage does the lever action of the shovel give?`,
    correct: "It lets the gardener lift more soil with less strain by using the handle as a lever arm",
    wrong: ["It makes the soil weigh less", "It has no real advantage over using bare hands", "It only works on very dry soil"],
    explanation: "A shovel is a class 3 lever that multiplies the effect of the effort applied at the handle, making it easier to lift and move soil than scooping by hand.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} tries to crack open a very hard nut with bare hands in ${place(rng)} and fails, but succeeds easily using a nutcracker. What does this show about how a lever helps?`,
      correct: "A lever can let a person apply enough force to do a job that bare hands alone cannot manage",
      wrong: ["The nutcracker made the nut physically softer", "There is no real difference between using bare hands and a lever", "The nutcracker works by heating the nut"],
      explanation: "A nutcracker's lever action multiplies the force from the hand, letting a person crack a nut that would be impossible to crack with bare hands alone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} uses pliers in ${place(rng)} to bend a stiff piece of wire that is too tough to bend with bare fingers. What class of lever are pliers, and how does this help?`,
    correct: "Pliers are a class 1 lever, and the pivot lets the handles apply much more gripping and bending force than fingers alone",
    wrong: ["Pliers are a class 3 lever that reduces the force needed to almost nothing", "Pliers are not a lever at all, just a gripping tool", "Pliers work by heating the wire to make it softer"],
    explanation: "Pliers are a class 1 lever — the pivot between the handles (effort) and jaws (load) lets a person apply far more force to the wire than bare fingers could manage.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why a longer-handled shovel is often easier to dig with than a short-handled one. What is the best explanation?`,
    correct: "A longer effort arm on a lever generally makes the same job require less effort from the person using it",
    wrong: ["A longer handle always makes the shovel heavier and harder to use", "Handle length has no effect on how easy digging feels", "A longer handle changes the soil's actual weight"],
    explanation: "Increasing the length of the effort arm on a lever generally reduces how much effort is needed to move the same load — which is why longer-handled tools often feel easier to use.",
  }),
];

export const leversInEverydayLife: Skill = {
  id: "g6-sci-fe-levers-everyday",
  code: "FE.2b",
  subjectId: "science",
  strandId: "g6-sci-fe",
  grade: 6,
  title: "Levers making work easier",
  description: "How each of the 12 named lever tools makes a specific everyday job easier, why levers help (force, direction, distance), and building a simple beam balance.",
  generate(rng) {
    const branch = randChoice(rng, ["job-tool-match", "class-to-job", "advantage-categorize", "balance-order", "reasoning", "fill-blank"] as const);

    if (branch === "job-tool-match") {
      const chosen = shuffle(rng, JOB_TOOL_PAIRS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `j${i}`, label: p.job })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `j${i}`, label: p.tool })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`j${i}`] = `j${i}`));
      const MATCH_PROMPTS = [
        "Match each everyday job to the lever tool that makes it easiest.",
        "Which lever tool would you reach for to do each of these jobs?",
        "Pair each job below with the lever tool best suited to it.",
        "Match each task to the lever tool that makes it easier to do.",
        "For each job below, choose the matching lever tool.",
        "Connect each everyday task with the right lever tool for the job.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which tool is specifically designed for that job.",
        explanation: chosen.map((p) => `${p.job} → ${p.tool}.`).join(" "),
      };
    }

    if (branch === "class-to-job") {
      const leverClass = randChoice(rng, [1, 2, 3] as const);
      const matching = JOB_TOOL_PAIRS.filter((p) => p.leverClass === leverClass);
      const target = randChoice(rng, matching);
      const others = JOB_TOOL_PAIRS.filter((p) => p.leverClass !== leverClass);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.tool, shuffle(rng, others).slice(0, 3).map((p) => p.tool), 3);
      return {
        kind: "multiple-choice",
        prompt: `Looking at this class ${leverClass} lever, which everyday tool for "${target.job.toLowerCase()}" belongs to this same class?`,
        visual: { type: "lever-diagram", leverClass },
        choices,
        correctIndex,
        layout: "list",
        explanation: `${target.tool} is a class ${leverClass} lever, matching the diagram's arrangement of fulcrum, effort and load.`,
      };
    }

    if (branch === "advantage-categorize") {
      const chosen = shuffle(rng, ADVANTAGE_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `a${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`a${i}`] = f.isTrue ? "true" : "false"));
      const CATEGORIZE_PROMPTS = [
        "Sort each statement about how levers help with work as true or false.",
        "Decide whether each statement about levers below is true or false.",
        "Read each claim about how levers make work easier, then sort it as true or false.",
        "Which of these statements about levers are true, and which are false?",
        "Sort these ideas about how levers help people do work into True and False.",
        "Some of these statements about levers are correct and some are not — sort each one as true or false.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "A lever changes how much effort is needed and can change the direction of a force — it doesn't change an object's actual weight.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "balance-order") {
      const shuffled = shuffle(rng, BEAM_BALANCE_STEPS);
      const ORDER_PROMPTS = [
        "Put the steps of making and using a simple beam balance in the correct order.",
        "Arrange these steps for building and using a simple beam balance in the right order.",
        "Place these beam balance steps in the order you would actually carry them out.",
        "Order the steps for making a simple beam balance from first to last.",
        "Sort these beam balance steps into the correct sequence, from start to finish.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: BEAM_BALANCE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Gather materials, find the middle, fix the pivot, then hang containers and test.",
        explanation: "Correct order: " + BEAM_BALANCE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A wheelbarrow makes it easier to move a heavy load of soil in a single ", after: ".", correctAnswer: "trip", alsoAccept: ["journey"] },
      { before: "A nutcracker uses lever action to apply enough force to crack open a hard ", after: ".", correctAnswer: "nut" },
      { before: "Tweezers are used for precise, delicate jobs such as picking up a tiny splinter or a small ", after: ".", correctAnswer: "bead", alsoAccept: ["splinter"] },
      { before: "Besides picking up small objects, tweezers are also useful for holding a tiny loose ", after: " steady while repairing something like a toy radio.", correctAnswer: "screw", alsoAccept: ["nut", "bolt"] },
      { before: "A gardener transplanting delicate seedlings might use tweezers to place a single tiny ", after: " precisely into a seed tray without damaging it.", correctAnswer: "seed", alsoAccept: ["seedling"] },
      { before: "A longer effort arm on a lever generally makes a job require ", after: " effort.", correctAnswer: "less" },
      { before: "A beam balance must be balanced at the stick's exact ", after: " point to work fairly.", correctAnswer: "middle", alsoAccept: ["centre", "center"] },
      { before: "A shovel's handle acts as a lever arm to help lift ", after: ".", correctAnswer: "soil", alsoAccept: ["earth"] },
      { before: "Pliers use their pivot to apply much more force to bend ", after: " than bare fingers could.", correctAnswer: "wire" },
      { before: "A lever can change the direction of a force, such as pushing down to lift something ", after: ".", correctAnswer: "up" },
      { before: "Using a lever tool does not change an object's actual weight, only how easy it is to ", after: ".", correctAnswer: "move" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about how each lever tool makes its specific job easier.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
