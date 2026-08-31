import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIBED_MC_PROMPTS = (description: string) => [
  `Who is described as: "${description}"?`,
  `"${description}" — who is this describing?`,
  `Which practitioner of Gyan/Jnan Yog matches this description: "${description}"?`,
  `Identify the person described as "${description}".`,
  `This description fits which practitioner: "${description}"?`,
  `Which figure below is described as "${description}"?`,
];

const MATCH_PROMPTS = [
  "Match each practitioner of Gyan/Jnan Yog to their description.",
  "Pair each practitioner with the description that fits them.",
  "Connect each figure to their description.",
  "Link each practitioner of Gyan/Jnan Yog to the correct description.",
  "Match each name below to its description.",
  "Choose the correct description for each practitioner.",
];

const PRACTITIONERS: { name: string; description: string }[] = [
  { name: "Nachiketa", description: "A boy in the Hindu/Vedic Katha Upanishad who questioned Yama, the god of death, to gain spiritual knowledge" },
  { name: "Gautam Swami", description: "The chief disciple of Lord Mahavira in the Jain tradition, known for his deep spiritual knowledge" },
  { name: "Webu Sayadaw", description: "A renowned Buddhist meditation master from Myanmar, known for teaching mindfulness meditation" },
  { name: "Bhai Gurdas Ji", description: "A Sikh scholar and scribe who helped compile the Sri Guru Granth Sahib ji" },
];

export const gyanYog: Skill = {
  id: "hre-y-gyan-yog",
  code: "Y.1",
  subjectId: "hre",
  strandId: "hre-yog",
  grade: 9,
  title: "Practitioners of Gyan/Jnan Yog",
  description: "Match each practitioner of Gyan/Jnan Yog to their description.",
  generate(rng) {
    const hint = "Gyan/Jnan Yog is the path of knowledge, reached through hearing (sravana), thinking (manana), and meditation (nididhyasana) — one practitioner here comes from each of the four faith traditions.";

    if (rng() < 0.5) {
      const target = randChoice(rng, PRACTITIONERS);
      const distractors = shuffle(rng, PRACTITIONERS.filter((p) => p.name !== target.name)).slice(0, 3);
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

    const chosen = shuffle(rng, PRACTITIONERS);
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
      explanation: chosen.map((p) => `${p.name} — ${p.description.toLowerCase()}.`).join(" "),
    };
  },
};
