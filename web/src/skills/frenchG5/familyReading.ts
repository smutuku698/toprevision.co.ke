import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Wanjiru : Otieno, voici une photo de ma famille.",
  "Otieno : Montre-moi ! Qui est-ce, le monsieur ?",
  "Wanjiru : C'est mon père. Il s'appelle David. Il est agriculteur.",
  "Otieno : Et ta mère ?",
  "Wanjiru : Ma mère s'appelle Faith. Elle est enseignante.",
  "Otieno : Tu as des frères et sœurs ?",
  "Wanjiru : Oui, j'ai un frère et une sœur.",
  "Otieno : Comment s'appellent-ils ?",
  "Wanjiru : Mon frère s'appelle Brian et ma sœur s'appelle Achieng.",
  "Otieno : Quel âge a ta sœur ?",
  "Wanjiru : Achieng a huit ans.",
  "Otieno : Ta famille nucléaire est belle, Wanjiru !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Wanjiru shows Otieno a photo of her family.", isTrue: true },
  { text: "Wanjiru's father is called David.", isTrue: true },
  { text: "Wanjiru's father is a doctor.", isTrue: false },
  { text: "Wanjiru's mother is a teacher.", isTrue: true },
  { text: "Wanjiru's mother is called Achieng.", isTrue: false },
  { text: "Wanjiru has one brother and one sister.", isTrue: true },
  { text: "Wanjiru has two brothers.", isTrue: false },
  { text: "Wanjiru's brother is called Brian.", isTrue: true },
  { text: "Wanjiru's sister is called Faith.", isTrue: false },
  { text: "Achieng is eight years old.", isTrue: true },
  { text: "Otieno says the nuclear family is beautiful.", isTrue: true },
  { text: "Wanjiru's father is a farmer.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Voici une photo de ma famille.", meaning: "Here is a photo of my family." },
  { phrase: "Qui est-ce, le monsieur ?", meaning: "Who is this, the man?" },
  { phrase: "Il est agriculteur.", meaning: "He is a farmer." },
  { phrase: "Elle est enseignante.", meaning: "She is a teacher." },
  { phrase: "Tu as des frères et sœurs ?", meaning: "Do you have brothers and sisters?" },
  { phrase: "J'ai un frère et une sœur.", meaning: "I have one brother and one sister." },
  { phrase: "Comment s'appellent-ils ?", meaning: "What are their names?" },
  { phrase: "Mon frère s'appelle Brian.", meaning: "My brother is called Brian." },
  { phrase: "Ma sœur s'appelle Achieng.", meaning: "My sister is called Achieng." },
  { phrase: "Quel âge a ta sœur ?", meaning: "How old is your sister?" },
  { phrase: "Ta famille nucléaire est belle !", meaning: "Your nuclear family is beautiful!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel est le métier du père de Wanjiru ?",
    correct: "Agriculteur",
    distractors: ["Enseignant", "Médecin", "Infirmier"],
    explanation: "Wanjiru dit : \"C'est mon père. Il s'appelle David. Il est agriculteur.\"",
  },
  {
    q: "Quel est le métier de la mère de Wanjiru ?",
    correct: "Enseignante",
    distractors: ["Agricultrice", "Médecin", "Infirmière"],
    explanation: "Wanjiru dit : \"Ma mère s'appelle Faith. Elle est enseignante.\"",
  },
  {
    q: "Combien de frères et sœurs Wanjiru a-t-elle ?",
    correct: "Un frère et une sœur",
    distractors: ["Deux frères", "Deux sœurs", "Aucun"],
    explanation: "Wanjiru dit : \"Oui, j'ai un frère et une sœur.\"",
  },
  {
    q: "Comment s'appelle le frère de Wanjiru ?",
    correct: "Brian",
    distractors: ["Otieno", "David", "Kevin"],
    explanation: "Wanjiru dit : \"Mon frère s'appelle Brian et ma sœur s'appelle Achieng.\"",
  },
  {
    q: "Comment s'appelle la sœur de Wanjiru ?",
    correct: "Achieng",
    distractors: ["Faith", "Njeri", "Mumbi"],
    explanation: "Wanjiru dit : \"Mon frère s'appelle Brian et ma sœur s'appelle Achieng.\"",
  },
  {
    q: "Quel âge a Achieng ?",
    correct: "Huit ans",
    distractors: ["Sept ans", "Neuf ans", "Dix ans"],
    explanation: "Wanjiru dit : \"Achieng a huit ans.\"",
  },
  {
    q: "Comment s'appelle le père de Wanjiru ?",
    correct: "David",
    distractors: ["Brian", "Otieno", "Kevin"],
    explanation: "Wanjiru dit : \"C'est mon père. Il s'appelle David.\"",
  },
  {
    q: "Que dit Otieno à la fin du dialogue ?",
    correct: "Ta famille nucléaire est belle",
    distractors: ["Ta famille est grande", "Ton frère est gentil", "Ta sœur est belle"],
    explanation: "Otieno dit : \"Ta famille nucléaire est belle, Wanjiru !\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wanjiru : Otieno, voici une photo de ma ", after: ".", answer: "famille", gloss: "Wanjiru shows Otieno a photo of her family." },
  { before: "Wanjiru : C'est mon père. Il s'appelle ", after: ". Il est agriculteur.", answer: "David", gloss: "Wanjiru's father is called David." },
  { before: "Wanjiru : C'est mon père. Il s'appelle David. Il est ", after: ".", answer: "agriculteur", gloss: "Wanjiru's father is a farmer." },
  { before: "Wanjiru : Ma mère s'appelle Faith. Elle est ", after: ".", answer: "enseignante", gloss: "Wanjiru's mother is a teacher." },
  { before: "Wanjiru : Oui, j'ai un frère et une ", after: ".", answer: "sœur", gloss: "Wanjiru has one sister." },
  { before: "Wanjiru : Mon frère s'appelle ", after: " et ma sœur s'appelle Achieng.", answer: "Brian", gloss: "Wanjiru's brother is called Brian." },
  { before: "Wanjiru : Mon frère s'appelle Brian et ma sœur s'appelle ", after: ".", answer: "Achieng", gloss: "Wanjiru's sister is called Achieng." },
  { before: "Wanjiru : ", after: " a huit ans.", answer: "Achieng", gloss: "Achieng is eight years old." },
  { before: "Otieno : Ta famille ", after: " est belle, Wanjiru !", answer: "nucléaire", gloss: "Otieno says the nuclear family is beautiful." },
  { before: "Otieno : Quel ", after: " a ta sœur ?", answer: "âge", gloss: "Otieno asks Achieng's age." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'ai", "un", "frère", "et", "une", "sœur", "."], sentence: "J'ai un frère et une sœur." },
  { chunks: ["Elle", "est", "enseignante", "."], sentence: "Elle est enseignante." },
  { chunks: ["Il", "est", "agriculteur", "."], sentence: "Il est agriculteur." },
  { chunks: ["Quel", "âge", "a", "ta", "sœur", "?"], sentence: "Quel âge a ta sœur ?" },
];

export const familyReading: Skill = {
  id: "g5-fr-r-family",
  code: "R.2",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: my family",
  description: "Read a short French dialogue about Wanjiru describing her nuclear family — a father, mother, brother and sister — and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what it says about each family member.",
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
      hint: "Look at what the dialogue actually says about each family member.",
      explanation: q.explanation,
    };
  },
};
