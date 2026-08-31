import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const WORDS: { word: string; meaning: string }[] = [
  { word: "l'aéroport", meaning: "the airport" },
  { word: "la gare", meaning: "the train station" },
  { word: "le passeport", meaning: "the passport" },
  { word: "le billet", meaning: "the ticket" },
  { word: "les bagages", meaning: "the luggage" },
  { word: "la valise", meaning: "the suitcase" },
  { word: "un voyage", meaning: "a trip/journey" },
];

const IMPERATIVES: { phrase: string; meaning: string }[] = [
  { phrase: "Prenez vos bagages !", meaning: "Take your luggage!" },
  { phrase: "N'oubliez pas votre passeport !", meaning: "Don't forget your passport!" },
  { phrase: "Attachez votre ceinture !", meaning: "Fasten your seatbelt!" },
  { phrase: "Présentez votre billet !", meaning: "Show your ticket!" },
];

const DECLARATIVES: string[] = [
  "Nous allons voyager en train.",
  "Nous allons voyager en avion.",
  "Nous allons voyager en bus.",
  "Nous allons voyager en voiture.",
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " vos bagages !", answer: "Prenez" },
  { before: "N'oubliez pas votre ", after: " !", answer: "passeport" },
  { before: "", after: " votre ceinture !", answer: "Attachez" },
  { before: "Présentez votre ", after: " !", answer: "billet" },
  { before: "Nous allons voyager en ", after: " pour arriver vite à l'aéroport.", answer: "voiture" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Prenez", "vos bagages", "!"], sentence: "Prenez vos bagages !" },
  { chunks: ["N'oubliez pas", "votre passeport", "!"], sentence: "N'oubliez pas votre passeport !" },
  { chunks: ["Présentez", "votre billet,", "s'il vous plaît", "!"], sentence: "Présentez votre billet, s'il vous plaît !" },
];

export const travelSpeaking: Skill = {
  id: "g8-fr-ls-travel",
  code: "LS.5",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "Travel",
  description: "Give and understand formal travel instructions in the imperative mood, and learn travel vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const imperative = shuffle(rng, IMPERATIVES).slice(0, 4).map((i) => i.phrase);
      const declarative = shuffle(rng, DECLARATIVES).slice(0, 3);
      const items = shuffle(rng, [...imperative, ...declarative]);
      const correctBucket: Record<string, string> = {};
      for (const s of imperative) correctBucket[s] = "imperative";
      for (const s of declarative) correctBucket[s] = "declarative";

      return {
        kind: "categorize",
        prompt: "Sort each sentence as an Imperative command (giving an order) or a Declarative statement (describing a fact).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "imperative", label: "Imperative (command)" },
          { id: "declarative", label: "Declarative (statement)" },
        ],
        correctBucket,
        hint: "Imperative sentences give a command and often end with '!'; declarative sentences describe a fact with a subject like 'Nous'.",
        explanation: `Imperative: ${imperative.join(" / ")}. Declarative: ${declarative.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French travel sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Travel instructions often use the formal imperative (vous) command form.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French imperative sentence about travel.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Imperative sentences start directly with the command verb, no subject pronoun.",
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
        hint: "Match the command verb (Prenez, N'oubliez pas, Attachez, Présentez) to its meaning.",
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
      prompt: "Match each French travel word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'La gare' is a train station, while 'l'aéroport' is an airport.",
      explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
    };
  },
};
