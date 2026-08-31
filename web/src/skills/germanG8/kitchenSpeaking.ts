import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const UTENSILS: { word: string; meaning: string }[] = [
  { word: "das Messer", meaning: "the knife" },
  { word: "der Löffel", meaning: "the spoon" },
  { word: "die Gabel", meaning: "the fork" },
  { word: "der Teller", meaning: "the plate" },
  { word: "der Topf", meaning: "the pot" },
  { word: "die Pfanne", meaning: "the frying pan" },
];

const IMPERATIVES: { phrase: string; meaning: string }[] = [
  { phrase: "Schneiden Sie das Gemüse!", meaning: "Cut the vegetables!" },
  { phrase: "Schälen Sie die Kartoffeln!", meaning: "Peel the potatoes!" },
  { phrase: "Mischen Sie die Zutaten gut!", meaning: "Mix the ingredients well!" },
  { phrase: "Fügen Sie Salz hinzu!", meaning: "Add salt!" },
  { phrase: "Kochen Sie den Reis zwanzig Minuten!", meaning: "Cook the rice for twenty minutes!" },
];

const DECLARATIVES: string[] = ["Ich habe Hunger.", "Ich habe Durst.", "Das Frühstück ist gut.", "Das Mittagessen ist hier."];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "", after: " Sie das Gemüse!", answer: "Schneiden" },
  { before: "Schälen Sie die ", after: "!", answer: "Kartoffeln" },
  { before: "Mischen Sie die Zutaten ", after: "!", answer: "gut" },
  { before: "Fügen Sie Salz ", after: "!", answer: "hinzu" },
  { before: "Kochen Sie den Reis zwanzig ", after: "!", answer: "Minuten" },
  { before: "Ich habe ", after: ".", answer: "Hunger" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Schneiden Sie", "das Gemüse", "!"], sentence: "Schneiden Sie das Gemüse!" },
  { chunks: ["Schälen Sie", "die Kartoffeln", "!"], sentence: "Schälen Sie die Kartoffeln!" },
  { chunks: ["Fügen Sie", "Salz", "hinzu", "!"], sentence: "Fügen Sie Salz hinzu!" },
  { chunks: ["Kochen Sie", "den Reis", "zwanzig Minuten", "!"], sentence: "Kochen Sie den Reis zwanzig Minuten!" },
];

export const kitchenSpeaking: Skill = {
  id: "g8-de-ls-kitchen",
  code: "LS.6",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "In the kitchen",
  description: "Follow and give formal imperative recipe instructions in German, noting separable-verb placement, and learn kitchen vocabulary.",
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
        prompt: "Sort each sentence as a Recipe command (imperative) or a Statement about hunger/meals (declarative).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "imperative", label: "Recipe command" },
          { id: "declarative", label: "Statement" },
        ],
        correctBucket,
        hint: "Recipe commands tell you what to do to the food and start with the verb+Sie; statements describe how you feel or what a meal is like.",
        explanation: `Commands: ${imperative.join(" / ")}. Statements: ${declarative.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German kitchen sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Recipes use the formal Sie-Form imperative; watch for separable verbs like 'hinzufügen', whose prefix moves to the end.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German recipe instruction.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Recipe instructions start directly with the command verb, and a separable prefix like 'hinzu' goes to the end.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const imp = randChoice(rng, IMPERATIVES);
      const distractors = shuffle(rng, IMPERATIVES.filter((i) => i.phrase !== imp.phrase)).slice(0, 3).map((i) => i.meaning);
      const choices = shuffle(rng, [imp.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Was bedeutet "${imp.phrase}" auf Englisch?`,
        choices,
        correctIndex: choices.indexOf(imp.meaning),
        layout: "list",
        hint: "Match the command verb (Schneiden, Schälen, Mischen, Fügen ... hinzu, Kochen) to its meaning.",
        explanation: `"${imp.phrase}" means "${imp.meaning}".`,
      };
    }

    const chosen = shuffle(rng, UTENSILS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((u) => ({ id: u.word, label: u.word })));
    const targets = shuffle(rng, chosen.map((u) => ({ id: u.word, label: u.meaning })));
    const correctMap: Record<string, string> = {};
    for (const u of chosen) correctMap[u.word] = u.word;

    return {
      kind: "click-match",
      prompt: "Match each German kitchen utensil word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Der Topf' is a pot, while 'die Pfanne' is a frying pan.",
      explanation: chosen.map((u) => `"${u.word}" means "${u.meaning}".`).join(" "),
    };
  },
};
