import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

type Tag = "family" | "profession";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "der Vater", meaning: "father", tag: "family" },
  { word: "die Mutter", meaning: "mother", tag: "family" },
  { word: "der Bruder", meaning: "brother", tag: "family" },
  { word: "die Schwester", meaning: "sister", tag: "family" },
  { word: "der Sohn", meaning: "son", tag: "family" },
  { word: "die Tochter", meaning: "daughter", tag: "family" },
  { word: "die Eltern", meaning: "parents", tag: "family" },
  { word: "die Geschwister", meaning: "siblings", tag: "family" },
  { word: "der Lehrer", meaning: "teacher (male)", tag: "profession" },
  { word: "die Lehrerin", meaning: "teacher (female)", tag: "profession" },
  { word: "der Arzt", meaning: "doctor (male)", tag: "profession" },
  { word: "die Ärztin", meaning: "doctor (female)", tag: "profession" },
  { word: "der Bauer", meaning: "farmer (male)", tag: "profession" },
  { word: "die Bäuerin", meaning: "farmer (female)", tag: "profession" },
  { word: "der Ingenieur", meaning: "engineer (male)", tag: "profession" },
  { word: "die Köchin", meaning: "cook (female)", tag: "profession" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Das ist mein ", after: ".", answer: "Vater", gloss: "Das ist mein Vater. — This is my father." },
  { before: "Das ist meine ", after: ".", answer: "Mutter", gloss: "Das ist meine Mutter. — This is my mother." },
  { before: "Ich habe einen ", after: ".", answer: "Bruder", gloss: "Ich habe einen Bruder. — I have a brother." },
  { before: "Ich habe eine ", after: ".", answer: "Schwester", gloss: "Ich habe eine Schwester. — I have a sister." },
  { before: "Wie alt ist dein ", after: "?", answer: "Vater", gloss: "Wie alt ist dein Vater? — How old is your father?" },
  { before: "Was ist deine Mutter von ", after: "?", answer: "Beruf", gloss: "Was ist deine Mutter von Beruf? — What is your mother's profession?" },
  { before: "Mein Vater ist ", after: " von Beruf.", answer: "Lehrer", gloss: "Mein Vater ist Lehrer von Beruf. — My father is a teacher." },
  { before: "Meine Mutter ist ", after: " von Beruf.", answer: "Ärztin", gloss: "Meine Mutter ist Ärztin von Beruf. — My mother is a doctor." },
  { before: "Mein Bruder ist ", after: " von Beruf.", answer: "Ingenieur", gloss: "Mein Bruder ist Ingenieur von Beruf. — My brother is an engineer." },
  { before: "Meine Schwester ist ", after: " von Beruf.", answer: "Köchin", gloss: "Meine Schwester ist Köchin von Beruf. — My sister is a cook." },
  { before: "Ich habe zwei ", after: ".", answer: "Geschwister", gloss: "Ich habe zwei Geschwister. — I have two siblings." },
  { before: "Meine ", after: " heißen Peter und Lucy.", answer: "Eltern", gloss: "Meine Eltern heißen Peter und Lucy. — My parents are named Peter and Lucy." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Das ist", "mein Vater", "."], sentence: "Das ist mein Vater." },
  { chunks: ["Wie alt", "ist dein Vater", "?"], sentence: "Wie alt ist dein Vater?" },
  { chunks: ["Was ist", "deine Mutter", "von Beruf", "?"], sentence: "Was ist deine Mutter von Beruf?" },
  { chunks: ["Mein Vater", "ist", "Lehrer", "."], sentence: "Mein Vater ist Lehrer." },
  { chunks: ["Ich habe", "einen Bruder", "und", "eine Schwester", "."], sentence: "Ich habe einen Bruder und eine Schwester." },
  { chunks: ["Meine Eltern", "heißen", "Peter und Lucy", "."], sentence: "Meine Eltern heißen Peter und Lucy." },
];

const NAMES = ["Amani", "Brian", "Faith", "Kevin", "Njeri", "Otieno", "Wanjiru", "Kiptoo", "Achieng", "Mumbi"];

const SCENARIOS: { situation: (name: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks what your father does for work, and he is a teacher.`,
    correct: "Mein Vater ist Lehrer von Beruf.",
    distractors: ["Meine Mutter ist Lehrerin von Beruf.", "Mein Bruder ist Ingenieur von Beruf.", "Ich habe einen Bruder."],
    explanation: "The question is about your father specifically, so the answer must say 'Mein Vater' — the other sentences talk about a different family member.",
  },
  {
    situation: (n) => `${n} asks about your mother's job, and she works as a doctor.`,
    correct: "Meine Mutter ist Ärztin von Beruf.",
    distractors: ["Mein Vater ist Arzt von Beruf.", "Meine Schwester ist Köchin von Beruf.", "Das ist mein Bruder."],
    explanation: "The subject is your mother, so the sentence needs 'Meine Mutter' and the feminine profession form 'Ärztin', not the masculine 'Arzt'.",
  },
  {
    situation: (n) => `${n} wants to know how many siblings you have, and you have exactly two.`,
    correct: "Ich habe zwei Geschwister.",
    distractors: ["Ich habe einen Bruder.", "Ich habe eine Schwester.", "Meine Eltern heißen Peter und Lucy."],
    explanation: "'Ich habe zwei Geschwister' states the total number of siblings — the other options each mention only one sibling or a different family fact.",
  },
  {
    situation: (n) => `${n} asks your father's age, and he is forty-five.`,
    correct: "Mein Vater ist fünfundvierzig Jahre alt.",
    distractors: ["Meine Mutter ist fünfundvierzig Jahre alt.", "Mein Vater ist Lehrer von Beruf.", "Ich habe einen Bruder."],
    explanation: "The question asks specifically about your father's age, so the subject and the fact (age, not profession) must both match.",
  },
  {
    situation: (n) => `You are introducing your parents to ${n} by name.`,
    correct: "Meine Eltern heißen Peter und Lucy.",
    distractors: ["Mein Bruder heißt Peter.", "Ich habe zwei Geschwister.", "Wie alt ist dein Vater?"],
    explanation: "'Meine Eltern heißen...' introduces both parents by name — the other sentences introduce a sibling, state a count, or ask a question instead.",
  },
  {
    situation: (n) => `${n} tells you their brother works as a farmer, and you want to confirm what you heard.`,
    correct: "Ist dein Bruder Bauer von Beruf?",
    distractors: ["Ist dein Bruder Ingenieur von Beruf?", "Ist deine Schwester Bäuerin von Beruf?", "Hast du eine Schwester?"],
    explanation: "You are confirming the brother's profession as farmer ('Bauer') — the distractors change either the profession or the family member being asked about.",
  },
  {
    situation: (n) => `${n} asks what your sister does, and she works as a cook.`,
    correct: "Meine Schwester ist Köchin von Beruf.",
    distractors: ["Mein Bruder ist Koch von Beruf.", "Meine Mutter ist Ärztin von Beruf.", "Ich habe eine Schwester."],
    explanation: "The subject is 'meine Schwester' (my sister) with the feminine profession 'Köchin' — swapping the family member or gender changes the meaning.",
  },
  {
    situation: (n) => `${n} wants to know your brother's profession, and he is an engineer.`,
    correct: "Mein Bruder ist Ingenieur von Beruf.",
    distractors: ["Meine Schwester ist Ingenieurin von Beruf.", "Mein Vater ist Ingenieur von Beruf.", "Ich habe einen Bruder."],
    explanation: "The question is about your brother, so the sentence must state 'Mein Bruder' with the correct masculine profession form.",
  },
  {
    situation: (n) => `You want to tell ${n} that you have exactly one sister and no brothers.`,
    correct: "Ich habe eine Schwester.",
    distractors: ["Ich habe einen Bruder.", "Ich habe zwei Geschwister.", "Meine Eltern heißen Peter und Lucy."],
    explanation: "'Ich habe eine Schwester' states one sister specifically — 'zwei Geschwister' would imply two siblings total, which doesn't match having only one sister.",
  },
  {
    situation: (n) => `${n} asks your mother's age, and she is forty years old.`,
    correct: "Meine Mutter ist vierzig Jahre alt.",
    distractors: ["Mein Vater ist vierzig Jahre alt.", "Meine Mutter ist Ärztin von Beruf.", "Wie alt ist deine Mutter?"],
    explanation: "The correct answer must both name the mother and give her age, not her profession, and it must be a statement, not the question itself.",
  },
];

export const familySpeaking: Skill = {
  id: "g7-de-ls-family",
  code: "LS.2",
  subjectId: "german",
  strandId: "g7-de-listening-speaking",
  grade: 7,
  title: "Nuclear family, age, and profession",
  description: "Introduce nuclear family members by name, age, and profession in informal (du-form) German.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each German family or profession word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Notice the difference between 'der Lehrer' (male teacher) and 'die Lehrerin' (female teacher).",
        explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const family = shuffle(rng, WORDS.filter((w) => w.tag === "family")).slice(0, 4);
      const profession = shuffle(rng, WORDS.filter((w) => w.tag === "profession")).slice(0, 4);
      const items = shuffle(rng, [...family, ...profession]);
      const correctBucket: Record<string, string> = {};
      for (const w of items) correctBucket[w.word] = w.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Family member or a Profession.",
        items: items.map((w) => ({ id: w.word, label: w.word })),
        buckets: [
          { id: "family", label: "Family member" },
          { id: "profession", label: "Profession" },
        ],
        correctBucket,
        hint: "Family words name a relative; profession words name a job someone can do.",
        explanation: [...family, ...profession].map((w) => `"${w.word}" is a ${w.tag === "family" ? "family member" : "profession"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence about family or profession.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the family or profession vocabulary in this informal (du-form) sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about family.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Informal questions in German usually start with a question word, then the verb.",
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
      hint: "Check carefully which family member and which fact (name, age, or profession) the situation actually asks about.",
      explanation: s.explanation,
    };
  },
};
