import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MEANING_MC_PROMPTS = (meaning: string) => [
  `Which Sikh Principle of Dharma means "${meaning}"?`,
  `Which of these principles is defined as "${meaning}"?`,
  `"${meaning}" — which Sikh Principle of Dharma is this?`,
  `Identify the Sikh Principle of Dharma that means "${meaning}".`,
  `Which principle below carries the meaning "${meaning}"?`,
  `Choose the Sikh Principle of Dharma described as "${meaning}".`,
];

const MATCH_PROMPTS = [
  "Match each Sikh Principle of Dharma to what it means.",
  "Pair each principle with its correct meaning.",
  "Connect each Sikh Principle of Dharma to its meaning.",
  "Link each principle below to what it means.",
  "Match each term to the meaning that fits it.",
  "Choose the correct meaning for each Sikh Principle of Dharma.",
];

const PRINCIPLES: { name: string; meaning: string }[] = [
  { name: "Daya", meaning: "Compassion — feeling and acting with kindness towards all living beings" },
  { name: "Santokh", meaning: "Satisfaction — being content with what one has instead of always wanting more" },
  { name: "Sat", meaning: "Truth — being honest in thought, word, and action" },
  { name: "Nimrata", meaning: "Humility — remaining humble rather than boastful or proud" },
  { name: "Pyaar", meaning: "Love — showing love and warmth to God and to others" },
  { name: "Naam Japnaa", meaning: "Meditating on and remembering God's name" },
  { name: "Kirat Karni", meaning: "Earning an honest livelihood through hard work" },
  { name: "Vand ke Chhakna", meaning: "Sharing what one has with others in the community" },
];

export const principlesOfDharma: Skill = {
  id: "hre-d-principles-of-dharma",
  code: "D.1",
  subjectId: "hre",
  strandId: "hre-dharma",
  grade: 9,
  title: "Sikh Principles of Dharma",
  description: "Match each Sikh Principle of Dharma to what it means.",
  generate(rng) {
    const hint = "These principles together guide a Sikh towards righteous living and spiritual uplift.";

    if (rng() < 0.5) {
      const target = randChoice(rng, PRINCIPLES);
      const distractors = shuffle(rng, PRINCIPLES.filter((p) => p.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, MEANING_MC_PROMPTS(target.meaning)),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "grid",
        hint,
        explanation: `${target.name} — ${target.meaning.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, PRINCIPLES).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.name] = p.name;

    return {
      kind: "click-match",
      prompt: randChoice(rng, MATCH_PROMPTS),
      tokens,
      targets,
      correctMap,
      hint,
      explanation: chosen.map((p) => `${p.name} — ${p.meaning.toLowerCase()}.`).join(" "),
    };
  },
};
