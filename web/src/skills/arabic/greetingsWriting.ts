import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FILL_ITEMS: { before: string; after: string; answer: string; gloss: string }[] = [
  { before: "Assalamu ", after: ", keyfa haaluka?", answer: "alaykum", gloss: "Peace be upon you, how are you?" },
  { before: "", after: ", shukran.", answer: "Bikhayr", gloss: "I am well, thank you." },
  { before: "Maa ", after: "?", answer: "ismuka", gloss: "What is your name?" },
  { before: "Anaa masruurun bi", after: ".", answer: "liqaika", gloss: "I am pleased to meet you." },
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
  { chunks: ["Assalamu alaykum,", "keyfa haaluka?"], sentence: "Assalamu alaykum, keyfa haaluka?", gloss: "Peace be upon you, how are you?" },
  { chunks: ["Ismi Amina,", "anaa masruuratun", "biliqaika!"], sentence: "Ismi Amina, anaa masruuratun biliqaika!", gloss: "My name is Amina, I am pleased to meet you!" },
  { chunks: ["Sabahal khayr,", "ustaadh."], sentence: "Sabahal khayr, ustaadh.", gloss: "Good morning, teacher." },
];

export const greetingsWriting: Skill = {
  id: "ar-w-greetings",
  code: "W.1",
  subjectId: "arabic",
  strandId: "ar-writing",
  grade: 9,
  title: "Writing formal greetings and introductions",
  description: "Fill in missing words and arrange words to write correct Arabic greeting sentences (romanized).",
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
      hint: "Think about the greeting expressions you've learned.",
      explanation: `The complete sentence is: "${item.before}${item.answer}${item.after}" — ${item.gloss}`,
    };
  },
};
