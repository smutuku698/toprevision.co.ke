import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Passage {
  text: string;
  question: { prompt: string; choices: string[]; correctIndex: number; explanation: string };
  prepositions: string[];
  otherWords: string[];
}

const PASSAGES: Passage[] = [
  {
    text: "Kenya is home to more than forty communities, each with its own language, songs, and customs. During national celebrations, dancers from across the country perform together on one stage, sharing steps passed down from their grandparents. Visitors often say that walking through a cultural festival feels like traveling between many different worlds in a single afternoon.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "Kenya's many communities coming together to share their diverse cultures",
        "A single community that has no traditions",
        "Visitors who dislike cultural festivals",
        "Dancers who refuse to perform together",
      ],
      correctIndex: 0,
      explanation: "The passage highlights Kenya's many communities sharing their distinct cultures together at festivals.",
    },
    prepositions: ["to", "with", "During", "across", "on", "through", "between"],
    otherWords: ["Kenya", "communities", "songs", "customs", "dancers", "stage", "visitors"],
  },
  {
    text: "Beneath the shade of a large fig tree, elders from the community gather every month to settle disputes and share advice with younger members. Among the topics discussed are farming, marriage customs, and respect between neighbors. The meetings end with a shared meal, uniting everyone before they return to their homes.",
    question: {
      prompt: "What is this passage mainly about?",
      choices: [
        "Elders gathering monthly to give advice and settle disputes",
        "A community that never holds meetings",
        "Elders who refuse to discuss farming",
        "A fig tree being cut down for firewood",
      ],
      correctIndex: 0,
      explanation: "The passage describes the elders' monthly gathering to give advice, settle disputes, and share a meal.",
    },
    prepositions: ["Beneath", "of", "with", "Among", "between", "before"],
    otherWords: ["elders", "community", "disputes", "advice", "farming", "meal", "homes"],
  },
];

export const culturesPrepositions: Skill = {
  id: "il-r-cultures-prepositions",
  code: "R.9",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "Kenyan cultures: extensive reading and prepositions",
  description: "Read a short text about Kenyan cultures, answer a comprehension question, and pick out its prepositions.",
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

    const prepositions = shuffle(rng, passage.prepositions).slice(0, 4);
    const others = shuffle(rng, passage.otherWords).slice(0, 4);
    const items = shuffle(rng, [
      ...prepositions.map((label) => ({ id: label, label, bucket: "preposition" })),
      ...others.map((label) => ({ id: label, label, bucket: "other" })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      passage: passage.text,
      prompt: "Sort each word from the passage into Preposition or Not a preposition.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "preposition", label: "Preposition" },
        { id: "other", label: "Not a preposition" },
      ],
      correctBucket,
      hint: "A preposition shows how a noun relates to another word — position, direction, or time (e.g. under, between, during).",
      explanation: `Prepositions from the passage include: ${prepositions.join(", ")}. The rest are nouns, not prepositions.`,
    };
  },
};
