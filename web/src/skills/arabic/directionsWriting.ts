import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "In'atif ", after: " 'inda al-masjid.", answer: "yameenan", gloss: "Turn right at the mosque." },
  { before: "", after: " mustaqeem thumma qif.", answer: "Idhhab", gloss: "Go straight then stop." },
  { before: "Al-maktaba ", after: " mubaasharatan.", answer: "amaamaka", gloss: "The library is directly ahead of you." },
  { before: "", after: " hunaaka, min fadlik.", answer: "Qif", gloss: "Stop there, please." },
];

const ORDER_PROMPTS = [
  "Arrange the words/phrases to form a correct Arabic sentence.",
  "Put these words and phrases in order to form a correct Arabic sentence.",
  "Rearrange the pieces below into a correct Arabic sentence.",
  "Order the words/phrases so they form a correct Arabic sentence.",
  "Click the pieces in the order that builds a correct Arabic sentence.",
  "Assemble these words/phrases into a correct Arabic sentence.",
];

const FILL_PROMPTS = [
  "Fill in the missing romanized word to complete the Arabic sentence.",
  "Complete the Arabic sentence by filling in the missing romanized word.",
  "Type the missing romanized word to finish the sentence correctly.",
  "Which romanized word completes this Arabic sentence? Fill it in.",
  "Fill in the blank with the correct romanized word.",
  "Supply the missing romanized word to complete the sentence.",
];

const ORDER_SETS: { chunks: string[]; sentence: string; gloss: string }[] = [
  { chunks: ["Idhhab", "mustaqeem,", "thumma in'atif", "yameenan."], sentence: "Idhhab mustaqeem, thumma in'atif yameenan.", gloss: "Go straight, then turn right." },
  { chunks: ["Al-maktaba", "amaamaka", "mubaasharatan."], sentence: "Al-maktaba amaamaka mubaasharatan.", gloss: "The library is directly ahead of you." },
  { chunks: ["In'atif", "yasaaran", "'inda al-madrasa."], sentence: "In'atif yasaaran 'inda al-madrasa.", gloss: "Turn left at the school." },
];

export const directionsWriting: Skill = {
  id: "ar-w-directions",
  code: "W.9",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing directions",
  description: "Fill in missing words and arrange words to write correct Arabic direction sentences (romanized).",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "order"] as const);

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const items = shuffle(rng, set.chunks.map((c, i) => ({ id: `${i}-${c}`, label: c })));
      const correctOrder = set.chunks.map((c, i) => `${i}-${c}`);

      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the pieces in the correct order.",
        items,
        correctOrder,
        hint: "Sound the pieces out in different orders until the sentence makes sense.",
        explanation: `The correct sentence is: "${set.sentence}" — meaning "${set.gloss}"`,
      };
    }

    const item = randChoice(rng, FILL_ITEMS);

    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: item.before,
      after: item.after,
      correctAnswer: item.answer,
      inputMode: "text",
      hint: "Think about the direction words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
