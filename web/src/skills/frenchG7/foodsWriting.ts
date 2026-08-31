import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "shop" | "quantity";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la boucherie", meaning: "the butcher shop", tag: "shop" },
  { word: "la boulangerie", meaning: "the bakery", tag: "shop" },
  { word: "l'épicerie", meaning: "the grocery shop", tag: "shop" },
  { word: "la crèmerie", meaning: "the dairy shop", tag: "shop" },
  { word: "un kilo de", meaning: "a kilo of", tag: "quantity" },
  { word: "un litre de", meaning: "a liter of", tag: "quantity" },
  { word: "un verre de", meaning: "a glass of", tag: "quantity" },
  { word: "un paquet de", meaning: "a packet of", tag: "quantity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je voudrais un ", after: " de lait.", answer: "paquet", gloss: "Je voudrais un paquet de lait. — I would like a packet of milk." },
  { before: "Je voudrais un ", after: " de viande.", answer: "kilo", gloss: "Je voudrais un kilo de viande. — I would like a kilo of meat." },
  { before: "J'achète le pain à la ", after: ".", answer: "boulangerie", gloss: "J'achète le pain à la boulangerie. — I buy bread at the bakery." },
  { before: "J'achète la viande à la ", after: ".", answer: "boucherie", gloss: "J'achète la viande à la boucherie. — I buy meat at the butcher shop." },
  { before: "Je voudrais deux ", after: ", s'il vous plaît.", answer: "pains", gloss: "Je voudrais deux pains, s'il vous plaît. — I would like two loaves of bread, please." },
  { before: "J'achète le lait à la ", after: ".", answer: "crèmerie", gloss: "J'achète le lait à la crèmerie. — I buy milk at the dairy shop." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "voudrais", "un", "kilo", "de", "viande", "."], sentence: "Je voudrais un kilo de viande." },
  { chunks: ["J'achète", "le", "pain", "à", "la", "boulangerie", "."], sentence: "J'achète le pain à la boulangerie." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a shopping list item for one kilo of meat.",
    correct: "un kilo de viande",
    distractors: ["un litre de viande", "un paquet de viande", "un verre de viande"],
    explanation: "Meat is measured in kilos ('un kilo de') — liters and glasses are units for liquids.",
  },
  {
    note: "You are writing a shopping list item for one liter of milk.",
    correct: "un litre de lait",
    distractors: ["un kilo de lait", "un morceau de lait", "un paquet de riz"],
    explanation: "Milk is a liquid, measured in liters ('un litre de') — 'un kilo de' is used for solids like meat.",
  },
  {
    note: "You are writing where you buy fresh bread each morning.",
    correct: "J'achète le pain à la boulangerie.",
    distractors: ["J'achète le pain à la boucherie.", "J'achète le pain à la crèmerie.", "J'achète le pain à l'épicerie."],
    explanation: "'La boulangerie' is specifically the bakery — the others sell meat, dairy, or general groceries, not fresh bread.",
  },
  {
    note: "You are writing where you buy meat for dinner.",
    correct: "J'achète la viande à la boucherie.",
    distractors: ["J'achète la viande à la boulangerie.", "J'achète la viande à la crèmerie.", "J'achète la viande à l'épicerie."],
    explanation: "'La boucherie' is the butcher shop, specifically for meat — the others sell bread, dairy, or general groceries.",
  },
];

export const foodsWriting: Skill = {
  id: "g7-fr-w-foods",
  code: "W.6",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "Shopping for food",
  description: "Guided writing of food shops and quantities — spelling and word order for a food shopping list.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French food-shopping word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Shop names label a place; quantity words describe an amount.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shops = shuffle(rng, WORDS.filter((p) => p.tag === "shop"));
      const quantities = shuffle(rng, WORDS.filter((p) => p.tag === "quantity"));
      const items = shuffle(rng, [...shops, ...quantities]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Food Shop or a Quantity.",
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
        prompt: "Fill in the missing word to complete the written sentence about food shopping.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which shop or quantity word fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about food shopping.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject and verb come first, then the item, then the location.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which written form should you use?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check whether the item is a solid (kilo) or a liquid (liter), and which shop sells it.",
      explanation: s.explanation,
    };
  },
};
