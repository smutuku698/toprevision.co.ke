import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS: { term: string; definition: string }[] = [
  { term: "Poet", definition: "the person who writes the poem" },
  { term: "Persona", definition: "the voice or character speaking in the poem, who may be different from the poet" },
  { term: "Stanza", definition: "a group of lines forming a unit in a poem, like a paragraph" },
  { term: "Line", definition: "a single row of words in a poem" },
  { term: "Rhyme scheme", definition: "the pattern of rhyming sounds at the ends of lines" },
];

export const poetryFeatures: Skill = {
  id: "il-w-poetry-features",
  code: "W.3",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "Serving the community: features of a poem",
  description: "Match poetry terms — poet, persona, stanza, line, rhyme scheme — to their definitions.",
  generate(rng) {
    const hint = "Think about who is writing versus who is 'speaking' in the poem, and how lines and stanzas are organized.";

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
      prompt: "Match each poetry term to its definition.",
      tokens,
      targets,
      correctMap,
      hint,
      explanation: TERMS.map((t) => `${t.term} — ${t.definition}.`).join(" "),
    };
  },
};
