import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const DIRECTIONS: { word: string; meaning: string }[] = [
  { word: "nach rechts", meaning: "to the right" },
  { word: "nach links", meaning: "to the left" },
  { word: "geradeaus", meaning: "straight ahead" },
  { word: "an der Ecke", meaning: "at the corner" },
  { word: "die Ampel", meaning: "the traffic light" },
  { word: "die Kreuzung", meaning: "the intersection" },
  { word: "die Straße", meaning: "the street" },
];

const IMPERATIVES: { phrase: string; meaning: string }[] = [
  { phrase: "Gehen Sie geradeaus!", meaning: "Go straight ahead!" },
  { phrase: "Biegen Sie rechts ab!", meaning: "Turn right!" },
  { phrase: "Biegen Sie links ab!", meaning: "Turn left!" },
  { phrase: "Nehmen Sie die zweite Straße links!", meaning: "Take the second street on the left!" },
  { phrase: "Halten Sie an der Ampel!", meaning: "Stop at the traffic light!" },
];

const ASKING: string[] = ["Wie komme ich zum Bahnhof?", "Wo ist die Bibliothek?"];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Wie komme ich zum ", after: "?", answer: "Bahnhof" },
  { before: "Wo ist die ", after: "?", answer: "Bibliothek" },
  { before: "", after: " Sie geradeaus!", answer: "Gehen" },
  { before: "Biegen Sie ", after: " ab!", answer: "rechts" },
  { before: "Halten Sie an der ", after: "!", answer: "Ampel" },
  { before: "Nehmen Sie die zweite ", after: " links!", answer: "Straße" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wie komme ich", "zum Bahnhof", "?"], sentence: "Wie komme ich zum Bahnhof?" },
  { chunks: ["Biegen Sie", "rechts", "ab", "!"], sentence: "Biegen Sie rechts ab!" },
  { chunks: ["Halten Sie", "an der Ampel", "!"], sentence: "Halten Sie an der Ampel!" },
  { chunks: ["Nehmen Sie", "die zweite Straße", "links", "!"], sentence: "Nehmen Sie die zweite Straße links!" },
];

export const transportSpeaking: Skill = {
  id: "g8-de-ls-transport",
  code: "LS.9",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "Getting around",
  description: "Ask for and give formal imperative directions in German, and name direction and street vocabulary.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const asking = shuffle(rng, ASKING);
      const giving = shuffle(rng, IMPERATIVES).slice(0, 4).map((i) => i.phrase);
      const items = shuffle(rng, [...asking, ...giving]);
      const correctBucket: Record<string, string> = {};
      for (const s of asking) correctBucket[s] = "asking";
      for (const s of giving) correctBucket[s] = "giving";

      return {
        kind: "categorize",
        prompt: "Sort each expression as Asking for directions or Giving directions (imperative).",
        items: items.map((it) => ({ id: it, label: it })),
        buckets: [
          { id: "asking", label: "Asking for directions" },
          { id: "giving", label: "Giving directions" },
        ],
        correctBucket,
        hint: "Questions with 'Wie' or 'Wo' ask for directions; command verbs like 'Gehen Sie' or 'Biegen Sie' give directions.",
        explanation: `Asking: ${asking.join(" / ")}. Giving: ${giving.join(" / ")}.`,
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
        hint: "Think about the direction word, or the formal Sie-Form imperative; watch for separable verbs like 'abbiegen'.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
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
        hint: "Separable verbs like 'abbiegen' send their prefix ('ab') to the very end of the sentence.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const imp = randChoice(rng, IMPERATIVES);
      const distractors = shuffle(rng, IMPERATIVES.filter((i) => i.phrase !== imp.phrase)).slice(0, 3).map((i) => i.meaning);
      const choices = shuffle(rng, [imp.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Was bedeutet "${imp.phrase}" auf Englisch?`,
        choices,
        correctIndex: choices.indexOf(imp.meaning),
        layout: "list",
        hint: "Match the command verb (Gehen, Biegen ... ab, Nehmen, Halten) to its meaning.",
        explanation: `"${imp.phrase}" means "${imp.meaning}".`,
      };
    }

    const chosen = shuffle(rng, DIRECTIONS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((d) => ({ id: d.word, label: d.word })));
    const targets = shuffle(rng, chosen.map((d) => ({ id: d.word, label: d.meaning })));
    const correctMap: Record<string, string> = {};
    for (const d of chosen) correctMap[d.word] = d.word;

    return {
      kind: "click-match",
      prompt: "Match each German direction or street word to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'Die Ampel' is a traffic light, while 'die Kreuzung' is an intersection.",
      explanation: chosen.map((d) => `"${d.word}" means "${d.meaning}".`).join(" "),
    };
  },
};
