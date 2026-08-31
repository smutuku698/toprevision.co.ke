import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PUSH = [
  "Prolonged drought destroying crops and pasture",
  "Ongoing conflict or insecurity in the area",
  "Loss of farmland due to soil erosion",
  "Lack of job opportunities in the home area",
  "Flooding that destroys homes and property",
  "Poor access to schools and hospitals",
];

const PULL = [
  "Better job opportunities in a nearby town",
  "Availability of good schools and hospitals",
  "Fertile land and reliable water supply elsewhere",
  "Presence of family members already settled there",
  "Higher wages and a lower cost of living",
  "Peace and security in the destination area",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Migration", meaning: "The movement of people from one place to settle in another" },
  { term: "Push factor", meaning: "A negative condition that drives people to leave an area" },
  { term: "Pull factor", meaning: "A positive condition that attracts people to a new area" },
  { term: "Emigration", meaning: "Leaving one's own country to settle in another" },
  { term: "Immigration", meaning: "Entering and settling in a country other than one's own" },
  { term: "Rural-urban migration", meaning: "Movement of people from rural areas to towns or cities" },
  { term: "Urban-rural migration", meaning: "Movement of people from towns or cities back to rural areas" },
  { term: "Internal migration", meaning: "Movement of people within the borders of the same country" },
  { term: "International migration", meaning: "Movement of people across national borders" },
  { term: "Refugee", meaning: "A person forced to leave their country due to conflict, persecution, or disaster" },
] as const;

const MIGRATION_STEPS = [
  { id: "recognise", label: "Recognise a problem at home or an opportunity elsewhere worth considering" },
  { id: "gather", label: "Gather information about a possible destination" },
  { id: "weigh", label: "Weigh the push factors at home against the pull factors at the destination" },
  { id: "decide", label: "Decide to migrate and plan the move" },
  { id: "settle", label: "Travel to and settle in the new area" },
] as const;

export const migrationFactors: Skill = {
  id: "ss-e-migration-factors",
  code: "E.3",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "Push and pull factors of migration",
  description: "Sort reasons for migration into push factors (that drive people away) and pull factors (that attract people).",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each migration term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the direction of movement and what causes it.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const t = randChoice(rng, TERMS);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence: "${t.meaning}" is the definition of ___.`,
        before: "",
        after: "",
        correctAnswer: t.term,
        acceptedAnswers: [t.term.toLowerCase()],
        inputMode: "text",
        hint: "Think about the migration vocabulary that matches this meaning.",
        explanation: `${t.term} — ${t.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, MIGRATION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps a person typically goes through when deciding to migrate, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: MIGRATION_STEPS.map((s) => s.id),
        hint: "A person notices a problem or opportunity first, then researches, weighs the factors, decides, and finally moves.",
        explanation: MIGRATION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const askPush = rng() < 0.5;
      const correct = randChoice(rng, askPush ? PUSH : PULL);
      const distractors = shuffle(rng, askPush ? PULL : PUSH).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Which of these is a ${askPush ? "push" : "pull"} factor of migration?`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: "Push factors drive people away from a place; pull factors attract people to a new place.",
        explanation: `"${correct}" is a ${askPush ? "push" : "pull"} factor because it ${askPush ? "drives people away from an area" : "attracts people to a new area"}.`,
      };
    }

    const push = shuffle(rng, PUSH).slice(0, 3);
    const pull = shuffle(rng, PULL).slice(0, 3);
    const items = shuffle(rng, [
      ...push.map((label) => ({ id: label, label, bucket: "push" })),
      ...pull.map((label) => ({ id: label, label, bucket: "pull" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each reason into a Push Factor or a Pull Factor.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "push", label: "Push Factor" },
        { id: "pull", label: "Pull Factor" },
      ],
      correctBucket,
      hint: "Push factors drive people away from a place; pull factors attract people to a new place.",
      explanation: `Push factors: ${push.join(" / ")}. Pull factors: ${pull.join(" / ")}.`,
    };
  },
};
