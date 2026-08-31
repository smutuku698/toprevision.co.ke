import { shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PLOT_STAGES: { id: string; label: string }[] = [
  { id: "exposition", label: "Exposition — introduces the characters and setting" },
  { id: "rising", label: "Rising action — the conflict builds and tension grows" },
  { id: "climax", label: "Climax — the turning point, the most intense moment" },
  { id: "falling", label: "Falling action — events start to settle after the climax" },
  { id: "resolution", label: "Resolution — the conflict is resolved and the story ends" },
];

const TERMS: { term: string; definition: string }[] = [
  { term: "Character", definition: "a person or animal who takes part in the story's events" },
  { term: "Setting", definition: "the time and place where the story happens" },
  { term: "Plot", definition: "the sequence of events that make up the story" },
  { term: "Conflict", definition: "the main problem or struggle the character faces" },
  { term: "Theme", definition: "the underlying message or lesson of the story" },
];

export const shortStoryFeatures: Skill = {
  id: "il-w-shortstory-features",
  code: "W.8",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "Indigenous literature: features of a short story",
  description: "Arrange the stages of a plot in order and match short-story terms to their definitions.",
  generate(rng) {
    if (rng() < 0.5) {
      const hint = "A plot builds from introducing characters, through rising conflict, to a climax, then settles toward resolution.";

      if (rng() < 0.5) {
        const ordinals = ["first", "second", "third", "fourth", "fifth and last"];
        const index = Math.floor(rng() * PLOT_STAGES.length);
        const target = PLOT_STAGES[index];
        const choices = shuffle(rng, PLOT_STAGES.map((s) => s.label));

        return {
          kind: "multiple-choice",
          prompt: `Which stage of a story's plot comes ${ordinals[index]}?`,
          choices,
          correctIndex: choices.indexOf(target.label),
          layout: "list",
          hint,
          explanation: `The plot builds in this order: ${PLOT_STAGES.map((s) => s.label).join(" → ")}.`,
        };
      }

      return {
        kind: "ordering",
        prompt: "Arrange the stages of a short story's plot in the correct order.",
        instruction: "Click the stages in order, from first to last.",
        items: shuffle(rng, PLOT_STAGES),
        correctOrder: PLOT_STAGES.map((s) => s.id),
        hint,
        explanation: `The plot builds in this order: ${PLOT_STAGES.map((s) => s.label).join(" → ")}.`,
      };
    }

    const tokens = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, TERMS.map((t) => ({ id: t.term, label: t.definition })));
    const correctMap: Record<string, string> = {};
    for (const t of TERMS) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: "Match each short-story term to its definition.",
      tokens,
      targets,
      correctMap,
      hint: "Think about what makes up a story: who is in it, where it happens, what happens, why it's hard, and what it teaches.",
      explanation: TERMS.map((t) => `${t.term} — ${t.definition}.`).join(" "),
    };
  },
};
