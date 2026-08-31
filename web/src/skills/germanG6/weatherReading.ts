import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { WEATHER_PLACES, WEATHER_VOCAB, name, umlautAccepted } from "./shared";

// Reading strand, Theme 8: Weather and Environment (weather conditions) — reading aloud short
// Kenya-localized weather texts, drawn from WEATHER_VOCAB and WEATHER_PLACES.

function twoNames(rng: RNG): [string, string] {
  const a = name(rng);
  let b = name(rng);
  while (b === a) b = name(rng);
  return [a, b];
}

const DIALOGUE_SKELETONS: ((a: string, b: string, w1: { place: string; weather: string }, w2: { place: string; weather: string }) => { lines: string[]; qa: { q: string; correct: string; distractors: string[]; explanation: string }[] })[] = [
  (a, b, w1, w2) => ({
    lines: [`${a}: Wie ist das Wetter heute?`, `${b}: ${w1.weather}.`, `${a}: Und wie ist das Wetter in ${w2.place}?`, `${b}: ${w2.weather}.`, `${a}: Das Wetter ist ganz anders in den zwei Städten!`, `${b}: Ja, Kenia hat viele verschiedene Klimazonen.`],
    qa: [
      { q: `What is the weather like in ${w1.place}, according to the passage?`, correct: w1.weather, distractors: [w2.weather, "Es schneit", "Der Text sagt es nicht"], explanation: `${b} says "${w1.weather}."` },
      { q: `What is the weather like in ${w2.place}?`, correct: w2.weather, distractors: [w1.weather, "Es schneit", "Der Text sagt es nicht"], explanation: `${b} says "${w2.weather}."` },
      { q: "What does the passage say about Kenya's weather overall?", correct: "It has many different climate zones", distractors: ["It is the same everywhere", "It never changes", "The passage does not say"], explanation: `${b} says "Kenia hat viele verschiedene Klimazonen."` },
    ],
  }),
  (a, b, w1, w2) => ({
    lines: [`${a}: Soll ich einen Regenschirm mitnehmen?`, `${b}: Ja, ${w1.weather.toLowerCase()}.`, `${a}: Und was ist mit ${w2.place}?`, `${b}: Dort ${w2.weather.toLowerCase()}, also keinen Regenschirm nötig.`, `${a}: Danke für die Information!`, `${b}: Kein Problem!`],
    qa: [
      { q: `Why should ${a} take an umbrella, according to the passage?`, correct: `Because ${w1.weather.toLowerCase()}`, distractors: [`Because ${w2.weather.toLowerCase()}`, "Because it is very sunny", "The passage does not say"], explanation: `${b} says "Ja, ${w1.weather.toLowerCase()}."` },
      { q: `Why doesn't ${a} need an umbrella in ${w2.place}?`, correct: `Because ${w2.weather.toLowerCase()}`, distractors: [`Because ${w1.weather.toLowerCase()}`, "Because it is very cold", "The passage does not say"], explanation: `${b} says "Dort ${w2.weather.toLowerCase()}, also keinen Regenschirm nötig."` },
      { q: "What does the passage suggest about weather across places?", correct: "It can be very different from place to place", distractors: ["It is always the same", "It only rains in Kenya", "The passage does not say"], explanation: `${b} describes different weather for two different places.` },
    ],
  }),
  (a, b, w1, w2) => ({
    lines: [`${a}: Ich komme aus ${w1.place}.`, `${b}: Wie ist das Wetter dort?`, `${a}: ${w1.weather}.`, `${b}: Interessant! Ich komme aus ${w2.place}.`, `${a}: Und wie ist das Wetter dort?`, `${b}: ${w2.weather}.`],
    qa: [
      { q: `Where does ${a} come from, according to the passage?`, correct: w1.place, distractors: [w2.place, "Nairobi", "The passage does not say"], explanation: `${a} says "Ich komme aus ${w1.place}."` },
      { q: `What is the weather like where ${a} comes from?`, correct: w1.weather, distractors: [w2.weather, "Es schneit", "The passage does not say"], explanation: `${a} says "${w1.weather}."` },
      { q: `Where does ${b} come from?`, correct: w2.place, distractors: [w1.place, "Mombasa", "The passage does not say"], explanation: `${b} says "Ich komme aus ${w2.place}."` },
    ],
  }),
  (a, b, w1, w2) => ({
    lines: [`${a}: Was ziehst du heute an?`, `${b}: ${w1.weather}, also ziehe ich eine Jacke an.`, `${a}: In ${w2.place} ${w2.weather.toLowerCase()}, also brauche ich keine Jacke.`, `${b}: Das Wetter bestimmt wirklich, was wir tragen!`, `${a}: Genau, wir müssen das Wetter immer prüfen.`, `${b}: Stimmt!`],
    qa: [
      { q: `Why does ${b} wear a jacket, according to the passage?`, correct: `Because ${w1.weather.toLowerCase()}`, distractors: [`Because ${w2.weather.toLowerCase()}`, "Because it is a school rule", "The passage does not say"], explanation: `${b} says "${w1.weather}, also ziehe ich eine Jacke an."` },
      { q: `Why doesn't ${a} need a jacket in ${w2.place}?`, correct: `Because ${w2.weather.toLowerCase()}`, distractors: [`Because ${w1.weather.toLowerCase()}`, "Because it is raining hard", "The passage does not say"], explanation: `${a} says "${w2.weather.toLowerCase()}, also brauche ich keine Jacke."` },
      { q: "What does the passage say weather determines?", correct: "What people wear", distractors: ["What people eat", "What time school starts", "The passage does not say"], explanation: `${b} says "Das Wetter bestimmt wirklich, was wir tragen!"` },
    ],
  }),
  (a, b, w1, w2) => ({
    lines: [`${a}: Wie ist das Wetter in ${w1.place} normalerweise?`, `${b}: ${w1.weather}. Es ist dort meistens so.`, `${a}: Und in ${w2.place}?`, `${b}: ${w2.weather}. Ganz anders!`, `${a}: Danke, das hilft mir bei meiner Reiseplanung.`, `${b}: Gute Reise!`],
    qa: [
      { q: `What is the weather usually like in ${w1.place}, according to the passage?`, correct: w1.weather, distractors: [w2.weather, "Es schneit meistens", "The passage does not say"], explanation: `${b} says "${w1.weather}. Es ist dort meistens so."` },
      { q: `How does the weather in ${w2.place} compare, according to ${b}?`, correct: "It is quite different", distractors: ["It is exactly the same", "It is colder everywhere", "The passage does not say"], explanation: `${b} says "${w2.weather}. Ganz anders!"` },
      { q: `Why does ${a} ask about the weather?`, correct: "To help plan a trip", distractors: ["To choose what to eat", "To pick a school subject", "The passage does not say"], explanation: `${a} says "das hilft mir bei meiner Reiseplanung."` },
    ],
  }),
];

const MATCH_POOL = WEATHER_VOCAB;

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "In a reading text, 'it is shining/sunny' is written as ", after: ".", correct: "Es scheint" },
  { before: "'It is raining' appears in reading texts as ", after: ".", correct: "Es regnet" },
  { before: "The phrase for 'it is warm' when reading aloud is ", after: ".", correct: "Es ist warm" },
  { before: "'It is cold' reads as ", after: " in a weather passage.", correct: "Es ist kalt" },
  { before: "'It is windy' is written as ", after: " in the passage.", correct: "Es ist windig" },
  { before: "'It is cloudy' reads as ", after: " in a weather text.", correct: "Es ist wolkig" },
  { before: "The reading phrase for 'it is hot' is ", after: ".", correct: "Es ist heiß" },
  { before: "'It is dry' appears as ", after: " in the passage.", correct: "Es ist trocken" },
  { before: "'It is foggy' reads as ", after: " in a weather passage.", correct: "Es ist neblig" },
  { before: "'It is thundering' is written as ", after: " in the reading text.", correct: "Es donnert" },
];

const MATCH_OPENERS = [
  "Match each weather phrase from the passage to its meaning.",
  "Which meaning goes with which German weather phrase?",
  "Pair each weather term with its correct English meaning.",
  "Match the German phrase to what it means.",
  "Connect each weather phrase from the reading to its meaning.",
];
const MATCH_CLOSERS = [
  "",
  " Use the passage above as your guide.",
  " Think about which condition each phrase describes.",
  " Reread the passage carefully before you answer.",
];

const FILL_OPENERS = [
  "Fill in the missing weather phrase.",
  "Complete the sentence with the correct German phrase.",
  "What phrase completes this sentence about weather?",
  "Fill the gap correctly.",
  "Complete this reading fact about weather conditions.",
];
const FILL_CLOSERS = [
  "",
  " Read it aloud once you finish.",
  " Think about the weather passage above.",
  " Check your spelling carefully.",
];

const ORDER_OPENERS = [
  "Put these lines from the passage in the order they were read.",
  "Arrange the passage's lines in the correct reading order.",
  "Sequence this conversation about weather correctly.",
  "Order the lines as they appear in the passage.",
  "Which order makes this reading passage make sense?",
];
const ORDER_CLOSERS = [
  "",
  " Read each line carefully first.",
  " Think about how the conversation naturally flows.",
  " One place's weather is usually described before the next.",
];

const CATEGORIZE_OPENERS = [
  "As you read, sort each phrase: Sunny/warm, or Wet/cold/stormy?",
  "Group these weather phrases by what kind of condition they describe.",
  "Sort each phrase into the category it belongs to.",
  "Classify each weather phrase from the reading text.",
  "Which category best fits each weather phrase?",
];
const CATEGORIZE_CLOSERS = [
  "",
  " Think about whether the condition feels warm/dry or wet/cold.",
  " Reread the passage above if you need a reminder.",
  " Sunshine and heat are one category; rain, cold, and storms are another.",
];

const WARM_WORDS = ["Es scheint", "Es ist warm", "Es ist heiß", "Es ist trocken"];

export const weatherReading: Skill = {
  id: "g6-de-r-weather",
  code: "R.8",
  subjectId: "german",
  strandId: "g6-de-reading",
  grade: 6,
  title: "Reading aloud: weather and environment",
  description: "Read short, Kenya-localized German passages about weather conditions aloud, recognise weather vocabulary, and answer comprehension questions about the passage.",
  generate(rng) {
    const branch = randChoice(rng, ["comprehension", "match", "fill", "ordering", "categorize"] as const);
    const [a, b] = twoNames(rng);
    const w1 = randChoice(rng, WEATHER_PLACES);
    let w2 = randChoice(rng, WEATHER_PLACES);
    while (w2.place === w1.place) w2 = randChoice(rng, WEATHER_PLACES);
    const skeleton = randChoice(rng, DIALOGUE_SKELETONS)(a, b, w1, w2);
    const passage = skeleton.lines.join("\n");

    if (branch === "match") {
      const chosen = shuffle(rng, MATCH_POOL).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;
      return {
        kind: "click-match",
        passage,
        prompt: `${randChoice(rng, MATCH_OPENERS)}${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Reread the passage above — each phrase appears in context there.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        passage,
        prompt: `${randChoice(rng, FILL_OPENERS)}${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Use the passage above as a reminder of how each phrase is used.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "ordering") {
      const withIds = skeleton.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)}${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "The passage compares the weather in two places, one after the other.",
        explanation: `The correct order is:\n${skeleton.lines.join("\n")}`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, WEATHER_VOCAB).slice(0, 6);
      const bucketOf = (w: string) => (WARM_WORDS.includes(w) ? "Sunny/warm condition" : "Wet/cold/stormy condition");
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = bucketOf(c.word)));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)}${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Sunny/warm condition", label: "Sunny/warm condition" },
          { id: "Wet/cold/stormy condition", label: "Wet/cold/stormy condition" },
        ],
        correctBucket,
        hint: "Sunshine, warmth, heat, and dryness are one group; rain, cold, wind, clouds, fog, and thunder are the other.",
        explanation: chosen.map((c) => `"${c.word}" is a ${bucketOf(c.word).toLowerCase()}.`).join(" "),
      };
    }

    const qa = randChoice(rng, skeleton.qa);
    const choices = shuffle(rng, Array.from(new Set([qa.correct, ...qa.distractors])));
    return {
      kind: "multiple-choice",
      passage,
      prompt: qa.q,
      choices,
      correctIndex: choices.indexOf(qa.correct),
      layout: "list",
      hint: "Reread the passage above carefully before answering.",
      explanation: qa.explanation,
    };
  },
};
