import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Ana ", after: " al-yawm.", answer: "mareed", gloss: "I am sick today." },
  { before: "Ana ", after: " wa 'atshaan.", answer: "jaa'i'", gloss: "I am hungry and thirsty." },
  { before: "Ishrab maa'an katheeran wa ", after: ".", answer: "istarih", gloss: "Drink plenty of water and rest." },
  { before: "Satakoonu ", after: " ghadan.", answer: "bikhayr", gloss: "You will be well tomorrow." },
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
  { chunks: ["Ana", "mareed,", "wa ra'see", "yu'limuni."], sentence: "Ana mareed, wa ra'see yu'limuni.", gloss: "I am sick, and my head hurts." },
  { chunks: ["Ishrab", "maa'an katheeran", "wa istarih."], sentence: "Ishrab maa'an katheeran wa istarih.", gloss: "Drink plenty of water and rest." },
  { chunks: ["Ana", "muta'ab", "wa jaa'i'."], sentence: "Ana muta'ab wa jaa'i'.", gloss: "I am tired and hungry." },
];

export const bodyWriting: Skill = {
  id: "ar-w-body",
  code: "W.7",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing about states of health",
  description: "Fill in missing words and arrange words to write correct Arabic sentences about health (romanized).",
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
      hint: "Think about the states of health words you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
