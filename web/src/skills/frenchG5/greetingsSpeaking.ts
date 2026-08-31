import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "greeting" | "question" | "response" | "introduction";

const PHRASES: { phrase: string; meaning: string; tag: Tag }[] = [
  { phrase: "Bonjour !", meaning: "Hello!/Good day!", tag: "greeting" },
  { phrase: "Bonsoir !", meaning: "Good evening!", tag: "greeting" },
  { phrase: "Salut !", meaning: "Hi!", tag: "greeting" },
  { phrase: "Au revoir !", meaning: "Goodbye!", tag: "greeting" },
  { phrase: "À bientôt !", meaning: "See you soon!", tag: "greeting" },
  { phrase: "Comment tu t'appelles ?", meaning: "What is your name?", tag: "question" },
  { phrase: "Comment ça va ?", meaning: "How are you?", tag: "question" },
  { phrase: "Qui est-ce ?", meaning: "Who is this?", tag: "question" },
  { phrase: "C'est qui ?", meaning: "Who's that? (informal)", tag: "question" },
  { phrase: "Je m'appelle Amani.", meaning: "My name is Amani.", tag: "response" },
  { phrase: "Ça va bien, merci.", meaning: "I'm doing well, thank you.", tag: "response" },
  { phrase: "Je suis une fille.", meaning: "I am a girl.", tag: "response" },
  { phrase: "Je suis un garçon.", meaning: "I am a boy.", tag: "response" },
  { phrase: "Voici mon ami.", meaning: "Here is my friend (a boy).", tag: "introduction" },
  { phrase: "Voici mon amie.", meaning: "Here is my friend (a girl).", tag: "introduction" },
  { phrase: "C'est Amani.", meaning: "This is Amani.", tag: "introduction" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Comment tu ", after: " ?", answer: "t'appelles", gloss: "Comment tu t'appelles ? — What is your name?" },
  { before: "Comment ça ", after: " ?", answer: "va", gloss: "Comment ça va ? — How are you?" },
  { before: "", after: " est-ce ?", answer: "Qui", gloss: "Qui est-ce ? — Who is this?" },
  { before: "Je m'", after: " Amani.", answer: "appelle", gloss: "Je m'appelle Amani. — My name is Amani." },
  { before: "Ça va ", after: ", merci.", answer: "bien", gloss: "Ça va bien, merci. — I'm doing well, thank you." },
  { before: "Je suis une ", after: ".", answer: "fille", gloss: "Je suis une fille. — I am a girl." },
  { before: "Je suis un ", after: ".", answer: "garçon", gloss: "Je suis un garçon. — I am a boy." },
  { before: "Voici mon ", after: ".", answer: "ami", gloss: "Voici mon ami. — Here is my friend (a boy)." },
  { before: "C'est ", after: ".", answer: "Amani", gloss: "C'est Amani. — This is Amani." },
  { before: "Au ", after: " !", answer: "revoir", gloss: "Au revoir ! — Goodbye!" },
  { before: "", after: " !", answer: "Bonjour", gloss: "Bonjour ! — Hello!/Good day!" },
  { before: "", after: " !", answer: "Bonsoir", gloss: "Bonsoir ! — Good evening!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Comment", "tu", "t'appelles", "?"], sentence: "Comment tu t'appelles ?" },
  { chunks: ["Comment", "ça", "va", "?"], sentence: "Comment ça va ?" },
  { chunks: ["Qui", "est-ce", "?"], sentence: "Qui est-ce ?" },
  { chunks: ["Je", "m'appelle", "Amani", "."], sentence: "Je m'appelle Amani." },
  { chunks: ["Je", "suis", "une", "fille", "."], sentence: "Je suis une fille." },
  { chunks: ["Voici", "mon", "ami", "."], sentence: "Voici mon ami." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `You meet ${n} for the first time and want to ask their name.`,
    correct: "Comment tu t'appelles ?",
    distractors: ["Comment ça va ?", "Qui est-ce ?", "Voici mon ami."],
    explanation: "'Comment tu t'appelles ?' specifically asks for a name — the others ask about wellbeing, ask about a third person, or introduce someone instead.",
  },
  {
    situation: (n) => `${n} wants to know how you are feeling today, and you feel perfectly fine.`,
    correct: "Ça va bien, merci.",
    distractors: ["Je m'appelle Amani.", "Comment tu t'appelles ?", "Au revoir !"],
    explanation: "'Ça va bien, merci' answers a wellbeing question — the others give a name, ask a different question, or say goodbye.",
  },
  {
    situation: (n) => `You point at a new classmate and ask ${n} who that person is.`,
    correct: "Qui est-ce ?",
    distractors: ["Comment tu t'appelles ?", "Voici mon ami.", "C'est Amani."],
    explanation: "'Qui est-ce ?' asks about a third person's identity — the others ask your own name or introduce someone rather than asking who they are.",
  },
  {
    situation: (n) => `${n} asks for your name, right after greeting you.`,
    correct: "Je m'appelle Amani.",
    distractors: ["Je suis une fille.", "Comment tu t'appelles ?", "Ça va bien, merci."],
    explanation: "'Je m'appelle Amani' states your own name — 'Comment tu t'appelles ?' asks someone else's name rather than giving your own.",
  },
  {
    situation: (n) => `You want to introduce your female friend to ${n}.`,
    correct: "Voici mon amie.",
    distractors: ["Voici mon ami.", "C'est Amani.", "Je suis une fille."],
    explanation: "'Voici mon amie' introduces a female friend — 'mon ami' (no e) introduces a male friend instead.",
  },
  {
    situation: (n) => `You want to introduce your male friend to ${n}.`,
    correct: "Voici mon ami.",
    distractors: ["Voici mon amie.", "Qui est-ce ?", "Je suis un garçon."],
    explanation: "'Voici mon ami' introduces a male friend — 'mon amie' (with e) introduces a female friend instead.",
  },
  {
    situation: (n) => `${n} asks who the girl standing near the door is, and her name is Amani.`,
    correct: "C'est Amani.",
    distractors: ["Voici mon ami.", "Je m'appelle Amani.", "Qui est-ce ?"],
    explanation: "'C'est Amani' names the person being asked about — 'Je m'appelle Amani' would only fit if you yourself were named Amani.",
  },
  {
    situation: (n) => `${n} asks whether you are a boy or a girl, and you are a girl.`,
    correct: "Je suis une fille.",
    distractors: ["Je suis un garçon.", "C'est Amani.", "Voici mon amie."],
    explanation: "'Je suis une fille' states you are a girl — 'Je suis un garçon' states the opposite.",
  },
  {
    situation: (n) => `${n} asks whether you are a boy or a girl, and you are a boy.`,
    correct: "Je suis un garçon.",
    distractors: ["Je suis une fille.", "Comment tu t'appelles ?", "Voici mon ami."],
    explanation: "'Je suis un garçon' states you are a boy — 'Je suis une fille' states the opposite.",
  },
  {
    situation: (n) => `You are leaving school for the day and want to say goodbye to ${n}.`,
    correct: "Au revoir !",
    distractors: ["Bonjour !", "Comment ça va ?", "Voici mon ami."],
    explanation: "'Au revoir !' says goodbye — 'Bonjour !' greets someone instead of parting ways with them.",
  },
  {
    situation: (n) => `You see ${n} first thing in the morning and want to greet them.`,
    correct: "Bonjour !",
    distractors: ["Bonsoir !", "Au revoir !", "Qui est-ce ?"],
    explanation: "'Bonjour !' greets someone during the day — 'Bonsoir !' is for evening, and 'Au revoir !' is a farewell, not a greeting.",
  },
  {
    situation: (n) => `It is evening, and you greet ${n} at home.`,
    correct: "Bonsoir !",
    distractors: ["Bonjour !", "Salut !", "Au revoir !"],
    explanation: "'Bonsoir !' is the evening-specific greeting — 'Bonjour !' is used earlier in the day.",
  },
  {
    situation: (n) => `You casually wave hello to ${n} among friends.`,
    correct: "Salut !",
    distractors: ["Bonsoir !", "Au revoir !", "Qui est-ce ?"],
    explanation: "'Salut !' works as a casual hello among friends at any time of day — 'Bonsoir !' is tied to evening specifically.",
  },
];

export const greetingsSpeaking: Skill = {
  id: "g5-fr-ls-greetings",
  code: "LS.1",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Greetings and introductions",
  description: "Informal (tu-form) French greetings, self-introduction, and introducing others — oral vocabulary practiced through matching, sorting, and speaking scenarios.",
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
        prompt: matchPrompt(rng, "French greeting, question, or introduction phrase to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Greetings are said on meeting someone; questions ask for a name or identity; introductions present a person.",
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
        prompt: sortPrompt(rng, "each expression as a Greeting or a Question"),
        items: items.map((p) => ({ id: p.phrase, label: p.phrase })),
        buckets: [
          { id: "greeting", label: "Greeting" },
          { id: "question", label: "Question" },
        ],
        correctBucket,
        hint: "Greetings are said on meeting or leaving someone; questions ask for a name, wellbeing, or identity.",
        explanation: [...greetings, ...questions]
          .map((p) => `"${p.phrase}" is a ${p.tag === "greeting" ? "greeting" : "question"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "This is part of the informal tu-form greeting or introduction pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about greetings and introductions"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Informal questions in French often keep the subject-verb order and add a question word.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const n = name(rng);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(n)} ${speakingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which expression actually fits this specific situation.",
      explanation: s.explanation,
    };
  },
};
