import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const WHICH_CATEGORY_PROMPTS = [
  (label: string) => `Is this "${label}" — upholding Christian moral values, or a practice the Bible warns against?`,
  (label: string) => `Decide: does "${label}" uphold Christian moral values, or is it a practice the Bible warns against?`,
  (label: string) => `Which category fits "${label}" — upholding values, or a practice to avoid?`,
  (label: string) => `Read this practice — "${label}" — and choose the category it belongs to.`,
  (label: string) => `Does "${label}" uphold Christian moral values, or does the Bible warn against it?`,
  (label: string) => `Classify this practice: "${label}".`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each practice into 'Upholds Christian moral values' or 'A practice the Bible warns against'.",
  "Group these practices under upholding moral values or ones the Bible warns against.",
  "Decide which category each practice below belongs to, and sort it there.",
  "Sort each practice into the bucket it best fits.",
  "Place each practice into the correct category.",
  "Read each practice and sort it under the matching category.",
];

const UPHOLD = [
  { label: "Practising self-control over sexual desires", reason: "Self-control is a moral value the Bible calls young people to uphold." },
  { label: "Dressing modestly to avoid tempting others", reason: "Modesty is a Christian moral value that guards purity." },
  { label: "Staying faithful to one partner within marriage", reason: "Faithfulness within marriage is a moral value upheld in the Bible." },
  { label: "Praying for strength to resist temptation", reason: "Prayer for strength is a Christian moral value that helps resist temptation." },
  { label: "Choosing friends who encourage a morally upright life", reason: "Good company is a moral value that helps a young person stay upright." },
];

const AVOID = [
  { label: "Engaging in sex before marriage", reason: "Premarital sex is a forbidden sexual practice outlined in the Bible." },
  { label: "Being unfaithful to a spouse (adultery)", reason: "Adultery is a forbidden sexual practice outlined in the Bible." },
  { label: "Giving in to peer pressure to prove 'love'", reason: "Giving in to pressure goes against upholding Christian moral values." },
  { label: "Viewing or sharing pornographic material", reason: "This is a forbidden practice that undermines sexual purity." },
];

export const moralValues: Skill = {
  id: "cre-bi-moral-values",
  code: "BI.1",
  subjectId: "cre",
  strandId: "cre-bible",
  grade: 9,
  title: "Christian moral values and sexual purity",
  description: "Sort practices into ones that uphold Christian moral values or ones the Bible warns against.",
  generate(rng) {
    const hint = "The Bible calls young people to live morally upright lives and to maintain sexual purity, avoiding practices it names as forbidden.";

    if (rng() < 0.5) {
      const pool = [
        ...UPHOLD.map((s) => ({ ...s, category: "Upholds Christian moral values" })),
        ...AVOID.map((s) => ({ ...s, category: "A practice the Bible warns against" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Upholds Christian moral values", "A practice the Bible warns against"]);

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

    const uphold = shuffle(rng, UPHOLD).slice(0, 3);
    const avoid = shuffle(rng, AVOID).slice(0, 2);
    const items = shuffle(rng, [
      ...uphold.map((s) => ({ id: s.label, label: s.label, bucket: "uphold", reason: s.reason })),
      ...avoid.map((s) => ({ id: s.label, label: s.label, bucket: "avoid", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "uphold", label: "Upholds Christian moral values" },
        { id: "avoid", label: "A practice the Bible warns against" },
      ],
      correctBucket,
      hint: "The Bible calls young people to live morally upright lives and to maintain sexual purity, avoiding practices it names as forbidden.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
