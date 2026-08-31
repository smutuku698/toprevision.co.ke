import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Otieno : Il pleut beaucoup en ce moment. C'est la saison des pluies.",
  "Wanjiru : Oui, et il fait froid aussi. Je porte un manteau.",
  "Otieno : Moi, je porte un pull et des gants.",
  "Wanjiru : En France, il y a quatre saisons : le printemps, l'été, l'automne et l'hiver.",
  "Otieno : Vraiment ? Ici, au Kenya, il y a surtout la saison sèche et la saison des pluies.",
  "Wanjiru : En été, en France, il fait très chaud. Les gens portent un short et un T-shirt.",
  "Otieno : Intéressant ! Le climat est très différent.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "It is currently the rainy season.", isTrue: true },
  { text: "Otieno is wearing a sweater and gloves.", isTrue: true },
  { text: "Wanjiru says France has two seasons.", isTrue: false },
  { text: "France has four seasons: spring, summer, autumn, and winter.", isTrue: true },
  { text: "Kenya mainly has a dry season and a rainy season.", isTrue: true },
  { text: "In summer in France, it is very cold.", isTrue: false },
  { text: "In summer in France, people wear shorts and T-shirts.", isTrue: true },
  { text: "Otieno finds the difference in climate uninteresting.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Il pleut beaucoup en ce moment.", meaning: "It is raining a lot right now." },
  { phrase: "C'est la saison des pluies.", meaning: "It's the rainy season." },
  { phrase: "Je porte un manteau.", meaning: "I am wearing a coat." },
  { phrase: "Il y a quatre saisons.", meaning: "There are four seasons." },
  { phrase: "La saison sèche", meaning: "The dry season" },
  { phrase: "Il fait très chaud.", meaning: "It's very hot." },
  { phrase: "Le climat est très différent.", meaning: "The climate is very different." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quelle saison est-ce en ce moment, selon Otieno ?",
    correct: "La saison des pluies",
    distractors: ["La saison sèche", "L'été", "L'hiver"],
    explanation: "Otieno says: \"Il pleut beaucoup en ce moment. C'est la saison des pluies.\"",
  },
  {
    q: "Combien de saisons y a-t-il en France, selon Wanjiru ?",
    correct: "Quatre",
    distractors: ["Deux", "Trois", "Cinq"],
    explanation: "Wanjiru says: \"En France, il y a quatre saisons.\"",
  },
  {
    q: "Quelles sont les deux saisons principales au Kenya, selon Otieno ?",
    correct: "La saison sèche et la saison des pluies",
    distractors: ["Le printemps et l'été", "L'automne et l'hiver", "L'été et l'hiver"],
    explanation: "Otieno says: \"Ici, au Kenya, il y a surtout la saison sèche et la saison des pluies.\"",
  },
  {
    q: "Que portent les gens en été en France ?",
    correct: "Un short et un T-shirt",
    distractors: ["Un manteau et des gants", "Un pull et un manteau", "Une robe d'hiver"],
    explanation: "Wanjiru says: \"En été, en France, il fait très chaud. Les gens portent un short et un T-shirt.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Otieno : Il pleut beaucoup en ce moment. C'est la saison des ", after: ".", answer: "pluies", gloss: "It is raining a lot right now. It's the rainy season." },
  { before: "Wanjiru : Oui, et il fait froid aussi. Je porte un ", after: ".", answer: "manteau", gloss: "Yes, and it's cold too. I'm wearing a coat." },
  { before: "Wanjiru : En France, il y a quatre ", after: ".", answer: "saisons", gloss: "In France, there are four seasons." },
  { before: "Otieno : Ici, au Kenya, il y a surtout la saison ", after: " et la saison des pluies.", answer: "sèche", gloss: "Here in Kenya, there's mainly the dry season and the rainy season." },
  { before: "Wanjiru : En été, en France, il fait très ", after: ".", answer: "chaud", gloss: "In summer in France, it's very hot." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["C'est", "la", "saison", "des", "pluies", "."], sentence: "C'est la saison des pluies." },
  { chunks: ["En", "France,", "il", "y", "a", "quatre", "saisons", "."], sentence: "En France, il y a quatre saisons." },
];

export const weatherReading: Skill = {
  id: "g7-fr-r-weather",
  code: "R.8",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: seasons and clothing",
  description: "Read a short French dialogue comparing Kenyan and French seasons and clothing, and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check what it says about Kenya and about France.",
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
