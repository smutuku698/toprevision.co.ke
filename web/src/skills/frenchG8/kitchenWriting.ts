import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " les légumes en petits morceaux avec le couteau.", answer: "Coupez" },
  { before: "", after: " du sel dans la soupe pour plus de goût.", answer: "Ajoutez" },
  { before: "", after: " les pommes de terre avant de les couper.", answer: "Épluchez" },
  { before: "", after: " bien les ingrédients dans la casserole.", answer: "Mélangez" },
  { before: "J'ai ", after: ", je voudrais manger quelque chose.", answer: "faim" },
  { before: "J'ai ", after: ", je voudrais boire de l'eau.", answer: "soif" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Épluchez", "les pommes de terre", "d'abord."], sentence: "Épluchez les pommes de terre d'abord." },
  { chunks: ["Coupez", "les légumes", "en petits morceaux."], sentence: "Coupez les légumes en petits morceaux." },
  { chunks: ["Faites cuire", "le riz", "pendant vingt minutes."], sentence: "Faites cuire le riz pendant vingt minutes." },
  { chunks: ["Mélangez", "bien", "les ingrédients."], sentence: "Mélangez bien les ingrédients." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal imperative for 'Cut the vegetables!'",
    correct: "Coupez les légumes !",
    distractors: ["Coupe les légumes !", "Couper les légumes !", "Coupez le légumes !"],
    explanation: "'Vous' takes the '-ez' ending ('Coupez'); 'légumes' is masculine plural, so it needs 'les', not 'le'.",
  },
  {
    prompt: "Choose the correct formal verb form to complete: '___ du sel dans la sauce.' (add)",
    correct: "Ajoutez",
    distractors: ["Ajoute", "Ajoutons", "Ajouter"],
    explanation: "The formal imperative ending for 'vous' is '-ez': 'Ajoutez'.",
  },
  {
    prompt: "Choose the correctly spelled kitchen tool meaning 'spoon'.",
    correct: "la cuillère",
    distractors: ["la cuillere", "la quillère", "la cuilliere"],
    explanation: "The correct spelling keeps the grave accent: 'la cuillère'.",
  },
  {
    prompt: "Choose the correct formal imperative for 'Peel the potatoes!'",
    correct: "Épluchez les pommes de terre !",
    distractors: ["Épluche les pommes de terre !", "Épluchez les pomme de terre !", "Éplucher les pommes de terre !"],
    explanation: "'Vous' requires the '-ez' ending; 'pommes de terre' stays plural.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "la cuisine", meaning: "the kitchen" },
  { term: "la casserole", meaning: "the pot" },
  { term: "la poêle", meaning: "the frying pan" },
  { term: "le couteau", meaning: "the knife" },
  { term: "la cuillère", meaning: "the spoon" },
  { term: "la fourchette", meaning: "the fork" },
  { term: "l'assiette", meaning: "the plate" },
  { term: "le petit-déjeuner", meaning: "breakfast" },
  { term: "le déjeuner", meaning: "lunch" },
  { term: "le dîner", meaning: "dinner" },
];

export const kitchenWriting: Skill = {
  id: "g8-fr-w-kitchen",
  code: "W.6",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing about the kitchen",
  description: "Write formal imperative recipe instructions, order kitchen sentences, choose correct verb forms, and match kitchen vocabulary to its meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct formal recipe instruction.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Recipe instructions start with the imperative verb in its '-ez' form.",
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
        hint: "Recipe instructions use the 'vous' imperative form ending in '-ez'.",
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
        prompt: "Match each French kitchen word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'la casserole' and 'la poêle' are both cookware, but only one has a handle for frying.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the formal kitchen instruction.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Picture the cooking step described and think of the imperative verb that fits.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
