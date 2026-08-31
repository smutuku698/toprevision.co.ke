import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ROLE_MC_PROMPTS = (role: string) => [
  `Which institution: "${role}"?`,
  `Which institution plays this role: "${role}"?`,
  `"${role}" — which Muslim institution is this?`,
  `Identify the institution described as "${role}".`,
  `Which institution below has this role: "${role}"?`,
  `Name the Muslim institution whose role is "${role}".`,
];

const MATCH_PROMPTS = [
  "Match each Muslim institution to its role in preserving Islamic heritage.",
  "Pair each institution with its role in preserving Islamic heritage.",
  "Connect each Muslim institution below to its role.",
  "Match each institution to the role it plays in the community.",
  "Link each Muslim institution to its correct role.",
  "Choose the correct role for each Muslim institution.",
];

const INSTITUTIONS: { name: string; role: string }[] = [
  { name: "Mosques", role: "Places of worship and community gathering, hosting daily prayers and religious teaching" },
  { name: "Madrasa", role: "Schools that teach the Qur'an, Islamic knowledge, and Arabic to children and youth" },
  { name: "Muslim NGOs", role: "Organisations that provide charity, education, and social welfare services to communities" },
];

export const muslimInstitutions: Skill = {
  id: "ire-ih-muslim-institutions",
  code: "IH.3",
  subjectId: "ire",
  strandId: "ire-heritage",
  grade: 9,
  title: "Muslim institutions",
  description: "Match each Muslim institution to its role in the community.",
  generate(rng) {
    const hint = "Mosques, madrasa, and Muslim NGOs each play a distinct role in preserving Islamic values and serving the community.";

    if (rng() < 0.4) {
      const target = randChoice(rng, INSTITUTIONS);
      const distractors = INSTITUTIONS.filter((i) => i.name !== target.name);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, ROLE_MC_PROMPTS(target.role)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint,
        explanation: `${target.name} — ${target.role.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, INSTITUTIONS);
    const tokens = shuffle(rng, chosen.map((i) => ({ id: i.name, label: i.name })));
    const targets = shuffle(rng, chosen.map((i) => ({ id: i.name, label: i.role })));
    const correctMap: Record<string, string> = {};
    for (const i of chosen) correctMap[i.name] = i.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Mosques, madrasa, and Muslim NGOs each play a distinct role in preserving Islamic values and serving the community.",
      explanation: chosen.map((i) => `${i.name} — ${i.role.toLowerCase()}.`).join(" "),
    };
  },
};
