import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const FIRE_CLASSES = [
  { id: "A", label: "Class A — ordinary combustibles (wood, paper, cloth)", method: "Cool it with water or a foam extinguisher" },
  { id: "B", label: "Class B — flammable liquids (petrol, oil, paint)", method: "Smother it with foam, dry powder, or carbon dioxide (CO2) — never water" },
  { id: "C", label: "Class C — flammable gases (LPG, cooking gas)", method: "Shut off the gas supply and use a dry powder extinguisher" },
  { id: "D", label: "Class D — burning metals (magnesium, sodium)", method: "Smother it with a special dry powder made for metal fires" },
  { id: "Electrical", label: "Electrical fires — burning wiring or appliances", method: "Cut the power supply and use CO2 or dry powder — never water" },
  { id: "F", label: "Class F — cooking oils and fats", method: "Smother it with a fire blanket or wet chemical extinguisher — never water" },
] as const;

const CAUSE_ITEMS = [
  { text: "A burning cigarette left unattended near dry grass", bucket: "A" },
  { text: "A leaking petrol container placed near a naked flame", bucket: "B" },
  { text: "A cooking gas cylinder leaking near a lit stove", bucket: "C" },
  { text: "An overloaded electrical socket that overheats and sparks", bucket: "Electrical" },
  { text: "A pan of cooking oil left on a hot jiko and left to overheat", bucket: "F" },
  { text: "Dry vegetation catching fire from a lightning strike", bucket: "A" },
] as const;

const FIRE_CAUSES = [
  "Lightning strikes during a storm",
  "Volcanic eruptions and lava flows",
  "Friction between dry branches rubbing together in strong wind",
  "Spontaneous combustion of dry, decaying vegetation in hot weather",
  "Carelessly discarded lit cigarettes",
  "Unattended cooking fires or charcoal jikos",
];

const FIRE_DANGERS = [
  "Loss of human and animal life",
  "Destruction of property, crops, and homes",
  "Loss of natural habitats and biodiversity",
  "Air pollution from smoke and toxic gases",
  "Destruction of the ozone layer's protective vegetation cover",
];

const TRIANGLE_PARTS = [
  { part: "Heat", why: "Provides the energy needed to start and sustain burning" },
  { part: "Fuel", why: "The material that burns and keeps the fire supplied with energy" },
  { part: "Oxygen", why: "Combines with the fuel in the burning reaction — remove it and the fire smothers" },
] as const;

const PASS_STEPS = [
  { id: "pull", label: "Pull the safety pin out of the extinguisher handle" },
  { id: "aim", label: "Aim the nozzle at the base of the fire, not the flames" },
  { id: "squeeze", label: "Squeeze the handle to release the extinguishing agent" },
  { id: "sweep", label: "Sweep the nozzle from side to side across the base of the fire" },
];

export const classesOfFire: Skill = {
  id: "g8-sci-mec-classes-of-fire",
  code: "MEC.3",
  subjectId: "science",
  strandId: "g8-sci-mec",
  grade: 8,
  title: "Classes of fire",
  description: "Causes of fire in nature, the fire triangle, classes of fire and how to control them, and the dangers of fire.",
  generate(rng) {
    const branch = randChoice(rng, ["extinguish-match", "class-sort", "causes-dangers", "pass-order"] as const);

    if (branch === "extinguish-match") {
      const chosen = shuffle(rng, [...FIRE_CLASSES]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.method })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each class of fire to the correct way of controlling it.",
        tokens,
        targets,
        correctMap,
        hint: "Fires are controlled by breaking the fire triangle — removing heat, fuel, or oxygen. Never use water on electrical or oil fires.",
        explanation: chosen.map((f) => `${f.label}: ${f.method}.`).join(" "),
      };
    }

    if (branch === "class-sort") {
      const chosen = shuffle(rng, CAUSE_ITEMS).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => {
        const cls = FIRE_CLASSES.find((f) => f.id === b)!;
        return { id: b, label: cls.label.split(" — ")[0] };
      });
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each situation into the class of fire it would cause.",
        items,
        buckets,
        correctBucket,
        hint: "Match the burning material to its fire class: ordinary solids (A), flammable liquids (B), flammable gases (C), electrical faults, or cooking oil (F).",
        explanation: chosen
          .map((c) => `"${c.text}" is a ${FIRE_CLASSES.find((f) => f.id === c.bucket)!.label.split(" — ")[0]} situation.`)
          .join(" "),
      };
    }

    if (branch === "causes-dangers") {
      const askAbout = randChoice(rng, ["cause", "danger"] as const);
      const bank = askAbout === "cause" ? FIRE_CAUSES : FIRE_DANGERS;
      const decoyBank = askAbout === "cause" ? FIRE_DANGERS : FIRE_CAUSES;
      const correct = randChoice(rng, bank);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, decoyBank, 3);
      const prompt =
        askAbout === "cause"
          ? "Which of these is a natural or human cause of fire?"
          : "Which of these is a danger caused by uncontrolled fires?";
      return {
        kind: "multiple-choice",
        prompt,
        choices,
        correctIndex,
        hint: askAbout === "cause" ? "Causes are events that start a fire." : "Dangers are harmful results of a fire that has already started.",
        explanation:
          askAbout === "cause"
            ? `"${correct}" is a cause of fire — the other options describe harmful results of a fire, not what starts one.`
            : `"${correct}" is a danger of fire — the other options describe things that start fires, not their effects.`,
      };
    }

    // pass-order and fire-triangle role, randomly one of two ordering-style facts
    if (rng() < 0.5) {
      const items = shuffle(rng, PASS_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for correctly using a fire extinguisher (the P.A.S.S. method).",
        instruction: "Click them in order.",
        items,
        correctOrder: PASS_STEPS.map((s) => s.id),
        hint: "P.A.S.S. stands for Pull, Aim, Squeeze, Sweep.",
        explanation: PASS_STEPS.map((s) => s.label).join(" → "),
      };
    }
    const part = randChoice(rng, TRIANGLE_PARTS);
    const others = TRIANGLE_PARTS.filter((p) => p.part !== part.part);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, part.part, others.map((p) => p.part), 2);
    return {
      kind: "multiple-choice",
      prompt: `Which part of the fire triangle "${part.why.toLowerCase()}"?`,
      choices,
      correctIndex,
      hint: "The fire triangle has three sides: heat, fuel, and oxygen — remove any one and the fire goes out.",
      explanation: `${part.part}: ${part.why}.`,
    };
  },
};
