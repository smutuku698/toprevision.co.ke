import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

type Tag = "place" | "direction";

const WORDS: { word: string; meaning: string; tag: Tag }[] = [
  { word: "die Schule", meaning: "the school", tag: "place" },
  { word: "der Park", meaning: "the park", tag: "place" },
  { word: "die Bäckerei", meaning: "the bakery", tag: "place" },
  { word: "die Apotheke", meaning: "the pharmacy", tag: "place" },
  { word: "die Kirche", meaning: "the church", tag: "place" },
  { word: "das Krankenhaus", meaning: "the hospital", tag: "place" },
  { word: "die Bibliothek", meaning: "the library", tag: "place" },
  { word: "das Geschäft", meaning: "the shop", tag: "place" },
  { word: "die Bank", meaning: "the bank", tag: "place" },
  { word: "der Busbahnhof", meaning: "the bus station", tag: "place" },
  { word: "das Postamt", meaning: "the post office", tag: "place" },
  { word: "der Spielplatz", meaning: "the playground", tag: "place" },
  { word: "links", meaning: "left", tag: "direction" },
  { word: "rechts", meaning: "right", tag: "direction" },
  { word: "geradeaus", meaning: "straight ahead", tag: "direction" },
  { word: "neben", meaning: "next to", tag: "direction" },
  { word: "gegenüber", meaning: "across from", tag: "direction" },
  { word: "zwischen", meaning: "between", tag: "direction" },
];

const PLACES = WORDS.filter((w) => w.tag === "place").map((w) => w.word);

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Wie komme ich zur ", after: "?", answer: "Schule", gloss: "Wie komme ich zur Schule? — How do I get to the school?" },
  { before: "Wo finde ich die ", after: "?", answer: "Bäckerei", gloss: "Wo finde ich die Bäckerei? — Where do I find the bakery?" },
  { before: "Geh nach ", after: "!", answer: "rechts", gloss: "Geh nach rechts! — Go to the right!" },
  { before: "Geh nach ", after: "!", answer: "links", gloss: "Geh nach links! — Go to the left!" },
  { before: "Geh ", after: "!", answer: "geradeaus", gloss: "Geh geradeaus! — Go straight ahead!" },
  { before: "Die Apotheke ist ", after: " der Bäckerei.", answer: "neben", gloss: "Die Apotheke ist neben der Bäckerei. — The pharmacy is next to the bakery." },
  { before: "Der Park ist ", after: " der Schule.", answer: "gegenüber", gloss: "Der Park ist gegenüber der Schule. — The park is across from the school." },
  { before: "Die Bank ist ", after: " der Kirche und dem Krankenhaus.", answer: "zwischen", gloss: "Die Bank ist zwischen der Kirche und dem Krankenhaus. — The bank is between the church and the hospital." },
  { before: "Ich gehe zum ", after: ", um einen Brief zu senden.", answer: "Postamt", gloss: "Ich gehe zum Postamt, um einen Brief zu senden. — I go to the post office to send a letter." },
  { before: "Die Kinder spielen auf dem ", after: ".", answer: "Spielplatz", gloss: "Die Kinder spielen auf dem Spielplatz. — The children play at the playground." },
  { before: "Ich warte am ", after: " auf den Bus.", answer: "Busbahnhof", gloss: "Ich warte am Busbahnhof auf den Bus. — I wait for the bus at the bus station." },
  { before: "Wo finde ich die ", after: "? Ich möchte ein Buch ausleihen.", answer: "Bibliothek", gloss: "Wo finde ich die Bibliothek? Ich möchte ein Buch ausleihen. — Where do I find the library? I'd like to borrow a book." },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie", "komme ich", "zur Schule", "?"], sentence: "Wie komme ich zur Schule?" },
  { chunks: ["Wo", "finde ich", "die Bäckerei", "?"], sentence: "Wo finde ich die Bäckerei?" },
  { chunks: ["Geh", "nach rechts", "!"], sentence: "Geh nach rechts!" },
  { chunks: ["Die Apotheke", "ist", "neben der Bäckerei", "."], sentence: "Die Apotheke ist neben der Bäckerei." },
  { chunks: ["Der Park", "ist", "gegenüber der Schule", "."], sentence: "Der Park ist gegenüber der Schule." },
];

function wayfindingScenario(rng: () => number) {
  const start = randChoice(rng, PLACES);
  let destination = randChoice(rng, PLACES);
  let guard = 0;
  while (destination === start && guard < 10) {
    destination = randChoice(rng, PLACES);
    guard++;
  }
  const direction = randChoice(rng, ["links", "rechts", "geradeaus"] as const);
  const prompts: Record<string, string> = {
    links: `Du bist bei ${start}. ${destination} ist links von ${start}. Wie kommst du zu ${destination}?`,
    rechts: `Du bist bei ${start}. ${destination} ist rechts von ${start}. Wie kommst du zu ${destination}?`,
    geradeaus: `Du bist bei ${start}. ${destination} liegt geradeaus, wenn du von ${start} losgehst. Wie kommst du zu ${destination}?`,
  };
  const correctByDirection: Record<string, string> = {
    links: "Geh nach links.",
    rechts: "Geh nach rechts.",
    geradeaus: "Geh geradeaus.",
  };
  const correct = correctByDirection[direction];
  const otherOptions = ["Geh nach links.", "Geh nach rechts.", "Geh geradeaus.", "Bleib hier stehen.", "Geh zurück."].filter(
    (o) => o !== correct,
  );
  const distractors = shuffle(rng, otherOptions).slice(0, 3);
  const choices = shuffle(rng, [correct, ...distractors]);

  return {
    kind: "multiple-choice" as const,
    prompt: prompts[direction],
    choices,
    correctIndex: choices.indexOf(correct),
    layout: "list" as const,
    hint: "Match the direction instruction to where the destination actually is.",
    explanation: `${destination} ist ${direction === "geradeaus" ? "geradeaus" : `nach ${direction}`} von ${start}, also lautet die richtige Anweisung: "${correct}"`,
  };
}

export const gettingAroundSpeaking: Skill = {
  id: "g7-de-ls-getting-around",
  code: "LS.9",
  subjectId: "german",
  strandId: "g7-de-listening-speaking",
  grade: 7,
  title: "Getting around: in the neighbourhood",
  description: "Ask for and give simple directions in German using prepositions of location and neighbourhood vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "wayfinding"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, WORDS.filter((w) => w.tag === "place")).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.word })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.word, label: w.meaning })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.word] = w.word;

      return {
        kind: "click-match",
        prompt: "Match each German neighbourhood place to its English meaning.",
        tokens,
        targets,
        correctMap,
        hint: "These are all places you might find around a neighbourhood.",
        explanation: chosen.map((w) => `"${w.word}" means "${w.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const places = shuffle(rng, WORDS.filter((w) => w.tag === "place")).slice(0, 4);
      const directions = shuffle(rng, WORDS.filter((w) => w.tag === "direction")).slice(0, 4);
      const items = shuffle(rng, [...places, ...directions]);
      const correctBucket: Record<string, string> = {};
      for (const w of items) correctBucket[w.word] = w.tag;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Place or a Direction word.",
        items: items.map((w) => ({ id: w.word, label: w.word })),
        buckets: [
          { id: "place", label: "Place" },
          { id: "direction", label: "Direction word" },
        ],
        correctBucket,
        hint: "Places are locations; direction words describe where something is or how to get there.",
        explanation: [...places, ...directions].map((w) => `"${w.word}" is a ${w.tag === "place" ? "place" : "direction word"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence about directions.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "Think about the neighbourhood place or direction word being described.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about directions.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Direction questions in German often start with 'Wie' or 'Wo'.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    return wayfindingScenario(rng);
  },
};
