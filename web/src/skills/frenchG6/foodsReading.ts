import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Kamau : Salut, Achieng ! Qu'est-ce que tu aimes manger ?",
  "Achieng : J'aime le poulet parce que c'est délicieux.",
  "Kamau : Moi, je n'aime pas le porc parce que c'est dégoûtant.",
  "Achieng : Tu aimes les légumes ?",
  "Kamau : Oui, j'aime les légumes parce que c'est sain.",
  "Achieng : Et les bonbons, tu aimes ça ?",
  "Kamau : J'aime les bonbons, mais ce n'est pas sain.",
  "Achieng : C'est vrai. Le riz et les fruits sont plus sains.",
  "Kamau : Oui, je préfère manger sainement.",
  "Achieng : Moi aussi ! Merci pour la discussion, Kamau.",
  "Kamau : De rien, Achieng ! À bientôt.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Achieng likes chicken.", isTrue: true },
  { text: "Achieng says chicken is disgusting.", isTrue: false },
  { text: "Kamau likes pork.", isTrue: false },
  { text: "Kamau says pork is disgusting to him.", isTrue: true },
  { text: "Kamau likes vegetables because they are healthy.", isTrue: true },
  { text: "Achieng asks Kamau about candy.", isTrue: true },
  { text: "Kamau says candy is healthy.", isTrue: false },
  { text: "Kamau says he likes candy, but it isn't healthy.", isTrue: true },
  { text: "Achieng says rice and fruit are healthier than candy.", isTrue: true },
  { text: "Kamau says he prefers to eat unhealthily.", isTrue: false },
  { text: "Achieng also prefers to eat healthily.", isTrue: true },
  { text: "Achieng is the one who says 'À bientôt' at the end.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Qu'est-ce que tu aimes manger ?", meaning: "What do you like to eat?" },
  { phrase: "J'aime le poulet parce que c'est délicieux.", meaning: "I like chicken because it's delicious." },
  { phrase: "Je n'aime pas le porc parce que c'est dégoûtant.", meaning: "I don't like pork because it's disgusting." },
  { phrase: "Tu aimes les légumes ?", meaning: "Do you like vegetables?" },
  { phrase: "J'aime les légumes parce que c'est sain.", meaning: "I like vegetables because it's healthy." },
  { phrase: "Et les bonbons, tu aimes ça ?", meaning: "And candy, do you like that?" },
  { phrase: "Mais ce n'est pas sain.", meaning: "But it isn't healthy." },
  { phrase: "Le riz et les fruits sont plus sains.", meaning: "Rice and fruit are healthier." },
  { phrase: "Je préfère manger sainement.", meaning: "I prefer to eat healthily." },
  { phrase: "Merci pour la discussion.", meaning: "Thanks for the chat." },
  { phrase: "De rien.", meaning: "You're welcome." },
  { phrase: "À bientôt.", meaning: "See you soon." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Pourquoi Achieng aime-t-elle le poulet ?",
    correct: "Parce que c'est délicieux",
    distractors: ["Parce que c'est sain", "Parce que c'est bon marché", "Parce que c'est facile à cuisiner"],
    explanation: "Achieng says: \"J'aime le poulet parce que c'est délicieux.\"",
  },
  {
    q: "Pourquoi Kamau n'aime-t-il pas le porc ?",
    correct: "Parce que c'est dégoûtant",
    distractors: ["Parce que c'est cher", "Parce que c'est sain", "Parce que c'est difficile à trouver"],
    explanation: "Kamau says: \"Je n'aime pas le porc parce que c'est dégoûtant.\"",
  },
  {
    q: "Que dit Kamau des bonbons ?",
    correct: "Il les aime, mais ce n'est pas sain",
    distractors: ["Il ne les aime pas du tout", "Il dit qu'ils sont très sains", "Il ne les a jamais mangés"],
    explanation: "Kamau says: \"J'aime les bonbons, mais ce n'est pas sain.\"",
  },
  {
    q: "Que préfère faire Kamau, à la fin de la discussion ?",
    correct: "Manger sainement",
    distractors: ["Manger des bonbons tous les jours", "Ne jamais manger de légumes", "Manger seulement de la viande"],
    explanation: "Kamau says: \"Oui, je préfère manger sainement.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kamau : Salut, Achieng ! Qu'est-ce que tu aimes ", after: " ?", answer: "manger", gloss: "Hi Achieng! What do you like to eat?" },
  { before: "Achieng : J'aime le poulet parce que c'est ", after: ".", answer: "délicieux", gloss: "I like chicken because it's delicious." },
  { before: "Kamau : Moi, je n'aime pas le porc parce que c'est ", after: ".", answer: "dégoûtant", gloss: "Me, I don't like pork because it's disgusting." },
  { before: "Achieng : Tu aimes les ", after: " ?", answer: "légumes", gloss: "Do you like vegetables?" },
  { before: "Kamau : Oui, j'aime les légumes parce que c'est ", after: ".", answer: "sain", gloss: "Yes, I like vegetables because it's healthy." },
  { before: "Kamau : J'aime les ", after: ", mais ce n'est pas sain.", answer: "bonbons", gloss: "I like candy, but it isn't healthy." },
  { before: "Achieng : C'est vrai. Le riz et les fruits sont plus ", after: ".", answer: "sains", gloss: "That's true. Rice and fruit are healthier." },
  { before: "Kamau : Oui, je préfère manger ", after: ".", answer: "sainement", gloss: "Yes, I prefer to eat healthily." },
  { before: "Achieng : Moi aussi ! Merci pour la ", after: ", Kamau.", answer: "discussion", gloss: "Me too! Thanks for the chat, Kamau." },
  { before: "Kamau : De rien, Achieng ! À ", after: ".", answer: "bientôt", gloss: "You're welcome, Achieng! See you soon." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'aime", "le", "poulet", "parce", "que", "c'est", "délicieux", "."], sentence: "J'aime le poulet parce que c'est délicieux." },
  { chunks: ["Je", "préfère", "manger", "sainement", "."], sentence: "Je préfère manger sainement." },
];

export const foodsReading: Skill = {
  id: "g6-fr-r-foods",
  code: "R.6",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: foods and drinks — likes, dislikes, and healthy eating",
  description: "Read a short French dialogue about Kamau and Achieng discussing likes, dislikes, and healthy vs unhealthy food, and answer comprehension questions.",
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
        prompt: "Sort each statement as True or False, based on the dialogue.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check exactly what each speaker says about food.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: "Match each phrase from the dialogue to its English meaning.",
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
        prompt: "Put the pieces in order to rebuild this line from the dialogue.",
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
        prompt: "Fill in the missing word from this line of the dialogue.",
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
      hint: "Look at what each speaker actually says in the dialogue above.",
      explanation: q.explanation,
    };
  },
};
