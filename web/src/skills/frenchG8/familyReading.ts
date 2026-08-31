import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const LINES = [
  "Voici ma famille. J'ai deux frères et une sœur. Ma famille est grande.",
  "Mon grand-père et ma grand-mère habitent avec nous.",
  "J'ai un oncle et une tante ; ils ont deux enfants, mon cousin et ma cousine.",
  "Mon oncle est le mari de ma tante, et ma tante est la femme de mon oncle.",
  "Mes grands-parents sont très heureux avec leurs petits-enfants.",
  "Le neveu et la nièce de mon père viennent nous rendre visite chaque mois.",
];

const PASSAGE = LINES.join("\n");

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Combien de frères et sœurs le narrateur a-t-il ?",
    correct: "Deux frères et une sœur",
    distractors: ["Un frère et une sœur", "Trois frères", "Deux sœurs et un frère"],
    explanation: "Le texte dit : \"J'ai deux frères et une sœur.\"",
  },
  {
    q: "Qui habite avec la famille du narrateur ?",
    correct: "Le grand-père et la grand-mère",
    distractors: ["Le cousin et la cousine", "L'oncle et la tante", "Le neveu et la nièce"],
    explanation: "Le texte dit : \"Mon grand-père et ma grand-mère habitent avec nous.\"",
  },
  {
    q: "Quel est le lien entre l'oncle et la tante du narrateur ?",
    correct: "L'oncle est le mari de la tante",
    distractors: ["L'oncle est le frère de la tante", "L'oncle est le fils de la tante", "Ils ne sont pas de la même famille"],
    explanation: "Le texte dit : \"Mon oncle est le mari de ma tante.\"",
  },
  {
    q: "Qui rend visite à la famille chaque mois ?",
    correct: "Le neveu et la nièce du père",
    distractors: ["Le grand-père et la grand-mère", "Le cousin et la cousine", "Les petits-enfants"],
    explanation: "Le texte dit : \"Le neveu et la nièce de mon père viennent nous rendre visite chaque mois.\"",
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "La famille du narrateur est grande.", isTrue: true },
  { text: "Le narrateur n'a pas de frères.", isTrue: false },
  { text: "Les grands-parents sont heureux avec leurs petits-enfants.", isTrue: true },
  { text: "L'oncle et la tante n'ont pas d'enfants.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "le grand-père", meaning: "grandfather" },
  { phrase: "la grand-mère", meaning: "grandmother" },
  { phrase: "l'oncle", meaning: "uncle" },
  { phrase: "la tante", meaning: "aunt" },
  { phrase: "le cousin", meaning: "male cousin" },
  { phrase: "la cousine", meaning: "female cousin" },
  { phrase: "le neveu", meaning: "nephew" },
  { phrase: "la nièce", meaning: "niece" },
  { phrase: "les petits-enfants", meaning: "grandchildren" },
  { phrase: "le mari", meaning: "husband" },
  { phrase: "la femme", meaning: "wife" },
];

export const familyReading: Skill = {
  id: "g8-fr-r-family",
  code: "R.2",
  subjectId: "french",
  strandId: "g8-fr-reading",
  grade: 8,
  title: "Reading: extended family",
  description: "Read a short French passage describing an extended family and answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["multiple-choice", "categorize", "click-match", "ordering"] as const);

    if (branch === "categorize") {
      const items = TRUE_FALSE.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage carefully and check each family relationship described.",
        explanation: TRUE_FALSE.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
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
        prompt: "Match each French family word from the passage to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Look for these family words in the passage above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const withIds = LINES.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      const correctOrder = withIds.map((w) => w.id);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: "Put these sentences from the passage in the order they appear.",
        instruction: "Click the sentences in the correct order.",
        items,
        correctOrder,
        hint: "The passage starts with siblings and ends with the extended family who visits monthly.",
        explanation: `The correct order is:\n${LINES.join("\n")}`,
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
      hint: "Look at how each family member is described in the passage above.",
      explanation: q.explanation,
    };
  },
};
