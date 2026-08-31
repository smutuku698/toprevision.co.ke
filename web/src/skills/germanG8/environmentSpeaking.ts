import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const FORECAST_DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const OTHER_CONDITIONS = ["cloudy", "rainy", "stormy"] as const;

const WEATHER: { phrase: string; meaning: string }[] = [
  { phrase: "Die Sonne scheint.", meaning: "The sun is shining." },
  { phrase: "Es regnet.", meaning: "It is raining." },
  { phrase: "Es ist windig.", meaning: "It is windy." },
  { phrase: "Es ist heiß.", meaning: "It is hot." },
  { phrase: "Es ist kalt.", meaning: "It is cold." },
];

const FEATURES: { word: string; meaning: string }[] = [
  { word: "der Berg", meaning: "the mountain" },
  { word: "der Wald", meaning: "the forest" },
  { word: "der Fluss", meaning: "the river" },
  { word: "der See", meaning: "the lake" },
  { word: "das Meer", meaning: "the sea" },
  { word: "das Tal", meaning: "the valley" },
  { word: "die Wüste", meaning: "the desert" },
];

const FEATURE_SENTENCES: string[] = ["Der Berg ist hoch.", "Der Wald ist grün.", "Der Fluss ist hier.", "Der See ist da."];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Die Sonne ", after: ".", answer: "scheint" },
  { before: "Es ", after: ".", answer: "regnet" },
  { before: "Es ist ", after: ".", answer: "windig" },
  { before: "Der Berg ist ", after: ".", answer: "hoch" },
  { before: "Der Wald ist ", after: ".", answer: "grün" },
  { before: "Wenn es regnet, ", after: " ich zu Hause.", answer: "bleibe" },
  { before: "Wenn die Sonne scheint, gehe ich ", after: ".", answer: "schwimmen" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Die Sonne", "scheint", "."], sentence: "Die Sonne scheint." },
  { chunks: ["Wenn es regnet,", "bleibe ich", "zu Hause", "."], sentence: "Wenn es regnet, bleibe ich zu Hause." },
  { chunks: ["Wenn die Sonne scheint,", "gehe ich", "schwimmen", "."], sentence: "Wenn die Sonne scheint, gehe ich schwimmen." },
  { chunks: ["Der Berg", "ist", "hoch", "."], sentence: "Der Berg ist hoch." },
];

export const environmentSpeaking: Skill = {
  id: "g8-de-ls-environment",
  code: "LS.8",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "Weather and physical features",
  description: "Describe the weather and physical landscape features in German, and how weather affects activities.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc", "weather"] as const);

    if (branch === "weather") {
      const sunnyIdx = randInt(rng, 0, 4);
      const days = FORECAST_DAYS.map((label, i) => ({
        label,
        condition: i === sunnyIdx ? ("sunny" as const) : randChoice(rng, OTHER_CONDITIONS),
      }));
      const correctDay = FORECAST_DAYS[sunnyIdx];
      const distractors = FORECAST_DAYS.filter((d) => d !== correctDay);
      const choices = shuffle(rng, [correctDay, ...shuffle(rng, distractors).slice(0, 3)]);

      return {
        kind: "multiple-choice",
        prompt: "Schauen Sie auf die Wettervorhersage. An welchem Tag ist es sonnig?",
        visual: { type: "weather", days },
        choices,
        correctIndex: choices.indexOf(correctDay),
        layout: "row",
        hint: "'Sonnig' means sunny — look for the day with the sun icon in the forecast strip.",
        explanation: `${correctDay} is the only day shown as sunny on the forecast strip.`,
      };
    }

    if (branch === "categorize") {
      const weather = shuffle(rng, WEATHER).slice(0, 4).map((w) => w.phrase);
      const features = shuffle(rng, FEATURE_SENTENCES).slice(0, 3);
      const items = shuffle(rng, [...weather, ...features]);
      const correctBucket: Record<string, string> = {};
      for (const w of weather) correctBucket[w] = "weather";
      for (const f of features) correctBucket[f] = "feature";

      return {
        kind: "categorize",
        prompt: "Sort each sentence as describing Weather or a Physical feature.",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "weather", label: "Weather" },
          { id: "feature", label: "Physical feature" },
        ],
        correctBucket,
        hint: "Weather sentences start with 'Die Sonne' or 'Es'; physical-feature sentences name a landscape word like 'der Berg' or 'der Wald'.",
        explanation: `Weather: ${weather.join(" / ")}. Features: ${features.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence about weather or landscape.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about which weather condition or landscape description fits the sentence.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about weather or landscape.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Wenn'-clauses come first, followed by a comma and the main clause with the verb next.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const w = randChoice(rng, WEATHER);
      const distractors = shuffle(rng, WEATHER.filter((x) => x.phrase !== w.phrase)).slice(0, 3).map((x) => x.meaning);
      const choices = shuffle(rng, [w.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Was bedeutet "${w.phrase}" auf Englisch?`,
        choices,
        correctIndex: choices.indexOf(w.meaning),
        layout: "list",
        hint: "Think about which weather condition this German phrase describes.",
        explanation: `"${w.phrase}" means "${w.meaning}".`,
      };
    }

    const chosen = shuffle(rng, FEATURES).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((f) => ({ id: f.word, label: f.word })));
    const targets = shuffle(rng, chosen.map((f) => ({ id: f.word, label: f.meaning })));
    const correctMap: Record<string, string> = {};
    for (const f of chosen) correctMap[f.word] = f.word;

    return {
      kind: "click-match",
      prompt: "Match each German physical-feature word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Der See' is a lake, while 'das Meer' is the sea.",
      explanation: chosen.map((f) => `"${f.word}" means "${f.meaning}".`).join(" "),
    };
  },
};
