import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "shop" | "phrase";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la boucherie", meaning: "the butcher shop", tag: "shop" },
  { word: "l'épicerie", meaning: "the grocery shop", tag: "shop" },
  { word: "la boutique", meaning: "the shop", tag: "shop" },
  { word: "le marché", meaning: "the market", tag: "shop" },
  { word: "Où est... ?", meaning: "Where is...?", tag: "phrase" },
  { word: "Où se trouve... ?", meaning: "Where is... located?", tag: "phrase" },
  { word: "Je voudrais...", meaning: "I would like...", tag: "phrase" },
  { word: "Ça coûte combien ?", meaning: "How much does it cost?", tag: "phrase" },
  { word: "Ça fait combien ?", meaning: "How much is it?", tag: "phrase" },
  { word: "s'il vous plaît", meaning: "please", tag: "phrase" },
  { word: "excusez-moi", meaning: "excuse me", tag: "phrase" },
  { word: "merci", meaning: "thank you", tag: "phrase" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Où est la ", after: " ?", answer: "boucherie", gloss: "Où est la boucherie ? — Where is the butcher shop?" },
  { before: "Où se trouve le ", after: " ?", answer: "marché", gloss: "Où se trouve le marché ? — Where is the market located?" },
  { before: "Je ", after: " un kilo de viande.", answer: "voudrais", gloss: "Je voudrais un kilo de viande. — I would like a kilo of meat." },
  { before: "Ça coûte ", after: " ?", answer: "combien", gloss: "Ça coûte combien ? — How much does it cost?" },
  { before: "Excusez-", after: ", où est l'épicerie ?", answer: "moi", gloss: "Excusez-moi, où est l'épicerie ? — Excuse me, where is the grocery shop?" },
  { before: "Un kilo de riz, ", after: " vous plaît.", answer: "s'il", gloss: "Un kilo de riz, s'il vous plaît. — A kilo of rice, please." },
  { before: "", after: ", pour les prix !", answer: "Merci", gloss: "Merci, pour les prix ! — Thank you, for the prices!" },
  { before: "Ça fait ", after: " ?", answer: "combien", gloss: "Ça fait combien ? — How much is it?" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Où", "est", "la", "boucherie", "?"], sentence: "Où est la boucherie ?" },
  { chunks: ["Je", "voudrais", "un", "kilo", "de", "viande", "."], sentence: "Je voudrais un kilo de viande." },
  { chunks: ["Ça", "coûte", "combien", "?"], sentence: "Ça coûte combien ?" },
  { chunks: ["Excusez-moi,", "où", "se", "trouve", "le", "marché", "?"], sentence: "Excusez-moi, où se trouve le marché ?" },
];

const ITEMS = ["du riz", "de la viande", "du lait", "des légumes", "du pain", "des fruits"];

const SCENARIOS: { situation: (item: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (item) => `You want to politely ask a shopkeeper for ${item}.`,
    correct: "Je voudrais {item}, s'il vous plaît.",
    distractors: ["Ça coûte combien ?", "Où est la boutique ?", "Excusez-moi !"],
    explanation: "'Je voudrais... s'il vous plaît' is the polite way to request an item — the others ask for a price, a location, or just get attention.",
  },
  {
    situation: () => `You want to know the price of an item you're about to buy.`,
    correct: "Ça coûte combien ?",
    distractors: ["Je voudrais un kilo.", "Où est le marché ?", "Merci beaucoup."],
    explanation: "'Ça coûte combien ?' specifically asks the price — the others make a request, ask a location, or just thank someone.",
  },
  {
    situation: () => `You need to interrupt a stranger politely to ask them something.`,
    correct: "Excusez-moi !",
    distractors: ["Merci !", "S'il vous plaît, oui.", "Ça fait combien ?"],
    explanation: "'Excusez-moi !' is used to politely get someone's attention before asking a question.",
  },
  {
    situation: () => `You are looking for the butcher shop among the market stalls.`,
    correct: "Où est la boucherie ?",
    distractors: ["Où est l'épicerie ?", "Où est la boutique ?", "Où est le marché ?"],
    explanation: "'Où est la boucherie ?' specifically asks for the butcher shop — the other options name a different type of shop.",
  },
  {
    situation: () => `You want a general store selling many small everyday items.`,
    correct: "Où est la boutique ?",
    distractors: ["Où est la boucherie ?", "Où est l'épicerie ?", "Ça coûte combien ?"],
    explanation: "'La boutique' is a general shop — 'la boucherie' sells meat specifically, and 'l'épicerie' is a grocery shop.",
  },
  {
    situation: () => `You just received your change and want to thank the seller.`,
    correct: "Merci !",
    distractors: ["S'il vous plaît !", "Excusez-moi !", "Ça coûte combien ?"],
    explanation: "'Merci !' expresses thanks — the others make a request, get attention, or ask a price instead.",
  },
];

export const surroundingsSpeaking: Skill = {
  id: "g7-fr-ls-surroundings",
  code: "LS.3",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "The market",
  description: "Vocabulary for shops in the market, asking for locations and prices politely, and requesting items.",
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
        prompt: "Match each French market word or expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Shop names name a type of store; the other phrases are things you'd say while shopping.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const shops = shuffle(rng, WORDS.filter((p) => p.tag === "shop")).slice(0, 4);
      const phrases = shuffle(rng, WORDS.filter((p) => p.tag === "phrase")).slice(0, 4);
      const items = shuffle(rng, [...shops, ...phrases]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Type of Shop or a Shopping Expression.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "shop", label: "Type of Shop" },
          { id: "phrase", label: "Shopping Expression" },
        ],
        correctBucket,
        hint: "Shop names label a place; shopping expressions are things you say while shopping.",
        explanation: [...shops, ...phrases]
          .map((p) => `"${p.word}" is a ${p.tag === "shop" ? "type of shop" : "shopping expression"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about the market.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which shop, quantity, or polite word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about the market.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Question words like 'Où' usually come first; polite phrases like 's'il vous plaît' usually come last.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const item = randChoice(rng, ITEMS);
    const s = randChoice(rng, SCENARIOS);
    const correctText = s.correct.replace("{item}", item);
    const choices = shuffle(rng, [correctText, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(item)} What do you say?`,
      choices,
      correctIndex: choices.indexOf(correctText),
      layout: "list",
      hint: "Think about which expression actually fits this specific shopping situation.",
      explanation: s.explanation.replace("{item}", item),
    };
  },
};
