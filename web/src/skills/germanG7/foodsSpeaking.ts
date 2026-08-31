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

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Ich kaufe ein Kilo ", after: ".", answer: "Reis", gloss: "Ich kaufe ein Kilo Reis. — I'm buying a kilo of rice." },
  { before: "Ich brauche einen Liter ", after: ".", answer: "Milch", gloss: "Ich brauche einen Liter Milch. — I need a litre of milk." },
  { before: "Ich kaufe ein Dutzend ", after: ".", answer: "Eier", gloss: "Ich kaufe ein Dutzend Eier. — I'm buying a dozen eggs." },
  { before: "Ich gehe zur ", after: ", um Fleisch zu kaufen.", answer: "Metzgerei", gloss: "Ich gehe zur Metzgerei, um Fleisch zu kaufen. — I'm going to the butchery to buy meat." },
  { before: "Der ", after: " verkauft viele Lebensmittel.", answer: "Supermarkt", gloss: "Der Supermarkt verkauft viele Lebensmittel. — The supermarket sells many groceries." },
  { before: "Ich brauche ", after: " zum Kochen.", answer: "Salz", gloss: "Ich brauche Salz zum Kochen. — I need salt for cooking." },
  { before: "Wie viel kostet der ", after: "?", answer: "Käse", gloss: "Wie viel kostet der Käse? — How much does the cheese cost?" },
  { before: "Ich trinke gern ", after: ".", answer: "Saft", gloss: "Ich trinke gern Saft. — I like drinking juice." },
  { before: "Wir kaufen ", after: " zum Backen.", answer: "Zucker", gloss: "Wir kaufen Zucker zum Backen. — We buy sugar for baking." },
  { before: "Ich brauche ", after: " zum Braten.", answer: "Öl", gloss: "Ich brauche Öl zum Braten. — I need oil for frying." },
  { before: "Ich kaufe frischen ", after: " auf dem Markt.", answer: "Fisch", gloss: "Ich kaufe frischen Fisch auf dem Markt. — I buy fresh fish at the market." },
  { before: "Ich trinke jeden Tag ", after: ".", answer: "Wasser", gloss: "Ich trinke jeden Tag Wasser. — I drink water every day." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich kaufe", "ein Kilo Reis", "."], sentence: "Ich kaufe ein Kilo Reis." },
  { chunks: ["Ich brauche", "einen Liter Milch", "."], sentence: "Ich brauche einen Liter Milch." },
  { chunks: ["Wie viel", "kostet der Käse", "?"], sentence: "Wie viel kostet der Käse?" },
  { chunks: ["Ich gehe", "zum Supermarkt", "."], sentence: "Ich gehe zum Supermarkt." },
  { chunks: ["Ich kaufe", "ein Dutzend Eier", "."], sentence: "Ich kaufe ein Dutzend Eier." },
  { chunks: ["Wir gehen", "zur Metzgerei", "."], sentence: "Wir gehen zur Metzgerei." },
];

const FOOD_PRICES: { name: string; unit: string; min: number; max: number }[] = [
  { name: "Reis", unit: "Kilo", min: 80, max: 120 },
  { name: "Milch", unit: "Liter", min: 55, max: 75 },
  { name: "Eier", unit: "Dutzend", min: 150, max: 220 },
  { name: "Zucker", unit: "Kilo", min: 90, max: 130 },
];

function totalCostScenario(rng: () => number) {
  const food = randChoice(rng, FOOD_PRICES);
  const price = randInt(rng, food.min, food.max);
  const quantity = randInt(rng, 1, 3);
  const total = price * quantity;
  const correct = `${total} Ksh`;
  const candidates = new Set<number>();
  for (const v of [total + price, total - price, price, price * (quantity + 1), price * Math.max(quantity - 1, 1), total * 2, total + 10, Math.max(total - 10, 1)]) {
    if (v > 0 && v !== total) candidates.add(v);
  }
  const distractors = shuffle(rng, [...candidates]).slice(0, 3);
  const choices = shuffle(rng, [correct, ...distractors.map((v) => `${v} Ksh`)]);

  return {
    kind: "multiple-choice" as const,
    prompt: `Ein ${food.unit} ${food.name} kostet ${price} Ksh. Du kaufst ${quantity} ${food.unit === "Kilo" ? "Kilo" : food.unit === "Liter" ? "Liter" : "Dutzend"} ${food.name}. Wie viel kostet das insgesamt?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: `Multipliziere den Preis pro ${food.unit} mit der Menge.`,
    explanation: `${quantity} × ${price} Ksh = ${total} Ksh.`,
  };
}

export const foodsSpeaking: Skill = {
  id: "g7-de-ls-foods",
  code: "LS.6",
  subjectId: "german",
  strandId: "g7-de-listening-speaking",
  grade: 7,
  title: "Food and drinks: shopping for food",
  description: "Food and quantity vocabulary in German (Kilo, Liter, Dutzend) and shopping-situation dialogue at the butchery, grocery store, and supermarket.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "cost"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS.filter((w) => w.tag === "food")).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each German food or drink word to its English meaning.",
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
        prompt: "Sort each word as a Food/drink item or a Shop.",
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
        prompt: "Fill in the missing word to complete the German sentence about food shopping.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the food/drink item, quantity word, or shop being described.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about food shopping.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "German price questions often start with 'Wie viel'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return totalCostScenario(rng);
  },
};
