import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (description: string) => [
  `Which ritual is described as: "${description}"?`,
  `"${description}" — which ritual is this?`,
  `Identify the ritual described as "${description}".`,
  `This description fits which ritual: "${description}"?`,
  `Which ritual below matches this description: "${description}"?`,
  `Name the ritual that is described as "${description}".`,
];

const MATCH_PROMPTS = [
  "Match each ritual to its description.",
  "Pair each ritual with the description that fits it.",
  "Connect each ritual below to its description.",
  "Link each ritual to the correct description.",
  "Match each ritual name to what it involves.",
  "Choose the correct description for each ritual.",
];

const RITUALS: { name: string; description: string }[] = [
  { name: "Akhand Ramayan Path", description: "A continuous, uninterrupted recitation of the entire Ramayana" },
  { name: "Kalpa Sutra Recitation", description: "The recitation of a key Jain sacred text, especially during the festival of Paryushan" },
  { name: "Akhand Path of Sri Guru Granth Sahib ji", description: "A continuous, uninterrupted reading of the entire Sri Guru Granth Sahib ji, usually over about 48 hours" },
  { name: "Katha", description: "A religious discourse or storytelling session that explains and interprets scripture" },
];

export const ritualsAndProtocols: Skill = {
  id: "hre-r-rituals-and-protocols",
  code: "R.1",
  subjectId: "hre",
  strandId: "hre-practises",
  grade: 9,
  title: "Rituals and protocols during religious activities",
  description: "Match each ritual to its description.",
  generate(rng) {
    const hint = "Each of these rituals comes from a different one of the four faith traditions covered in HRE.";

    if (rng() < 0.5) {
      const target = randChoice(rng, RITUALS);
      const distractors = shuffle(rng, RITUALS.filter((r) => r.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, DESCRIBED_MC_PROMPTS(target.description)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint,
        explanation: `${target.name} — ${target.description.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, RITUALS);
    const tokens = shuffle(rng, chosen.map((r) => ({ id: r.name, label: r.name })));
    const targets = shuffle(rng, chosen.map((r) => ({ id: r.name, label: r.description })));
    const correctMap: Record<string, string> = {};
    for (const r of chosen) correctMap[r.name] = r.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint,
      explanation: chosen.map((r) => `${r.name} — ${r.description.toLowerCase()}.`).join(" "),
    };
  },
};
