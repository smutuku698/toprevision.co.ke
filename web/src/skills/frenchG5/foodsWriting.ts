import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

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

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Je prends le petit ", after: " le matin.", answer: "déjeuner", gloss: "Je prends le petit déjeuner le matin. — I have breakfast in the morning." },
  { before: "Je prends le ", after: " à midi.", answer: "déjeuner", gloss: "Je prends le déjeuner à midi. — I have lunch at noon." },
  { before: "Je prends le ", after: " le soir.", answer: "dîner", gloss: "Je prends le dîner le soir. — I have dinner in the evening." },
  { before: "J'aime manger des ", after: ".", answer: "légumes", gloss: "J'aime manger des légumes. — I like eating vegetables." },
  { before: "Je bois de l'", after: ".", answer: "eau", gloss: "Je bois de l'eau. — I drink water." },
  { before: "Le sucre n'est pas bon pour la ", after: ".", answer: "santé", gloss: "Le sucre n'est pas bon pour la santé. — Sugar is not good for your health." },
  { before: "Les bonbons ne sont pas des aliments ", after: ".", answer: "sains", gloss: "Les bonbons ne sont pas des aliments sains. — Sweets are not healthy foods." },
  { before: "Le poisson est bon pour la ", after: ".", answer: "santé", gloss: "Le poisson est bon pour la santé. — Fish is good for your health." },
  { before: "Il faut boire beaucoup d'", after: " chaque jour.", answer: "eau", gloss: "Il faut boire beaucoup d'eau chaque jour. — You must drink a lot of water every day." },
  { before: "Je préfère les ", after: " et les légumes.", answer: "fruits", gloss: "Je préfère les fruits et les légumes. — I prefer fruits and vegetables." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "prends", "le", "petit", "déjeuner", "le", "matin", "."], sentence: "Je prends le petit déjeuner le matin." },
  { chunks: ["J'aime", "manger", "des", "légumes", "."], sentence: "J'aime manger des légumes." },
  { chunks: ["Le", "sucre", "n'est", "pas", "bon", "pour", "la", "santé", "."], sentence: "Le sucre n'est pas bon pour la santé." },
  { chunks: ["Il", "faut", "boire", "beaucoup", "d'eau", "."], sentence: "Il faut boire beaucoup d'eau." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a diary entry about the meal you eat as soon as you wake up.",
    correct: "Je prends le petit déjeuner le matin.",
    distractors: ["Je prends le déjeuner à midi.", "Je prends le dîner le soir.", "Je mange des bonbons le matin."],
    explanation: "'Je prends le petit déjeuner le matin' names breakfast in the morning specifically — the others name a different mealtime or an unhealthy snack.",
  },
  {
    note: "You are writing a food journal listing what you eat at noon.",
    correct: "Je prends le déjeuner à midi.",
    distractors: ["Je prends le petit déjeuner le matin.", "Je prends le dîner le soir.", "Je bois du lait à midi."],
    explanation: "'Je prends le déjeuner à midi' names lunch at noon — the others name a different mealtime or just a drink.",
  },
  {
    note: "You are filling in a form about your evening meal.",
    correct: "Je prends le dîner le soir.",
    distractors: ["Je prends le petit déjeuner le soir.", "Je prends le déjeuner le soir.", "Je mange des chips le soir."],
    explanation: "'Je prends le dîner le soir' correctly names dinner as the evening meal — the other named meals belong to a different time of day.",
  },
  {
    note: "You are writing that vegetables are your favourite thing to eat.",
    correct: "J'aime manger des légumes.",
    distractors: ["J'aime manger des bonbons.", "Je n'aime pas manger des légumes.", "Je bois du soda."],
    explanation: "'J'aime manger des légumes' correctly names vegetables as a liked healthy food — the others negate it, name candy, or aren't about eating vegetables at all.",
  },
  {
    note: "You are writing a health poster explaining that water is the best drink for your body.",
    correct: "Je bois de l'eau.",
    distractors: ["Je bois du soda.", "Je bois du sucre.", "Je mange des chips."],
    explanation: "'Je bois de l'eau' names water — soda and sugar are unhealthy drink choices, and chips aren't a drink at all.",
  },
  {
    note: "You are writing a warning that sugar is bad for your health.",
    correct: "Le sucre n'est pas bon pour la santé.",
    distractors: ["Le sucre est bon pour la santé.", "Les légumes ne sont pas bons pour la santé.", "L'eau n'est pas bonne pour la santé."],
    explanation: "'Le sucre n'est pas bon pour la santé' correctly negates sugar's health value — the other options either say the opposite or wrongly flag a healthy food.",
  },
  {
    note: "You are writing that sweets are not healthy foods, for a class poster.",
    correct: "Les bonbons ne sont pas des aliments sains.",
    distractors: ["Les bonbons sont des aliments sains.", "Les légumes ne sont pas des aliments sains.", "Le poisson n'est pas un aliment sain."],
    explanation: "'Les bonbons ne sont pas des aliments sains' correctly flags sweets as unhealthy — the other options say the opposite, or wrongly flag a healthy food.",
  },
  {
    note: "You are writing that fish is good for your health, in a healthy-eating leaflet.",
    correct: "Le poisson est bon pour la santé.",
    distractors: ["Le sucre est bon pour la santé.", "Les bonbons sont bons pour la santé.", "Le poisson n'est pas bon pour la santé."],
    explanation: "'Le poisson est bon pour la santé' correctly names fish as healthy — sugar and sweets are the unhealthy options, and negating fish would be wrong.",
  },
  {
    note: "You are writing advice that you must drink lots of water every day.",
    correct: "Il faut boire beaucoup d'eau.",
    distractors: ["Il faut boire beaucoup de soda.", "Il ne faut pas boire d'eau.", "Il faut manger beaucoup de sucre."],
    explanation: "'Il faut boire beaucoup d'eau' gives the correct health advice — soda and sugar aren't healthy advice, and negating water would be wrong.",
  },
  {
    note: "You are writing that you prefer fruits and vegetables over sweets, in a survey.",
    correct: "Je préfère les fruits et les légumes.",
    distractors: ["Je préfère les bonbons et les chips.", "Je n'aime pas les fruits et les légumes.", "Je préfère le sucre."],
    explanation: "'Je préfère les fruits et les légumes' correctly states your healthy preference — the other options name unhealthy foods or negate the preference.",
  },
];

export const foodsWriting: Skill = {
  id: "g5-fr-w-foods",
  code: "W.6",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "Meals and healthy eating",
  description: "Guided writing — spelling mealtimes and food words, and constructing sentences about healthy and unhealthy foods and drinks.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, FOODS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "written French food or drink word to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether each food or drink is a healthy or unhealthy choice.",
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
        prompt: sortPrompt(rng, "each written food or drink word as Healthy or Unhealthy"),
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
        hint: "Think about the mealtime pattern, or a healthy/unhealthy food judgment.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words/phrases to write a correct French sentence about food or meals"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Je prends' is followed by the meal, then the moment of the day.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which mealtime or which health judgment is being asked for.",
      explanation: s.explanation,
    };
  },
};
