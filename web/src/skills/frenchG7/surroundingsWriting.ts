import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "shop" | "phrase";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la boucherie", meaning: "the butcher shop", tag: "shop" },
  { word: "l'épicerie", meaning: "the grocery shop", tag: "shop" },
  { word: "la boutique", meaning: "the shop", tag: "shop" },
  { word: "le marché", meaning: "the market", tag: "shop" },
  { word: "Je voudrais...", meaning: "I would like...", tag: "phrase" },
  { word: "Ça coûte combien ?", meaning: "How much does it cost?", tag: "phrase" },
  { word: "s'il vous plaît", meaning: "please", tag: "phrase" },
  { word: "merci", meaning: "thank you", tag: "phrase" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Où est la ", after: " ?", answer: "boucherie", gloss: "Où est la boucherie ? — Where is the butcher shop?" },
  { before: "Je ", after: " un kilo de riz.", answer: "voudrais", gloss: "Je voudrais un kilo de riz. — I would like a kilo of rice." },
  { before: "Ça coûte ", after: " ?", answer: "combien", gloss: "Ça coûte combien ? — How much does it cost?" },
  { before: "Un kilo de lait, ", after: " vous plaît.", answer: "s'il", gloss: "Un kilo de lait, s'il vous plaît. — A kilo of milk, please." },
  { before: "", after: " beaucoup !", answer: "Merci", gloss: "Merci beaucoup ! — Thank you very much!" },
  { before: "Ma liste : ", after: ", du lait et du pain.", answer: "riz", gloss: "My list: rice, milk, and bread." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "voudrais", "un", "kilo", "de", "riz", "."], sentence: "Je voudrais un kilo de riz." },
  { chunks: ["Ça", "coûte", "combien", "?"], sentence: "Ça coûte combien ?" },
  { chunks: ["Où", "est", "le", "marché", "?"], sentence: "Où est le marché ?" },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a shopping list and need to note that you want a kilo of rice.",
    correct: "Je voudrais un kilo de riz.",
    distractors: ["Ça coûte combien ?", "Où est le marché ?", "Merci beaucoup !"],
    explanation: "'Je voudrais un kilo de riz' correctly states an item you want to buy — the others ask a price, a location, or say thanks.",
  },
  {
    note: "You are writing a note asking a shopkeeper the price of an item before buying it.",
    correct: "Ça coûte combien ?",
    distractors: ["Je voudrais un kilo.", "Où est la boutique ?", "S'il vous plaît, merci."],
    explanation: "'Ça coûte combien ?' is the written form for asking a price — the other options make a request or ask for a location.",
  },
  {
    note: "You are writing directions for a friend, telling them where the market is located.",
    correct: "Le marché est à côté de l'épicerie.",
    distractors: ["Je voudrais aller au marché.", "Ça coûte combien au marché ?", "Le marché est fermé."],
    explanation: "'Le marché est à côté de l'épicerie' gives a location using 'à côté de' (next to) — the others don't state a location.",
  },
  {
    note: "You want to write a polite request for meat at the butcher shop.",
    correct: "Je voudrais un kilo de viande, s'il vous plaît.",
    distractors: ["Un kilo de viande coûte combien ?", "Où est la boucherie ?", "Merci pour la viande."],
    explanation: "'Je voudrais... s'il vous plaît' politely requests an item — the others ask a price, a location, or express thanks instead.",
  },
];

export const surroundingsWriting: Skill = {
  id: "g7-fr-w-surroundings",
  code: "W.3",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "The market",
  description: "Guided writing about market shops, prices, and shopping lists — spelling and word order for polite requests.",
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
        prompt: "Match each written French market word or expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Shop names label a type of store; the other phrases are things you'd write while shopping.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shops = shuffle(rng, WORDS.filter((p) => p.tag === "shop"));
      const phrases = shuffle(rng, WORDS.filter((p) => p.tag === "phrase"));
      const items = shuffle(rng, [...shops, ...phrases]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Type of Shop or a Shopping Expression.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "shop", label: "Type of Shop" },
          { id: "phrase", label: "Shopping Expression" },
        ],
        correctBucket,
        hint: "Shop names label a place; shopping expressions are things you write while shopping.",
        explanation: [...shops, ...phrases]
          .map((p) => `"${p.word}" is a ${p.tag === "shop" ? "type of shop" : "shopping expression"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about the market.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which shop, quantity, or polite word fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about the market.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Question words like 'Où' usually come first; the price question ends with 'combien'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about what this specific piece of writing needs to say.",
      explanation: s.explanation,
    };
  },
};
