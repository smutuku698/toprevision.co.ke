import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_VIRTUE_PROMPTS = [
  (meaning: string) => `Which Christian work virtue means: ${meaning}?`,
  (meaning: string) => `Name the work virtue described here: ${meaning}.`,
  (meaning: string) => `This describes which Christian work virtue? ${meaning}`,
  (meaning: string) => `Identify the virtue: ${meaning}.`,
  (meaning: string) => `Which virtue fits this description? ${meaning}`,
  (meaning: string) => `Read the description and name the virtue: ${meaning}`,
];

const MATCH_PROMPTS = [
  "Match each Christian work virtue to what it means.",
  "Pair each work virtue with its correct meaning.",
  "Connect each virtue below to the description that explains it.",
  "Match each term to the meaning it fits.",
  "Link each Christian work virtue to what it involves.",
  "Match each virtue to the statement that describes it.",
];

const VIRTUES: { name: string; meaning: string }[] = [
  { name: "Diligence", meaning: "Working hard and carefully at every task, not being lazy" },
  { name: "Honesty", meaning: "Being truthful in your work and not cheating or stealing from an employer" },
  { name: "Stewardship", meaning: "Taking good care of the talents, time, and resources God has given you" },
  { name: "Perseverance", meaning: "Continuing to work hard even when a task is difficult or discouraging" },
  { name: "Cooperation", meaning: "Working well together with others as a team to achieve a shared goal" },
  { name: "Contentment", meaning: "Being satisfied with honest wages instead of coveting more through wrong means" },
];

export const christianWorkEthic: Skill = {
  id: "cre-cr-work-ethic",
  code: "CR.1",
  subjectId: "cre",
  strandId: "cre-creation",
  grade: 9,
  title: "Christian work ethics",
  description: "Match each virtue of Christian work ethics to what it means.",
  generate(rng) {
    const hint = "The Bible teaches that God worked in creating the world, so Christians are called to work with the same care and integrity.";

    if (rng() < 0.5) {
      const target = randChoice(rng, VIRTUES);
      const distractors = shuffle(rng, VIRTUES.filter((v) => v.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_VIRTUE_PROMPTS)(target.meaning),
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "grid",
        hint,
        explanation: `${target.name} — ${target.meaning.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, VIRTUES).slice(0, 4);
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
      hint,
      explanation: chosen.map((v) => `${v.name} — ${v.meaning.toLowerCase()}.`).join(" "),
    };
  },
};
