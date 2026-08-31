import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";

type Tag = "time" | "activity";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "après les cours", meaning: "after class", tag: "time" },
  { word: "la récréation", meaning: "break/recess", tag: "time" },
  { word: "le week-end", meaning: "the weekend", tag: "time" },
  { word: "les vacances", meaning: "the holidays", tag: "time" },
  { word: "la musique", meaning: "music", tag: "activity" },
  { word: "le cinéma", meaning: "the cinema/movies", tag: "activity" },
  { word: "le sport", meaning: "sport", tag: "activity" },
  { word: "la lecture", meaning: "reading", tag: "activity" },
  { word: "les jeux vidéo", meaning: "video games", tag: "activity" },
  { word: "la peinture", meaning: "painting", tag: "activity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "J'aime la ", after: " le week-end.", answer: "musique", gloss: "J'aime la musique le week-end. — I like music on the weekend." },
  { before: "Je fais du ", after: " après les cours.", answer: "sport", gloss: "Je fais du sport après les cours. — I play sport after class." },
  { before: "Je fais de la ", after: " pendant les vacances.", answer: "peinture", gloss: "Je fais de la peinture pendant les vacances. — I paint during the holidays." },
  { before: "Je joue aux jeux ", after: " à la récréation.", answer: "vidéo", gloss: "Je joue aux jeux vidéo à la récréation. — I play video games at break time." },
  { before: "J'aime la ", after: " après les cours.", answer: "lecture", gloss: "J'aime la lecture après les cours. — I like reading after class." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["J'aime", "la", "musique", "le", "week-end", "."], sentence: "J'aime la musique le week-end." },
  { chunks: ["Je", "fais", "du", "sport", "après", "les", "cours", "."], sentence: "Je fais du sport après les cours." },
  { chunks: ["Je", "lis", "pendant", "les", "vacances", "."], sentence: "Je lis pendant les vacances." },
];

const NOTE_SCENARIOS: { note: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    note: "You are writing a diary entry about what you do during the holidays: you read a lot.",
    correct: "J'aime la lecture pendant les vacances.",
    distractors: ["J'aime la lecture après les cours.", "Je fais du sport pendant les vacances.", "Je regarde le cinéma pendant les vacances."],
    explanation: "'J'aime la lecture pendant les vacances' correctly pairs the activity (reading) with the correct time (holidays).",
  },
  {
    note: "You are writing about what you do at the short break between lessons: you play video games.",
    correct: "Je joue aux jeux vidéo à la récréation.",
    distractors: ["Je joue aux jeux vidéo le week-end.", "J'aime le sport à la récréation.", "Je fais de la peinture à la récréation."],
    explanation: "'Je joue aux jeux vidéo à la récréation' correctly pairs video games with break time — the others change the time or the activity.",
  },
  {
    note: "You are writing that you enjoy sport on Saturdays and Sundays.",
    correct: "J'aime le sport le week-end.",
    distractors: ["J'aime le sport après les cours.", "J'aime la musique le week-end.", "Je fais de la peinture le week-end."],
    explanation: "'J'aime le sport le week-end' correctly names sport as the activity and the weekend as the time.",
  },
  {
    note: "You are labeling a section of your notebook for things you do right after school each day.",
    correct: "après les cours",
    distractors: ["la récréation", "le week-end", "les vacances"],
    explanation: "'Après les cours' means 'after class' — the other time expressions refer to break, weekend, or holidays instead.",
  },
];

export const funWriting: Skill = {
  id: "g7-fr-w-fun",
  code: "W.5",
  subjectId: "french",
  strandId: "g7-fr-writing",
  grade: 7,
  title: "Leisure time",
  description: "Guided writing about leisure activities and when they happen — after class, at break, on weekends, and during holidays.",
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
        prompt: "Match each written French leisure-time word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Time words describe when; activity words describe what.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const times = shuffle(rng, WORDS.filter((p) => p.tag === "time"));
      const activities = shuffle(rng, WORDS.filter((p) => p.tag === "activity")).slice(0, 4);
      const items = shuffle(rng, [...times, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Time Expression or a Leisure Activity.",
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "time", label: "Time Expression" },
          { id: "activity", label: "Leisure Activity" },
        ],
        correctBucket,
        hint: "Time expressions describe when leisure happens; activity words describe what you do.",
        explanation: [...times, ...activities]
          .map((p) => `"${p.word}" is a ${p.tag === "time" ? "time expression" : "leisure activity"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written sentence about leisure time.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: accentAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which activity or time expression fits this written sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct French sentence about leisure time.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The subject and verb come first, then the activity, then the time expression.",
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
      hint: "Check that both the activity and the time expression match the situation.",
      explanation: s.explanation,
    };
  },
};
