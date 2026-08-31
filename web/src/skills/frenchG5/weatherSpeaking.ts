import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "friendly" | "unfriendly";

const WEATHER: { phrase: string; meaning: string; tag: Tag }[] = [
  { phrase: "il fait beau", meaning: "it's nice out", tag: "friendly" },
  { phrase: "il fait chaud", meaning: "it's hot", tag: "friendly" },
  { phrase: "il pleut", meaning: "it's raining", tag: "unfriendly" },
  { phrase: "il fait mauvais", meaning: "the weather is bad", tag: "unfriendly" },
  { phrase: "il y a du vent", meaning: "it's windy", tag: "unfriendly" },
  { phrase: "il fait nuageux", meaning: "it's cloudy", tag: "unfriendly" },
  { phrase: "il fait froid", meaning: "it's cold", tag: "unfriendly" },
  { phrase: "il fait orageux", meaning: "it's stormy", tag: "unfriendly" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Il fait ", after: " aujourd'hui.", answer: "beau", gloss: "Il fait beau aujourd'hui. — It's nice out today." },
  { before: "Il ", after: " beaucoup ce matin.", answer: "pleut", gloss: "Il pleut beaucoup ce matin. — It's raining a lot this morning." },
  { before: "Il fait très ", after: " en décembre.", answer: "chaud", gloss: "Il fait très chaud en décembre. — It's very hot in December." },
  { before: "Il fait très ", after: " en juillet.", answer: "froid", gloss: "Il fait très froid en juillet. — It's very cold in July." },
  { before: "Il y a du ", after: " sur la colline.", answer: "vent", gloss: "Il y a du vent sur la colline. — It's windy on the hill." },
  { before: "Le ciel est ", after: " aujourd'hui.", answer: "nuageux", gloss: "Le ciel est nuageux aujourd'hui. — The sky is cloudy today." },
  { before: "Le temps est ", after: " en ce moment.", answer: "orageux", gloss: "Le temps est orageux en ce moment. — The weather is stormy right now." },
  { before: "Il fait ", after: " pour un pique-nique.", answer: "mauvais", gloss: "Il fait mauvais pour un pique-nique. — The weather is bad for a picnic." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "fait", "beau", "."], sentence: "Il fait beau." },
  { chunks: ["Il", "pleut", "beaucoup", "."], sentence: "Il pleut beaucoup." },
  { chunks: ["Il", "y", "a", "du", "vent", "."], sentence: "Il y a du vent." },
  { chunks: ["Il", "fait", "très", "froid", "."], sentence: "Il fait très froid." },
  { chunks: ["Le", "ciel", "est", "nuageux", "."], sentence: "Le ciel est nuageux." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} looks outside and sees clear sunshine and a pleasant temperature.`,
    correct: "Il fait beau.",
    distractors: ["Il pleut.", "Il fait mauvais.", "Il y a du vent."],
    explanation: "'Il fait beau' describes pleasant, clear weather — the others describe rain, bad weather, or wind.",
  },
  {
    situation: (n) => `${n} runs inside soaking wet because water is falling from the sky.`,
    correct: "Il pleut.",
    distractors: ["Il fait beau.", "Il fait chaud.", "Il fait nuageux."],
    explanation: "'Il pleut' names rain — the others describe nice, hot, or cloudy weather, not rainfall.",
  },
  {
    situation: (n) => `${n} feels the sun beating down and wants to describe how hot it is.`,
    correct: "Il fait chaud.",
    distractors: ["Il fait froid.", "Il pleut.", "Il y a du vent."],
    explanation: "'Il fait chaud' names hot weather — 'il fait froid' names the opposite, cold weather.",
  },
  {
    situation: (n) => `${n} shivers and pulls on a jacket because the temperature has dropped.`,
    correct: "Il fait froid.",
    distractors: ["Il fait chaud.", "Il fait beau.", "Il pleut."],
    explanation: "'Il fait froid' names cold weather — 'il fait chaud' names the opposite, hot weather.",
  },
  {
    situation: (n) => `${n} watches leaves and dust blowing sideways across the yard.`,
    correct: "Il y a du vent.",
    distractors: ["Il fait beau.", "Il pleut.", "Il fait froid."],
    explanation: "'Il y a du vent' names windy weather — the others describe sun, rain, or cold, not wind.",
  },
  {
    situation: (n) => `${n} looks up and sees the whole sky covered in grey, with no sun visible.`,
    correct: "Il fait nuageux.",
    distractors: ["Il fait beau.", "Il fait chaud.", "Il y a du vent."],
    explanation: "'Il fait nuageux' names cloudy weather — the others describe clear sun, heat, or wind, not clouds.",
  },
  {
    situation: (n) => `${n} hears thunder rumbling and sees flashes of lightning.`,
    correct: "Il fait orageux.",
    distractors: ["Il fait nuageux.", "Il fait beau.", "Il fait froid."],
    explanation: "'Il fait orageux' names stormy weather with thunder and lightning — plain cloudy weather doesn't include thunder.",
  },
  {
    situation: (n) => `${n} decides to cancel the picnic because the weather is generally unpleasant today.`,
    correct: "Il fait mauvais.",
    distractors: ["Il fait beau.", "Il fait chaud.", "Il fait nuageux."],
    explanation: "'Il fait mauvais' is the general expression for bad weather — 'il fait beau' means the opposite, nice weather.",
  },
];

export const weatherSpeaking: Skill = {
  id: "g5-fr-ls-weather",
  code: "LS.8",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Weather and environment",
  description: "Describing weather conditions in French and sorting them as friendly or unfriendly — practiced through matching, sorting, and speaking scenarios.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WEATHER).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "French weather expression to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "'Il fait…' describes a condition; 'il pleut'/'il y a du vent' describe rain or wind directly.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const friendly = shuffle(rng, WEATHER.filter((p) => p.tag === "friendly"));
      const unfriendly = shuffle(rng, WEATHER.filter((p) => p.tag === "unfriendly")).slice(0, 4);
      const items = shuffle(rng, [...friendly, ...unfriendly]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.phrase] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each weather expression as Friendly or Unfriendly weather"),
        items: items.map((p) => ({ id: p.phrase, label: p.phrase })),
        buckets: [
          { id: "friendly", label: "Friendly Weather" },
          { id: "unfriendly", label: "Unfriendly Weather" },
        ],
        correctBucket,
        hint: "Friendly weather is pleasant and safe outdoors; unfriendly weather (rain, storms, strong wind, cold) can be harsh.",
        explanation: [...friendly, ...unfriendly]
          .map((p) => `"${p.phrase}" is ${p.tag === "friendly" ? "friendly" : "unfriendly"} weather.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the 'il fait beau/chaud/froid, il pleut, il y a du vent, il fait nuageux' pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French weather sentence"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Il fait' or 'il pleut'/'il y a' comes first, then the weather description.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    const n = name(rng);
    const s = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [s.correct, ...s.distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${s.situation(n)} ${speakingScenarioCloser(rng)}`,
      choices,
      correctIndex: choices.indexOf(s.correct),
      layout: "list",
      hint: "Think about which specific weather description actually matches what's being observed.",
      explanation: s.explanation,
    };
  },
};
