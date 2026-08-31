import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "En été, il fait ", after: ", mais en hiver, il fait froid.", answer: "chaud" },
  { before: "Quand il pleut, je porte un imperméable et des ", after: ".", answer: "bottes" },
  { before: "La ", after: " est plus haute que la colline.", answer: "montagne" },
  { before: "L'eau coule vite dans la ", after: " qui descend de la montagne.", answer: "rivière" },
  { before: "Il ", after: " beaucoup pendant la saison des pluies.", answer: "pleut" },
  { before: "Le ", after: " est une grande étendue d'eau calme entre les collines.", answer: "lac" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["En été,", "il fait", "très chaud."], sentence: "En été, il fait très chaud." },
  { chunks: ["Quand il pleut,", "je porte", "un imperméable."], sentence: "Quand il pleut, je porte un imperméable." },
  { chunks: ["La forêt", "est", "entre la montagne et la rivière."], sentence: "La forêt est entre la montagne et la rivière." },
  { chunks: ["En hiver,", "il fait froid", "et il neige."], sentence: "En hiver, il fait froid et il neige." },
];

const MC_ITEMS: { prompt: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    prompt: "Choose the correct expression for 'It is windy'.",
    correct: "Il fait du vent",
    distractors: ["Il fait le vent", "Il fait vent", "Il a du vent"],
    explanation: "Weather expressions with wind use 'Il fait du vent', with the partitive article 'du'.",
  },
  {
    prompt: "Choose the correct article to complete: '___ montagne est très haute.' (the mountain)",
    correct: "La",
    distractors: ["Le", "Les", "L'"],
    explanation: "'Montagne' is feminine singular and starts with a consonant sound, so it takes 'la'.",
  },
  {
    prompt: "Choose the correct article to complete: '___ lac est très calme aujourd'hui.' (the lake)",
    correct: "Le",
    distractors: ["La", "Les", "L'"],
    explanation: "'Lac' is masculine singular, so it takes 'le'.",
  },
  {
    prompt: "Choose the correct verb to complete: 'Il ___ beaucoup en avril.' (it rains)",
    correct: "pleut",
    distractors: ["pleu", "pleux", "pluit"],
    explanation: "The verb 'pleuvoir' (to rain) in the present tense with 'il' is 'il pleut'.",
  },
];

const MATCH_ITEMS: { term: string; meaning: string }[] = [
  { term: "la montagne", meaning: "the mountain" },
  { term: "la rivière", meaning: "the river" },
  { term: "la forêt", meaning: "the forest" },
  { term: "la plaine", meaning: "the plain" },
  { term: "le lac", meaning: "the lake" },
  { term: "la colline", meaning: "the hill" },
  { term: "la vallée", meaning: "the valley" },
  { term: "Il fait beau", meaning: "The weather is nice" },
  { term: "Il neige", meaning: "It is snowing" },
];

export const environmentWriting: Skill = {
  id: "g8-fr-w-environment",
  code: "W.8",
  subjectId: "french",
  strandId: "g8-fr-writing",
  grade: 8,
  title: "Writing about weather and physical features",
  description: "Write sentences about weather and physical features, order sentences, choose the correct article or verb form, and match vocabulary to its meaning.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order", "choice", "match"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct French sentence about weather or physical features.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject usually comes first, then the verb, then the rest of the sentence.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "choice") {
      const q = randChoice(rng, MC_ITEMS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);

      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Check the gender of the noun before choosing the article, and the verb ending for weather expressions.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.term })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.term, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.term] = p.term;

      return {
        kind: "click-match",
        prompt: "Match each French weather/physical feature word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "'la colline' and 'la montagne' are both raised land, but one is much taller.",
        explanation: chosen.map((p) => `"${p.term}" means "${p.meaning}".`).join(" "),
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the sentence about weather or physical features.",
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      acceptedAnswers: accentAccepted(item.answer),
      inputMode: "text",
      hint: "Think about weather conditions or landscape features and their descriptions.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
    };
  },
};
