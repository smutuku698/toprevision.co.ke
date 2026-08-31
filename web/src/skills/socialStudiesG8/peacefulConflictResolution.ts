import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const METHODS = [
  { method: "Negotiation", meaning: "The two people in conflict talk directly to each other to reach an agreement, without any outside helper" },
  { method: "Mediation", meaning: "A neutral third party helps the two sides communicate and find their own agreement, without deciding for them" },
  { method: "Arbitration", meaning: "A neutral third party listens to both sides and then makes a binding decision that both sides must accept" },
] as const;

const SCENARIOS = [
  { situation: "Two siblings argue over whose turn it is to use the family computer and talk it out themselves until they agree on a schedule.", method: "Negotiation" },
  { situation: "Two neighbours in a land dispute ask a respected elder to sit with them and guide their discussion, without the elder deciding for them.", method: "Mediation" },
  { situation: "A dispute between two traders is taken to a tribunal, which listens to both sides and issues a ruling both must follow.", method: "Arbitration" },
  { situation: "Two classmates who fell out over a rumour sit down and talk directly until they resolve their misunderstanding.", method: "Negotiation" },
  { situation: "A community elder is invited to help two feuding families communicate calmly, without imposing a solution.", method: "Mediation" },
] as const;

const CAUSES = [
  "Disagreements over sharing household chores or resources",
  "Misunderstandings due to poor communication between family members",
  "Disputes over inheritance or property within a family",
  "Differences in opinion about parenting or discipline",
] as const;

const STRATEGIES = [
  { id: "listen", label: "Listen calmly to understand the other person's point of view" },
  { id: "express", label: "Express your own feelings using respectful, non-blaming language" },
  { id: "find-common", label: "Identify common ground or shared goals between both sides" },
  { id: "agree", label: "Agree on a fair solution and how to prevent the conflict from repeating" },
];

export const peacefulConflictResolution: Skill = {
  id: "g8-ss-pr-conflict-resolution",
  code: "PR.6",
  subjectId: "social-studies",
  strandId: "g8-ss-pr",
  grade: 8,
  title: "Peaceful conflict resolution",
  description: "Negotiation, mediation, and arbitration as methods of resolving family conflicts, situations that cause conflict, and strategies for effective communication.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify", "causes", "strategy-order"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, METHODS.map((m) => ({ id: m.method, label: m.method })));
      const targets = shuffle(rng, METHODS.map((m) => ({ id: m.method, label: m.meaning })));
      const correctMap: Record<string, string> = {};
      for (const m of METHODS) correctMap[m.method] = m.method;
      return {
        kind: "click-match",
        prompt: "Match each conflict-resolution method to its correct meaning.",
        tokens,
        targets,
        correctMap,
        hint: "The key difference is whether a third party is involved, and whether that party decides the outcome.",
        explanation: METHODS.map((m) => `${m.method}: ${m.meaning}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const s = randChoice(rng, SCENARIOS);
      const others = METHODS.map((m) => m.method).filter((m) => m !== s.method);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.method, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${s.situation} Which conflict-resolution method is being used here?`,
        choices,
        correctIndex,
        hint: "Ask: is there a third party? If so, do they decide the outcome, or just help the two sides talk?",
        explanation: `This is ${s.method}: ${s.situation}`,
      };
    }

    if (branch === "causes") {
      const chosen = shuffle(rng, [...CAUSES]).slice(0, 4);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c }));
      return {
        kind: "categorize",
        prompt: "Sort each situation into whether it is likely to lead to conflict in the family, or not.",
        items: [
          ...items,
          { id: "notconflict1", label: "Everyone in the family agreeing in advance on how chores will be shared" },
          { id: "notconflict2", label: "Family members openly discussing decisions before they are made" },
        ],
        buckets: [
          { id: "leads", label: "Likely to lead to conflict" },
          { id: "prevents", label: "Helps prevent conflict" },
        ],
        correctBucket: {
          ...Object.fromEntries(items.map((it) => [it.id, "leads"])),
          notconflict1: "prevents",
          notconflict2: "prevents",
        },
        hint: "Poor communication and unresolved disagreements lead to conflict; open discussion and clear agreements prevent it.",
        explanation: [...chosen.map((c) => `"${c}" is likely to lead to conflict.`), "Agreeing on chores in advance and discussing decisions openly both help prevent conflict."].join(" "),
      };
    }

    // strategy-order
    const items = shuffle(rng, STRATEGIES);
    return {
      kind: "ordering",
      prompt: "Arrange these steps for effective communication when resolving a family conflict in the correct order.",
      instruction: "Drag to reorder from first step to last step.",
      items,
      correctOrder: STRATEGIES.map((s) => s.id),
      hint: "You must understand the other side before expressing yourself, then look for shared ground before agreeing on a solution.",
      explanation: STRATEGIES.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
    };
  },
};
