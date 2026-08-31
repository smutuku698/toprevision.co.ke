import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const FACTORS = [
  "abundant and varied wildlife, including the Big Five",
  "varied and scenic landscapes, from savanna plains to mountains",
  "a generally favourable climate for visitors year-round",
  "cultural heritage sites that interest visitors",
  "good roads, airports, and accommodation for tourists",
] as const;

const PARKS = [
  { name: "the Maasai Mara National Reserve", country: "Kenya", feature: "known for the annual wildebeest migration" },
  { name: "Amboseli National Park", country: "Kenya", feature: "known for large elephant herds with views of Mount Kilimanjaro" },
  { name: "Tsavo National Park", country: "Kenya", feature: "one of the largest parks in the region, known for red-dust elephants" },
  { name: "the Serengeti National Park", country: "Tanzania", feature: "famous for its vast open plains and large migrating herds" },
  { name: "Bwindi Impenetrable Forest", country: "Uganda", feature: "known for mountain gorilla tracking" },
  { name: "Volcanoes National Park", country: "Rwanda", feature: "known for mountain gorilla conservation" },
] as const;

const CHALLENGE_SOLUTIONS = [
  { challenge: "Poachers are killing wildlife for their tusks, horns, or skins", solution: "strengthening anti-poaching units and community conservancies", wrongSolution: "fencing off farmland to stop elephants from raiding crops" },
  { challenge: "Elephants and other wildlife wander into farmland and destroy crops", solution: "erecting fencing and running compensation schemes for affected farmers", wrongSolution: "increasing the number of tourists allowed to visit each park" },
  { challenge: "Fears about insecurity discourage tourists from visiting", solution: "improving security and building traveller confidence", wrongSolution: "strengthening anti-poaching units in the park" },
  { challenge: "Too many visitors are damaging fragile habitats within a park", solution: "controlling visitor numbers and promoting eco-tourism practices", wrongSolution: "improving security to attract more tourists" },
] as const;

function factorMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, FACTORS);
  const wrong = ["a lack of any wildlife or scenery to attract visitors", "very poor roads and no airports anywhere nearby", "a climate too harsh for any visitors to travel comfortably"];
  const place = g6SsPlace(rng);
  return {
    prompt: `Tourists visiting parks near ${place} are often drawn by ${correct}. Which of these is another genuine factor that promotes tourism in Eastern Africa?`,
    correct,
    wrong,
    explanation: `Tourism in Eastern Africa is promoted by ${correct}.`,
  };
}

function parkMc(rng: () => number): ScenarioMC {
  const p = randChoice(rng, PARKS);
  const others = shuffle(rng, PARKS.filter((o) => o.name !== p.name)).slice(0, 3);
  const name = g6SsName(rng);
  return {
    prompt: `${name} is planning a trip to a park ${p.feature}. Which park is this?`,
    correct: p.name.replace(/^the /, ""),
    wrong: others.map((o) => o.name.replace(/^the /, "")),
    explanation: `${p.name}, in ${p.country}, is ${p.feature}.`,
  };
}

function challengeSolutionMc(rng: () => number): ScenarioMC {
  const cs = randChoice(rng, CHALLENGE_SOLUTIONS);
  const correct = cs.solution.charAt(0).toUpperCase() + cs.solution.slice(1);
  // Dedupe wrong-answer candidates by text — cs.wrongSolution deliberately echoes another entry's real
  // solution, which can otherwise collide with an independently-sampled "other" wrong answer.
  const candidates = Array.from(new Set([cs.wrongSolution, ...CHALLENGE_SOLUTIONS.filter((o) => o.solution !== cs.solution).map((o) => o.solution)]));
  const wrong = shuffle(rng, candidates)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return {
    prompt: `A wildlife area faces this challenge: "${cs.challenge}." Which solution actually addresses it?`,
    correct,
    wrong,
    explanation: `"${cs.challenge}" is best addressed by ${cs.solution}.`,
  };
}

export const wildlifeAndTourism: Skill = {
  id: "g6-ss-res-wildlife-and-tourism",
  code: "R.3",
  subjectId: "social-studies",
  strandId: "g6-ss-resources",
  grade: 6,
  title: "Wildlife and tourism in Eastern Africa",
  description: "Factors promoting tourism, well-known parks and reserves, and challenges facing wildlife and tourism.",
  generate(rng) {
    const branch = randChoice(rng, ["factor-mc", "park-mc", "challenge-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "factor-mc" || branch === "park-mc" || branch === "challenge-mc") {
      const q = branch === "factor-mc" ? factorMc(rng) : branch === "park-mc" ? parkMc(rng) : challengeSolutionMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about what attracts tourists, which park matches the description, or which solution actually fixes the challenge.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "The Maasai Mara is famous for the annual wildebeest", after: ".", correct: "migration" }),
        () => ({ before: "Amboseli National Park offers views of large elephant herds with", after: "in the background.", correct: "Mount Kilimanjaro" }),
        () => ({ before: `${name} learns that Bwindi Impenetrable Forest in Uganda is known for tracking mountain`, after: ".", correct: "gorillas" }),
        () => ({ before: "Killing wildlife illegally for their tusks, horns, or skins is called", after: ".", correct: "poaching" }),
        () => ({ before: "When elephants or other wildlife destroy nearby farms, this is called human-wildlife", after: ".", correct: "conflict" }),
        () => ({ before: "Areas run by local communities to protect wildlife while earning tourism income are called community", after: ".", correct: "conservancies" }),
        () => ({ before: "Limiting how many visitors a fragile park receives, to protect its habitats, is called controlling visitor", after: ".", correct: "numbers" }),
        () => ({ before: "Tourism that aims to protect the environment while attracting visitors is called", after: "tourism.", correct: "eco-tourism" }),
        () => ({ before: "The Serengeti National Park in Tanzania is famous for its vast open", after: "and large migrating herds.", correct: "plains" }),
        () => ({ before: "The 'Big Five' is a term for a group of especially popular wildlife species that attract", after: "to Eastern Africa.", correct: "tourists" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about wildlife and tourism in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the parks, factors, and challenges covered.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...PARKS]).slice(0, 6);
      const tokens = chosen.map((p) => ({ id: p.name, label: p.name }));
      const targets = shuffle(rng, chosen).map((p) => ({ id: p.name, label: `In ${p.country} — ${p.feature}` }));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.name] = p.name;
      return {
        kind: "click-match",
        prompt: "Match each park or reserve to its country and defining feature.",
        tokens,
        targets,
        correctMap,
        hint: "Recall which country each park is in and what it is famous for.",
        explanation: chosen.map((p) => `${p.name} is in ${p.country}, ${p.feature}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...CHALLENGE_SOLUTIONS]).slice(0, 4);
      const items = chosen.map((c, i) => ({ id: `ch${i}`, label: c.challenge }));
      const buckets = chosen.map((c, i) => ({ id: `ch${i}`, label: c.solution.charAt(0).toUpperCase() + c.solution.slice(1) }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((_, i) => (correctBucket[`ch${i}`] = `ch${i}`));
      return {
        kind: "categorize",
        prompt: "Match each challenge facing wildlife and tourism to its best solution.",
        items,
        buckets,
        correctBucket,
        hint: "Pair each specific problem with the action designed to fix it.",
        explanation: chosen.map((c) => `"${c.challenge}" is addressed by ${c.solution}.`).join(" "),
      };
    }

    // ordering — a genuine sequence for setting up a community wildlife conservancy.
    const steps = [
      { id: "s1", label: "Identify an area of land suitable for wildlife conservation" },
      { id: "s2", label: "Engage the local community and agree on how the land will be used" },
      { id: "s3", label: "Set rules for sustainable grazing, farming, and tourism activity" },
      { id: "s4", label: "Monitor wildlife numbers and habitat health" },
      { id: "s5", label: "Share tourism income with the community" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps in a sensible order for setting up a community wildlife conservancy.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "You must identify the land and involve the community before setting rules, and monitoring/revenue-sharing come after the conservancy is running.",
      explanation: `A sensible order is: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
