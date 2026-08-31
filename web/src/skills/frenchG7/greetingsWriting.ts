import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "greeting" | "question" | "response" | "farewell";

const PHRASES: { phrase: string; meaning: string; tag: Tag }[] = [
  { phrase: "Salut !", meaning: "Hi!", tag: "greeting" },
  { phrase: "Bonjour !", meaning: "Hello!/Good day!", tag: "greeting" },
  { phrase: "Bonsoir !", meaning: "Good evening!", tag: "greeting" },
  { phrase: "Coucou !", meaning: "Hey there!", tag: "greeting" },
  { phrase: "Comment tu t'appelles ?", meaning: "What is your name? (informal)", tag: "question" },
  { phrase: "Quel âge as-tu ?", meaning: "How old are you? (informal)", tag: "question" },
  { phrase: "Tu habites où ?", meaning: "Where do you live? (informal)", tag: "question" },
  { phrase: "Quoi de neuf ?", meaning: "What's new?", tag: "question" },
  { phrase: "Je m'appelle Amani.", meaning: "My name is Amani.", tag: "response" },
  { phrase: "J'ai treize ans.", meaning: "I am thirteen years old.", tag: "response" },
  { phrase: "J'habite à Nairobi.", meaning: "I live in Nairobi.", tag: "response" },
  { phrase: "Ça va bien, merci.", meaning: "I'm doing well, thank you.", tag: "response" },
  { phrase: "Au revoir !", meaning: "Goodbye!", tag: "farewell" },
  { phrase: "À bientôt !", meaning: "See you soon!", tag: "farewell" },
  { phrase: "À demain !", meaning: "See you tomorrow!", tag: "farewell" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Comment tu ", after: " ?", answer: "t'appelles", gloss: "Comment tu t'appelles ? — What is your name?" },
  { before: "Je ", after: " Amani.", answer: "m'appelle", gloss: "Je m'appelle Amani. — My name is Amani." },
  { before: "Quel ", after: " as-tu ?", answer: "âge", gloss: "Quel âge as-tu ? — How old are you?" },
  { before: "J'ai treize ", after: ".", answer: "ans", gloss: "J'ai treize ans. — I am thirteen years old." },
  { before: "Tu habites ", after: " ?", answer: "où", gloss: "Tu habites où ? — Where do you live?" },
  { before: "J'habite à ", after: ".", answer: "Nairobi", gloss: "J'habite à Nairobi. — I live in Nairobi." },
  { before: "", after: " de neuf ?", answer: "Quoi", gloss: "Quoi de neuf ? — What's new?" },
  { before: "À ", after: " !", answer: "bientôt", gloss: "À bientôt ! — See you soon!" },
  { before: "À ", after: " !", answer: "demain", gloss: "À demain ! — See you tomorrow!" },
  { before: "Au ", after: " !", answer: "revoir", gloss: "Au revoir ! — Goodbye!" },
  { before: "", after: " !", answer: "Bonsoir", gloss: "Bonsoir ! — Good evening!" },
  { before: "", after: " !", answer: "Coucou", gloss: "Coucou ! — Hey there!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Comment", "tu", "t'appelles", "?"], sentence: "Comment tu t'appelles ?" },
  { chunks: ["Je", "m'appelle", "Amani", "."], sentence: "Je m'appelle Amani." },
  { chunks: ["Tu", "habites", "où", "?"], sentence: "Tu habites où ?" },
  { chunks: ["J'habite", "à", "Nairobi", "."], sentence: "J'habite à Nairobi." },
  { chunks: ["Quel", "âge", "as-tu", "?"], sentence: "Quel âge as-tu ?" },
  { chunks: ["J'ai", "treize", "ans", "."], sentence: "J'ai treize ans." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a short note to a new pen pal, asking their name.",
    correct: "Comment tu t'appelles ?",
    distractors: ["Tu habites où ?", "Quel âge as-tu ?", "À bientôt !"],
    explanation: "'Comment tu t'appelles ?' is the written form for asking someone's name — the other lines ask something else or say goodbye.",
  },
  {
    note: "You are finishing a friendly letter and want to sign off casually.",
    correct: "Salut !",
    distractors: ["Bonjour !", "Quel âge as-tu ?", "Je m'appelle Amani."],
    explanation: "'Salut !' can be a casual written sign-off — the other options are a greeting, a question, or a self-introduction, not a farewell.",
  },
  {
    note: "In your introduction paragraph, you want to state where you live.",
    correct: "J'habite à Nairobi.",
    distractors: ["Quel âge as-tu ?", "Au revoir !", "Bonjour !"],
    explanation: "'J'habite à Nairobi' states your own home — a question or a farewell would not fit an introduction paragraph.",
  },
  {
    note: "You are writing the opening line of a letter to a friend you'll see again tomorrow.",
    correct: "À demain !",
    distractors: ["À bientôt !", "Au revoir !", "Comment tu t'appelles ?"],
    explanation: "'À demain !' specifically promises to meet again the next day — the other options don't specify tomorrow.",
  },
  {
    note: "You are writing a card that opens in the evening, describing when you are writing it.",
    correct: "Bonsoir !",
    distractors: ["Bonjour !", "Salut !", "Au revoir !"],
    explanation: "'Bonsoir !' marks evening specifically — the other greetings are used earlier in the day, or are farewells.",
  },
  {
    note: "You want to write down your age in a short self-introduction paragraph.",
    correct: "J'ai treize ans.",
    distractors: ["J'habite à Nairobi.", "Je m'appelle Amani.", "Ça va bien, merci."],
    explanation: "'J'ai treize ans' states your age — the other model sentences state home, name, or wellbeing instead.",
  },
  {
    note: "In your letter, you want to ask your pen pal where they live.",
    correct: "Tu habites où ?",
    distractors: ["Comment tu t'appelles ?", "Quel âge as-tu ?", "Ça va bien, merci."],
    explanation: "'Tu habites où ?' asks about home — the other written questions or statements ask a name, age, or state wellbeing instead.",
  },
  {
    note: "You are writing your reply, telling your pen pal you are doing well.",
    correct: "Ça va bien, merci.",
    distractors: ["Tu habites où ?", "Je m'appelle Amani.", "Au revoir !"],
    explanation: "'Ça va bien, merci' is a statement, not a question — it directly answers a wellbeing question with 'I'm doing well, thanks'.",
  },
  {
    note: "You are ending a general written goodbye to someone you might not see for a while.",
    correct: "Au revoir !",
    distractors: ["À bientôt !", "À demain !", "Salut !"],
    explanation: "'Au revoir !' is a more general, final-sounding written goodbye — 'À bientôt !' and 'À demain !' both promise a specific, soon reunion instead.",
  },
  {
    note: "You are writing the very first line of a get-well card, greeting the reader generally.",
    correct: "Bonjour !",
    distractors: ["Au revoir !", "À bientôt !", "À demain !"],
    explanation: "'Bonjour !' works as a general written greeting to open a card — the other three options are all farewells, unsuitable for an opening line.",
  },
];

export const greetingsWriting: Skill = {
  id: "g7-fr-w-greetings",
  code: "W.1",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "Casual greetings and introductions",
  description: "Guided writing — spelling and word order for informal (tu-form) greetings, wellbeing questions, and self-introduction.",
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
        prompt: "Match each written French greeting expression to its English meaning.",
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
        prompt: "Fill in the missing word to complete the written French sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
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
        prompt: "Arrange the words/phrases to write a correct, informal French sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Informal questions in French often keep the subject-verb order and add a question word.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about what this specific piece of writing needs to say, not just any greeting phrase.",
      explanation: s.explanation,
    };
  },
};
