import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MODALS: { modal: string; meaning: string; sentence: string }[] = [
  { modal: "can", meaning: "ability — being able to do something now", sentence: "My sister ___ speak three languages fluently." },
  { modal: "could", meaning: "ability in the past", sentence: "When I was ten, I ___ climb that tree easily." },
  { modal: "may", meaning: "formal permission", sentence: "Visitors ___ enter the library after 8 a.m." },
  { modal: "might", meaning: "a weaker possibility — something that could happen but isn't certain", sentence: "It ___ rain later, so carry an umbrella just in case." },
  { modal: "must", meaning: "strong obligation or necessity", sentence: "All students ___ wear their uniform to school." },
  { modal: "should", meaning: "advice or a recommendation", sentence: "You ___ see a doctor about that cough." },
  { modal: "would", meaning: "a habitual action in the past", sentence: "Every Sunday, my grandmother ___ tell us folk stories by the fire." },
  { modal: "will", meaning: "a decision made at the moment of speaking, or future certainty", sentence: "Don't worry, I ___ help you carry those bags." },
  { modal: "ought to", meaning: "moral obligation, similar to 'should'", sentence: "We ___ respect our elders." },
];

export const modals: Skill = {
  id: "eng-g-modals",
  code: "G.5",
  subjectId: "english",
  strandId: "eng-grammar",
  grade: 9,
  title: "Modal verbs in context",
  description: "Choose the modal verb that matches a given meaning and completes the sentence.",
  generate(rng) {
    const hint = "Read the sentence with each choice in place — only one matches the given meaning.";

    if (rng() < 0.4) {
      const chosen = shuffle(rng, MODALS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.modal, label: m.modal })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.modal, label: m.meaning })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.modal] = m.modal;

      return {
        kind: "click-match",
        prompt: "Match each modal verb to what it shows.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((m) => `"${m.modal}" — ${m.meaning}.`).join(" "),
      };
    }

    const entry = randChoice(rng, MODALS);
    const distractorPool = MODALS.filter((m) => m.modal !== entry.modal);
    const distractors = shuffle(rng, distractorPool)
      .slice(0, 3)
      .map((d) => d.modal);
    const choices = shuffle(rng, [entry.modal, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Choose the modal verb that shows "${entry.meaning}" and completes this sentence: "${entry.sentence}"`,
      choices,
      correctIndex: choices.indexOf(entry.modal),
      layout: "row",
      hint,
      explanation: `"${entry.modal}" shows ${entry.meaning}, so the sentence reads: "${entry.sentence.replace("___", entry.modal)}"`,
    };
  },
};
