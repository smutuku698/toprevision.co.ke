import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type Mode = "Road" | "Railway" | "Air" | "Water";

interface ModeInfo {
  mode: Mode;
  example: string;
  challenge: string;
  solution: string;
  speedRank: number; // 1 = fastest for long distance, 4 = slowest
}

const MODES: readonly ModeInfo[] = [
  { mode: "Road", example: "the tarmac highway network connecting towns and cities", challenge: "poor road maintenance, congestion, and road crashes", solution: "improving road maintenance and enforcing traffic laws", speedRank: 3 },
  { mode: "Railway", example: "the Standard Gauge Railway (SGR) and older metre-gauge lines", challenge: "the high cost of construction and outdated infrastructure on older lines", solution: "investing in modernising railway lines and equipment", speedRank: 2 },
  { mode: "Air", example: "flights connecting major cities and tourist destinations", challenge: "the high cost of air travel, which limits how many people can use it", solution: "expanding regional airports to widen access", speedRank: 1 },
  { mode: "Water", example: "ferries on Lake Victoria and ships through the port of Mombasa", challenge: "the risk of piracy on some ocean routes and disruption from bad weather", solution: "improving maritime security and port infrastructure", speedRank: 4 },
] as const;

function modeMc(rng: () => number): ScenarioMC {
  const m = randChoice(rng, MODES);
  const others = shuffle(rng, MODES.filter((o) => o.mode !== m.mode)).slice(0, 3);
  const place = g6SsPlace(rng);
  return {
    prompt: `A traveller near ${place} uses ${m.example}. Which transport network is this?`,
    correct: m.mode,
    wrong: others.map((o) => o.mode),
    explanation: `${m.example.charAt(0).toUpperCase() + m.example.slice(1)} is part of the ${m.mode.toLowerCase()} transport network.`,
  };
}

function challengeMc(rng: () => number): ScenarioMC {
  const m = randChoice(rng, MODES);
  const others = shuffle(rng, MODES.filter((o) => o.mode !== m.mode)).slice(0, 3);
  return {
    prompt: `Which challenge is most closely associated with ${m.mode.toLowerCase()} transport in Eastern Africa?`,
    correct: m.challenge.charAt(0).toUpperCase() + m.challenge.slice(1),
    wrong: others.map((o) => o.challenge.charAt(0).toUpperCase() + o.challenge.slice(1)),
    explanation: `${m.mode} transport in Eastern Africa faces ${m.challenge}.`,
  };
}

export const transportInEasternAfrica: Skill = {
  id: "g6-ss-res-transport-in-eastern-africa",
  code: "R.4",
  subjectId: "social-studies",
  strandId: "g6-ss-resources",
  grade: 6,
  title: "Transport in Eastern Africa",
  description: "The four main transport networks — road, railway, air, and water — their challenges, and possible solutions.",
  generate(rng) {
    const branch = randChoice(rng, ["mode-mc", "challenge-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "mode-mc" || branch === "challenge-mc") {
      const q = branch === "mode-mc" ? modeMc(rng) : challengeMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about which of road, railway, air, or water transport matches the description.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Eastern Africa's four main transport networks are road, railway, air, and", after: ".", correct: "water" }),
        () => ({ before: "The Standard Gauge Railway (SGR) is part of Kenya's", after: "transport network.", correct: "railway" }),
        () => ({ before: `${name} learns that poor maintenance and congestion are common challenges facing`, after: "transport.", correct: "road" }),
        () => ({ before: "Ferries on Lake Victoria are an example of", after: "transport.", correct: "water" }),
        () => ({ before: "The high cost of tickets limits how many people can use", after: "transport.", correct: "air" }),
        () => ({ before: "A serious safety challenge facing road transport, involving vehicle collisions, is road", after: ".", correct: "crashes" }),
        () => ({ before: "Some ocean shipping routes face the risk of", after: ", a form of armed robbery at sea.", correct: "piracy" }),
        () => ({ before: "Expanding regional airports would help widen access to", after: "transport.", correct: "air" }),
        () => ({ before: "Investing in modern equipment helps solve the challenge of outdated", after: "infrastructure.", correct: "railway" }),
        () => ({ before: "Enforcing traffic laws is one way to reduce", after: "on Eastern Africa's roads.", correct: "crashes" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about transport in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the four transport modes and their specific challenges.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const tokens = MODES.map((m) => ({ id: m.mode, label: m.mode }));
      const targets = shuffle(rng, [...MODES]).map((m) => ({ id: m.mode, label: m.solution.charAt(0).toUpperCase() + m.solution.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const m of MODES) correctMap[m.mode] = m.mode;
      return {
        kind: "click-match",
        prompt: "Match each transport network to the best solution for its main challenge.",
        tokens,
        targets,
        correctMap,
        hint: "Pair each mode with the solution that fixes its specific problem.",
        explanation: MODES.map((m) => `${m.mode}: ${m.challenge} is best solved by ${m.solution}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = MODES.map((m) => ({ id: m.mode, label: m.example.charAt(0).toUpperCase() + m.example.slice(1) }));
      const buckets = MODES.map((m) => ({ id: m.mode, label: m.mode }));
      const correctBucket: Record<string, string> = {};
      for (const m of MODES) correctBucket[m.mode] = m.mode;
      return {
        kind: "categorize",
        prompt: "Sort each real-world example under the correct transport network.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the example runs on roads, rails, in the air, or on water.",
        explanation: MODES.map((m) => `${m.example.charAt(0).toUpperCase() + m.example.slice(1)} is part of the ${m.mode.toLowerCase()} network.`).join(" "),
      };
    }

    // ordering — the four modes ranked by typical speed over a long distance, a genuine comparative ranking.
    const ranked = [...MODES].sort((a, b) => a.speedRank - b.speedRank);
    return {
      kind: "ordering",
      prompt: "Arrange these transport networks from fastest to slowest for travelling a long distance across Eastern Africa.",
      items: shuffle(rng, ranked.map((m) => ({ id: m.mode, label: m.mode }))),
      correctOrder: ranked.map((m) => m.mode),
      instruction: "Fastest first, slowest last.",
      hint: "Air travel covers long distances fastest; water transport is usually the slowest for long journeys.",
      explanation: `From fastest to slowest over a long distance: ${ranked.map((m) => m.mode).join(", ")}.`,
    };
  },
};
