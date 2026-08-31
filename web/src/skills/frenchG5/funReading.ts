import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Mumbi : Kevin, qu'est-ce que tu aimes faire dans ton temps libre ?",
  "Kevin : J'aime dessiner. Et toi ?",
  "Mumbi : Moi, j'aime chanter et danser.",
  "Kevin : Tu n'aimes pas regarder la télé ?",
  "Mumbi : Non, je n'aime pas regarder la télé.",
  "Kevin : Qu'est-ce que ta sœur fait pour s'amuser ?",
  "Mumbi : Elle danse tous les jours.",
  "Kevin : Et ton frère, qu'est-ce qu'il fait ?",
  "Mumbi : Il chante avec ses amis.",
  "Kevin : Moi, je n'aime pas danser, mais j'aime dessiner des animaux.",
  "Mumbi : C'est bien de pratiquer un passe-temps !",
  "Kevin : Oui, ça aide à se détendre.",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Kevin likes to draw (dessiner).", isTrue: true },
  { text: "Kevin likes to sing.", isTrue: false },
  { text: "Mumbi likes singing and dancing.", isTrue: true },
  { text: "Mumbi likes watching television.", isTrue: false },
  { text: "Mumbi does not like watching television.", isTrue: true },
  { text: "Mumbi's sister dances every day.", isTrue: true },
  { text: "Mumbi's brother sings with his friends.", isTrue: true },
  { text: "Mumbi's brother dances every day.", isTrue: false },
  { text: "Kevin likes to draw animals.", isTrue: true },
  { text: "Kevin likes dancing.", isTrue: false },
  { text: "Mumbi says practising a hobby is good.", isTrue: true },
  { text: "Kevin says a hobby helps you relax.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Qu'est-ce que tu aimes faire dans ton temps libre ?", meaning: "What do you like to do in your free time?" },
  { phrase: "J'aime dessiner.", meaning: "I like drawing." },
  { phrase: "J'aime chanter et danser.", meaning: "I like singing and dancing." },
  { phrase: "Je n'aime pas regarder la télé.", meaning: "I don't like watching television." },
  { phrase: "Qu'est-ce qu'elle fait pour s'amuser ?", meaning: "What does she do to have fun?" },
  { phrase: "Elle danse tous les jours.", meaning: "She dances every day." },
  { phrase: "Qu'est-ce qu'il fait ?", meaning: "What does he do?" },
  { phrase: "Il chante avec ses amis.", meaning: "He sings with his friends." },
  { phrase: "Je n'aime pas danser.", meaning: "I don't like dancing." },
  { phrase: "C'est bien de pratiquer un passe-temps !", meaning: "It's good to practise a hobby!" },
  { phrase: "Ça aide à se détendre.", meaning: "It helps you relax." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Qu'est-ce que Kevin aime faire ?",
    correct: "Dessiner",
    distractors: ["Chanter", "Danser", "Regarder la télé"],
    explanation: "Kevin dit : \"J'aime dessiner.\"",
  },
  {
    q: "Qu'est-ce que Mumbi aime faire ?",
    correct: "Chanter et danser",
    distractors: ["Dessiner et lire", "Regarder la télé", "Nager"],
    explanation: "Mumbi dit : \"Moi, j'aime chanter et danser.\"",
  },
  {
    q: "Est-ce que Mumbi aime regarder la télé ?",
    correct: "Non, elle n'aime pas ça",
    distractors: ["Oui, beaucoup", "Elle ne sait pas", "Oui, un peu"],
    explanation: "Mumbi dit : \"Non, je n'aime pas regarder la télé.\"",
  },
  {
    q: "Que fait la sœur de Mumbi pour s'amuser ?",
    correct: "Elle danse tous les jours",
    distractors: ["Elle chante", "Elle dessine", "Elle regarde la télé"],
    explanation: "Mumbi dit : \"Elle danse tous les jours.\"",
  },
  {
    q: "Que fait le frère de Mumbi ?",
    correct: "Il chante avec ses amis",
    distractors: ["Il danse seul", "Il dessine des animaux", "Il regarde la télé"],
    explanation: "Mumbi dit : \"Il chante avec ses amis.\"",
  },
  {
    q: "Qu'est-ce que Kevin aime dessiner ?",
    correct: "Des animaux",
    distractors: ["Des maisons", "Des voitures", "Des fleurs"],
    explanation: "Kevin dit : \"J'aime dessiner des animaux.\"",
  },
  {
    q: "Est-ce que Kevin aime danser ?",
    correct: "Non, il n'aime pas danser",
    distractors: ["Oui, il adore danser", "Il ne sait pas danser", "Oui, un peu"],
    explanation: "Kevin dit : \"Je n'aime pas danser, mais j'aime dessiner des animaux.\"",
  },
  {
    q: "Selon Kevin, à quoi sert un passe-temps ?",
    correct: "Ça aide à se détendre",
    distractors: ["Ça aide à courir vite", "Ça aide à cuisiner", "Ça n'aide à rien"],
    explanation: "Kevin dit : \"Oui, ça aide à se détendre.\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mumbi : Kevin, qu'est-ce que tu aimes faire dans ton temps ", after: " ?", answer: "libre", gloss: "Mumbi asks what Kevin likes to do in his free time." },
  { before: "Kevin : J'aime ", after: ". Et toi ?", answer: "dessiner", gloss: "Kevin likes drawing." },
  { before: "Mumbi : Moi, j'aime chanter et ", after: ".", answer: "danser", gloss: "Mumbi likes singing and dancing." },
  { before: "Kevin : Tu n'aimes pas regarder la ", after: " ?", answer: "télé", gloss: "Kevin asks if Mumbi does not like TV." },
  { before: "Mumbi : Non, je n'aime pas regarder la ", after: ".", answer: "télé", gloss: "Mumbi does not like watching TV." },
  { before: "Mumbi : Elle ", after: " tous les jours.", answer: "danse", gloss: "Mumbi's sister dances every day." },
  { before: "Mumbi : Il ", after: " avec ses amis.", answer: "chante", gloss: "Mumbi's brother sings with his friends." },
  { before: "Kevin : Moi, je n'aime pas danser, mais j'aime dessiner des ", after: ".", answer: "animaux", gloss: "Kevin likes to draw animals." },
  { before: "Mumbi : C'est bien de pratiquer un ", after: " !", answer: "passe-temps", gloss: "Mumbi says practising a hobby is good." },
  { before: "Kevin : Oui, ça aide à se ", after: ".", answer: "détendre", gloss: "Kevin says it helps you relax." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'aime", "chanter", "et", "danser", "."], sentence: "J'aime chanter et danser." },
  { chunks: ["Je", "n'aime", "pas", "regarder", "la", "télé", "."], sentence: "Je n'aime pas regarder la télé." },
  { chunks: ["Elle", "danse", "tous", "les", "jours", "."], sentence: "Elle danse tous les jours." },
  { chunks: ["Qu'est-ce", "qu'il", "fait", "?"], sentence: "Qu'est-ce qu'il fait ?" },
];

export const funReading: Skill = {
  id: "g5-fr-r-fun",
  code: "R.5",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: fun and enjoyment",
  description: "Read a short French dialogue about Mumbi and Kevin describing their favourite hobbies, likes and dislikes, then answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what each speaker likes or dislikes.",
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
      hint: "Look at what each speaker actually says they like or dislike doing.",
      explanation: q.explanation,
    };
  },
};
