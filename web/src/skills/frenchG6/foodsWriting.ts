import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "healthy" | "unhealthy";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le poulet", meaning: "chicken", tag: "healthy" },
  { word: "le poisson", meaning: "fish", tag: "healthy" },
  { word: "les légumes", meaning: "vegetables", tag: "healthy" },
  { word: "les fruits", meaning: "fruits", tag: "healthy" },
  { word: "le riz", meaning: "rice", tag: "healthy" },
  { word: "l'eau", meaning: "water", tag: "healthy" },
  { word: "le lait", meaning: "milk", tag: "healthy" },
  { word: "les œufs", meaning: "eggs", tag: "healthy" },
  { word: "les bonbons", meaning: "sweets/candy", tag: "unhealthy" },
  { word: "le soda", meaning: "soda/fizzy drink", tag: "unhealthy" },
  { word: "les chips", meaning: "crisps/chips", tag: "unhealthy" },
  { word: "le sucre", meaning: "sugar", tag: "unhealthy" },
  { word: "le gâteau", meaning: "cake", tag: "unhealthy" },
  { word: "la friture", meaning: "fried food", tag: "unhealthy" },
  { word: "les frites", meaning: "French fries", tag: "unhealthy" },
  { word: "le chocolat", meaning: "chocolate", tag: "unhealthy" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "J'aime le poulet parce que c'est ", after: ".", answer: "délicieux", gloss: "J'aime le poulet parce que c'est délicieux. — I like chicken because it's delicious." },
  { before: "Je n'aime pas le porc parce que c'est ", after: ".", answer: "dégoûtant", gloss: "Je n'aime pas le porc parce que c'est dégoûtant. — I don't like pork because it's disgusting." },
  { before: "Les légumes sont bons pour la ", after: ".", answer: "santé", gloss: "Les légumes sont bons pour la santé. — Vegetables are good for health." },
  { before: "Je bois du ", after: " le matin.", answer: "lait", gloss: "Je bois du lait le matin. — I drink milk in the morning." },
  { before: "J'aime les ", after: " parce que c'est sucré.", answer: "fruits", gloss: "J'aime les fruits parce que c'est sucré. — I like fruits because it's sweet." },
  { before: "Le ", after: " n'est pas bon pour la santé.", answer: "sucre", gloss: "Le sucre n'est pas bon pour la santé. — Sugar is not good for health." },
  { before: "Je voudrais un verre d'", after: ".", answer: "eau", gloss: "Je voudrais un verre d'eau. — I would like a glass of water." },
  { before: "Le riz est bon pour la ", after: ".", answer: "santé", gloss: "Le riz est bon pour la santé. — Rice is good for health." },
  { before: "J'aime le ", after: ", mais ce n'est pas sain.", answer: "gâteau", gloss: "J'aime le gâteau, mais ce n'est pas sain. — I like cake, but it isn't healthy." },
  { before: "Je n'aime pas les ", after: " parce qu'il y a trop de sucre.", answer: "bonbons", gloss: "Je n'aime pas les bonbons parce qu'il y a trop de sucre. — I don't like sweets because there's too much sugar." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'aime", "le", "poulet", "parce", "que", "c'est", "délicieux", "."], sentence: "J'aime le poulet parce que c'est délicieux." },
  { chunks: ["Je", "n'aime", "pas", "le", "porc", "parce", "que", "c'est", "dégoûtant", "."], sentence: "Je n'aime pas le porc parce que c'est dégoûtant." },
  { chunks: ["Les", "légumes", "sont", "bons", "pour", "la", "santé", "."], sentence: "Les légumes sont bons pour la santé." },
  { chunks: ["Je", "bois", "du", "lait", "le", "matin", "."], sentence: "Je bois du lait le matin." },
  { chunks: ["Le", "sucre", "n'est", "pas", "bon", "pour", "la", "santé", "."], sentence: "Le sucre n'est pas bon pour la santé." },
  { chunks: ["J'aime", "les", "fruits", "parce", "que", "c'est", "sucré", "."], sentence: "J'aime les fruits parce que c'est sucré." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a note explaining that you like chicken because it's delicious.",
    correct: "J'aime le poulet parce que c'est délicieux.",
    distractors: ["Je n'aime pas le poulet parce que c'est dégoûtant.", "J'aime le poulet parce que c'est cher.", "Je n'aime pas le porc parce que c'est délicieux."],
    explanation: "'J'aime le poulet parce que c'est délicieux' correctly pairs liking chicken with the reason 'delicious' — the other options negate the liking, give the wrong reason, or name the wrong food.",
  },
  {
    note: "You are writing that you dislike pork because you find it disgusting.",
    correct: "Je n'aime pas le porc parce que c'est dégoûtant.",
    distractors: ["J'aime le porc parce que c'est délicieux.", "Je n'aime pas le poulet parce que c'est dégoûtant.", "Je n'aime pas le porc parce que c'est sucré."],
    explanation: "'Je n'aime pas le porc parce que c'est dégoûtant' correctly negates the liking and gives 'disgusting' as the reason — the other options flip the opinion, swap the food, or give an unrelated reason.",
  },
  {
    note: "You are writing an essay line that vegetables are good for your health.",
    correct: "Les légumes sont bons pour la santé.",
    distractors: ["Les bonbons sont bons pour la santé.", "Les légumes ne sont pas bons pour la santé.", "Le sucre est bon pour la santé."],
    explanation: "Vegetables ('les légumes') are the healthy food named here — sweets and sugar are the unhealthy items, and negating the sentence reverses its meaning.",
  },
  {
    note: "You are writing that candy is not good for your health.",
    correct: "Les bonbons ne sont pas bons pour la santé.",
    distractors: ["Les légumes ne sont pas bons pour la santé.", "Les bonbons sont bons pour la santé.", "Les fruits ne sont pas bons pour la santé."],
    explanation: "'Les bonbons ne sont pas bons pour la santé' correctly names candy as unhealthy — swapping in a healthy food or dropping the negation both change the meaning.",
  },
  {
    note: "You are writing a breakfast diary entry saying you drink milk every morning.",
    correct: "Je bois du lait le matin.",
    distractors: ["Je mange du lait le matin.", "Je bois du soda le matin.", "Je bois du lait le soir."],
    explanation: "'Je bois' (I drink) is correct for a liquid like milk — 'je mange' (I eat) doesn't fit a drink, and the other options swap the drink or the time of day.",
  },
  {
    note: "You are writing that soda is unhealthy because it has too much sugar.",
    correct: "Je n'aime pas le soda parce qu'il y a trop de sucre.",
    distractors: ["J'aime le soda parce qu'il y a trop de sucre.", "Je n'aime pas l'eau parce qu'il y a trop de sucre.", "Je n'aime pas le soda parce que c'est délicieux."],
    explanation: "The sentence must dislike the soda ('je n'aime pas') and give the sugar-content reason — liking it, blaming water, or giving an unrelated reason all break the meaning.",
  },
  {
    note: "You are writing that you like fruit because it's sweet and healthy.",
    correct: "J'aime les fruits parce que c'est sucré et sain.",
    distractors: ["Je n'aime pas les fruits parce que c'est sucré et sain.", "J'aime les frites parce que c'est sucré et sain.", "J'aime les fruits parce que c'est dégoûtant."],
    explanation: "'J'aime les fruits parce que c'est sucré et sain' correctly names the food, the liking, and the reason — the other options negate it, swap in fries, or give a contradictory reason.",
  },
  {
    note: "You are writing that you like fries even though they aren't healthy.",
    correct: "J'aime les frites, mais ce n'est pas sain.",
    distractors: ["Je n'aime pas les frites, mais c'est sain.", "J'aime les frites parce que c'est sain.", "J'aime les légumes, mais ce n'est pas sain."],
    explanation: "'J'aime les frites, mais ce n'est pas sain' captures both the liking and the honest 'but it isn't healthy' — the others reverse the opinion, wrongly call fries healthy, or swap the food.",
  },
  {
    note: "You are writing that eggs are a healthy food for breakfast.",
    correct: "Les œufs sont un aliment sain pour le petit-déjeuner.",
    distractors: ["Le gâteau est un aliment sain pour le petit-déjeuner.", "Les œufs sont un aliment sucré pour le petit-déjeuner.", "Les œufs ne sont pas sains pour le petit-déjeuner."],
    explanation: "Eggs ('les œufs') are the healthy breakfast food named here — cake is the unhealthy swap, 'sucré' is the wrong descriptor, and the negation reverses the meaning.",
  },
  {
    note: "You are writing a note reminding a friend that chocolate is delicious but not healthy.",
    correct: "Le chocolat est délicieux, mais ce n'est pas sain.",
    distractors: ["Le chocolat est délicieux et sain.", "Le riz est délicieux, mais ce n'est pas sain.", "Le chocolat n'est pas délicieux, mais c'est sain."],
    explanation: "'Le chocolat est délicieux, mais ce n'est pas sain' correctly keeps both the taste opinion and the health caution — the other options wrongly call it healthy, swap the food, or reverse the taste opinion.",
  },
];

export const foodsWriting: Skill = {
  id: "g6-fr-w-foods",
  code: "W.6",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "Food and drink preferences",
  description: "Guided writing about food and drink likes and dislikes, and healthy versus unhealthy eating, in French.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French food or drink word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about whether each item is usually eaten as a healthy staple or a treat.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const healthy = shuffle(rng, WORDS.filter((p) => p.tag === "healthy")).slice(0, 5);
      const unhealthy = shuffle(rng, WORDS.filter((p) => p.tag === "unhealthy")).slice(0, 5);
      const chosen = shuffle(rng, [...healthy, ...unhealthy]);
      const correctBucket: Record<string, string> = {};
      for (const p of healthy) correctBucket[p.word] = "healthy";
      for (const p of unhealthy) correctBucket[p.word] = "unhealthy";

      return {
        kind: "categorize",
        prompt: "Sort each written food or drink word as Healthy or Unhealthy for a healthy-eating writing task.",
        items: chosen.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "healthy", label: "Healthy" },
          { id: "unhealthy", label: "Unhealthy" },
        ],
        correctBucket,
        hint: "Fresh proteins, vegetables, fruits, rice, milk, and water are healthy; sugary or fried treats are unhealthy.",
        explanation: [...healthy, ...unhealthy].map((p) => `"${p.word}" is ${correctBucket[p.word]}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written French sentence about food or drink.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which food, drink, or health word fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct, informal French sentence about food or drink.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'J'aime'/'Je n'aime pas' plus the food usually comes first, then 'parce que' plus the reason.",
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
      hint: "Check the food named, whether it's liked or disliked, and whether the reason actually matches.",
      explanation: s.explanation,
    };
  },
};
