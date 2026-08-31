import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Passage {
  text: string;
  question: { prompt: string; choices: string[]; correctIndex: number; explanation: string };
  adjectives: string[];
  otherWords: string[];
}

const PASSAGES: Passage[] = [
  {
    text: "The crowded bus station was noisy and chaotic on the busy Friday evening. A careful conductor noticed a small child wandering alone near the dangerous edge of the platform. He gently guided the frightened boy back to his worried mother, who had been searching everywhere.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "A conductor helping a lost child stay safe at a busy bus station",
        "A mother losing her bus ticket",
        "A quiet, empty bus station on a Friday evening",
        "A child who refused to leave the platform",
      ],
      correctIndex: 0,
      explanation: "The passage follows the conductor noticing and safely returning the lost child to his mother.",
    },
    adjectives: ["crowded", "noisy", "chaotic", "careful", "dangerous", "frightened", "worried"],
    otherWords: ["station", "conductor", "child", "mother", "platform", "bus", "evening"],
  },
  {
    text: "Thick black smoke poured from the overloaded matatu's engine as it stopped on the busy highway. The alert driver quickly waved oncoming traffic away and helped the anxious passengers step out through the narrow door to safety.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "A driver safely evacuating passengers from a smoking matatu",
        "Passengers refusing to leave the matatu",
        "A matatu driving smoothly along an empty road",
        "A highway being closed for repairs",
      ],
      correctIndex: 0,
      explanation: "The passage centers on the driver's quick, safe response to the smoking engine.",
    },
    adjectives: ["thick", "black", "overloaded", "busy", "alert", "anxious", "narrow"],
    otherWords: ["smoke", "engine", "highway", "driver", "traffic", "passengers", "door"],
  },
  {
    text: "During the sudden heavy downpour, the slippery market pathway became extremely hazardous for shoppers. A quick-thinking vendor placed old sacks over the muddiest patches so elderly customers could walk safely to their stalls.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "A vendor making a muddy market pathway safer during heavy rain",
        "Shoppers refusing to enter the market during rain",
        "A dry, sunny day at the market",
        "Elderly customers closing their stalls early",
      ],
      correctIndex: 0,
      explanation: "The passage describes the vendor's quick action to prevent shoppers from slipping in the rain.",
    },
    adjectives: ["sudden", "heavy", "slippery", "hazardous", "muddiest", "elderly", "quick-thinking"],
    otherWords: ["downpour", "pathway", "market", "vendor", "sacks", "customers", "stalls"],
  },
];

export const safetyShortStories: Skill = {
  id: "il-r-safety-shortstories",
  code: "R.4",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "Safety in public places: short stories and adjectives",
  description: "Read a short story about safety in a public place, answer a comprehension question, and pick out its adjectives.",
  generate(rng) {
    const passage = randChoice(rng, PASSAGES);

    if (rng() < 0.5) {
      const choices = shuffle(rng, passage.question.choices);
      return {
        kind: "multiple-choice",
        passage: passage.text,
        prompt: passage.question.prompt,
        choices,
        correctIndex: choices.indexOf(passage.question.choices[passage.question.correctIndex]),
        layout: "list",
        hint: "Reread the passage and look for the sentence that answers the question directly.",
        explanation: passage.question.explanation,
      };
    }

    const adjectives = shuffle(rng, passage.adjectives).slice(0, 4);
    const others = shuffle(rng, passage.otherWords).slice(0, 4);
    const items = shuffle(rng, [
      ...adjectives.map((label) => ({ id: label, label, bucket: "adjective" })),
      ...others.map((label) => ({ id: label, label, bucket: "other" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      passage: passage.text,
      prompt: "Sort each word from the passage into Adjective or Not an adjective.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "adjective", label: "Adjective" },
        { id: "other", label: "Not an adjective" },
      ],
      correctBucket,
      hint: "An adjective describes a noun — ask whether the word tells you what kind, or how many.",
      explanation: `Adjectives from the passage include: ${adjectives.join(", ")}. The rest are nouns, not adjectives.`,
    };
  },
};
