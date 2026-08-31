import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

type Tag = "season" | "weather" | "clothing";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "der Frühling", meaning: "spring", tag: "season" },
  { word: "der Sommer", meaning: "summer", tag: "season" },
  { word: "der Herbst", meaning: "autumn", tag: "season" },
  { word: "der Winter", meaning: "winter", tag: "season" },
  { word: "Die Sonne scheint.", meaning: "The sun is shining.", tag: "weather" },
  { word: "Es regnet.", meaning: "It is raining.", tag: "weather" },
  { word: "Es ist windig.", meaning: "It is windy.", tag: "weather" },
  { word: "Es ist heiß.", meaning: "It is hot.", tag: "weather" },
  { word: "Es ist kalt.", meaning: "It is cold.", tag: "weather" },
  { word: "Es schneit.", meaning: "It is snowing.", tag: "weather" },
  { word: "die Jacke", meaning: "the jacket", tag: "clothing" },
  { word: "der Regenschirm", meaning: "the umbrella", tag: "clothing" },
  { word: "die Mütze", meaning: "the cap/hat", tag: "clothing" },
  { word: "der Pullover", meaning: "the sweater", tag: "clothing" },
  { word: "die Sonnenbrille", meaning: "the sunglasses", tag: "clothing" },
  { word: "die Sandalen", meaning: "the sandals", tag: "clothing" },
];

type Season = "der Frühling" | "der Sommer" | "der Herbst" | "der Winter";
const SEASON_CLOTHING: Record<Season, string[]> = {
  "der Frühling": ["die Jacke", "der Regenschirm"],
  "der Sommer": ["die Sonnenbrille", "die Sandalen"],
  "der Herbst": ["die Jacke", "der Regenschirm"],
  "der Winter": ["die Mütze", "der Pullover"],
};
const ALL_CLOTHING = ["die Jacke", "der Regenschirm", "die Mütze", "der Pullover", "die Sonnenbrille", "die Sandalen"];
const SEASONS: Season[] = ["der Frühling", "der Sommer", "der Herbst", "der Winter"];

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Ich schreibe: Im ", after: " ist es oft heiß und trocken.", answer: "Sommer", gloss: "Im Sommer ist es oft heiß und trocken. — In summer it is often hot and dry." },
  { before: "Ich schreibe: Im ", after: " wird es kalt, und die Blätter fallen.", answer: "Herbst", gloss: "Im Herbst wird es kalt, und die Blätter fallen. — In autumn it gets cold, and the leaves fall." },
  { before: "Ich schreibe: Im ", after: " schneit es oft in Deutschland.", answer: "Winter", gloss: "Im Winter schneit es oft in Deutschland. — In winter it often snows in Germany." },
  { before: "Ich schreibe: Im ", after: " werden die Tage wieder wärmer.", answer: "Frühling", gloss: "Im Frühling werden die Tage wieder wärmer. — In spring the days get warmer again." },
  { before: "In meinem Wetterbericht steht: Die Sonne ", after: ".", answer: "scheint", gloss: "Die Sonne scheint. — The sun is shining." },
  { before: "In meinem Wetterbericht steht: Es ", after: " draußen.", answer: "regnet", gloss: "Es regnet draußen. — It is raining outside." },
  { before: "Ich schreibe: Im Winter trage ich eine ", after: ".", answer: "Mütze", gloss: "Im Winter trage ich eine Mütze. — In winter I wear a cap." },
  { before: "Ich schreibe: Im Sommer trage ich eine ", after: ".", answer: "Sonnenbrille", gloss: "Im Sommer trage ich eine Sonnenbrille. — In summer I wear sunglasses." },
  { before: "Ich schreibe: Wenn es regnet, nehme ich einen ", after: " mit.", answer: "Regenschirm", gloss: "Wenn es regnet, nehme ich einen Regenschirm mit. — When it rains, I take an umbrella." },
  { before: "Ich schreibe: In Kenia gibt es keinen ", after: ".", answer: "Schnee", gloss: "In Kenia gibt es keinen Schnee. — In Kenya there is no snow." },
  { before: "Ich schreibe: Im Winter trage ich einen warmen ", after: ".", answer: "Pullover", gloss: "Im Winter trage ich einen warmen Pullover. — In winter I wear a warm sweater." },
  { before: "Ich schreibe: Im Sommer trage ich gern ", after: ".", answer: "Sandalen", gloss: "Im Sommer trage ich gern Sandalen. — In summer I like wearing sandals." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Im Sommer", "ist es", "heiß", "."], sentence: "Im Sommer ist es heiß." },
  { chunks: ["Im Winter", "trage ich", "eine Mütze", "."], sentence: "Im Winter trage ich eine Mütze." },
  { chunks: ["In Kenia", "gibt es", "keinen Schnee", "."], sentence: "In Kenia gibt es keinen Schnee." },
];

function chartCaptionScenario(rng: () => number) {
  const season = randChoice(rng, SEASONS);
  const correctItems = SEASON_CLOTHING[season];
  const correct = randChoice(rng, correctItems);
  const wrongPool = ALL_CLOTHING.filter((c) => !correctItems.includes(c));
  const distractors = shuffle(rng, wrongPool).slice(0, 3);
  const choices = shuffle(rng, [correct, ...distractors]);

  return {
    kind: "multiple-choice" as const,
    prompt: `Du erstellst ein Poster über ${season} in Deutschland. Welches Kleidungsstück solltest du in die Bildunterschrift schreiben?`,
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "Think about which clothing item actually fits that season's typical weather.",
    explanation: `${correct} passt zu ${season} — die anderen Kleidungsstücke passen besser zu einer anderen Jahreszeit.`,
  };
}

export const weatherWriting: Skill = {
  id: "g7-de-w-weather",
  code: "W.8",
  subjectId: "german",
  strandId: "g7-de-writing",
  grade: 7,
  title: "Weather, seasons, and clothing",
  description: "Guided writing about the four seasons, weather, and season-appropriate clothing in German, including Kenya/Germany comparisons.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "poster"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS.filter((w) => w.tag === "weather" || w.tag === "season")).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each written German weather or season word to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Season words name a time of year; weather words describe the sky or temperature.",
        explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const season = shuffle(rng, WORDS.filter((w) => w.tag === "season"));
      const clothing = shuffle(rng, WORDS.filter((w) => w.tag === "clothing")).slice(0, 4);
      const items = shuffle(rng, [...season, ...clothing]);
      const correctBucket: Record<string, string> = {};
      for (const w of items) correctBucket[w.word] = w.tag;

      return {
        kind: "categorize",
        prompt: "Sort each written word as a Season or a Clothing item.",
        items: items.map((w) => ({ id: w.word, label: w.word })),
        buckets: [
          { id: "season", label: "Season" },
          { id: "clothing", label: "Clothing item" },
        ],
        correctBucket,
        hint: "Seasons are times of year; clothing items are things you wear.",
        explanation: [...season, ...clothing].map((w) => `"${w.word}" is a ${w.tag === "season" ? "season" : "clothing item"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the written German sentence about weather, seasons, or clothing.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the season, weather condition, or clothing item being described.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to write a correct German sentence about weather or seasons.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "German sentences usually put the verb as the second element.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return chartCaptionScenario(rng);
  },
};
