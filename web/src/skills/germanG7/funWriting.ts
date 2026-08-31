import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const POSITIVE: { word: string; meaning: string }[] = [
  { word: "schwimmen", meaning: "to swim" },
  { word: "lesen", meaning: "to read" },
  { word: "Fußball spielen", meaning: "to play football" },
  { word: "Musik hören", meaning: "to listen to music" },
  { word: "spazieren gehen", meaning: "to go for a walk" },
  { word: "tanzen", meaning: "to dance" },
  { word: "malen", meaning: "to paint/draw" },
  { word: "ins Kino gehen", meaning: "to go to the cinema" },
];

const RISKY: { word: string; meaning: string }[] = [
  { word: "Alkohol trinken", meaning: "to drink alcohol" },
  { word: "rauchen", meaning: "to smoke" },
  { word: "mit Fremden mitgehen", meaning: "to go off with strangers" },
  { word: "ohne Erlaubnis spät draußen bleiben", meaning: "to stay out late without permission" },
  { word: "den ganzen Tag Videospiele spielen", meaning: "to play video games all day" },
  { word: "gefährlich Motorrad fahren", meaning: "to ride a motorbike dangerously" },
];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Am ", after: " gehe ich schwimmen.", answer: "Wochenende", gloss: "Am Wochenende gehe ich schwimmen. — On the weekend I go swimming." },
  { before: "In den ", after: " reisen wir nach Mombasa.", answer: "Ferien", gloss: "In den Ferien reisen wir nach Mombasa. — During the holidays we travel to Mombasa." },
  { before: "Ich schreibe: Ich schwimme sehr ", after: ".", answer: "gern", gloss: "Ich schwimme sehr gern. — I really like swimming." },
  { before: "Ich spiele Fußball ", after: " als ich lese.", answer: "lieber", gloss: "Ich spiele Fußball lieber als ich lese. — I prefer playing football to reading." },
  { before: "Von allen Aktivitäten tanze ich ", after: ".", answer: "am liebsten", gloss: "Von allen Aktivitäten tanze ich am liebsten. — Of all activities, I like dancing best." },
  { before: "Am Wochenende gehe ich gern ", after: ".", answer: "spazieren", gloss: "Am Wochenende gehe ich gern spazieren. — On the weekend I like going for a walk." },
  { before: "In meinem Text steht: Man sollte keinen ", after: " trinken.", answer: "Alkohol", gloss: "Man sollte keinen Alkohol trinken. — One shouldn't drink alcohol." },
  { before: "Man sollte nicht mit ", after: " mitgehen.", answer: "Fremden", gloss: "Man sollte nicht mit Fremden mitgehen. — One shouldn't go off with strangers." },
  { before: "Ich gehe am liebsten ins ", after: ".", answer: "Kino", gloss: "Ich gehe am liebsten ins Kino. — I like going to the cinema best." },
  { before: "Am Samstag male ich ", after: ".", answer: "gern", gloss: "Am Samstag male ich gern. — On Saturday I like painting." },
  { before: "Es ist wichtig, sichere Aktivitäten zu ", after: ".", answer: "wählen", gloss: "Es ist wichtig, sichere Aktivitäten zu wählen. — It's important to choose safe activities." },
  { before: "Meine Freunde und ich ", after: " am Wochenende Musik.", answer: "hören", gloss: "Meine Freunde und ich hören am Wochenende Musik. — My friends and I listen to music on the weekend." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Ich gehe", "gern", "schwimmen", "."], sentence: "Ich gehe gern schwimmen." },
  { chunks: ["In den Ferien", "reise ich", "gern", "."], sentence: "In den Ferien reise ich gern." },
  { chunks: ["Am liebsten", "höre ich", "Musik", "."], sentence: "Am liebsten höre ich Musik." },
  { chunks: ["Man sollte", "keinen Alkohol", "trinken", "."], sentence: "Man sollte keinen Alkohol trinken." },
];

function paragraphScenario(rng: () => number) {
  const risky = randChoice(rng, RISKY);
  const safe = randChoice(rng, POSITIVE);
  const correct = `Ich sage 'Nein danke' und schlage stattdessen ${safe.word} vor.`;
  const choices = shuffle(rng, [
    correct,
    `Ich schreibe, dass ich gern ${risky.word}.`,
    "Ich schreibe nichts über das Wochenende.",
    "Ich schreibe, dass meine Freunde immer recht haben.",
  ]);

  return {
    kind: "multiple-choice" as const,
    prompt: `Du schreibst einen kurzen Absatz über dein Wochenende. Deine Freunde wollten ${risky.word}. Welcher Satz beschreibt die verantwortungsvolle Entscheidung, die du triffst?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "A responsible written account both declines the risky activity and names a safer one.",
    explanation: `Writing "${correct}" both refuses the risky activity and models a safe alternative — the other sentences either accept the risk, avoid the topic, or excuse it.`,
  };
}

export const funWriting: Skill = {
  id: "g7-de-w-fun",
  code: "W.5",
  subjectId: "german",
  strandId: "g7-de-writing",
  grade: 7,
  title: "Fun and enjoyment: weekends and holidays",
  description: "Guided writing about leisure activities and preferences, and describing safe choices around risky peer pressure.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "paragraph"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, POSITIVE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.word })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.word] = a.word;

      return {
        kind: "click-match",
        prompt: "Match each written German leisure activity to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "These are activities a learner might describe in a weekend diary entry.",
        explanation: chosen.map((a) => `"${a.word}" means "${a.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const positive = shuffle(rng, POSITIVE).slice(0, 4);
      const risky = shuffle(rng, RISKY).slice(0, 4);
      const items = shuffle(rng, [...positive, ...risky]);
      const correctBucket: Record<string, string> = {};
      for (const a of positive) correctBucket[a.word] = "recommended";
      for (const a of risky) correctBucket[a.word] = "avoid";

      return {
        kind: "categorize",
        prompt: "Sort each written weekend activity as Recommended or One to Avoid.",
        items: items.map((a) => ({ id: a.word, label: a.word })),
        buckets: [
          { id: "recommended", label: "Recommended" },
          { id: "avoid", label: "One to Avoid" },
        ],
        correctBucket,
        hint: "Activities involving alcohol, smoking, strangers, or unsafe behaviour should be avoided.",
        explanation: [...positive, ...risky]
          .map((a) => `"${a.word}" is ${correctBucket[a.word] === "recommended" ? "recommended" : "one to avoid"}.`)
          .join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written German sentence about weekend or holiday activities.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about leisure activity vocabulary, or the gern/lieber/am liebsten preference pattern.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct German sentence about leisure time.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Am liebsten' (most of all) often opens the sentence, pushing the verb to second position.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return paragraphScenario(rng);
  },
};
