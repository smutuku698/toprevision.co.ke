import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.4 "Indigenous
// Kenyan Craft — Pottery" (kept as one skill). Source process: responsibly source clay
// (anthills, riverbanks); knead and wedge; roll into slabs of equal uniform thickness; cut slabs
// (rectangular and circular) and join to form a vase; finish by burnishing and stamping; leave to
// dry under shade (not direct sun) — the key inquiry question is literally "why are clay items
// dried under the shade?".

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "slab-technique",
    label: "Slab technique",
    meaning: "Making a pottery item by rolling clay into flat slabs, then cutting and joining them",
    blank: { before: "Making a pottery item by rolling clay into flat pieces, then cutting and joining them, is called the ", after: " technique.", correctAnswer: "slab" },
  },
  {
    id: "kneading",
    label: "Kneading",
    meaning: "Working and pressing clay by hand to make it soft and workable",
    blank: { before: "Working and pressing clay by hand to make it soft and workable is called ", after: ".", correctAnswer: "kneading" },
  },
  {
    id: "wedging",
    label: "Wedging",
    meaning: "Pressing and folding clay to remove trapped air bubbles before shaping it",
    blank: { before: "Pressing and folding clay to remove trapped air bubbles before shaping it is called ", after: ".", correctAnswer: "wedging" },
  },
  {
    id: "burnishing",
    label: "Burnishing",
    meaning: "Rubbing a pottery item's surface smooth and shiny with a hard, smooth tool before it fully dries",
    blank: { before: "Rubbing a pottery item's surface smooth and shiny with a hard tool is called ", after: ".", correctAnswer: "burnishing" },
  },
  {
    id: "stamping",
    label: "Stamping",
    meaning: "Pressing a decorative pattern into a pottery item's surface",
    blank: { before: "Pressing a decorative pattern into a pottery item's surface is called ", after: ".", correctAnswer: "stamping" },
  },
];

const PROCESS_ACTIONS = [
  { label: "Responsibly gathering clay from an anthill or riverbank", stage: "sourcing" },
  { label: "Digging clay only from areas where it is safe and permitted to do so", stage: "sourcing" },
  { label: "Kneading the clay by hand until it becomes soft and workable", stage: "shaping" },
  { label: "Wedging the clay to remove trapped air bubbles", stage: "shaping" },
  { label: "Rolling the clay into slabs of equal, uniform thickness", stage: "shaping" },
  { label: "Cutting rectangular and circular slabs of clay", stage: "shaping" },
  { label: "Joining the cut slabs together to form a vase", stage: "shaping" },
  { label: "Rubbing the vase's surface smooth and shiny with a burnishing tool", stage: "finishing" },
  { label: "Pressing a decorative pattern into the vase using stamping", stage: "finishing" },
  { label: "Leaving the finished vase to dry slowly under shade", stage: "finishing" },
  { label: "Talking about own and others' modelled vase after display", stage: "finishing" },
  { label: "Checking clay for stones or debris before kneading", stage: "sourcing" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} finishes shaping a clay vase and places it in direct, strong sunlight to dry quickly, instead of under shade. What is the most likely result?`,
      correct: "The vase is likely to dry unevenly and crack, since fast, uneven drying stresses the clay",
      wrong: [
        "The vase will dry perfectly and become stronger than one dried under shade",
        "Sunlight has no effect on drying clay at all",
        "The vase will only change colour, with no risk to its shape or strength",
      ],
      explanation: "Direct sunlight dries clay too fast and unevenly, which creates internal stress that can crack the item — drying under shade allows moisture to leave slowly and evenly, which is exactly why the source's key inquiry question asks about this.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} skips wedging the clay and goes straight from kneading to rolling it into slabs. What problem is this most likely to cause later?`,
    correct: "Trapped air bubbles left in the clay can expand and crack the pottery as it dries or is used",
    wrong: [
      "Skipping wedging has no effect on the finished pottery at all",
      "Skipping wedging only affects the colour of the clay, not its strength",
      "Wedging is only needed for circular slabs, not rectangular ones",
    ],
    explanation: "Wedging removes trapped air bubbles from clay — skipping it can leave air pockets that expand and crack the pottery later, regardless of whether the slab is rectangular or circular.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} rolls one clay slab much thicker than another for the same vase. What problem could this uneven thickness cause?`,
      correct: "The thicker and thinner parts may dry and shrink at different rates, causing cracking or a weak join",
      wrong: [
        "Uneven thickness always makes a vase decorate more easily with stamping",
        "The vase will simply look identical to one made from equally thick slabs",
        "Uneven thickness only affects how the vase is burnished, not its structural strength",
      ],
      explanation: "Slabs of equal, uniform thickness are specified so that the clay dries and shrinks evenly — uneven thickness can cause cracking or weak joins where thick and thin areas meet.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sources clay for a class pottery project by digging carelessly wherever is convenient, without checking if it is a safe or permitted spot. What is missing from this approach?`,
    correct: "Responsibility — sourcing clay carefully and appropriately from suitable places such as anthills or riverbanks",
    wrong: [
      "Nothing is missing — any digging spot is equally suitable for sourcing clay",
      "Burnishing skill — but burnishing happens much later in the process, not during sourcing",
      "Stamping skill — but stamping also happens later, during finishing",
    ],
    explanation: "The source calls for responsibly sourcing clay from suitable places such as anthills or riverbanks — digging carelessly anywhere skips this responsible-sourcing step, which comes long before burnishing or stamping.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} rubs a hard, smooth tool over the vase's surface before it fully dries, making it shiny and smooth. Which finishing technique is this?`,
      correct: "Burnishing — rubbing the surface smooth and shiny with a hard tool",
      wrong: [
        "Stamping — stamping presses a pattern in, rather than smoothing the surface",
        "Wedging — wedging removes air bubbles from clay before shaping, not after",
        "Kneading — kneading softens clay before shaping, not as a finishing step",
      ],
      explanation: "Rubbing a pottery item's surface smooth and shiny with a hard tool is burnishing — stamping presses in a pattern instead, and wedging/kneading happen earlier, before shaping.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} cuts one rectangular slab and one circular slab, then joins them to begin forming a vase. What stage of the slab technique is this?`,
    correct: "Cutting and joining the slabs to form the vase's shape",
    wrong: [
      "Sourcing the clay — sourcing happens before any slab is cut",
      "Burnishing the finished item — burnishing happens after the vase is fully shaped",
      "Drying under shade — drying is the final stage, after the vase is complete",
    ],
    explanation: "Cutting rectangular and circular slabs and joining them into a vase shape is the shaping stage of the slab technique, which comes after sourcing clay but before burnishing, stamping, or drying.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} presses a small carved stick into the surface of a still-soft vase to leave a repeated pattern. Which technique is this?`,
      correct: "Stamping — pressing a decorative pattern into the surface",
      wrong: [
        "Burnishing — burnishing rubs the surface smooth and shiny, it does not press in a pattern",
        "Kneading — kneading happens with raw clay, long before a vase has taken shape",
        "Wedging — wedging removes air bubbles, it does not decorate a finished shape",
      ],
      explanation: "Pressing a pattern into a pottery item's surface is stamping — burnishing instead smooths the surface, and kneading/wedging both happen much earlier, with the raw clay.",
    };
  },
];

const STAGE_PROMPTS = ["Which pottery stage is shown here?", "Identify the stage of pottery-making shown.", "Look at the diagram — which stage is this?", "Name the stage shown in this pottery diagram.", "Which stage of the slab technique does this show?"] as const;
const TERM_MATCH_PROMPTS = ["Match each term to its meaning.", "Pair each pottery term with its definition.", "Match each word to what it means in pottery-making.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const PROCESS_CATEGORIZE_PROMPTS = ["Sort each action by the stage it belongs to.", "Which stage does each action belong to? Sort them.", "Sort these pottery actions by stage.", "Classify each action as sourcing, shaping, or finishing.", "Match each action to its stage by sorting."] as const;
const STEPS_PROMPTS = ["Put these pottery steps in the correct order.", "Arrange the steps of the slab technique.", "Order these steps, from first to last.", "Sort these pottery steps into the correct sequence.", "Place these steps in the order you would follow them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about pottery.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const PROCESS_STEPS = [
  { id: "p1", label: "Responsibly source clay from the environment (anthills, riverbanks)" },
  { id: "p2", label: "Knead the clay until soft and workable" },
  { id: "p3", label: "Wedge the clay to remove trapped air bubbles" },
  { id: "p4", label: "Roll the clay into slabs of equal, uniform thickness" },
  { id: "p5", label: "Cut rectangular and circular slabs" },
  { id: "p6", label: "Join the slabs to form a vase" },
  { id: "p7", label: "Finish the vase by burnishing and stamping" },
  { id: "p8", label: "Leave the vase to dry under shade" },
] as const;

export const pottery: Skill = {
  id: "g6-cas-pottery",
  code: "P.4",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-performing-displaying",
  grade: 6,
  title: "Pottery",
  description: "Modelling a vase using the slab technique — sourcing and preparing clay, cutting and joining slabs, and finishing by burnishing, stamping, and drying under shade.",
  generate(rng) {
    const branch = randChoice(rng, ["stage-recognition", "term-match", "process-categorize", "reasoning", "steps-order", "fill-blank"] as const);

    if (branch === "stage-recognition") {
      const stage = randChoice(rng, ["clay-ball", "slab", "joined-vase", "burnished-vase"] as const);
      const labels: Record<string, string> = {
        "clay-ball": "Kneaded clay ball",
        slab: "Rolled slab",
        "joined-vase": "Joined vase (unfinished)",
        "burnished-vase": "Finished, burnished vase",
      };
      const others = Object.keys(labels).filter((k) => k !== stage);
      const choices = shuffle(rng, [labels[stage], ...shuffle(rng, others.map((o) => labels[o])).slice(0, 3)]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, STAGE_PROMPTS),
        choices,
        correctIndex: choices.indexOf(labels[stage]),
        layout: "list",
        visual: { type: "pottery-stage", stage },
        hint: "Follow the order: kneaded ball, then slab, then joined vase, then finished vase.",
        explanation: `This shows the ${labels[stage].toLowerCase()} stage.`,
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the technique's name, preparing the clay, and finishing the surface.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "process-categorize") {
      const chosen = shuffle(rng, PROCESS_ACTIONS).slice(0, 8);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.stage));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PROCESS_CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "sourcing", label: "Sourcing clay" },
          { id: "shaping", label: "Shaping the vase" },
          { id: "finishing", label: "Finishing" },
        ],
        correctBucket,
        hint: "Sourcing comes first, then shaping the clay into a vase, then finishing touches.",
        explanation: chosen.map((a) => `"${a.label}" belongs to ${a.stage === "sourcing" ? "sourcing clay" : a.stage === "shaping" ? "shaping the vase" : "finishing"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about even thickness, air bubbles, responsible sourcing, and slow, shaded drying.", explanation: q.explanation };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Source clay first, prepare it, shape it into slabs, join them, finish, then dry.",
        explanation: "Correct order: " + PROCESS_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about the slab technique, kneading, wedging, burnishing, and stamping.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
