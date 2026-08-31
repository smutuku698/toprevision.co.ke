import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "healthy" | "unhealthy";

const FOODS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "des légumes", meaning: "vegetables", tag: "healthy" },
  { word: "des fruits", meaning: "fruits", tag: "healthy" },
  { word: "du lait", meaning: "milk", tag: "healthy" },
  { word: "de l'eau", meaning: "water", tag: "healthy" },
  { word: "du riz", meaning: "rice", tag: "healthy" },
  { word: "du poisson", meaning: "fish", tag: "healthy" },
  { word: "des bonbons", meaning: "sweets/candy", tag: "unhealthy" },
  { word: "des chips", meaning: "crisps/chips", tag: "unhealthy" },
  { word: "du soda", meaning: "soda", tag: "unhealthy" },
  { word: "du sucre", meaning: "sugar", tag: "unhealthy" },
  { word: "des gâteaux", meaning: "cakes", tag: "unhealthy" },
  { word: "de la friture", meaning: "fried food", tag: "unhealthy" },
];

const MEALS = [
  { word: "le petit déjeuner", meaning: "breakfast" },
  { word: "le déjeuner", meaning: "lunch" },
  { word: "le dîner", meaning: "dinner" },
] as const;

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je prends le petit ", after: " le matin.", answer: "déjeuner", gloss: "Je prends le petit déjeuner le matin. — I have breakfast in the morning." },
  { before: "Je prends le ", after: " à midi.", answer: "déjeuner", gloss: "Je prends le déjeuner à midi. — I have lunch at noon." },
  { before: "Je prends le ", after: " le soir.", answer: "dîner", gloss: "Je prends le dîner le soir. — I have dinner in the evening." },
  { before: "J'aime manger des ", after: ".", answer: "légumes", gloss: "J'aime manger des légumes. — I like eating vegetables." },
  { before: "J'aime manger des ", after: ".", answer: "fruits", gloss: "J'aime manger des fruits. — I like eating fruits." },
  { before: "Je bois du ", after: ".", answer: "lait", gloss: "Je bois du lait. — I drink milk." },
  { before: "Je bois de l'", after: ".", answer: "eau", gloss: "Je bois de l'eau. — I drink water." },
  { before: "Le ", after: " n'est pas bon pour la santé.", answer: "sucre", gloss: "Le sucre n'est pas bon pour la santé. — Sugar is not good for your health." },
  { before: "Les ", after: " ne sont pas bons pour la santé.", answer: "bonbons", gloss: "Les bonbons ne sont pas bons pour la santé. — Sweets are not good for your health." },
  { before: "Le poisson est bon pour la ", after: ".", answer: "santé", gloss: "Le poisson est bon pour la santé. — Fish is good for your health." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "prends", "le", "petit", "déjeuner", "le", "matin", "."], sentence: "Je prends le petit déjeuner le matin." },
  { chunks: ["Je", "prends", "le", "déjeuner", "à", "midi", "."], sentence: "Je prends le déjeuner à midi." },
  { chunks: ["Je", "prends", "le", "dîner", "le", "soir", "."], sentence: "Je prends le dîner le soir." },
  { chunks: ["J'aime", "manger", "des", "fruits", "."], sentence: "J'aime manger des fruits." },
  { chunks: ["Le", "sucre", "n'est", "pas", "bon", "pour", "la", "santé", "."], sentence: "Le sucre n'est pas bon pour la santé." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks what meal you eat as soon as you wake up.`,
    correct: "Je prends le petit déjeuner le matin.",
    distractors: ["Je prends le déjeuner à midi.", "Je prends le dîner le soir.", "J'aime manger des fruits."],
    explanation: "'Je prends le petit déjeuner le matin' names breakfast in the morning specifically — the others name a different mealtime.",
  },
  {
    situation: (n) => `${n} asks what meal you eat around noon.`,
    correct: "Je prends le déjeuner à midi.",
    distractors: ["Je prends le petit déjeuner le matin.", "Je prends le dîner le soir.", "Je bois du lait."],
    explanation: "'Je prends le déjeuner à midi' names lunch at noon — the others name a different mealtime or a drink.",
  },
  {
    situation: (n) => `${n} asks what meal you eat once it gets dark.`,
    correct: "Je prends le dîner le soir.",
    distractors: ["Je prends le petit déjeuner le matin.", "Je prends le déjeuner à midi.", "Je mange des bonbons."],
    explanation: "'Je prends le dîner le soir' names dinner in the evening — the others name a different mealtime or a snack.",
  },
  {
    situation: (n) => `${n} asks what colourful food group you enjoy eating that keeps you healthy.`,
    correct: "J'aime manger des légumes.",
    distractors: ["J'aime manger des bonbons.", "Je bois du soda.", "J'aime manger des gâteaux."],
    explanation: "'J'aime manger des légumes' names vegetables, a healthy food — the other options name unhealthy sweet or fried options.",
  },
  {
    situation: (n) => `${n} asks what sweet drink you should avoid for your health.`,
    correct: "Le soda n'est pas bon pour la santé.",
    distractors: ["L'eau n'est pas bonne pour la santé.", "Le lait n'est pas bon pour la santé.", "Le poisson n'est pas bon pour la santé."],
    explanation: "'Le soda n'est pas bon pour la santé' correctly flags soda as unhealthy — water, milk, and fish are healthy options, not ones to avoid.",
  },
  {
    situation: (n) => `${n} asks which drink is the healthiest choice to quench your thirst.`,
    correct: "Je bois de l'eau.",
    distractors: ["Je bois du soda.", "Je bois du sucre.", "Je mange des chips."],
    explanation: "'Je bois de l'eau' names water, the healthiest drink — soda and sugar are unhealthy, and chips aren't a drink.",
  },
  {
    situation: (n) => `${n} asks which snack you should limit because it's unhealthy — crisps.`,
    correct: "Les chips ne sont pas bonnes pour la santé.",
    distractors: ["Les légumes ne sont pas bons pour la santé.", "Les fruits ne sont pas bons pour la santé.", "Le poisson n'est pas bon pour la santé."],
    explanation: "'Les chips ne sont pas bonnes pour la santé' correctly flags crisps as unhealthy — vegetables, fruits, and fish are healthy, not unhealthy.",
  },
  {
    situation: (n) => `${n} asks which protein-rich food is a healthy dinner choice.`,
    correct: "Le poisson est bon pour la santé.",
    distractors: ["Le sucre est bon pour la santé.", "Les bonbons sont bons pour la santé.", "Les gâteaux sont bons pour la santé."],
    explanation: "'Le poisson est bon pour la santé' correctly names fish as healthy — sugar, sweets, and cakes are the unhealthy options.",
  },
];

export const foodsSpeaking: Skill = {
  id: "g5-fr-ls-foods",
  code: "LS.6",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Meals and healthy eating",
  description: "Naming the three mealtimes and sorting foods and drinks into healthy and unhealthy — practiced through matching, sorting, and speaking scenarios.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const pool = [...MEALS, ...FOODS.slice(0, 6)];
      const chosen = shuffle(rng, pool).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "French word for a mealtime or food to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Mealtime words name when you eat; food words name what you eat or drink.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const healthy = shuffle(rng, FOODS.filter((p) => p.tag === "healthy")).slice(0, 4);
      const unhealthy = shuffle(rng, FOODS.filter((p) => p.tag === "unhealthy")).slice(0, 4);
      const items = shuffle(rng, [...healthy, ...unhealthy]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each food or drink as Healthy or Unhealthy"),
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "healthy", label: "Healthy" },
          { id: "unhealthy", label: "Unhealthy" },
        ],
        correctBucket,
        hint: "Fruits, vegetables, water, and fish are healthy; sweets, chips, soda, and sugar are unhealthy.",
        explanation: [...healthy, ...unhealthy]
          .map((p) => `"${p.word}" is ${p.tag === "healthy" ? "a healthy" : "an unhealthy"} choice.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the 'Je prends le petit déjeuner le matin...' pattern, or healthy/unhealthy food judgments.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about meals or food"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Je prends' is followed by the meal, then the moment of the day.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const n = name(rng);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(n)} ${speakingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which mealtime or which health judgment actually fits.",
      explanation: s.explanation,
    };
  },
};
