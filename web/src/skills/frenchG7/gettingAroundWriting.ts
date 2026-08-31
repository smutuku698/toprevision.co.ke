import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "place" | "preposition";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la boutique", meaning: "the shop", tag: "place" },
  { word: "le marché", meaning: "the market", tag: "place" },
  { word: "l'église", meaning: "the church", tag: "place" },
  { word: "la mosquée", meaning: "the mosque", tag: "place" },
  { word: "le supermarché", meaning: "the supermarket", tag: "place" },
  { word: "en face de", meaning: "opposite", tag: "preposition" },
  { word: "à côté de", meaning: "next to", tag: "preposition" },
  { word: "derrière", meaning: "behind", tag: "preposition" },
  { word: "près de", meaning: "near", tag: "preposition" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "L'église est ", after: " le marché.", answer: "derrière", gloss: "L'église est derrière le marché. — The church is behind the market." },
  { before: "La boutique est à ", after: " de l'école.", answer: "côté", gloss: "La boutique est à côté de l'école. — The shop is next to the school." },
  { before: "Le supermarché est ", after: " de la mosquée.", answer: "près", gloss: "Le supermarché est près de la mosquée. — The supermarket is near the mosque." },
  { before: "La boulangerie est en ", after: " de la boutique.", answer: "face", gloss: "La boulangerie est en face de la boutique. — The bakery is opposite the shop." },
  { before: "Où est le ", after: " ?", answer: "marché", gloss: "Où est le marché ? — Where is the market?" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["L'église", "est", "derrière", "le", "marché", "."], sentence: "L'église est derrière le marché." },
  { chunks: ["Où", "est", "le", "supermarché", "?"], sentence: "Où est le supermarché ?" },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing directions saying the church is behind the market.",
    correct: "L'église est derrière le marché.",
    distractors: ["L'église est en face du marché.", "L'église est à côté du marché.", "L'église est loin du marché."],
    explanation: "'Derrière' means 'behind' — the other prepositions describe facing, next to, or far, not specifically behind.",
  },
  {
    note: "You are writing directions saying the shop is next to the school.",
    correct: "La boutique est à côté de l'école.",
    distractors: ["La boutique est derrière l'école.", "La boutique est en face de l'école.", "La boutique est près de l'église."],
    explanation: "'À côté de' means 'next to' — the other options describe behind, opposite, or a different location entirely.",
  },
  {
    note: "You are writing a note asking a friend where the supermarket is located.",
    correct: "Où est le supermarché ?",
    distractors: ["Le supermarché est fermé.", "J'aime le supermarché.", "Le supermarché est grand."],
    explanation: "'Où est... ?' is the written form for asking a location — the others are statements, not questions.",
  },
  {
    note: "You are writing that the bakery faces the shop directly, across the street.",
    correct: "La boulangerie est en face de la boutique.",
    distractors: ["La boulangerie est derrière la boutique.", "La boulangerie est à côté de la boutique.", "La boulangerie est loin de la boutique."],
    explanation: "'En face de' means 'opposite/facing' — the others describe behind, adjacent, or far, not directly across.",
  },
];

export const gettingAroundWriting: Skill = {
  id: "g7-fr-w-getting-around",
  code: "W.9",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "In the neighbourhood",
  description: "Guided writing about places in the neighbourhood and location prepositions for directions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French neighbourhood word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Place words name a building; preposition words describe a location relationship.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, WORDS.filter((p) => p.tag === "place"));
      const prepositions = shuffle(rng, WORDS.filter((p) => p.tag === "preposition"));
      const items = shuffle(rng, [...places, ...prepositions]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Place or a Location Preposition.",
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
        prompt: "Fill in the missing word to complete the written sentence about the neighbourhood.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which place or preposition word fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about a location.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The place comes first, then 'est', then the preposition, then the reference point.",
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
      hint: "Check which preposition actually matches the spatial relationship described.",
      explanation: s.explanation,
    };
  },
};
