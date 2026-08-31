import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, sortPrompt, orderPrompt, fillPrompt, writingScenarioCloser } from "./g5FrShared";

type Tag = "greeting" | "question" | "response" | "farewell";

const PHRASES: { phrase: string; meaning: string; tag: Tag }[] = [
  { phrase: "Bonjour !", meaning: "Hello!/Good day!", tag: "greeting" },
  { phrase: "Salut !", meaning: "Hi!", tag: "greeting" },
  { phrase: "Bonsoir !", meaning: "Good evening!", tag: "greeting" },
  { phrase: "Comment tu t'appelles ?", meaning: "What is your name?", tag: "question" },
  { phrase: "Comment ça va ?", meaning: "How are you?", tag: "question" },
  { phrase: "Qui est-ce ?", meaning: "Who is this?/Who is that?", tag: "question" },
  { phrase: "Je m'appelle Amani.", meaning: "My name is Amani.", tag: "response" },
  { phrase: "Je suis une fille.", meaning: "I am a girl.", tag: "response" },
  { phrase: "Je suis un garçon.", meaning: "I am a boy.", tag: "response" },
  { phrase: "Ça va bien, merci.", meaning: "I'm doing well, thank you.", tag: "response" },
  { phrase: "Voici mon ami.", meaning: "Here is my friend.", tag: "response" },
  { phrase: "C'est mon ami.", meaning: "This is my friend.", tag: "response" },
  { phrase: "Au revoir !", meaning: "Goodbye!", tag: "farewell" },
  { phrase: "À bientôt !", meaning: "See you soon!", tag: "farewell" },
  { phrase: "À demain !", meaning: "See you tomorrow!", tag: "farewell" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Comment tu ", after: " ?", answer: "t'appelles", gloss: "Comment tu t'appelles ? — What is your name?" },
  { before: "Je ", after: " Amani.", answer: "m'appelle", gloss: "Je m'appelle Amani. — My name is Amani." },
  { before: "Comment ça ", after: " ?", answer: "va", gloss: "Comment ça va ? — How are you?" },
  { before: "Qui ", after: " ?", answer: "est-ce", gloss: "Qui est-ce ? — Who is this?" },
  { before: "Je suis une ", after: ".", answer: "fille", gloss: "Je suis une fille. — I am a girl." },
  { before: "Je suis un ", after: ".", answer: "garçon", gloss: "Je suis un garçon. — I am a boy." },
  { before: "Ça va bien, ", after: ".", answer: "merci", gloss: "Ça va bien, merci. — I'm doing well, thank you." },
  { before: "Voici mon ", after: ".", answer: "ami", gloss: "Voici mon ami. — Here is my friend." },
  { before: "", after: " mon ami.", answer: "C'est", gloss: "C'est mon ami. — This is my friend." },
  { before: "Au ", after: " !", answer: "revoir", gloss: "Au revoir ! — Goodbye!" },
  { before: "À ", after: " !", answer: "bientôt", gloss: "À bientôt ! — See you soon!" },
  { before: "À ", after: " !", answer: "demain", gloss: "À demain ! — See you tomorrow!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Comment", "tu", "t'appelles", "?"], sentence: "Comment tu t'appelles ?" },
  { chunks: ["Comment", "ça", "va", "?"], sentence: "Comment ça va ?" },
  { chunks: ["Je", "m'appelle", "Amani", "."], sentence: "Je m'appelle Amani." },
  { chunks: ["Je", "suis", "une", "fille", "."], sentence: "Je suis une fille." },
  { chunks: ["Qui", "est-ce", "?"], sentence: "Qui est-ce ?" },
  { chunks: ["Voici", "mon", "ami", "."], sentence: "Voici mon ami." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing the opening line of a letter to your pen pal, greeting them for the first time this morning.",
    correct: "Bonjour !",
    distractors: ["Bonsoir !", "Au revoir !", "À bientôt !"],
    explanation: "'Bonjour !' is the general daytime written greeting — 'Bonsoir' is for evening, and the other two are farewells.",
  },
  {
    note: "You are writing a note that opens after sunset, so you need an evening greeting.",
    correct: "Bonsoir !",
    distractors: ["Bonjour !", "Salut !", "Au revoir !"],
    explanation: "'Bonsoir !' specifically marks the evening — 'Bonjour' and 'Salut' fit earlier in the day, and 'Au revoir' is a farewell.",
  },
  {
    note: "You are writing a casual, quick note to a classmate you know well.",
    correct: "Salut !",
    distractors: ["Bonsoir !", "Au revoir !", "Qui est-ce ?"],
    explanation: "'Salut !' is the informal, casual greeting — 'Bonsoir' is time-specific and the other options are not opening greetings at all.",
  },
  {
    note: "In your introduction paragraph, you want to ask your pen pal their name.",
    correct: "Comment tu t'appelles ?",
    distractors: ["Comment ça va ?", "Qui est-ce ?", "Je m'appelle Amani."],
    explanation: "'Comment tu t'appelles ?' asks for a name specifically — the other written options ask about wellbeing, ask about someone else, or state your own name.",
  },
  {
    note: "You want to write down your own name in your introduction paragraph, and your name is Amani.",
    correct: "Je m'appelle Amani.",
    distractors: ["Tu t'appelles Amani.", "Comment tu t'appelles ?", "C'est mon ami."],
    explanation: "'Je m'appelle Amani' uses 'je' (I) to state your own name — 'Tu t'appelles' would state someone else's name, and the others are a question or a different statement.",
  },
  {
    note: "In your letter, you want to ask your pen pal how they are doing.",
    correct: "Comment ça va ?",
    distractors: ["Comment tu t'appelles ?", "Qui est-ce ?", "Ça va bien, merci."],
    explanation: "'Comment ça va ?' asks about wellbeing — the other written options ask a name or about someone else, or are an answer rather than a question.",
  },
  {
    note: "You are replying to your pen pal's letter, telling them you are doing well.",
    correct: "Ça va bien, merci.",
    distractors: ["Comment ça va ?", "Je suis une fille.", "Au revoir !"],
    explanation: "'Ça va bien, merci' is a statement answering a wellbeing question, not the question itself or a different fact.",
  },
  {
    note: "You are describing yourself in your introduction paragraph, and you are a girl.",
    correct: "Je suis une fille.",
    distractors: ["Je suis un garçon.", "Je m'appelle Amani.", "C'est mon ami."],
    explanation: "'Je suis une fille' uses the feminine article 'une' to state you are a girl — 'un garçon' names the wrong gender entirely.",
  },
  {
    note: "You are describing yourself in your introduction paragraph, and you are a boy.",
    correct: "Je suis un garçon.",
    distractors: ["Je suis une fille.", "Voici mon ami.", "Qui est-ce ?"],
    explanation: "'Je suis un garçon' uses the masculine article 'un' to state you are a boy — 'une fille' names the wrong gender entirely.",
  },
  {
    note: "You are pointing to a photo and want to introduce your friend to the reader using 'Voici'.",
    correct: "Voici mon ami.",
    distractors: ["C'est mon ami.", "Qui est-ce ?", "Salut !"],
    explanation: "'Voici mon ami' uses the presenting word 'Voici' (Here is) to introduce a friend — 'C'est' would instead identify who someone already shown is.",
  },
  {
    note: "You are writing a caption under a photo, asking the reader who the person shown is.",
    correct: "Qui est-ce ?",
    distractors: ["Comment tu t'appelles ?", "Voici mon ami.", "C'est mon ami."],
    explanation: "'Qui est-ce ?' is the question asking who someone is — the other options either ask for a name directly or answer instead of asking.",
  },
  {
    note: "You are ending a general written goodbye to a pen pal you might not see again soon.",
    correct: "Au revoir !",
    distractors: ["À bientôt !", "À demain !", "Salut !"],
    explanation: "'Au revoir !' is a general, final-sounding written goodbye — 'À bientôt !' and 'À demain !' both promise a specific, soon reunion instead.",
  },
  {
    note: "You are writing the last line of a card to a classmate you'll see again tomorrow.",
    correct: "À demain !",
    distractors: ["À bientôt !", "Au revoir !", "Bonjour !"],
    explanation: "'À demain !' specifically promises to meet again the next day — the other farewell doesn't name tomorrow, and the last option isn't a farewell at all.",
  },
];

export const greetingsWriting: Skill = {
  id: "g5-fr-w-greetings",
  code: "W.1",
  subjectId: "french",
  strandId: "g5-fr-writing",
  grade: 5,
  title: "Greetings and introductions",
  description: "Guided writing — spelling and word order for informal (tu-form) greetings, wellbeing questions, self-introduction, and introducing a friend.",
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
        prompt: matchPrompt(rng, "written French greeting or expression to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Greetings open a note; questions ask for specific written information back.",
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
        prompt: sortPrompt(rng, "whether each written phrase is a Question or a Farewell"),
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
        prompt: fillPrompt(rng),
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
        prompt: orderPrompt(rng, "the words/phrases to write a correct, informal French sentence"),
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
      prompt: `${s.note} ${writingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about what this specific piece of writing needs to say, not just any greeting phrase.",
      explanation: s.explanation,
    };
  },
};
