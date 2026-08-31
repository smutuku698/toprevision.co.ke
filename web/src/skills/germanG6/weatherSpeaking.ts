import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { WEATHER_VOCAB, name, umlautAccepted } from "./shared";

// LS.8 Weather and Environment (weather conditions) — oral weather vocabulary practised through
// matching, sorting, fill-in, an ordered forecast dialogue, situational reasoning, and a dedicated
// Kenya-localized place+weather drill ("Es ist warm in Kisumu"; "Es ist kalt in Nyeri").

const MATCH_OPENERS = ["Match each German phrase", "Pair every weather phrase", "Connect each vocabulary item", "Link each phrase below", "Match the German term", "Join each weather phrase"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each phrase", "Group these German phrases", "Classify each weather word", "Decide where each phrase belongs", "Organise the phrases below", "Put each phrase"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German word", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the forecast chat", "Order the sentences", "Sequence this weather chat", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally be said.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person describing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being said here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on here?",
  "Work out the purpose of what was said.",
];

const PLACE_WEATHER_OPENERS = ["Match each Kenyan town", "Pair every town", "Connect each place", "Link each town below", "Match the town", "Join each place"];
const PLACE_WEATHER_CLOSERS = ["to the weather word that fits it.", "with its typical weather word.", "to its matching weather condition.", "to the correct weather description.", "to the right weather word."];

type Bucket = "Sky condition" | "Precipitation or wind" | "Temperature";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "Es scheint", bucket: "Sky condition" },
  { word: "Es ist wolkig", bucket: "Sky condition" },
  { word: "Es ist neblig", bucket: "Sky condition" },
  { word: "Es donnert", bucket: "Sky condition" },
  { word: "Es regnet", bucket: "Precipitation or wind" },
  { word: "Es ist windig", bucket: "Precipitation or wind" },
  { word: "Es ist trocken", bucket: "Precipitation or wind" },
  { word: "Es ist warm", bucket: "Temperature" },
  { word: "Es ist kalt", bucket: "Temperature" },
  { word: "Es ist heiß", bucket: "Temperature" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'It is shining/sunny' in German is ", after: ".", correct: "Es scheint" },
  { before: "'It is raining' in German is ", after: ".", correct: "Es regnet" },
  { before: "'It is warm' in German is ", after: ".", correct: "Es ist warm" },
  { before: "'It is cold' in German is ", after: ".", correct: "Es ist kalt" },
  { before: "'It is windy' in German is ", after: ".", correct: "Es ist windig" },
  { before: "'It is cloudy' in German is ", after: ".", correct: "Es ist wolkig" },
  { before: "'It is hot' in German is ", after: ".", correct: "Es ist heiß" },
  { before: "'It is dry' in German is ", after: ".", correct: "Es ist trocken" },
  { before: "'It is foggy' in German is ", after: ".", correct: "Es ist neblig" },
  { before: "'It is thundering' in German is ", after: ".", correct: "Es donnert" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Wie ist das Wetter heute? (how is the weather today?)", "Es regnet. (it is raining)", "Und morgen? (and tomorrow?)", "Morgen scheint die Sonne. (tomorrow the sun will shine)"] },
  { lines: ["Ist es warm in Mombasa? (is it warm in Mombasa?)", "Ja, es ist sehr heiß. (yes, it is very hot)", "Und in Nyeri? (and in Nyeri?)", "In Nyeri ist es kalt. (in Nyeri it is cold)"] },
  { lines: ["Der Himmel ist wolkig. (the sky is cloudy)", "Es donnert. (it is thundering)", "Es regnet gleich. (it will rain soon)", "Nimm einen Regenschirm mit! (take an umbrella!)"] },
  { lines: ["Am Morgen ist es neblig. (in the morning it is foggy)", "Am Mittag ist es warm. (at midday it is warm)", "Am Abend ist es windig. (in the evening it is windy)", "Die Nacht ist kalt. (the night is cold)"] },
  { lines: ["Es ist sehr trocken. (it is very dry)", "Wir brauchen Regen. (we need rain)", "Es ist windig heute. (it is windy today)", "Vielleicht regnet es bald. (maybe it will rain soon)"] },
];

const SCENARIO_TEMPLATES: ((n: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n) => ({
    prompt: `${n} looks outside and says "Es scheint." What is ${n} describing?`,
    correct: "sunny weather",
    distractors: ["rainy weather", "cold weather", "foggy weather"],
    explanation: `"Es scheint" means "it is shining/sunny" — a description of sunshine, not rain, cold, or fog.`,
  }),
  (n) => ({
    prompt: `${n} grabs an umbrella and says "Es regnet." What weather is ${n} responding to?`,
    correct: "rainy weather",
    distractors: ["sunny weather", "windy weather", "thundering weather"],
    explanation: `"Es regnet" means "it is raining" — the umbrella is a clue too, but the phrase itself names rain specifically.`,
  }),
  (n) => ({
    prompt: `${n} wears a heavy jacket and says "Es ist kalt." What is ${n} describing?`,
    correct: "cold weather",
    distractors: ["hot weather", "windy weather", "cloudy weather"],
    explanation: `"Es ist kalt" means "it is cold" — the opposite temperature word to "Es ist warm/heiß."`,
  }),
  (n) => ({
    prompt: `${n} says "Es ist heiß, ich brauche Wasser." What weather condition is causing this need?`,
    correct: "hot weather",
    distractors: ["cold weather", "rainy weather", "foggy weather"],
    explanation: `"Es ist heiß" means "it is hot" — hot weather naturally leads to needing water.`,
  }),
  (n) => ({
    prompt: `${n} hears a loud rumble in the sky and says "Es donnert." What is happening?`,
    correct: "thunder",
    distractors: ["rain", "wind", "sunshine"],
    explanation: `"Es donnert" means "it is thundering" — describing the sound, not rain or wind directly.`,
  }),
  (n) => ({
    prompt: `${n} can barely see across the road and says "Es ist neblig." What is being described?`,
    correct: "fog",
    distractors: ["cloud cover only", "heavy rain", "strong wind"],
    explanation: `"Es ist neblig" means "it is foggy" — thick low mist that limits visibility, unlike ordinary clouds or rain.`,
  }),
  (n) => ({
    prompt: `${n} holds onto a hat as it nearly blows away and says "Es ist windig." What is ${n} describing?`,
    correct: "windy weather",
    distractors: ["hot weather", "dry weather", "cloudy weather"],
    explanation: `"Es ist windig" means "it is windy" — described by the hat almost blowing off.`,
  }),
  (n) => ({
    prompt: `${n} looks at cracked, dusty soil and says "Es ist trocken." What is ${n} describing?`,
    correct: "dry weather",
    distractors: ["rainy weather", "cold weather", "foggy weather"],
    explanation: `"Es ist trocken" means "it is dry" — matching cracked, dusty ground rather than wet soil.`,
  }),
  (n) => ({
    prompt: `${n} looks up and sees the sky full of grey clouds, saying "Es ist wolkig." What is being described?`,
    correct: "cloudy weather",
    distractors: ["sunny weather", "foggy weather", "thundering weather"],
    explanation: `"Es ist wolkig" means "it is cloudy" — a grey sky, not necessarily fog, thunder, or sunshine.`,
  }),
  (n) => ({
    prompt: `${n} says "Es ist warm, aber es regnet auch." What two things is ${n} describing at once?`,
    correct: "warm weather and rain happening together",
    distractors: ["cold weather and sunshine", "hot weather and fog", "windy weather and thunder"],
    explanation: `"Es ist warm, aber es regnet auch" means "it is warm, but it is also raining" — two conditions at the same time.`,
  }),
];

const PLACE_WEATHER: { place: string; condition: string; meaning: string }[] = [
  { place: "Kisumu", condition: "warm", meaning: "warm" },
  { place: "Nyeri", condition: "kalt", meaning: "cold" },
  { place: "Mombasa", condition: "heiß", meaning: "hot" },
  { place: "Eldoret", condition: "wolkig", meaning: "cloudy" },
  { place: "Nairobi", condition: "wolkig", meaning: "cloudy" },
  { place: "Malindi", condition: "heiß", meaning: "hot" },
  { place: "Nakuru", condition: "windig", meaning: "windy" },
];

export const weatherSpeaking: Skill = {
  id: "g6-de-ls-weather",
  code: "LS.8",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "Weather and Environment",
  description: "Speak and recognise German weather vocabulary — matching, sorting, fill-in, an ordered forecast dialogue, reasoning about weather descriptions, and a dedicated Kenya-localized place+weather drill (Es ist warm in Kisumu; Es ist kalt in Nyeri).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "placeWeather"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WEATHER_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => (correctMap[`${i}-${v.word}`] = `${i}-${v.word}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "German weather phrases usually start with 'Es' (it), like English 'it is ...'.",
        explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Sky condition", label: "Sky condition" },
          { id: "Precipitation or wind", label: "Precipitation or wind" },
          { id: "Temperature", label: "Temperature" },
        ],
        correctBucket,
        hint: "Sky conditions describe what you see above; temperature words describe how it feels.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.bucket.toLowerCase()} phrase.`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Most weather phrases start with 'Es'.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "A question about weather usually comes before the answer describing it.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Match the weather phrase to the actual condition it names.",
        explanation: q.explanation,
      };
    }

    const chosen = shuffle(rng, PLACE_WEATHER).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.place}`, label: v.place })));
    const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.place}`, label: v.condition })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((v, i) => (correctMap[`${i}-${v.place}`] = `${i}-${v.place}`));
    return {
      kind: "click-match",
      prompt: `${randChoice(rng, PLACE_WEATHER_OPENERS)} ${randChoice(rng, PLACE_WEATHER_CLOSERS)}`,
      tokens,
      targets,
      correctMap,
      hint: "Say the full sentence in your head: 'Es ist [word] in [town].'",
      explanation: chosen.map((v) => `"Es ist ${v.condition} in ${v.place}" — it is ${v.meaning} in ${v.place}.`).join(" "),
    };
  },
};
