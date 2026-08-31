import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_CATEGORY_PROMPTS = [
  (label: string) => `Is this "${label}" — a healthy Christian approach to marriage, or a cause/consequence of early marriage?`,
  (label: string) => `Decide: is "${label}" a healthy Christian approach to marriage, or a cause/consequence of early marriage?`,
  (label: string) => `Which category fits "${label}" — healthy Christian approach, or cause/consequence of early marriage?`,
  (label: string) => `Read this statement — "${label}" — and choose the category it belongs to.`,
  (label: string) => `Does "${label}" describe a healthy Christian approach to marriage, or a cause/consequence of early marriage?`,
  (label: string) => `Classify this statement: "${label}".`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement into 'A healthy Christian approach to marriage' or 'A cause or consequence of early marriage'.",
  "Group these statements under the correct category, healthy approach or early marriage.",
  "Decide which category each statement below belongs to, and sort it there.",
  "Sort each statement into the bucket it best fits.",
  "Place each statement into the correct category.",
  "Read each statement and sort it under the matching category.",
];

const HEALTHY = [
  { label: "Taking time to know each other's character before marriage", reason: "Getting to know each other's character is a healthy Christian approach to courtship." },
  { label: "Involving parents, guardians, and the church in the relationship", reason: "Involving family and the church supports a healthy, accountable courtship." },
  { label: "Viewing marriage as a lifelong, sacred covenant before God", reason: "The Bible presents marriage as a sacred institution ordained by God." },
  { label: "Waiting until both partners are mature and ready for commitment", reason: "Maturity and readiness are part of a responsible approach to marriage." },
];

const EARLY_MARRIAGE = [
  { label: "Giving in to peer pressure to prove one's affection", reason: "Peer pressure is a common cause of early marriage among young people." },
  { label: "A family marrying off a child early because of poverty", reason: "Poverty is a leading cause of early marriage in some communities." },
  { label: "A teenage bride or groom dropping out of school", reason: "School dropout is a common consequence of early marriage." },
  { label: "Health complications from pregnancy at a young age", reason: "Early pregnancy carries serious health risks, a consequence of early marriage." },
];

export const courtshipAndMarriage: Skill = {
  id: "cre-cl-courtship-marriage",
  code: "CL.1",
  subjectId: "cre",
  strandId: "cre-living",
  grade: 9,
  title: "Courtship, marriage, and early marriage",
  description: "Sort each statement into a healthy Christian approach to marriage or a cause/consequence of early marriage.",
  generate(rng) {
    const hint = "Christian teaching encourages readiness, family involvement, and viewing marriage as sacred — early marriage, by contrast, often comes from pressure or poverty and brings real harm.";

    if (rng() < 0.5) {
      const pool = [
        ...HEALTHY.map((s) => ({ ...s, category: "A healthy Christian approach to marriage" })),
        ...EARLY_MARRIAGE.map((s) => ({ ...s, category: "A cause or consequence of early marriage" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["A healthy Christian approach to marriage", "A cause or consequence of early marriage"]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_CATEGORY_PROMPTS)(target.label),
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "list",
        hint,
        explanation: target.reason,
      };
    }

    const healthy = shuffle(rng, HEALTHY).slice(0, 3);
    const early = shuffle(rng, EARLY_MARRIAGE).slice(0, 3);
    const items = shuffle(rng, [
      ...healthy.map((s) => ({ id: s.label, label: s.label, bucket: "healthy", reason: s.reason })),
      ...early.map((s) => ({ id: s.label, label: s.label, bucket: "early", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "healthy", label: "A healthy Christian approach to marriage" },
        { id: "early", label: "A cause or consequence of early marriage" },
      ],
      correctBucket,
      hint: "Christian teaching encourages readiness, family involvement, and viewing marriage as sacred — early marriage, by contrast, often comes from pressure or poverty and brings real harm.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
