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
  { before: "Mein Vater ist ", after: " von Beruf.", answer: "Lehrer", gloss: "Mein Vater ist Lehrer von Beruf. — My father is a teacher." },
  { before: "Meine Mutter ist ", after: " von Beruf.", answer: "Ärztin", gloss: "Meine Mutter ist Ärztin von Beruf. — My mother is a doctor." },
  { before: "Mein Bruder ist ", after: " von Beruf.", answer: "Ingenieur", gloss: "Mein Bruder ist Ingenieur von Beruf. — My brother is an engineer." },
  { before: "Meine Schwester ist ", after: " von Beruf.", answer: "Köchin", gloss: "Meine Schwester ist Köchin von Beruf. — My sister is a cook." },
  { before: "Ich habe zwei ", after: ".", answer: "Geschwister", gloss: "Ich habe zwei Geschwister. — I have two siblings." },
  { before: "Meine ", after: " heißen Peter und Lucy.", answer: "Eltern", gloss: "Meine Eltern heißen Peter und Lucy. — My parents are named Peter and Lucy." },
  { before: "Mein Sohn ", after: " Kevin.", answer: "heißt", gloss: "Mein Sohn heißt Kevin. — My son is named Kevin." },
  { before: "Meine Tochter ist zehn Jahre ", after: ".", answer: "alt", gloss: "Meine Tochter ist zehn Jahre alt. — My daughter is ten years old." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Das ist", "mein Vater", "."], sentence: "Das ist mein Vater." },
  { chunks: ["Mein Vater", "ist", "Lehrer von Beruf", "."], sentence: "Mein Vater ist Lehrer von Beruf." },
  { chunks: ["Ich habe", "einen Bruder", "und", "eine Schwester", "."], sentence: "Ich habe einen Bruder und eine Schwester." },
  { chunks: ["Meine Eltern", "heißen", "Peter und Lucy", "."], sentence: "Meine Eltern heißen Peter und Lucy." },
];

const PROFILE_SCENARIOS: {
  note: string;
  correct: string;
  distractors: string[];
  explanation: string;
}[] = [
  {
    note: "You are writing a family-tree caption for the box labelled 'Vater', and he is a teacher.",
    correct: "Mein Vater ist Lehrer von Beruf.",
    distractors: ["Meine Mutter ist Lehrerin von Beruf.", "Mein Bruder ist Lehrer von Beruf.", "Ich habe einen Bruder."],
    explanation: "The caption labelled 'Vater' must describe the father specifically, using the masculine profession form.",
  },
  {
    note: "You are captioning the 'Mutter' box in your family tree, and she is a doctor.",
    correct: "Meine Mutter ist Ärztin von Beruf.",
    distractors: ["Mein Vater ist Arzt von Beruf.", "Meine Schwester ist Ärztin von Beruf.", "Das ist mein Bruder."],
    explanation: "The caption must match the 'Mutter' box, using the feminine profession form 'Ärztin', not 'Arzt'.",
  },
  {
    note: "In your written introduction, you want to state your total number of siblings, which is two.",
    correct: "Ich habe zwei Geschwister.",
    distractors: ["Ich habe einen Bruder.", "Ich habe eine Schwester.", "Meine Eltern heißen Peter und Lucy."],
    explanation: "'Zwei Geschwister' gives the total sibling count, unlike the other sentences which each mention only one sibling.",
  },
  {
    note: "You are writing the names of both parents together for your class presentation slide.",
    correct: "Meine Eltern heißen Peter und Lucy.",
    distractors: ["Mein Vater heißt Peter.", "Meine Mutter heißt Lucy.", "Ich habe zwei Geschwister."],
    explanation: "'Meine Eltern heißen...' names both parents in one sentence, unlike the other options which name only one person or a different fact.",
  },
  {
    note: "You are writing a caption for your brother's photo, stating he works as an engineer.",
    correct: "Mein Bruder ist Ingenieur von Beruf.",
    distractors: ["Meine Schwester ist Ingenieurin von Beruf.", "Mein Vater ist Ingenieur von Beruf.", "Ich habe einen Bruder."],
    explanation: "The caption must both name the brother as the subject and give his correct profession, engineer.",
  },
  {
    note: "You are writing a caption for your sister's photo, stating she works as a cook.",
    correct: "Meine Schwester ist Köchin von Beruf.",
    distractors: ["Mein Bruder ist Koch von Beruf.", "Meine Mutter ist Ärztin von Beruf.", "Ich habe eine Schwester."],
    explanation: "The caption needs 'Meine Schwester' with the feminine profession form 'Köchin' to correctly caption the sister's photo.",
  },
  {
    note: "You are writing that your son is named Kevin, for a family-tree label.",
    correct: "Mein Sohn heißt Kevin.",
    distractors: ["Meine Tochter heißt Kevin.", "Mein Bruder heißt Kevin.", "Ich habe einen Sohn."],
    explanation: "'Mein Sohn heißt Kevin' both names the relationship (son) and the correct name, matching the label exactly.",
  },
  {
    note: "You are writing your daughter's age, ten years old, into a family fact-file.",
    correct: "Meine Tochter ist zehn Jahre alt.",
    distractors: ["Mein Sohn ist zehn Jahre alt.", "Meine Tochter ist Köchin von Beruf.", "Ich habe eine Tochter."],
    explanation: "The fact-file needs the daughter's age specifically, ten years old, not her existence alone or a profession.",
  },
  {
    note: "You want to write that you have one sister and no brothers.",
    correct: "Ich habe eine Schwester.",
    distractors: ["Ich habe einen Bruder.", "Ich habe zwei Geschwister.", "Meine Eltern heißen Peter und Lucy."],
    explanation: "'Ich habe eine Schwester' states exactly one sister — 'zwei Geschwister' would imply two siblings total, which is incorrect here.",
  },
  {
    note: "You are writing a caption naming your farmer uncle's profession — but this family tree is about your own father, who is a farmer too.",
    correct: "Mein Vater ist Bauer von Beruf.",
    distractors: ["Mein Vater ist Bäuerin von Beruf.", "Meine Mutter ist Bauer von Beruf.", "Mein Bruder ist Bauer von Beruf."],
    explanation: "The subject is 'mein Vater' (masculine), so the profession must use the masculine form 'Bauer', not the feminine 'Bäuerin'.",
  },
];

export const familyWriting: Skill = {
  id: "g7-de-w-family",
  code: "W.2",
  subjectId: "german",
  strandId: "g7-de-writing",
  grade: 7,
  title: "Nuclear family, age, and profession",
  description: "Guided writing — spelling and orthography for nuclear family members, ages, and professions in German.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "profile"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each written German family or profession word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Watch the article: 'der' words are masculine, 'die' words are feminine.",
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
        prompt: "Sort each written word as a Family member or a Profession.",
        items: items.map((w) => ({ id: w.word, label: w.word })),
        buckets: [
          { id: "family", label: "Family member" },
          { id: "profession", label: "Profession" },
        ],
        correctBucket,
        hint: "Family words name a relative; profession words name a job.",
        explanation: [...family, ...profession].map((w) => `"${w.word}" is a ${w.tag === "family" ? "family member" : "profession"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written German sentence about family.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Check the correct spelling of the family or profession word, including capitalisation.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct German sentence about family.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "German sentences usually put the verb as the second element.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, PROFILE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which German sentence should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Match the subject (which family member) and the specific fact (name, age, or profession) exactly.",
      explanation: s.explanation,
    };
  },
};
