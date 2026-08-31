import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " Sie das Gemüse!", answer: "Schneiden" },
  { before: "", after: " Sie die Kartoffeln!", answer: "Schälen" },
  { before: "", after: " Sie die Zutaten gut!", answer: "Mischen" },
  { before: "", after: " Sie Salz hinzu!", answer: "Fügen" },
  { before: "Ich habe ", after: ".", answer: "Hunger" },
  { before: "Ich habe ", after: ".", answer: "Durst" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Schneiden Sie", "das Gemüse", "!"], sentence: "Schneiden Sie das Gemüse!" },
  { chunks: ["Schälen Sie", "die Kartoffeln", "!"], sentence: "Schälen Sie die Kartoffeln!" },
  { chunks: ["Fügen Sie", "Salz", "hinzu", "!"], sentence: "Fügen Sie Salz hinzu!" },
  { chunks: ["Kochen Sie", "den Reis", "zwanzig Minuten", "!"], sentence: "Kochen Sie den Reis zwanzig Minuten!" },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct formal imperative for 'Cut the vegetables!'",
    correct: "Schneiden Sie das Gemüse!",
    distractors: ["Schneide das Gemüse!", "Schneiden Sie das Gemüses!", "Sie schneiden das Gemüse!"],
    explanation: "The formal imperative is verb + 'Sie': 'Schneiden Sie ...'; 'Schneide' is the informal 'du'-form, and 'Sie schneiden' has the wrong word order for a command.",
  },
  {
    prompt: "Choose the correct placement of the separable prefix in: 'Fügen Sie Salz ___!' (add)",
    correct: "hinzu",
    distractors: ["hinzufügen", "zuhin", "fügehinzu"],
    explanation: "'Hinzufügen' is a separable verb — in the imperative, the prefix 'hinzu' detaches and moves to the end of the sentence: 'Fügen Sie Salz hinzu!'",
  },
  {
    prompt: "Choose the correct way to say 'I am hungry' in German.",
    correct: "Ich habe Hunger.",
    distractors: ["Ich bin Hunger.", "Ich habe hungrig.", "Ich habe Durst."],
    explanation: "German expresses hunger with 'haben' (to have), literally 'I have hunger' — not 'sein' (to be), which English uses.",
  },
  {
    prompt: "Choose the correctly spelled kitchen utensil meaning 'frying pan'.",
    correct: "die Pfanne",
    distractors: ["die Panne", "die Pfane", "der Pfanne"],
    explanation: "The correct spelling is 'die Pfanne' with a double 'n' — 'die Panne' (missing the 'f') actually means 'breakdown/mishap'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "das Messer", meaning: "knife" },
  { term: "der Löffel", meaning: "spoon" },
  { term: "die Gabel", meaning: "fork" },
  { term: "der Teller", meaning: "plate" },
  { term: "der Topf", meaning: "pot" },
  { term: "die Pfanne", meaning: "frying pan" },
  { term: "das Frühstück", meaning: "breakfast" },
  { term: "das Mittagessen", meaning: "lunch" },
  { term: "das Abendessen", meaning: "dinner" },
];

export const kitchenWriting: Skill = {
  id: "g8-de-w-kitchen",
  code: "W.6",
  subjectId: "german",
  strandId: "g8-de-writing",
  grade: 8,
  title: "Writing about food and the kitchen",
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
        hint: "Recipe instructions start with the imperative verb, then 'Sie'; separable prefixes go to the end.",
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
        hint: "Recipe instructions use the 'Sie' imperative, and separable-verb prefixes move to the end.",
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
        prompt: "Match each German kitchen word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'der Topf' and 'die Pfanne' are both cookware, but only one has a handle for frying.",
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
      acceptedAnswers: umlautAccepted(item.answer),
      inputMode: "text",
      hint: "Picture the cooking step described and think of the imperative verb that fits.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
