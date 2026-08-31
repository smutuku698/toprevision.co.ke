import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Brian : Achieng, que fais-tu le matin ?",
  "Achieng : Le matin, je me lève et je prends le petit déjeuner.",
  "Brian : Et à midi ?",
  "Achieng : À midi, je prends le déjeuner à l'école.",
  "Brian : Et le soir ?",
  "Achieng : Le soir, je joue avec mes amis.",
  "Brian : Et la nuit ?",
  "Achieng : La nuit, je dors.",
  "Brian : Quel est ton jour préféré de la semaine ?",
  "Achieng : J'aime le samedi. Il n'y a pas d'école !",
  "Brian : Moi, j'aime le lundi. C'est le premier jour de la semaine.",
  "Achieng : Chaque jour est important, Brian.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Achieng gets up in the morning (le matin).", isTrue: true },
  { text: "Achieng eats lunch at midday (à midi).", isTrue: true },
  { text: "Achieng eats her evening meal in the morning.", isTrue: false },
  { text: "Achieng plays with friends in the evening (le soir).", isTrue: true },
  { text: "Achieng plays with friends at night.", isTrue: false },
  { text: "Achieng sleeps at night (la nuit).", isTrue: true },
  { text: "Achieng's favourite day is Monday.", isTrue: false },
  { text: "Achieng's favourite day is Saturday.", isTrue: true },
  { text: "Brian's favourite day is Monday.", isTrue: true },
  { text: "Brian says Monday is the first day of the week.", isTrue: true },
  { text: "Achieng says there is no school on Saturday.", isTrue: true },
  { text: "Achieng says every day is important.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Que fais-tu le matin ?", meaning: "What do you do in the morning?" },
  { phrase: "Je me lève.", meaning: "I get up." },
  { phrase: "Je prends le petit déjeuner.", meaning: "I eat breakfast." },
  { phrase: "Je prends le déjeuner.", meaning: "I eat lunch." },
  { phrase: "Le soir, je joue avec mes amis.", meaning: "In the evening, I play with my friends." },
  { phrase: "La nuit, je dors.", meaning: "At night, I sleep." },
  { phrase: "Quel est ton jour préféré ?", meaning: "What is your favourite day?" },
  { phrase: "J'aime le samedi.", meaning: "I like Saturday." },
  { phrase: "Il n'y a pas d'école !", meaning: "There is no school!" },
  { phrase: "C'est le premier jour de la semaine.", meaning: "It is the first day of the week." },
  { phrase: "Chaque jour est important.", meaning: "Every day is important." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Que fait Achieng le matin ?",
    correct: "Elle se lève et prend le petit déjeuner",
    distractors: ["Elle dort", "Elle joue avec ses amis", "Elle prend le déjeuner"],
    explanation: "Achieng dit : \"Le matin, je me lève et je prends le petit déjeuner.\"",
  },
  {
    q: "Où Achieng prend-elle le déjeuner ?",
    correct: "À l'école",
    distractors: ["À la maison", "Chez sa grand-mère", "Au marché"],
    explanation: "Achieng dit : \"À midi, je prends le déjeuner à l'école.\"",
  },
  {
    q: "Que fait Achieng le soir ?",
    correct: "Elle joue avec ses amis",
    distractors: ["Elle dort", "Elle se lève", "Elle mange le petit déjeuner"],
    explanation: "Achieng dit : \"Le soir, je joue avec mes amis.\"",
  },
  {
    q: "Que fait Achieng la nuit ?",
    correct: "Elle dort",
    distractors: ["Elle joue", "Elle mange", "Elle étudie"],
    explanation: "Achieng dit : \"La nuit, je dors.\"",
  },
  {
    q: "Quel est le jour préféré d'Achieng ?",
    correct: "Le samedi",
    distractors: ["Le lundi", "Le dimanche", "Le vendredi"],
    explanation: "Achieng dit : \"J'aime le samedi. Il n'y a pas d'école !\"",
  },
  {
    q: "Quel est le jour préféré de Brian ?",
    correct: "Le lundi",
    distractors: ["Le samedi", "Le mardi", "Le jeudi"],
    explanation: "Brian dit : \"Moi, j'aime le lundi. C'est le premier jour de la semaine.\"",
  },
  {
    q: "Pourquoi Achieng aime-t-elle le samedi ?",
    correct: "Il n'y a pas d'école",
    distractors: ["Elle mange beaucoup", "Elle dort toute la journée", "Elle voit sa famille"],
    explanation: "Achieng dit : \"J'aime le samedi. Il n'y a pas d'école !\"",
  },
  {
    q: "Selon Brian, quel jour est le premier jour de la semaine ?",
    correct: "Le lundi",
    distractors: ["Le dimanche", "Le samedi", "Le mardi"],
    explanation: "Brian dit : \"Moi, j'aime le lundi. C'est le premier jour de la semaine.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Brian : Achieng, que fais-tu le ", after: " ?", answer: "matin", gloss: "Brian asks what Achieng does in the morning." },
  { before: "Achieng : Le matin, je me ", after: " et je prends le petit déjeuner.", answer: "lève", gloss: "Achieng gets up in the morning." },
  { before: "Achieng : À midi, je prends le déjeuner à l'", after: ".", answer: "école", gloss: "Achieng has lunch at school." },
  { before: "Achieng : Le soir, je ", after: " avec mes amis.", answer: "joue", gloss: "Achieng plays with friends in the evening." },
  { before: "Achieng : La nuit, je ", after: ".", answer: "dors", gloss: "Achieng sleeps at night." },
  { before: "Brian : Quel est ton jour préféré de la ", after: " ?", answer: "semaine", gloss: "Brian asks Achieng's favourite day of the week." },
  { before: "Achieng : J'aime le ", after: ". Il n'y a pas d'école !", answer: "samedi", gloss: "Achieng's favourite day is Saturday." },
  { before: "Brian : Moi, j'aime le ", after: ". C'est le premier jour de la semaine.", answer: "lundi", gloss: "Brian's favourite day is Monday." },
  { before: "Brian : C'est le premier jour de la ", after: ".", answer: "semaine", gloss: "Monday is the first day of the week." },
  { before: "Achieng : Chaque ", after: " est important, Brian.", answer: "jour", gloss: "Achieng says every day is important." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "me", "lève", "."], sentence: "Je me lève." },
  { chunks: ["Le", "soir", "je", "joue", "."], sentence: "Le soir je joue." },
  { chunks: ["La", "nuit", "je", "dors", "."], sentence: "La nuit je dors." },
  { chunks: ["Quel", "est", "ton", "jour", "préféré", "?"], sentence: "Quel est ton jour préféré ?" },
];

export const timeReading: Skill = {
  id: "g5-fr-r-time",
  code: "R.4",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: moments of the day and days of the week",
  description: "Read a short French dialogue about Achieng and Brian describing their daily routine and favourite day of the week, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what Achieng and Brian say.",
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
      hint: "Look at what each speaker says about the moments of the day.",
      explanation: q.explanation,
    };
  },
};
