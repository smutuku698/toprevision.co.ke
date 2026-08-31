import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "friendly" | "harsh";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "il fait beau", meaning: "it's nice weather", tag: "friendly" },
  { word: "il fait chaud", meaning: "it's hot", tag: "friendly" },
  { word: "il y a du soleil", meaning: "it's sunny", tag: "friendly" },
  { word: "le ciel est bleu", meaning: "the sky is blue", tag: "friendly" },
  { word: "il fait frais", meaning: "it's cool", tag: "friendly" },
  { word: "il fait doux", meaning: "it's mild", tag: "friendly" },
  { word: "il fait sec", meaning: "it's dry", tag: "friendly" },
  { word: "il fait mauvais", meaning: "the weather is bad", tag: "harsh" },
  { word: "il pleut", meaning: "it's raining", tag: "harsh" },
  { word: "il y a du vent", meaning: "it's windy", tag: "harsh" },
  { word: "il fait nuageux", meaning: "it's cloudy", tag: "harsh" },
  { word: "il y a un orage", meaning: "there's a storm", tag: "harsh" },
  { word: "il neige", meaning: "it's snowing", tag: "harsh" },
  { word: "il fait froid", meaning: "it's cold", tag: "harsh" },
  { word: "il y a du brouillard", meaning: "it's foggy", tag: "harsh" },
  { word: "il y a une inondation", meaning: "there's a flood", tag: "harsh" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Il fait ", after: " à Nairobi aujourd'hui.", answer: "beau", gloss: "Il fait beau à Nairobi aujourd'hui. — The weather is nice in Nairobi today." },
  { before: "Il fait ", after: " à Mombasa ; prends un parapluie.", answer: "mauvais", gloss: "Il fait mauvais à Mombasa ; prends un parapluie. — The weather is bad in Mombasa; take an umbrella." },
  { before: "Il ", after: " beaucoup en avril.", answer: "pleut", gloss: "Il pleut beaucoup en avril. — It rains a lot in April." },
  { before: "Il y a du ", after: " sur la côte.", answer: "vent", gloss: "Il y a du vent sur la côte. — It's windy on the coast." },
  { before: "Il fait ", after: ", le ciel est gris.", answer: "nuageux", gloss: "Il fait nuageux, le ciel est gris. — It's cloudy, the sky is grey." },
  { before: "Il fait ", after: " en décembre à Nairobi.", answer: "chaud", gloss: "Il fait chaud en décembre à Nairobi. — It's hot in December in Nairobi." },
  { before: "Il y a du ", after: " ce matin.", answer: "soleil", gloss: "Il y a du soleil ce matin. — It's sunny this morning." },
  { before: "Il ", after: " sur le mont Kenya en juillet.", answer: "neige", gloss: "Il neige sur le mont Kenya en juillet. — It snows on Mount Kenya in July." },
  { before: "Il fait ", after: " après la pluie.", answer: "frais", gloss: "Il fait frais après la pluie. — It's cool after the rain." },
  { before: "Il y a un ", after: " ce soir ; reste à l'intérieur.", answer: "orage", gloss: "Il y a un orage ce soir ; reste à l'intérieur. — There's a storm tonight; stay inside." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "fait", "beau", "à", "Nairobi", "."], sentence: "Il fait beau à Nairobi." },
  { chunks: ["Il", "fait", "mauvais", "aujourd'hui", "."], sentence: "Il fait mauvais aujourd'hui." },
  { chunks: ["Il", "pleut", "beaucoup", "en", "avril", "."], sentence: "Il pleut beaucoup en avril." },
  { chunks: ["Il", "y", "a", "du", "vent", "sur", "la", "côte", "."], sentence: "Il y a du vent sur la côte." },
  { chunks: ["Il", "fait", "nuageux", "aujourd'hui", "."], sentence: "Il fait nuageux aujourd'hui." },
  { chunks: ["Il", "fait", "froid", "en", "juillet", "."], sentence: "Il fait froid en juillet." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a French-club weather log entry for a sunny, pleasant day.",
    correct: "Il fait beau aujourd'hui.",
    distractors: ["Il fait mauvais aujourd'hui.", "Il pleut aujourd'hui.", "Il y a un orage aujourd'hui."],
    explanation: "'Il fait beau' describes nice, pleasant weather — the other options describe bad weather, rain, or a storm instead.",
  },
  {
    note: "You are writing a note warning a friend that it's raining, so they should bring an umbrella.",
    correct: "Il pleut, prends un parapluie.",
    distractors: ["Il fait beau, prends un parapluie.", "Il neige, prends un parapluie.", "Il pleut, prends un manteau chaud."],
    explanation: "'Il pleut' correctly names rain as the reason for an umbrella — nice weather or snow wouldn't call for one, and a warm coat doesn't match rain.",
  },
  {
    note: "You are writing that it's windy along the coast today.",
    correct: "Il y a du vent sur la côte.",
    distractors: ["Il y a du soleil sur la côte.", "Il y a du brouillard sur la côte.", "Il y a du vent dans les montagnes."],
    explanation: "'Il y a du vent' names windy conditions — the other options swap in sun or fog, or move the location to the mountains.",
  },
  {
    note: "You are writing a cloudy-sky weather forecast for the school notice board.",
    correct: "Il fait nuageux aujourd'hui.",
    distractors: ["Il fait beau aujourd'hui.", "Le ciel est bleu aujourd'hui.", "Il fait sec aujourd'hui."],
    explanation: "'Il fait nuageux' specifically describes a cloudy sky — the other options describe nice, clear-blue, or dry weather instead.",
  },
  {
    note: "You are writing that the weather is bad and the school outing has been cancelled.",
    correct: "Il fait mauvais aujourd'hui.",
    distractors: ["Il fait beau aujourd'hui.", "Il fait doux aujourd'hui.", "Il y a du soleil aujourd'hui."],
    explanation: "'Il fait mauvais' names bad weather, matching a cancelled outing — the other options all describe pleasant conditions.",
  },
  {
    note: "You are writing a friendly-weather description for a class picnic day.",
    correct: "Il fait beau et il y a du soleil.",
    distractors: ["Il fait mauvais et il y a du vent.", "Il pleut et il fait froid.", "Il fait nuageux et il y a du brouillard."],
    explanation: "'Il fait beau et il y a du soleil' pairs two friendly-weather expressions — the other options all combine harsh-weather expressions instead.",
  },
  {
    note: "You are writing that it's cold and snowing on Mount Kenya.",
    correct: "Il fait froid et il neige sur le mont Kenya.",
    distractors: ["Il fait chaud et il neige sur le mont Kenya.", "Il fait froid et il pleut sur le mont Kenya.", "Il fait froid et il y a du soleil sur le mont Kenya."],
    explanation: "'Il fait froid et il neige' correctly pairs cold temperature with snow — the other options mismatch hot weather with snow, or swap in rain or sun.",
  },
  {
    note: "You are writing a road-safety warning about fog affecting visibility this morning.",
    correct: "Il y a du brouillard ce matin.",
    distractors: ["Il y a du soleil ce matin.", "Il fait beau ce matin.", "Il y a du vent ce matin."],
    explanation: "'Il y a du brouillard' names fog, matching the visibility warning — the other options describe sun, nice weather, or wind, not fog.",
  },
  {
    note: "You are writing a storm warning for fishermen on Lake Victoria.",
    correct: "Il y a un orage ; les pêcheurs restent au port.",
    distractors: ["Il fait beau ; les pêcheurs restent au port.", "Il y a du soleil ; les pêcheurs restent au port.", "Il fait doux ; les pêcheurs restent au port."],
    explanation: "'Il y a un orage' names a storm, which explains why fishermen stay in port — the other options describe pleasant weather, which wouldn't cause that warning.",
  },
  {
    note: "You are writing that the weather is mild in the early morning.",
    correct: "Il fait doux le matin.",
    distractors: ["Il fait froid le matin.", "Il fait mauvais le matin.", "Il neige le matin."],
    explanation: "'Il fait doux' means mild weather — the other options describe cold, bad, or snowy conditions instead.",
  },
];

export const weatherWriting: Skill = {
  id: "g6-fr-w-weather",
  code: "W.8",
  subjectId: "french",
  strandId: "g6-fr-writing",
  grade: 6,
  title: "Weather patterns",
  description: "Guided writing about weather expressions in French, sorted as friendly or harsh conditions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "note"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;

      return {
        kind: "click-match",
        prompt: "Match each written French weather expression to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Read each expression closely — many start with 'il fait' or 'il y a du/un/une'.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const friendly = shuffle(rng, WORDS.filter((p) => p.tag === "friendly")).slice(0, 5);
      const harsh = shuffle(rng, WORDS.filter((p) => p.tag === "harsh")).slice(0, 5);
      const chosen = shuffle(rng, [...friendly, ...harsh]);
      const correctBucket: Record<string, string> = {};
      for (const p of friendly) correctBucket[p.word] = "friendly";
      for (const p of harsh) correctBucket[p.word] = "harsh";

      return {
        kind: "categorize",
        prompt: "Sort each written weather expression as Friendly or Harsh.",
        items: chosen.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "friendly", label: "Friendly" },
          { id: "harsh", label: "Harsh" },
        ],
        correctBucket,
        hint: "Friendly weather is calm, warm, or clear; harsh weather brings rain, wind, storms, cold, or poor visibility.",
        explanation: [...friendly, ...harsh].map((p) => `"${p.word}" is a ${correctBucket[p.word]} weather condition.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written weather sentence.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which weather word fits: 'il fait beau/mauvais', 'il pleut', 'il y a du vent', 'il fait nuageux'.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about the weather.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Il' plus the weather verb comes first, then the detail, then the place or time.",
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
      hint: "Match the specific weather condition described, not just any weather phrase.",
      explanation: s.explanation,
    };
  },
};
