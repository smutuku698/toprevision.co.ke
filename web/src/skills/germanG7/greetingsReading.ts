import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const LINES = [
  "Amani: Hallo, Peter! Guten Morgen!",
  "Peter: Guten Morgen, Amani! Wie geht's?",
  "Amani: Mir geht es prima, danke! Und dir?",
  "Peter: Mir geht es auch gut, danke.",
  "Amani: Wie alt bist du?",
  "Peter: Ich bin dreizehn Jahre alt. Und du?",
  "Amani: Ich bin auch dreizehn Jahre alt.",
  "Peter: Woher kommst du?",
  "Amani: Ich komme aus Kisumu. Und du?",
  "Peter: Ich komme aus Nairobi.",
  "Amani: Schön! Ich muss jetzt gehen. Bis später!",
  "Peter: Tschüss, Amani! Bis morgen!",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Amani greets Peter in the morning.", isTrue: true },
  { text: "Peter says he is doing badly.", isTrue: false },
  { text: "Amani is thirteen years old.", isTrue: true },
  { text: "Peter is fourteen years old.", isTrue: false },
  { text: "Amani comes from Nairobi.", isTrue: false },
  { text: "Peter comes from Nairobi.", isTrue: true },
  { text: "Peter is the first one to say 'Tschüss'.", isTrue: true },
  { text: "Peter will see Amani again tomorrow.", isTrue: true },
  { text: "Amani asks Peter's age before asking where he is from.", isTrue: true },
  { text: "Peter says 'Mir geht es auch gut', meaning he also feels well.", isTrue: true },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Guten Morgen!", meaning: "Good morning!" },
  { phrase: "Wie geht's?", meaning: "How are you? (informal)" },
  { phrase: "Mir geht es prima.", meaning: "I'm doing great." },
  { phrase: "Und dir?", meaning: "And you? (informal)" },
  { phrase: "Wie alt bist du?", meaning: "How old are you? (informal)" },
  { phrase: "Ich bin dreizehn Jahre alt.", meaning: "I am thirteen years old." },
  { phrase: "Woher kommst du?", meaning: "Where are you from? (informal)" },
  { phrase: "Ich komme aus Kisumu.", meaning: "I come from Kisumu." },
  { phrase: "Bis später!", meaning: "See you later!" },
  { phrase: "Bis morgen!", meaning: "See you tomorrow!" },
  { phrase: "Tschüss!", meaning: "Bye!" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Wie alt ist Peter?",
    correct: "Dreizehn Jahre alt",
    distractors: ["Zwölf Jahre alt", "Vierzehn Jahre alt", "Fünfzehn Jahre alt"],
    explanation: "Peter says: \"Ich bin dreizehn Jahre alt.\" — I am thirteen years old.",
  },
  {
    q: "Woher kommt Amani?",
    correct: "Aus Kisumu",
    distractors: ["Aus Nairobi", "Aus Mombasa", "Aus Kisii"],
    explanation: "Amani says: \"Ich komme aus Kisumu.\" — I come from Kisumu.",
  },
  {
    q: "Wer sagt zuerst 'Guten Morgen'?",
    correct: "Amani",
    distractors: ["Peter", "Beide zusammen", "Niemand"],
    explanation: "The dialogue opens with Amani's line: \"Hallo, Peter! Guten Morgen!\"",
  },
  {
    q: "Wann sehen sich Amani und Peter wieder?",
    correct: "Morgen (bis morgen)",
    distractors: ["In einer Woche", "Nächstes Jahr", "Nie wieder"],
    explanation: "Peter's closing line is: \"Tschüss, Amani! Bis morgen!\" — they will meet again tomorrow.",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Amani: Hallo, Peter! Guten ", after: "!", answer: "Morgen", gloss: "Amani greets Peter in the morning." },
  { before: "Peter: Guten Morgen, Amani! Wie ", after: "?", answer: "geht's", gloss: "Peter asks how Amani is doing." },
  { before: "Amani: Mir geht es prima, danke! Und ", after: "?", answer: "dir", gloss: "Amani asks Peter the same question back." },
  { before: "Amani: Wie alt ", after: " du?", answer: "bist", gloss: "Amani asks Peter's age." },
  { before: "Peter: Ich bin dreizehn Jahre ", after: ". Und du?", answer: "alt", gloss: "Peter states his age." },
  { before: "Peter: Woher ", after: " du?", answer: "kommst", gloss: "Peter asks where Amani is from." },
  { before: "Amani: Ich komme aus ", after: ". Und du?", answer: "Kisumu", gloss: "Amani states where she is from." },
  { before: "Peter: Ich komme aus ", after: ".", answer: "Nairobi", gloss: "Peter states where he is from." },
  { before: "Amani: Ich muss jetzt gehen. Bis ", after: "!", answer: "später", gloss: "Amani says she has to leave now." },
  { before: "Peter: Tschüss, Amani! Bis ", after: "!", answer: "morgen", gloss: "Peter says he'll see Amani tomorrow." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Amani:", "Wie alt bist du?"], sentence: "Amani: Wie alt bist du?" },
  { chunks: ["Peter:", "Ich bin dreizehn Jahre alt.", "Und du?"], sentence: "Peter: Ich bin dreizehn Jahre alt. Und du?" },
];

export const greetingsReading: Skill = {
  id: "g7-de-r-greetings",
  code: "R.1",
  subjectId: "german",
  strandId: "g7-de-reading",
  grade: 7,
  title: "Reading: casual greetings and introductions",
  description: "Read a short German dialogue of an informal introduction between two learners and answer comprehension questions.",
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
        hint: "Reread the dialogue carefully and check exactly what each speaker says.",
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
        acceptedAnswers: umlautAccepted(item.answer),
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
