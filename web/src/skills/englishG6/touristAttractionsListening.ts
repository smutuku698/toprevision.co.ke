import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedA";

// Theme 5 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Our Tourist Attractions).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "big five", meaning: "lion, elephant, buffalo, leopard and rhino — Kenya's most famous wild animals" },
  { word: "museum", meaning: "a building where historical or cultural objects are displayed" },
  { word: "attract", meaning: "to draw visitors or attention" },
  { word: "tour", meaning: "a trip to visit places of interest" },
  { word: "park", meaning: "a protected area of land for wildlife" },
  { word: "warden", meaning: "a person who protects and manages a park" },
  { word: "game park", meaning: "an area set aside for wild animals" },
  { word: "wonder", meaning: "something that causes amazement" },
  { word: "seven wonders of the world", meaning: "seven famous, remarkable places or structures" },
  { word: "poach", meaning: "to illegally hunt or capture wildlife" },
  { word: "protect", meaning: "to keep safe from harm" },
  { word: "national park", meaning: "a large protected natural area managed by the state" },
  { word: "game reserve", meaning: "a protected area for wildlife, often community or privately managed" },
  { word: "beauty", meaning: "a quality that is pleasing to see" },
  { word: "beach", meaning: "a sandy or stony shore by the sea" },
  { word: "holiday", meaning: "a period of rest or travel away from routine" },
  { word: "tourist", meaning: "a person who travels for pleasure" },
  { word: "tour guide", meaning: "a person who shows tourists around a place" },
  { word: "hotel", meaning: "a building offering rooms and meals to travellers" },
  { word: "nature walk", meaning: "a walk taken to observe plants and animals" },
  { word: "bird watching", meaning: "the hobby of observing wild birds" },
  { word: "snake park", meaning: "a place where different snake species are kept and displayed" },
  { word: "mountain climbing", meaning: "the sport of climbing mountains" },
  { word: "foreign exchange", meaning: "money earned from tourists visiting from other countries" },
  { word: "game keeper", meaning: "a person who looks after game animals in a reserve" },
  { word: "sun bathe", meaning: "to lie in the sun to get a tan" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "make friends", type: "fixed phrase", meaning: "to become friendly with someone" },
  { text: "be careful", type: "fixed phrase", meaning: "to pay close attention to avoid danger" },
  { text: "fall asleep", type: "fixed phrase", meaning: "to begin sleeping" },
  { text: "in future", type: "fixed phrase", meaning: "at a later time" },
  { text: "in a hurry", type: "fixed phrase", meaning: "needing to do something quickly" },
  { text: "as brave as a lion", type: "simile", meaning: "extremely brave" },
  { text: "as blind as a bat", type: "simile", meaning: "unable to see well at all" },
  { text: "She is a lion. She is so brave", type: "metaphor", meaning: "calling someone a lion to show they are very brave" },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens" },
  { text: "seeing is believing", type: "proverb", meaning: "you only truly believe something once you see it" },
  { text: "the early bird catches the worm", type: "proverb", meaning: "those who act early gain an advantage" },
  { text: "sick as a dog", type: "idiom", meaning: "very ill" },
  { text: "you are what you eat", type: "idiom", meaning: "your health depends on what you eat" },
  { text: "kick the habit", type: "idiom", meaning: "to stop doing something unhealthy" },
  { text: "let the cat out of the bag", type: "idiom", meaning: "to reveal a secret by accident" },
  { text: "would not hurt a fly", type: "idiom", meaning: "gentle and harmless" },
  { text: "go away", type: "phrasal verb", meaning: "to leave a place" },
  { text: "go back", type: "phrasal verb", meaning: "to return to a place" },
  { text: "pick up", type: "phrasal verb", meaning: "to lift something, or to collect someone" },
  { text: "get away", type: "phrasal verb", meaning: "to escape from somewhere" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.5");

const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "be careful", type: "fixed phrase", meaning: "to pay close attention to avoid danger", before: "The warden warned tourists to ", after: " when walking near the buffalo herd." },
  { text: "in a hurry", type: "fixed phrase", meaning: "needing to do something quickly", before: "The tour guide said there was no need to be ", after: " during the game drive." },
  { text: "make friends", type: "fixed phrase", meaning: "to become friendly with someone", before: "During the tour, visitors from different countries began to ", after: "." },
  { text: "in future", type: "fixed phrase", meaning: "at a later time", before: "The park management promised to build a new museum ", after: "." },
  { text: "fall asleep", type: "fixed phrase", meaning: "to begin sleeping", before: "After a long day of bird watching, the tired hikers began to ", after: " by the campfire." },
  { text: "as brave as a lion", type: "simile", meaning: "extremely brave", before: "The game keeper who chased off the poachers alone was ", after: "." },
  { text: "as blind as a bat", type: "simile", meaning: "unable to see well at all", before: "Without his glasses, the elderly tourist felt ", after: " on the nature walk." },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens", before: "Protecting the game reserve from poachers early proves that \"", after: "\"." },
  { text: "seeing is believing", type: "proverb", meaning: "you only truly believe something once you see it", before: "The tourist could not believe the beauty of the mountain until she saw it — \"", after: "\"." },
  { text: "the early bird catches the worm", type: "proverb", meaning: "those who act early gain an advantage", before: "Visitors who arrived at dawn saw the most animals, proving \"", after: "\"." },
  { text: "let the cat out of the bag", type: "idiom", meaning: "to reveal a secret by accident", before: "The guide accidentally told the group the surprise sighting, and \"", after: "\" too soon." },
  { text: "would not hurt a fly", type: "idiom", meaning: "gentle and harmless", before: "Despite its size, the old elephant near the lodge ", after: "." },
  { text: "get away", type: "phrasal verb", meaning: "to escape from somewhere", before: "The antelope managed to ", after: " from the lion just in time." },
  { text: "go back", type: "phrasal verb", meaning: "to return to a place", before: "Tourists who love the beach often ", after: " to Malindi every year." },
  { text: "pick up", type: "phrasal verb", meaning: "to lift something, or to collect someone", before: "The tour guide will ", after: " visitors from the hotel at dawn." },
];

export const touristAttractionsListening: Skill = {
  id: "g6-eng-ls-tourist-attractions",
  code: "LS.5",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Our Tourist Attractions — Listening",
  description: "Identify words with the sounds /ð/ and /θ/, use tourism vocabulary correctly, and use similes, a metaphor, proverbs, idioms and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "vocab-click-match", "vocab-categorize", "fill-blank", "expression-meaning-mc"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same sound as in "${target.sound === "/ð/" ? "this" : "think"}" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word aloud and listen for the ${target.sound} sound.`,
        explanation: `"${target.word}" contains the sound ${target.sound}.`,
      };
    }

    if (branch === "vocab-meaning-mc") {
      const item = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
      return {
        kind: "multiple-choice",
        prompt: `What does the term "${item.word}" mean?`,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Think about wildlife, parks and travel in Kenya.",
        explanation: `"${item.word}" means: ${item.meaning}.`,
      };
    }

    if (branch === "vocab-scenario-mc") {
      const item = randChoice(rng, VOCAB);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors.map((d) => d.word)]);
      return {
        kind: "multiple-choice",
        prompt: `${name}'s tour guide near ${place} explains: "${item.meaning}." Which term matches?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact vocabulary word.",
        explanation: `The term is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "vocab-click-match") {
      const pool = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of pool) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each tourism vocabulary word to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some words describe people, others describe places or activities.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const peopleWords = ["warden", "tourist", "tour guide", "game keeper"];
      const placeWords = ["museum", "park", "game park", "national park", "game reserve", "beach", "hotel", "snake park"];
      const pool = shuffle(rng, [
        ...peopleWords.map((w) => ({ id: w, label: w, bucket: "person" })),
        ...placeWords.map((w) => ({ id: w, label: w, bucket: "place" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these tourism words: does it name a PERSON, or a PLACE?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "person", label: "Person" },
          { id: "place", label: "Place" },
        ],
        correctBucket,
        hint: "A person word names who does a job; a place word names somewhere you can visit.",
        explanation: "Person words: warden, tourist, tour guide, game keeper. Place words: museum, park, game park, national park, game reserve, beach, hotel, snake park.",
      };
    }

    if (branch === "fill-blank") {
      const t = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence using the expression "${t.text}".`,
        before: t.before,
        after: t.after,
        correctAnswer: t.text,
        inputMode: "text",
        hint: `This ${t.type} means: ${t.meaning}.`,
        explanation: `"${t.text}" (${t.type}) means ${t.meaning}.`,
      };
    }

    const item = randChoice(rng, EXPRESSIONS);
    const distractors = shuffle(rng, EXPRESSIONS.filter((e) => e.text !== item.text)).slice(0, 3);
    const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
    return {
      kind: "multiple-choice",
      prompt: `What does the expression "${item.text}" mean?`,
      choices,
      correctIndex: choices.indexOf(item.meaning),
      layout: "list",
      hint: `This is a${["a", "e", "i", "o", "u"].includes(item.type[0]) ? "n" : ""} ${item.type}.`,
      explanation: `"${item.text}" (${item.type}) means ${item.meaning}.`,
    };
  },
};
