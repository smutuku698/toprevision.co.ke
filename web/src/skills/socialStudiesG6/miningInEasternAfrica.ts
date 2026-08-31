import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

interface MineralInfo {
  mineral: string;
  country: string;
  place: string;
  method: string;
}

const MINERALS: readonly MineralInfo[] = [
  { mineral: "Soda ash", country: "Kenya", place: "Lake Magadi", method: "extracted by dredging and evaporating the salty lake water to leave the soda ash behind" },
  { mineral: "Gold", country: "Tanzania", place: "the Lake Victoria goldfields", method: "extracted through shaft and open-pit mining, then processed to separate the gold" },
  { mineral: "Limestone", country: "Uganda", place: "quarries across the country", method: "extracted by quarrying rock, mainly for making cement" },
] as const;

const EFFECTS = [
  "land degradation, leaving the ground damaged and hard to reuse",
  "deforestation, as trees are cleared to make way for mining",
  "water pollution, as mining chemicals and waste enter nearby rivers or lakes",
  "dust pollution, affecting the air quality for nearby communities",
  "displacement, forcing some communities to relocate away from mining sites",
] as const;

const SOLUTIONS = [
  "land reclamation, restoring the ground after mining ends",
  "replanting vegetation on land that has been cleared for mining",
  "following regulated mining practices set by the government",
  "carrying out environmental impact assessments before mining begins",
] as const;

function mineralMc(rng: () => number): ScenarioMC {
  const m = randChoice(rng, MINERALS);
  const others = shuffle(rng, MINERALS.filter((o) => o.mineral !== m.mineral)).slice(0, 2);
  const name = g6SsName(rng);
  return {
    prompt: `${name} learns that ${m.mineral.toLowerCase()} is ${m.method}, near ${m.place} in ${m.country}. Which mineral is this?`,
    correct: m.mineral,
    wrong: others.map((o) => o.mineral),
    explanation: `${m.mineral} is mined near ${m.place} in ${m.country}, ${m.method}.`,
  };
}

function effectMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, EFFECTS);
  const wrong = ["increased forest cover around the mining site", "cleaner water in nearby rivers and lakes", "no change to the land at all"];
  return {
    prompt: "Which of these is a genuine environmental effect of mining in Eastern Africa?",
    correct: correct.charAt(0).toUpperCase() + correct.slice(1),
    wrong,
    explanation: `Mining can cause ${correct}.`,
  };
}

function solutionMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, SOLUTIONS);
  const wrong = ["abandoning mined land without any restoration", "ignoring environmental rules to mine faster", "clearing more forest to expand the mine without a plan"];
  return {
    prompt: "Which of these is a genuine solution to problems caused by mining?",
    correct: correct.charAt(0).toUpperCase() + correct.slice(1),
    wrong,
    explanation: `${correct.charAt(0).toUpperCase() + correct.slice(1)} helps reduce the harm caused by mining.`,
  };
}

export const miningInEasternAfrica: Skill = {
  id: "g6-ss-res-mining-in-eastern-africa",
  code: "R.6",
  subjectId: "social-studies",
  strandId: "g6-ss-resources",
  grade: 6,
  title: "Mining in Eastern Africa",
  description: "Soda ash in Kenya, gold in Tanzania, and limestone in Uganda — extraction methods, environmental effects, and solutions.",
  generate(rng) {
    const branch = randChoice(rng, ["mineral-mc", "effect-mc", "solution-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "mineral-mc" || branch === "effect-mc" || branch === "solution-mc") {
      const q = branch === "mineral-mc" ? mineralMc(rng) : branch === "effect-mc" ? effectMc(rng) : solutionMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Recall which mineral is mined where, and how mining affects — or can be made to protect — the environment.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Soda ash is mined at Lake Magadi in", after: ".", correct: "Kenya" }),
        () => ({ before: "Gold is mined in the Lake Victoria goldfields of", after: ".", correct: "Tanzania" }),
        () => ({ before: "Limestone, used mainly to make cement, is quarried in", after: ".", correct: "Uganda" }),
        () => ({ before: `${name} learns that soda ash is extracted by dredging and`, after: "salty lake water.", correct: "evaporating" }),
        () => ({ before: "Gold in Tanzania is extracted through shaft and open-pit", after: ".", correct: "mining" }),
        () => ({ before: "Clearing trees to make way for a mine causes", after: ".", correct: "deforestation" }),
        () => ({ before: "Mining chemicals entering nearby rivers or lakes causes water", after: ".", correct: "pollution" }),
        () => ({ before: "Restoring land after mining has ended is called land", after: ".", correct: "reclamation" }),
        () => ({ before: "A study carried out before mining begins, to check its likely effect on the environment, is called an environmental impact", after: ".", correct: "assessment" }),
        () => ({ before: "Planting new trees and grass on land cleared by mining is called", after: "vegetation.", correct: "replanting" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about mining in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall which country mines which mineral, and how mining is managed.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const tokens = MINERALS.map((m) => ({ id: m.mineral, label: `${m.mineral} — ${m.country}` }));
      const targets = shuffle(rng, [...MINERALS]).map((m) => ({ id: m.mineral, label: m.method.charAt(0).toUpperCase() + m.method.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const m of MINERALS) correctMap[m.mineral] = m.mineral;
      return {
        kind: "click-match",
        prompt: "Match each mineral and country to how it is extracted.",
        tokens,
        targets,
        correctMap,
        hint: "Keep the mineral, the country, and the extraction method correctly paired.",
        explanation: MINERALS.map((m) => `${m.mineral} in ${m.country} is ${m.method}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const effectItems = shuffle(rng, [...EFFECTS]).slice(0, 3).map((e, i) => ({ id: `e${i}`, label: e.charAt(0).toUpperCase() + e.slice(1), bucket: "effect" }));
      const solutionItems = shuffle(rng, [...SOLUTIONS]).slice(0, 3).map((s, i) => ({ id: `s${i}`, label: s.charAt(0).toUpperCase() + s.slice(1), bucket: "solution" }));
      const chosen = shuffle(rng, [...effectItems, ...solutionItems]);
      const items = chosen.map((c) => ({ id: c.id, label: c.label }));
      const buckets = [
        { id: "effect", label: "A problem caused by mining" },
        { id: "solution", label: "A solution to problems caused by mining" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a problem caused by mining or a solution to that problem.",
        items,
        buckets,
        correctBucket,
        hint: "A problem describes harm; a solution describes an action taken to reduce or fix that harm.",
        explanation: chosen.map((c) => `"${c.label}" is a ${c.bucket === "effect" ? "problem caused by mining" : "solution to problems caused by mining"}.`).join(" "),
      };
    }

    // ordering — the genuine sequence of a mining operation, from exploration to reclamation.
    const steps = [
      { id: "s1", label: "Explore the area to find where the mineral is located" },
      { id: "s2", label: "Extract the mineral from the ground" },
      { id: "s3", label: "Process the mineral to prepare it for sale" },
      { id: "s4", label: "Transport the processed mineral to buyers" },
      { id: "s5", label: "Reclaim and restore the mined land" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps of a mining operation in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "A mineral must be found and extracted before it can be processed, transported, or sold, and land is reclaimed only once mining has finished.",
      explanation: `A mining operation runs: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
