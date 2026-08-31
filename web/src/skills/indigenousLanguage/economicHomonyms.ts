import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HOMONYM_PAIRS: { wordA: string; meaningA: string; sentenceA: string; wordB: string; meaningB: string; sentenceB: string }[] = [
  {
    wordA: "bank", meaningA: "a place where money is kept", sentenceA: "The trader deposited her earnings at the ___ before closing the stall.",
    wordB: "bank", meaningB: "the land alongside a river", sentenceB: "Farmers planted crops along the river ___ during the dry season.",
  },
  {
    wordA: "fair", meaningA: "a trade or agricultural exhibition", sentenceA: "Farmers displayed their best produce at the annual trade ___.",
    wordB: "fair", meaningB: "treating people equally and justly", sentenceB: "The vendor was known for giving every customer a ___ price.",
  },
  {
    wordA: "right", meaningA: "correct or accurate", sentenceA: "She calculated the ___ change for the customer.",
    wordB: "write", meaningB: "to put words on paper", sentenceB: "The clerk had to ___ down every sale in the ledger.",
  },
  {
    wordA: "sale", meaningA: "an act of selling goods", sentenceA: "The shop held a big ___ to clear old stock.",
    wordB: "sail", meaningB: "the cloth that catches wind on a boat", sentenceB: "Fishermen repaired the torn ___ before heading out.",
  },
  {
    wordA: "sea", meaningA: "a large body of salt water", sentenceA: "Fishermen sailed out onto the calm ___ before dawn.",
    wordB: "see", meaningB: "to notice with the eyes", sentenceB: "From the hill, traders could ___ the market below.",
  },
];

export const economicHomonyms: Skill = {
  id: "il-w-economic-homonyms",
  code: "W.6",
  subjectId: "indigenous-language",
  strandId: "il-writing",
  grade: 9,
  title: "Economic activities: homonyms",
  description: "Choose the correct homonym to complete a sentence about economic activities, based on its meaning.",
  generate(rng) {
    const hint = "Homonyms sound alike (or are spelled alike) but have different meanings — read the sentence carefully to see which meaning fits.";
    const pair = randChoice(rng, HOMONYM_PAIRS);
    const useA = rng() < 0.5;
    const word = useA ? pair.wordA : pair.wordB;
    const meaning = useA ? pair.meaningA : pair.meaningB;
    const sentence = useA ? pair.sentenceA : pair.sentenceB;

    if (rng() < 0.5) {
      const [before, after] = sentence.split("___");
      return {
        kind: "fill-blank",
        prompt: `Fill in the blank with the word meaning "${meaning}".`,
        before: before.trim(),
        after: after.trim(),
        correctAnswer: word,
        acceptedAnswers: [word],
        inputMode: "text",
        hint,
        explanation: `"${word}" means "${meaning}", so the sentence reads: "${sentence.replace("___", word)}"`,
      };
    }

    const distractorPool = Array.from(
      new Set(
        HOMONYM_PAIRS.flatMap((p) => [p.wordA, p.wordB]).filter((w) => w !== word)
      )
    );
    const distractors = shuffle(rng, distractorPool).slice(0, 3);
    const choices = shuffle(rng, [word, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Which word correctly completes this sentence, meaning "${meaning}"? "${sentence}"`,
      choices,
      correctIndex: choices.indexOf(word),
      layout: "row",
      hint,
      explanation: `"${word}" means "${meaning}", so the sentence reads: "${sentence.replace("___", word)}"`,
    };
  },
};
