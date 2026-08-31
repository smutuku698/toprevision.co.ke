import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Kevin : Excuse-moi, Wanjiru, où est la bibliothèque ?",
  "Wanjiru : Elle est à côté de la salle de classe.",
  "Kevin : Et la cantine, elle est où ?",
  "Wanjiru : Elle est en face du terrain de jeux.",
  "Kevin : Et les toilettes ?",
  "Wanjiru : Elles sont derrière le bâtiment principal.",
  "Kevin : Et la salle de professeurs ?",
  "Wanjiru : Elle est près de la bibliothèque.",
  "Kevin : Merci beaucoup, Wanjiru ! Je vais d'abord à la bibliothèque.",
  "Wanjiru : De rien, Kevin ! Bonne journée.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "The library is next to the classroom.", isTrue: true },
  { text: "The library is behind the classroom.", isTrue: false },
  { text: "The canteen is opposite the playground.", isTrue: true },
  { text: "The canteen is next to the library.", isTrue: false },
  { text: "The toilets are behind the main building.", isTrue: true },
  { text: "The toilets are in front of the main building.", isTrue: false },
  { text: "The staff room is near the library.", isTrue: true },
  { text: "The staff room is far from the library.", isTrue: false },
  { text: "Kevin thanks Wanjiru.", isTrue: true },
  { text: "Kevin goes to the library first.", isTrue: true },
  { text: "Kevin goes to the canteen first.", isTrue: false },
  { text: "Wanjiru wishes Kevin a good day.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Où est la bibliothèque ?", meaning: "Where is the library?" },
  { phrase: "Elle est à côté de la salle de classe.", meaning: "It is next to the classroom." },
  { phrase: "Et la cantine, elle est où ?", meaning: "And the canteen, where is it?" },
  { phrase: "Elle est en face du terrain de jeux.", meaning: "It is opposite the playground." },
  { phrase: "Et les toilettes ?", meaning: "And the toilets?" },
  { phrase: "Elles sont derrière le bâtiment principal.", meaning: "They are behind the main building." },
  { phrase: "Et la salle de professeurs ?", meaning: "And the staff room?" },
  { phrase: "Elle est près de la bibliothèque.", meaning: "It is near the library." },
  { phrase: "Merci beaucoup !", meaning: "Thank you very much!" },
  { phrase: "Je vais d'abord à la bibliothèque.", meaning: "I'm going to the library first." },
  { phrase: "De rien.", meaning: "You're welcome." },
  { phrase: "Bonne journée.", meaning: "Have a good day." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Où est la bibliothèque ?",
    correct: "À côté de la salle de classe",
    distractors: ["Derrière le bâtiment principal", "En face du terrain de jeux", "Près de la cantine"],
    explanation: "Wanjiru says: \"Elle est à côté de la salle de classe.\"",
  },
  {
    q: "Où est la cantine ?",
    correct: "En face du terrain de jeux",
    distractors: ["À côté de la bibliothèque", "Derrière la salle de professeurs", "Près des toilettes"],
    explanation: "Wanjiru says: \"Elle est en face du terrain de jeux.\"",
  },
  {
    q: "Où sont les toilettes ?",
    correct: "Derrière le bâtiment principal",
    distractors: ["En face de la cantine", "À côté de la bibliothèque", "Près du terrain de jeux"],
    explanation: "Wanjiru says: \"Elles sont derrière le bâtiment principal.\"",
  },
  {
    q: "Où va Kevin d'abord ?",
    correct: "À la bibliothèque",
    distractors: ["À la cantine", "Aux toilettes", "À la salle de professeurs"],
    explanation: "Kevin says: \"Je vais d'abord à la bibliothèque.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Kevin : Excuse-moi, Wanjiru, où est la ", after: " ?", answer: "bibliothèque", gloss: "Excuse me, Wanjiru, where is the library?" },
  { before: "Wanjiru : Elle est à côté de la salle de ", after: ".", answer: "classe", gloss: "It is next to the classroom." },
  { before: "Kevin : Et la ", after: ", elle est où ?", answer: "cantine", gloss: "And the canteen, where is it?" },
  { before: "Wanjiru : Elle est en face du terrain de ", after: ".", answer: "jeux", gloss: "It is opposite the playground." },
  { before: "Kevin : Et les ", after: " ?", answer: "toilettes", gloss: "And the toilets?" },
  { before: "Wanjiru : Elles sont derrière le bâtiment ", after: ".", answer: "principal", gloss: "They are behind the main building." },
  { before: "Kevin : Et la salle de ", after: " ?", answer: "professeurs", gloss: "And the staff room?" },
  { before: "Wanjiru : Elle est ", after: " de la bibliothèque.", answer: "près", gloss: "It is near the library." },
  { before: "Kevin : Merci beaucoup, Wanjiru ! Je vais ", after: " à la bibliothèque.", answer: "d'abord", gloss: "Thank you very much, Wanjiru! I'm going to the library first." },
  { before: "Wanjiru : De rien, Kevin ! Bonne ", after: ".", answer: "journée", gloss: "You're welcome, Kevin! Have a good day." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Elle", "est", "à", "côté", "de", "la", "salle", "de", "classe", "."], sentence: "Elle est à côté de la salle de classe." },
  { chunks: ["Elle", "est", "en", "face", "du", "terrain", "de", "jeux", "."], sentence: "Elle est en face du terrain de jeux." },
];

export const gettingAroundReading: Skill = {
  id: "g6-fr-r-gettingAround",
  code: "R.9",
  subjectId: "french",
  strandId: "g6-fr-reading",
  grade: 6,
  title: "Reading: getting around the school",
  description: "Read a short French dialogue between Kevin and Wanjiru about locating school facilities (the library, canteen, toilets, and staff room), and answer comprehension questions.",
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
