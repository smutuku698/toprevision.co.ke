import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS: { term: string; definition: string }[] = [
  { term: "Character", definition: "a person (or animal) who takes part in the action of the play" },
  { term: "Setting", definition: "the time and place where the play's events happen" },
  { term: "Dialogue", definition: "the words spoken by characters to each other" },
  { term: "Stage directions", definition: "instructions describing how actors should move, speak, or behave" },
  { term: "Scene", definition: "a section of a play that takes place in one location and time" },
];

export const playFeatures: Skill = {
  id: "il-w-play-features",
  code: "W.5",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "Cultural heritage: features of a play script",
  description: "Match play-writing terms — character, setting, dialogue, stage directions, scene — to their definitions.",
  generate(rng) {
    const hint = "Think about what a playwright must decide before writing: who is speaking, where, and how they should act.";

    if (rng() < 0.4) {
      const target = randChoice(rng, TERMS);
      const distractors = shuffle(rng, TERMS.filter((t) => t.term !== target.term)).slice(0, 3);
      const choices = shuffle(rng, [target.term, ...distractors.map((d) => d.term)]);

      return {
        kind: "multiple-choice",
        prompt: `Which term means: "${target.definition}"?`,
        choices,
        correctIndex: choices.indexOf(target.term),
        layout: "grid",
        hint,
        explanation: `${target.term} — ${target.definition}.`,
      };
    }

    const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.definition })));
    const correctMap: Record<string, string> = {};
    for (const t of TERMS) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: "Match each play-writing term to its definition.",
      tokens,
      targets,
      correctMap,
      hint,
      explanation: TERMS.map((t) => `${t.term} — ${t.definition}.`).join(" "),
    };
  },
};
