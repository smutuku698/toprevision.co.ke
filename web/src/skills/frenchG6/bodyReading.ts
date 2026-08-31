import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Wafula : Njeri, tu te réveilles tôt le matin ?",
  "Njeri : Oui, je me réveille à six heures.",
  "Wafula : Qu'est-ce que tu fais d'abord ?",
  "Njeri : D'abord, je me lave le visage et les mains.",
  "Wafula : Et après ?",
  "Njeri : Je me brosse les dents et je me peigne les cheveux.",
  "Wafula : Tu te douches aussi ?",
  "Njeri : Oui, je me douche tous les matins.",
  "Wafula : Pourquoi le toilettage est-il important ?",
  "Njeri : Parce que ça évite les maladies et ça sent bon !",
  "Wafula : Tu as raison. Il faut aussi couper les ongles régulièrement.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Njeri wakes up at six o'clock.", isTrue: true },
  { text: "Njeri wakes up at eight o'clock.", isTrue: false },
  { text: "Njeri washes her face and hands first.", isTrue: true },
  { text: "Njeri brushes her teeth before washing her face.", isTrue: false },
  { text: "Njeri brushes her teeth and combs her hair.", isTrue: true },
  { text: "Njeri never showers.", isTrue: false },
  { text: "Njeri showers every morning.", isTrue: true },
  { text: "Wafula asks why grooming is important.", isTrue: true },
  { text: "Njeri says grooming prevents illness and smells good.", isTrue: true },
  { text: "Njeri says grooming is not important.", isTrue: false },
  { text: "Wafula says nails should be cut regularly.", isTrue: true },
  { text: "Wafula says nails should never be cut.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Tu te réveilles tôt le matin ?", meaning: "Do you wake up early in the morning?" },
  { phrase: "Je me réveille à six heures.", meaning: "I wake up at six o'clock." },
  { phrase: "Je me lave le visage et les mains.", meaning: "I wash my face and hands." },
  { phrase: "Je me brosse les dents.", meaning: "I brush my teeth." },
  { phrase: "Je me peigne les cheveux.", meaning: "I comb my hair." },
  { phrase: "Tu te douches aussi ?", meaning: "Do you shower too?" },
  { phrase: "Je me douche tous les matins.", meaning: "I shower every morning." },
  { phrase: "Pourquoi le toilettage est-il important ?", meaning: "Why is grooming important?" },
  { phrase: "Ça évite les maladies.", meaning: "It prevents illness." },
  { phrase: "Ça sent bon !", meaning: "It smells good!" },
  { phrase: "Il faut couper les ongles régulièrement.", meaning: "You must cut your nails regularly." },
  { phrase: "Tu as raison.", meaning: "You're right." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Que fait Njeri en premier le matin ?",
    correct: "Elle se lave le visage et les mains",
    distractors: ["Elle se brosse les dents", "Elle se douche", "Elle se peigne les cheveux"],
    explanation: "Njeri says: \"D'abord, je me lave le visage et les mains.\"",
  },
  {
    q: "Que fait Njeri après s'être lavé le visage ?",
    correct: "Elle se brosse les dents et se peigne les cheveux",
    distractors: ["Elle se douche immédiatement", "Elle coupe ses ongles", "Elle se réveille"],
    explanation: "Njeri says: \"Je me brosse les dents et je me peigne les cheveux.\"",
  },
  {
    q: "Pourquoi le toilettage est-il important, selon Njeri ?",
    correct: "Ça évite les maladies et ça sent bon",
    distractors: ["Ça coûte cher", "Ça prend beaucoup de temps", "Ça n'a pas d'importance"],
    explanation: "Njeri says: \"Parce que ça évite les maladies et ça sent bon !\"",
  },
  {
    q: "Que faut-il faire régulièrement, selon Wafula ?",
    correct: "Couper les ongles",
    distractors: ["Se réveiller tard", "Éviter de se laver", "Ne jamais se brosser les dents"],
    explanation: "Wafula says: \"Il faut aussi couper les ongles régulièrement.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wafula : Njeri, tu te réveilles tôt le ", after: " ?", answer: "matin", gloss: "Njeri, do you wake up early in the morning?" },
  { before: "Njeri : Oui, je me réveille à six ", after: ".", answer: "heures", gloss: "Yes, I wake up at six o'clock." },
  { before: "Njeri : D'abord, je me lave le visage et les ", after: ".", answer: "mains", gloss: "First, I wash my face and hands." },
  { before: "Njeri : Je me brosse les ", after: " et je me peigne les cheveux.", answer: "dents", gloss: "I brush my teeth and comb my hair." },
  { before: "Njeri : Je me brosse les dents et je me peigne les ", after: ".", answer: "cheveux", gloss: "I brush my teeth and comb my hair." },
  { before: "Wafula : Tu te ", after: " aussi ?", answer: "douches", gloss: "Do you shower too?" },
  { before: "Njeri : Oui, je me douche tous les ", after: ".", answer: "matins", gloss: "Yes, I shower every morning." },
  { before: "Wafula : Pourquoi le toilettage est-il ", after: " ?", answer: "important", gloss: "Why is grooming important?" },
  { before: "Njeri : Parce que ça évite les ", after: " et ça sent bon !", answer: "maladies", gloss: "Because it prevents illness and it smells good!" },
  { before: "Wafula : Tu as raison. Il faut aussi couper les ", after: " régulièrement.", answer: "ongles", gloss: "You're right. You must also cut your nails regularly." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Je", "me", "lave", "le", "visage", "et", "les", "mains", "."], sentence: "Je me lave le visage et les mains." },
  { chunks: ["Je", "me", "brosse", "les", "dents", "."], sentence: "Je me brosse les dents." },
];

export const bodyReading: Skill = {
  id: "g6-fr-r-body",
  code: "R.7",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: grooming and personal hygiene",
  description: "Read a short French dialogue between Wafula and Njeri about her morning grooming routine, and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check the exact order and details Njeri describes.",
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
