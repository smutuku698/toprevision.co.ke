import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const VEHICLES: { word: string; meaning: string }[] = [
  { word: "la voiture", meaning: "the car" },
  { word: "le bus", meaning: "the bus" },
  { word: "le train", meaning: "the train" },
  { word: "l'avion", meaning: "the plane" },
  { word: "le vélo", meaning: "the bicycle" },
  { word: "la moto", meaning: "the motorcycle" },
  { word: "le bateau", meaning: "the boat" },
];

const IMPERATIVES: { phrase: string; meaning: string }[] = [
  { phrase: "Prenez le bus numéro 5", meaning: "Take bus number 5" },
  { phrase: "Descendez à la prochaine gare", meaning: "Get off at the next station" },
  { phrase: "Montez dans le train", meaning: "Get on the train" },
];

const DECLARATIVES: string[] = [
  "Je vais à l'école en vélo.",
  "Je vais à l'école à pied.",
  "Je vais à l'école en voiture.",
  "Je vais à l'école en bus.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " le bus numéro 5.", answer: "Prenez" },
  { before: "", after: " à la prochaine gare.", answer: "Descendez" },
  { before: "", after: " dans le train.", answer: "Montez" },
  { before: "Comment vas-tu à l'école ? — Je vais à l'école en ", after: ".", answer: "vélo" },
  { before: "Comment vas-tu à l'école ? — Je vais à l'école à ", after: ".", answer: "pied" },
  { before: "Le train part à quelle ", after: " ?", answer: "heure" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Prenez", "le bus numéro 5", "."], sentence: "Prenez le bus numéro 5." },
  { chunks: ["Descendez", "à la prochaine gare", "."], sentence: "Descendez à la prochaine gare." },
  { chunks: ["Montez", "dans le train", "."], sentence: "Montez dans le train." },
];

export const transportSpeaking: Skill = {
  id: "g8-fr-ls-transport",
  code: "LS.9",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "Transport",
  description: "Give formal imperative transport instructions in French, and name different means of transport.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const imperative = shuffle(rng, IMPERATIVES).map((i) => i.phrase);
      const declarative = shuffle(rng, DECLARATIVES).slice(0, 3);
      const items = shuffle(rng, [...imperative, ...declarative]);
      const correctBucket: Record<string, string> = {};
      for (const s of imperative) correctBucket[s] = "imperative";
      for (const s of declarative) correctBucket[s] = "declarative";

      return {
        kind: "categorize",
        prompt: "Sort each sentence as an Imperative instruction (command) or a Declarative statement (fact).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "imperative", label: "Imperative (command)" },
          { id: "declarative", label: "Declarative (statement)" },
        ],
        correctBucket,
        hint: "Instructions like 'Prenez', 'Descendez', and 'Montez' are commands with no subject pronoun.",
        explanation: `Commands: ${imperative.join(" / ")}. Statements: ${declarative.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French sentence about transport.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Transport instructions use the formal imperative (vous); everyday habits use 'en' or 'à' plus the means of transport.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French imperative sentence about transport.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Imperative sentences start directly with the command verb, no subject pronoun.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const imp = randChoice(rng, IMPERATIVES);
      const distractors = shuffle(rng, IMPERATIVES.filter((i) => i.phrase !== imp.phrase)).map((i) => i.meaning);
      const choices = shuffle(rng, [imp.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Que veut dire "${imp.phrase}" en anglais ?`,
        choices,
        correctIndex: choices.indexOf(imp.meaning),
        layout: "list",
        hint: "Match the command verb (Prenez, Descendez, Montez) to its meaning.",
        explanation: `"${imp.phrase}" means "${imp.meaning}".`,
      };
    }

    const chosen = shuffle(rng, VEHICLES).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.word })));
    const targets = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.meaning })));
    const correctMap: Record<string, string> = {};
    for (const v of chosen) correctMap[v.word] = v.word;

    return {
      kind: "click-match",
      prompt: "Match each French means of transport to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Le vélo' is a bicycle, while 'la moto' is a motorcycle.",
      explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
    };
  },
};
