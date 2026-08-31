import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 4.2 Constructing Innovative Gardens — horizontal vs vertical gardens,
// built from 4 named materials (sack, plastic bottle, wall, plastic pipe). See
// curriculum-reference/grade-5/agriculture.json.

const GARDEN_TYPES = [
  { id: "horizontal", label: "Horizontal garden", def: "A garden that spreads out sideways across the ground, using flat growing space" },
  { id: "vertical", label: "Vertical garden", def: "A garden that grows upward, making use of height rather than ground space" },
] as const;

const MATERIAL_USES = [
  { material: "Sack filled with soil, with holes cut in the sides for planting", type: "vertical" },
  { material: "Plastic bottles hung or stacked to hold soil and plants up a wall", type: "vertical" },
  { material: "A wall fitted with pockets or shelves to hold planting containers", type: "vertical" },
  { material: "Plastic pipes mounted upright with holes cut for planting", type: "vertical" },
  { material: "A ground bed dug directly into flat soil, spreading sideways", type: "horizontal" },
  { material: "Old tyres laid flat on the ground and filled with soil for planting", type: "horizontal" },
] as const;

const GARDEN_BENEFITS = [
  { text: "Makes good use of a small compound with very little flat ground space", type: "vertical" },
  { text: "Can be built along a wall or fence where ground space is limited", type: "vertical" },
  { text: "Suits a home with plenty of open, flat land available", type: "horizontal" },
  { text: "Allows more plants to be grown by using height instead of width", type: "vertical" },
  { text: "Is often simpler to water evenly across the whole bed", type: "horizontal" },
  { text: "Reuses waste materials like sacks and bottles creatively", type: "vertical" },
] as const;

const SACK_GARDEN_STEPS = [
  { id: "s1", label: "Choose a sturdy sack and a central column material (such as stones or gravel) for drainage" },
  { id: "s2", label: "Place the drainage column in the centre and fill around it with soil" },
  { id: "s3", label: "Cut evenly spaced holes in the sides of the sack for planting" },
  { id: "s4", label: "Plant seedlings or seeds into the side holes and on top of the sack" },
  { id: "s5", label: "Water the garden regularly, including through the central drainage column" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} lives in a small compound in ${place(rng)} with almost no flat ground for a traditional garden bed. Which type of innovative garden would suit this situation best?`,
      correct: "A vertical garden, since it grows upward and needs little ground space",
      wrong: ["A horizontal garden, since it needs the least space of all", "Neither type could work in a small compound", "Both types need exactly the same amount of ground space"],
      explanation: "A vertical garden makes use of height rather than ground space, making it well suited to a compound with limited flat area.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} fills old sacks with soil, cuts holes in the sides, and plants vegetables both in the holes and on top. What type of garden have they built?`,
    correct: "A vertical garden",
    wrong: ["A horizontal garden", "Neither type — sacks cannot be used as gardens", "This is not gardening at all"],
    explanation: "A sack garden grows plants both up the sides and on top, making efficient use of height — a vertical garden.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has a large, open piece of flat land and digs a wide ground bed to grow a variety of vegetables spread across it. What type of garden is this?`,
      correct: "A horizontal garden",
      wrong: ["A vertical garden", "Neither type — ground beds are not considered gardens", "Both types combined"],
      explanation: "A garden that spreads sideways across flat ground, rather than growing upward, is a horizontal garden.",
    };
  },
  (rng) => ({
    prompt: `A school in ${place(rng)} mounts upright plastic pipes with cut holes along a wall to grow herbs. Why choose plastic pipes for this vertical garden?`,
    correct: "Pipes can be mounted upright against a wall, using height efficiently in a space-limited area",
    wrong: ["Pipes can only ever be used for horizontal gardens", "Plastic pipes have no real advantage over any other material", "Pipes are used only because they are the cheapest option"],
    explanation: "Plastic pipes mounted upright are one of the named materials specifically suited to constructing a vertical garden.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} builds a garden using empty plastic bottles stacked and hung along a fence, each holding soil and a small plant. Which material and garden type does this show?`,
      correct: "Plastic bottles, used to build a vertical garden",
      wrong: ["Sacks, used to build a horizontal garden", "A wall, used to build a horizontal garden", "Plastic pipes, used to build a horizontal garden"],
      explanation: "Plastic bottles stacked or hung along a fence to hold soil and plants is a vertical garden, built with one of the 4 named materials.",
    };
  },
  (rng) => ({
    prompt: `A homeowner in ${place(rng)} fits a wall with pockets and shelves to hold planting containers for a kitchen herb garden. What advantage does building on a wall bring?`,
    correct: "It uses vertical wall space that would otherwise be unused, without needing any extra ground",
    wrong: ["It uses exactly the same amount of space as a ground bed", "Walls can only ever hold decorative plants, not food crops", "There is no real advantage to using a wall this way"],
    explanation: "Using a wall for planting pockets makes use of otherwise-unused vertical space — the same space-saving advantage as other vertical garden materials.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} compares two gardens in ${place(rng)}: a wide ground bed and a tall sack garden of the same base footprint. Which garden is likely to hold more plants overall?`,
      correct: "The sack garden, since it uses height as well as its base area to grow plants",
      wrong: ["The ground bed, since height never adds any extra growing space", "Both gardens would hold exactly the same number of plants", "Neither garden can hold more than a few plants regardless of design"],
      explanation: "A vertical garden like a sack garden can hold more plants than a horizontal garden of the same footprint, because it also uses height.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} reuses old plastic bottles and sacks — materials that would otherwise be thrown away — to build a vertical garden. What environmental benefit does this bring, beyond the garden itself?`,
    correct: "It reduces waste by reusing materials that would otherwise be discarded",
    wrong: ["Reusing bottles and sacks has no environmental benefit at all", "This practice actually increases the amount of waste produced", "Reused materials always harm plant growth compared to new materials"],
    explanation: "Building a garden from reused materials like sacks and bottles reduces waste, an environmental awareness benefit named in this sub-strand.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sets up a wide ground bed in ${place(rng)} and finds it simple to water evenly with a watering can moving across the whole surface. What advantage of a horizontal garden does this show?`,
      correct: "A flat, spread-out bed can often be watered evenly across its whole area with a simple technique",
      wrong: ["Horizontal gardens can never be watered evenly", "This advantage applies only to vertical gardens, never horizontal ones", "Watering ease has nothing to do with the garden's shape"],
      explanation: "A flat, spread-out horizontal garden bed is often simple to water evenly across the whole surface.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} chooses between building a horizontal ground bed and a vertical sack garden, weighing their limited compound space against wanting to grow many crops. What is the most balanced conclusion?`,
    correct: "A vertical garden fits their limited space better while still allowing many plants to be grown using height",
    wrong: ["A horizontal garden is always better regardless of available space", "Space availability has no bearing on which garden type is best", "Neither garden type could work if space is limited at all"],
    explanation: "Choosing between horizontal and vertical gardens should weigh available ground space against how many plants are wanted — vertical gardens solve the space problem directly.",
  }),
];

export const constructingInnovativeGardens: Skill = {
  id: "g5-ag-production-techniques-constructing-innovative-gardens",
  code: "PT.2",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-production-techniques",
  grade: 5,
  title: "Constructing innovative gardens",
  description: "Distinguishing between horizontal and vertical innovative gardens, and constructing them using sacks, plastic bottles, walls and plastic pipes.",
  generate(rng) {
    const branch = randChoice(rng, ["type-match", "material-categorize", "sack-order", "reasoning", "fill-blank"] as const);

    if (branch === "type-match") {
      const tokens = shuffle(rng, GARDEN_TYPES.map((g) => ({ id: g.id, label: g.label })));
      const targets = shuffle(rng, GARDEN_TYPES.map((g) => ({ id: g.id, label: g.def })));
      const correctMap: Record<string, string> = {};
      for (const g of GARDEN_TYPES) correctMap[g.id] = g.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "garden type to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the garden spreads sideways or grows upward.",
        explanation: GARDEN_TYPES.map((g) => `${g.label} — ${g.def}.`).join(" "),
      };
    }

    if (branch === "material-categorize") {
      const pool: { label: string; type: "horizontal" | "vertical" }[] = randChoice(rng, [true, false])
        ? MATERIAL_USES.map((p): { label: string; type: "horizontal" | "vertical" } => ({ label: p.material, type: p.type }))
        : GARDEN_BENEFITS.map((p): { label: string; type: "horizontal" | "vertical" } => ({ label: p.text, type: p.type }));
      const chosen = shuffle(rng, pool).slice(0, 6);
      const items = chosen.map((p, i) => ({ id: `m${i}`, label: p.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`m${i}`] = p.type));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it best fits a horizontal garden or a vertical garden"),
        items,
        buckets: [
          { id: "horizontal", label: "Horizontal garden" },
          { id: "vertical", label: "Vertical garden" },
        ],
        correctBucket,
        hint: "Think about whether it uses flat ground space or height/wall space.",
        explanation: chosen.map((p) => `"${p.label}" fits a ${p.type} garden.`).join(" "),
      };
    }

    if (branch === "sack-order") {
      const shuffled = shuffle(rng, SACK_GARDEN_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of constructing a sack vertical garden"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: SACK_GARDEN_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Set up the drainage column and soil first, then cut holes, then plant, then water.",
        explanation: "Correct order: " + SACK_GARDEN_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "A garden that grows upward, making use of height, is called a ", after: " garden.", correctAnswer: "vertical" },
      { before: "A garden that spreads out sideways across flat ground is called a ", after: " garden.", correctAnswer: "horizontal" },
      { before: "The 4 named materials for constructing innovative gardens are sacks, plastic bottles, walls and plastic ", after: ".", correctAnswer: "pipes" },
      { before: "A sack garden has holes cut in its sides so plants can grow ", after: " the sack, not just on top.", correctAnswer: "out of", alsoAccept: ["from the side of", "along the side of"] },
      { before: "Vertical gardens are especially useful when a compound has very little flat ", after: ".", correctAnswer: "ground space", alsoAccept: ["space"] },
      { before: "Reusing sacks and bottles to build a garden helps reduce ", after: ".", correctAnswer: "waste" },
      { before: "A wall fitted with pockets or shelves for plants is an example of a ", after: " garden.", correctAnswer: "vertical" },
      { before: "A garden dug directly into open, flat soil is an example of a ", after: " garden.", correctAnswer: "horizontal" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about horizontal vs vertical gardens and the 4 named construction materials.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
