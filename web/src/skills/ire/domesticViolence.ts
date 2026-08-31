import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CAUSE_EFFECT_MC_PROMPTS = (label: string) => [
  `Is this "${label}" — a cause, an effect, or an Islamic measure to curb domestic violence?`,
  `"${label}" — is this a cause, an effect, or a measure to curb domestic violence?`,
  `Which category does "${label}" belong to: a cause, an effect, or a measure to curb it?`,
  `Classify "${label}" as a cause, an effect, or an Islamic measure to curb domestic violence.`,
  `Decide whether "${label}" is a cause, an effect, or a measure to curb domestic violence.`,
  `Is "${label}" best described as a cause, an effect, or a curbing measure?`,
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement into 'A cause', 'An effect', or 'An Islamic measure to curb domestic violence'.",
  "Group each statement under 'A cause', 'An effect', or 'An Islamic measure to curb it'.",
  "Decide whether each statement is a cause, an effect, or a measure to curb domestic violence, and sort it there.",
  "Sort each statement into the correct category: cause, effect, or curbing measure.",
  "Place each statement into the right bucket — a cause, an effect, or a measure.",
  "Categorise each statement as a cause, an effect, or an Islamic measure to curb domestic violence.",
];

const CAUSES = [
  { label: "Financial stress and poverty within the family", reason: "Financial stress is a common cause of tension that can lead to domestic violence." },
  { label: "Poor communication and conflict-resolution skills", reason: "Without healthy communication, disagreements can escalate into violence." },
  { label: "Substance abuse within the household", reason: "Substance abuse is a recognised cause of domestic violence." },
];

const EFFECTS = [
  { label: "Physical and emotional harm to family members", reason: "Domestic violence directly harms the physical and emotional wellbeing of those affected." },
  { label: "Breakdown of trust and unity within the family", reason: "Violence damages the trust that holds a family together." },
  { label: "Negative impact on children's wellbeing and development", reason: "Children exposed to domestic violence suffer lasting negative effects." },
];

const MEASURES = [
  { label: "Promoting the just and kind treatment of spouses taught in Islam", reason: "Islam calls for kindness and justice between spouses as a measure to curb domestic violence." },
  { label: "Involving family or community elders to mediate disputes", reason: "Mediation by respected elders is an Islamic measure for resolving family conflict peacefully." },
  { label: "Seeking counselling or help from relevant authorities", reason: "Seeking help is an important measure proposed to curb domestic violence." },
];

export const domesticViolence: Skill = {
  id: "ire-mu-domestic-violence",
  code: "MU.1",
  subjectId: "ire",
  strandId: "ire-muamalat",
  grade: 9,
  title: "Domestic violence: causes, effects, and measures",
  description: "Sort each statement into a cause, an effect, or an Islamic measure to curb domestic violence.",
  generate(rng) {
    const hint = "Causes lead to domestic violence; effects are its consequences; measures are what Islam proposes to prevent or resolve it.";

    if (rng() < 0.4) {
      const pool = [
        ...CAUSES.map((s) => ({ ...s, category: "A cause" })),
        ...EFFECTS.map((s) => ({ ...s, category: "An effect" })),
        ...MEASURES.map((s) => ({ ...s, category: "An Islamic measure to curb it" })),
      ];
      const target = randChoice(rng, pool);
      const otherCategories = ["A cause", "An effect", "An Islamic measure to curb it"].filter((c) => c !== target.category);
      const choices = shuffle(rng, [target.category, ...otherCategories]);

      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, CAUSE_EFFECT_MC_PROMPTS(target.label)),
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "list",
        hint,
        explanation: target.reason,
      };
    }

    const causes = shuffle(rng, CAUSES).slice(0, 2);
    const effects = shuffle(rng, EFFECTS).slice(0, 2);
    const measures = shuffle(rng, MEASURES).slice(0, 2);
    const items = shuffle(rng, [
      ...causes.map((s) => ({ id: s.label, label: s.label, bucket: "causes", reason: s.reason })),
      ...effects.map((s) => ({ id: s.label, label: s.label, bucket: "effects", reason: s.reason })),
      ...measures.map((s) => ({ id: s.label, label: s.label, bucket: "measures", reason: s.reason })),
    ]);
    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: randChoice(rng, CATEGORIZE_PROMPTS),
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "causes", label: "A cause" },
        { id: "effects", label: "An effect" },
        { id: "measures", label: "An Islamic measure to curb it" },
      ],
      correctBucket,
      hint: "Causes lead to domestic violence; effects are its consequences; measures are what Islam proposes to prevent or resolve it.",
      explanation: items.map((item) => item.reason).join(" "),
    };
  },
};
