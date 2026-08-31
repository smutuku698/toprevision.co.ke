import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "shop" | "quantity";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la boucherie", meaning: "the butcher shop", tag: "shop" },
  { word: "la boulangerie", meaning: "the bakery", tag: "shop" },
  { word: "l'épicerie", meaning: "the grocery shop", tag: "shop" },
  { word: "la crèmerie", meaning: "the dairy shop", tag: "shop" },
  { word: "le café", meaning: "the café", tag: "shop" },
  { word: "le restaurant", meaning: "the restaurant", tag: "shop" },
  { word: "un kilo de", meaning: "a kilo of", tag: "quantity" },
  { word: "un litre de", meaning: "a liter of", tag: "quantity" },
  { word: "un verre de", meaning: "a glass of", tag: "quantity" },
  { word: "un paquet de", meaning: "a packet of", tag: "quantity" },
  { word: "un morceau de", meaning: "a piece of", tag: "quantity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je voudrais un ", after: " de lait.", answer: "paquet", gloss: "Je voudrais un paquet de lait. — I would like a packet of milk." },
  { before: "Je voudrais un ", after: " de viande.", answer: "kilo", gloss: "Je voudrais un kilo de viande. — I would like a kilo of meat." },
  { before: "Je voudrais un ", after: " d'eau.", answer: "verre", gloss: "Je voudrais un verre d'eau. — I would like a glass of water." },
  { before: "J'achète le pain à la ", after: ".", answer: "boulangerie", gloss: "J'achète le pain à la boulangerie. — I buy bread at the bakery." },
  { before: "J'achète la viande à la ", after: ".", answer: "boucherie", gloss: "J'achète la viande à la boucherie. — I buy meat at the butcher shop." },
  { before: "Le serveur travaille au ", after: ".", answer: "restaurant", gloss: "Le serveur travaille au restaurant. — The waiter works at the restaurant." },
  { before: "Je voudrais deux ", after: ", s'il vous plaît.", answer: "pains", gloss: "Je voudrais deux pains, s'il vous plaît. — I would like two loaves of bread, please." },
  { before: "J'achète le lait à la ", after: ".", answer: "crèmerie", gloss: "J'achète le lait à la crèmerie. — I buy milk at the dairy shop." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "voudrais", "un", "paquet", "de", "lait", "."], sentence: "Je voudrais un paquet de lait." },
  { chunks: ["J'achète", "le", "pain", "à", "la", "boulangerie", "."], sentence: "J'achète le pain à la boulangerie." },
  { chunks: ["Le", "serveur", "travaille", "au", "restaurant", "."], sentence: "Le serveur travaille au restaurant." },
];

const SCENARIOS: { situation: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: "You want a loaf of bread, and you know exactly which shop bakes it fresh.",
    correct: "J'achète le pain à la boulangerie.",
    distractors: ["J'achète le pain à la boucherie.", "J'achète le pain à la crèmerie.", "J'achète le pain au café."],
    explanation: "'La boulangerie' is specifically a bakery — the others sell meat, dairy, or drinks/snacks, not bread.",
  },
  {
    situation: "You want a specific quantity of meat: exactly one kilo.",
    correct: "Je voudrais un kilo de viande.",
    distractors: ["Je voudrais un litre de viande.", "Je voudrais un verre de viande.", "Je voudrais un morceau de lait."],
    explanation: "Meat is measured in kilos ('un kilo de'), not liters or glasses, which are for liquids.",
  },
  {
    situation: "You want a specific quantity of milk: exactly one liter.",
    correct: "Je voudrais un litre de lait.",
    distractors: ["Je voudrais un kilo de lait.", "Je voudrais un paquet de viande.", "Je voudrais un morceau de lait."],
    explanation: "Milk is a liquid, measured in liters ('un litre de') — 'un kilo de' is for solids.",
  },
  {
    situation: "You want to know where a waiter works.",
    correct: "Le serveur travaille au restaurant.",
    distractors: ["Le serveur travaille à la boucherie.", "Le serveur travaille à la boulangerie.", "Le serveur travaille à l'épicerie."],
    explanation: "A 'serveur' (waiter) works at 'le restaurant' — the others are shops that sell raw food, not places with table service.",
  },
  {
    situation: "You want to buy meat, and you know exactly which shop specializes in it.",
    correct: "J'achète la viande à la boucherie.",
    distractors: ["J'achète la viande à la boulangerie.", "J'achète la viande à la crèmerie.", "J'achète la viande au café."],
    explanation: "'La boucherie' is the butcher shop, specifically for meat — the others sell bread, dairy, or drinks.",
  },
];

export const foodsSpeaking: Skill = {
  id: "g7-fr-ls-foods",
  code: "LS.6",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "Shopping for food",
  description: "Vocabulary for food shops, professions related to food, and quantities of food and drinks.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each French food-shopping word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Shop names label a place; quantity words describe an amount.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shops = shuffle(rng, WORDS.filter((p) => p.tag === "shop"));
      const quantities = shuffle(rng, WORDS.filter((p) => p.tag === "quantity")).slice(0, 4);
      const items = shuffle(rng, [...shops, ...quantities]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Food Shop or a Quantity.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "shop", label: "Food Shop" },
          { id: "quantity", label: "Quantity" },
        ],
        correctBucket,
        hint: "Shop names label a place; quantity words describe an amount of something.",
        explanation: [...shops, ...quantities]
          .map((p) => `"${p.word}" is a ${p.tag === "shop" ? "food shop" : "quantity"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about food shopping.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which shop or quantity word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about food shopping.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject and verb come first, then the item, then the location.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check that both the shop or quantity and the food item match the situation.",
      explanation: s.explanation,
    };
  },
};
