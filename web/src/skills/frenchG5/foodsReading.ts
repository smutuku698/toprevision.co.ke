import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Njeri : Wafula, qu'est-ce que tu manges le matin ?",
  "Wafula : Je prends le petit déjeuner le matin. Je mange du pain et je bois du lait.",
  "Njeri : Et à midi ?",
  "Wafula : Je prends le diner à midi. Je mange du riz et des légumes.",
  "Njeri : Et le soir ?",
  "Wafula : Je prends le diner le soir aussi. Je mange des fruits.",
  "Njeri : Est-ce que tu manges des bonbons et des chips ?",
  "Wafula : Non, ce ne sont pas des aliments sains. Je préfère les fruits et les légumes.",
  "Njeri : Tu as raison. L'eau est meilleure que les boissons sucrées.",
  "Wafula : Oui, il faut boire beaucoup d'eau chaque jour.",
  "Njeri : Manger sainement, c'est important pour la santé.",
  "Wafula : Exactement, Njeri !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Wafula eats breakfast in the morning.", isTrue: true },
  { text: "Wafula drinks juice in the morning.", isTrue: false },
  { text: "Wafula eats rice and vegetables at midday.", isTrue: true },
  { text: "Wafula eats bread at midday.", isTrue: false },
  { text: "Wafula eats fruit in the evening.", isTrue: true },
  { text: "Wafula eats sweets and chips regularly.", isTrue: false },
  { text: "Wafula says sweets and chips are not healthy foods.", isTrue: true },
  { text: "Wafula prefers fruits and vegetables.", isTrue: true },
  { text: "Njeri says water is better than sugary drinks.", isTrue: true },
  { text: "Wafula says you should drink a lot of water every day.", isTrue: true },
  { text: "Njeri says eating healthily is important for health.", isTrue: true },
  { text: "Wafula eats bread in the evening.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Qu'est-ce que tu manges le matin ?", meaning: "What do you eat in the morning?" },
  { phrase: "Je prends le petit déjeuner le matin.", meaning: "I have breakfast in the morning." },
  { phrase: "Je bois du lait.", meaning: "I drink milk." },
  { phrase: "Je prends le diner à midi.", meaning: "I have my midday meal at noon." },
  { phrase: "Je mange du riz et des légumes.", meaning: "I eat rice and vegetables." },
  { phrase: "Je prends le diner le soir aussi.", meaning: "I have my evening meal too." },
  { phrase: "Ce ne sont pas des aliments sains.", meaning: "Those are not healthy foods." },
  { phrase: "Je préfère les fruits et les légumes.", meaning: "I prefer fruits and vegetables." },
  { phrase: "L'eau est meilleure que les boissons sucrées.", meaning: "Water is better than sugary drinks." },
  { phrase: "Il faut boire beaucoup d'eau.", meaning: "You must drink a lot of water." },
  { phrase: "Manger sainement, c'est important pour la santé.", meaning: "Eating healthily is important for health." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Que mange Wafula le matin ?",
    correct: "Du pain",
    distractors: ["Du riz", "Des fruits", "Des légumes"],
    explanation: "Wafula dit : \"Je mange du pain et je bois du lait.\"",
  },
  {
    q: "Que boit Wafula le matin ?",
    correct: "Du lait",
    distractors: ["De l'eau", "Du jus", "Du thé"],
    explanation: "Wafula dit : \"Je mange du pain et je bois du lait.\"",
  },
  {
    q: "Que mange Wafula à midi ?",
    correct: "Du riz et des légumes",
    distractors: ["Du pain et du lait", "Des fruits seulement", "Des bonbons"],
    explanation: "Wafula dit : \"Je prends le diner à midi. Je mange du riz et des légumes.\"",
  },
  {
    q: "Que mange Wafula le soir ?",
    correct: "Des fruits",
    distractors: ["Du riz", "Des bonbons", "Des chips"],
    explanation: "Wafula dit : \"Je prends le diner le soir aussi. Je mange des fruits.\"",
  },
  {
    q: "Selon Wafula, les bonbons et les chips sont-ils sains ?",
    correct: "Non, ce ne sont pas des aliments sains",
    distractors: ["Oui, très sains", "Il ne sait pas", "Oui, un peu sains"],
    explanation: "Wafula dit : \"Non, ce ne sont pas des aliments sains.\"",
  },
  {
    q: "Que préfère manger Wafula ?",
    correct: "Les fruits et les légumes",
    distractors: ["Les bonbons et les chips", "Le pain seulement", "Le riz seulement"],
    explanation: "Wafula dit : \"Je préfère les fruits et les légumes.\"",
  },
  {
    q: "Selon Njeri, qu'est-ce qui est meilleur que les boissons sucrées ?",
    correct: "L'eau",
    distractors: ["Le lait", "Le jus", "Le thé"],
    explanation: "Njeri dit : \"L'eau est meilleure que les boissons sucrées.\"",
  },
  {
    q: "Pourquoi manger sainement est-il important, selon Njeri ?",
    correct: "Pour la santé",
    distractors: ["Pour être riche", "Pour aller à l'école", "Pour jouer plus longtemps"],
    explanation: "Njeri dit : \"Manger sainement, c'est important pour la santé.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wafula : Je prends le petit déjeuner le matin. Je mange du ", after: " et je bois du lait.", answer: "pain", gloss: "Wafula eats bread in the morning." },
  { before: "Wafula : Je prends le petit déjeuner le matin. Je mange du pain et je bois du ", after: ".", answer: "lait", gloss: "Wafula drinks milk in the morning." },
  { before: "Wafula : Je prends le ", after: " à midi. Je mange du riz et des légumes.", answer: "diner", gloss: "Wafula has his midday meal at noon." },
  { before: "Wafula : Je prends le diner à midi. Je mange du riz et des ", after: ".", answer: "légumes", gloss: "Wafula eats rice and vegetables." },
  { before: "Wafula : Je prends le diner le soir aussi. Je mange des ", after: ".", answer: "fruits", gloss: "Wafula eats fruit in the evening." },
  { before: "Wafula : Non, ce ne sont pas des aliments ", after: ". Je préfère les fruits et les légumes.", answer: "sains", gloss: "Sweets and chips are not healthy foods." },
  { before: "Njeri : Tu as raison. L'", after: " est meilleure que les boissons sucrées.", answer: "eau", gloss: "Water is better than sugary drinks." },
  { before: "Wafula : Oui, il faut boire beaucoup d'eau chaque ", after: ".", answer: "jour", gloss: "You should drink a lot of water every day." },
  { before: "Njeri : Manger ", after: ", c'est important pour la santé.", answer: "sainement", gloss: "Eating healthily is important for health." },
  { before: "Njeri : Wafula, qu'est-ce que tu ", after: " le matin ?", answer: "manges", gloss: "Njeri asks what Wafula eats in the morning." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "prends", "le", "petit", "déjeuner", "le", "matin", "."], sentence: "Je prends le petit déjeuner le matin." },
  { chunks: ["Je", "mange", "du", "riz", "et", "des", "légumes", "."], sentence: "Je mange du riz et des légumes." },
  { chunks: ["Il", "faut", "boire", "beaucoup", "d'eau", "."], sentence: "Il faut boire beaucoup d'eau." },
  { chunks: ["Je", "préfère", "les", "fruits", "et", "les", "légumes", "."], sentence: "Je préfère les fruits et les légumes." },
];

export const foodsReading: Skill = {
  id: "g5-fr-r-foods",
  code: "R.6",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: foods and drinks",
  description: "Read a short French dialogue about Wafula describing his meals at different mealtimes and choosing healthy foods, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "click-match", "ordering", "fill-blank", "multiple-choice"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, TRUE_FALSE).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: readingTrueFalsePrompt(rng),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check exactly what Wafula eats at each mealtime.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: matchPrompt(rng, "phrase from the dialogue to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: orderPrompt(rng, "the words to rebuild this line from the dialogue"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the dialogue above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what Wafula actually says he eats and drinks at each mealtime.",
      explanation: q.explanation,
    };
  },
};
