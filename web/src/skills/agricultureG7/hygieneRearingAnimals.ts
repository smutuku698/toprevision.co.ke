import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PRACTICES = [
  { id: "clean-feeders", label: "Cleaning feeders", detail: "Washing feeding troughs regularly so old, mouldy feed cannot make animals sick" },
  { id: "clean-waterers", label: "Cleaning waterers", detail: "Washing drinking containers regularly so algae and dirt do not build up in the water" },
  { id: "clean-housing", label: "Clean, ventilated housing", detail: "Keeping the animal shelter clean and airy so waste does not accumulate and disease does not spread easily" },
  { id: "clean-animal", label: "Keeping the animal clean", detail: "Grooming or washing the animal itself to prevent skin problems and parasites" },
] as const;

const ACTION_ITEMS = [
  { text: "Scrubbing out the water trough before refilling it with clean water", bucket: "hygienic" },
  { text: "Leaving old, leftover feed to rot in the feeding trough for days", bucket: "unhygienic" },
  { text: "Opening the shelter's windows daily to let in fresh air", bucket: "hygienic" },
  { text: "Letting animal waste pile up inside a poorly ventilated shelter", bucket: "unhygienic" },
  { text: "Brushing a pet regularly to keep its coat clean", bucket: "hygienic" },
] as const;
const ACTION_LABEL: Record<string, string> = { hygienic: "Hygienic practice", unhygienic: "Unhygienic practice" };

const SCENARIOS = [
  {
    q: "A family's rabbit hutch has not been cleaned in weeks, and droppings have built up on the floor. What health risk does this create?",
    correct: "The buildup of waste can spread disease and attract parasites that harm the rabbit",
    distractors: [
      "A dirty hutch has no real effect on a rabbit's health",
      "Waste buildup only affects the smell, never the animal's health",
      "Rabbits are naturally immune to any disease from their own waste",
    ],
  },
  {
    q: "A poultry keeper notices the chickens' water container has turned green with algae. What should be done?",
    correct: "Scrub the waterer clean and refill it with fresh water regularly, before algae builds up again",
    distractors: [
      "Add more water on top of the green water without cleaning the container",
      "Leave it, since algae has no effect on chicken health",
      "Only clean the waterer once a year regardless of its condition",
    ],
  },
];

const ROUTINE_STEPS = [
  { id: "inspect", label: "Inspect the housing, feeders, and waterers for dirt or waste" },
  { id: "remove-waste", label: "Remove any waste or leftover feed" },
  { id: "clean", label: "Clean the feeders, waterers, and housing thoroughly" },
  { id: "refill", label: "Refill with fresh feed and clean water" },
  { id: "groom", label: "Groom or check the animal itself for cleanliness" },
];

const FILL_ITEMS = [
  { before: "Allowing fresh air to move through an animal shelter is called ", after: ".", correctAnswer: "ventilation" },
  { before: "Keeping the wellbeing of animals in mind while caring for them is called animal ", after: ".", correctAnswer: "welfare" },
];

const MATCH_PROMPTS = [
  "Match each animal hygiene practice to why it matters.",
  "Pair each practice with the reason it protects the animal.",
  "Connect each hygiene practice to why it actually helps.",
  "Match each practice below to the explanation that fits it.",
  "Link each animal hygiene habit to why it matters.",
  "Match each practice to its correct explanation.",
];

const SORT_PROMPTS = [
  "Sort each action as a hygienic or unhygienic practice when rearing domestic animals.",
  "Decide whether each action below is hygienic or unhygienic, and sort it there.",
  "Group these actions under hygienic or unhygienic.",
  "Sort each habit into the correct hygiene bucket.",
  "Read each action and place it under whether it keeps animals clean or not.",
  "Classify each action as a hygienic or unhygienic animal-care practice.",
];

const ORDER_PROMPTS = [
  "Arrange the steps of a daily animal hygiene routine, in the correct order.",
  "Put these daily animal hygiene steps into a sensible order.",
  "Sequence the steps of a typical animal hygiene routine correctly.",
  "Arrange these actions into the order a careful keeper would follow them.",
  "Order these hygiene tasks the way they should actually happen during the day.",
  "Sort these steps into the order needed for a proper hygiene routine.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Which word correctly completes this sentence?",
  "Supply the missing word to finish the sentence.",
  "Work out the missing word in this sentence.",
  "Type the word that correctly fills the gap.",
];

export const hygieneRearingAnimals: Skill = {
  id: "g7-ag-h-hygiene-rearing-animals",
  code: "H.1",
  subjectId: "agriculture-nutrition",
  strandId: "g7-ag-hygiene",
  grade: 7,
  title: "Hygiene in Rearing Animals",
  description: "Hygiene practices when rearing domestic animals — clean feeders and waterers, clean and well-ventilated housing, and keeping the animal itself clean.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "sort", "scenario", "order", "fill"] as const);
    const hint = "Animal hygiene covers what the animal eats and drinks from, where it lives, and the animal itself.";

    if (branch === "match") {
      const tokens = shuffle(rng, PRACTICES.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PRACTICES.map((p) => ({ id: p.id, label: p.detail })));
      const correctMap: Record<string, string> = {};
      for (const p of PRACTICES) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PRACTICES.map((p) => `${p.label}: ${p.detail}.`).join(" "),
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, ACTION_ITEMS);
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "hygienic", label: ACTION_LABEL.hygienic },
          { id: "unhygienic", label: ACTION_LABEL.unhygienic },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" is a ${ACTION_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, SCENARIOS);
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
    }

    if (branch === "order") {
      const items = shuffle(rng, ROUTINE_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: ROUTINE_STEPS.map((s) => s.id),
        hint: "You must find and remove the mess before you can clean, and refilling comes only after cleaning.",
        explanation: ROUTINE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
