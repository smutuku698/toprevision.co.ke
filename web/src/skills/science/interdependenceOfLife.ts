import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FACTORS: { name: string; type: "biotic" | "abiotic" }[] = [
  { name: "Predation", type: "biotic" },
  { name: "Competition between plants", type: "biotic" },
  { name: "Parasites", type: "biotic" },
  { name: "Decomposers", type: "biotic" },
  { name: "Temperature", type: "abiotic" },
  { name: "Light intensity", type: "abiotic" },
  { name: "Water availability", type: "abiotic" },
  { name: "Soil pH", type: "abiotic" },
  { name: "Wind", type: "abiotic" },
];

const CHAINS: string[][] = [
  ["Grass", "Grasshopper", "Frog", "Snake", "Eagle"],
  ["Algae", "Small fish", "Big fish", "Heron"],
  ["Maize plant", "Rat", "Snake", "Owl"],
  ["Leaves", "Caterpillar", "Small bird", "Hawk"],
];

const TROPHIC_TERMS: { term: string; meaning: string }[] = [
  { term: "Producer", meaning: "An organism, usually a green plant, that makes its own food through photosynthesis" },
  { term: "Primary consumer", meaning: "An organism that feeds directly on producers, such as a herbivore" },
  { term: "Secondary consumer", meaning: "An organism that feeds on primary consumers, such as a small carnivore" },
  { term: "Decomposer", meaning: "An organism that breaks down dead plants and animals, returning nutrients to the soil" },
  { term: "Herbivore", meaning: "An animal that feeds only on plants" },
  { term: "Carnivore", meaning: "An animal that feeds only on other animals" },
  { term: "Omnivore", meaning: "An animal that feeds on both plants and animals" },
  { term: "Food web", meaning: "A network of interconnected food chains within an ecosystem" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A community of living organisms interacting with each other and their physical environment is called an ", after: ".", correctAnswer: "ecosystem", accepted: ["ecosystem"], explanation: "An ecosystem is a community of living organisms interacting with each other and their physical environment." },
  { before: "The natural home or environment of an organism is called its ", after: ".", correctAnswer: "habitat", accepted: ["habitat"], explanation: "A habitat is the natural home or environment where an organism normally lives." },
  { before: "The variety of living species found in an ecosystem is called ", after: ".", correctAnswer: "biodiversity", accepted: ["biodiversity"], explanation: "Biodiversity is the variety of living species found within an ecosystem." },
  { before: "A close, long-term relationship between two different species is called ", after: ".", correctAnswer: "symbiosis", accepted: ["symbiosis"], explanation: "Symbiosis is a close, long-term relationship between two different species, which may benefit one or both." },
  { before: "The specific role an organism plays within its ecosystem is called its ecological ", after: ".", correctAnswer: "niche", accepted: ["niche"], explanation: "An ecological niche is the specific role an organism plays within its ecosystem, including what it eats and where it lives." },
  { before: "A single feeding pathway showing energy flow from a producer through several organisms is called a food ", after: ".", correctAnswer: "chain", accepted: ["chain"], explanation: "A food chain is a single feeding pathway showing how energy flows from a producer through a sequence of consumers." },
] as const;

const HUMAN_IMPACT_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "How does habitat destruction (e.g. clearing forest for farmland) affect an ecosystem?",
    choices: ["It removes homes and food sources, reducing biodiversity", "It always increases the number of species present", "It has no effect on animals living there", "It only affects plants, not animals"],
    correctIndex: 0,
    explanation: "Clearing habitat removes shelter, breeding grounds, and food sources for many species at once, which reduces biodiversity in that area.",
  },
  {
    prompt: "What is a likely effect of introducing a new, non-native species into an ecosystem?",
    choices: ["It may outcompete native species for food and space", "It always balances the ecosystem perfectly", "It has no interaction with native species", "It immediately becomes a decomposer"],
    correctIndex: 0,
    explanation: "Introduced species often lack natural predators in the new ecosystem and can outcompete native species for food, space, and resources.",
  },
  {
    prompt: "Why is overhunting or poaching a threat to an ecosystem's food web?",
    choices: ["Removing a species can disrupt the food chains it was part of", "It only affects the hunted species and nothing else", "It increases the population of every other species equally", "It has the same effect as a habitat becoming larger"],
    correctIndex: 0,
    explanation: "Every species plays a role in one or more food chains; removing it through overhunting can starve its predators or let its prey overpopulate.",
  },
];

export const interdependenceOfLife: Skill = {
  id: "sci-lte-interdependence",
  code: "LTE.4",
  subjectId: "science",
  strandId: "sci-lte",
  grade: 9,
  title: "The interdependence of life",
  description: "Biotic and abiotic factors, food chains, and the effect of human activities on the environment.",
  generate(rng) {
    const branch = randChoice(rng, ["factors", "chain", "impact", "match", "fill-blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TROPHIC_TERMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each ecology term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about who eats whom, and who feeds directly on plants versus other animals.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about the interdependence of life.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe ecosystems and how organisms depend on each other.",
        explanation: fb.explanation,
      };
    }

    if (branch === "factors") {
      const chosen = shuffle(rng, FACTORS).slice(0, 6);
      const items = chosen.map((f) => ({ id: f.name, label: f.name }));
      const correctBucket: Record<string, string> = {};
      for (const f of chosen) correctBucket[f.name] = f.type;

      return {
        kind: "categorize",
        prompt: "Sort each factor as biotic (living) or abiotic (non-living).",
        items,
        buckets: [
          { id: "biotic", label: "Biotic" },
          { id: "abiotic", label: "Abiotic" },
        ],
        correctBucket,
        hint: "Biotic factors involve living organisms; abiotic factors are physical/chemical conditions of the environment.",
        explanation: chosen.map((f) => `${f.name} is ${f.type}.`).join(" "),
      };
    }

    if (branch === "chain") {
      const chain = randChoice(rng, CHAINS);
      const idItems = chain.map((label, i) => ({ id: `c${i}`, label }));
      const shuffled = shuffle(rng, idItems);
      return {
        kind: "ordering",
        prompt: "Arrange this food chain in the correct order, from producer to top predator.",
        instruction: "Drag to order the organisms so energy flows correctly from one to the next.",
        items: shuffled,
        correctOrder: idItems.map((it) => it.id),
        hint: "Energy flows from the producer (a plant) up through each animal that eats the one before it.",
        explanation: `The correct food chain is: ${chain.join(" → ")}. Energy flows from the producer at the start to the top predator at the end.`,
      };
    }

    const q = randChoice(rng, HUMAN_IMPACT_QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about how removing or adding a species ripples through the food chains it was part of.",
      explanation: q.explanation,
    };
  },
};
