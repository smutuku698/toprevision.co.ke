import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const FACTORS = [
  "wide open grazing land suited to raising large herds",
  "a semi-arid or savanna climate that favours hardy beef-cattle breeds",
  "reliable access to water points for the herd",
  "a strong local and export market demand for beef",
] as const;

const CHALLENGE_SOLUTIONS = [
  { challenge: "Prolonged drought leaves cattle without enough water and pasture", solution: "digging water pans and boreholes, and keeping drought-resistant breeds", wrongSolution: "vaccinating the cattle against foot-and-mouth disease" },
  { challenge: "An outbreak of foot-and-mouth disease spreads through the herd", solution: "vaccinating cattle and improving veterinary services", wrongSolution: "building more water pans for the herd" },
  { challenge: "Poor roads make it hard to transport cattle to market", solution: "improving rural roads and market infrastructure", wrongSolution: "keeping drought-resistant breeds of cattle" },
  { challenge: "Cattle rustling and insecurity threaten herds in some areas", solution: "strengthening community policing and security patrols", wrongSolution: "improving rural roads to the market" },
] as const;

function factorMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, FACTORS);
  const wrong = ["a coastline suited to marine transport", "a dense equatorial rainforest with poor grazing", "a climate too cold for cattle to survive"];
  const place = g6SsPlace(rng);
  return {
    prompt: `Beef farming thrives in areas near ${place} that have ${correct}. Which of these is another genuine factor that favours beef farming in Eastern Africa?`,
    correct,
    wrong,
    explanation: `Beef farming needs ${correct} to succeed.`,
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
    prompt: `A beef farmer's herd faces this challenge: "${cs.challenge}." Which solution actually addresses this specific challenge?`,
    correct,
    wrong,
    explanation: `"${cs.challenge}" is best addressed by ${cs.solution} — a different solution, such as "${cs.wrongSolution}", would not fix this particular problem.`,
  };
}

export const beefFarming: Skill = {
  id: "g6-ss-res-beef-farming",
  code: "R.1",
  subjectId: "social-studies",
  strandId: "g6-ss-resources",
  grade: 6,
  title: "Beef farming in Eastern Africa",
  description: "Factors favouring beef farming, its contribution to the economy, and matching challenges to real solutions.",
  generate(rng) {
    const branch = randChoice(rng, ["factor-mc", "challenge-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "factor-mc" || branch === "challenge-mc") {
      const q = branch === "factor-mc" ? factorMc(rng) : challengeSolutionMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: branch === "factor-mc" ? "Think about land, climate, water, and market demand." : "Match the specific problem described to a solution that actually solves it.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Beef farming is best suited to areas with wide, open", after: "land.", correct: "grazing" }),
        () => ({ before: "Boran and Zebu are examples of hardy beef-cattle", after: "kept in Eastern Africa.", correct: "breeds" }),
        () => ({ before: `${name} learns that beef and hides are exported abroad, earning the country`, after: ".", correct: "foreign exchange" }),
        () => ({ before: "Beef farming provides jobs, boosting", after: "in rural areas.", correct: "employment" }),
        () => ({ before: "A serious cattle disease that farmers vaccinate against is foot-and-mouth", after: ".", correct: "disease" }),
        () => ({ before: "During a prolonged", after: ", cattle can run short of water and pasture.", correct: "drought" }),
        () => ({ before: "Poor roads make it hard to transport cattle to", after: ".", correct: "market" }),
        () => ({ before: "Stealing cattle from herders, a security challenge in some areas, is called cattle", after: ".", correct: "rustling" }),
        () => ({ before: "Digging boreholes and water pans helps beef farmers cope with", after: ".", correct: "drought" }),
        () => ({ before: "Besides meat, beef cattle also provide", after: "and skins for other industries.", correct: "hides" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about beef farming in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the factors, contributions, and challenges of beef farming.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...CHALLENGE_SOLUTIONS]).slice(0, 4);
      const tokens = chosen.map((c, i) => ({ id: `ch${i}`, label: c.challenge }));
      const targets = shuffle(rng, chosen).map((c) => ({ id: `ch${chosen.indexOf(c)}`, label: c.solution.charAt(0).toUpperCase() + c.solution.slice(1) }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`ch${i}`] = `ch${i}`));
      return {
        kind: "click-match",
        prompt: "Match each challenge facing beef farming to its best solution.",
        tokens,
        targets,
        correctMap,
        hint: "Pair the specific problem with the solution designed to fix it.",
        explanation: chosen.map((c) => `"${c.challenge}" is addressed by ${c.solution}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      // Critical-thinking branch — Core Competencies box names "Critical thinking and problem solving" for
      // this sub-strand, so this branch requires judging whether a proposed action actually fixes a stated
      // problem, not bare recall.
      const cs = randChoice(rng, CHALLENGE_SOLUTIONS);
      const otherActions = shuffle(rng, CHALLENGE_SOLUTIONS.filter((o) => o.challenge !== cs.challenge)).map((o) => o.solution);
      const actions = [
        { id: "correct", label: cs.solution.charAt(0).toUpperCase() + cs.solution.slice(1), bucket: "fixes" },
        { id: "wrong1", label: cs.wrongSolution.charAt(0).toUpperCase() + cs.wrongSolution.slice(1), bucket: "does-not-fix" },
        { id: "wrong2", label: otherActions[0].charAt(0).toUpperCase() + otherActions[0].slice(1), bucket: "does-not-fix" },
        { id: "wrong3", label: otherActions[1].charAt(0).toUpperCase() + otherActions[1].slice(1), bucket: "does-not-fix" },
      ] as const;
      const chosen = shuffle(rng, actions);
      const items = chosen.map((a) => ({ id: a.id, label: a.label }));
      const buckets = [
        { id: "fixes", label: "Actually fixes this challenge" },
        { id: "does-not-fix", label: "Does not fix this challenge" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a) => (correctBucket[a.id] = a.bucket));
      return {
        kind: "categorize",
        prompt: `A beef farmer faces this challenge: "${cs.challenge}." Sort each proposed action by whether it would actually fix this specific challenge.`,
        items,
        buckets,
        correctBucket,
        hint: "A real solution must directly address the cause of the stated problem.",
        explanation: `"${cs.challenge}" is genuinely fixed by ${cs.solution}; the other actions solve different problems, not this one.`,
      };
    }

    // ordering — the genuine value chain from rearing to sale.
    const steps = [
      { id: "s1", label: "Rear young cattle on open grazing land" },
      { id: "s2", label: "Fatten the cattle before they are ready for sale" },
      { id: "s3", label: "Transport the cattle to a market or abattoir" },
      { id: "s4", label: "Slaughter and process the beef, hides, and skins" },
      { id: "s5", label: "Sell the beef, hides, and skins to buyers" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps of the beef farming value chain in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "Cattle are reared and fattened before they are ever transported or sold.",
      explanation: `The beef value chain runs: ${steps.map((s) => s.label).join(" → ")}.`,
    };
  },
};
