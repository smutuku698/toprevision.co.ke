import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "these steps of creating a budget in the order you would do them.",
    "these budgeting steps into the order they should be carried out.",
    "these steps for managing money wisely from first to last.",
    "these budgeting steps into their correct order.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by which type of resource it describes.",
    "these facts under the correct resource type.",
    "each fact below by whether it is about a natural, financial, man-made, or time resource.",
    "each fact into the bucket for the resource type it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the resource idea it relates to.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about managing resources.",
    "the correct missing word.",
  ],
);

// A genuine procedural sequence for creating a budget with priority items, directly matching the
// sub-strand's own "create a hypothetical budget with priority items" learning experience.
const BUDGET_STEPS = [
  { id: "s1", label: "List all the things you need and want" },
  { id: "s2", label: "Note down the amount of money you actually have available" },
  { id: "s3", label: "Rank your needs and wants in order of priority" },
  { id: "s4", label: "Set aside money for the most important priorities first" },
  { id: "s5", label: "Use any money left over for lower-priority wants" },
  { id: "s6", label: "Review your budget and adjust it if your priorities change" },
];

interface ResourceFact { text: string; type: "natural" | "financial" | "man-made" | "time" }
const RESOURCE_LABEL: Record<ResourceFact["type"], string> = {
  natural: "Natural resources",
  financial: "Financial resources",
  "man-made": "Man-made resources",
  time: "Time",
};
const RESOURCE_FACTS: ResourceFact[] = [
  { text: "Air, water, forests, and minerals are natural resources that exist without being manufactured by people", type: "natural" },
  { text: "Water and land must be used carefully so they remain available for future generations", type: "natural" },
  { text: "Forests are a natural resource that provide timber, clean air, and habitats for wildlife", type: "natural" },
  { text: "Sunlight is a natural resource that supports plant growth and can be harnessed for solar energy", type: "natural" },
  { text: "Money, savings, and income are financial resources used to meet needs and wants", type: "financial" },
  { text: "Creating a budget helps prioritise which items to purchase within the money available", type: "financial" },
  { text: "Saving part of one's pocket money is a way of managing financial resources responsibly", type: "financial" },
  { text: "Sharing financial resources with the less fortunate reflects the value of love and social responsibility", type: "financial" },
  { text: "Buildings, tools, machines, and roads are man-made resources created by human effort", type: "man-made" },
  { text: "Digital devices and technology are man-made resources that support learning and communication", type: "man-made" },
  { text: "Furniture and books are man-made resources that support daily life and education", type: "man-made" },
  { text: "Switching off electric appliances and taps after use helps man-made resources last longer", type: "man-made" },
  { text: "Time is a resource that, once used, cannot be recovered or increased", type: "time" },
  { text: "Being punctual for school activities is one way of managing the resource of time responsibly", type: "time" },
  { text: "Using time-management applications on digital devices can help plan and prioritise daily tasks", type: "time" },
  { text: "Wasting time on unproductive activities is one way the resource of time can be poorly managed", type: "time" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Natural resources", meaning: "Resources like air, water, forests, and minerals that exist without being manufactured" },
  { term: "Financial resources", meaning: "Money, savings, and income used to meet needs and wants" },
  { term: "Man-made resources", meaning: "Buildings, tools, machines, and roads created by human effort" },
  { term: "Time", meaning: "A resource that, once used, cannot be recovered or increased" },
  { term: "Budget", meaning: "A plan for prioritising which items to purchase within available money" },
  { term: "Savings", meaning: "Money set aside rather than spent immediately" },
  { term: "Punctuality", meaning: "Being on time, a way of managing the resource of time responsibly" },
  { term: "Prudent management", meaning: "Using resources wisely so they benefit both the present and the future" },
  { term: "Sustainable development", meaning: "Meeting present needs without compromising resources for the future" },
  { term: "Priority", meaning: "Something ranked as more important and addressed first in a budget" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} receives pocket money and spends it all immediately on the first thing seen in a shop. What would demonstrate more prudent management of this financial resource?`,
    correct: "Ranking needs and wants by priority and creating a simple budget before spending",
    wrong: [
      "Spending all the money as quickly as possible every time",
      "Refusing to ever spend any money at all under any circumstance",
      "Giving the money away without any planning or thought",
    ],
    explanation: "Prudent management of financial resources means planning and prioritising, as taught through creating a budget, rather than spending immediately without a plan.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} leaves a tap running after washing hands at school. Which resource is being poorly managed?`,
    correct: "A natural resource — water",
    wrong: [
      "A financial resource — savings",
      "A man-made resource — furniture",
      "The resource of time",
    ],
    explanation: "Water is a natural resource, and leaving a tap running wastes it — directly connecting to this lesson's example of turning off taps after use.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} arrives late to every school activity despite having a class schedule available. Which resource is this learner managing poorly?`,
    correct: "Time",
    wrong: ["Natural resources", "Financial resources", "Man-made resources"],
    explanation: "Being consistently late reflects poor management of time, a resource that, once used, cannot be recovered — punctuality is one way to manage it responsibly.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is designing a poster to remind classmates to switch off classroom lights after use. Which type of resource does this poster help protect?`,
      correct: "A man-made resource — electric appliances and the energy they use",
      wrong: [
        "Only a natural resource, with no connection to anything man-made",
        "Only a financial resource, with no connection to anything physical",
        "Only the resource of time, with no connection to electricity",
      ],
      explanation: "Electric appliances are man-made resources, and switching them off after use is a direct example of caring for man-made resources so they last longer and use less energy.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that because forests regrow naturally, they never need to be managed carefully. Evaluate this claim.`,
    correct: "Flawed — even natural resources like forests must be used carefully so they remain available for future generations",
    wrong: [
      "Sound — natural resources can be used without any limit since they regrow on their own",
      "Sound — only man-made resources ever require careful management",
      "Flawed — but only because forests are not actually classified as natural resources",
    ],
    explanation: "This lesson specifically teaches that natural resources like water, land, and forests must be used carefully to remain available for the future — regrowth does not remove the need for careful management.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} visits a home for the less fortunate and shares part of their family's food resources. Which value does this action best demonstrate, based on this lesson?`,
    correct: "Love, shown through sharing financial and material resources with those in need",
    wrong: [
      "Responsibility, shown only through personal punctuality",
      "Creativity, shown only through designing posters",
      "This action demonstrates no particular value related to managing resources",
    ],
    explanation: "This lesson explicitly links visiting a home for the less fortunate and sharing resources to the value of love, extended through generosity and social responsibility.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to create a hypothetical budget for a class trip using limited funds. What should come first in the budgeting process?`,
      correct: "Listing all the things needed and wanted for the trip",
      wrong: [
        "Immediately spending all available funds without any planning",
        "Ranking priorities only after all the money has already been spent",
        "Skipping straight to reviewing the budget before it has even been created",
      ],
      explanation: "Creating a budget begins with listing needs and wants, then noting available funds, ranking priorities, and allocating money accordingly — not spending or reviewing before planning.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that using a time-management application on a digital device has nothing to do with managing resources prudently. Is this accurate?`,
    correct: "No — using such an application is a specific example this lesson gives for managing the resource of time prudently",
    wrong: [
      "Yes — digital devices are unrelated to managing any type of resource",
      "Yes — only financial resources can be managed using digital devices",
      "No — but only because time is not actually classified as a resource",
    ],
    explanation: "This lesson specifically names downloading and using time-management applications as a way of managing the resource of time — a genuine connection, not an unrelated activity.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why it is important for an individual to take care of resources, per this lesson's key inquiry question. What is the best answer?`,
    correct: "Careful, prudent use of natural, financial, man-made, and time resources supports harmonious living now and for the future",
    wrong: [
      "It matters only for financial resources, since other resource types cannot be depleted",
      "It has no real importance beyond completing a school assignment",
      "It matters only for adults, since learners have no role in managing resources",
    ],
    explanation: "This lesson's own aim is developing a desire to manage all four resource types prudently for sustainable development and harmonious living, not just one resource type or one age group.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that since money can always be earned again, financial resources never need careful budgeting. Is this a fair conclusion?`,
    correct: "No — a budget still helps use available money wisely and prioritise needs, regardless of future earning potential",
    wrong: [
      "Yes — budgeting is pointless as long as more money can be earned later",
      "Yes — financial resources are the only resource type that never requires planning",
      "No — but only because money can never actually be earned again once spent",
    ],
    explanation: "Even though income can be earned again, a budget still helps prioritise needs and use available money wisely in the present — the possibility of future income does not remove the value of budgeting.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is comparing how technology is useful in managing resources prudently, per this lesson's key inquiry question. Which is the best example?`,
    correct: "Using a time-management application to plan and prioritise daily tasks",
    wrong: [
      "Leaving digital devices switched on at all times regardless of use",
      "Ignoring digital tools entirely when managing money or time",
      "Using technology only for entertainment, with no connection to resource management",
    ],
    explanation: "This lesson specifically highlights using time-management applications on digital devices as an example of how technology supports managing resources — in this case, time — prudently.",
  }),
];

export const managingResources: Skill = {
  id: "g6-hre-se-managing-resources",
  code: "SE.1",
  subjectId: "hre",
  strandId: "g6-hre-se",
  grade: 6,
  title: "Managing Resources",
  description: "The four types of resources — natural, financial, man-made, and time — and how to manage each prudently for harmonious living and sustainable development.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, BUDGET_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the first budgeting step to the last.",
        items,
        correctOrder: BUDGET_STEPS.map((s) => s.id),
        hint: "Budgeting starts with listing needs and available funds, then ranking priorities and allocating money.",
        explanation: BUDGET_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const types: ResourceFact["type"][] = ["natural", "financial", "man-made", "time"];
      const chosen = shuffle(rng, types.flatMap((t) => shuffle(rng, RESOURCE_FACTS.filter((f) => f.type === t)).slice(0, 2)));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: types.map((t) => ({ id: t, label: RESOURCE_LABEL[t] })),
        correctBucket,
        hint: "Think about whether each fact is about a natural, financial, man-made, or time resource.",
        explanation: chosen.map((f) => `"${f.text}" — ${RESOURCE_LABEL[f.type]}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which resource type or budgeting idea each term relates to.",
        explanation: chosen.map((a) => `${a.term} — ${a.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about whether the scenario involves a natural, financial, man-made, or time resource.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Air, water, forests, and minerals are examples of", after: "resources.", answer: "natural", accepted: ["natural"] },
      { before: "Money, savings, and income are examples of", after: "resources.", answer: "financial", accepted: ["financial"] },
      { before: "Buildings, tools, machines, and roads are examples of", after: "resources.", answer: "man-made", accepted: ["man-made", "man made"] },
      { before: "A resource that, once used, cannot be recovered or increased is", after: ".", answer: "time", accepted: ["time"] },
      { before: "A plan for prioritising items to purchase within available money is called a", after: ".", answer: "budget", accepted: ["budget"] },
      { before: "Setting aside part of one's pocket money instead of spending it is called", after: ".", answer: "saving", accepted: ["saving", "savings"] },
      { before: "Being on time for school activities is called", after: ".", answer: "punctuality", accepted: ["punctuality"] },
      { before: "Switching off appliances after use helps", after: "resources last longer.", answer: "man-made", accepted: ["man-made", "man made"] },
      { before: "Sharing resources with the less fortunate reflects the value of", after: ".", answer: "love", accepted: ["love"] },
      { before: "Using water and land carefully keeps them available for future", after: ".", answer: "generations", accepted: ["generations"] },
      { before: "Sunlight can be harnessed for", after: "energy.", answer: "solar", accepted: ["solar"] },
      { before: "Downloading a time-management application helps plan and", after: "daily tasks.", answer: "prioritise", accepted: ["prioritise", "prioritize"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall whether the fact is about a natural, financial, man-made, or time resource.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
