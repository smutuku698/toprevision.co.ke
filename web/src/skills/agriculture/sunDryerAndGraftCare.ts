import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main purpose of building a homemade sun dryer?",
    correct: "To preserve vegetables by drying them for later use",
    distractors: ["To water plants automatically", "To store fresh milk", "To keep animals warm"],
  },
  {
    q: "What kind of materials should be used to construct a homemade sun dryer?",
    correct: "Locally available materials",
    distractors: ["Materials that must all be imported", "Only glass and steel", "Materials that block out all sunlight"],
  },
  {
    q: "Why is grafting sometimes done on an old, declining plant?",
    correct: "To rejuvenate it and restore its vigour",
    distractors: ["To make it grow shorter", "To change it into a different species", "To stop it from producing fruit"],
  },
  {
    q: "After grafting, what should be done to help the union heal successfully?",
    correct: "Protect the union and water the plant, removing other buds on the root stock",
    distractors: ["Expose it directly to strong sunlight with no protection", "Cut off all its leaves immediately", "Submerge the whole plant in water"],
  },
  {
    q: "Why might a farmer use grafting instead of growing a new plant from seed?",
    correct: "To combine desirable qualities, such as better fruit with a hardier root system",
    distractors: ["Because grafting is always faster than germinating seeds", "Because seeds cannot grow into plants", "Because grafted plants never need water"],
  },
];

const PRACTICES: { label: string; bucket: "Sun Dryer" | "Grafting Care" }[] = [
  { label: "Preserving vegetables by drying them for later use", bucket: "Sun Dryer" },
  { label: "Built using locally available materials", bucket: "Sun Dryer" },
  { label: "Lets air circulate so moisture escapes from the produce", bucket: "Sun Dryer" },
  { label: "Protecting the graft union and watering the plant", bucket: "Grafting Care" },
  { label: "Removing other buds on the root stock", bucket: "Grafting Care" },
  { label: "Waiting for the union to heal before removing supports", bucket: "Grafting Care" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each practice into Sun Dryer or Grafting Care.",
  "Group each practice under Sun Dryer or Grafting Care.",
  "Decide whether each practice belongs to the sun dryer or to grafting care, and sort it there.",
  "Place each practice into Sun Dryer or Grafting Care.",
  "Read each practice and sort it as Sun Dryer or Grafting Care.",
  "Classify each practice as part of the Sun Dryer or Grafting Care.",
];

export const sunDryerAndGraftCare: Skill = {
  id: "ag-p-sun-dryer-graft-care",
  code: "P.2",
  subjectId: "agriculture-nutrition",
  strandId: "ag-production-techniques",
  grade: 9,
  title: "Homemade sun dryer and caring for grafted plants",
  description: "Answer questions about building a homemade sun dryer and caring for a grafted plant.",
  generate(rng) {
    const hint = "A homemade sun dryer preserves vegetables using locally available materials, and a newly grafted plant needs protection and care while the union heals.";

    if (rng() < 0.5) {
      const chosen = shuffle(rng, PRACTICES);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.label, bucket: p.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Sun Dryer", label: "Sun Dryer" },
          { id: "Grafting Care", label: "Grafting Care" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((p) => `"${p.label}" belongs to ${p.bucket}.`).join(" "),
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);

    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
