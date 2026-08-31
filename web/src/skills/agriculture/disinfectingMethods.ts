import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const METHODS: { name: string; description: string }[] = [
  { name: "Sunlight", description: "exposing clothing or articles to direct sunlight, whose rays help kill germs" },
  { name: "Salting", description: "using salt to help preserve and disinfect certain items" },
  { name: "Boiling", description: "heating items in boiling water so the high heat kills germs" },
  { name: "Disinfectants", description: "using chemical cleaning agents made specifically to kill germs" },
  { name: "Ironing", description: "using the heat of an iron to kill germs on clothing after washing" },
];

const MC_PROMPTS: ((description: string) => string)[] = [
  (description) => `Which disinfecting method works by ${description}?`,
  (description) => `Which method of disinfecting relies on ${description}?`,
  (description) => `Can you name the disinfecting method that works by ${description}?`,
  (description) => `Identify the disinfecting method that involves ${description}.`,
  (description) => `Which technique for disinfecting works through ${description}?`,
  (description) => `Which method below disinfects by ${description}?`,
];

const MATCH_PROMPTS = [
  "Match each disinfecting method to how it works.",
  "Pair each disinfecting method with how it actually works.",
  "Connect each method of disinfecting to its description.",
  "Link each disinfecting method below to how it works.",
  "Match each technique to the way it disinfects.",
  "Pair each method with the description that explains how it works.",
];

export const disinfectingMethods: Skill = {
  id: "ag-h-disinfecting-methods",
  code: "H.2",
  subjectId: "agriculture-nutrition",
  strandId: "ag-hygiene",
  grade: 9,
  title: "Disinfecting clothing and household articles",
  description: "Match each disinfecting method to how it works.",
  generate(rng) {
    const hint = "Clothing and household articles can be disinfected using heat (boiling, ironing, sunlight), salt, or chemical disinfectants.";

    if (rng() < 0.5) {
      const target = randChoice(rng, METHODS);
      const distractors = shuffle(rng, METHODS.filter((m) => m.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MC_PROMPTS)(target.description),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint,
        explanation: `${target.name} — ${target.description}.`,
      };
    }

    const chosen = shuffle(rng, METHODS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((m) => ({ id: m.name, label: m.name })));
    const targets = shuffle(rng, chosen.map((m) => ({ id: m.name, label: m.description })));
    const correctMap: Record<string, string> = {};
    for (const m of chosen) correctMap[m.name] = m.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint,
      explanation: chosen.map((m) => `${m.name} — ${m.description}.`).join(" "),
    };
  },
};
