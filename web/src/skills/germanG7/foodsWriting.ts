import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

type Tag = "food" | "shop";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "das Brot", meaning: "the bread", tag: "food" },
  { word: "die Milch", meaning: "the milk", tag: "food" },
  { word: "die Eier", meaning: "the eggs", tag: "food" },
  { word: "der Reis", meaning: "the rice", tag: "food" },
  { word: "das Fleisch", meaning: "the meat", tag: "food" },
  { word: "der Zucker", meaning: "the sugar", tag: "food" },
  { word: "das Wasser", meaning: "the water", tag: "food" },
  { word: "der Saft", meaning: "the juice", tag: "food" },
  { word: "der Fisch", meaning: "the fish", tag: "food" },
  { word: "das Salz", meaning: "the salt", tag: "food" },
  { word: "der Käse", meaning: "the cheese", tag: "food" },
  { word: "das Öl", meaning: "the oil", tag: "food" },
  { word: "die Metzgerei", meaning: "the butchery", tag: "shop" },
  { word: "der Lebensmittelladen", meaning: "the grocery store", tag: "shop" },
  { word: "der Supermarkt", meaning: "the supermarket", tag: "shop" },
];

const SHOPPING_LIST_ITEMS = [
  { name: "Reis", unit: "Kilo" },
  { name: "Milch", unit: "Liter" },
  { name: "Eier", unit: "Dutzend" },
  { name: "Zucker", unit: "Kilo" },
  { name: "Fleisch", unit: "Kilo" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Meine Einkaufsliste: ein Kilo ", after: ".", answer: "Reis", gloss: "Ein Kilo Reis. — A kilo of rice." },
  { before: "Meine Einkaufsliste: einen Liter ", after: ".", answer: "Milch", gloss: "Einen Liter Milch. — A litre of milk." },
  { before: "Meine Einkaufsliste: ein Dutzend ", after: ".", answer: "Eier", gloss: "Ein Dutzend Eier. — A dozen eggs." },
  { before: "Ich schreibe: Ich gehe zur ", after: ", um Fleisch zu kaufen.", answer: "Metzgerei", gloss: "Ich gehe zur Metzgerei, um Fleisch zu kaufen. — I go to the butchery to buy meat." },
  { before: "Der ", after: " verkauft viele Lebensmittel.", answer: "Supermarkt", gloss: "Der Supermarkt verkauft viele Lebensmittel. — The supermarket sells many groceries." },
  { before: "Auf meiner Liste steht: ", after: " zum Kochen.", answer: "Salz", gloss: "Salz zum Kochen. — Salt for cooking." },
  { before: "Ich schreibe die Frage: Wie viel kostet der ", after: "?", answer: "Käse", gloss: "Wie viel kostet der Käse? — How much does the cheese cost?" },
  { before: "Auf der Liste steht auch: ", after: " zum Trinken.", answer: "Saft", gloss: "Saft zum Trinken. — Juice to drink." },
  { before: "Wir schreiben ", after: " zum Backen auf die Liste.", answer: "Zucker", gloss: "Zucker zum Backen. — Sugar for baking." },
  { before: "Ich brauche ", after: " zum Braten.", answer: "Öl", gloss: "Öl zum Braten. — Oil for frying." },
  { before: "Ich schreibe frischen ", after: " auf die Liste.", answer: "Fisch", gloss: "Frischer Fisch. — Fresh fish." },
  { before: "Auf der Liste steht auch ", after: " zum Trinken jeden Tag.", answer: "Wasser", gloss: "Wasser zum Trinken. — Water to drink." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich schreibe:", "ein Kilo Reis", "."], sentence: "Ich schreibe: ein Kilo Reis." },
  { chunks: ["Ich gehe", "zum Supermarkt", "."], sentence: "Ich gehe zum Supermarkt." },
  { chunks: ["Wir gehen", "zur Metzgerei", "."], sentence: "Wir gehen zur Metzgerei." },
];

function listCostScenario(rng: () => number) {
  const chosen = shuffle(rng, SHOPPING_LIST_ITEMS).slice(0, 2);
  const budget = randInt(rng, 150, 350);
  const prices = chosen.map(() => randInt(rng, 50, 150));
  const total = prices.reduce((a, b) => a + b, 0);
  const withinBudget = total <= budget;
  const listText = chosen.map((c, i) => `${c.name} (${prices[i]} Ksh)`).join(", ");
  const correct = withinBudget
    ? `Ja, ich schreibe: 'Diese Liste passt in mein Budget von ${budget} Ksh.'`
    : `Nein, ich schreibe: 'Diese Liste passt nicht in mein Budget von ${budget} Ksh.'`;
  const otherAmount = withinBudget ? total - 1 : total + 1;
  const choices = shuffle(rng, [
    correct,
    withinBudget
      ? `Nein, ich schreibe: 'Diese Liste passt nicht in mein Budget von ${budget} Ksh.'`
      : `Ja, ich schreibe: 'Diese Liste passt in mein Budget von ${budget} Ksh.'`,
    `Ich schreibe: 'Die Liste kostet genau ${otherAmount} Ksh.'`,
    "Ich schreibe gar nichts über die Kosten.",
  ]);

  return {
    kind: "multiple-choice" as const,
    prompt: `Deine Einkaufsliste: ${listText}. Dein Budget ist ${budget} Ksh. Was schreibst du über deine Liste?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "Addiere zuerst alle Preise auf der Liste, bevor du entscheidest.",
    explanation: `Die Gesamtsumme ist ${total} Ksh (${listText}). Dein Budget ist ${budget} Ksh, also ${withinBudget ? "passt die Liste" : "passt die Liste nicht"}.`,
  };
}

export const foodsWriting: Skill = {
  id: "g7-de-w-foods",
  code: "W.6",
  subjectId: "german",
  strandId: "g7-de-writing",
  grade: 7,
  title: "Food and drinks: shopping for food",
  description: "Guided writing — food vocabulary and functional writing of a food shopping list that fits a budget.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "list"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS.filter((w) => w.tag === "food")).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each written German food or drink word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Watch the article: 'der/die/das' tells you the word's gender.",
        explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const food = shuffle(rng, WORDS.filter((w) => w.tag === "food")).slice(0, 5);
      const shop = shuffle(rng, WORDS.filter((w) => w.tag === "shop"));
      const items = shuffle(rng, [...food, ...shop]);
      const correctBucket: Record<string, string> = {};
      for (const w of items) correctBucket[w.word] = w.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Food/drink item or a Shop.",
        items: items.map((w) => ({ id: w.word, label: w.word })),
        buckets: [
          { id: "food", label: "Food/drink item" },
          { id: "shop", label: "Shop" },
        ],
        correctBucket,
        hint: "Shops are places you go to buy things; food/drink items are things you buy.",
        explanation: [...food, ...shop].map((w) => `"${w.word}" is a ${w.tag === "food" ? "food/drink item" : "shop"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written German sentence about food shopping.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Check the correct spelling of the food/drink item, quantity word, or shop.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct German sentence about food shopping.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "German sentences usually put the verb as the second element.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return listCostScenario(rng);
  },
};
