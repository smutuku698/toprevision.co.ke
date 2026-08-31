import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PARTS: { name: string; role: string; location: "chloroplast" | "leaf" }[] = [
  { name: "Chlorophyll", role: "The green pigment inside chloroplasts that absorbs light energy", location: "chloroplast" },
  { name: "Grana", role: "Stacks of membranes inside the chloroplast where the light stage happens", location: "chloroplast" },
  { name: "Stroma", role: "The fluid inside the chloroplast where the dark stage happens", location: "chloroplast" },
  { name: "Stomata", role: "Tiny pores, mostly on the underside of the leaf, that let carbon dioxide in and oxygen/water vapour out", location: "leaf" },
  { name: "Cuticle", role: "A waxy waterproof layer on the leaf surface that reduces water loss", location: "leaf" },
  { name: "Palisade mesophyll", role: "The tightly packed cell layer near the top of the leaf, packed with chloroplasts to absorb light", location: "leaf" },
  { name: "Spongy mesophyll", role: "The loosely packed cell layer with air spaces that lets gases move through the leaf", location: "leaf" },
  { name: "Xylem (leaf vein)", role: "Tissue that transports water and minerals into the leaf for photosynthesis", location: "leaf" },
];

const PHOTOSYNTHESIS_STEPS = [
  { id: "absorb", label: "Chlorophyll in the grana absorbs light energy" },
  { id: "split", label: "The light energy splits water into hydrogen and oxygen; oxygen is released" },
  { id: "combine", label: "In the stroma, hydrogen combines with carbon dioxide to form glucose" },
  { id: "use", label: "Glucose is used for energy or stored as starch in the plant" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The process by which plants use light energy to make their own food is called ", after: ".", correctAnswer: "photosynthesis", accepted: ["photosynthesis"], explanation: "Photosynthesis is the process by which plants use light energy to make their own food." },
  { before: "The green pigment that absorbs light energy for photosynthesis is called ", after: ".", correctAnswer: "chlorophyll", accepted: ["chlorophyll"], explanation: "Chlorophyll is the green pigment inside chloroplasts that absorbs light energy for photosynthesis." },
  { before: "The structure inside a plant cell where photosynthesis takes place is called the ", after: ".", correctAnswer: "chloroplast", accepted: ["chloroplast"], explanation: "The chloroplast is the structure inside a plant cell where photosynthesis takes place." },
  { before: "The sugar produced by photosynthesis, used for energy or stored as starch, is called ", after: ".", correctAnswer: "glucose", accepted: ["glucose"], explanation: "Glucose is the sugar produced by photosynthesis, used by the plant for energy or stored as starch." },
  { before: "The tiny pores, mostly on the underside of a leaf, that let gases move in and out are called ", after: ".", correctAnswer: "stomata", accepted: ["stomata"], explanation: "Stomata are tiny pores on the leaf surface that let carbon dioxide in and oxygen/water vapour out." },
  { before: "The loss of water vapour from a plant's leaves, mainly through the stomata, is called ", after: ".", correctAnswer: "transpiration", accepted: ["transpiration"], explanation: "Transpiration is the loss of water vapour from a plant's leaves, mainly through the stomata." },
] as const;

const CONDITION_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which four things are all necessary for photosynthesis to occur?",
    choices: ["Light, carbon dioxide, water, and chlorophyll", "Light, oxygen, soil, and warmth", "Darkness, water, and carbon dioxide only", "Chlorophyll and soil only"],
    correctIndex: 0,
    explanation: "Photosynthesis needs light energy, carbon dioxide, water, and chlorophyll to trap the light energy.",
  },
  {
    prompt: "What are the two products of photosynthesis?",
    choices: ["Glucose and oxygen", "Carbon dioxide and water", "Starch and carbon dioxide", "Water and nitrogen"],
    correctIndex: 0,
    explanation: "Photosynthesis converts carbon dioxide and water into glucose (food) and oxygen, using light energy trapped by chlorophyll.",
  },
  {
    prompt: "Why are leaves usually broad and thin?",
    choices: ["To expose a large surface area to sunlight for photosynthesis", "To store more water for the plant", "To make the leaf heavier", "To reduce the number of stomata needed"],
    correctIndex: 0,
    explanation: "A broad, thin shape gives the leaf a large surface area, letting it absorb as much light as possible for photosynthesis.",
  },
  {
    prompt: "Where in the plant cell does photosynthesis take place?",
    choices: ["The chloroplast", "The nucleus", "The mitochondrion", "The cell wall"],
    correctIndex: 0,
    explanation: "Chloroplasts contain chlorophyll and are the site where both stages of photosynthesis take place.",
  },
];

export const nutritionInPlants: Skill = {
  id: "sci-lte-nutrition-plants",
  code: "LTE.1",
  subjectId: "science",
  strandId: "sci-lte",
  grade: 9,
  title: "Nutrition in plants",
  description: "Leaf adaptations for photosynthesis and the conditions and products of photosynthesis.",
  generate(rng) {
    const branch = randChoice(rng, ["parts", "conditions", "location", "fill-blank", "process-order"] as const);

    if (branch === "location") {
      const chosen = shuffle(rng, PARTS);
      const items = chosen.map((p) => ({ id: p.name, label: p.name }));
      const correctBucket: Record<string, string> = {};
      for (const p of chosen) correctBucket[p.name] = p.location;
      return {
        kind: "categorize",
        prompt: "Sort each structure by whether it is found inside the chloroplast or elsewhere in the leaf.",
        items,
        buckets: [
          { id: "chloroplast", label: "Inside the chloroplast" },
          { id: "leaf", label: "Elsewhere in the leaf" },
        ],
        correctBucket,
        hint: "The chloroplast contains chlorophyll, grana, and stroma; the wider leaf has structures like stomata, cuticle, and mesophyll layers.",
        explanation: chosen.map((p) => `${p.name} is ${p.location === "chloroplast" ? "inside the chloroplast" : "elsewhere in the leaf"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about nutrition in plants.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe photosynthesis and leaf structure.",
        explanation: fb.explanation,
      };
    }

    if (branch === "process-order") {
      const items = shuffle(rng, PHOTOSYNTHESIS_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these stages of photosynthesis in the correct order.",
        instruction: "Drag to reorder from the first stage to the last stage.",
        items,
        correctOrder: PHOTOSYNTHESIS_STEPS.map((s) => s.id),
        hint: "Light must be absorbed and water split before carbon dioxide can be combined to make glucose.",
        explanation: PHOTOSYNTHESIS_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "parts") {
      const chosen = shuffle(rng, PARTS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.role })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.name] = p.name;

      return {
        kind: "click-match",
        prompt: "Match each leaf/chloroplast structure to its role in photosynthesis.",
        tokens,
        targets,
        correctMap,
        hint: "Photosynthesis happens inside the chloroplast, which has its own internal structures.",
        explanation: chosen.map((p) => `${p.name} — ${p.role.toLowerCase()}.`).join(" "),
      };
    }

    const q = randChoice(rng, CONDITION_QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about what photosynthesis needs as inputs, and what it produces.",
      explanation: q.explanation,
    };
  },
};
