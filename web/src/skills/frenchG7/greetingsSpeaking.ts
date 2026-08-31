import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "greeting" | "question" | "response" | "farewell";

const PHRASES: { phrase: string; meaning: string; tag: Tag }[] = [
  { phrase: "Salut !", meaning: "Hi!", tag: "greeting" },
  { phrase: "Coucou !", meaning: "Hey there!", tag: "greeting" },
  { phrase: "Bonjour !", meaning: "Hello!/Good day!", tag: "greeting" },
  { phrase: "Bonsoir !", meaning: "Good evening!", tag: "greeting" },
  { phrase: "Comment tu t'appelles ?", meaning: "What is your name? (informal)", tag: "question" },
  { phrase: "Quel âge as-tu ?", meaning: "How old are you? (informal)", tag: "question" },
  { phrase: "Tu habites où ?", meaning: "Where do you live? (informal)", tag: "question" },
  { phrase: "Ça va ?", meaning: "How are you? (informal)", tag: "question" },
  { phrase: "Quoi de neuf ?", meaning: "What's new?", tag: "question" },
  { phrase: "Je m'appelle Amani.", meaning: "My name is Amani.", tag: "response" },
  { phrase: "J'ai treize ans.", meaning: "I am thirteen years old.", tag: "response" },
  { phrase: "J'habite à Nairobi.", meaning: "I live in Nairobi.", tag: "response" },
  { phrase: "Ça va bien, merci.", meaning: "I'm doing well, thank you.", tag: "response" },
  { phrase: "Ça gaze !", meaning: "I'm doing great! (informal)", tag: "response" },
  { phrase: "Au revoir !", meaning: "Goodbye!", tag: "farewell" },
  { phrase: "À bientôt !", meaning: "See you soon!", tag: "farewell" },
  { phrase: "À demain !", meaning: "See you tomorrow!", tag: "farewell" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Comment tu ", after: " ?", answer: "t'appelles", gloss: "Comment tu t'appelles ? — What is your name?" },
  { before: "Quel ", after: " as-tu ?", answer: "âge", gloss: "Quel âge as-tu ? — How old are you?" },
  { before: "Tu habites ", after: " ?", answer: "où", gloss: "Tu habites où ? — Where do you live?" },
  { before: "Je m'appelle ", after: ".", answer: "Amani", gloss: "Je m'appelle Amani. — My name is Amani." },
  { before: "J'ai treize ", after: ".", answer: "ans", gloss: "J'ai treize ans. — I am thirteen years old." },
  { before: "J'habite à ", after: ".", answer: "Nairobi", gloss: "J'habite à Nairobi. — I live in Nairobi." },
  { before: "Ça va ", after: ", merci.", answer: "bien", gloss: "Ça va bien, merci. — I'm doing well, thank you." },
  { before: "", after: " de neuf ?", answer: "Quoi", gloss: "Quoi de neuf ? — What's new?" },
  { before: "À ", after: " !", answer: "bientôt", gloss: "À bientôt ! — See you soon!" },
  { before: "À ", after: " !", answer: "demain", gloss: "À demain ! — See you tomorrow!" },
  { before: "Au ", after: " !", answer: "revoir", gloss: "Au revoir ! — Goodbye!" },
  { before: "", after: " !", answer: "Bonsoir", gloss: "Bonsoir ! — Good evening!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Comment", "tu", "t'appelles", "?"], sentence: "Comment tu t'appelles ?" },
  { chunks: ["Quel", "âge", "as-tu", "?"], sentence: "Quel âge as-tu ?" },
  { chunks: ["Tu", "habites", "où", "?"], sentence: "Tu habites où ?" },
  { chunks: ["Je", "m'appelle", "Amani", "."], sentence: "Je m'appelle Amani." },
  { chunks: ["J'ai", "treize", "ans", "."], sentence: "J'ai treize ans." },
  { chunks: ["Ça", "va", "bien,", "merci", "."], sentence: "Ça va bien, merci." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `You see ${n} for the first time this morning at the market.`,
    correct: "Bonjour !",
    distractors: ["Bonsoir !", "Au revoir !", "À bientôt !"],
    explanation: "'Bonjour !' greets someone generally through the day — 'Bonsoir !' is for evening, and the other two are farewells, not greetings.",
  },
  {
    situation: (n) => `${n} asks how you are doing, and today you feel especially great.`,
    correct: "Ça gaze !",
    distractors: ["Ça va bien, merci.", "Comment tu t'appelles ?", "Au revoir !"],
    explanation: "'Ça gaze !' is an informal way of saying 'I'm doing great!' — the other options either answer more mildly, ask a different question, or say goodbye.",
  },
  {
    situation: (n) => `You just met ${n} and want to find out their name.`,
    correct: "Comment tu t'appelles ?",
    distractors: ["Ça va ?", "Tu habites où ?", "Quel âge as-tu ?"],
    explanation: "'Comment tu t'appelles ?' specifically asks for a name — the other questions ask about wellbeing, home, or age instead.",
  },
  {
    situation: (n) => `You want to know which town ${n} lives in.`,
    correct: "Tu habites où ?",
    distractors: ["Comment tu t'appelles ?", "Quel âge as-tu ?", "Ça va ?"],
    explanation: "'Tu habites où ?' asks specifically about where someone lives — the others ask a name, age, or how someone feels.",
  },
  {
    situation: (n) => `You are leaving school and won't see ${n} again until tomorrow.`,
    correct: "À demain !",
    distractors: ["À bientôt !", "Bonjour !", "Salut !"],
    explanation: "'À demain !' specifically means 'see you tomorrow' — 'À bientôt !' is vaguer, used for seeing someone again sometime soon, not necessarily the next day.",
  },
  {
    situation: (n) => `It is evening, and you greet ${n} at a family dinner.`,
    correct: "Bonsoir !",
    distractors: ["Bonjour !", "Salut !", "Au revoir !"],
    explanation: "'Bonsoir !' is the evening-specific greeting — 'Bonjour !' is used earlier in the day, and 'Au revoir !' is a farewell, not a greeting.",
  },
  {
    situation: (n) => `${n} asks your age, and you are thirteen years old.`,
    correct: "J'ai treize ans.",
    distractors: ["J'habite à Nairobi.", "Je m'appelle Amani.", "Ça va bien, merci."],
    explanation: "'J'ai treize ans' states your age — the other sentences state where you live, your name, or how you're feeling instead.",
  },
  {
    situation: (n) => `You will see ${n} again in a few days, but you're not sure exactly when.`,
    correct: "À bientôt !",
    distractors: ["À demain !", "Au revoir !", "Salut !"],
    explanation: "'À bientôt !' means 'see you soon' without promising a specific day — 'À demain !' promises tomorrow specifically.",
  },
  {
    situation: (n) => `${n} is moving away permanently, and you are saying a final goodbye.`,
    correct: "Au revoir !",
    distractors: ["À bientôt !", "À demain !", "Salut !"],
    explanation: "'Au revoir !' works as a general, more final-sounding goodbye — 'À bientôt !' and 'À demain !' both imply seeing the person again soon.",
  },
  {
    situation: (n) => `${n} looks worried and asks how you're doing — today has actually been a bad day for you.`,
    correct: "Ça va ?",
    distractors: ["Ça gaze !", "Je m'appelle Amani.", "Bonjour !"],
    explanation: "'Ça va ?' is the question form asking how someone is — 'Ça gaze !' is an answer meaning you're doing great, which doesn't fit a bad day.",
  },
  {
    situation: (n) => `You bump into ${n} casually among friends, informally.`,
    correct: "Salut !",
    distractors: ["Bonsoir !", "Au revoir !", "Quel âge as-tu ?"],
    explanation: "'Salut !' works as a casual hello among friends at any time of day — 'Bonsoir !' is tied to evening specifically.",
  },
  {
    situation: (n) => `You want to tell ${n} your own name, right after they greeted you.`,
    correct: "Je m'appelle Amani.",
    distractors: ["Comment tu t'appelles ?", "Tu habites où ?", "Ça va ?"],
    explanation: "'Je m'appelle Amani' states your own name — 'Comment tu t'appelles ?' asks someone else's name, rather than giving your own.",
  },
];

export const greetingsSpeaking: Skill = {
  id: "g7-fr-ls-greetings",
  code: "LS.1",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "Casual greetings and introductions",
  description: "Informal (tu-form) French greetings, wellbeing questions, and self-introduction — oral vocabulary and social-etiquette expressions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, PHRASES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        prompt: "Match each casual French expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Greetings are said on meeting someone; questions ask for specific information back.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const greetings = shuffle(rng, PHRASES.filter((p) => p.tag === "greeting")).slice(0, 3);
      const questions = shuffle(rng, PHRASES.filter((p) => p.tag === "question")).slice(0, 3);
      const items = shuffle(rng, [...greetings, ...questions]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.phrase] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each expression as a Greeting or a Personal Question.",
        items: items.map((p) => ({ id: p.phrase, label: p.phrase })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "question", label: "Personal Question" },
        ],
        correctBucket,
        hint: "Greetings are said on meeting someone; questions ask for a name, age, home, or wellbeing.",
        explanation: [...greetings, ...questions]
          .map((p) => `"${p.phrase}" is a ${p.tag === "greeting" ? "greeting" : "personal question"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the casual French sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "This is part of the informal tu-form greeting and introduction pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, informal French sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Informal questions in French often keep the subject-verb order and add a question word.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const name = randChoice(rng, NAMES);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(name)} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which expression actually fits this specific situation, not just any greeting.",
      explanation: s.explanation,
    };
  },
};
