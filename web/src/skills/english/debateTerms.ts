import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TERMS: { term: string; definition: string }[] = [
  { term: "Motion", definition: "the statement or topic that a debate is about" },
  { term: "Proposer", definition: "a speaker who argues in favor of the motion" },
  { term: "Opposer", definition: "a speaker who argues against the motion" },
  { term: "Rebuttal", definition: "a response that challenges or disproves the other side's argument" },
  { term: "Point of order", definition: "an interruption used to question whether debate rules are being followed" },
  { term: "Chairperson", definition: "the person who manages the debate and keeps order" },
  { term: "Timekeeper", definition: "the person who tracks and signals how much speaking time is left" },
  { term: "Enunciation", definition: "speaking clearly so that every word can be understood" },
  { term: "Eye contact", definition: "looking at the audience while speaking to engage them" },
  { term: "Filler words", definition: "unnecessary sounds or words like 'um' and 'uh' used while thinking" },
];

export const debateTerms: Skill = {
  id: "eng-ls-debate-publicspeaking",
  code: "LS.1",
  subjectId: "english",
  strandId: "eng-listening-speaking",
  grade: 9,
  title: "Debate and public speaking terms",
  description: "Match debate and public speaking terms to their definitions.",
  generate(rng) {
    const hint = "Think about the role each person or word plays during a debate or speech.";

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

    const chosen = shuffle(rng, TERMS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.definition })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.term] = t.term;

    return {
      kind: "click-match",
      prompt: "Match each term to its correct definition.",
      tokens,
      targets,
      correctMap,
      hint: "Think about the role each person or word plays during a debate or speech.",
      explanation: chosen.map((t) => `${t.term} — ${t.definition}.`).join(" "),
    };
  },
};
