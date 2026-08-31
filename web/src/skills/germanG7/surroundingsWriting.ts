import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

type Tag = "person" | "item";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "der Markt", meaning: "the market", tag: "item" },
  { word: "der Marktplatz", meaning: "the marketplace", tag: "item" },
  { word: "der Stand", meaning: "the stall", tag: "item" },
  { word: "der Verkäufer", meaning: "the seller (male)", tag: "person" },
  { word: "die Verkäuferin", meaning: "the seller (female)", tag: "person" },
  { word: "der Käufer", meaning: "the buyer (male)", tag: "person" },
  { word: "die Käuferin", meaning: "the buyer (female)", tag: "person" },
  { word: "das Gemüse", meaning: "the vegetables", tag: "item" },
  { word: "das Obst", meaning: "the fruit", tag: "item" },
  { word: "der Preis", meaning: "the price", tag: "item" },
  { word: "teuer", meaning: "expensive", tag: "item" },
  { word: "billig", meaning: "cheap", tag: "item" },
  { word: "das Geld", meaning: "the money", tag: "item" },
  { word: "kaufen", meaning: "to buy", tag: "item" },
  { word: "verkaufen", meaning: "to sell", tag: "item" },
];

const SHOPPING_LIST_ITEMS = ["Tomaten", "Zwiebeln", "Kartoffeln", "Bananen", "Äpfel", "Reis", "Brot", "Milch"];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Ich gehe zum ", after: ".", answer: "Markt", gloss: "Ich gehe zum Markt. — I'm going to the market." },
  { before: "Meine Einkaufsliste hat vier ", after: ".", answer: "Artikel", gloss: "Meine Einkaufsliste hat vier Artikel. — My shopping list has four items." },
  { before: "Der ", after: " verkauft Gemüse.", answer: "Verkäufer", gloss: "Der Verkäufer verkauft Gemüse. — The seller sells vegetables." },
  { before: "Wie viel kostet das ", after: "?", answer: "Obst", gloss: "Wie viel kostet das Obst? — How much does the fruit cost?" },
  { before: "Das Gemüse ist sehr ", after: ".", answer: "teuer", gloss: "Das Gemüse ist sehr teuer. — The vegetables are very expensive." },
  { before: "Der Preis ist ", after: ".", answer: "billig", gloss: "Der Preis ist billig. — The price is cheap." },
  { before: "Ich habe nicht genug ", after: ".", answer: "Geld", gloss: "Ich habe nicht genug Geld. — I don't have enough money." },
  { before: "Ich möchte ein Kilo Tomaten ", after: ".", answer: "kaufen", gloss: "Ich möchte ein Kilo Tomaten kaufen. — I would like to buy a kilo of tomatoes." },
  { before: "Ich schreibe eine Einkaufs", after: " auf.", answer: "liste", gloss: "Ich schreibe eine Einkaufsliste auf. — I write down a shopping list." },
  { before: "Ich bezahle mit ", after: ".", answer: "Geld", gloss: "Ich bezahle mit Geld. — I pay with money." },
  { before: "Der ", after: " ist voller Verkäufer.", answer: "Markt", gloss: "Der Markt ist voller Verkäufer. — The market is full of sellers." },
  { before: "Ich habe ein Budget für ", after: ".", answer: "Lebensmittel", gloss: "Ich habe ein Budget für Lebensmittel. — I have a budget for groceries." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich gehe", "zum Markt", "."], sentence: "Ich gehe zum Markt." },
  { chunks: ["Ich schreibe", "eine Einkaufsliste", "."], sentence: "Ich schreibe eine Einkaufsliste." },
  { chunks: ["Das Gemüse", "ist", "sehr teuer", "."], sentence: "Das Gemüse ist sehr teuer." },
  { chunks: ["Ich möchte", "ein Kilo Tomaten", "kaufen", "."], sentence: "Ich möchte ein Kilo Tomaten kaufen." },
];

function shoppingListScenario(rng: () => number) {
  const budget = randInt(rng, 150, 300);
  const chosen = shuffle(rng, SHOPPING_LIST_ITEMS).slice(0, 3);
  const prices = chosen.map(() => randInt(rng, 30, 80));
  const total = prices.reduce((a, b) => a + b, 0);
  const withinBudget = total <= budget;
  const list = chosen.map((item, i) => `${item} (${prices[i]} Ksh)`).join(", ");
  const correct = withinBudget ? "Ja, die Liste passt in mein Budget." : "Nein, die Liste passt nicht in mein Budget.";
  const choices = shuffle(rng, [
    "Ja, die Liste passt in mein Budget.",
    "Nein, die Liste passt nicht in mein Budget.",
    "Ich brauche keine Einkaufsliste.",
    "Der Markt hat kein Gemüse.",
  ]);

  return {
    kind: "multiple-choice" as const,
    prompt: `Du schreibst diese Einkaufsliste: ${list}. Dein Budget ist ${budget} Ksh. Passt die Liste in dein Budget?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "Addiere zuerst alle Preise auf der Liste.",
    explanation: `Die Gesamtsumme ist ${total} Ksh (${list}). Dein Budget ist ${budget} Ksh, also ${withinBudget ? "passt die Liste" : "passt die Liste nicht"}.`,
  };
}

export const surroundingsWriting: Skill = {
  id: "g7-de-w-surroundings",
  code: "W.3",
  subjectId: "german",
  strandId: "g7-de-writing",
  grade: 7,
  title: "My surroundings: the marketplace",
  description: "Guided writing — market vocabulary and functional writing of shopping lists that fit a budget.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "list"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each written German marketplace word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'Der Verkäufer' sells, while 'der Käufer' buys.",
        explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const people = shuffle(rng, WORDS.filter((w) => w.tag === "person"));
      const items = shuffle(rng, WORDS.filter((w) => w.tag === "item")).slice(0, 4);
      const chosen = shuffle(rng, [...people, ...items]);
      const correctBucket: Record<string, string> = {};
      for (const w of chosen) correctBucket[w.word] = w.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Person at the market or a Market word/action.",
        items: chosen.map((w) => ({ id: w.word, label: w.word })),
        buckets: [
          { id: "person", label: "Person" },
          { id: "item", label: "Market word/action" },
        ],
        correctBucket,
        hint: "'Der Verkäufer', 'die Verkäuferin', 'der Käufer', and 'die Käuferin' are all people.",
        explanation: chosen.map((w) => `"${w.word}" is a ${w.tag === "person" ? "person" : "market word/action"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written German sentence about the marketplace.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Check the correct spelling of the marketplace or budgeting word.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct German sentence about the marketplace.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "German sentences usually put the verb as the second element.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return shoppingListScenario(rng);
  },
};
