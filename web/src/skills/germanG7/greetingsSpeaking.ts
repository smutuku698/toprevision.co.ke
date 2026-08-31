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
  { phrase: "Es geht mir nicht so gut.", meaning: "I'm not doing so well.", tag: "response" },
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
  { before: "Und ", after: "?", answer: "dir", gloss: "Und dir? — And you? (informal)" },
  { before: "Wie ", after: " du?", answer: "heißt", gloss: "Wie heißt du? — What is your name?" },
  { before: "Ich ", after: " Amani.", answer: "heiße", gloss: "Ich heiße Amani. — My name is Amani." },
  { before: "Woher ", after: " du?", answer: "kommst", gloss: "Woher kommst du? — Where are you from?" },
  { before: "Ich komme aus ", after: ".", answer: "Kenia", gloss: "Ich komme aus Kenia. — I come from Kenya." },
  { before: "", after: " Morgen!", answer: "Guten", gloss: "Guten Morgen! — Good morning!" },
  { before: "", after: " Abend!", answer: "Guten", gloss: "Guten Abend! — Good evening!" },
  { before: "Wie alt ", after: " du?", answer: "bist", gloss: "Wie alt bist du? — How old are you?" },
  { before: "Ich bin dreizehn Jahre ", after: ".", answer: "alt", gloss: "Ich bin dreizehn Jahre alt. — I am thirteen years old." },
  { before: "Bis ", after: "!", answer: "später", gloss: "Bis später! — See you later!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie", "geht's", "?"], sentence: "Wie geht's?" },
  { chunks: ["Wie", "heißt", "du", "?"], sentence: "Wie heißt du?" },
  { chunks: ["Woher", "kommst", "du", "?"], sentence: "Woher kommst du?" },
  { chunks: ["Ich", "komme aus", "Kenia", "."], sentence: "Ich komme aus Kenia." },
  { chunks: ["Mir geht es", "gut,", "danke", "."], sentence: "Mir geht es gut, danke." },
  { chunks: ["Wie alt", "bist du", "?"], sentence: "Wie alt bist du?" },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi", "Kamau", "Wafula"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `You see ${n} for the first time this morning, walking into class.`,
    correct: "Guten Morgen!",
    distractors: ["Guten Abend!", "Tschüss!", "Bis später!"],
    explanation: "'Guten Morgen!' greets someone specifically in the morning — 'Guten Abend!' is for evening, and the other two are farewells, not greetings.",
  },
  {
    situation: (n) => `${n} asks how you are doing, and today you feel especially great.`,
    correct: "Mir geht es prima.",
    distractors: ["Es geht mir nicht so gut.", "Wie heißt du?", "Tschüss!"],
    explanation: "'Mir geht es prima' means 'I'm doing great' — the near-opposite response describes feeling unwell, and the other choices don't answer a wellbeing question at all.",
  },
  {
    situation: (n) => `You just met ${n} and want to find out their name.`,
    correct: "Wie heißt du?",
    distractors: ["Wie geht's?", "Woher kommst du?", "Wie alt bist du?"],
    explanation: "'Wie heißt du?' specifically asks for a name — the other questions ask about wellbeing, origin, or age instead.",
  },
  {
    situation: (n) => `You want to know which town or country ${n} originally comes from.`,
    correct: "Woher kommst du?",
    distractors: ["Wie heißt du?", "Wie alt bist du?", "Wie geht's?"],
    explanation: "'Woher kommst du?' asks about origin — mixing it up with 'Wie heißt du?' is common since both begin with a 'W'-question word, but 'Woher' specifically means 'from where'.",
  },
  {
    situation: (n) => `You are leaving school and won't see ${n} again until tomorrow.`,
    correct: "Bis morgen!",
    distractors: ["Bis später!", "Guten Morgen!", "Hallo!"],
    explanation: "'Bis morgen!' specifically means 'see you tomorrow' — 'Bis später!' is used for seeing someone again the same day.",
  },
  {
    situation: (n) => `It is evening, and you greet ${n} at a family dinner.`,
    correct: "Guten Abend!",
    distractors: ["Guten Morgen!", "Guten Tag!", "Tschüss!"],
    explanation: "'Guten Abend!' is the evening-specific greeting — 'Guten Morgen!' and 'Guten Tag!' are used earlier in the day.",
  },
  {
    situation: (n) => `${n} asks your age, and you are thirteen years old.`,
    correct: "Ich bin dreizehn Jahre alt.",
    distractors: ["Ich komme aus Kenia.", "Ich heiße Amani.", "Mir geht es gut."],
    explanation: "'Ich bin dreizehn Jahre alt' answers an age question — the other sentences answer questions about origin, name, or wellbeing instead.",
  },
  {
    situation: (n) => `You will see ${n} again in just a few hours, later today.`,
    correct: "Bis später!",
    distractors: ["Bis morgen!", "Auf Wiedersehen!", "Hallo!"],
    explanation: "'Bis später!' means 'see you later' the same day — 'Bis morgen!' is specifically for the next day.",
  },
  {
    situation: (n) => `${n} is moving away permanently, and you are saying a final goodbye.`,
    correct: "Auf Wiedersehen!",
    distractors: ["Bis später!", "Bis morgen!", "Hallo!"],
    explanation: "'Auf Wiedersehen!' works as a general, more final-sounding goodbye — 'Bis später!' and 'Bis morgen!' both imply seeing the person again soon.",
  },
  {
    situation: (n) => `${n} looks worried and asks how you're doing — today has actually been a bad day for you.`,
    correct: "Es geht mir nicht so gut.",
    distractors: ["Mir geht es prima.", "Ich heiße Amani.", "Guten Tag!"],
    explanation: "'Es geht mir nicht so gut' means 'I'm not doing so well' — 'Mir geht es prima' is the opposite (great), and the other choices don't answer a wellbeing question.",
  },
  {
    situation: (n) => `You bump into ${n} in the middle of the afternoon, at the market.`,
    correct: "Guten Tag!",
    distractors: ["Guten Morgen!", "Guten Abend!", "Tschüss!"],
    explanation: "'Guten Tag!' works generally through the day, including afternoon — 'Guten Morgen!' and 'Guten Abend!' are tied to specific times of day.",
  },
  {
    situation: (n) => `You want to tell ${n} your own name, right after they greeted you.`,
    correct: "Ich heiße Amani.",
    distractors: ["Wie heißt du?", "Woher kommst du?", "Wie geht's?"],
    explanation: "'Ich heiße Amani' states your own name — 'Wie heißt du?' asks someone else's name, rather than giving your own.",
  },
];

export const greetingsSpeaking: Skill = {
  id: "g7-de-ls-greetings",
  code: "LS.1",
  subjectId: "german",
  strandId: "g7-de-listening-speaking",
  grade: 7,
  title: "Casual greetings and introductions",
  description: "Informal (du-form) German greetings, wellbeing questions, and self-introduction — oral vocabulary and social-etiquette expressions.",
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
        prompt: "Match each casual German expression to its English meaning.",
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
        hint: "Greetings are said on meeting someone; questions ask for a name, age, origin, or wellbeing.",
        explanation: [...greetings, ...questions]
          .map((p) => `"${p.phrase}" is a ${p.tag === "greeting" ? "greeting" : "personal question"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the casual German sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "This is part of the informal du-form greeting and introduction pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct, informal German sentence.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Informal questions in German usually start with a question word, and the verb comes second.",
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
