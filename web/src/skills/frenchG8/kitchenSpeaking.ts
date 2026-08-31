import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const WORDS: { word: string; meaning: string }[] = [
  { word: "la cuisine", meaning: "the kitchen" },
  { word: "la casserole", meaning: "the pot" },
  { word: "la poêle", meaning: "the frying pan" },
  { word: "le couteau", meaning: "the knife" },
  { word: "la cuillère", meaning: "the spoon" },
  { word: "la fourchette", meaning: "the fork" },
  { word: "l'assiette", meaning: "the plate" },
  { word: "le petit-déjeuner", meaning: "breakfast" },
  { word: "le déjeuner", meaning: "lunch" },
  { word: "le dîner", meaning: "dinner" },
];

const IMPERATIVES: { phrase: string; meaning: string }[] = [
  { phrase: "Mélangez les ingrédients", meaning: "Mix the ingredients" },
  { phrase: "Ajoutez du sel", meaning: "Add salt" },
  { phrase: "Faites cuire le riz", meaning: "Cook the rice" },
  { phrase: "Coupez les légumes", meaning: "Cut the vegetables" },
  { phrase: "Épluchez les pommes de terre", meaning: "Peel the potatoes" },
];

const DECLARATIVES: string[] = ["J'ai faim.", "J'ai soif.", "Je mange du riz et des légumes."];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " les ingrédients.", answer: "Mélangez" },
  { before: "Ajoutez du ", after: ".", answer: "sel" },
  { before: "Faites cuire le ", after: ".", answer: "riz" },
  { before: "", after: " les légumes.", answer: "Coupez" },
  { before: "Épluchez les pommes de ", after: ".", answer: "terre" },
  { before: "J'ai ", after: ", je vais boire de l'eau.", answer: "soif" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Coupez", "les légumes", "."], sentence: "Coupez les légumes." },
  { chunks: ["Ajoutez", "du sel,", "puis mélangez", "."], sentence: "Ajoutez du sel, puis mélangez." },
  { chunks: ["Épluchez", "les pommes de terre", "."], sentence: "Épluchez les pommes de terre." },
];

export const kitchenSpeaking: Skill = {
  id: "g8-fr-ls-kitchen",
  code: "LS.6",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "In the kitchen",
  description: "Follow and give imperative recipe instructions in French, and learn kitchen and mealtime vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const imperative = shuffle(rng, IMPERATIVES).slice(0, 4).map((i) => i.phrase);
      const declarative = shuffle(rng, DECLARATIVES);
      const items = shuffle(rng, [...imperative, ...declarative]);
      const correctBucket: Record<string, string> = {};
      for (const s of imperative) correctBucket[s] = "imperative";
      for (const s of declarative) correctBucket[s] = "declarative";

      return {
        kind: "categorize",
        prompt: "Sort each sentence as a Recipe command (imperative) or a Statement about hunger/food (declarative).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "imperative", label: "Recipe command" },
          { id: "declarative", label: "Statement" },
        ],
        correctBucket,
        hint: "Recipe commands tell you what to do to the food; statements describe how you feel or what you eat.",
        explanation: `Commands: ${imperative.join(" / ")}. Statements: ${declarative.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French kitchen sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Recipes use the formal imperative (vous) command form.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French recipe instruction.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Recipe instructions start directly with the command verb, no subject pronoun.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const imp = randChoice(rng, IMPERATIVES);
      const distractors = shuffle(rng, IMPERATIVES.filter((i) => i.phrase !== imp.phrase)).slice(0, 3).map((i) => i.meaning);
      const choices = shuffle(rng, [imp.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Que veut dire "${imp.phrase}" en anglais ?`,
        choices,
        correctIndex: choices.indexOf(imp.meaning),
        layout: "list",
        hint: "Match the command verb (Mélangez, Ajoutez, Faites cuire, Coupez, Épluchez) to its meaning.",
        explanation: `"${imp.phrase}" means "${imp.meaning}".`,
      };
    }

    const chosen = shuffle(rng, WORDS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
    const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
    const correctMap: Record<string, string> = {};
    for (const w of chosen) correctMap[w.word] = w.word;

    return {
      kind: "click-match",
      prompt: "Match each French kitchen or mealtime word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'La poêle' is a frying pan, while 'la casserole' is a pot.",
      explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
    };
  },
};
