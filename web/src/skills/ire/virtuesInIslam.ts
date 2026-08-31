import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MEANING_MC_PROMPTS = (meaning: string) => [
  `Which virtue means: "${meaning}"?`,
  `Which of these virtues is defined as "${meaning}"?`,
  `"${meaning}" — which virtue is this?`,
  `Identify the virtue that means "${meaning}".`,
  `Which virtue below carries the meaning "${meaning}"?`,
  `Choose the virtue described as "${meaning}".`,
];

const MATCH_PROMPTS = [
  "Match each virtue to what it means in Islamic teaching.",
  "Pair each virtue with its meaning in Islamic teaching.",
  "Connect each virtue below to what it means.",
  "Match each virtue to the meaning that fits it.",
  "Link each virtue to its correct meaning.",
  "Choose the correct meaning for each virtue in Islam.",
];

const VIRTUES: { name: string; meaning: string }[] = [
  { name: "Modesty (Haya)", meaning: "Being modest in dress, speech, and behaviour, and avoiding arrogance" },
  { name: "Contentment (Qana'ah)", meaning: "Being satisfied with what Allah (S.W.T.) has provided, rather than always craving more" },
  { name: "Trustworthiness (Amanah)", meaning: "Being reliable, honouring promises, and safeguarding what is entrusted to you" },
];

export const virtuesInIslam: Skill = {
  id: "ire-ak-virtues",
  code: "AK.1",
  subjectId: "ire",
  strandId: "ire-akhlaq",
  grade: 9,
  title: "Virtues in Islam",
  description: "Match each virtue in Islam to what it means.",
  generate(rng) {
    const hint = "Modesty, contentment, and trustworthiness are all part of fulfilling Allah (S.W.T.)'s commandments in daily life.";

    if (rng() < 0.4) {
      const target = randChoice(rng, VIRTUES);
      const distractors = VIRTUES.filter((v) => v.name !== target.name);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MEANING_MC_PROMPTS(target.meaning)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint,
        explanation: `${target.name} — ${target.meaning.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, VIRTUES);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.name, label: v.name })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.name, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.name] = v.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint: "Modesty, contentment, and trustworthiness are all part of fulfilling Allah (S.W.T.)'s commandments in daily life.",
      explanation: chosen.map((v) => `${v.name} — ${v.meaning.toLowerCase()}.`).join(" "),
    };
  },
};
