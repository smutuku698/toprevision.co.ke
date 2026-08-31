import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Passage {
  text: string;
  question: { prompt: string; choices: string[]; correctIndex: number; explanation: string };
  verbs: string[];
  otherWords: string[];
}

const PASSAGES: Passage[] = [
  {
    text: "Every morning, fishermen paddle their canoes across the calm lake and cast their nets before sunrise. They haul in the catch, sort the fish by size, and sell the best ones directly to traders waiting at the shore. Whatever remains, they smoke over a slow fire to preserve for later.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "The daily routine of fishermen catching, sorting, and selling fish",
        "Traders refusing to buy fish from the lake",
        "Fishermen building new canoes",
        "A lake drying up during a drought",
      ],
      correctIndex: 0,
      explanation: "The passage follows the fishermen's full daily routine, from casting nets to selling and preserving fish.",
    },
    verbs: ["paddle", "cast", "haul", "sort", "sell", "smoke", "preserve"],
    otherWords: ["canoes", "lake", "fishermen", "traders", "shore", "fire", "catch"],
  },
  {
    text: "Farmers wake before dawn to weed their maize fields while the soil is still cool. By mid-morning, they irrigate the young seedlings and check for pests along each row. In the evening, they record how much water each section received so they can plan the following week.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "A farmer's daily tasks of weeding, irrigating, and checking crops",
        "Farmers refusing to plant maize this season",
        "A field left completely unattended",
        "Traders buying maize directly from the farm",
      ],
      correctIndex: 0,
      explanation: "The passage traces the farmer's tasks throughout the day — weeding, irrigating, and record-keeping.",
    },
    verbs: ["weed", "irrigate", "check", "record", "plan", "wake"],
    otherWords: ["maize", "fields", "seedlings", "pests", "soil", "row", "water"],
  },
  {
    text: "At the roadside market, traders arrange their vegetables early and negotiate prices with the first customers of the day. They restock from a supplier by midday and calculate their earnings before closing the stall at dusk.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "A trader's daily tasks of arranging, negotiating, and restocking goods",
        "A market that closes permanently",
        "Customers refusing to buy vegetables",
        "A supplier who never delivers goods",
      ],
      correctIndex: 0,
      explanation: "The passage describes the trader's full day of arranging goods, negotiating, restocking, and calculating earnings.",
    },
    verbs: ["arrange", "negotiate", "restock", "calculate", "closing"],
    otherWords: ["market", "vegetables", "customers", "supplier", "stall", "prices", "dusk"],
  },
];

export const economicVerbs: Skill = {
  id: "il-r-economic-verbs",
  code: "R.6",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "Economic activities: reading comprehension and verbs",
  description: "Read a short text about an economic activity, answer a comprehension question, and pick out its verbs.",
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

    const verbs = shuffle(rng, passage.verbs).slice(0, 4);
    const others = shuffle(rng, passage.otherWords).slice(0, 4);
    const items = shuffle(rng, [
      ...verbs.map((label) => ({ id: label, label, bucket: "verb" })),
      ...others.map((label) => ({ id: label, label, bucket: "other" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      passage: passage.text,
      prompt: "Sort each word from the passage into Verb or Not a verb.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "verb", label: "Verb" },
        { id: "other", label: "Not a verb" },
      ],
      correctBucket,
      hint: "A verb shows an action or state — ask whether the word tells you what someone is doing.",
      explanation: `Verbs from the passage include: ${verbs.join(", ")}. The rest are nouns, not verbs.`,
    };
  },
};
