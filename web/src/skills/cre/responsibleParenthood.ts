import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_CATEGORY_PROMPTS = [
  (label: string) => `Is this "${label}" — responsible parenting or irresponsible parenting?`,
  (label: string) => `Decide: is "${label}" responsible or irresponsible parenting?`,
  (label: string) => `Which category fits "${label}" — responsible parenting, or irresponsible parenting?`,
  (label: string) => `Read this practice — "${label}" — and choose the category it belongs to.`,
  (label: string) => `Does "${label}" describe responsible or irresponsible parenting?`,
  (label: string) => `Classify this parenting practice: "${label}".`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each practice into 'Responsible parenting' or 'Irresponsible parenting'.",
  "Group these practices under responsible or irresponsible parenting.",
  "Decide which category each practice below belongs to, and sort it there.",
  "Sort each practice into the bucket it best fits.",
  "Place each parenting practice into the correct category.",
  "Read each practice and sort it under responsible or irresponsible parenting.",
];

const RESPONSIBLE = [
  { label: "Providing for a child's basic needs such as food, shelter, and education", reason: "Meeting basic needs is a core duty of responsible parenting." },
  { label: "Guiding children using biblical teachings and good values", reason: "Biblical guidance helps shape a child's character responsibly." },
  { label: "Spending quality time with children and listening to them", reason: "Quality time builds a strong, healthy parent-child bond." },
  { label: "Being a positive role model through one's own behaviour", reason: "Parents shape character most by the example they set." },
];

const IRRESPONSIBLE = [
  { label: "Neglecting a child's needs for food, care, or education", reason: "Neglect is a form of irresponsible parenting with lasting harm to a child." },
  { label: "Failing to guide or discipline a child at all", reason: "A lack of guidance leaves a child without the values they need." },
  { label: "Being absent from a child's life for long periods without cause", reason: "Absentee parenting deprives a child of needed support and guidance." },
  { label: "Exposing children to alcohol, drugs, or violence at home", reason: "Exposing children to harmful behaviour is a serious failure of parental duty." },
];

export const responsibleParenthood: Skill = {
  id: "cre-cl-responsible-parenthood",
  code: "CL.2",
  subjectId: "cre",
  strandId: "cre-living",
  grade: 9,
  title: "Responsible parenthood",
  description: "Sort parenting practices into responsible or irresponsible parenting.",
  generate(rng) {
    const hint = "The Bible teaches parents to guide, provide for, and be good examples to their children — irresponsible parenting fails in one or more of these duties.";

    if (rng() < 0.5) {
      const pool = [
        ...RESPONSIBLE.map((s) => ({ ...s, category: "Responsible parenting" })),
        ...IRRESPONSIBLE.map((s) => ({ ...s, category: "Irresponsible parenting" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Responsible parenting", "Irresponsible parenting"]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, WHICH_CATEGORY_PROMPTS)(target.label),
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: target.reason,
      };
    }

    const responsible = shuffle(rng, RESPONSIBLE).slice(0, 3);
    const irresponsible = shuffle(rng, IRRESPONSIBLE).slice(0, 3);
    const items = shuffle(rng, [
      ...responsible.map((s) => ({ id: s.label, label: s.label, bucket: "responsible", reason: s.reason })),
      ...irresponsible.map((s) => ({ id: s.label, label: s.label, bucket: "irresponsible", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "responsible", label: "Responsible parenting" },
        { id: "irresponsible", label: "Irresponsible parenting" },
      ],
      correctBucket,
      hint: "The Bible teaches parents to guide, provide for, and be good examples to their children — irresponsible parenting fails in one or more of these duties.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
