import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "weather" | "clothing";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "la saison sèche", meaning: "the dry season", tag: "weather" },
  { word: "la saison des pluies", meaning: "the rainy season", tag: "weather" },
  { word: "le printemps", meaning: "spring", tag: "weather" },
  { word: "l'été", meaning: "summer", tag: "weather" },
  { word: "l'automne", meaning: "autumn", tag: "weather" },
  { word: "l'hiver", meaning: "winter", tag: "weather" },
  { word: "il fait chaud", meaning: "it's hot", tag: "weather" },
  { word: "il pleut", meaning: "it's raining", tag: "weather" },
  { word: "un pull", meaning: "a sweater", tag: "clothing" },
  { word: "un manteau", meaning: "a coat", tag: "clothing" },
  { word: "un short", meaning: "shorts", tag: "clothing" },
  { word: "des gants", meaning: "gloves", tag: "clothing" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Il fait ", after: " aujourd'hui.", answer: "chaud", gloss: "Il fait chaud aujourd'hui. — It's hot today." },
  { before: "Il ", after: " beaucoup en mars.", answer: "pleut", gloss: "Il pleut beaucoup en mars. — It rains a lot in March." },
  { before: "En hiver, je porte un ", after: ".", answer: "manteau", gloss: "En hiver, je porte un manteau. — In winter, I wear a coat." },
  { before: "En été, je porte un ", after: ".", answer: "short", gloss: "En été, je porte un short. — In summer, I wear shorts." },
  { before: "Au Kenya, il y a la saison sèche et la saison des ", after: ".", answer: "pluies", gloss: "In Kenya, there's the dry season and the rainy season." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "fait", "chaud", "aujourd'hui", "."], sentence: "Il fait chaud aujourd'hui." },
  { chunks: ["Je", "porte", "un", "manteau", "en", "hiver", "."], sentence: "Je porte un manteau en hiver." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a weather report line saying it's raining heavily today.",
    correct: "Il pleut beaucoup aujourd'hui.",
    distractors: ["Il fait beau aujourd'hui.", "Il fait chaud aujourd'hui.", "Il y a du vent aujourd'hui."],
    explanation: "'Il pleut beaucoup' describes heavy rain — the other options describe nice, hot, or windy weather instead.",
  },
  {
    note: "You are writing a packing list for a cold winter trip, including a warm outer garment.",
    correct: "un manteau",
    distractors: ["un short", "un T-shirt", "une robe légère"],
    explanation: "'Un manteau' (a coat) is a warm outer garment for winter — shorts, T-shirts, and light dresses suit warm weather.",
  },
  {
    note: "You are writing that Kenya's climate is mainly split into two rainfall-based seasons.",
    correct: "La saison sèche et la saison des pluies.",
    distractors: ["Le printemps et l'automne.", "L'été et l'hiver.", "La saison sèche et l'hiver."],
    explanation: "Kenya's climate is usually described by 'la saison sèche' (dry season) and 'la saison des pluies' (rainy season).",
  },
  {
    note: "You are writing that France has four seasons.",
    correct: "En France, il y a quatre saisons.",
    distractors: ["En France, il y a deux saisons.", "Au Kenya, il y a quatre saisons.", "En France, il fait toujours chaud."],
    explanation: "'En France, il y a quatre saisons' correctly names both the country and the number of seasons.",
  },
];

export const weatherWriting: Skill = {
  id: "g7-fr-w-weather",
  code: "W.8",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "Seasons and clothing",
  description: "Guided writing about weather patterns, seasons, and appropriate clothing.",
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
        prompt: "Match each written French weather or clothing word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Weather words describe the sky/temperature; clothing words name a garment.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const weather = shuffle(rng, WORDS.filter((p) => p.tag === "weather")).slice(0, 4);
      const clothing = shuffle(rng, WORDS.filter((p) => p.tag === "clothing"));
      const items = shuffle(rng, [...weather, ...clothing]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Weather Expression or a Clothing Item.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "weather", label: "Weather Expression" },
          { id: "clothing", label: "Clothing Item" },
        ],
        correctBucket,
        hint: "Weather expressions describe the sky or temperature; clothing items are things you wear.",
        explanation: [...weather, ...clothing]
          .map((p) => `"${p.word}" is a ${p.tag === "weather" ? "weather expression" : "clothing item"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about weather or clothing.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which weather or clothing word fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about weather or clothing.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Il' + weather verb comes first for weather; the subject + verb + clothing item for outfits.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const s = randChoice(rng, NOTE_SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.note} Which French sentence or word should you write?`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which weather or clothing expression actually fits this situation.",
      explanation: s.explanation,
    };
  },
};
