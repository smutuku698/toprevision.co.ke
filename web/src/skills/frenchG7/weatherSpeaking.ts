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
  { word: "il y a du vent", meaning: "it's windy", tag: "weather" },
  { word: "il fait beau", meaning: "the weather is nice", tag: "weather" },
  { word: "un pull", meaning: "a sweater", tag: "clothing" },
  { word: "un manteau", meaning: "a coat", tag: "clothing" },
  { word: "un short", meaning: "shorts", tag: "clothing" },
  { word: "un T-shirt", meaning: "a T-shirt", tag: "clothing" },
  { word: "des gants", meaning: "gloves", tag: "clothing" },
  { word: "une robe", meaning: "a dress", tag: "clothing" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Il fait ", after: " aujourd'hui.", answer: "chaud", gloss: "Il fait chaud aujourd'hui. — It's hot today." },
  { before: "Il ", after: " beaucoup en mars.", answer: "pleut", gloss: "Il pleut beaucoup en mars. — It rains a lot in March." },
  { before: "Il y a du ", after: " aujourd'hui.", answer: "vent", gloss: "Il y a du vent aujourd'hui. — It's windy today." },
  { before: "En hiver, je porte un ", after: ".", answer: "manteau", gloss: "En hiver, je porte un manteau. — In winter, I wear a coat." },
  { before: "En été, je porte un ", after: ".", answer: "short", gloss: "En été, je porte un short. — In summer, I wear shorts." },
  { before: "Quand il fait froid, je porte des ", after: ".", answer: "gants", gloss: "Quand il fait froid, je porte des gants. — When it's cold, I wear gloves." },
  { before: "Aujourd'hui, il fait ", after: ", pas de nuages !", answer: "beau", gloss: "Aujourd'hui, il fait beau, pas de nuages ! — Today the weather is nice, no clouds!" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "fait", "chaud", "aujourd'hui", "."], sentence: "Il fait chaud aujourd'hui." },
  { chunks: ["Je", "porte", "un", "manteau", "en", "hiver", "."], sentence: "Je porte un manteau en hiver." },
  { chunks: ["Il", "pleut", "beaucoup", "en", "mars", "."], sentence: "Il pleut beaucoup en mars." },
];

const SCENARIOS: { situation: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: "It is raining heavily outside right now.",
    correct: "Il pleut.",
    distractors: ["Il fait chaud.", "Il fait beau.", "Il y a du vent."],
    explanation: "'Il pleut' describes rain — the other expressions describe heat, nice weather, or wind, not rain.",
  },
  {
    situation: "The sky is clear and the weather is generally pleasant today.",
    correct: "Il fait beau.",
    distractors: ["Il pleut.", "Il fait mauvais.", "Il y a du vent."],
    explanation: "'Il fait beau' means the weather is nice — 'il fait mauvais' is its near-opposite, describing bad weather.",
  },
  {
    situation: "It is cold outside and you need to keep warm on your body.",
    correct: "Je porte un manteau.",
    distractors: ["Je porte un short.", "Je porte un T-shirt.", "Je porte une robe légère."],
    explanation: "'Un manteau' (a coat) is worn for warmth — shorts, T-shirts, and light dresses suit warm weather instead.",
  },
  {
    situation: "It is hot outside and you want light clothing for your legs.",
    correct: "Je porte un short.",
    distractors: ["Je porte un manteau.", "Je porte un pull.", "Je porte des gants."],
    explanation: "'Un short' is light clothing suited to hot weather — coats, sweaters, and gloves are for cold weather.",
  },
  {
    situation: "Your hands are cold and you want to warm them.",
    correct: "Je porte des gants.",
    distractors: ["Je porte un short.", "Je porte un T-shirt.", "Je porte une robe."],
    explanation: "'Des gants' (gloves) warm the hands — the other clothing items don't cover the hands.",
  },
  {
    situation: "You want to name Kenya's two main seasons, based on rainfall.",
    correct: "La saison sèche et la saison des pluies.",
    distractors: ["Le printemps et l'automne.", "L'été et l'hiver.", "La saison sèche et l'hiver."],
    explanation: "Kenya's climate is usually described by rainfall — 'la saison sèche' (dry season) and 'la saison des pluies' (rainy season) — rather than the four European seasons.",
  },
];

export const weatherSpeaking: Skill = {
  id: "g7-fr-ls-weather",
  code: "LS.8",
  subjectId: "french",
  strandId: "g7-fr-listening-speaking",
  grade: 7,
  title: "Seasons and clothing",
  description: "Vocabulary for weather patterns, seasons, and clothing appropriate for different weather.",
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
        prompt: "Match each French weather or clothing word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Weather words describe the sky/temperature; clothing words name a garment.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const weather = shuffle(rng, WORDS.filter((p) => p.tag === "weather")).slice(0, 4);
      const clothing = shuffle(rng, WORDS.filter((p) => p.tag === "clothing")).slice(0, 4);
      const items = shuffle(rng, [...weather, ...clothing]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Weather Expression or a Clothing Item.",
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
        prompt: "Fill in the missing word to complete the sentence about weather or clothing.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which weather or clothing word fits this sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about weather or clothing.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Il' + weather verb comes first for weather; the subject + verb + clothing item for outfits.",
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
      hint: "Think about which weather or clothing expression actually fits this situation.",
      explanation: s.explanation,
    };
  },
};
