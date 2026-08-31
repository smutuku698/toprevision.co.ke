import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "greeting" | "question" | "response" | "farewell" | "number";

const PHRASES: { phrase: string; meaning: string; tag: Tag }[] = [
  { phrase: "Bonjour !", meaning: "Hello!/Good day!", tag: "greeting" },
  { phrase: "Bonsoir !", meaning: "Good evening!", tag: "greeting" },
  { phrase: "Salut !", meaning: "Hi!", tag: "greeting" },
  { phrase: "Coucou !", meaning: "Hey there!", tag: "greeting" },
  { phrase: "Comment tu t'appelles ?", meaning: "What is your name? (informal)", tag: "question" },
  { phrase: "Quel âge as-tu ?", meaning: "How old are you? (informal)", tag: "question" },
  { phrase: "Tu habites où ?", meaning: "Where do you live? (informal)", tag: "question" },
  { phrase: "Ça va ?", meaning: "How's it going?", tag: "question" },
  { phrase: "Je m'appelle Wanjiru.", meaning: "My name is Wanjiru.", tag: "response" },
  { phrase: "J'ai onze ans.", meaning: "I am eleven years old.", tag: "response" },
  { phrase: "J'habite à Kisumu.", meaning: "I live in Kisumu.", tag: "response" },
  { phrase: "Ça va bien, merci.", meaning: "I'm doing well, thank you.", tag: "response" },
  { phrase: "Au revoir !", meaning: "Goodbye!", tag: "farewell" },
  { phrase: "À bientôt !", meaning: "See you soon!", tag: "farewell" },
  { phrase: "À demain !", meaning: "See you tomorrow!", tag: "farewell" },
  { phrase: "cinq", meaning: "five", tag: "number" },
  { phrase: "dix", meaning: "ten", tag: "number" },
  { phrase: "quinze", meaning: "fifteen", tag: "number" },
  { phrase: "vingt", meaning: "twenty", tag: "number" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Comment tu ", after: " ?", answer: "t'appelles", gloss: "Comment tu t'appelles ? — What is your name?" },
  { before: "Je ", after: " Wanjiru.", answer: "m'appelle", gloss: "Je m'appelle Wanjiru. — My name is Wanjiru." },
  { before: "Quel ", after: " as-tu ?", answer: "âge", gloss: "Quel âge as-tu ? — How old are you?" },
  { before: "J'ai onze ", after: ".", answer: "ans", gloss: "J'ai onze ans. — I am eleven years old." },
  { before: "Tu habites ", after: " ?", answer: "où", gloss: "Tu habites où ? — Where do you live?" },
  { before: "J'habite à ", after: ".", answer: "Kisumu", gloss: "J'habite à Kisumu. — I live in Kisumu." },
  { before: "", after: " bien, merci.", answer: "Ça va", gloss: "Ça va bien, merci. — I'm doing well, thank you." },
  { before: "À ", after: " !", answer: "bientôt", gloss: "À bientôt ! — See you soon!" },
  { before: "À ", after: " !", answer: "demain", gloss: "À demain ! — See you tomorrow!" },
  { before: "Au ", after: " !", answer: "revoir", gloss: "Au revoir ! — Goodbye!" },
  { before: "", after: " !", answer: "Bonsoir", gloss: "Bonsoir ! — Good evening!" },
  { before: "J'ai ", after: " ans.", answer: "quinze", gloss: "J'ai quinze ans. — I am fifteen years old." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Comment", "tu", "t'appelles", "?"], sentence: "Comment tu t'appelles ?" },
  { chunks: ["Je", "m'appelle", "Wanjiru", "."], sentence: "Je m'appelle Wanjiru." },
  { chunks: ["Tu", "habites", "où", "?"], sentence: "Tu habites où ?" },
  { chunks: ["J'habite", "à", "Kisumu", "."], sentence: "J'habite à Kisumu." },
  { chunks: ["Quel", "âge", "as-tu", "?"], sentence: "Quel âge as-tu ?" },
  { chunks: ["J'ai", "onze", "ans", "."], sentence: "J'ai onze ans." },
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
    note: "In your introduction paragraph, you want to ask your pen pal their name.",
    correct: "Comment tu t'appelles ?",
    distractors: ["Tu habites où ?", "Quel âge as-tu ?", "Ça va ?"],
    explanation: "'Comment tu t'appelles ?' asks for a name specifically — the other written questions ask about home, age, or wellbeing.",
  },
  {
    note: "You are writing your own age in a short self-introduction paragraph, and you are eleven.",
    correct: "J'ai onze ans.",
    distractors: ["J'ai quinze ans.", "J'habite à Kisumu.", "Je m'appelle Wanjiru."],
    explanation: "'J'ai onze ans' correctly states eleven years — the other options give the wrong number or state a different fact entirely.",
  },
  {
    note: "You want to write down your name in your introduction paragraph.",
    correct: "Je m'appelle Wanjiru.",
    distractors: ["Tu t'appelles Wanjiru.", "J'ai onze ans.", "J'habite à Kisumu."],
    explanation: "'Je m'appelle Wanjiru' uses 'je' (I) to state your own name — 'Tu t'appelles' would state someone else's name.",
  },
  {
    note: "In your letter, you want to ask your pen pal where they live.",
    correct: "Tu habites où ?",
    distractors: ["Comment tu t'appelles ?", "Quel âge as-tu ?", "Ça va ?"],
    explanation: "'Tu habites où ?' asks about home — the other written questions ask a name, age, or wellbeing instead.",
  },
  {
    note: "You are stating your own home town in your introduction paragraph, which is Kisumu.",
    correct: "J'habite à Kisumu.",
    distractors: ["Tu habites à Kisumu.", "J'ai onze ans.", "Au revoir !"],
    explanation: "'J'habite à Kisumu' uses 'j'' (I) for your own home — 'Tu habites' would describe someone else's home instead.",
  },
  {
    note: "You are replying to your pen pal's letter, telling them you are doing well.",
    correct: "Ça va bien, merci.",
    distractors: ["Tu habites où ?", "Je m'appelle Wanjiru.", "Au revoir !"],
    explanation: "'Ça va bien, merci' is a statement answering a wellbeing question, not a question or a different fact.",
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
    distractors: ["À bientôt !", "Au revoir !", "Comment tu t'appelles ?"],
    explanation: "'À demain !' specifically promises to meet again the next day — the other farewells don't name tomorrow, and the last option isn't a farewell at all.",
  },
  {
    note: "You are writing a caption under a photo of ten pencils for a counting poster.",
    correct: "dix",
    distractors: ["cinq", "quinze", "vingt"],
    explanation: "'dix' means ten — the other numbers are five, fifteen, and twenty, each a different count.",
  },
  {
    note: "You are writing the answer to a maths quiz sung in class, and the answer is twenty.",
    correct: "vingt",
    distractors: ["dix", "quinze", "cinq"],
    explanation: "'vingt' means twenty — the other numbers on the list are smaller values, not twenty.",
  },
];

export const greetingsWriting: Skill = {
  id: "g6-fr-w-greetings",
  code: "W.1",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "Casual greetings and introductions",
  description: "Guided writing — spelling and word order for informal (tu-form) greetings, wellbeing questions, self-introduction, and numbers 1-20.",
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
        prompt: "Match each written French word or expression to its English meaning.",
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
        hint: "Think about how you would write this greeting, question, self-introduction, or number.",
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
      prompt: `${s.note} Which French word or sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about what this specific piece of writing needs to say, not just any greeting phrase.",
      explanation: s.explanation,
    };
  },
};
