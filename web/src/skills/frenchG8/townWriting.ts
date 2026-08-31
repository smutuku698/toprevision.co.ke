import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "On y dépose et on y retire de l'argent : c'est ", after: ".", answer: "la banque" },
  { before: "On y achète des médicaments : c'est ", after: ".", answer: "la pharmacie" },
  { before: "On y achète des fruits et des légumes frais : c'est ", after: ".", answer: "le marché" },
  { before: "On y va quand on est malade : c'est ", after: ".", answer: "l'hôpital" },
  { before: "", after: " à gauche au carrefour, puis continuez tout droit.", answer: "Tournez" },
  { before: "", after: " la rue quand le feu est vert.", answer: "Traversez" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Excusez-moi,", "où est la pharmacie,", "s'il vous plaît", "?"], sentence: "Excusez-moi, où est la pharmacie, s'il vous plaît ?" },
  { chunks: ["Tournez à droite,", "puis", "continuez tout droit."], sentence: "Tournez à droite, puis continuez tout droit." },
  { chunks: ["La banque", "est", "en face de l'école."], sentence: "La banque est en face de l'école." },
  { chunks: ["Traversez la rue", "et", "le parc est devant vous."], sentence: "Traversez la rue et le parc est devant vous." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal imperative for 'Turn right!'",
    correct: "Tournez à droite",
    distractors: ["Tourne à droite", "Tournez à droit", "Tournons à droite"],
    explanation: "The formal imperative for 'vous' drops the pronoun and uses the '-ez' ending: 'Tournez à droite.'",
  },
  {
    prompt: "Which spelling correctly means 'next to'?",
    correct: "à côté de",
    distractors: ["a côte de", "à coté de", "a cote de"],
    explanation: "The correct spelling keeps both accents: 'à côté de' — grave accent on 'à', circumflex on 'ô'.",
  },
  {
    prompt: "Choose the correct formal imperative for 'Cross the street!'",
    correct: "Traversez la rue",
    distractors: ["Traverse la rue", "Traversez le rue", "Traversons la rue"],
    explanation: "'Traversez' is the formal 'vous' imperative form; 'la rue' is feminine, so 'le rue' is wrong.",
  },
  {
    prompt: "Choose the correct word to complete: 'La pharmacie est ___ la banque et le marché.' (between)",
    correct: "entre",
    distractors: ["dans", "sur", "sous"],
    explanation: "'Entre' means 'between', used as 'entre X et Y'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "à côté de", meaning: "next to" },
  { term: "en face de", meaning: "opposite / across from" },
  { term: "entre", meaning: "between" },
  { term: "près de", meaning: "near" },
  { term: "loin de", meaning: "far from" },
  { term: "derrière", meaning: "behind" },
  { term: "devant", meaning: "in front of" },
  { term: "la banque", meaning: "the bank" },
  { term: "la poste", meaning: "the post office" },
  { term: "le marché", meaning: "the market" },
  { term: "l'hôpital", meaning: "the hospital" },
  { term: "la pharmacie", meaning: "the pharmacy" },
  { term: "le parc", meaning: "the park" },
];

export const townWriting: Skill = {
  id: "g8-fr-w-town",
  code: "W.3",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing about my town",
  description: "Write about places and directions in town using formal imperatives, correct prepositions, and precise orthography.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about town or directions.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal directions often start with a command like 'Tournez' or 'Traversez'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Check the verb ending for the formal 'vous' imperative, and watch accents carefully.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each French town/direction word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'à côté de', 'en face de', and 'près de' are all prepositions of place.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the sentence about town.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Think about which place or direction word fits the description.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
