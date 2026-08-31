import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const FISHING_GROUNDS = [
  { name: "the Indian Ocean coast", type: "marine" },
  { name: "Lake Victoria", type: "inland" },
  { name: "Lake Turkana", type: "inland" },
  { name: "Lake Tanganyika", type: "inland" },
  { name: "Lake Nyasa (Malawi)", type: "inland" },
  { name: "rivers such as the Tana River", type: "inland" },
] as const;

const METHODS = [
  { name: "Trawling", description: "dragging a large net behind a boat to catch fish in bulk, mainly used by larger commercial vessels" },
  { name: "Longlining", description: "setting a long fishing line with many baited hooks attached along its length" },
  { name: "Purse-seine netting", description: "encircling a school of fish with a net that is then drawn closed at the bottom like a purse" },
  { name: "Traditional dhow/canoe fishing", description: "using small boats and hand lines or basic nets, common among small-scale fishers" },
] as const;

const CHALLENGE_SOLUTIONS = [
  { challenge: "Overfishing is reducing fish stocks in the ocean", solution: "enforcing fishing quotas and closed seasons to let fish stocks recover", wrongSolution: "buying more cold-storage facilities for the fish already caught" },
  { challenge: "Illegal foreign trawlers are fishing without permission in local waters", solution: "increasing maritime patrols and enforcing fishing licences", wrongSolution: "forming fishing cooperatives among small-scale fishers" },
  { challenge: "A lack of cold storage means much of the catch spoils before reaching market", solution: "investing in cold-storage and fish-processing facilities", wrongSolution: "enforcing fishing quotas and closed seasons" },
  { challenge: "Small-scale fishers lack modern boats and equipment", solution: "forming cooperatives that access microfinance for better boats and gear", wrongSolution: "increasing maritime patrols in local waters" },
] as const;

function groundMc(rng: () => number): ScenarioMC {
  const wantMarine = rng() > 0.5;
  const pool = FISHING_GROUNDS.filter((g) => g.type === (wantMarine ? "marine" : "inland"));
  const target = randChoice(rng, pool);
  const wrongPool = FISHING_GROUNDS.filter((g) => g.type !== target.type);
  return {
    prompt: `Which of these fishing grounds is ${wantMarine ? "a marine (ocean) fishing ground" : "an inland fishing ground"}?`,
    correct: target.name.charAt(0).toUpperCase() + target.name.slice(1),
    wrong: shuffle(rng, wrongPool.map((g) => g.name.charAt(0).toUpperCase() + g.name.slice(1))).slice(0, 3),
    explanation: `${target.name} is ${target.type === "marine" ? "a marine fishing ground, part of the ocean" : "an inland fishing ground, a lake or river away from the sea"}.`,
  };
}

function methodMc(rng: () => number): ScenarioMC {
  const m = randChoice(rng, METHODS);
  const others = shuffle(rng, METHODS.filter((o) => o.name !== m.name)).slice(0, 3);
  const name = g6SsName(rng);
  return {
    prompt: `${name} watches fishers ${m.description}. Which marine fishing method is this?`,
    correct: m.name,
    wrong: others.map((o) => o.name),
    explanation: `${m.name} means ${m.description}.`,
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
    prompt: `Eastern African fishing communities face this challenge: "${cs.challenge}." Which solution actually addresses it?`,
    correct,
    wrong,
    explanation: `"${cs.challenge}" is best addressed by ${cs.solution}.`,
  };
}

export const fishingInEasternAfrica: Skill = {
  id: "g6-ss-res-fishing-in-eastern-africa",
  code: "R.2",
  subjectId: "social-studies",
  strandId: "g6-ss-resources",
  grade: 6,
  title: "Fishing in Eastern Africa",
  description: "Marine and inland fishing grounds, methods of marine fishing, and challenges facing fishing in Eastern Africa.",
  generate(rng) {
    const branch = randChoice(rng, ["ground-mc", "method-mc", "challenge-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "ground-mc" || branch === "method-mc" || branch === "challenge-mc") {
      const q = branch === "ground-mc" ? groundMc(rng) : branch === "method-mc" ? methodMc(rng) : challengeSolutionMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about whether the ground is ocean or freshwater, how the method catches fish, or which solution fixes the stated problem.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const place = g6SsPlace(rng);
      const templates = [
        () => ({ before: "Fishing grounds in the ocean, such as along the Indian Ocean coast, are called", after: "fishing grounds.", correct: "marine" }),
        () => ({ before: "Fishing grounds in lakes and rivers, such as Lake Victoria, are called", after: "fishing grounds.", correct: "inland" }),
        () => ({ before: "Dragging a large net behind a boat to catch fish in bulk is called", after: ".", correct: "trawling" }),
        () => ({ before: `A fisher near ${place} sets a fishing line with many baited hooks along its length, a method called`, after: ".", correct: "longlining" }),
        () => ({ before: "Encircling a school of fish with a net drawn closed at the bottom is called purse-seine", after: ".", correct: "netting" }),
        () => ({ before: "Small-scale fishers commonly use traditional boats such as dhows or", after: "with hand lines.", correct: "canoes" }),
        () => ({ before: "Catching too many fish, reducing stocks for the future, is called", after: ".", correct: "overfishing" }),
        () => ({ before: "A lack of cold-storage facilities means much of the catch can", after: "before reaching market.", correct: "spoil" }),
        () => ({ before: "Small-scale fishers can access better boats and equipment by forming fishing", after: ".", correct: "cooperatives" }),
        () => ({ before: "Increasing maritime patrols helps stop illegal foreign", after: "from fishing without permission.", correct: "trawlers" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about fishing in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the fishing grounds, methods, and challenges covered.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...METHODS]);
      const tokens = chosen.map((m) => ({ id: m.name, label: m.name }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.name, label: m.description.charAt(0).toUpperCase() + m.description.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.name] = m.name;
      return {
        kind: "click-match",
        prompt: "Match each marine fishing method to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the equipment used and how it catches fish.",
        explanation: chosen.map((m) => `${m.name}: ${m.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...FISHING_GROUNDS]).slice(0, 6);
      const items = chosen.map((g) => ({ id: g.name, label: g.name.charAt(0).toUpperCase() + g.name.slice(1) }));
      const buckets = [
        { id: "marine", label: "Marine (ocean) fishing ground" },
        { id: "inland", label: "Inland fishing ground" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((g) => (correctBucket[g.name] = g.type));
      return {
        kind: "categorize",
        prompt: "Sort each fishing ground as marine or inland.",
        items,
        buckets,
        correctBucket,
        hint: "Marine grounds are part of the ocean; inland grounds are lakes and rivers.",
        explanation: chosen.map((g) => `${g.name} is a ${g.type} fishing ground.`).join(" "),
      };
    }

    // ordering — the genuine value chain from catch to sale.
    const steps = [
      { id: "s1", label: "Catch the fish at sea or on the lake" },
      { id: "s2", label: "Sort the catch by type and size" },
      { id: "s3", label: "Store or preserve the fish, ideally in cold storage" },
      { id: "s4", label: "Transport the fish to market" },
      { id: "s5", label: "Sell the fish to buyers" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps of the fishing value chain in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "Fish must be caught and sorted before they can be stored, transported, or sold.",
      explanation: `The fishing value chain runs: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
