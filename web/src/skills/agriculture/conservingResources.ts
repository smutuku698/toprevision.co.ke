import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HAY: { action: string; reason: string }[] = [
  { action: "Baling grass into compact bundles", reason: "conserving animal feed (hay) — compact bales are easy to store and keep for the dry season" },
  { action: "Stacking dried maize stover in a pile", reason: "conserving animal feed (hay) — stacking keeps dried forage protected until it is needed in a drought" },
  { action: "Leaving mature grass standing in the field for later grazing", reason: "conserving animal feed (hay) — standing forage is a way of storing feed without cutting it" },
];

const LEFTOVER: { action: string; reason: string }[] = [
  { action: "Reheating yesterday's food before eating it again", reason: "conserving leftover food — reheating makes food safe to eat again instead of throwing it away" },
  { action: "Turning leftover vegetables into a new recipe", reason: "conserving leftover food — creating a new dish avoids wasting food that is still good" },
  { action: "Storing leftovers in a covered container in a cool place", reason: "conserving leftover food — covering and cooling food helps it stay safe for later use" },
];

const INTEGRATED: { action: string; reason: string }[] = [
  { action: "Keeping rabbits, poultry, fish, and vegetables together on one plot", reason: "integrated farming — combining enterprises on the same plot lets them benefit each other" },
  { action: "Using rabbit or poultry droppings to fertilise the vegetable garden", reason: "integrated farming — waste from one enterprise becomes a resource for another, conserving inputs" },
  { action: "Using water from a fish pond to irrigate nearby crops", reason: "integrated farming — nutrient-rich pond water conserves water and fertiliser at the same time" },
];

const IDENTIFY_PROMPTS: ((label: string) => string)[] = [
  (label) => `Which of these practices is an example of ${label}?`,
  (label) => `Which practice below best demonstrates ${label}?`,
  (label) => `Can you spot the practice that shows ${label}?`,
  (label) => `Pick the action that counts as ${label}.`,
  (label) => `Which of the following actions is a case of ${label}?`,
  (label) => `Identify the practice that fits under ${label}.`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each practice into Conserving Hay, Conserving Leftover Food, or Integrated Farming.",
  "Group each practice under Conserving Hay, Conserving Leftover Food, or Integrated Farming.",
  "Decide whether each practice belongs to Conserving Hay, Conserving Leftover Food, or Integrated Farming, and sort it there.",
  "Place each practice into the correct category: Conserving Hay, Conserving Leftover Food, or Integrated Farming.",
  "Read each practice and sort it under Conserving Hay, Conserving Leftover Food, or Integrated Farming.",
  "Classify each practice as Conserving Hay, Conserving Leftover Food, or Integrated Farming.",
];

export const conservingResources: Skill = {
  id: "ag-c-conserving-resources",
  code: "C.1",
  subjectId: "agriculture-nutrition",
  strandId: "ag-conservation",
  grade: 9,
  title: "Ways of conserving resources",
  description: "Sort each practice into conserving hay, conserving leftover food, or integrated farming.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify"] as const);

    if (branch === "identify") {
      const buckets = [
        { label: "hay", items: HAY },
        { label: "leftover", items: LEFTOVER },
        { label: "integrated", items: INTEGRATED },
      ] as const;
      const chosenBucket = randChoice(rng, buckets);
      const correct = randChoice(rng, chosenBucket.items);
      const otherItems = buckets.filter((b) => b.label !== chosenBucket.label).flatMap((b) => b.items);
      const distractors = shuffle(rng, otherItems).slice(0, 3);
      const choices = shuffle(rng, [correct.action, ...distractors.map((d) => d.action)]);
      const bucketNames: Record<string, string> = { hay: "Conserving Hay", leftover: "Conserving Leftover Food", integrated: "Integrated Farming" };

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS)(bucketNames[chosenBucket.label]),
        choices,
        correctIndex: choices.indexOf(correct.action),
        layout: "list",
        hint: "Hay conservation is about storing animal feed, leftover food conservation is about avoiding food wastage at home, and integrated farming is about combining different enterprises on one plot.",
        explanation: `${correct.action} is an example of ${correct.reason}.`,
      };
    }

    const hay = shuffle(rng, HAY).slice(0, 2);
    const leftover = shuffle(rng, LEFTOVER).slice(0, 2);
    const integrated = shuffle(rng, INTEGRATED).slice(0, 2);
    const items = shuffle(rng, [
      ...hay.map((h) => ({ id: h.action, label: h.action, bucket: "hay", reason: h.reason })),
      ...leftover.map((l) => ({ id: l.action, label: l.action, bucket: "leftover", reason: l.reason })),
      ...integrated.map((i) => ({ id: i.action, label: i.action, bucket: "integrated", reason: i.reason })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "hay", label: "Conserving Hay" },
        { id: "leftover", label: "Conserving Leftover Food" },
        { id: "integrated", label: "Integrated Farming" },
      ],
      correctBucket,
      hint: "Hay conservation is about storing animal feed, leftover food conservation is about avoiding food wastage at home, and integrated farming is about combining different enterprises on one plot.",
      explanation: items.map((item) => `${item.label} is an example of ${item.reason}.`).join(" "),
    };
  },
};
