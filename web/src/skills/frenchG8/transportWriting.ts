import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " le bus numéro cinq pour aller au marché.", answer: "Prenez" },
  { before: "", after: " à la prochaine gare, s'il vous plaît.", answer: "Descendez" },
  { before: "", after: " dans le train avant qu'il ne parte !", answer: "Montez" },
  { before: "Je vais à l'école en ", after: " tous les jours ; j'aime faire de l'exercice.", answer: "vélo" },
  { before: "Le train ", after: " à quelle heure ce soir ?", answer: "part" },
  { before: "Nous traversons le lac en ", after: " parce qu'il n'y a pas de pont.", answer: "bateau" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Prenez", "le bus", "numéro cinq", "!"], sentence: "Prenez le bus numéro cinq !" },
  { chunks: ["Descendez", "à la prochaine gare,", "s'il vous plaît", "!"], sentence: "Descendez à la prochaine gare, s'il vous plaît !" },
  { chunks: ["Montez", "dans le train", "rapidement", "!"], sentence: "Montez dans le train rapidement !" },
  { chunks: ["Comment", "vas-tu", "à l'école", "?"], sentence: "Comment vas-tu à l'école ?" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal imperative for 'Get off at the next station!'",
    correct: "Descendez à la prochaine gare !",
    distractors: ["Descends à la prochaine gare !", "Descendez à la prochain gare !", "Descendre à la prochaine gare !"],
    explanation: "'Vous' takes the '-ez' ending ('Descendez'); 'gare' is feminine, so it needs 'prochaine', not 'prochain'.",
  },
  {
    prompt: "Choose the correct formal imperative for 'Get on the train!'",
    correct: "Montez dans le train !",
    distractors: ["Monte dans le train !", "Montez dans la train !", "Monter dans le train !"],
    explanation: "'Vous' takes the '-ez' ending ('Montez'); 'train' is masculine, so it needs 'le', not 'la'.",
  },
  {
    prompt: "Choose the correct word to complete: 'Je vais à l'école ___ vélo.' (by bike)",
    correct: "en",
    distractors: ["à", "au", "sur"],
    explanation: "Means of transport such as vélo, bus, train, voiture, and avion are introduced with 'en'.",
  },
  {
    prompt: "Choose the correctly spelled word for 'motorcycle'.",
    correct: "la moto",
    distractors: ["la motoe", "le moto", "la mottoo"],
    explanation: "The correct form is 'la moto' — feminine, short for 'motocyclette'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "la voiture", meaning: "the car" },
  { term: "le bus", meaning: "the bus" },
  { term: "le train", meaning: "the train" },
  { term: "l'avion", meaning: "the airplane" },
  { term: "le vélo", meaning: "the bicycle" },
  { term: "la moto", meaning: "the motorcycle" },
  { term: "le bateau", meaning: "the boat" },
  { term: "à pied", meaning: "on foot" },
];

export const transportWriting: Skill = {
  id: "g8-fr-w-transport",
  code: "W.9",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing about transport",
  description: "Write formal imperative transport instructions, order sentences, choose correct forms, and match transport vocabulary to its meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about transport.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Formal instructions start with the imperative verb in its '-ez' form.",
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
        hint: "Check the noun's gender and the formal 'vous' imperative ending.",
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
        prompt: "Match each French transport word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'le vélo' and 'la moto' both have two wheels, but only one has a motor.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the sentence about transport.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Picture the transport situation described and think of the word that fits.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
