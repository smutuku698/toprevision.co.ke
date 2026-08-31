import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

// hazard-symbol only models "toxic" (not "poisonous") — map this skill's bucket names to the
// VisualSpec's hazard vocabulary so the pictured symbol matches the substance actually being asked about.
const HAZARD_ICON: Record<"poisonous" | "flammable" | "corrosive", Extract<VisualSpec, { type: "hazard-symbol" }>["hazard"]> = {
  poisonous: "toxic",
  flammable: "flammable",
  corrosive: "corrosive",
};

const POISONOUS = [
  { name: "Pesticide", reason: "Pesticide is poisonous — it can cause serious harm if swallowed, inhaled, or absorbed through the skin." },
  { name: "Rat poison", reason: "Rat poison is poisonous — it is designed to be toxic if ingested." },
  { name: "Bleach", reason: "Bleach is poisonous if swallowed and can cause serious internal harm." },
];

const FLAMMABLE = [
  { name: "Petrol", reason: "Petrol is flammable — it catches fire very easily and must be kept away from heat and sparks." },
  { name: "Cooking gas (LPG)", reason: "Cooking gas is flammable — it can ignite explosively if it leaks near a flame." },
  { name: "Paint thinner", reason: "Paint thinner is flammable — its fumes can easily catch fire." },
];

const CORROSIVE = [
  { name: "Battery acid", reason: "Battery acid is corrosive — it can burn skin and damage materials it touches." },
  { name: "Drain cleaner", reason: "Drain cleaner is corrosive — it is strong enough to dissolve blockages and can burn skin." },
  { name: "Caustic soda", reason: "Caustic soda is corrosive — it can cause severe chemical burns on contact." },
];

export const hazardousSubstances: Skill = {
  id: "pt-f-hazardous-substances",
  code: "F.2",
  subjectId: "pre-technical",
  strandId: "pt-foundations",
  grade: 9,
  title: "Classifying hazardous substances",
  description: "Sort hazardous substances into poisonous, flammable, or corrosive.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify"] as const);

    if (branch === "identify") {
      const all = [
        ...POISONOUS.map((s) => ({ ...s, bucket: "poisonous" })),
        ...FLAMMABLE.map((s) => ({ ...s, bucket: "flammable" })),
        ...CORROSIVE.map((s) => ({ ...s, bucket: "corrosive" })),
      ];
      const correct = randChoice(rng, all);
      const distractors = shuffle(rng, all.filter((s) => s.bucket !== correct.bucket)).slice(0, 3);
      const choices = shuffle(rng, [correct.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: `Which of these substances is ${correct.bucket}?`,
        visual: { type: "hazard-symbol", hazard: HAZARD_ICON[correct.bucket as "poisonous" | "flammable" | "corrosive"] },
        choices,
        correctIndex: choices.indexOf(correct.name),
        layout: "list",
        hint: "Poisonous substances are toxic if ingested or absorbed; flammable substances catch fire easily; corrosive substances burn or dissolve materials.",
        explanation: `${correct.reason}`,
      };
    }

    const poisonous = shuffle(rng, POISONOUS).slice(0, 2);
    const flammable = shuffle(rng, FLAMMABLE).slice(0, 2);
    const corrosive = shuffle(rng, CORROSIVE).slice(0, 2);
    const items = shuffle(rng, [
      ...poisonous.map((s) => ({ id: s.name, label: s.name, bucket: "poisonous", reason: s.reason })),
      ...flammable.map((s) => ({ id: s.name, label: s.name, bucket: "flammable", reason: s.reason })),
      ...corrosive.map((s) => ({ id: s.name, label: s.name, bucket: "corrosive", reason: s.reason })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each substance into Poisonous, Flammable, or Corrosive.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "poisonous", label: "Poisonous" },
        { id: "flammable", label: "Flammable" },
        { id: "corrosive", label: "Corrosive" },
      ],
      correctBucket,
      hint: "Poisonous substances are toxic if ingested or absorbed; flammable substances catch fire easily; corrosive substances burn or dissolve materials.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
