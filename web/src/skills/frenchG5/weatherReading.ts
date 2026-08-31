import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { matchPrompt, orderPrompt, fillPrompt, readingTrueFalsePrompt } from "./g5FrShared";

const LINES = [
  "Achieng : Mumbi, quel temps fait-il aujourd'hui ?",
  "Mumbi : Il fait beau ce matin, mais il pleut cet après-midi.",
  "Achieng : Il fait chaud ou il fait froid ?",
  "Mumbi : Il fait chaud le matin, mais il fait froid le soir.",
  "Achieng : Il y a du vent aussi ?",
  "Mumbi : Oui, il y a beaucoup de vent près de la colline.",
  "Achieng : Le ciel est nuageux ?",
  "Mumbi : Oui, le ciel est très nuageux maintenant.",
  "Achieng : C'est un temps ami ou un temps difficile ?",
  "Mumbi : La pluie et le vent, c'est un temps difficile pour jouer dehors.",
  "Achieng : Et le beau temps du matin ?",
  "Mumbi : Ça, c'est un temps ami pour jouer dehors !",
];
const PASSAGE = LINES.join("\n");

const TRUE_FALSE: { text: string; isTrue: boolean }[] = [
  { text: "Achieng asks Mumbi about today's weather.", isTrue: true },
  { text: "Mumbi says it's raining this morning.", isTrue: false },
  { text: "Mumbi says it's nice out this morning.", isTrue: true },
  { text: "Mumbi says it rains in the afternoon.", isTrue: true },
  { text: "Mumbi says it's hot in the evening.", isTrue: false },
  { text: "Mumbi says it's cold in the evening.", isTrue: true },
  { text: "There is a lot of wind near the hill.", isTrue: true },
  { text: "Mumbi says the sky is clear, with no clouds.", isTrue: false },
  { text: "Mumbi says the sky is very cloudy.", isTrue: true },
  { text: "Mumbi calls the rain and wind unfriendly weather for playing outside.", isTrue: true },
  { text: "Mumbi calls the morning's nice weather friendly weather for playing outside.", isTrue: true },
  { text: "Achieng is the one describing the weather each time.", isTrue: false },
];

const MATCH: { phrase: string; meaning: string }[] = [
  { phrase: "Quel temps fait-il aujourd'hui ?", meaning: "What's the weather like today?" },
  { phrase: "Il fait beau ce matin.", meaning: "It's nice out this morning." },
  { phrase: "Il pleut cet après-midi.", meaning: "It's raining this afternoon." },
  { phrase: "Il fait chaud le matin.", meaning: "It's hot in the morning." },
  { phrase: "Il fait froid le soir.", meaning: "It's cold in the evening." },
  { phrase: "Il y a beaucoup de vent.", meaning: "There's a lot of wind." },
  { phrase: "Le ciel est très nuageux.", meaning: "The sky is very cloudy." },
  { phrase: "Un temps difficile pour jouer dehors.", meaning: "Difficult weather for playing outside." },
  { phrase: "Un temps ami pour jouer dehors.", meaning: "Friendly weather for playing outside." },
];

const QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Quel temps fait-il ce matin, selon Mumbi ?",
    correct: "Il fait beau",
    distractors: ["Il pleut", "Il fait froid", "Il fait nuageux"],
    explanation: "Mumbi dit : \"Il fait beau ce matin, mais il pleut cet après-midi.\"",
  },
  {
    q: "Quel temps fait-il cet après-midi ?",
    correct: "Il pleut",
    distractors: ["Il fait beau", "Il fait chaud", "Il y a du soleil"],
    explanation: "Mumbi dit : \"il pleut cet après-midi.\"",
  },
  {
    q: "Quel temps fait-il le soir ?",
    correct: "Il fait froid",
    distractors: ["Il fait chaud", "Il fait beau", "Il pleut"],
    explanation: "Mumbi dit : \"il fait froid le soir.\"",
  },
  {
    q: "Où y a-t-il beaucoup de vent ?",
    correct: "Près de la colline",
    distractors: ["Près de la rivière", "Dans la classe", "Près de l'école"],
    explanation: "Mumbi dit : \"il y a beaucoup de vent près de la colline.\"",
  },
  {
    q: "Comment est le ciel, selon Mumbi ?",
    correct: "Très nuageux",
    distractors: ["Très clair", "Sans nuages", "Ensoleillé"],
    explanation: "Mumbi dit : \"le ciel est très nuageux maintenant.\"",
  },
  {
    q: "Que dit Mumbi de la pluie et du vent ?",
    correct: "C'est un temps difficile pour jouer dehors",
    distractors: ["C'est un temps ami pour jouer dehors", "C'est un temps parfait", "Ce n'est pas important"],
    explanation: "Mumbi dit : \"La pluie et le vent, c'est un temps difficile pour jouer dehors.\"",
  },
  {
    q: "Que dit Mumbi du beau temps du matin ?",
    correct: "C'est un temps ami pour jouer dehors",
    distractors: ["C'est un temps difficile", "C'est dangereux", "C'est ennuyeux"],
    explanation: "Mumbi dit : \"Ça, c'est un temps ami pour jouer dehors !\"",
  },
];

const FILL_LINES: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Mumbi : Il fait ", after: " ce matin, mais il pleut cet après-midi.", answer: "beau", gloss: "It's nice out this morning, but it rains this afternoon." },
  { before: "Mumbi : Il fait beau ce matin, mais il ", after: " cet après-midi.", answer: "pleut", gloss: "It's nice out this morning, but it rains this afternoon." },
  { before: "Mumbi : Il fait chaud le matin, mais il fait ", after: " le soir.", answer: "froid", gloss: "It's hot in the morning, but cold in the evening." },
  { before: "Mumbi : Oui, il y a beaucoup de ", after: " près de la colline.", answer: "vent", gloss: "There's a lot of wind near the hill." },
  { before: "Mumbi : Oui, le ciel est très ", after: " maintenant.", answer: "nuageux", gloss: "The sky is very cloudy now." },
  { before: "Mumbi : La pluie et le vent, c'est un temps ", after: " pour jouer dehors.", answer: "difficile", gloss: "Rain and wind are difficult weather for playing outside." },
  { before: "Mumbi : Ça, c'est un temps ", after: " pour jouer dehors !", answer: "ami", gloss: "That's friendly weather for playing outside!" },
  { before: "Achieng : Mumbi, quel ", after: " fait-il aujourd'hui ?", answer: "temps", gloss: "Achieng asks what the weather is like today." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Il", "fait", "beau", "ce", "matin", "."], sentence: "Il fait beau ce matin." },
  { chunks: ["Il", "pleut", "cet", "après-midi", "."], sentence: "Il pleut cet après-midi." },
  { chunks: ["Il", "fait", "froid", "le", "soir", "."], sentence: "Il fait froid le soir." },
  { chunks: ["Le", "ciel", "est", "très", "nuageux", "."], sentence: "Le ciel est très nuageux." },
];

export const weatherReading: Skill = {
  id: "g5-fr-r-weather",
  code: "R.8",
  subjectId: "french",
  strandId: "g5-fr-reading",
  grade: 5,
  title: "Reading: weather and environment",
  description: "Read a short French dialogue describing changing weather across the day and sorting it as friendly or difficult for playing outside, then answer comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "click-match", "ordering", "fill-blank", "multiple-choice"] as const);

    if (branch === "categorize") {
      const chosen = shuffle(rng, TRUE_FALSE).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: PASSAGE,
        prompt: readingTrueFalsePrompt(rng),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the dialogue carefully and check exactly what Mumbi says about each moment of the day.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, MATCH).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.phrase] = p.phrase;

      return {
        kind: "click-match",
        passage: PASSAGE,
        prompt: matchPrompt(rng, "phrase from the dialogue to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Look at how each phrase is used in the dialogue above.",
        explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "ordering") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        passage: PASSAGE,
        prompt: orderPrompt(rng, "the words to rebuild this line from the dialogue"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Check the dialogue above for the exact wording and word order.",
        explanation: `The correct line is: "${set.sentence}"`,
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, FILL_LINES);
      return {
        kind: "fill-blank",
        passage: PASSAGE,
        prompt: fillPrompt(rng),
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Reread the matching line in the dialogue above.",
        explanation: `The complete line is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);

    return {
      kind: "multiple-choice",
      passage: PASSAGE,
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Look at what Mumbi actually says about the weather at each moment.",
      explanation: q.explanation,
    };
  },
};
