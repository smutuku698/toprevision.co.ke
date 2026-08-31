import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { umlautAccepted } from "../german/germanUtils";

const PLACES: { word: string; meaning: string; gender: "masculine" | "feminine" | "neuter" }[] = [
  { word: "der Supermarkt", meaning: "the supermarket", gender: "masculine" },
  { word: "der Markt", meaning: "the market", gender: "masculine" },
  { word: "die Bibliothek", meaning: "the library", gender: "feminine" },
  { word: "die Schule", meaning: "the school", gender: "feminine" },
  { word: "das Krankenhaus", meaning: "the hospital", gender: "neuter" },
  { word: "die Kirche", meaning: "the church", gender: "feminine" },
  { word: "das Rathaus", meaning: "the town hall", gender: "neuter" },
  { word: "der Park", meaning: "the park", gender: "masculine" },
  { word: "die Bank", meaning: "the bank", gender: "feminine" },
  { word: "die Post", meaning: "the post office", gender: "feminine" },
];

const ZU_SENTENCES: { sentence: string; bucket: "zum" | "zur" }[] = [
  { sentence: "Ich gehe zum Supermarkt.", bucket: "zum" },
  { sentence: "Ich gehe zum Markt.", bucket: "zum" },
  { sentence: "Ich gehe zur Bibliothek.", bucket: "zur" },
  { sentence: "Ich gehe zur Schule.", bucket: "zur" },
  { sentence: "Ich gehe zum Krankenhaus.", bucket: "zum" },
  { sentence: "Ich gehe zur Kirche.", bucket: "zur" },
  { sentence: "Ich gehe zum Rathaus.", bucket: "zum" },
  { sentence: "Ich gehe zum Park.", bucket: "zum" },
  { sentence: "Ich gehe zur Bank.", bucket: "zur" },
  { sentence: "Ich gehe zur Post.", bucket: "zur" },
];

const FILL_ITEMS: { before: string; after: string; answer: string }[] = [
  { before: "Ich gehe ", after: " Supermarkt.", answer: "zum" },
  { before: "Ich gehe ", after: " Bibliothek.", answer: "zur" },
  { before: "Ich gehe zum ", after: ".", answer: "Krankenhaus" },
  { before: "Ich gehe zur ", after: ".", answer: "Post" },
  { before: "", after: " gehen Sie?", answer: "Wohin" },
  { before: "Wohin ", after: " Sie?", answer: "gehen" },
];

const ORDER_SETS: { chunks: string[]; sentence: string }[] = [
  { chunks: ["Wohin", "gehen Sie", "?"], sentence: "Wohin gehen Sie?" },
  { chunks: ["Ich gehe", "zum Supermarkt", "."], sentence: "Ich gehe zum Supermarkt." },
  { chunks: ["Ich gehe", "zur Bibliothek", "."], sentence: "Ich gehe zur Bibliothek." },
  { chunks: ["Ich gehe", "zur Post", "."], sentence: "Ich gehe zur Post." },
];

export const townSpeaking: Skill = {
  id: "g8-de-ls-town",
  code: "LS.3",
  subjectId: "german",
  strandId: "g8-de-listening-speaking",
  grade: 8,
  title: "My town",
  description: "Say where you are going in German using places in town and the contracted dative 'zum'/'zur'.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "mc"] as const);

    if (branch === "categorize") {
      const zum = shuffle(rng, ZU_SENTENCES.filter((s) => s.bucket === "zum")).slice(0, 4);
      const zur = shuffle(rng, ZU_SENTENCES.filter((s) => s.bucket === "zur")).slice(0, 4);
      const items = shuffle(rng, [...zum, ...zur]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.sentence] = item.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each sentence by whether it uses 'zum' (zu dem) or 'zur' (zu der).",
        items: items.map((it) => ({ id: it.sentence, label: it.sentence })),
        buckets: [
          { id: "zum", label: "zum (zu dem)" },
          { id: "zur", label: "zur (zu der)" },
        ],
        correctBucket,
        hint: "'zum' pairs with masculine/neuter nouns; 'zur' pairs with feminine nouns.",
        explanation: `zum: ${zum.map((s) => s.sentence).join(" / ")}. zur: ${zur.map((s) => s.sentence).join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const item = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the German sentence about going somewhere in town.",
        before: item.before,
        after: item.after,
        correctAnswer: item.answer,
        acceptedAnswers: umlautAccepted(item.answer),
        inputMode: "text",
        hint: "'zum' (zu dem) pairs with masculine/neuter nouns; 'zur' (zu der) pairs with feminine nouns.",
        explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: "Arrange the words/phrases to form a correct German sentence about places in town.",
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "'Wohin gehen Sie?' asks where you are going; 'Ich gehe zum/zur ...' answers it.",
        explanation: `The correct sentence is: "${set.sentence}"`,
      };
    }

    if (branch === "mc") {
      const place = randChoice(rng, PLACES);
      const correctWord = place.gender === "feminine" ? "zur" : "zum";
      const choices = ["zum", "zur"];
      const genderLabel = place.gender === "feminine" ? "feminine" : place.gender === "neuter" ? "neuter" : "masculine";
      return {
        kind: "multiple-choice",
        prompt: `Welches Wort passt zu "${place.word}" (${genderLabel})?`,
        choices,
        correctIndex: choices.indexOf(correctWord),
        layout: "row",
        hint: "'zum' pairs with masculine/neuter nouns; 'zur' pairs with feminine nouns.",
        explanation: `"${place.word}" is ${genderLabel}, so it takes "${correctWord}": "Ich gehe ${correctWord} ${place.word.replace(/^(der|die|das) /, "")}."`,
      };
    }

    const chosen = shuffle(rng, PLACES).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.word] = p.word;

    return {
      kind: "click-match",
      prompt: "Match each German place name to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "Look for the article (der, die, das) to help identify the gender of the word.",
      explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
    };
  },
};
