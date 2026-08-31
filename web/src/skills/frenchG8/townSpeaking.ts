import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const PREPOSITIONS: { phrase: string; meaning: string }[] = [
  { phrase: "à côté de", meaning: "next to" },
  { phrase: "en face de", meaning: "across from" },
  { phrase: "entre", meaning: "between" },
  { phrase: "près de", meaning: "near" },
  { phrase: "loin de", meaning: "far from" },
  { phrase: "derrière", meaning: "behind" },
  { phrase: "devant", meaning: "in front of" },
];

const PLACES: { word: string; meaning: string }[] = [
  { word: "la banque", meaning: "the bank" },
  { word: "la poste", meaning: "the post office" },
  { word: "le marché", meaning: "the market" },
  { word: "l'école", meaning: "the school" },
  { word: "l'hôpital", meaning: "the hospital" },
  { word: "l'église", meaning: "the church" },
  { word: "la pharmacie", meaning: "the pharmacy" },
  { word: "le parc", meaning: "the park" },
];

const DIRECTION_ITEMS: { label: string; bucket: "asking" | "giving" }[] = [
  { label: "Où est la banque, s'il vous plaît ?", bucket: "asking" },
  { label: "Excusez-moi, comment puis-je aller à la poste ?", bucket: "asking" },
  { label: "Où est la pharmacie, s'il vous plaît ?", bucket: "asking" },
  { label: "Tournez à gauche", bucket: "giving" },
  { label: "Tournez à droite", bucket: "giving" },
  { label: "Continuez tout droit", bucket: "giving" },
  { label: "Traversez la rue", bucket: "giving" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "La pharmacie est ", after: " de l'hôpital.", answer: "à côté" },
  { before: "Excusez-moi, où est la banque, s'il ", after: " plaît ?", answer: "vous" },
  { before: "", after: " à droite, puis continuez tout droit.", answer: "Tournez" },
  { before: "Le marché est ", after: " de l'école.", answer: "en face" },
  { before: "", after: " la rue pour arriver au parc.", answer: "Traversez" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Tournez à gauche,", "puis", "continuez tout droit", "."], sentence: "Tournez à gauche, puis continuez tout droit." },
  { chunks: ["Excusez-moi,", "où est la banque,", "s'il vous plaît", "?"], sentence: "Excusez-moi, où est la banque, s'il vous plaît ?" },
  { chunks: ["La poste", "est", "en face de l'église", "."], sentence: "La poste est en face de l'église." },
];

export const townSpeaking: Skill = {
  id: "g8-fr-ls-town",
  code: "LS.3",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "My town",
  description: "Ask for and give directions in French using places in town, prepositions of location, and the formal imperative.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const asking = shuffle(rng, DIRECTION_ITEMS.filter((s) => s.bucket === "asking")).slice(0, 3);
      const giving = shuffle(rng, DIRECTION_ITEMS.filter((s) => s.bucket === "giving")).slice(0, 4);
      const items = shuffle(rng, [...asking, ...giving]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.label] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each expression as Asking for directions or Giving directions (imperative).",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "asking", label: "Asking for directions" },
          { id: "giving", label: "Giving directions" },
        ],
        correctBucket,
        hint: "Questions with 'où' ask for directions; command verbs like 'Tournez' or 'Continuez' give directions.",
        explanation: `Asking: ${asking.map((f) => f.label).join(" / ")}. Giving: ${giving.map((f) => f.label).join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French sentence about directions in town.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about prepositions of location or the imperative (command) form.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about giving or asking for directions.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Direction-giving sentences often start with a command verb like 'Tournez' or 'Continuez'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const prep = randChoice(rng, PREPOSITIONS);
      const distractors = shuffle(rng, PREPOSITIONS.filter((p) => p.phrase !== prep.phrase)).slice(0, 3).map((p) => p.meaning);
      const choices = shuffle(rng, [prep.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Que veut dire "${prep.phrase}" en anglais ?`,
        choices,
        correctIndex: choices.indexOf(prep.meaning),
        layout: "list",
        hint: "Think about where one place is located relative to another.",
        explanation: `"${prep.phrase}" means "${prep.meaning}".`,
      };
    }

    const chosen = shuffle(rng, PLACES).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.word] = p.word;

    return {
      kind: "click-match",
      prompt: "Match each French place name to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Look for the article (la, le, l') to help identify the word.",
      explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
    };
  },
};
