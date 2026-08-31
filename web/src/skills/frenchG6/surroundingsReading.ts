import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Wanjiru : Salut, Otieno ! Où vas-tu ?",
  "Otieno : Je vais à la bibliothèque. Et toi, où vas-tu ?",
  "Wanjiru : Moi, je vais à la cantine. J'ai faim !",
  "Otieno : D'accord. Et après, où allez-vous, toi et Kevin ?",
  "Wanjiru : Nous allons à la salle de classe pour étudier.",
  "Otieno : La bibliothèque est à côté de la salle de classe.",
  "Wanjiru : Ah bon ! Et les toilettes, elles sont où ?",
  "Otieno : Elles sont derrière la cantine.",
  "Wanjiru : Merci ! Il faut prendre soin des installations de l'école.",
  "Otieno : Oui, c'est important. À plus tard !",
  "Wanjiru : À plus tard, Otieno !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Wanjiru asks Otieno where he is going.", isTrue: true },
  { text: "Otieno is going to the library.", isTrue: true },
  { text: "Otieno is going to the canteen.", isTrue: false },
  { text: "Wanjiru is going to the canteen because she is hungry.", isTrue: true },
  { text: "Wanjiru and Kevin are going to the classroom to study.", isTrue: true },
  { text: "The library is next to the classroom.", isTrue: true },
  { text: "The library is behind the classroom.", isTrue: false },
  { text: "The toilets are behind the canteen.", isTrue: true },
  { text: "The toilets are next to the library.", isTrue: false },
  { text: "Wanjiru says it's important to take care of the school facilities.", isTrue: true },
  { text: "Otieno agrees that caring for school facilities is important.", isTrue: true },
  { text: "Wanjiru is the first one to say 'À plus tard'.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Où vas-tu ?", meaning: "Where are you going? (informal, one person)" },
  { phrase: "Je vais à la bibliothèque.", meaning: "I am going to the library." },
  { phrase: "Je vais à la cantine.", meaning: "I am going to the canteen." },
  { phrase: "J'ai faim !", meaning: "I am hungry!" },
  { phrase: "Où allez-vous ?", meaning: "Where are you (all) going? (plural)" },
  { phrase: "Nous allons à la salle de classe.", meaning: "We are going to the classroom." },
  { phrase: "à côté de", meaning: "next to" },
  { phrase: "Les toilettes", meaning: "The toilets" },
  { phrase: "derrière", meaning: "behind" },
  { phrase: "Il faut prendre soin des installations.", meaning: "We must take care of the facilities." },
  { phrase: "À plus tard !", meaning: "See you later!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Où va Otieno ?",
    correct: "À la bibliothèque",
    distractors: ["À la cantine", "Aux toilettes", "À la salle de classe"],
    explanation: "Otieno says: \"Je vais à la bibliothèque.\" — I am going to the library.",
  },
  {
    q: "Pourquoi Wanjiru va-t-elle à la cantine ?",
    correct: "Parce qu'elle a faim",
    distractors: ["Parce qu'elle a soif", "Parce qu'elle doit étudier", "Parce qu'elle cherche Otieno"],
    explanation: "Wanjiru says: \"Moi, je vais à la cantine. J'ai faim !\" — I am hungry!",
  },
  {
    q: "Où est la bibliothèque, par rapport à la salle de classe ?",
    correct: "À côté de la salle de classe",
    distractors: ["Derrière la salle de classe", "Loin de la salle de classe", "En face de la cantine"],
    explanation: "Otieno says: \"La bibliothèque est à côté de la salle de classe.\"",
  },
  {
    q: "Où sont les toilettes ?",
    correct: "Derrière la cantine",
    distractors: ["À côté de la bibliothèque", "Devant la salle de classe", "Près du bureau du directeur"],
    explanation: "Otieno says: \"Elles sont derrière la cantine.\"",
  },
  {
    q: "Que faut-il faire selon Wanjiru, à propos des installations de l'école ?",
    correct: "En prendre soin",
    distractors: ["Les ignorer", "Les éviter", "Les vendre"],
    explanation: "Wanjiru says: \"Il faut prendre soin des installations de l'école.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wanjiru : Salut, Otieno ! Où ", after: "-tu ?", answer: "vas", gloss: "Wanjiru asks Otieno where he is going." },
  { before: "Otieno : Je vais à la ", after: ". Et toi, où vas-tu ?", answer: "bibliothèque", gloss: "Otieno is going to the library." },
  { before: "Wanjiru : Moi, je vais à la ", after: ". J'ai faim !", answer: "cantine", gloss: "Wanjiru is going to the canteen." },
  { before: "Otieno : D'accord. Et après, où ", after: "-vous, toi et Kevin ?", answer: "allez", gloss: "Otieno asks where Wanjiru and Kevin are going (plural)." },
  { before: "Wanjiru : Nous allons à la salle de ", after: " pour étudier.", answer: "classe", gloss: "They are going to the classroom to study." },
  { before: "Otieno : La bibliothèque est à ", after: " de la salle de classe.", answer: "côté", gloss: "The library is next to the classroom." },
  { before: "Wanjiru : Ah bon ! Et les ", after: ", elles sont où ?", answer: "toilettes", gloss: "Wanjiru asks where the toilets are." },
  { before: "Otieno : Elles sont ", after: " la cantine.", answer: "derrière", gloss: "The toilets are behind the canteen." },
  { before: "Wanjiru : Merci ! Il faut prendre ", after: " des installations de l'école.", answer: "soin", gloss: "We must take care of the school facilities." },
  { before: "Otieno : Oui, c'est ", after: ". À plus tard !", answer: "important", gloss: "Otieno agrees it is important." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Où", "vas-tu", "?"], sentence: "Où vas-tu ?" },
  { chunks: ["Où", "allez-vous", "?"], sentence: "Où allez-vous ?" },
  { chunks: ["Je", "vais", "à", "la", "bibliothèque", "."], sentence: "Je vais à la bibliothèque." },
];

export const surroundingsReading: Skill = {
  id: "g6-fr-r-surroundings",
  code: "R.3",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: my surroundings",
  description: "Read a short French dialogue about two learners locating facilities around their school, using 'Où vas-tu ?' and 'Où allez-vous ?', and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly where each person is going.",
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
