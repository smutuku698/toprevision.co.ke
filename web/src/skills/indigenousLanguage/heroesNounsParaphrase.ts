import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const NOUN_SENTENCES: { words: { word: string; type: "Person" | "Place" | "Thing" }[] }[] = [
  {
    words: [
      { word: "nurse", type: "Person" },
      { word: "clinic", type: "Place" },
      { word: "medicine", type: "Thing" },
      { word: "village", type: "Place" },
      { word: "chief", type: "Person" },
      { word: "certificate", type: "Thing" },
    ],
  },
  {
    words: [
      { word: "firefighter", type: "Person" },
      { word: "market", type: "Place" },
      { word: "ladder", type: "Thing" },
      { word: "school", type: "Place" },
      { word: "teacher", type: "Person" },
      { word: "trophy", type: "Thing" },
    ],
  },
  {
    words: [
      { word: "farmer", type: "Person" },
      { word: "riverbank", type: "Place" },
      { word: "seedling", type: "Thing" },
      { word: "committee", type: "Thing" },
      { word: "elder", type: "Person" },
      { word: "stadium", type: "Place" },
    ],
  },
];

const PASSAGES: { text: string; mainIdea: string; distractors: string[] }[] = [
  {
    text: "When floods destroyed homes along the river, a young mechanic named Otieno organized his neighbors to build a temporary shelter using scrap iron sheets. He also repaired broken bicycles for free so families could still reach the market. The local chief later honored him at a community meeting for his quick action and generosity.",
    mainIdea: "A mechanic helped his flooded community by building shelter and repairing bicycles for free",
    distractors: [
      "A chief organized a community meeting about floods",
      "A market was destroyed by heavy flooding",
      "Otieno refused to help his neighbors after the flood",
    ],
  },
  {
    text: "After noticing that many elderly people in her village could not read official letters, a retired teacher named Wanjiru began holding free literacy classes every Saturday. Within a year, over thirty grandparents could read their own medical prescriptions and bank statements. Neighbors now call her the village's quiet hero.",
    mainIdea: "A retired teacher became a village hero by teaching elderly people to read for free",
    distractors: [
      "Wanjiru wrote letters for elderly people instead of teaching them",
      "The village built a new bank because of Wanjiru",
      "Thirty grandparents opened a school together",
    ],
  },
  {
    text: "During a severe drought, a teenage herder named Kiptoo noticed cracks forming in a hillside above his village. He alerted the elders immediately, and the community evacuated hours before a landslide buried the empty homes. Kiptoo was later given a community bravery award for paying close attention to his surroundings.",
    mainIdea: "A teenage herder's quick alert about cracks in a hillside saved his village from a landslide",
    distractors: [
      "A landslide destroyed the village before anyone could escape",
      "Kiptoo caused the landslide by herding animals on the hillside",
      "The elders ignored Kiptoo's warning about the cracks",
    ],
  },
];

export const heroesNounsParaphrase: Skill = {
  id: "il-ls-heroes-nouns-paraphrase",
  code: "LS.1",
  subjectId: "indigenous-language",
  strandId: "il-listening-speaking",
  grade: 9,
  title: "Community heroes: nouns and paraphrasing",
  description: "Identify nouns (people, places, things) and paraphrase the main idea of a story about a community hero or heroine.",
  generate(rng) {
    if (rng() < 0.5) {
      const entry = randChoice(rng, NOUN_SENTENCES);
      const items = shuffle(rng, entry.words.map((w) => ({ id: w.word, label: w.word })));
      const correctBucket: Record<string, string> = {};
      for (const w of entry.words) correctBucket[w.word] = w.type;

      return {
        kind: "categorize",
        prompt: "Sort each noun into Person, Place, or Thing.",
        items,
        buckets: [
          { id: "Person", label: "Person" },
          { id: "Place", label: "Place" },
          { id: "Thing", label: "Thing" },
        ],
        correctBucket,
        hint: "A noun names a person, place, or thing — ask what the word actually refers to.",
        explanation: entry.words.map((w) => `"${w.word}" is a ${w.type.toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, PASSAGES);
    const choices = shuffle(rng, [entry.mainIdea, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      passage: entry.text,
      prompt: "Which sentence best paraphrases the main idea of this story?",
      choices,
      correctIndex: choices.indexOf(entry.mainIdea),
      layout: "list",
      hint: "Paraphrasing means restating the main idea in different words — not copying a small detail.",
      explanation: `The story is mainly about: ${entry.mainIdea}.`,
    };
  },
};
