import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const WEATHER: { phrase: string; meaning: string }[] = [
  { phrase: "Il fait chaud", meaning: "It is hot" },
  { phrase: "Il fait froid", meaning: "It is cold" },
  { phrase: "Il fait beau", meaning: "It is nice/beautiful weather" },
  { phrase: "Il pleut", meaning: "It is raining" },
  { phrase: "Il neige", meaning: "It is snowing" },
  { phrase: "Il fait du vent", meaning: "It is windy" },
];

const LANDSCAPE: { word: string; meaning: string }[] = [
  { word: "la montagne", meaning: "the mountain" },
  { word: "la rivière", meaning: "the river" },
  { word: "la forêt", meaning: "the forest" },
  { word: "la plaine", meaning: "the plain" },
  { word: "le lac", meaning: "the lake" },
  { word: "la colline", meaning: "the hill" },
  { word: "la vallée", meaning: "the valley" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "En été, il fait ", after: ". En hiver, il fait froid.", answer: "chaud" },
  { before: "En été, il fait chaud. En hiver, il fait ", after: ".", answer: "froid" },
  { before: "Quand il ", after: ", je porte un imperméable et des bottes.", answer: "pleut" },
  { before: "Quand il pleut, je porte un imperméable et des ", after: ".", answer: "bottes" },
  { before: "En décembre dans les montagnes, il ", after: " souvent.", answer: "neige" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["En été,", "il fait chaud", "."], sentence: "En été, il fait chaud." },
  { chunks: ["Quand il pleut,", "je porte", "un imperméable et des bottes", "."], sentence: "Quand il pleut, je porte un imperméable et des bottes." },
  { chunks: ["La rivière", "coule", "entre la colline et la forêt", "."], sentence: "La rivière coule entre la colline et la forêt." },
];

export const environmentSpeaking: Skill = {
  id: "g8-fr-ls-environment",
  code: "LS.8",
  subjectId: "french",
  strandId: "g8-fr-listening-speaking",
  grade: 8,
  title: "Physical features and weather",
  description: "Describe the weather and physical landscape features in French.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const weather = shuffle(rng, WEATHER).slice(0, 4).map((w) => w.phrase);
      const landscape = shuffle(rng, LANDSCAPE).slice(0, 3).map((l) => l.word);
      const items = shuffle(rng, [...weather, ...landscape]);
      const correctBucket: Record<string, string> = {};
      for (const w of weather) correctBucket[w] = "weather";
      for (const l of landscape) correctBucket[l] = "landscape";

      return {
        kind: "categorize",
        prompt: "Sort each word or phrase as Weather (le temps) or Landscape feature (le paysage).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "weather", label: "Weather" },
          { id: "landscape", label: "Landscape feature" },
        ],
        correctBucket,
        hint: "Weather phrases start with 'Il fait' or 'Il pleut/neige'; landscape words name a place in nature.",
        explanation: `Weather: ${weather.join(", ")}. Landscape: ${landscape.join(", ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the French sentence about weather.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Look at the season or clothing mentioned for a clue about the weather.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about weather or landscape.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Read the pieces aloud in different orders until the sentence sounds right.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const w = randChoice(rng, WEATHER);
      const distractors = shuffle(rng, WEATHER.filter((x) => x.phrase !== w.phrase)).slice(0, 3).map((x) => x.meaning);
      const choices = shuffle(rng, [w.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Que veut dire "${w.phrase}" en anglais ?`,
        choices,
        correctIndex: choices.indexOf(w.meaning),
        layout: "list",
        hint: "Think about which weather condition this French phrase describes.",
        explanation: `"${w.phrase}" means "${w.meaning}".`,
      };
    }

    const chosen = shuffle(rng, LANDSCAPE).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((l) => ({ id: l.word, label: l.word })));
    const targets = shuffle(rng, chosen.map((l) => ({ id: l.word, label: l.meaning })));
    const correctMap: Record<string, string> = {};
    for (const l of chosen) correctMap[l.word] = l.word;

    return {
      kind: "click-match",
      prompt: "Match each French landscape word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'La colline' is a small hill, while 'la montagne' is a tall mountain.",
      explanation: chosen.map((l) => `"${l.word}" means "${l.meaning}".`).join(" "),
    };
  },
};
