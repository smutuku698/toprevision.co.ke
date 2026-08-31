import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PURPOSES: { name: string; description: string }[] = [
  { name: "Repair", description: "joining a healthy stem onto a plant to fix a damaged part" },
  { name: "Aesthetic", description: "grafting to improve a plant's appearance, such as combining different colours or forms" },
  { name: "Rejuvenation", description: "grafting to restore vigour to an old or declining plant" },
  { name: "Improvement", description: "grafting to combine desirable qualities from two plants, such as better fruit with a hardier root system" },
];

const MC_PROMPTS: ((description: string) => string)[] = [
  (description) => `Which purpose of grafting means ${description}?`,
  (description) => `Which grafting purpose describes ${description}?`,
  (description) => `Can you name the purpose of grafting that means ${description}?`,
  (description) => `Identify the purpose of grafting that involves ${description}.`,
  (description) => `Which reason for grafting fits ${description}?`,
  (description) => `Which grafting goal below matches ${description}?`,
];

const MATCH_PROMPTS = [
  "Match each purpose of grafting to what it means.",
  "Pair each grafting purpose with its correct meaning.",
  "Connect each purpose of grafting to the description that explains it.",
  "Link each grafting purpose below to what it actually means.",
  "Match each reason for grafting to its description.",
  "Pair each grafting goal with the statement that describes it.",
];

export const graftingPurposes: Skill = {
  id: "ag-p-grafting-purposes",
  code: "P.1",
  subjectId: "agriculture-nutrition",
  strandId: "ag-production-techniques",
  grade: 9,
  title: "Purposes of grafting in plants",
  description: "Match each purpose of grafting to what it means.",
  generate(rng) {
    const hint = "Grafting can be done for repair, aesthetics, rejuvenation, or improvement of a plant.";

    if (rng() < 0.5) {
      const target = randChoice(rng, PURPOSES);
      const distractors = shuffle(rng, PURPOSES.filter((p) => p.name !== target.name)).slice(0, 3);
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

    const chosen = shuffle(rng, PURPOSES);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.description })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.name] = p.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint,
      explanation: chosen.map((p) => `${p.name} — ${p.description}.`).join(" "),
    };
  },
};
