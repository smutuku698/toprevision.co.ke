import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "healthy" | "unhealthy";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "les légumes", meaning: "vegetables", tag: "healthy" },
  { word: "les fruits", meaning: "fruits", tag: "healthy" },
  { word: "le poisson", meaning: "fish", tag: "healthy" },
  { word: "le riz", meaning: "rice", tag: "healthy" },
  { word: "l'eau", meaning: "water", tag: "healthy" },
  { word: "les œufs", meaning: "eggs", tag: "healthy" },
  { word: "le poulet", meaning: "chicken", tag: "healthy" },
  { word: "le lait", meaning: "milk", tag: "healthy" },
  { word: "les bonbons", meaning: "sweets/candy", tag: "unhealthy" },
  { word: "les frites", meaning: "fries", tag: "unhealthy" },
  { word: "le soda", meaning: "soda", tag: "unhealthy" },
  { word: "le gâteau", meaning: "cake", tag: "unhealthy" },
  { word: "les chips", meaning: "crisps", tag: "unhealthy" },
  { word: "la glace", meaning: "ice cream", tag: "unhealthy" },
  { word: "le chocolat", meaning: "chocolate", tag: "unhealthy" },
  { word: "les beignets", meaning: "doughnuts", tag: "unhealthy" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "J'aime le ", after: " parce que c'est délicieux.", answer: "poulet", gloss: "J'aime le poulet parce que c'est délicieux. — I like chicken because it's delicious." },
  { before: "Je n'aime pas le ", after: " parce que c'est dégoutant.", answer: "porc", gloss: "Je n'aime pas le porc parce que c'est dégoutant. — I don't like pork because it's disgusting." },
  { before: "Les légumes sont ", after: " pour la santé.", answer: "bons", gloss: "Les légumes sont bons pour la santé. — Vegetables are good for your health." },
  { before: "Les bonbons sont ", after: " pour la santé.", answer: "mauvais", gloss: "Les bonbons sont mauvais pour la santé. — Sweets are bad for your health." },
  { before: "J'aime le ", after: " parce que c'est sucré.", answer: "gâteau", gloss: "J'aime le gâteau parce que c'est sucré. — I like cake because it's sweet." },
  { before: "Je n'aime pas les ", after: " parce que c'est trop gras.", answer: "frites", gloss: "Je n'aime pas les frites parce que c'est trop gras. — I don't like fries because it's too greasy." },
  { before: "Le poisson est ", after: " pour le corps.", answer: "bon", gloss: "Le poisson est bon pour le corps. — Fish is good for the body." },
  { before: "Je bois de l'", after: " tous les jours.", answer: "eau", gloss: "Je bois de l'eau tous les jours. — I drink water every day." },
  { before: "J'aime les ", after: " parce qu'ils sont sucrés.", answer: "fruits", gloss: "J'aime les fruits parce qu'ils sont sucrés. — I like fruits because they are sweet." },
  { before: "Le soda est ", after: " pour les dents.", answer: "mauvais", gloss: "Le soda est mauvais pour les dents. — Soda is bad for your teeth." },
  { before: "Je n'aime pas le ", after: " parce que c'est trop sucré.", answer: "chocolat", gloss: "Je n'aime pas le chocolat parce que c'est trop sucré. — I don't like chocolate because it's too sweet." },
  { before: "J'adore les ", after: " au petit-déjeuner.", answer: "œufs", gloss: "J'adore les œufs au petit-déjeuner. — I love eggs for breakfast." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'aime", "le", "poulet", "parce", "que", "c'est", "délicieux", "."], sentence: "J'aime le poulet parce que c'est délicieux." },
  { chunks: ["Je", "n'aime", "pas", "le", "porc", "parce", "que", "c'est", "dégoutant", "."], sentence: "Je n'aime pas le porc parce que c'est dégoutant." },
  { chunks: ["Les", "légumes", "sont", "bons", "pour", "la", "santé", "."], sentence: "Les légumes sont bons pour la santé." },
  { chunks: ["Les", "bonbons", "sont", "mauvais", "pour", "la", "santé", "."], sentence: "Les bonbons sont mauvais pour la santé." },
  { chunks: ["Le", "poisson", "est", "bon", "pour", "le", "corps", "."], sentence: "Le poisson est bon pour le corps." },
  { chunks: ["J'aime", "les", "fruits", "parce", "qu'ils", "sont", "sucrés", "."], sentence: "J'aime les fruits parce qu'ils sont sucrés." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} just tasted grilled chicken and thinks it's amazing. What do they say?`,
    correct: "J'aime le poulet parce que c'est délicieux.",
    distractors: ["Je n'aime pas le poulet parce que c'est dégoutant.", "J'aime le porc parce que c'est délicieux.", "Les bonbons sont bons pour la santé."],
    explanation: "The food and the reason must both match the reaction described — chicken tasted delicious, so 'le poulet' pairs with 'parce que c'est délicieux', not a different food or the opposite reaction.",
  },
  {
    situation: (n) => `${n} tried a piece of pork and found it disgusting. What do they say?`,
    correct: "Je n'aime pas le porc parce que c'est dégoutant.",
    distractors: ["J'aime le porc parce que c'est délicieux.", "Je n'aime pas le poulet parce que c'est dégoutant.", "Le porc est bon pour la santé."],
    explanation: "'Dégoutant' names a negative reaction, so the sentence must use 'Je n'aime pas' with the actual food tasted (le porc), not swap in chicken or a positive statement.",
  },
  {
    situation: (n) => `${n}'s teacher asks the class whether vegetables are good or bad for your health.`,
    correct: "Les légumes sont bons pour la santé.",
    distractors: ["Les légumes sont mauvais pour la santé.", "Les bonbons sont bons pour la santé.", "Le soda est bon pour la santé."],
    explanation: "Vegetables are the healthy food here — 'bons' fits, and the distractors either reverse the judgement or wrongly praise an unhealthy food.",
  },
  {
    situation: (n) => `${n} explains to a younger sibling why eating too many sweets is unwise.`,
    correct: "Les bonbons sont mauvais pour la santé.",
    distractors: ["Les bonbons sont bons pour la santé.", "Les fruits sont mauvais pour la santé.", "Le poisson est mauvais pour la santé."],
    explanation: "Sweets are the unhealthy food being warned about — the distractors either flip the judgement or wrongly condemn a healthy food.",
  },
  {
    situation: (n) => `${n} just ate a fresh mango and orange and loved how sweet they tasted.`,
    correct: "J'aime les fruits parce qu'ils sont sucrés.",
    distractors: ["Je n'aime pas les fruits parce qu'ils sont sucrés.", "J'aime les frites parce qu'elles sont sucrées.", "Les fruits sont mauvais pour la santé."],
    explanation: "The reaction is positive and about sweetness, so it must be 'J'aime les fruits parce qu'ils sont sucrés' — fries are not sweet, and a health-judgement sentence doesn't fit a taste reaction.",
  },
  {
    situation: (n) => `${n} is discussing why a doctor often recommends eating fish.`,
    correct: "Le poisson est bon pour le corps.",
    distractors: ["Le poisson est mauvais pour le corps.", "Le soda est bon pour le corps.", "Les bonbons sont bons pour le corps."],
    explanation: "Fish is the food being recommended for the body — the distractors either reverse the judgement or misplace it on an unhealthy food.",
  },
  {
    situation: (n) => `${n} drinks a glass of water instead of soda before a football match.`,
    correct: "L'eau est bonne pour la santé.",
    distractors: ["Le soda est bon pour la santé.", "Les bonbons sont bons pour la santé.", "L'eau est mauvaise pour la santé."],
    explanation: "Choosing water over soda reflects the healthy option — the distractors wrongly praise soda/sweets or reverse water's own judgement.",
  },
  {
    situation: (n) => `${n} bites into a rich bar of chocolate and says it's far too sweet to eat every day.`,
    correct: "Je n'aime pas le chocolat parce que c'est trop sucré.",
    distractors: ["J'aime le chocolat parce que c'est trop sucré.", "Je n'aime pas le chocolat parce que c'est délicieux.", "Le chocolat est bon pour la santé."],
    explanation: "'Trop sucré' (too sweet) is a negative complaint here, so it pairs with 'Je n'aime pas', not 'J'aime' — and the reason stated must match 'trop sucré', not 'délicieux'.",
  },
  {
    situation: (n) => `${n} ate greasy fries at a party and complained about how oily they were.`,
    correct: "Je n'aime pas les frites parce que c'est trop gras.",
    distractors: ["J'aime les frites parce que c'est trop gras.", "Je n'aime pas les frites parce que c'est délicieux.", "Les frites sont bonnes pour la santé."],
    explanation: "'Trop gras' (too greasy) is the specific complaint given, so the reason in the sentence must match it exactly, not a mismatched reason or a positive statement.",
  },
  {
    situation: (n) => `${n} eats eggs every morning before school because they give good energy.`,
    correct: "J'adore les œufs au petit-déjeuner.",
    distractors: ["Je n'aime pas les œufs au petit-déjeuner.", "J'adore les bonbons au petit-déjeuner.", "Les œufs sont mauvais pour la santé."],
    explanation: "The habit described is a positive one about eggs specifically for breakfast, so 'J'adore les œufs au petit-déjeuner' fits — not a negative statement or a different food.",
  },
  {
    situation: (n) => `${n} explains to a friend why fizzy soda drinks are bad for teeth.`,
    correct: "Le soda est mauvais pour les dents.",
    distractors: ["Le soda est bon pour les dents.", "L'eau est mauvaise pour les dents.", "Les légumes sont mauvais pour les dents."],
    explanation: "Soda is the food/drink being criticized for teeth here — the distractors either reverse the judgement or misplace it on water or vegetables.",
  },
  {
    situation: (n) => `${n} is at a birthday party, takes a bite of cake, and finds it very sweet and enjoyable.`,
    correct: "J'aime le gâteau parce que c'est sucré.",
    distractors: ["Je n'aime pas le gâteau parce que c'est sucré.", "J'aime le gâteau parce que c'est délicieux.", "Le gâteau est bon pour la santé."],
    explanation: "The reaction described is specifically about sweetness, so the reason must be 'parce que c'est sucré' — swapping in 'délicieux' changes the stated reason, and a health claim confuses taste with nutrition.",
  },
];

export const foodsSpeaking: Skill = {
  id: "g6-fr-ls-foods",
  code: "LS.6",
  subjectId: "french",
  strandId: "g6-fr-listening-speaking",
  grade: 6,
  title: "Foods and drinks: likes and dislikes",
  description: "Informal (tu-form) French vocabulary for food and drinks, likes/dislikes with a reason (parce que), and healthy vs unhealthy food.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each French food/drink word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Sound out each word — several are close to their English cognates.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const healthy = shuffle(rng, WORDS.filter((p) => p.tag === "healthy")).slice(0, 5);
      const unhealthy = shuffle(rng, WORDS.filter((p) => p.tag === "unhealthy")).slice(0, 5);
      const items = shuffle(rng, [...healthy, ...unhealthy]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each food or drink as Healthy or Unhealthy.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "healthy", label: "Healthy" },
          { id: "unhealthy", label: "Unhealthy" },
        ],
        correctBucket,
        hint: "Vegetables, fruits, fish, and water are healthy; sugary or fried foods are unhealthy.",
        explanation: [...healthy, ...unhealthy].map((p) => `"${p.word}" is ${p.tag === "healthy" ? "a healthy" : "an unhealthy"} choice.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about food.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which food, drink, or opinion word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, informal French sentence about food.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'J'aime'/'Je n'aime pas' + the food comes first, then 'parce que c'est' + the reason.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const name = randChoice(rng, NAMES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(name)} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check that the food, the like/dislike, and the reason all match the situation.",
      explanation: s.explanation,
    };
  },
};
