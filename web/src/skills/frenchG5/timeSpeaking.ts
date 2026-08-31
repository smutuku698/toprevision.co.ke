import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { accentAccepted } from "../french/frenchUtils";
import { name, matchPrompt, sortPrompt, orderPrompt, fillPrompt, speakingScenarioCloser } from "./g5FrShared";

type Tag = "moment" | "activity";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "le matin", meaning: "in the morning", tag: "moment" },
  { word: "à midi", meaning: "at noon", tag: "moment" },
  { word: "le soir", meaning: "in the evening", tag: "moment" },
  { word: "la nuit", meaning: "at night", tag: "moment" },
  { word: "je me lève", meaning: "I get up", tag: "activity" },
  { word: "je prends le déjeuner", meaning: "I have lunch", tag: "activity" },
  { word: "je joue", meaning: "I play", tag: "activity" },
  { word: "je dors", meaning: "I sleep", tag: "activity" },
  { word: "je me lave", meaning: "I wash up", tag: "activity" },
  { word: "je mange", meaning: "I eat", tag: "activity" },
  { word: "je fais mes devoirs", meaning: "I do my homework", tag: "activity" },
  { word: "je regarde la télé", meaning: "I watch television", tag: "activity" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Le matin je me ", after: ".", answer: "lève", gloss: "Le matin je me lève. — In the morning I get up." },
  { before: "À midi je prends le ", after: ".", answer: "déjeuner", gloss: "À midi je prends le déjeuner. — At noon I have lunch." },
  { before: "Le soir je ", after: ".", answer: "joue", gloss: "Le soir je joue. — In the evening I play." },
  { before: "La ", after: " je dors.", answer: "nuit", gloss: "La nuit je dors. — At night I sleep." },
  { before: "Le matin je me ", after: ".", answer: "lave", gloss: "Le matin je me lave. — In the morning I wash up." },
  { before: "À midi je ", after: ".", answer: "mange", gloss: "À midi je mange. — At noon I eat." },
  { before: "Le soir je fais mes ", after: ".", answer: "devoirs", gloss: "Le soir je fais mes devoirs. — In the evening I do my homework." },
  { before: "Le soir je regarde la ", after: ".", answer: "télé", gloss: "Le soir je regarde la télé. — In the evening I watch television." },
  { before: "", after: " je me lève.", answer: "Le matin", gloss: "Le matin je me lève. — In the morning I get up." },
  { before: "", after: " je dors.", answer: "La nuit", gloss: "La nuit je dors. — At night I sleep." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Le", "matin", "je", "me", "lève", "."], sentence: "Le matin je me lève." },
  { chunks: ["À", "midi", "je", "prends", "le", "déjeuner", "."], sentence: "À midi je prends le déjeuner." },
  { chunks: ["Le", "soir", "je", "joue", "."], sentence: "Le soir je joue." },
  { chunks: ["La", "nuit", "je", "dors", "."], sentence: "La nuit je dors." },
  { chunks: ["Le", "soir", "je", "fais", "mes", "devoirs", "."], sentence: "Le soir je fais mes devoirs." },
];

const SCENARIOS: { situation: (n: string) => string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    situation: (n) => `${n} asks what you do right after you wake up in the morning.`,
    correct: "Le matin je me lève.",
    distractors: ["La nuit je dors.", "Le soir je joue.", "À midi je mange."],
    explanation: "'Le matin je me lève' names getting up in the morning specifically — the others describe a different moment of the day.",
  },
  {
    situation: (n) => `${n} asks what you do at midday, when it's mealtime.`,
    correct: "À midi je prends le déjeuner.",
    distractors: ["Le matin je me lève.", "La nuit je dors.", "Le soir je joue."],
    explanation: "'À midi je prends le déjeuner' names the midday meal — the other options describe a different moment.",
  },
  {
    situation: (n) => `${n} asks what you do in the evening after school, when you have free time.`,
    correct: "Le soir je joue.",
    distractors: ["Le matin je me lève.", "À midi je mange.", "La nuit je dors."],
    explanation: "'Le soir je joue' names playing in the evening — the others describe getting up, eating, or sleeping instead.",
  },
  {
    situation: (n) => `${n} asks what you do at night, once it's fully dark.`,
    correct: "La nuit je dors.",
    distractors: ["Le matin je me lève.", "Le soir je joue.", "À midi je prends le déjeuner."],
    explanation: "'La nuit je dors' names sleeping at night — the other options describe daytime activities.",
  },
  {
    situation: (n) => `${n} asks what you do first thing, to freshen up before school.`,
    correct: "Le matin je me lave.",
    distractors: ["Le soir je fais mes devoirs.", "À midi je mange.", "La nuit je dors."],
    explanation: "'Le matin je me lave' names washing up in the morning — the others name a different moment's activity.",
  },
  {
    situation: (n) => `${n} asks when you finish your schoolwork for the day, and you always do it after dinner.`,
    correct: "Le soir je fais mes devoirs.",
    distractors: ["Le matin je me lève.", "À midi je mange.", "La nuit je dors."],
    explanation: "'Le soir je fais mes devoirs' names homework done in the evening — the others describe a different time or activity.",
  },
  {
    situation: (n) => `${n} asks what you like watching after homework in the evening.`,
    correct: "Le soir je regarde la télé.",
    distractors: ["Le matin je me lave.", "À midi je mange.", "La nuit je dors."],
    explanation: "'Le soir je regarde la télé' names watching television in the evening — the others name a morning, midday, or nighttime activity.",
  },
  {
    situation: (n) => `${n} asks what you eat at midday.`,
    correct: "À midi je mange.",
    distractors: ["Le matin je me lève.", "Le soir je joue.", "La nuit je dors."],
    explanation: "'À midi je mange' names eating at noon — the others describe a different moment's routine.",
  },
];

export const timeSpeaking: Skill = {
  id: "g5-fr-ls-time",
  code: "LS.4",
  subjectId: "french",
  strandId: "g5-fr-listening-speaking",
  grade: 5,
  title: "Moments of the day",
  description: "Naming the morning, noon, evening, and night, and the routine activities that go with each — practiced through matching, sorting, and speaking scenarios.",
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
        prompt: matchPrompt(rng, "French word or phrase about time or daily activities to its English meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Moment words name a part of the day; activity phrases start with 'je'.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const moments = shuffle(rng, WORDS.filter((p) => p.tag === "moment"));
      const activities = shuffle(rng, WORDS.filter((p) => p.tag === "activity")).slice(0, 4);
      const items = shuffle(rng, [...moments, ...activities]);
      const correctBucket: Record<string, string> = {};
      for (const p of items) correctBucket[p.word] = p.tag;

      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "each word or phrase as a Moment of the Day or an Activity"),
        items: items.map((p) => ({ id: p.word, label: p.word })),
        buckets: [
          { id: "moment", label: "Moment of the Day" },
          { id: "activity", label: "Activity" },
        ],
        correctBucket,
        hint: "Moments name when (matin, midi, soir, nuit); activities start with 'je'.",
        explanation: [...moments, ...activities]
          .map((p) => `"${p.word}" is a ${p.tag === "moment" ? "moment of the day" : "activity"}.`)
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
        hint: "Think about the 'Le matin je me lève, à midi je prends le déjeuner...' pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to form a correct French sentence about your daily routine"),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "The moment of the day usually comes first, then 'je' plus the activity.",
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
      hint: "Match the routine activity to the correct moment of the day.",
      explanation: s.explanation,
    };
  },
};
