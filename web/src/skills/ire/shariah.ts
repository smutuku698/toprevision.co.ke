import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const OBJECTIVE_MC_PROMPTS = (label: string) => [
  `Which objective of Shariah does this protect: "${label}"?`,
  `"${label}" — which objective of Shariah does this protect?`,
  `Identify the objective of Shariah protected by: "${label}".`,
  `Which of the five objectives does "${label}" protect?`,
  `This law protects which objective of Shariah: "${label}"?`,
  `Name the objective of Shariah that "${label}" protects.`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each example by the objective of Shariah (Maqasid al-Shariah) it protects.",
  "Group each example under the objective of Shariah it protects.",
  "Decide which objective of Shariah each example protects, and sort it there.",
  "Sort each example into the correct objective of Maqasid al-Shariah.",
  "Place each example under the objective it protects.",
  "Categorise each example by the objective of Shariah it protects.",
];

const RELIGION = [
  { label: "Establishing the five daily prayers", reason: "Regular prayer protects and strengthens religion, one of the five objectives of Shariah." },
  { label: "Fasting during the month of Ramadan", reason: "Fasting is an act of worship that protects and nurtures religion." },
];

const INTELLECT = [
  { label: "The prohibition of alcohol and harmful substances", reason: "This law protects the intellect by keeping the mind clear and sound." },
  { label: "Encouraging the pursuit of beneficial knowledge", reason: "Seeking knowledge protects and develops the intellect." },
];

const LIFE = [
  { label: "Laws against murder and causing bodily harm", reason: "These laws protect human life, one of the five objectives of Shariah." },
  { label: "Rules requiring safe food and water for the community", reason: "This protects life by safeguarding health and survival." },
];

const PROPERTY = [
  { label: "Laws against theft and fraud", reason: "These laws protect property, one of the five objectives of Shariah." },
  { label: "Rules requiring honest business dealings", reason: "Honest trade protects the property and rights of everyone involved." },
];

const DIGNITY = [
  { label: "The prohibition of slander and false accusations", reason: "This law protects a person's dignity and reputation." },
  { label: "Rules against public humiliation or mockery", reason: "This protects the dignity of every individual in society." },
];

export const shariah: Skill = {
  id: "ire-da-shariah",
  code: "DA.1",
  subjectId: "ire",
  strandId: "ire-devotional",
  grade: 9,
  title: "Maqasid al-Shariah: the objectives of Islamic law",
  description: "Sort each example of Islamic law by which objective of Shariah it protects.",
  generate(rng) {
    const hint = "Maqasid al-Shariah names five core objectives that Islamic law protects: religion, intellect, life, property, and dignity.";

    if (rng() < 0.4) {
      const pool = [
        ...RELIGION.map((s) => ({ ...s, category: "Protection of religion" })),
        ...INTELLECT.map((s) => ({ ...s, category: "Protection of intellect" })),
        ...LIFE.map((s) => ({ ...s, category: "Protection of life" })),
        ...PROPERTY.map((s) => ({ ...s, category: "Protection of property" })),
        ...DIGNITY.map((s) => ({ ...s, category: "Protection of dignity" })),
      ];
      const target = randChoice(rng, pool);
      const otherCategories = ["Protection of religion", "Protection of intellect", "Protection of life", "Protection of property", "Protection of dignity"].filter(
        (c) => c !== target.category
      );
      const choices = shuffle(rng, [target.category, ...shuffle(rng, otherCategories).slice(0, 3)]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, OBJECTIVE_MC_PROMPTS(target.label)),
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "list",
        hint,
        explanation: target.reason,
      };
    }

    const religion = shuffle(rng, RELIGION).slice(0, 1);
    const intellect = shuffle(rng, INTELLECT).slice(0, 1);
    const life = shuffle(rng, LIFE).slice(0, 1);
    const property = shuffle(rng, PROPERTY).slice(0, 1);
    const dignity = shuffle(rng, DIGNITY).slice(0, 1);
    const items = shuffle(rng, [
      ...religion.map((s) => ({ id: s.label, label: s.label, bucket: "religion", reason: s.reason })),
      ...intellect.map((s) => ({ id: s.label, label: s.label, bucket: "intellect", reason: s.reason })),
      ...life.map((s) => ({ id: s.label, label: s.label, bucket: "life", reason: s.reason })),
      ...property.map((s) => ({ id: s.label, label: s.label, bucket: "property", reason: s.reason })),
      ...dignity.map((s) => ({ id: s.label, label: s.label, bucket: "dignity", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "religion", label: "Protection of religion" },
        { id: "intellect", label: "Protection of intellect" },
        { id: "life", label: "Protection of life" },
        { id: "property", label: "Protection of property" },
        { id: "dignity", label: "Protection of dignity" },
      ],
      correctBucket,
      hint: "Maqasid al-Shariah names five core objectives that Islamic law protects: religion, intellect, life, property, and dignity.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
