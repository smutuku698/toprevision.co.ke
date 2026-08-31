import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const LINES = [
  "Faith : Voici une photo de ma classe.",
  "Brian : Qui est grand, là ?",
  "Faith : C'est Kevin. Il est grand et fort.",
  "Brian : Et la fille à côté de lui ?",
  "Faith : C'est Njeri. Elle est petite et mince.",
  "Brian : Et toi, comment es-tu ?",
  "Faith : Moi, je suis petite aussi, mais pas mince, je suis un peu grosse.",
  "Brian : Chacun est différent, et c'est bien ainsi !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kevin is tall.", isTrue: true },
  { text: "Kevin is short.", isTrue: false },
  { text: "Kevin is strong.", isTrue: true },
  { text: "Njeri is tall.", isTrue: false },
  { text: "Njeri is short and slim.", isTrue: true },
  { text: "Faith says she is tall.", isTrue: false },
  { text: "Faith says she is short.", isTrue: true },
  { text: "Brian says everyone is different, and that is good.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Voici une photo de ma classe.", meaning: "Here is a photo of my class." },
  { phrase: "Il est grand et fort.", meaning: "He is tall and strong." },
  { phrase: "Elle est petite et mince.", meaning: "She is short and slim." },
  { phrase: "Comment es-tu ?", meaning: "What are you like?" },
  { phrase: "Je suis un peu grosse.", meaning: "I am a little bigger-built." },
  { phrase: "Chacun est différent.", meaning: "Everyone is different." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Comment est Kevin ?",
    correct: "Grand et fort",
    distractors: ["Petit et mince", "Grand et mince", "Petit et fort"],
    explanation: "Faith says: \"C'est Kevin. Il est grand et fort.\"",
  },
  {
    q: "Comment est Njeri ?",
    correct: "Petite et mince",
    distractors: ["Grande et forte", "Petite et grosse", "Grande et mince"],
    explanation: "Faith says: \"C'est Njeri. Elle est petite et mince.\"",
  },
  {
    q: "Comment Faith se décrit-elle ?",
    correct: "Petite et un peu grosse",
    distractors: ["Grande et mince", "Petite et mince", "Grande et forte"],
    explanation: "Faith says: \"Moi, je suis petite aussi, mais pas mince, je suis un peu grosse.\"",
  },
  {
    q: "Que dit Brian à la fin ?",
    correct: "Chacun est différent, et c'est bien ainsi",
    distractors: ["Tout le monde doit être mince", "Il faut être grand pour être fort", "Personne n'est différent"],
    explanation: "Brian says: \"Chacun est différent, et c'est bien ainsi !\" — Everyone is different, and that's a good thing!",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Faith : C'est Kevin. Il est grand et ", after: ".", answer: "fort", gloss: "It's Kevin. He is tall and strong." },
  { before: "Faith : C'est Njeri. Elle est petite et ", after: ".", answer: "mince", gloss: "It's Njeri. She is short and slim." },
  { before: "Brian : Et toi, comment ", after: "-tu ?", answer: "es", gloss: "And you, what are you like?" },
  { before: "Faith : Moi, je suis petite aussi, mais pas mince, je suis un peu ", after: ".", answer: "grosse", gloss: "Me too, I'm short, but not slim, I'm a bit bigger-built." },
  { before: "Brian : Chacun est ", after: ", et c'est bien ainsi !", answer: "différent", gloss: "Everyone is different, and that's a good thing!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "est", "grand", "et", "fort", "."], sentence: "Il est grand et fort." },
  { chunks: ["Elle", "est", "petite", "et", "mince", "."], sentence: "Elle est petite et mince." },
];

export const bodyReading: Skill = {
  id: "g7-fr-r-body",
  code: "R.7",
  subjectId: "french",
  strandId: "g7-fr-reading",
  grade: 7,
  title: "Reading: physical appearance",
  description: "Read a short French dialogue describing classmates' physical appearance and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what each speaker says about each person.",
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
