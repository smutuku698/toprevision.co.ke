import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Kiptoo : Excusez-moi, où est la boulangerie ?",
  "Achieng : Elle est en face du marché, à côté de la boutique.",
  "Kiptoo : Et l'église ?",
  "Achieng : Elle est derrière le marché.",
  "Kiptoo : Et le supermarché, il est loin ?",
  "Achieng : Non, il est près de la mosquée.",
  "Kiptoo : Merci beaucoup ! Je passe à travers le marché pour y aller.",
  "Achieng : Oui, c'est le chemin le plus rapide.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "The bakery is opposite the market.", isTrue: true },
  { text: "The bakery is next to the shop.", isTrue: true },
  { text: "The church is in front of the market.", isTrue: false },
  { text: "The church is behind the market.", isTrue: true },
  { text: "The supermarket is far away.", isTrue: false },
  { text: "The supermarket is near the mosque.", isTrue: true },
  { text: "Kiptoo will go through the market.", isTrue: true },
  { text: "Achieng says this is the slowest path.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Excusez-moi, où est la boulangerie ?", meaning: "Excuse me, where is the bakery?" },
  { phrase: "Elle est en face du marché.", meaning: "It is opposite the market." },
  { phrase: "Elle est derrière le marché.", meaning: "It is behind the market." },
  { phrase: "Il est près de la mosquée.", meaning: "It is near the mosque." },
  { phrase: "Je passe à travers le marché.", meaning: "I go through the market." },
  { phrase: "C'est le chemin le plus rapide.", meaning: "It's the fastest path." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Où est la boulangerie ?",
    correct: "En face du marché, à côté de la boutique",
    distractors: ["Derrière le marché", "Près de la mosquée", "À côté de l'église"],
    explanation: "Achieng says: \"Elle est en face du marché, à côté de la boutique.\"",
  },
  {
    q: "Où est l'église ?",
    correct: "Derrière le marché",
    distractors: ["En face du marché", "Près de la mosquée", "À côté de la boulangerie"],
    explanation: "Achieng says: \"Elle est derrière le marché.\"",
  },
  {
    q: "Où est le supermarché ?",
    correct: "Près de la mosquée",
    distractors: ["Loin du marché", "Derrière l'église", "En face de la boutique"],
    explanation: "Achieng says: \"Non, il est près de la mosquée.\"",
  },
  {
    q: "Comment Kiptoo va-t-il au supermarché ?",
    correct: "Il passe à travers le marché",
    distractors: ["Il passe derrière l'église", "Il passe à côté de la boutique", "Il ne sait pas"],
    explanation: "Kiptoo says: \"Je passe à travers le marché pour y aller.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kiptoo : Excusez-moi, où est la ", after: " ?", answer: "boulangerie", gloss: "Excuse me, where is the bakery?" },
  { before: "Achieng : Elle est en face du marché, à côté de la ", after: ".", answer: "boutique", gloss: "It is opposite the market, next to the shop." },
  { before: "Achieng : Elle est ", after: " le marché.", answer: "derrière", gloss: "It is behind the market." },
  { before: "Achieng : Non, il est près de la ", after: ".", answer: "mosquée", gloss: "No, it is near the mosque." },
  { before: "Kiptoo : Je passe à ", after: " le marché pour y aller.", answer: "travers", gloss: "I go through the market to get there." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Elle", "est", "en", "face", "du", "marché", "."], sentence: "Elle est en face du marché." },
  { chunks: ["Il", "est", "près", "de", "la", "mosquée", "."], sentence: "Il est près de la mosquée." },
];

export const gettingAroundReading: Skill = {
  id: "g7-fr-r-getting-around",
  code: "R.9",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: in the neighbourhood",
  description: "Read a short French dialogue about asking for directions to the bakery, church, and supermarket, and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the exact locations described.",
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
