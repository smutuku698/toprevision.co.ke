import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

type Tag = "greeting" | "question" | "response" | "farewell";

const PHRASES: { phrase: string; meaning: string; tag: Tag }[] = [
  { phrase: "Hallo!", meaning: "Hello!", tag: "greeting" },
  { phrase: "Guten Morgen!", meaning: "Good morning!", tag: "greeting" },
  { phrase: "Guten Tag!", meaning: "Good day!", tag: "greeting" },
  { phrase: "Guten Abend!", meaning: "Good evening!", tag: "greeting" },
  { phrase: "Wie geht's?", meaning: "How are you? (informal)", tag: "question" },
  { phrase: "Wie heißt du?", meaning: "What is your name? (informal)", tag: "question" },
  { phrase: "Woher kommst du?", meaning: "Where are you from? (informal)", tag: "question" },
  { phrase: "Wie alt bist du?", meaning: "How old are you? (informal)", tag: "question" },
  { phrase: "Mir geht es gut, danke.", meaning: "I'm doing well, thank you.", tag: "response" },
  { phrase: "Mir geht es prima.", meaning: "I'm doing great.", tag: "response" },
  { phrase: "Ich heiße Amani.", meaning: "My name is Amani.", tag: "response" },
  { phrase: "Ich komme aus Kenia.", meaning: "I come from Kenya.", tag: "response" },
  { phrase: "Ich bin dreizehn Jahre alt.", meaning: "I am thirteen years old.", tag: "response" },
  { phrase: "Tschüss!", meaning: "Bye!", tag: "farewell" },
  { phrase: "Bis später!", meaning: "See you later!", tag: "farewell" },
  { phrase: "Bis morgen!", meaning: "See you tomorrow!", tag: "farewell" },
  { phrase: "Auf Wiedersehen!", meaning: "Goodbye!", tag: "farewell" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wie ", after: "?", answer: "geht's", gloss: "Wie geht's? — How are you?" },
  { before: "Mir geht es ", after: ", danke.", answer: "gut", gloss: "Mir geht es gut, danke. — I'm doing well, thanks." },
  { before: "Wie ", after: " du?", answer: "heißt", gloss: "Wie heißt du? — What is your name?" },
  { before: "Ich ", after: " Amani.", answer: "heiße", gloss: "Ich heiße Amani. — My name is Amani." },
  { before: "Woher ", after: " du?", answer: "kommst", gloss: "Woher kommst du? — Where are you from?" },
  { before: "Ich komme aus ", after: ".", answer: "Kenia", gloss: "Ich komme aus Kenia. — I come from Kenya." },
  { before: "", after: " Morgen!", answer: "Guten", gloss: "Guten Morgen! — Good morning!" },
  { before: "", after: " Abend!", answer: "Guten", gloss: "Guten Abend! — Good evening!" },
  { before: "Wie alt ", after: " du?", answer: "bist", gloss: "Wie alt bist du? — How old are you?" },
  { before: "Ich bin dreizehn Jahre ", after: ".", answer: "alt", gloss: "Ich bin dreizehn Jahre alt. — I am thirteen years old." },
  { before: "Bis ", after: "!", answer: "später", gloss: "Bis später! — See you later!" },
  { before: "Auf ", after: "!", answer: "Wiedersehen", gloss: "Auf Wiedersehen! — Goodbye!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie", "heißt", "du", "?"], sentence: "Wie heißt du?" },
  { chunks: ["Ich", "heiße", "Amani", "."], sentence: "Ich heiße Amani." },
  { chunks: ["Woher", "kommst", "du", "?"], sentence: "Woher kommst du?" },
  { chunks: ["Ich", "komme aus", "Kenia", "."], sentence: "Ich komme aus Kenia." },
  { chunks: ["Wie alt", "bist du", "?"], sentence: "Wie alt bist du?" },
  { chunks: ["Ich bin", "dreizehn Jahre", "alt", "."], sentence: "Ich bin dreizehn Jahre alt." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a short note to a new pen pal, asking their name.",
    correct: "Wie heißt du?",
    distractors: ["Wie geht's?", "Woher kommst du?", "Bis später!"],
    explanation: "'Wie heißt du?' is the written form for asking someone's name — the other lines ask something else or say goodbye.",
  },
  {
    note: "You are finishing a friendly letter and want to sign off casually.",
    correct: "Tschüss!",
    distractors: ["Guten Morgen!", "Wie geht's?", "Ich heiße Amani."],
    explanation: "'Tschüss!' is a casual written sign-off — the other options are a greeting, a question, or a self-introduction, not a farewell.",
  },
  {
    note: "In your introduction paragraph, you want to state where you are from.",
    correct: "Ich komme aus Kenia.",
    distractors: ["Wie alt bist du?", "Tschüss!", "Guten Tag!"],
    explanation: "'Ich komme aus Kenia' states your own origin — a question or a farewell would not fit an introduction paragraph.",
  },
  {
    note: "You are writing the opening line of a letter to a friend you'll see again tomorrow.",
    correct: "Bis morgen!",
    distractors: ["Bis später!", "Auf Wiedersehen!", "Wie heißt du?"],
    explanation: "'Bis morgen!' specifically promises to meet again the next day — it fits a closing line about tomorrow, not an opening line, but is the only option matching 'tomorrow'.",
  },
  {
    note: "You are writing a card that opens in the evening, describing when you are writing it.",
    correct: "Guten Abend!",
    distractors: ["Guten Morgen!", "Guten Tag!", "Tschüss!"],
    explanation: "'Guten Abend!' marks evening specifically — the other greetings are tied to different times of day, or are farewells.",
  },
  {
    note: "You want to write down your age in a short self-introduction paragraph.",
    correct: "Ich bin dreizehn Jahre alt.",
    distractors: ["Ich komme aus Kenia.", "Ich heiße Amani.", "Mir geht es gut."],
    explanation: "'Ich bin dreizehn Jahre alt' states your age — the other model sentences state origin, name, or wellbeing instead.",
  },
  {
    note: "In your letter, you want to ask your pen pal how they are feeling.",
    correct: "Wie geht's?",
    distractors: ["Wie heißt du?", "Woher kommst du?", "Wie alt bist du?"],
    explanation: "'Wie geht's?' asks about wellbeing — the other written questions ask for a name, origin, or age instead.",
  },
  {
    note: "You are writing your reply, telling your pen pal you are doing very well.",
    correct: "Mir geht es prima.",
    distractors: ["Wie geht's?", "Ich heiße Amani.", "Tschüss!"],
    explanation: "'Mir geht es prima' is a statement, not a question — it directly answers a wellbeing question with 'I'm doing great'.",
  },
  {
    note: "You are ending a formal-sounding written goodbye to someone you might not see for a while.",
    correct: "Auf Wiedersehen!",
    distractors: ["Bis später!", "Bis morgen!", "Hallo!"],
    explanation: "'Auf Wiedersehen!' is a more general, final-sounding written goodbye — 'Bis später!' and 'Bis morgen!' both promise a specific, soon reunion instead.",
  },
  {
    note: "You are writing the very first line of a get-well card, greeting the reader generally.",
    correct: "Hallo!",
    distractors: ["Tschüss!", "Bis später!", "Bis morgen!"],
    explanation: "'Hallo!' works as a general written greeting to open a card — the other three options are all farewells, unsuitable for an opening line.",
  },
];

export const greetingsWriting: Skill = {
  id: "g7-de-w-greetings",
  code: "W.1",
  subjectId: "german",
  strandId: "g7-de-writing",
  grade: 7,
  title: "Casual greetings and introductions",
  description: "Guided writing — spelling and word order for informal (du-form) greetings, wellbeing questions, and self-introduction.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, PHRASES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        prompt: "Match each written German greeting expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Greetings check in on someone or open a note; questions ask for specific written information back.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const questions = shuffle(rng, PHRASES.filter((p) => p.tag === "question")).slice(0, 3);
      const farewells = shuffle(rng, PHRASES.filter((p) => p.tag === "farewell")).slice(0, 3);
      const chosen = shuffle(rng, [...questions, ...farewells]);
      const correctBucket: Record<string, string> = {};
      for (const p of questions) correctBucket[p.phrase] = "question";
      for (const p of farewells) correctBucket[p.phrase] = "farewell";

      return {
        kind: "categorize",
        prompt: "Sort each written phrase as a Question or a Farewell.",
        items: chosen.map((p) => ({ id: p.phrase, label: p.phrase })),
        buckets: [
          { id: "question", label: "Question" },
          { id: "farewell", label: "Farewell" },
        ],
        correctBucket,
        hint: "Questions end with a question mark and ask for information; farewells close a note or letter.",
        explanation: [...questions, ...farewells].map((p) => `"${p.phrase}" is a ${correctBucket[p.phrase]}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written German sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about how you would write this greeting, question, or self-introduction.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct, informal German sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Informal questions in German usually start with a question word, and the verb comes second.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which German sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about what this specific piece of writing needs to say, not just any greeting phrase.",
      explanation: s.explanation,
    };
  },
};
