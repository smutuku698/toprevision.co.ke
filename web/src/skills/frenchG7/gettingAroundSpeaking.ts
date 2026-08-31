import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "place" | "preposition";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la boutique", meaning: "the shop", tag: "place" },
  { word: "le marché", meaning: "the market", tag: "place" },
  { word: "l'église", meaning: "the church", tag: "place" },
  { word: "la boulangerie", meaning: "the bakery", tag: "place" },
  { word: "la mosquée", meaning: "the mosque", tag: "place" },
  { word: "le supermarché", meaning: "the supermarket", tag: "place" },
  { word: "en face de", meaning: "opposite", tag: "preposition" },
  { word: "à côté de", meaning: "next to", tag: "preposition" },
  { word: "derrière", meaning: "behind", tag: "preposition" },
  { word: "près de", meaning: "near", tag: "preposition" },
  { word: "à travers", meaning: "through", tag: "preposition" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "L'église est ", after: " le marché.", answer: "derrière", gloss: "L'église est derrière le marché. — The church is behind the market." },
  { before: "La boutique est à ", after: " de l'école.", answer: "côté", gloss: "La boutique est à côté de l'école. — The shop is next to the school." },
  { before: "Le supermarché est ", after: " de la mosquée.", answer: "près", gloss: "Le supermarché est près de la mosquée. — The supermarket is near the mosque." },
  { before: "Où est le ", after: " ?", answer: "marché", gloss: "Où est le marché ? — Where is the market?" },
  { before: "La boulangerie est en ", after: " de la boutique.", answer: "face", gloss: "La boulangerie est en face de la boutique. — The bakery is opposite the shop." },
  { before: "On passe à ", after: " le marché pour arriver à l'école.", answer: "travers", gloss: "On passe à travers le marché pour arriver à l'école. — You go through the market to reach the school." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["L'église", "est", "derrière", "le", "marché", "."], sentence: "L'église est derrière le marché." },
  { chunks: ["La", "boutique", "est", "à", "côté", "de", "l'école", "."], sentence: "La boutique est à côté de l'école." },
  { chunks: ["Où", "est", "le", "supermarché", "?"], sentence: "Où est le supermarché ?" },
];

const SCENARIOS: { situation: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: "The bakery is directly next to your school, sharing a wall.",
    correct: "La boulangerie est à côté de l'école.",
    distractors: ["La boulangerie est derrière l'école.", "La boulangerie est en face de l'école.", "La boulangerie est loin de l'école."],
    explanation: "'À côté de' means 'next to' — the other prepositions describe behind, opposite, or far, not directly adjacent.",
  },
  {
    situation: "The market is directly across the street, facing your house.",
    correct: "Le marché est en face de ma maison.",
    distractors: ["Le marché est à côté de ma maison.", "Le marché est derrière ma maison.", "Le marché est à travers ma maison."],
    explanation: "'En face de' means 'opposite/facing' — the others describe next-to, behind, or through, not directly across.",
  },
  {
    situation: "The church is located just behind the market building.",
    correct: "L'église est derrière le marché.",
    distractors: ["L'église est en face du marché.", "L'église est à côté du marché.", "L'église est près du marché."],
    explanation: "'Derrière' means 'behind' — the other prepositions describe facing, next to, or generally near, not specifically behind.",
  },
  {
    situation: "You must walk through the market to reach school, cutting across it.",
    correct: "On passe à travers le marché.",
    distractors: ["On passe à côté du marché.", "On passe derrière le marché.", "On passe près du marché."],
    explanation: "'À travers' means 'through' — the others describe passing beside, behind, or near, not cutting directly across.",
  },
  {
    situation: "You want to ask where the supermarket is located.",
    correct: "Où est le supermarché ?",
    distractors: ["Le supermarché est loin.", "J'aime le supermarché.", "Le supermarché est fermé."],
    explanation: "'Où est... ?' is the question form for asking a location — the others are statements, not questions.",
  },
];

export const gettingAroundSpeaking: Skill = {
  id: "g7-fr-ls-getting-around",
  code: "LS.9",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "In the neighbourhood",
  description: "Vocabulary for places in the neighbourhood and location prepositions for describing where they are.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each French neighbourhood word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Place words name a building; preposition words describe a location relationship.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, WORDS.filter((p) => p.tag === "place")).slice(0, 4);
      const prepositions = shuffle(rng, WORDS.filter((p) => p.tag === "preposition")).slice(0, 4);
      const items = shuffle(rng, [...places, ...prepositions]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Place or a Location Preposition.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "place", label: "Place" },
          { id: "preposition", label: "Location Preposition" },
        ],
        correctBucket,
        hint: "Place words name a building; preposition words describe where it is relative to something else.",
        explanation: [...places, ...prepositions]
          .map((p) => `"${p.word}" is a ${p.tag === "place" ? "place" : "location preposition"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about the neighbourhood.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which place or preposition word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about a location.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The place comes first, then 'est', then the preposition, then the reference point.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation} What do you say?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Check which preposition actually matches the spatial relationship described.",
      explanation: s.explanation,
    };
  },
};
