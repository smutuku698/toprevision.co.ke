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
  { before: "Ich schwimme sehr ", after: ".", answer: "gern", gloss: "Ich schwimme sehr gern. — I really like swimming." },
  { before: "Ich spiele Fußball ", after: " als ich lese.", answer: "lieber", gloss: "Ich spiele Fußball lieber als ich lese. — I prefer playing football to reading." },
  { before: "Von allen Aktivitäten tanze ich ", after: ".", answer: "am liebsten", gloss: "Von allen Aktivitäten tanze ich am liebsten. — Of all activities, I like dancing best." },
  { before: "Am Wochenende gehe ich gern ", after: ".", answer: "spazieren", gloss: "Am Wochenende gehe ich gern spazieren. — On the weekend I like going for a walk." },
  { before: "Ich höre gern ", after: ".", answer: "Musik", gloss: "Ich höre gern Musik. — I like listening to music." },
  { before: "Man sollte keinen ", after: " trinken.", answer: "Alkohol", gloss: "Man sollte keinen Alkohol trinken. — One shouldn't drink alcohol." },
  { before: "Es ist wichtig, mit Erlaubnis nach Hause zu ", after: ".", answer: "kommen", gloss: "Es ist wichtig, mit Erlaubnis nach Hause zu kommen. — It's important to come home with permission." },
  { before: "Man sollte nicht mit ", after: " mitgehen.", answer: "Fremden", gloss: "Man sollte nicht mit Fremden mitgehen. — One shouldn't go off with strangers." },
  { before: "Ich gehe am liebsten ins ", after: ".", answer: "Kino", gloss: "Ich gehe am liebsten ins Kino. — I like going to the cinema best." },
  { before: "Am Samstag spiele ich gern ", after: ".", answer: "Fußball", gloss: "Am Samstag spiele ich gern Fußball. — On Saturday I like playing football." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Was", "machst du", "am Wochenende", "?"], sentence: "Was machst du am Wochenende?" },
  { chunks: ["Ich gehe", "gern", "schwimmen", "."], sentence: "Ich gehe gern schwimmen." },
  { chunks: ["In den Ferien", "reise ich", "gern", "."], sentence: "In den Ferien reise ich gern." },
  { chunks: ["Ich spiele", "lieber Fußball", "als ich lese", "."], sentence: "Ich spiele lieber Fußball als ich lese." },
  { chunks: ["Am liebsten", "höre ich", "Musik", "."], sentence: "Am liebsten höre ich Musik." },
  { chunks: ["Man sollte", "keinen Alkohol", "trinken", "."], sentence: "Man sollte keinen Alkohol trinken." },
];

function refusalScenario(rng: () => number) {
  const risky = randChoice(rng, RISKY);
  const safe = randChoice(rng, POSITIVE);
  const correct = `Nein danke, lass uns lieber ${safe.word} — das ist sicherer.`;
  const choices = shuffle(rng, [
    correct,
    `Ja, klar, lass uns ${risky.word}!`,
    "Ich sage nichts und mache einfach mit.",
    "Ich gehe einfach weg, ohne etwas zu sagen.",
  ]);

  return {
    kind: "multiple-choice" as const,
    prompt: `Deine Freunde wollen am Wochenende ${risky.word}. Was ist eine gute, sichere Antwort?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "A safe response both declines the risky activity and offers a positive alternative.",
    explanation: `Saying no clearly and suggesting a safer activity like "${safe.word}" is the responsible choice — agreeing, staying silent, or leaving without a word don't actually keep you safe.`,
  };
}

export const funSpeaking: Skill = {
  id: "g7-de-ls-fun",
  code: "LS.5",
  subjectId: "german",
  strandId: "g7-de-listening-speaking",
  grade: 7,
  title: "Fun and enjoyment: weekends and holidays",
  description: "Leisure activities and preference expressions (gern/lieber/am liebsten) in German, and choosing safe weekend activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "refusal"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, POSITIVE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.word })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.word, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.word] = a.word;

      return {
        kind: "click-match",
        prompt: "Match each German leisure activity to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "These are all activities you might do on a weekend or during holidays.",
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
        prompt: "Sort each weekend activity as Recommended or One to Avoid.",
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
        prompt: "Fill in the missing word to complete the German sentence about weekend or holiday activities.",
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
        prompt: "Arrange the words/phrases to form a correct German sentence about leisure time.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Am liebsten' (most of all) often comes at the start of the sentence, pushing the verb to second position.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return refusalScenario(rng);
  },
};
